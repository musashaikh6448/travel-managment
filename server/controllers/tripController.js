const store = require('../data/store');

const pad = (num, size = 2) => String(num).padStart(size, '0');

const getAllTrips = (req, res) => {
  try {
    const { date, busId, routeId, status, search } = req.query;
    let trips = [...store.data.trips];

    if (date) {
      trips = trips.filter(t => t.tripDate === date);
    }
    if (busId && busId !== 'all') {
      trips = trips.filter(t => t.busId === busId);
    }
    if (routeId && routeId !== 'all') {
      trips = trips.filter(t => t.routeId === routeId);
    }
    if (status && status !== 'all') {
      trips = trips.filter(t => t.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      trips = trips.filter(t => 
        t.tripNumber.toLowerCase().includes(q) ||
        t.busNumber.toLowerCase().includes(q) ||
        t.routeName.toLowerCase().includes(q) ||
        t.from.toLowerCase().includes(q) ||
        t.to.toLowerCase().includes(q)
      );
    }

    // Compute independent, accurate metrics for every trip
    const enrichedTrips = trips.map(t => {
      const tripBookings = store.data.bookings.filter(b => b.tripId === t.id && b.status === 'Confirmed');
      const tripExpenses = store.data.expenses.filter(e => e.tripId === t.id);

      const revenue = tripBookings.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);
      const expenses = tripExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const bookedCount = t.bookedSeats?.length || tripBookings.length;
      const availableCount = Math.max(0, t.totalSeats - bookedCount);
      const occupancyRate = t.totalSeats > 0 ? Math.round((bookedCount / t.totalSeats) * 100) : 0;

      return {
        ...t,
        bookedSeatsCount: bookedCount,
        availableSeatsCount: availableCount,
        occupancyRate,
        revenue,
        expenses,
        profit: revenue - expenses
      };
    });

    // Sort by trip date descending then departure time
    enrichedTrips.sort((a, b) => {
      if (b.tripDate !== a.tripDate) return b.tripDate.localeCompare(a.tripDate);
      return (a.departureTime || '').localeCompare(b.departureTime || '');
    });

    return res.json({ success: true, count: enrichedTrips.length, trips: enrichedTrips });
  } catch (err) {
    console.error('Get Trips Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch trips.' });
  }
};

