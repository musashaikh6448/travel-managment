import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  PlusCircle, 
  Search, 
  Clock, 
  IndianRupee, 
  Edit3, 
  Trash2, 
  X, 
  RefreshCw,
  Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const RouteManagement = () => {
  const { isAdmin } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentRouteId, setCurrentRouteId] = useState(null);
  const [formRouteName, setFormRouteName] = useState('');
  const [formFrom, setFormFrom] = useState('');
  const [formTo, setFormTo] = useState('');
  const [formStops, setFormStops] = useState('');
  const [formDistance, setFormDistance] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      let url = '/routes?';
      if (search) url += `search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.success) {
        setRoutes(res.routes || []);
      }
    } catch (err) {
      console.error('Failed to load routes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentRouteId(null);
    setFormRouteName('');
    setFormFrom('Nanded');
    setFormTo('');
    setFormStops('Nanded, Latur, Solapur, Pune');
    setFormDistance('440 km');
    setFormDuration('8 hrs 30 mins');
    setFormPrice('850');
    setFormStatus('Active');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (route) => {
    setIsEdit(true);
    setCurrentRouteId(route.id);
    setFormRouteName(route.routeName);
    setFormFrom(route.from);
    setFormTo(route.to);
    setFormStops(Array.isArray(route.stops) ? route.stops.join(', ') : route.stops);
    setFormDistance(route.distance || '');
    setFormDuration(route.estimatedTravelTime || '');
    setFormPrice(String(route.ticketPrice));
    setFormStatus(route.status || 'Active');
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        routeName: formRouteName || `${formFrom} ➔ ${formTo} Express`,
        from: formFrom,
        to: formTo,
        stops: formStops.split(',').map(s => s.trim()).filter(Boolean),
        distance: formDistance,
        estimatedTravelTime: formDuration,
        ticketPrice: parseFloat(formPrice),
        status: formStatus
      };

      if (isEdit) {
        await api.put(`/routes/${currentRouteId}`, payload);
      } else {
        await api.post('/routes', payload);
      }

      setShowModal(false);
      fetchRoutes();
    } catch (err) {
      setFormError(err.message || 'Failed to save route.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (route) => {
    if (!window.confirm(`Delete route "${route.routeName}"?`)) return;
    try {
      await api.delete(`/routes/${route.id}`);
      fetchRoutes();
    } catch (err) {
      alert(err.message || 'Failed to delete route.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl flex items-center gap-2.5">
            <MapPin className="h-6 w-6 text-emerald-600" />
            <span>Route & Stops Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-stop travel corridors, standard ticket prices, and distance schedules
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add New Route</span>
          </button>
        )}
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs font-semibold text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading routes...
          </div>
        ) : routes.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            No routes found.
          </div>
        ) : (
          routes.map((route) => (
            <div
              key={route.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-emerald-600" />
                    <span>{route.routeName}</span>
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    {route.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-xs rounded-2xl bg-slate-50 p-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Distance</span>
                    <span className="font-bold text-slate-800">{route.distance}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Est. Time</span>
                    <span className="font-bold text-slate-800">{route.estimatedTravelTime}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Standard Price</span>
                    <span className="font-black text-emerald-700 text-sm">₹{route.ticketPrice}</span>
                  </div>
                </div>

                {/* Stops Pills */}
                <div className="mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Waypoints & Stops ({route.stops?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(route.stops || []).map((stop, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900 border border-emerald-100/80 flex items-center gap-1"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>{stop}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Aggregates */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
                  <span>Assigned Fleet: <strong>{route.assignedBusesCount || 0} Buses</strong></span>
                  <span>Tickets Sold: <strong>{route.totalTicketsSold || 0}</strong></span>
                  <span>Gross Revenue: <strong className="text-slate-900">₹{(route.totalRevenue || 0).toLocaleString('en-IN')}</strong></span>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => openEditModal(route)}
                    className="flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(route)}
                    className="rounded-xl border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Route Modal */}
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
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEdit ? 'Edit Route Profile' : 'Create New Bus Route'}
                </h3>
                <p className="text-xs text-slate-500">Configure origin, destination, intermediate stops, and fare</p>
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
                    Origin City (From)
                  </label>
                  <input
                    type="text"
                    required
                    value={formFrom}
                    onChange={(e) => setFormFrom(e.target.value)}
                    placeholder="e.g. Nanded"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Destination City (To)
                  </label>
                  <input
                    type="text"
                    required
                    value={formTo}
                    onChange={(e) => setFormTo(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Route Display Title
                </label>
                <input
                  type="text"
                  value={formRouteName}
                  onChange={(e) => setFormRouteName(e.target.value)}
                  placeholder="e.g. Nanded ➔ Hyderabad Express"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Intermediate Stops (Comma separated)
                </label>
                <textarea
                  rows={2}
                  required
                  value={formStops}
                  onChange={(e) => setFormStops(e.target.value)}
                  placeholder="e.g. Nanded, Degloor, Bodhan, Nizamabad, Kamareddy, Hyderabad"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Distance
                  </label>
                  <input
                    type="text"
                    value={formDistance}
                    onChange={(e) => setFormDistance(e.target.value)}
                    placeholder="e.g. 280 km"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Est. Duration
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="e.g. 6h 30m"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Base Fare (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
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
                  {submitting ? 'Saving...' : isEdit ? 'Update Route' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteManagement;
