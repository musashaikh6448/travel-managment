const store = require('../data/store');

// Helper to filter dates
const getDatesForRange = (startDate, endDate, date) => {
  if (date) return [date];
  if (!startDate || !endDate) return ['2026-10-05'];
  
  const dates = [];
  let cur = new Date(startDate);
  const end = new Date(endDate);
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
};

// 1. Daily Report
const getDailyReport = (req, res) => {
  try {
    const { date = '2026-10-05' } = req.query;

    const trips = store.data.trips.filter(t => t.tripDate === date);
    const bookings = store.data.bookings.filter(b => b.journeyDate === date);
    const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');
    const cancelledBookings = bookings.filter(b => b.status === 'Cancelled');
    const expenses = store.data.expenses.filter(e => e.expenseDate === date);

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    const totalSeats = trips.reduce((sum, t) => sum + t.totalSeats, 0);
    const bookedSeats = trips.reduce((sum, t) => sum + (t.bookedSeats?.length || 0), 0);
    const availableSeats = Math.max(0, totalSeats - bookedSeats);

    // Worker sales on this date
    const workerSales = store.data.users
      .filter(u => u.role === 'worker')
      .map(w => {
        const wb = bookings.filter(b => b.bookedBy === w.id || b.workerName === w.name);
        const wc = wb.filter(b => b.status === 'Confirmed');
        const wcn = wb.filter(b => b.status === 'Cancelled');
        const rev = wc.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);
        return {
          workerName: w.name,
          employeeId: w.employeeId,
          tickets: wc.length,
          cancelled: wcn.length,
          revenue: rev
        };
      })
      .filter(w => w.tickets > 0 || w.cancelled > 0);

    // Bus performance on this date
    const busPerformance = store.data.buses.map(bus => {
      const bTrips = trips.filter(t => t.busId === bus.id);
      const bBookings = confirmedBookings.filter(b => b.busId === bus.id);
      const bExpenses = expenses.filter(e => e.busId === bus.id);

      const capacity = bTrips.reduce((sum, t) => sum + t.totalSeats, 0);
      const occupied = bTrips.reduce((sum, t) => sum + (t.bookedSeats?.length || 0), 0);
      const rev = bBookings.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);
      const exp = bExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      return {
        busNumber: bus.busNumber,
        busName: bus.busName,
        busType: bus.busType,
        tripsCount: bTrips.length,
        capacity,
        occupied,
        available: Math.max(0, capacity - occupied),
        occupancyRate: capacity > 0 ? Math.round((occupied / capacity) * 100) : 0,
        revenue: rev,
        expense: exp,
        profit: rev - exp
      };
    });

    // Payment collection
    const payments = { Cash: 0, UPI: 0, Card: 0, Online: 0 };
    confirmedBookings.forEach(b => {
      payments[b.paymentMethod] = (payments[b.paymentMethod] || 0) + (Number(b.finalAmount) || 0);
    });

    // Booking sources
    const sources = { Counter: 0, Worker: 0, Website: 0, Phone: 0, Agent: 0 };
    const sourceRevenue = { Counter: 0, Worker: 0, Website: 0, Phone: 0, Agent: 0 };
    confirmedBookings.forEach(b => {
      const s = b.bookingSource || 'Counter';
      sources[s] = (sources[s] || 0) + 1;
      sourceRevenue[s] = (sourceRevenue[s] || 0) + (Number(b.finalAmount) || 0);
    });

    return res.json({
      success: true,
      reportDate: date,
      summary: {
        totalTrips: trips.length,
        totalTickets: confirmedBookings.length,
        cancelledTickets: cancelledBookings.length,
        totalSeats,
        bookedSeats,
        availableSeats,
        occupancyRate: totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0,
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin: totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0
      },
      workerSales,
      busPerformance,
      paymentCollection: payments,
      bookingSources: Object.keys(sources).map(k => ({
        source: k,
        tickets: sources[k],
        revenue: sourceRevenue[k]
      })),
      tripsList: trips,
      expensesList: expenses
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate daily report.' });
  }
};

