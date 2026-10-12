import React, { useState, useEffect } from 'react';
import { 
  Users, 
  PlusCircle, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  IndianRupee, 
  Ticket, 
  Edit3, 
  Trash2, 
  X, 
  RefreshCw,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import api from '../services/api';

const WorkerManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentWorkerId, setCurrentWorkerId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formEmpId, setFormEmpId] = useState('');
  const [formAssignedBus, setFormAssignedBus] = useState('');
  const [formAssignedRoute, setFormAssignedRoute] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      let url = '/workers?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;

      const res = await api.get(url);
      if (res.success) {
        setWorkers(res.workers || []);
      }
    } catch (err) {
      console.error('Failed to load workers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBusesAndRoutes = async () => {
      try {
        const [busesRes, routesRes] = await Promise.all([
          api.get('/buses'),
          api.get('/routes')
        ]);
        if (busesRes.buses) setBuses(busesRes.buses);
        if (routesRes.routes) setRoutes(routesRes.routes);
      } catch (err) {
        // ignore
      }
    };
    fetchBusesAndRoutes();
    fetchWorkers();
  }, [statusFilter]);

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentWorkerId(null);
    setFormName('');
    setFormMobile('');
    setFormEmail('');
    setFormPassword('admin123');
    setFormAddress('');
    setFormEmpId(`EMP-W${workers.length + 1}`);
    setFormAssignedBus('');
    setFormAssignedRoute('');
    setFormStatus('Active');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (worker) => {
    setIsEdit(true);
    setCurrentWorkerId(worker.id);
    setFormName(worker.name);
    setFormMobile(worker.mobile);
    setFormEmail(worker.email || '');
    setFormPassword('');
    setFormAddress(worker.address || '');
    setFormEmpId(worker.employeeId || '');
    setFormAssignedBus(worker.assignedBus || '');
    setFormAssignedRoute(worker.assignedRoute || '');
    setFormStatus(worker.status || 'Active');
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        name: formName,
        mobile: formMobile,
        email: formEmail,
        password: formPassword || undefined,
        address: formAddress,
        employeeId: formEmpId,
        assignedBus: formAssignedBus,
        assignedRoute: formAssignedRoute,
        status: formStatus
      };

      if (isEdit) {
        await api.put(`/workers/${currentWorkerId}`, payload);
      } else {
        await api.post('/workers', payload);
      }

      setShowModal(false);
      fetchWorkers();
    } catch (err) {
      setFormError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (worker) => {
    if (!window.confirm(`Delete staff member "${worker.name}"?`)) return;
    try {
      await api.delete(`/workers/${worker.id}`);
      fetchWorkers();
    } catch (err) {
      alert(err.message || 'Failed to delete worker.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl flex items-center gap-2.5">
            <Users className="h-6 w-6 text-emerald-600" />
            <span>Worker & Booking Staff Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Staff directory, route/bus assignments, individual ticket sales, and collections
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add New Worker</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by worker name, phone, employee ID..."
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Staff Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            onClick={fetchWorkers}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Search
          </button>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs font-semibold text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading staff directory...
          </div>
        ) : workers.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            No workers found.
          </div>
        ) : (
          workers.map((worker) => (
            <div
              key={worker.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={worker.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(worker.name)}`}
                      alt={worker.name}
                      className="h-10 w-10 rounded-xl bg-emerald-100 object-cover ring-1 ring-emerald-500/20"
                    />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{worker.name}</h3>
                      <p className="text-[10px] font-mono font-bold text-emerald-700">{worker.employeeId}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    worker.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {worker.status}
                  </span>
                </div>

                {/* Contact & Assignment Info */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600 rounded-2xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{worker.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate text-slate-600">{worker.email}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5 mt-1.5 text-[11px]">
                    <span className="text-slate-400">Assigned Bus:</span>
                    <span className="font-bold text-slate-800">{worker.assignedBusDetails?.busNumber || 'None'}</span>
                  </div>
                </div>

                {/* Sales & Collection Stats */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-emerald-50 p-2.5 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 font-semibold block">Total Tickets Sold</span>
                    <span className="font-black text-emerald-950 text-sm">
                      {worker.stats?.totalTickets || 0} Tix
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-semibold block">Net Revenue Collected</span>
                    <span className="font-black text-slate-900 text-sm">
                      ₹{(worker.stats?.netRevenue || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[10px] text-slate-400">
                  Joined: {worker.joiningDate || '2023-01-01'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(worker)}
                    className="flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(worker)}
                    className="rounded-xl border border-red-200 bg-red-50 p-1 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Worker Modal */}
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
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEdit ? 'Edit Worker Profile' : 'Add New Booking Staff / Conductor'}
                </h3>
                <p className="text-xs text-slate-500">Configure login credentials and bus assignments</p>
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
                    Staff Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Rahul Patil"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Mobile Number (Login ID)
                  </label>
                  <input
                    type="tel"
                    required
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    placeholder="9822011101"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="rahul@travelmgmt.com"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    {isEdit ? 'New Password (Optional)' : 'Login Password'}
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={isEdit ? 'Leave blank to keep current' : 'admin123'}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formEmpId}
                    onChange={(e) => setFormEmpId(e.target.value)}
                    placeholder="EMP-W01"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Assigned Bus
                  </label>
                  <select
                    value={formAssignedBus}
                    onChange={(e) => setFormAssignedBus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  >
                    <option value="">-- None / General Desk --</option>
                    {buses.map(b => (
                      <option key={b.id} value={b.id}>{b.busNumber} ({b.busName})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Assigned Route
                  </label>
                  <select
                    value={formAssignedRoute}
                    onChange={(e) => setFormAssignedRoute(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  >
                    <option value="">-- None --</option>
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>{r.routeName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Counter / Residential Address
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="e.g. Booking Counter #2, CBS Station, Nanded"
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
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : isEdit ? 'Update Worker' : 'Register Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerManagement;