const getTripById = (req, res) => {
  try {
    const { id } = req.params;
    const trip = store.data.trips.find(t => t.id === id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    const tripBookings = store.data.bookings.filter(b => b.tripId === trip.id);
    const confirmedBookings = tripBookings.filter(b => b.status === 'Confirmed');
    const tripExpenses = store.data.expenses.filter(e => e.tripId === trip.id);

    const revenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);
    const expenses = tripExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Build visual seat map
    const seatMap = [];
    const blockedSeats = trip.blockedSeats || [];
    
    for (let s = 1; s <= trip.totalSeats; s++) {
      const seatNum = pad(s, 2);
      const booking = confirmedBookings.find(b => b.seatNumber === seatNum);
      const isBlocked = blockedSeats.includes(seatNum);

      let status = 'Available';
      let passenger = null;

      if (booking) {
        status = 'Booked';
        passenger = {
          name: booking.passengerName,
          mobile: booking.passengerMobile,
          gender: booking.passengerGender,
          age: booking.passengerAge,
          ticketNumber: booking.ticketNumber,
          bookingId: booking.id,
          workerName: booking.workerName
        };
      } else if (isBlocked) {
        status = 'Blocked';
      }

      seatMap.push({
        seatNumber: seatNum,
        seatIndex: s,
        status,
        deck: s <= (trip.totalSeats / 2) ? 'lower' : 'upper',
        passenger
      });
    }

    return res.json({
      success: true,
      trip: {
        ...trip,
        seatMap,
        stats: {
          totalSeats: trip.totalSeats,
          bookedSeats: confirmedBookings.length,
          availableSeats: Math.max(0, trip.totalSeats - confirmedBookings.length - blockedSeats.length),
          blockedSeats: blockedSeats.length,
          occupancyRate: trip.totalSeats > 0 ? Math.round((confirmedBookings.length / trip.totalSeats) * 100) : 0,
          revenue,
          expenses,
          profit: revenue - expenses
        },
        bookings: tripBookings,
        expenses: tripExpenses
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve trip details.' });
  }
};

const createTrip = (req, res) => {
  try {
    const {
      busId,
      routeId,
      tripDate,
      departureTime,
      arrivalTime,
      driverName,
      conductorName,
      totalSeats,
      ticketPrice,
      status
    } = req.body;

    if (!busId || !routeId || !tripDate) {
      return res.status(400).json({ success: false, message: 'Bus, Route, and Trip Date are required.' });
    }

    const bus = store.data.buses.find(b => b.id === busId);
    const route = store.data.routes.find(r => r.id === routeId);

    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found.' });
    if (!route) return res.status(404).json({ success: false, message: 'Route not found.' });

    // Check duplicate trip for same bus on same date/time
    const existing = store.data.trips.find(t => t.busId === busId && t.tripDate === tripDate && t.status !== 'Cancelled');
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Bus ${bus.busNumber} already has an active trip scheduled for ${tripDate} (${existing.tripNumber}).`
      });
    }

    const dateDigits = tripDate.replace(/-/g, '');
    const todaysTrips = store.data.trips.filter(t => t.tripDate === tripDate);
    const tripNumber = `TRIP-${dateDigits}-${pad(todaysTrips.length + 1, 2)}`;

    const newTrip = {
      id: `trip_${Date.now()}`,
      tripNumber,
      busId: bus.id,
      busNumber: bus.busNumber,
      busName: bus.busName,
      busType: bus.busType,
      routeId: route.id,
      routeName: route.routeName,
      from: route.from,
      to: route.to,
      tripDate,
      departureTime: departureTime || bus.departureTime,
      arrivalTime: arrivalTime || bus.arrivalTime,
      driverName: driverName || bus.driverName,
      driverMobile: bus.driverMobile,
      conductorName: conductorName || bus.conductorName,
      conductorMobile: bus.conductorMobile,
      totalSeats: totalSeats ? parseInt(totalSeats, 10) : bus.totalSeats,
      seatLayoutType: bus.seatLayoutType,
      ticketPrice: ticketPrice ? parseFloat(ticketPrice) : route.ticketPrice,
      bookedSeats: [],
      blockedSeats: [],
      status: status || 'Scheduled',
      createdAt: new Date().toISOString()
    };

    store.data.trips.push(newTrip);
    store.save();

    store.logAudit(req.user?.name || 'Admin', req.user?.role || 'admin', 'Created Trip', 'Trip', `Scheduled trip ${newTrip.tripNumber} (${newTrip.from} ➔ ${newTrip.to}) for ${tripDate}`, newTrip.id);
    store.addNotification('New Trip Scheduled', `Trip ${newTrip.tripNumber} scheduled for ${newTrip.tripDate} (${newTrip.routeName})`, 'trip', 'all');

    return res.status(201).json({ success: true, message: 'Trip created successfully.', trip: newTrip });
  } catch (err) {
    console.error('Create Trip Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create trip.' });
  }
};

const updateTrip = (req, res) => {
  try {
    const { id } = req.params;
    const index = store.data.trips.findIndex(t => t.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    const current = store.data.trips[index];
    const updated = {
      ...current,
      ...req.body,
      id: current.id,
      totalSeats: req.body.totalSeats ? parseInt(req.body.totalSeats, 10) : current.totalSeats,
      ticketPrice: req.body.ticketPrice ? parseFloat(req.body.ticketPrice) : current.ticketPrice
    };

    store.data.trips[index] = updated;
    store.save();

    store.logAudit(req.user?.name || 'Admin', req.user?.role || 'admin', 'Updated Trip', 'Trip', `Updated trip ${updated.tripNumber} status to ${updated.status}`, updated.id);

    return res.json({ success: true, message: 'Trip updated successfully.', trip: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update trip.' });
  }
};

const toggleBlockSeat = (req, res) => {
  try {
    const { id } = req.params;
    const { seatNumber, action } = req.body; // action: 'block' | 'unblock'

    const trip = store.data.trips.find(t => t.id === id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    if (!trip.blockedSeats) trip.blockedSeats = [];

    if (action === 'block') {
      if (trip.bookedSeats && trip.bookedSeats.includes(seatNumber)) {
        return res.status(400).json({ success: false, message: `Seat ${seatNumber} is currently booked and cannot be blocked.` });
      }
      if (!trip.blockedSeats.includes(seatNumber)) {
        trip.blockedSeats.push(seatNumber);
      }
    } else if (action === 'unblock') {
      trip.blockedSeats = trip.blockedSeats.filter(s => s !== seatNumber);
    }

    store.save();
    store.logAudit(req.user?.name || 'Admin', req.user?.role || 'admin', `${action === 'block' ? 'Blocked' : 'Unblocked'} Seat`, 'Seat', `${action === 'block' ? 'Blocked' : 'Unblocked'} seat ${seatNumber} on trip ${trip.tripNumber}`, trip.id);

    return res.json({
      success: true,
      message: `Seat ${seatNumber} ${action === 'block' ? 'blocked' : 'unblocked'} successfully.`,
      blockedSeats: trip.blockedSeats
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to toggle seat block status.' });
  }
};

module.exports = {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  toggleBlockSeat
};
