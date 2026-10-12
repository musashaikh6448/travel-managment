import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  PlusCircle, 
  Search, 
  IndianRupee, 
  Trash2, 
  Edit3, 
  X, 
  RefreshCw, 
  Bus, 
  Calendar, 
  PieChart,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ExpenseManagement = () => {
  const { isAdmin } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [buses, setBuses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [busFilter, setBusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('2026-10-05');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentExpId, setCurrentExpId] = useState(null);
  const [formDate, setFormDate] = useState('2026-10-05');
  const [formCategory, setFormCategory] = useState('Fuel');
  const [formAmount, setFormAmount] = useState('');
  const [formBusId, setFormBusId] = useState('');
  const [formTripId, setFormTripId] = useState('');
  const [formPaidTo, setFormPaidTo] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('Card');
  const [formDescription, setFormDescription] = useState('');
  const [formReceiptNo, setFormReceiptNo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const categories = [
    'Fuel', 'Driver Salary', 'Conductor Salary', 'Toll', 'Maintenance',
    'Parking', 'Food', 'Commission', 'Cleaning', 'Repair', 'Other'
  ];

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      let url = '/expenses?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (categoryFilter !== 'all') url += `category=${categoryFilter}&`;
      if (busFilter !== 'all') url += `busId=${busFilter}&`;
      if (dateFilter) url += `date=${dateFilter}&`;

      const res = await api.get(url);
      if (res.success) {
        setExpenses(res.expenses || []);
        setCategoryTotals(res.categoryTotals || {});
        setTotalAmount(res.totalAmount || 0);
      }
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBusesAndTrips = async () => {
      try {
        const [busesRes, tripsRes] = await Promise.all([
          api.get('/buses'),
          api.get('/trips?date=2026-10-05')
        ]);
        if (busesRes.buses) setBuses(busesRes.buses);
        if (tripsRes.trips) setTrips(tripsRes.trips);
      } catch (err) {
        // ignore
      }
    };
    fetchBusesAndTrips();
    fetchExpenses();
  }, [categoryFilter, busFilter, dateFilter]);

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentExpId(null);
    setFormDate('2026-10-05');
    setFormCategory('Fuel');
    setFormAmount('');
    setFormBusId(buses[0]?.id || '');
    setFormTripId('');
    setFormPaidTo('Indian Oil Petrol Pump');
    setFormPaymentMethod('Card');
    setFormDescription('');
    setFormReceiptNo(`VCH-${Date.now().toString().slice(-5)}`);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (exp) => {
    setIsEdit(true);
    setCurrentExpId(exp.id);
    setFormDate(exp.expenseDate);
    setFormCategory(exp.category);
    setFormAmount(String(exp.amount));
    setFormBusId(exp.busId || '');
    setFormTripId(exp.tripId || '');
    setFormPaidTo(exp.paidTo || '');
    setFormPaymentMethod(exp.paymentMethod || 'Cash');
    setFormDescription(exp.description || '');
    setFormReceiptNo(exp.receiptNumber || '');
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        expenseDate: formDate,
        category: formCategory,
        amount: parseFloat(formAmount),
        busId: formBusId,
        tripId: formTripId,
        paidTo: formPaidTo,
        paymentMethod: formPaymentMethod,
        description: formDescription,
        receiptNumber: formReceiptNo
      };

      if (isEdit) {
        await api.put(`/expenses/${currentExpId}`, payload);
      } else {
        await api.post('/expenses', payload);
      }

      setShowModal(false);
      fetchExpenses();
    } catch (err) {
      setFormError(err.message || 'Failed to record expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (exp) => {
    if (!window.confirm(`Delete expense receipt ${exp.receiptNumber} (₹${exp.amount})?`)) return;
    try {
      await api.delete(`/expenses/${exp.id}`);
      fetchExpenses();
    } catch (err) {
      alert(err.message || 'Failed to delete expense.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl flex items-center gap-2.5">
            <Receipt className="h-6 w-6 text-rose-600" />
            <span>Daily Expense Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log diesel fuel, driver batta/salary, toll taxes, maintenance, and fleet operational costs
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-md shadow-rose-600/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ Add New Expense</span>
          </button>
        )}
      </div>

      {/* Top Expense Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-rose-100 bg-rose-50/60 p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Total Filtered Expenses</span>
          <h3 className="text-2xl font-black text-rose-950 mt-1">₹{totalAmount.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-rose-700 mt-0.5">{expenses.length} Total Expense Vouchers</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:col-span-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Top Expense Categories Breakdown
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.keys(categoryTotals).slice(0, 6).map((cat) => (
              <div key={cat} className="rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-200/70 text-xs">
                <span className="text-slate-500 font-medium">{cat}:</span>{' '}
                <strong className="text-slate-900 font-bold">₹{categoryTotals[cat].toLocaleString('en-IN')}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by vendor, receipt no, description..."
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={busFilter}
            onChange={(e) => setBusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Buses</option>
            {buses.map(b => (
              <option key={b.id} value={b.id}>{b.busNumber}</option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
          />

          <button
            onClick={fetchExpenses}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Filter
          </button>
          {(search || categoryFilter !== 'all' || busFilter !== 'all' || dateFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setBusFilter('all');
                setDateFilter('');
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Date & Receipt</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Paid To / Vendor</th>
                <th className="py-3.5 px-4">Bus & Trip Reference</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Payment Mode</th>
                <th className="py-3.5 px-4">Added By</th>
                {isAdmin && <th className="py-3.5 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-rose-600" />
                    Loading expense records...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{exp.expenseDate}</p>
                      <span className="font-mono text-[10px] text-slate-400">{exp.receiptNumber}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800 border border-rose-100">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{exp.paidTo}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[160px]">{exp.description || '—'}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-semibold text-slate-800">{exp.busNumber || 'Fleet General'}</span>
                      {exp.tripNumber && <span className="text-[10px] text-slate-400 block">{exp.tripNumber}</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-rose-600 text-sm">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {exp.addedBy || 'Admin'}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(exp)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl my-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEdit ? 'Edit Expense Record' : 'Record Operating Expense'}
                </h3>
                <p className="text-xs text-slate-500">Log vehicle maintenance, fuel, or driver salary voucher</p>
              </div>
            </div>

            {formError && (
              <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Expense Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="e.g. 3500"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-base font-black text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold text-slate-900"
                  >
                    <option value="Cash">Cash Voucher</option>
                    <option value="Card">Corporate Card</option>
                    <option value="UPI">UPI / Online</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Assigned Bus
                  </label>
                  <select
                    value={formBusId}
                    onChange={(e) => setFormBusId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  >
                    <option value="">-- General / No Bus --</option>
                    {buses.map(b => (
                      <option key={b.id} value={b.id}>{b.busNumber} ({b.busName})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Paid To / Vendor
                  </label>
                  <input
                    type="text"
                    required
                    value={formPaidTo}
                    onChange={(e) => setFormPaidTo(e.target.value)}
                    placeholder="Vendor Name / Driver"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Description / Remarks
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. 45 Litres Diesel filling at IOCL Pump"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-rose-600 px-5 py-2 font-bold text-white hover:bg-rose-700 shadow-md shadow-rose-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : isEdit ? 'Update Expense' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManagement;
