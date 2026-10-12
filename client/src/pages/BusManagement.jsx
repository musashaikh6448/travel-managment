import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  PlusCircle, 
  Search, 
  User, 
  Phone, 
  MapPin, 
  IndianRupee, 
  TrendingUp, 
  Edit3, 
  Trash2, 
  Eye, 
  X,
  RefreshCw,
  Armchair,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const BusManagement = () => {
  const { isAdmin } = useAuth();
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentBusId, setCurrentBusId] = useState(null);
  const [formBusNumber, setFormBusNumber] = useState('');
  const [formBusName, setFormBusName] = useState('');
  const [formBusType, setFormBusType] = useState('AC Sleeper');
  const [formRegNumber, setFormRegNumber] = useState('');
  const [formTotalSeats, setFormTotalSeats] = useState('36');
  const [formSeatLayout, setFormSeatLayout] = useState('2x1_sleeper');
  const [formDriverName, setFormDriverName] = useState('');
  const [formDriverMobile, setFormDriverMobile] = useState('');
  const [formConductorName, setFormConductorName] = useState('');
  const [formConductorMobile, setFormConductorMobile] = useState('');
  const [formRouteId, setFormRouteId] = useState('');
  const [formDeptTime, setFormDeptTime] = useState('21:00');
  const [formArrTime, setFormArrTime] = useState('05:30');
  const [formBoarding, setFormBoarding] = useState('Central Bus Station');
  const [formDropping, setFormDropping] = useState('Main Terminal');
  const [formStatus, setFormStatus] = useState('Active');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Bus Details Modal
  const [selectedBusDetails, setSelectedBusDetails] = useState(null);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      let url = '/buses?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;

      const res = await api.get(url);
      if (res.success) {
        setBuses(res.buses || []);
      }
    } catch (err) {
      console.error('Failed to load buses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await api.get('/routes');
        if (res.routes) setRoutes(res.routes);
      } catch (err) {
        // ignore
      }
    };
    fetchRoutes();
    fetchBuses();
  }, [statusFilter]);

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentBusId(null);
    setFormBusNumber('');
    setFormBusName('');
    setFormBusType('AC Sleeper');
    setFormRegNumber('');
    setFormTotalSeats('36');
    setFormSeatLayout('2x1_sleeper');
    setFormDriverName('');
    setFormDriverMobile('');
    setFormConductorName('');
    setFormConductorMobile('');
    setFormRouteId(routes[0]?.id || '');
    setFormDeptTime('21:00');
    setFormArrTime('05:30');
    setFormBoarding('Central Bus Stand Corner');
    setFormDropping('Main City Terminal');
    setFormStatus('Active');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (bus) => {
    setIsEdit(true);
    setCurrentBusId(bus.id);
    setFormBusNumber(bus.busNumber);
    setFormBusName(bus.busName);
    setFormBusType(bus.busType);
    setFormRegNumber(bus.registrationNumber || '');
    setFormTotalSeats(String(bus.totalSeats));
    setFormSeatLayout(bus.seatLayoutType || '2x2');
    setFormDriverName(bus.driverName || '');
    setFormDriverMobile(bus.driverMobile || '');
    setFormConductorName(bus.conductorName || '');
    setFormConductorMobile(bus.conductorMobile || '');
    setFormRouteId(bus.routeId || '');
    setFormDeptTime(bus.departureTime || '21:00');
    setFormArrTime(bus.arrivalTime || '05:30');
    setFormBoarding(bus.boardingPoint || '');
    setFormDropping(bus.droppingPoint || '');
    setFormStatus(bus.status || 'Active');
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        busNumber: formBusNumber,
        busName: formBusName,
        busType: formBusType,
        registrationNumber: formRegNumber,
        totalSeats: parseInt(formTotalSeats, 10),
        seatLayoutType: formSeatLayout,
        driverName: formDriverName,
        driverMobile: formDriverMobile,
        conductorName: formConductorName,
        conductorMobile: formConductorMobile,
        routeId: formRouteId,
        departureTime: formDeptTime,
        arrivalTime: formArrTime,
        boardingPoint: formBoarding,
        droppingPoint: formDropping,
        status: formStatus
      };

      if (isEdit) {
        await api.put(`/buses/${currentBusId}`, payload);
      } else {
        await api.post('/buses', payload);
      }

      setShowModal(false);
      fetchBuses();
    } catch (err) {
      setFormError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBus = async (bus) => {
    if (!window.confirm(`Are you sure you want to delete bus ${bus.busNumber} (${bus.busName})?`)) {
      return;
    }
    try {
      await api.delete(`/buses/${bus.id}`);
      fetchBuses();
    } catch (err) {
      alert(err.message || 'Failed to delete bus.');
    }
  };

  const viewBusDetails = async (busId) => {
    try {
      const res = await api.get(`/buses/${busId}`);
      if (res.success) {
        setSelectedBusDetails(res.bus);
      }
    } catch (err) {
      alert('Failed to fetch bus details.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl flex items-center gap-2.5">
            <Bus className="h-6 w-6 text-emerald-600" />
            <span>Bus Fleet Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fleet maintenance, driver & conductor allocations, seating configs, and bus profit/loss
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add New Bus</span>
          </button>
        )}
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
              placeholder="Search by bus number, model, driver..."
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Fleet Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          <button
            onClick={fetchBuses}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Search
          </button>
        </div>
      </div>

      {/* Buses Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs font-semibold text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading fleet data...
          </div>
        ) : buses.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            No buses found.
          </div>
        ) : (
          buses.map((bus) => {
            let statusPill = 'bg-emerald-100 text-emerald-800';
            if (bus.status === 'Maintenance') statusPill = 'bg-amber-100 text-amber-800';
            if (bus.status === 'Inactive') statusPill = 'bg-slate-100 text-slate-700';

            return (
              <div
                key={bus.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-mono text-sm font-black text-slate-900">{bus.busNumber}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusPill}`}>
                      {bus.status}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-extrabold text-slate-900 text-base">{bus.busName}</h3>
                    <p className="text-xs text-slate-500 font-medium">{bus.busType} • {bus.totalSeats} Total Seats</p>
                  </div>

                  {/* Route & Driver */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 rounded-2xl bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Assigned Route</span>
                      <span className="font-bold text-slate-800 truncate max-w-[150px]">
                        {bus.routeDetails?.routeName || 'Unassigned'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Driver</span>
                      <span className="font-medium text-slate-800">{bus.driverName || 'Not assigned'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Conductor</span>
                      <span className="font-medium text-slate-800">{bus.conductorName || 'Not assigned'}</span>
                    </div>
                  </div>

                  {/* Profit Overview */}
                  {isAdmin && (
                    <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-2 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Revenue</span>
                        <span className="font-bold text-slate-900">₹{(bus.totalRevenue || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Expenses</span>
                        <span className="font-semibold text-rose-600">₹{(bus.totalExpenses || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Net Profit</span>
                        <span className="font-extrabold text-emerald-700">₹{(bus.profit || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <button
                    onClick={() => viewBusDetails(bus.id)}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Performance</span>
                  </button>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(bus)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        title="Edit Bus Details"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBus(bus)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete Bus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Bus Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl my-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEdit ? 'Edit Bus Fleet Details' : 'Register New Bus to Fleet'}
                </h3>
                <p className="text-xs text-slate-500">Configure vehicle, capacity, and staff assignments</p>
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
                    Bus Number / Plate
                  </label>
                  <input
                    type="text"
                    required
                    value={formBusNumber}
                    onChange={(e) => setFormBusNumber(e.target.value)}
                    placeholder="e.g. MH-26-BE-4455"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-mono font-bold text-slate-900 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Bus Model / Brand
                  </label>
                  <input
                    type="text"
                    required
                    value={formBusName}
                    onChange={(e) => setFormBusName(e.target.value)}
                    placeholder="e.g. Royal Star Volvo AC Sleeper"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Bus Type
                  </label>
                  <select
                    value={formBusType}
                    onChange={(e) => setFormBusType(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold text-slate-900"
                  >
                    <option value="AC Sleeper">AC Sleeper</option>
                    <option value="AC Semi-Sleeper">AC Semi-Sleeper</option>
                    <option value="AC Seater">AC Seater</option>
                    <option value="Non-AC Seater">Non-AC Seater</option>
                    <option value="Volvo Multi-Axle">Volvo Multi-Axle</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Total Seats
                  </label>
                  <input
                    type="number"
                    required
                    value={formTotalSeats}
                    onChange={(e) => setFormTotalSeats(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
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
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Default Route
                </label>
                <select
                  value={formRouteId}
                  onChange={(e) => setFormRouteId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold text-slate-900"
                >
                  <option value="">-- Select Route --</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.routeName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Driver Name & Mobile
                  </label>
                  <input
                    type="text"
                    value={formDriverName}
                    onChange={(e) => setFormDriverName(e.target.value)}
                    placeholder="Driver Name"
                    className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 mb-1.5"
                  />
                  <input
                    type="tel"
                    value={formDriverMobile}
                    onChange={(e) => setFormDriverMobile(e.target.value)}
                    placeholder="Driver Mobile"
                    className="w-full rounded-xl border border-slate-300 p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Conductor Name & Mobile
                  </label>
                  <input
                    type="text"
                    value={formConductorName}
                    onChange={(e) => setFormConductorName(e.target.value)}
                    placeholder="Conductor Name"
                    className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 mb-1.5"
                  />
                  <input
                    type="tel"
                    value={formConductorMobile}
                    onChange={(e) => setFormConductorMobile(e.target.value)}
                    placeholder="Conductor Mobile"
                    className="w-full rounded-xl border border-slate-300 p-2 text-slate-900"
                  />
                </div>
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
                  {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Register Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bus Details & Profit Breakdown Modal */}
      {selectedBusDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl my-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedBusDetails(null)}
              className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-sm font-black text-slate-900">{selectedBusDetails.busNumber}</span>
                <h3 className="text-xl font-extrabold text-slate-900">{selectedBusDetails.busName}</h3>
                <p className="text-xs text-slate-500">{selectedBusDetails.busType} | Reg: {selectedBusDetails.registrationNumber}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                {selectedBusDetails.status}
              </span>
            </div>

            {/* Performance Financial Highlights */}
            <div className="my-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-2xl bg-emerald-50/70 p-3 border border-emerald-100">
                <span className="text-emerald-700 block text-[10px] font-bold uppercase">Total Revenue</span>
                <p className="text-lg font-black text-emerald-950 mt-0.5">
                  ₹{(selectedBusDetails.stats?.totalRevenue || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-2xl bg-rose-50/70 p-3 border border-rose-100">
                <span className="text-rose-700 block text-[10px] font-bold uppercase">Total Expenses</span>
                <p className="text-lg font-black text-rose-950 mt-0.5">
                  ₹{(selectedBusDetails.stats?.totalExpenses || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Net Profit</span>
                <p className="text-lg font-black text-emerald-700 mt-0.5">
                  ₹{(selectedBusDetails.stats?.profit || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-2xl bg-blue-50/70 p-3 border border-blue-100">
                <span className="text-blue-700 block text-[10px] font-bold uppercase">Average Occupancy</span>
                <p className="text-lg font-black text-blue-950 mt-0.5">
                  {selectedBusDetails.stats?.occupancyRate || 0}%
                </p>
              </div>
            </div>

            {/* Staff & Route Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1.5">
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Assigned Crew</h4>
                <p className="text-slate-600">Driver: <strong>{selectedBusDetails.driverName || 'N/A'}</strong> ({selectedBusDetails.driverMobile})</p>
                <p className="text-slate-600">Conductor: <strong>{selectedBusDetails.conductorName || 'N/A'}</strong> ({selectedBusDetails.conductorMobile})</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1.5">
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Route & Terminals</h4>
                <p className="text-slate-600">Route: <strong>{selectedBusDetails.routeDetails?.routeName || 'Unassigned'}</strong></p>
                <p className="text-slate-600">Boarding: <strong>{selectedBusDetails.boardingPoint}</strong></p>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
              <button
                onClick={() => setSelectedBusDetails(null)}
                className="rounded-xl border border-slate-300 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusManagement;
