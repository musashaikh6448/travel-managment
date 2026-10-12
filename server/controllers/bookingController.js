const store = require('../data/store');

const pad = (num, size = 4) => String(num).padStart(size, '0');

const getAllBookings = (req, res) => {
  try {
    const {
      search,
      status,
      date,
      tripId,
      busId,
      workerId,
      source,
      paymentMethod,
      page = 1,
      limit = 20
    } = req.query;

    let bookings = [...store.data.bookings];

    // Filter by date
    if (date) {
      bookings = bookings.filter(b => b.journeyDate === date);
    }
    // Filter by status
    if (status && status !== 'all') {
      bookings = bookings.filter(b => b.status.toLowerCase() === status.toLowerCase());
    }
    // Filter by trip
    if (tripId && tripId !== 'all') {
      bookings = bookings.filter(b => b.tripId === tripId);
    }
    // Filter by bus
    if (busId && busId !== 'all') {
      bookings = bookings.filter(b => b.busId === busId);
    }
    // Filter by worker
    if (workerId && workerId !== 'all') {
      bookings = bookings.filter(b => b.bookedBy === workerId || b.workerName === workerId);
    }
    // Filter by booking source
    if (source && source !== 'all') {
      bookings = bookings.filter(b => b.bookingSource?.toLowerCase() === source.toLowerCase());
    }
    // Filter by payment method
    if (paymentMethod && paymentMethod !== 'all') {
      bookings = bookings.filter(b => b.paymentMethod?.toLowerCase() === paymentMethod.toLowerCase());
    }
    // Search query
    if (search) {
      const q = search.toLowerCase();
      bookings = bookings.filter(b => 
        b.ticketNumber.toLowerCase().includes(q) ||
        b.bookingNumber?.toLowerCase().includes(q) ||
        b.passengerName.toLowerCase().includes(q) ||
        b.passengerMobile.includes(q) ||
        b.seatNumber.toLowerCase().includes(q) ||
        b.busNumber.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = bookings.length;
    const p = parseInt(page, 10) || 1;
    const lim = parseInt(limit, 10) || 20;
    const paginatedBookings = bookings.slice((p - 1) * lim, p * lim);

    return res.json({
      success: true,
      total,
      page: p,
      totalPages: Math.ceil(total / lim),
      bookings: paginatedBookings
    });
  } catch (err) {
    console.error('Get Bookings Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
};

const getBookingById = (req, res) => {
  try {
    const { id } = req.params;
    const booking = store.data.bookings.find(b => b.id === id || b.ticketNumber === id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking / Ticket not found.' });
    }

    const trip = store.data.trips.find(t => t.id === booking.tripId);
    const payments = store.data.payments.filter(p => p.bookingId === booking.id);

    return res.json({
      success: true,
      booking: {
        ...booking,
        tripDetails: trip || null,
        payments,
        companyInfo: store.data.settings
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve booking details.' });
  }
};

const createBooking = (req, res) => {
  try {
    const {
      tripId,
      passengerName,
      passengerMobile,
      passengerAge,
      passengerGender,
      passengerEmail,
      seatNumber,
      discount = 0,
      paymentMethod = 'Cash',
      bookingSource = 'Counter',
      workerId
    } = req.body;

    if (!tripId || !passengerName || !passengerMobile || !seatNumber) {
      return res.status(400).json({
        success: false,
        message: 'Trip ID, Passenger Name, Mobile, and Seat Number are required.'
      });
    }

    const trip = store.data.trips.find(t => t.id === tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    if (trip.status === 'Cancelled' || trip.status === 'Completed') {
      return res.status(400).json({ success: false, message: `Cannot book seats on a ${trip.status.toLowerCase()} trip.` });
    }

    const cleanSeat = String(seatNumber).trim().padStart(2, '0');

    // 1. Verify Seat Availability (Prevent duplicate booking)
    if (!trip.bookedSeats) trip.bookedSeats = [];
    if (trip.bookedSeats.includes(cleanSeat)) {
      return res.status(400).json({
        success: false,
        message: `Seat ${cleanSeat} is already booked for this trip! Please choose another seat.`
      });
    }

    if (trip.blockedSeats && trip.blockedSeats.includes(cleanSeat)) {
      return res.status(400).json({
        success: false,
        message: `Seat ${cleanSeat} is currently blocked by administration.`
      });
    }

    // 2. Identify booking worker
    let assignedWorkerId = workerId || req.user?.id;
    let assignedWorkerName = req.user?.name || 'Counter Staff';

    if (workerId) {
      const w = store.data.users.find(u => u.id === workerId);
      if (w) {
        assignedWorkerId = w.id;
        assignedWorkerName = w.name;
      }
    }

    // 3. Upsert Passenger Profile
    let passenger = store.data.passengers.find(p => p.mobile === passengerMobile.trim());
    const ticketPrice = trip.ticketPrice;
    const finalAmount = Math.max(0, ticketPrice - (parseFloat(discount) || 0));

    if (!passenger) {
      passenger = {
        id: `pax_${Date.now()}`,
        name: passengerName.trim(),
        mobile: passengerMobile.trim(),
        email: passengerEmail ? passengerEmail.trim() : '',
        age: parseInt(passengerAge, 10) || 30,
        gender: passengerGender || 'Male',
        totalTrips: 1,
        totalAmountSpent: finalAmount,
        lastJourneyDate: trip.tripDate,
        createdAt: new Date().toISOString()
      };
      store.data.passengers.push(passenger);
    } else {
      passenger.totalTrips = (passenger.totalTrips || 0) + 1;
      passenger.totalAmountSpent = (passenger.totalAmountSpent || 0) + finalAmount;
      passenger.lastJourneyDate = trip.tripDate;
      if (passengerName) passenger.name = passengerName.trim();
      if (passengerAge) passenger.age = parseInt(passengerAge, 10);
      if (passengerGender) passenger.gender = passengerGender;
    }

    // 4. Generate Ticket & Booking IDs
    const dateDigits = trip.tripDate.replace(/-/g, '');
    const bookingSeq = store.data.bookings.length + 1;
    const ticketNumber = `TKT-${dateDigits}-${pad(bookingSeq, 4)}`;
    const bookingNumber = `BKG-${dateDigits}-${pad(bookingSeq, 4)}`;

    const newBooking = {
      id: `bkg_${Date.now()}`,
      bookingNumber,
      ticketNumber,
      tripId: trip.id,
      tripNumber: trip.tripNumber,
      busId: trip.busId,
      busNumber: trip.busNumber,
      busName: trip.busName,
      routeId: trip.routeId,
      routeName: trip.routeName,
      fromCity: trip.from,
      toCity: trip.to,
      journeyDate: trip.tripDate,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      passengerId: passenger.id,
      passengerName: passenger.name,
      passengerMobile: passenger.mobile,
      passengerAge: passenger.age,
      passengerGender: passenger.gender,
      seatNumber: cleanSeat,
      ticketPrice,
      discount: parseFloat(discount) || 0,
      finalAmount,
      paymentMethod,
      paymentStatus: 'Paid',
      bookingSource,
      bookedBy: assignedWorkerId,
      workerName: assignedWorkerName,
      status: 'Confirmed',
      cancellationDetails: null,
      createdAt: new Date().toISOString()
    };

    // 5. Update Trip Booked Seats
    trip.bookedSeats.push(cleanSeat);

    // 6. Record Payment
    const payment = {
      id: `pay_${Date.now()}`,
      paymentId: `PAY-${dateDigits}-${pad(store.data.payments.length + 1, 4)}`,
      bookingId: newBooking.id,
      ticketNumber: newBooking.ticketNumber,
      amount: finalAmount,
      paymentMethod,
      status: 'Success',
      collectedBy: assignedWorkerName,
      date: trip.tripDate,
      createdAt: new Date().toISOString()
    };

    store.data.bookings.push(newBooking);
    store.data.payments.push(payment);
    store.save();

    // 7. Audit Log and Notifications
    store.logAudit(
      assignedWorkerName,
      req.user?.role || 'worker',
      'Booked Ticket',
      'Booking',
      `Booked ticket ${newBooking.ticketNumber} for ${passenger.name} (${cleanSeat} on ${trip.busNumber}) - ₹${finalAmount}`,
      newBooking.id
    );

    store.addNotification(
      'New Ticket Booked',
      `${assignedWorkerName} booked ticket ${newBooking.ticketNumber} (${trip.from} ➔ ${trip.to}, Seat ${cleanSeat})`,
      'booking',
      'all'
    );

    return res.status(201).json({
      success: true,
      message: 'Ticket booked successfully!',
      booking: newBooking,
      ticketNumber: newBooking.ticketNumber
    });
  } catch (err) {
    console.error('Create Booking Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to complete ticket booking.' });
  }
};

const cancelBooking = (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;

    const booking = store.data.bookings.find(b => b.id === id || b.ticketNumber === id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'This ticket has already been cancelled.' });
    }

    const trip = store.data.trips.find(t => t.id === booking.tripId);
    
    // 1. Free seat from trip
    if (trip && trip.bookedSeats) {
      trip.bookedSeats = trip.bookedSeats.filter(s => s !== booking.seatNumber);
    }

    // 2. Compute refund according to cancellation rule
    const cancelChargePct = store.data.settings?.cancellationChargePercentage || 15;
    const cancellationCharge = Math.round((booking.finalAmount * cancelChargePct) / 100);
    const refundAmount = booking.finalAmount - cancellationCharge;

    booking.status = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    booking.cancellationDetails = {
      cancelledAt: new Date().toISOString(),
      reason,
      cancelledBy: req.user?.name || 'Administrator',
      cancellationCharge,
      refundAmount
    };

    // Record refund payment entry
    store.data.payments.push({
      id: `pay_ref_${Date.now()}`,
      paymentId: `REF-${Date.now().toString().slice(-6)}`,
      bookingId: booking.id,
      ticketNumber: booking.ticketNumber,
      amount: -refundAmount,
      paymentMethod: booking.paymentMethod,
      status: 'Refunded',
      collectedBy: req.user?.name || 'Admin',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    });

    store.save();

    // 3. Audit log & notification
    store.logAudit(
      req.user?.name || 'Admin',
      req.user?.role || 'admin',
      'Cancelled Ticket',
      'Booking',
      `Cancelled ticket ${booking.ticketNumber} for ${booking.passengerName}. Seat ${booking.seatNumber} released. Refund: ₹${refundAmount}`,
      booking.id
    );

    store.addNotification(
      'Ticket Cancelled',
      `Ticket ${booking.ticketNumber} cancelled. Seat ${booking.seatNumber} on ${booking.busNumber} is now available.`,
      'cancellation',
      'all'
    );

    return res.json({
      success: true,
      message: `Ticket ${booking.ticketNumber} cancelled successfully. Seat ${booking.seatNumber} is now Available.`,
      cancellationDetails: booking.cancellationDetails,
      booking
    });
  } catch (err) {
    console.error('Cancel Booking Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel booking.' });
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  cancelBooking
};
