const store = require('../data/store');

const getAllExpenses = (req, res) => {
  try {
    const { date, busId, tripId, category, paymentMethod, search } = req.query;
    let expenses = [...store.data.expenses];

    if (date) {
      expenses = expenses.filter(e => e.expenseDate === date);
    }
    if (busId && busId !== 'all') {
      expenses = expenses.filter(e => e.busId === busId);
    }
    if (tripId && tripId !== 'all') {
      expenses = expenses.filter(e => e.tripId === tripId);
    }
    if (category && category !== 'all') {
      expenses = expenses.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }
    if (paymentMethod && paymentMethod !== 'all') {
      expenses = expenses.filter(e => e.paymentMethod.toLowerCase() === paymentMethod.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      expenses = expenses.filter(e => 
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.paidTo && e.paidTo.toLowerCase().includes(q)) ||
        (e.receiptNumber && e.receiptNumber.toLowerCase().includes(q)) ||
        (e.busNumber && e.busNumber.toLowerCase().includes(q)) ||
        e.category.toLowerCase().includes(q)
      );
    }

    expenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Category breakdown
    const categoryTotals = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (Number(e.amount) || 0);
    });

    return res.json({
      success: true,
      count: expenses.length,
      totalAmount,
      categoryTotals,
      expenses
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch expenses.' });
  }
};

const createExpense = (req, res) => {
  try {
    const {
      expenseDate,
      busId,
      tripId,
      category,
      amount,
      paidTo,
      paymentMethod,
      description,
      receiptNumber
    } = req.body;

    if (!category || !amount || !expenseDate) {
      return res.status(400).json({ success: false, message: 'Expense Date, Category, and Amount are required.' });
    }

    let busNumber = '';
    let tripNumber = '';

    if (busId) {
      const bus = store.data.buses.find(b => b.id === busId);
      if (bus) busNumber = bus.busNumber;
    }
    if (tripId) {
      const trip = store.data.trips.find(t => t.id === tripId);
      if (trip) tripNumber = trip.tripNumber;
    }

    const newExpense = {
      id: `exp_${Date.now()}`,
      expenseDate,
      busId: busId || '',
      busNumber,
      tripId: tripId || '',
      tripNumber,
      category,
      amount: parseFloat(amount),
      paidTo: paidTo || 'Vendor',
      paymentMethod: paymentMethod || 'Cash',
      description: description || '',
      receiptNumber: receiptNumber || `VCH-${Date.now().toString().slice(-6)}`,
      addedBy: req.user?.name || 'Administrator',
      createdAt: new Date().toISOString()
    };

    store.data.expenses.push(newExpense);
    store.save();

    store.logAudit(
      req.user?.name || 'Admin',
      req.user?.role || 'admin',
      'Added Expense',
      'Expense',
      `Added ${newExpense.category} expense ₹${newExpense.amount} for ${newExpense.busNumber || 'General'}`,
      newExpense.id
    );

    return res.status(201).json({ success: true, message: 'Expense logged successfully.', expense: newExpense });
  } catch (err) {
    console.error('Create Expense Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record expense.' });
  }
};

const updateExpense = (req, res) => {
  try {
    const { id } = req.params;
    const index = store.data.expenses.findIndex(e => e.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }

    const current = store.data.expenses[index];
    const updated = {
      ...current,
      ...req.body,
      id: current.id,
      amount: req.body.amount !== undefined ? parseFloat(req.body.amount) : current.amount
    };

    store.data.expenses[index] = updated;
    store.save();

    store.logAudit(req.user?.name || 'Admin', req.user?.role || 'admin', 'Updated Expense', 'Expense', `Updated expense ${updated.receiptNumber}`, updated.id);

    return res.json({ success: true, message: 'Expense updated successfully.', expense: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update expense.' });
  }
};

const deleteExpense = (req, res) => {
  try {
    const { id } = req.params;
    const expense = store.data.expenses.find(e => e.id === id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }

    store.data.expenses = store.data.expenses.filter(e => e.id !== id);
    store.save();

    store.logAudit(req.user?.name || 'Admin', req.user?.role || 'admin', 'Deleted Expense', 'Expense', `Deleted ${expense.category} expense ₹${expense.amount}`, id);

    return res.json({ success: true, message: 'Expense deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete expense.' });
  }
};

module.exports = {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense
};
