const store = require('../data/store');

// Helper to filter by date range
const getFilteredDates = (filter, customDate, startDate, endDate) => {
  const today = '2026-10-05';
  const yesterday = '2026-10-04';

  if (filter === 'today') return [today];
  if (filter === 'yesterday') return [yesterday];
  if (filter === 'week') {
    return ['2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'];
  }
  if (filter === 'month') {
    // Current October 2026 dates
    return ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'];
  }
  if (filter === 'custom') {
    if (customDate) return [customDate];
    if (startDate && endDate) {
      // Return dates between startDate and endDate
      const dates = [];
      let cur = new Date(startDate);
      const end = new Date(endDate);
      while (cur <= end) {
        dates.push(cur.toISOString().split('T')[0]);
        cur.setDate(cur.getDate() + 1);
      }
      return dates;
    }
  }
  return [today];
};

const getAdminDashboard = (req, res) => {
  try {
    const { filter = 'today', customDate, startDate, endDate } = req.query;
    const targetDates = getFilteredDates(filter, customDate, startDate, endDate);

    // Bookings for filtered dates
    const filteredBookings = store.data.bookings.filter(b => targetDates.includes(b.journeyDate));
    const confirmedBookings = filteredBookings.filter(b => b.status === 'Confirmed');
    const cancelledBookings = filteredBookings.filter(b => b.status === 'Cancelled');

    // Revenue calculation
    const totalTicketRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);
    const cancellationChargesCollected = cancelledBookings.reduce((sum, b) => {
      return sum + (b.cancellationDetails?.cancellationCharge || 0);
    }, 0);
    const netRevenue = totalTicketRevenue + cancellationChargesCollected;

    // Expenses for filtered dates
    const filteredExpenses = store.data.expenses.filter(e => targetDates.includes(e.expenseDate));
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Net Profit
    const netProfit = netRevenue - totalExpenses;

    // Trips for filtered dates
    const filteredTrips = store.data.trips.filter(t => targetDates.includes(t.tripDate));
    const totalCapacity = filteredTrips.reduce((sum, t) => sum + (Number(t.totalSeats) || 0), 0);
    const occupiedSeats = filteredTrips.reduce((sum, t) => sum + (t.bookedSeats?.length || 0), 0);
    const availableSeats = Math.max(0, totalCapacity - occupiedSeats);
    const occupancyPercentage = totalCapacity > 0 ? Math.round((occupiedSeats / totalCapacity) * 100) : 0;

    // Bus-wise performance
    const busPerformance = store.data.buses.map(bus => {
      const busTrips = filteredTrips.filter(t => t.busId === bus.id);
      const busBookings = confirmedBookings.filter(b => b.busId === bus.id);
      const busExpenses = filteredExpenses.filter(e => e.busId === bus.id);

      const busCapacity = busTrips.reduce((sum, t) => sum + t.totalSeats, 0);
      const busOccupied = busTrips.reduce((sum, t) => sum + (t.bookedSeats?.length || 0), 0);
      const revenue = busBookings.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);
      const expense = busExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const profit = revenue - expense;
      const occRate = busCapacity > 0 ? Math.round((busOccupied / busCapacity) * 100) : 0;

      return {
        busId: bus.id,
        busNumber: bus.busNumber,
        busName: bus.busName,
        busType: bus.busType,
        totalTrips: busTrips.length,
        totalSeats: busCapacity,
        occupiedSeats: busOccupied,
        availableSeats: Math.max(0, busCapacity - busOccupied),
        occupancyRate: occRate,
        revenue,
        expense,
        profit
      };
    });

    // Worker-wise performance
    const workerPerformance = store.data.users
      .filter(u => u.role === 'worker')
      .map(worker => {
        const workerBookings = filteredBookings.filter(b => b.bookedBy === worker.id || b.workerName === worker.name);
        const confirmed = workerBookings.filter(b => b.status === 'Confirmed');
        const cancelled = workerBookings.filter(b => b.status === 'Cancelled');
        const revenue = confirmed.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);

        return {
          workerId: worker.id,
          workerName: worker.name,
          employeeId: worker.employeeId,
          totalBookings: workerBookings.length,
          confirmedTickets: confirmed.length,
          cancelledTickets: cancelled.length,
          revenue,
          status: worker.status
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    // Booking Sources breakdown
    const sourceMap = { Counter: 0, Worker: 0, Website: 0, Phone: 0, Agent: 0 };
    const sourceRevenueMap = { Counter: 0, Worker: 0, Website: 0, Phone: 0, Agent: 0 };
    confirmedBookings.forEach(b => {
      const src = b.bookingSource || 'Counter';
      sourceMap[src] = (sourceMap[src] || 0) + 1;
      sourceRevenueMap[src] = (sourceRevenueMap[src] || 0) + (Number(b.finalAmount) || 0);
    });

    const bookingSources = Object.keys(sourceMap).map(src => ({
      source: src,
      count: sourceMap[src],
      revenue: sourceRevenueMap[src],
      percentage: confirmedBookings.length > 0 ? Math.round((sourceMap[src] / confirmedBookings.length) * 100) : 0
    }));

    // Payment Methods breakdown
    const payMap = { Cash: 0, UPI: 0, Card: 0, Online: 0 };
    confirmedBookings.forEach(b => {
      const pm = b.paymentMethod || 'Cash';
      payMap[pm] = (payMap[pm] || 0) + (Number(b.finalAmount) || 0);
    });

    const paymentCollection = Object.keys(payMap).map(method => ({
      method,
      amount: payMap[method],
      percentage: netRevenue > 0 ? Math.round((payMap[method] / netRevenue) * 100) : 0
    }));

    // Daily Trend Chart data (e.g. for the past 5-7 days)
    const trendDates = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'];
    const trendData = trendDates.map(dateStr => {
      const dayBookings = store.data.bookings.filter(b => b.journeyDate === dateStr && b.status === 'Confirmed');
      const dayExpenses = store.data.expenses.filter(e => e.expenseDate === dateStr);
      const rev = dayBookings.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);
      const exp = dayExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      return {
        date: dateStr,
        displayDate: dateStr.split('-').slice(1).join('/'),
        tickets: dayBookings.length,
        revenue: rev,
        expenses: exp,
        profit: rev - exp
      };
    });

    // Recent 10 live bookings
    const recentBookings = [...store.data.bookings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    return res.json({
      success: true,
      data: {
        filter,
        targetDates,
        summary: {
          ticketsSold: confirmedBookings.length,
          totalBookings: filteredBookings.length,
          cancelledBookings: cancelledBookings.length,
          totalRevenue: netRevenue,
          grossTicketRevenue: totalTicketRevenue,
          totalExpenses,
          netProfit,
          profitMargin: netRevenue > 0 ? Math.round((netProfit / netRevenue) * 100) : 0,
          totalCapacity,
          occupiedSeats,
          availableSeats,
          occupancyPercentage,
          totalBuses: store.data.buses.length,
          activeBuses: store.data.buses.filter(b => b.status === 'Active').length,
          totalTrips: filteredTrips.length,
          totalWorkers: store.data.users.filter(u => u.role === 'worker').length
        },
        busPerformance,
        workerPerformance,
        bookingSources,
        paymentCollection,
        trendData,
        recentBookings
      }
    });
  } catch (err) {
    console.error('Dashboard Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard metrics.' });
  }
};

