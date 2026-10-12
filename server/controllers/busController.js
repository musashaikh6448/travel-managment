const store = require('../data/store');

const getAllBuses = (req, res) => {
  try {
    const { status, search } = req.query;
    let buses = [...store.data.buses];

    if (status && status !== 'all') {
      buses = buses.filter(b => b.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      buses = buses.filter(b => 
        b.busNumber.toLowerCase().includes(q) ||
        b.busName.toLowerCase().includes(q) ||
        b.busType.toLowerCase().includes(q) ||
        (b.driverName && b.driverName.toLowerCase().includes(q))
      );
    }

    // Enrich with route details and aggregated revenue/expense metrics
    const enrichedBuses = buses.map(bus => {
      const route = store.data.routes.find(r => r.id === bus.routeId);
      const busTrips = store.data.trips.filter(t => t.busId === bus.id);
      const busBookings = store.data.bookings.filter(b => b.busId === bus.id && b.status === 'Confirmed');
      const busExpenses = store.data.expenses.filter(e => e.busId === bus.id);

      const totalRevenue = busBookings.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);
      const totalExpenses = busExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const profit = totalRevenue - totalExpenses;

      return {
        ...bus,
        routeDetails: route || null,
        totalTripsCount: busTrips.length,
        totalBookingsCount: busBookings.length,
        totalRevenue,
        totalExpenses,
        profit
      };
    });

    return res.json({ success: true, count: enrichedBuses.length, buses: enrichedBuses });
  } catch (err) {
    console.error('Get Buses Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch buses.' });
  }
};

const getBusById = (req, res) => {
  try {
    const { id } = req.params;
    const bus = store.data.buses.find(b => b.id === id);
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found.' });
    }

    const route = store.data.routes.find(r => r.id === bus.routeId);
    const trips = store.data.trips.filter(t => t.busId === bus.id);
    const bookings = store.data.bookings.filter(b => b.busId === bus.id);
    const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');
    const expenses = store.data.expenses.filter(e => e.busId === bus.id);

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalSeatsAllTrips = trips.reduce((sum, t) => sum + t.totalSeats, 0);
    const totalBookedSeats = trips.reduce((sum, t) => sum + (t.bookedSeats?.length || 0), 0);
    const occupancyRate = totalSeatsAllTrips > 0 ? Math.round((totalBookedSeats / totalSeatsAllTrips) * 100) : 0;

    return res.json({
      success: true,
      bus: {
        ...bus,
        routeDetails: route || null,
        stats: {
          totalTrips: trips.length,
          totalTicketsSold: confirmedBookings.length,
          occupancyRate,
          totalRevenue,
          totalExpenses,
          profit: totalRevenue - totalExpenses
        },
        trips,
        recentBookings: bookings.slice(-10),
        expenses: expenses.slice(-10)
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve bus details.' });
  }
};

const createBus = (req, res) => {
  try {
    const {
      busNumber,
      busName,
      busType,
      registrationNumber,
      totalSeats,
      seatLayoutType,
      driverName,
      driverMobile,
      conductorName,
      conductorMobile,
      routeId,
      departureTime,
      arrivalTime,
      boardingPoint,
      droppingPoint,
      amenities,
      status
    } = req.body;

    if (!busNumber || !busName || !totalSeats) {
      return res.status(400).json({ success: false, message: 'Bus Number, Bus Name, and Total Seats are required.' });
    }

    const cleanNumber = busNumber.trim().toUpperCase();
    const existing = store.data.buses.find(b => b.busNumber.toUpperCase() === cleanNumber);
    if (existing) {
      return res.status(400).json({ success: false, message: `Bus with number ${cleanNumber} already exists.` });
    }

    const newBus = {
      id: `bus_${Date.now()}`,
      busNumber: cleanNumber,
      busName: busName.trim(),
      busType: busType || 'AC Sleeper',
      registrationNumber: registrationNumber || `${cleanNumber}/2026`,
      totalSeats: parseInt(totalSeats, 10),
      seatLayoutType: seatLayoutType || '2x2',
      driverName: driverName || '',
      driverMobile: driverMobile || '',
      conductorName: conductorName || '',
      conductorMobile: conductorMobile || '',
      routeId: routeId || '',
      departureTime: departureTime || '20:00',
      arrivalTime: arrivalTime || '06:00',
      boardingPoint: boardingPoint || 'Main Central Stand',
      droppingPoint: droppingPoint || 'City Terminal',
      amenities: Array.isArray(amenities) ? amenities : ['AC', 'Reading Light', 'Charging Point'],
      status: status || 'Active',
      createdAt: new Date().toISOString()
    };

    store.data.buses.push(newBus);
    store.save();

    store.logAudit(req.user?.name || 'Admin', req.user?.role || 'admin', 'Created Bus', 'Bus', `Added new bus ${newBus.busNumber} (${newBus.busName})`, newBus.id);
    store.addNotification('New Bus Added', `Bus ${newBus.busNumber} (${newBus.busName}) added to fleet.`, 'system', 'admin');

    return res.status(201).json({ success: true, message: 'Bus created successfully.', bus: newBus });
  } catch (err) {
    console.error('Create Bus Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create bus.' });
  }
};

const updateBus = (req, res) => {
  try {
    const { id } = req.params;
    const busIndex = store.data.buses.findIndex(b => b.id === id);
    if (busIndex === -1) {
      return res.status(404).json({ success: false, message: 'Bus not found.' });
    }

    const currentBus = store.data.buses[busIndex];
    const updatedBus = {
      ...currentBus,
      ...req.body,
      id: currentBus.id, // Prevent ID override
      totalSeats: req.body.totalSeats ? parseInt(req.body.totalSeats, 10) : currentBus.totalSeats,
      busNumber: req.body.busNumber ? req.body.busNumber.trim().toUpperCase() : currentBus.busNumber
    };

    store.data.buses[busIndex] = updatedBus;
    store.save();

    store.logAudit(req.user?.name || 'Admin', req.user?.role || 'admin', 'Updated Bus', 'Bus', `Updated details for bus ${updatedBus.busNumber}`, updatedBus.id);

    return res.json({ success: true, message: 'Bus updated successfully.', bus: updatedBus });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update bus.' });
  }
};

const deleteBus = (req, res) => {
  try {
    const { id } = req.params;
    const bus = store.data.buses.find(b => b.id === id);
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found.' });
    }

    // Safety check: active scheduled trips
    const activeTrips = store.data.trips.filter(t => t.busId === id && (t.status === 'Scheduled' || t.status === 'Running'));
    if (activeTrips.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete bus with ${activeTrips.length} active or scheduled trip(s). Cancel or complete trips first.`
      });
    }

    store.data.buses = store.data.buses.filter(b => b.id !== id);
    store.save();

    store.logAudit(req.user?.name || 'Admin', req.user?.role || 'admin', 'Deleted Bus', 'Bus', `Removed bus ${bus.busNumber}`, id);

    return res.json({ success: true, message: `Bus ${bus.busNumber} deleted successfully.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete bus.' });
  }
};

module.exports = {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus
};
