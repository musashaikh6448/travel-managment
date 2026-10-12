const store = require('../data/store');

const getAllPassengers = (req, res) => {
  try {
    const { search } = req.query;
    let passengers = [...store.data.passengers];

    if (search) {
      const q = search.toLowerCase();
      passengers = passengers.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.mobile.includes(q) ||
        (p.email && p.email.toLowerCase().includes(q))
      );
    }

    passengers.sort((a, b) => (b.totalTrips || 0) - (a.totalTrips || 0));

    return res.json({ success: true, count: passengers.length, passengers });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch passengers.' });
  }
};

const getPassengerById = (req, res) => {
  try {
    const { id } = req.params;
    const passenger = store.data.passengers.find(p => p.id === id || p.mobile === id);
    if (!passenger) {
      return res.status(404).json({ success: false, message: 'Passenger not found.' });
    }

    const bookings = store.data.bookings.filter(b => b.passengerId === passenger.id || b.passengerMobile === passenger.mobile);

    return res.json({
      success: true,
      passenger: {
        ...passenger,
        bookingHistory: bookings
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve passenger.' });
  }
};

const updatePassenger = (req, res) => {
  try {
    const { id } = req.params;
    const index = store.data.passengers.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Passenger not found.' });
    }

    const current = store.data.passengers[index];
    const updated = {
      ...current,
      ...req.body,
      id: current.id,
      age: req.body.age ? parseInt(req.body.age, 10) : current.age
    };

    store.data.passengers[index] = updated;
    store.save();

    return res.json({ success: true, message: 'Passenger details updated successfully.', passenger: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update passenger.' });
  }
};

module.exports = {
  getAllPassengers,
  getPassengerById,
  updatePassenger
};