const getWorkerDashboard = (req, res) => {
  try {
    const workerId = req.user.id;
    const worker = store.data.users.find(u => u.id === workerId);
    const today = '2026-10-05';

    // Worker's today's bookings
    const allWorkerBookings = store.data.bookings.filter(b => b.bookedBy === workerId || b.workerName === worker.name);
    const todayBookings = allWorkerBookings.filter(b => b.journeyDate === today);
    const todayConfirmed = todayBookings.filter(b => b.status === 'Confirmed');
    const todayCancelled = todayBookings.filter(b => b.status === 'Cancelled');

    const todayRevenue = todayConfirmed.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);
    const totalLifetimeRevenue = allWorkerBookings
      .filter(b => b.status === 'Confirmed')
      .reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);

    // Worker's assigned or today's active trips
    let todayTrips = store.data.trips.filter(t => t.tripDate === today);
    if (worker.assignedBus) {
      const assigned = todayTrips.filter(t => t.busId === worker.assignedBus);
      if (assigned.length > 0) todayTrips = assigned;
    }

    // Cash collected vs online collected by worker today
    const cashCollected = todayConfirmed
      .filter(b => b.paymentMethod === 'Cash')
      .reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);

    const digitalCollected = todayConfirmed
      .filter(b => b.paymentMethod !== 'Cash')
      .reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);

    // Recent 10 bookings by this worker
    const myRecentBookings = [...allWorkerBookings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    return res.json({
      success: true,
      data: {
        worker: {
          id: worker.id,
          name: worker.name,
          employeeId: worker.employeeId,
          assignedBus: worker.assignedBus,
          assignedRoute: worker.assignedRoute
        },
        summary: {
          todayTickets: todayConfirmed.length,
          todayCancelled: todayCancelled.length,
          todayRevenue,
          cashCollected,
          digitalCollected,
          lifetimeTickets: allWorkerBookings.filter(b => b.status === 'Confirmed').length,
          lifetimeRevenue: totalLifetimeRevenue,
          availableTripsCount: todayTrips.length
        },
        todayTrips,
        myRecentBookings
      }
    });
  } catch (err) {
    console.error('Worker Dashboard Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load worker dashboard.' });
  }
};

module.exports = {
  getAdminDashboard,
  getWorkerDashboard
};
