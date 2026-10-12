import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  IndianRupee, 
  Armchair, 
  CalendarDays, 
  PlusCircle, 
  BookmarkCheck, 
  Eye, 
  ArrowRight,
  Bus,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import StatCard from '../components/StatCard';
import api from '../services/api';

const WorkerDashboard = ({ onNavigate, onViewTicket, onBookTrip }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkerDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/worker');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load worker dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerDashboard();
  }, []);

  const summary = data?.summary || {};
  const todayTrips = data?.todayTrips || [];
  const myRecentBookings = data?.myRecentBookings || [];

  return (
    <div className="space-y-6 pb-10">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-200">
              Booking Counter Desk
            </span>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl tracking-tight">
              Welcome, {data?.worker?.name || 'Staff Member'}!
            </h2>
            <p className="mt-1 text-xs text-emerald-100">
              Employee ID: {data?.worker?.employeeId} | Counter Desk Operations
            </p>
          </div>

          <button
            onClick={() => onNavigate('booking')}
            className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-emerald-800 shadow-xl hover:bg-emerald-50 active:scale-95 transition-all"
          >
            <PlusCircle className="h-5 w-5 text-emerald-600" />
            <span>Book New Ticket</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Tickets Sold"
          value={`${summary.todayTickets || 0} Tickets`}
          subtext="Confirmed ticket issues today"
          icon={Ticket}
          color="emerald"
        />
        <StatCard
          title="Today's Cash Collection"
          value={`₹${(summary.cashCollected || 0).toLocaleString('en-IN')}`}
          subtext="Cash in counter drawer"
          icon={IndianRupee}
          color="blue"
        />
        <StatCard
          title="Today's Digital / UPI"
          value={`₹${(summary.digitalCollected || 0).toLocaleString('en-IN')}`}
          subtext="UPI & Online payments"
          icon={IndianRupee}
          color="indigo"
        />
        <StatCard
          title="Lifetime Sales"
          value={`₹${(summary.lifetimeRevenue || 0).toLocaleString('en-IN')}`}
          subtext={`${summary.lifetimeTickets || 0} Total Lifetime Tickets`}
          icon={BookmarkCheck}
          color="amber"
        />
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('booking')}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-center hover:bg-emerald-100/70 transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
            <PlusCircle className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-emerald-950">New Booking</span>
        </button>

        <button
          onClick={() => onNavigate('bookings')}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-center hover:bg-blue-100/70 transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 group-hover:scale-110 transition-transform">
            <BookmarkCheck className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-blue-950">My Tickets</span>
        </button>

        <button
          onClick={() => onNavigate('trips')}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-purple-200 bg-purple-50/70 p-4 text-center hover:bg-purple-100/70 transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/20 group-hover:scale-110 transition-transform">
            <CalendarDays className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-purple-950">View Trips</span>
        </button>

        <button
          onClick={() => onNavigate('seats')}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-center hover:bg-amber-100/70 transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-md shadow-amber-600/20 group-hover:scale-110 transition-transform">
            <Armchair className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-amber-950">Seat Availability</span>
        </button>
      </div>

      {/* Today's Active Trips for Worker */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bus className="h-4 w-4 text-emerald-600" />
              <span>Today's Available Bus Departures</span>
            </h3>
            <p className="text-xs text-slate-500">Live trip list & seat occupancy</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
            {todayTrips.length} Active Trips
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {todayTrips.map((trip) => {
            const booked = trip.bookedSeats?.length || 0;
            const available = Math.max(0, trip.totalSeats - booked);

            return (
              <div
                key={trip.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:border-emerald-400 hover:bg-white transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-700">{trip.tripNumber}</span>
                    <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {trip.status}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-sm mt-1">
                    {trip.from} ➔ {trip.to}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">{trip.busNumber} • {trip.busName}</p>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 border-t border-slate-200/60 pt-2">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Departure: {trip.departureTime}
                    </span>
                    <span className="font-bold text-emerald-700">₹{trip.ticketPrice} / Seat</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                  <div className="text-xs">
                    <span className="font-bold text-slate-800">{available} Seats Free</span>
                    <span className="text-[10px] text-slate-400 block">({booked}/{trip.totalSeats} Booked)</span>
                  </div>

                  <button
                    onClick={() => {
                      if (onBookTrip) onBookTrip(trip);
                      else onNavigate('booking');
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                  >
                    <span>Book Seat</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Worker's Recent Bookings */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-emerald-600" />
              <span>My Recent Issued Tickets</span>
            </h3>
            <p className="text-xs text-slate-500">Tickets booked under your account</p>
          </div>
          <button
            onClick={() => onNavigate('bookings')}
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            View All
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Ticket No</th>
                <th className="py-2.5 px-3">Passenger</th>
                <th className="py-2.5 px-3">Journey</th>
                <th className="py-2.5 px-3 text-center">Seat</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myRecentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                    {b.ticketNumber}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {b.passengerName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {b.fromCity} ➔ {b.toCity}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-700">
                    {b.seatNumber}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-900">
                    ₹{b.finalAmount} ({b.paymentMethod})
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onViewTicket(b)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-700"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
