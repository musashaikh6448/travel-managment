import React, { useState, useEffect } from 'react';
import { 
  Armchair, 
  Lock, 
  Unlock, 
  Bus, 
  Calendar, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  User,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SeatPicker from '../components/SeatPicker';
import api from '../services/api';

const SeatManagement = () => {
  const { isAdmin } = useAuth();
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [tripDetails, setTripDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTrip, setLoadingTrip] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState('');
  const [blocking, setBlocking] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const res = await api.get('/trips?date=2026-10-05');
        if (res.success && res.trips?.length > 0) {
          setTrips(res.trips);
          setSelectedTripId(res.trips[0].id);
        }
      } catch (err) {
        console.error('Failed to load trips:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const fetchTripDetails = async (tripId) => {
    if (!tripId) return;
    setLoadingTrip(true);
    setSelectedSeat('');
    setMessage('');
    try {
      const res = await api.get(`/trips/${tripId}`);
      if (res.success) {
        setTripDetails(res.trip);
      }
    } catch (err) {
      console.error('Failed to load seat map for trip:', err);
    } finally {
      setLoadingTrip(false);
    }
  };

  useEffect(() => {
    fetchTripDetails(selectedTripId);
  }, [selectedTripId]);

  const handleToggleBlock = async (action) => {
    if (!selectedSeat) {
      alert('Please click on a seat first.');
      return;
    }
    setBlocking(true);
    setMessage('');
    try {
      const res = await api.post(`/trips/${selectedTripId}/seats/block`, {
        seatNumber: selectedSeat,
        action
      });
      if (res.success) {
        setMessage(res.message);
        fetchTripDetails(selectedTripId);
      }
    } catch (err) {
      alert(err.message || 'Failed to update seat status.');
    } finally {
      setBlocking(false);
    }
  };

  const currentSeatStatus = tripDetails?.seatMap?.find(s => s.seatNumber === selectedSeat)?.status;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl flex items-center gap-2.5">
            <Armchair className="h-6 w-6 text-emerald-600" />
            <span>Bus Seat Management & Layouts</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visual seat availability maps, deck configurations, and admin seat blocking
          </p>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800 border border-emerald-200 animate-in fade-in flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-emerald-600 hover:text-emerald-950">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Trip Selector & Visual Seat Layout (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Bus Trip / Scheduled Departure
            </label>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.from} ➔ {t.to} ({t.busNumber} • {t.busName}) | Dept: {t.departureTime}
                </option>
              ))}
            </select>
          </div>

          {loadingTrip ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-xs font-semibold text-slate-400">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
              Loading real-time seat configuration...
            </div>
          ) : (
            <SeatPicker
              totalSeats={tripDetails?.totalSeats || 40}
              seatLayoutType={tripDetails?.seatLayoutType || '2x2'}
              bookedSeats={tripDetails?.bookedSeats || []}
              blockedSeats={tripDetails?.blockedSeats || []}
              seatMap={tripDetails?.seatMap || []}
              selectedSeat={selectedSeat}
              onSelectSeat={(seatNum) => setSelectedSeat(seatNum)}
              ticketPrice={tripDetails?.ticketPrice || 650}
            />
          )}
        </div>

        {/* Right Side: Seat Inspector & Admin Block Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Seat Inspector Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Seat Information & Control</span>
              {selectedSeat ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 font-mono font-bold text-emerald-800 text-xs">
                  Seat: {selectedSeat}
                </span>
              ) : (
                <span className="text-xs text-slate-400">Click a seat to inspect</span>
              )}
            </h3>

            {selectedSeat ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Status</span>
                    <span className={`font-extrabold ${
                      currentSeatStatus === 'Booked'
                        ? 'text-blue-600'
                        : currentSeatStatus === 'Blocked'
                        ? 'text-slate-500'
                        : 'text-emerald-700'
                    }`}>
                      {currentSeatStatus?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Standard Fare</span>
                    <span className="font-bold text-slate-900">₹{tripDetails?.ticketPrice}</span>
                  </div>

                  {currentSeatStatus === 'Booked' && (
                    <div className="mt-2 border-t border-slate-200 pt-2 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Passenger Details
                      </span>
                      {(() => {
                        const p = tripDetails?.seatMap?.find(s => s.seatNumber === selectedSeat)?.passenger;
                        return p ? (
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <p className="text-slate-600">{p.mobile} ({p.gender}, {p.age} yrs)</p>
                            <p className="text-[10px] text-slate-400 font-mono">Ticket: {p.ticketNumber}</p>
                          </div>
                        ) : (
                          <p className="text-slate-400">Booking details not found.</p>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Admin Block / Unblock Controls */}
                {isAdmin && (
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Admin Seat Override
                    </span>

                    {currentSeatStatus === 'Available' && (
                      <button
                        onClick={() => handleToggleBlock('block')}
                        disabled={blocking}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <Lock className="h-4 w-4" />
                        <span>Block Seat {selectedSeat}</span>
                      </button>
                    )}

                    {currentSeatStatus === 'Blocked' && (
                      <button
                        onClick={() => handleToggleBlock('unblock')}
                        disabled={blocking}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                      >
                        <Unlock className="h-4 w-4" />
                        <span>Unblock Seat {selectedSeat}</span>
                      </button>
                    )}

                    {currentSeatStatus === 'Booked' && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                        This seat is actively booked. To free or block this seat, please cancel the corresponding booking first.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                <Armchair className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                Select any seat from the bus diagram to view passenger info, deck position, or manage administrative block status.
              </div>
            )}
          </div>

          {/* Occupancy Summary Box */}
          {tripDetails && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm text-xs space-y-2">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Trip Seat Summary
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-emerald-50 p-2 border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 block">Available</span>
                  <span className="font-black text-emerald-950 text-sm">
                    {tripDetails.stats?.availableSeats || 0}
                  </span>
                </div>
                <div className="rounded-xl bg-blue-50 p-2 border border-blue-100">
                  <span className="text-[10px] text-blue-700 block">Booked</span>
                  <span className="font-black text-blue-950 text-sm">
                    {tripDetails.stats?.bookedSeats || 0}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-100 p-2 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Blocked</span>
                  <span className="font-black text-slate-800 text-sm">
                    {tripDetails.stats?.blockedSeats || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatManagement;
