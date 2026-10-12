import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  PlusCircle, 
  Search, 
  Bus, 
  MapPin, 
  Clock, 
  User, 
  TrendingUp, 
  Armchair, 
  Eye, 
  Edit3, 
  RefreshCw,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SeatPicker from '../components/SeatPicker';
import api from '../services/api';

const TripsManagement = ({ onBookTrip }) => {
  const { isAdmin } = useAuth();
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Schedule Trip Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalBusId, setModalBusId] = useState('');
  const [modalRouteId, setModalRouteId] = useState('');
  const [modalDate, setModalDate] = useState('2026-10-06');
  const [modalDeptTime, setModalDeptTime] = useState('21:00');
  const [modalArrTime, setModalArrTime] = useState('05:30');
  const [modalDriver, setModalDriver] = useState('');
  const [modalConductor, setModalConductor] = useState('');
  const [modalPrice, setModalPrice] = useState('650');
  const [modalStatus, setModalStatus] = useState('Scheduled');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // View Trip Details & Seat Map Modal
  const [selectedTripDetails, setSelectedTripDetails] = useState(null);
  const [loadingTripDetails, setLoadingTripDetails] = useState(false);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      let url = '/trips?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      if (dateFilter) url += `date=${dateFilter}&`;

      const res = await api.get(url);
      if (res.success) {
        setTrips(res.trips || []);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBusesAndRoutes = async () => {
      try {
        const [busesRes, routesRes] = await Promise.all([
          api.get('/buses?status=Active'),
          api.get('/routes?status=Active')
        ]);
        if (busesRes.buses) {
          setBuses(busesRes.buses);
          if (busesRes.buses.length > 0) {
            setModalBusId(busesRes.buses[0].id);
            setModalDriver(busesRes.buses[0].driverName || '');
            setModalConductor(busesRes.buses[0].conductorName || '');
          }
        }
        if (routesRes.routes) {
          setRoutes(routesRes.routes);
          if (routesRes.routes.length > 0) {
            setModalRouteId(routesRes.routes[0].id);
            setModalPrice(String(routesRes.routes[0].ticketPrice || 650));
          }
        }
      } catch (err) {
        // ignore
      }
    };
    fetchBusesAndRoutes();
    fetchTrips();
  }, [statusFilter, dateFilter]);

  const handleBusChange = (busId) => {
    setModalBusId(busId);
    const bus = buses.find(b => b.id === busId);
    if (bus) {
      setModalDriver(bus.driverName || '');
      setModalConductor(bus.conductorName || '');
      if (bus.departureTime) setModalDeptTime(bus.departureTime);
      if (bus.arrivalTime) setModalArrTime(bus.arrivalTime);
    }
  };

  const handleRouteChange = (routeId) => {
    setModalRouteId(routeId);
    const route = routes.find(r => r.id === routeId);
    if (route) {
      setModalPrice(String(route.ticketPrice || 650));
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    setModalError('');

    try {
      const payload = {
        busId: modalBusId,
        routeId: modalRouteId,
        tripDate: modalDate,
        departureTime: modalDeptTime,
        arrivalTime: modalArrTime,
        driverName: modalDriver,
        conductorName: modalConductor,
        ticketPrice: parseFloat(modalPrice),
        status: modalStatus
      };

      const res = await api.post('/trips', payload);
      if (res.success) {
        setShowAddModal(false);
        fetchTrips();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to create trip.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleViewTrip = async (tripId) => {
    setLoadingTripDetails(true);
    try {
      const res = await api.get(`/trips/${tripId}`);
      if (res.success) {
        setSelectedTripDetails(res.trip);
      }
    } catch (err) {
      alert('Failed to retrieve trip details.');
    } finally {
      setLoadingTripDetails(false);
    }
  };

  const handleUpdateStatus = async (tripId, newStatus) => {
    try {
      await api.put(`/trips/${tripId}`, { status: newStatus });
      fetchTrips();
      if (selectedTripDetails && selectedTripDetails.id === tripId) {
        setSelectedTripDetails(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update trip status.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl flex items-center gap-2.5">
            <CalendarDays className="h-6 w-6 text-emerald-600" />
            <span>Trips & Departures Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Independent trip tracking, seat occupancy, and trip-wise profit & loss
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Schedule New Trip</span>
          </button>
        )}
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
              placeholder="Search by trip number, route, bus..."
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Trip Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Running">Running</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
          />

          <button
            onClick={fetchTrips}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Filter
          </button>
          {(search || statusFilter !== 'all' || dateFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setDateFilter('');
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs font-semibold text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading trips schedule...
          </div>
        ) : trips.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            No scheduled trips found matching current filters.
          </div>
        ) : (
          trips.map((t) => {
            const booked = t.bookedSeatsCount || (t.bookedSeats?.length || 0);
            const available = Math.max(0, t.totalSeats - booked);
            const occ = t.totalSeats > 0 ? Math.round((booked / t.totalSeats) * 100) : 0;

            let statusPill = 'bg-blue-100 text-blue-800';
            if (t.status === 'Running') statusPill = 'bg-emerald-100 text-emerald-800 animate-pulse';
            if (t.status === 'Completed') statusPill = 'bg-slate-100 text-slate-700';
            if (t.status === 'Cancelled') statusPill = 'bg-red-100 text-red-700';

            return (
              <div
                key={t.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-mono text-xs font-bold text-emerald-700">{t.tripNumber}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusPill}`}>
                      {t.status}
                    </span>
                  </div>

                  {/* Route & Bus Info */}
                  <div className="mt-3">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{t.from} ➔ {t.to}</span>
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {t.busNumber} • {t.busName}
                    </p>
                  </div>

                  {/* Date & Timings */}
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-2.5 text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Trip Date</span>
                      <span className="font-semibold text-slate-800">{t.tripDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Departure</span>
                      <span className="font-semibold text-slate-800">{t.departureTime}</span>
                    </div>
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-500">Seat Occupancy ({occ}%)</span>
                      <span className="font-bold text-slate-900">{booked} / {t.totalSeats} Booked</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${occ >= 85 ? 'bg-emerald-600' : 'bg-emerald-500'}`}
                        style={{ width: `${occ}%` }}
                      />
                    </div>
                  </div>

                  {/* Financial Overview (Trip Independent) */}
                  {isAdmin && (
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Revenue</span>
                        <span className="font-bold text-slate-900">₹{(t.revenue || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Expenses</span>
                        <span className="font-semibold text-rose-600">₹{(t.expenses || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Trip Profit</span>
                        <span className="font-extrabold text-emerald-700">₹{(t.profit || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Bottom Actions */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <button
                    onClick={() => handleViewTrip(t.id)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Seats & Info</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {t.status === 'Scheduled' && (
                      <button
                        onClick={() => onBookTrip(t)}
                        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                      >
                        Book Ticket
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Trip Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl my-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Schedule New Bus Trip</h3>
                <p className="text-xs text-slate-500">Create departure on specific route & bus</p>
              </div>
            </div>

            {modalError && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateTrip} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Assigned Bus
                </label>
                <select
                  required
                  value={modalBusId}
                  onChange={(e) => handleBusChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.busNumber} — {b.busName} ({b.totalSeats} Seats)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Route
                </label>
                <select
                  required
                  value={modalRouteId}
                  onChange={(e) => handleRouteChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.routeName} (₹{r.ticketPrice})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Trip Date
                  </label>
                  <input
                    type="date"
                    required
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Ticket Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={modalPrice}
                    onChange={(e) => setModalPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    required
                    value={modalDeptTime}
                    onChange={(e) => setModalDeptTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Arrival Time
                  </label>
                  <input
                    type="time"
                    required
                    value={modalArrTime}
                    onChange={(e) => setModalArrTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Assigned Driver
                  </label>
                  <input
                    type="text"
                    value={modalDriver}
                    onChange={(e) => setModalDriver(e.target.value)}
                    placeholder="Driver Name"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Assigned Conductor
                  </label>
                  <input
                    type="text"
                    value={modalConductor}
                    onChange={(e) => setModalConductor(e.target.value)}
                    placeholder="Conductor Name"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {modalSubmitting ? 'Scheduling...' : 'Schedule Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trip Details & Live Seat Map Modal */}
      {selectedTripDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl my-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedTripDetails(null)}
              className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-700">{selectedTripDetails.tripNumber}</span>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedTripDetails.from} ➔ {selectedTripDetails.to}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedTripDetails.busNumber} • {selectedTripDetails.busName} | Date: {selectedTripDetails.tripDate}
                </p>
              </div>

              {/* Status Switcher */}
              {isAdmin && (
                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedTripDetails.status}
                    onChange={(e) => handleUpdateStatus(selectedTripDetails.id, e.target.value)}
                    className="rounded-xl border border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-800"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Running">Running</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>

            {/* Trip Stats Cards */}
            <div className="my-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Occupancy</span>
                <span className="font-bold text-slate-900">
                  {selectedTripDetails.stats?.bookedSeats}/{selectedTripDetails.totalSeats} ({selectedTripDetails.stats?.occupancyRate}%)
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Available</span>
                <span className="font-bold text-emerald-700">
                  {selectedTripDetails.stats?.availableSeats} Free Seats
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Total Revenue</span>
                <span className="font-bold text-slate-900">
                  ₹{(selectedTripDetails.stats?.revenue || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">Trip Profit</span>
                <span className="font-extrabold text-emerald-700">
                  ₹{(selectedTripDetails.stats?.profit || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Visual Seat Map */}
            <div className="my-4">
              <SeatPicker
                totalSeats={selectedTripDetails.totalSeats}
                seatLayoutType={selectedTripDetails.seatLayoutType}
                bookedSeats={selectedTripDetails.bookedSeats || []}
                blockedSeats={selectedTripDetails.blockedSeats || []}
                seatMap={selectedTripDetails.seatMap || []}
                ticketPrice={selectedTripDetails.ticketPrice}
                readonly={true}
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setSelectedTripDetails(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
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

export default TripsManagement;