// 2. Bus Performance Report
const getBusReport = (req, res) => {
  try {
    const { startDate, endDate, date } = req.query;
    const targetDates = getDatesForRange(startDate, endDate, date);

    const busReports = store.data.buses.map(bus => {
      const trips = store.data.trips.filter(t => t.busId === bus.id && targetDates.includes(t.tripDate));
      const bookings = store.data.bookings.filter(b => b.busId === bus.id && targetDates.includes(b.journeyDate) && b.status === 'Confirmed');
      const expenses = store.data.expenses.filter(e => e.busId === bus.id && targetDates.includes(e.expenseDate));

      const totalSeats = trips.reduce((sum, t) => sum + t.totalSeats, 0);
      const bookedSeats = trips.reduce((sum, t) => sum + (t.bookedSeats?.length || 0), 0);
      const revenue = bookings.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);
      const expense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const profit = revenue - expense;
      const occupancy = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

      return {
        busId: bus.id,
        busNumber: bus.busNumber,
        busName: bus.busName,
        busType: bus.busType,
        totalTrips: trips.length,
        totalSeats,
        bookedSeats,
        availableSeats: Math.max(0, totalSeats - bookedSeats),
        totalTickets: bookings.length,
        occupancyRate: occupancy,
        totalRevenue: revenue,
        totalExpenses: expense,
        totalProfit: profit
      };
    });

    const totalRevenue = busReports.reduce((s, b) => s + b.totalRevenue, 0);
    const totalExpenses = busReports.reduce((s, b) => s + b.totalExpenses, 0);

    return res.json({
      success: true,
      summary: {
        totalBuses: busReports.length,
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses
      },
      buses: busReports
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate bus report.' });
  }
};

// 3. Worker Sales Report
const getWorkerReport = (req, res) => {
  try {
    const { startDate, endDate, date } = req.query;
    const targetDates = getDatesForRange(startDate, endDate, date);

    const workerReports = store.data.users
      .filter(u => u.role === 'worker')
      .map(worker => {
        const bookings = store.data.bookings.filter(b => 
          (b.bookedBy === worker.id || b.workerName === worker.name) &&
          targetDates.includes(b.journeyDate)
        );

        const confirmed = bookings.filter(b => b.status === 'Confirmed');
        const cancelled = bookings.filter(b => b.status === 'Cancelled');
        const revenue = confirmed.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);
        const cancelledAmount = cancelled.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);

        return {
          workerId: worker.id,
          workerName: worker.name,
          employeeId: worker.employeeId,
          totalTickets: confirmed.length,
          cancelledTickets: cancelled.length,
          revenue,
          cancelledAmount,
          netRevenue: revenue
        };
      })
      .sort((a, b) => b.netRevenue - a.netRevenue);

    const totalTickets = workerReports.reduce((s, w) => s + w.totalTickets, 0);
    const totalRevenue = workerReports.reduce((s, w) => s + w.netRevenue, 0);

    return res.json({
      success: true,
      summary: {
        totalWorkers: workerReports.length,
        totalTickets,
        totalRevenue
      },
      workers: workerReports
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate worker report.' });
  }
};

// 4. Profit / Loss Report
const getProfitLossReport = (req, res) => {
  try {
    const { startDate, endDate, date, busId, routeId } = req.query;
    const targetDates = getDatesForRange(startDate, endDate, date);

    let bookings = store.data.bookings.filter(b => targetDates.includes(b.journeyDate) && b.status === 'Confirmed');
    let expenses = store.data.expenses.filter(e => targetDates.includes(e.expenseDate));

    if (busId && busId !== 'all') {
      bookings = bookings.filter(b => b.busId === busId);
      expenses = expenses.filter(e => e.busId === busId);
    }
    if (routeId && routeId !== 'all') {
      bookings = bookings.filter(b => b.routeId === routeId);
    }

    const ticketRevenue = bookings.reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const netProfit = ticketRevenue - totalExpenses;

    // Expense breakdown by category
    const expenseBreakdown = {};
    expenses.forEach(e => {
      expenseBreakdown[e.category] = (expenseBreakdown[e.category] || 0) + (Number(e.amount) || 0);
    });

    // Date-wise breakdown
    const dailyBreakdown = targetDates.map(d => {
      const dayBookings = bookings.filter(b => b.journeyDate === d);
      const dayExpenses = expenses.filter(e => e.expenseDate === d);
      const dRev = dayBookings.reduce((s, b) => s + (Number(b.finalAmount) || 0), 0);
      const dExp = dayExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

      return {
        date: d,
        revenue: dRev,
        expense: dExp,
        profit: dRev - dExp,
        tickets: dayBookings.length
      };
    });

    return res.json({
      success: true,
      summary: {
        totalRevenue: ticketRevenue,
        totalExpenses,
        netProfit,
        profitStatus: netProfit >= 0 ? 'Profit' : 'Loss',
        profitMargin: ticketRevenue > 0 ? Math.round((netProfit / ticketRevenue) * 100) : 0,
        totalTickets: bookings.length
      },
      expenseCategories: Object.keys(expenseBreakdown).map(k => ({ category: k, amount: expenseBreakdown[k] })),
      dailyBreakdown
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate profit & loss report.' });
  }
};

// 5. Payment & Booking Source Report
const getPaymentReport = (req, res) => {
  try {
    const { startDate, endDate, date } = req.query;
    const targetDates = getDatesForRange(startDate, endDate, date);

    const bookings = store.data.bookings.filter(b => targetDates.includes(b.journeyDate) && b.status === 'Confirmed');

    const paymentMethods = { Cash: 0, UPI: 0, Card: 0, Online: 0 };
    const bookingSources = { Counter: 0, Worker: 0, Website: 0, Phone: 0, Agent: 0 };
    const sourceRevenues = { Counter: 0, Worker: 0, Website: 0, Phone: 0, Agent: 0 };

    bookings.forEach(b => {
      const pm = b.paymentMethod || 'Cash';
      const bs = b.bookingSource || 'Counter';
      const amt = Number(b.finalAmount) || 0;

      paymentMethods[pm] = (paymentMethods[pm] || 0) + amt;
      bookingSources[bs] = (bookingSources[bs] || 0) + 1;
      sourceRevenues[bs] = (sourceRevenues[bs] || 0) + amt;
    });

    const totalCollection = Object.values(paymentMethods).reduce((s, v) => s + v, 0);

    return res.json({
      success: true,
      totalCollection,
      paymentMethods: Object.keys(paymentMethods).map(k => ({
        method: k,
        amount: paymentMethods[k],
        percentage: totalCollection > 0 ? Math.round((paymentMethods[k] / totalCollection) * 100) : 0
      })),
      bookingSources: Object.keys(bookingSources).map(k => ({
        source: k,
        tickets: bookingSources[k],
        revenue: sourceRevenues[k],
        percentage: bookings.length > 0 ? Math.round((bookingSources[k] / bookings.length) * 100) : 0
      }))
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate payment report.' });
  }
};

module.exports = {
  getDailyReport,
  getBusReport,
  getWorkerReport,
  getProfitLossReport,
  getPaymentReport
};
