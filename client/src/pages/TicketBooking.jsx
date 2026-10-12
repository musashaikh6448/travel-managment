import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Bus, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  CheckCircle2, 
  IndianRupee, 
  Tag, 
  RefreshCw,
  Sparkles,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import SeatPicker from '../components/SeatPicker';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TicketBooking = ({ selectedTripProp, onBookingSuccess }) => {
  const { user, isAdmin } = useAuth();
  const [trips, setTrips] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(selectedTripProp?.id || '');
  const [tripDetails, setTripDetails] = useState(null);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [selectedSeat, setSelectedSeat] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [passengerMobile, setPassengerMobile] = useState('');
  const [passengerAge, setPassengerAge] = useState('30');
  const [passengerGender, setPassengerGender] = useState('Male');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [bookingSource, setBookingSource] = useState('Counter');
  const [selectedWorkerId, setSelectedWorkerId] = useState(user?.id || '');

  // Load trips
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingTrips(true);
      try {
        const [tripsRes, workersRes] = await Promise.all([
          api.get('/trips?status=Scheduled&date=2026-10-05'),
          isAdmin ? api.get('/workers?status=Active') : Promise.resolve({ workers: [] })
        ]);

        const allTrips = tripsRes.trips || [];
        setTrips(allTrips);
        if (workersRes.workers) setWorkers(workersRes.workers);

        if (selectedTripProp?.id) {
          setSelectedTripId(selectedTripProp.id);
        } else if (allTrips.length > 0 && !selectedTripId) {
          setSelectedTripId(allTrips[0].id);
        }
      } catch (err) {
        console.error('Failed to load trips for booking:', err);
      } finally {
        setLoadingTrips(false);
      }
    };
    fetchInitialData();
  }, [selectedTripProp, isAdmin]);

  // Load detailed trip data with live seat map whenever trip changes
  useEffect(() => {
    if (!selectedTripId) return;

    const fetchTripDetails = async () => {
      setLoadingDetails(true);
      setSelectedSeat('');
      try {
        const res = await api.get(`/trips/${selectedTripId}`);
        if (res.success) {
          setTripDetails(res.trip);
        }
      } catch (err) {
        console.error('Failed to load trip seat map:', err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchTripDetails();
  }, [selectedTripId]);

  // Passenger Auto-fill on phone input
  const handlePhoneBlur = async () => {
    if (passengerMobile.length >= 10) {
      try {
        const res = await api.get(`/passengers?search=${encodeURIComponent(passengerMobile)}`);
        if (res.success && res.passengers?.length > 0) {
          const match = res.passengers.find(p => p.mobile === passengerMobile.trim());
          if (match) {
            setPassengerName(match.name);
            setPassengerAge(match.age || '30');
            setPassengerGender(match.gender || 'Male');
            if (match.email) setPassengerEmail(match.email);
          }
        }
      } catch (err) {
        // ignore
      }
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSeat) {
      setError('Please select a seat from the visual bus layout before booking.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        tripId: selectedTripId,
        passengerName,
        passengerMobile,
        passengerAge: parseInt(passengerAge, 10),
        passengerGender,
        passengerEmail,
        seatNumber: selectedSeat,
        discount: parseFloat(discount) || 0,
        paymentMethod,
        bookingSource,
        workerId: isAdmin ? selectedWorkerId : user?.id
      };

      const res = await api.post('/bookings', payload);
      if (res.success) {
        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }

        // Reset form
        setSelectedSeat('');
        setPassengerName('');
        setPassengerMobile('');
        setDiscount(0);

        if (onBookingSuccess) {
          onBookingSuccess(res.booking);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to complete booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const ticketPrice = tripDetails?.ticketPrice || 650;
  const numericDiscount = parseFloat(discount) || 0;
  const finalFare = Math.max(0, ticketPrice - numericDiscount);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl flex items-center gap-2.5">
            <Ticket className="h-6 w-6 text-emerald-600" />
            <span>Fast Ticket Booking Console</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select bus departure, choose interactive seat, and issue instant boarding pass
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-700 border border-red-200 animate-in fade-in flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-800">Dismiss</button>
        </div>
      )}

      {/* Booking Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Trip Selector & Visual Seat Layout (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Trip Picker Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Select Scheduled Trip / Bus Route
            </label>

            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.from} ➔ {t.to} ({t.busNumber} • {t.busName}) | Dept: {t.departureTime} | ₹{t.ticketPrice}
                </option>
              ))}
            </select>

            {tripDetails && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl bg-emerald-50/60 p-3 border border-emerald-100 text-xs">
                <div>
                  <span className="text-emerald-700 text-[10px] font-semibold block">Bus Model</span>
                  <span className="font-bold text-emerald-950">{tripDetails.busName}</span>
                </div>
                <div>
                  <span className="text-emerald-700 text-[10px] font-semibold block">Departure</span>
                  <span className="font-bold text-emerald-950">{tripDetails.departureTime}</span>
                </div>
                <div>
                  <span className="text-emerald-700 text-[10px] font-semibold block">Available Seats</span>
                  <span className="font-bold text-emerald-950">
                    {tripDetails.stats?.availableSeats || 0} / {tripDetails.totalSeats} Free
                  </span>
                </div>
                <div>
                  <span className="text-emerald-700 text-[10px] font-semibold block">Base Ticket Price</span>
                  <span className="font-extrabold text-emerald-900">₹{tripDetails.ticketPrice}</span>
                </div>
              </div>
            )}
          </div>

          {/* Live Interactive Seat Map */}
          {loadingDetails ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-xs font-semibold text-slate-400 shadow-sm">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
              Loading real-time bus seat availability...
            </div>
          ) : (
            <SeatPicker
              totalSeats={tripDetails?.totalSeats || 40}
              seatLayoutType={tripDetails?.seatLayoutType || '2x2'}
              bookedSeats={tripDetails?.bookedSeats || []}
              blockedSeats={tripDetails?.blockedSeats || []}
              seatMap={tripDetails?.seatMap || []}
              selectedSeat={selectedSeat}
              onSelectSeat={(seatNum) => {
                setSelectedSeat(seatNum);
                setError('');
              }}
              ticketPrice={ticketPrice}
            />
          )}
        </div>

        {/* Right Column: Passenger Details & Payment Checkout Form (5 cols) */}
        <div className="lg:col-span-5">
          <form onSubmit={handleBookingSubmit} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-600" />
                <span>Passenger & Fare Details</span>
              </span>
              {selectedSeat && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  Seat: {selectedSeat}
                </span>
              )}
            </h3>

            {/* Mobile Number & Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Mobile Number (Lookup Auto-fill)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={passengerMobile}
                  onChange={(e) => setPassengerMobile(e.target.value)}
                  onBlur={handlePhoneBlur}
                  placeholder="e.g. 9823112233"
                  className="w-full rounded-xl border border-slate-300 p-2.5 pl-9 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Passenger Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="e.g. Rameshwar Shinde"
                  className="w-full rounded-xl border border-slate-300 p-2.5 pl-9 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  min="1"
                  max="110"
                  required
                  value={passengerAge}
                  onChange={(e) => setPassengerAge(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Gender
                </label>
                <select
                  value={passengerGender}
                  onChange={(e) => setPassengerGender(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={passengerEmail}
                  onChange={(e) => setPassengerEmail(e.target.value)}
                  placeholder="passenger@gmail.com"
                  className="w-full rounded-xl border border-slate-300 p-2.5 pl-9 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Method & Booking Source */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cash">Cash at Counter</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Online">Online Portal</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Booking Source
                </label>
                <select
                  value={bookingSource}
                  onChange={(e) => setBookingSource(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Counter">Counter Desk</option>
                  <option value="Worker">Bus Staff / Conductor</option>
                  <option value="Website">Official Website</option>
                  <option value="Phone">Phone Booking</option>
                  <option value="Agent">Travel Agent</option>
                </select>
              </div>
            </div>

            {/* Admin Worker Attribution */}
            {isAdmin && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Attributed Booking Worker
                </label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none"
                >
                  <option value={user?.id}>Admin ({user?.name})</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.employeeId})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Discount & Fare Computation */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Standard Seat Fare</span>
                <span className="font-bold text-slate-800">₹{ticketPrice}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  max={ticketPrice}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-right text-xs font-bold text-slate-900"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                <span>Final Payable Amount</span>
                <span className="text-emerald-700 text-base">₹{finalFare}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !selectedSeat}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-emerald-600/30 hover:from-emerald-700 hover:to-green-800 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Issuing Ticket...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Confirm & Issue Ticket (Seat {selectedSeat || '?'})</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketBooking;
