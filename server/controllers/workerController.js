const bcrypt = require('bcryptjs');
const store = require('../data/store');

const getAllWorkers = (req, res) => {
  try {
    const { search, status, timeframe = 'all' } = req.query;
    let workers = store.data.users.filter(u => u.role === 'worker');

    if (status && status !== 'all') {
      workers = workers.filter(w => w.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      workers = workers.filter(w => 
        w.name.toLowerCase().includes(q) ||
        w.mobile.includes(q) ||
        w.email.toLowerCase().includes(q) ||
        (w.employeeId && w.employeeId.toLowerCase().includes(q))
      );
    }

    // Enrich worker performance
    const enrichedWorkers = workers.map(w => {
      const allWorkerBookings = store.data.bookings.filter(b => b.bookedBy === w.id || b.workerName === w.name);
      
      const today = '2026-10-05';
      const todayBookings = allWorkerBookings.filter(b => b.journeyDate === today && b.status === 'Confirmed');
      const todayRevenue = todayBookings.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);

      const confirmed = allWorkerBookings.filter(b => b.status === 'Confirmed');
      const cancelled = allWorkerBookings.filter(b => b.status === 'Cancelled');
      const grossRevenue = confirmed.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);
      const refundDeductions = cancelled.reduce((sum, b) => sum + (b.cancellationDetails?.refundAmount || 0), 0);
      const netRevenue = grossRevenue;

      const bus = store.data.buses.find(b => b.id === w.assignedBus);
      const route = store.data.routes.find(r => r.id === w.assignedRoute);

      const { passwordHash, ...safeWorker } = w;

      return {
        ...safeWorker,
        assignedBusDetails: bus || null,
        assignedRouteDetails: route || null,
        stats: {
          todayTickets: todayBookings.length,
          todayRevenue,
          totalTickets: confirmed.length,
          totalCancelled: cancelled.length,
          grossRevenue,
          netRevenue
        }
      };
    });

    return res.json({ success: true, count: enrichedWorkers.length, workers: enrichedWorkers });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve workers list.' });
  }
};

const getWorkerById = (req, res) => {
  try {
    const { id } = req.params;
    const worker = store.data.users.find(u => u.id === id && u.role === 'worker');
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found.' });
    }

    const bookings = store.data.bookings.filter(b => b.bookedBy === worker.id || b.workerName === worker.name);
    const bus = store.data.buses.find(b => b.id === worker.assignedBus);
    const route = store.data.routes.find(r => r.id === worker.assignedRoute);

    const { passwordHash, ...safeWorker } = worker;

    return res.json({
      success: true,
      worker: {
        ...safeWorker,
        assignedBusDetails: bus || null,
        assignedRouteDetails: route || null,
        bookings: bookings.slice(-20)
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve worker.' });
  }
};

const createWorker = async (req, res) => {
  try {
    const { name, mobile, email, password, address, employeeId, assignedBus, assignedRoute, status, joiningDate } = req.body;
    if (!name || !mobile) {
      return res.status(400).json({ success: false, message: 'Worker Name and Mobile Number are required.' });
    }

    const cleanMobile = mobile.trim();
    const existing = store.data.users.find(u => u.mobile === cleanMobile || (email && u.email.toLowerCase() === email.trim().toLowerCase()));
    if (existing) {
      return res.status(400).json({ success: false, message: 'A staff member with this mobile or email already exists.' });
    }

    const rawPassword = password || 'admin123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    const newWorker = {
      id: `usr_w_${Date.now()}`,
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : `worker_${Date.now().toString().slice(-4)}@travelmgmt.com`,
      mobile: cleanMobile,
      passwordHash,
      role: 'worker',
      employeeId: employeeId || `EMP-W${store.data.users.filter(u => u.role === 'worker').length + 1}`,
      address: address || '',
      assignedBus: assignedBus || '',
      assignedRoute: assignedRoute || '',
      status: status || 'Active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    store.data.users.push(newWorker);
    store.save();

    store.logAudit(req.user?.name || 'Admin', req.user?.role || 'admin', 'Created Worker', 'Worker', `Added staff member ${newWorker.name} (${newWorker.employeeId})`, newWorker.id);

    const { passwordHash: _, ...safeWorker } = newWorker;
    return res.status(201).json({ success: true, message: 'Worker created successfully.', worker: safeWorker });
  } catch (err) {
    console.error('Create Worker Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create worker.' });
  }
};

const updateWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const index = store.data.users.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Worker not found.' });
    }

    const current = store.data.users[index];
    let passwordHash = current.passwordHash;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(req.body.password, salt);
    }

    const updated = {
      ...current,
      ...req.body,
      id: current.id,
      role: current.role, // prevent privilege escalation
      passwordHash
    };

    store.data.users[index] = updated;
    store.save();

    store.logAudit(req.user?.name || 'Admin', req.user?.role || 'admin', 'Updated Worker', 'Worker', `Updated details for ${updated.name}`, updated.id);

    const { passwordHash: _, ...safeWorker } = updated;
    return res.json({ success: true, message: 'Worker updated successfully.', worker: safeWorker });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update worker.' });
  }
};

const deleteWorker = (req, res) => {
  try {
    const { id } = req.params;
    const worker = store.data.users.find(u => u.id === id && u.role === 'worker');
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found.' });
    }

    store.data.users = store.data.users.filter(u => u.id !== id);
    store.save();

    store.logAudit(req.user?.name || 'Admin', req.user?.role || 'admin', 'Deleted Worker', 'Worker', `Removed staff member ${worker.name}`, id);

    return res.json({ success: true, message: `Worker ${worker.name} removed successfully.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete worker.' });
  }
};

module.exports = {
  getAllWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker
};
