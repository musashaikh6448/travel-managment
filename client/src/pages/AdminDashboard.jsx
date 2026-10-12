import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  IndianRupee, 
  Receipt, 
  TrendingUp, 
  Armchair, 
  Bus, 
  Users, 
  Calendar, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Eye,
  CreditCard,
  PieChart,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import StatCard from '../components/StatCard';
import api from '../services/api';

const AdminDashboard = ({ onNavigate, onViewTicket }) => {
  const [filter, setFilter] = useState('today');
  const [customDate, setCustomDate] = useState('2026-10-05');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      let url = `/dashboard/admin?filter=${filter}`;
      if (filter === 'custom' && customDate) {
        url += `&customDate=${customDate}`;
      }
      const res = await api.get(url);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filter, customDate]);

  const summary = data?.summary || {};
  const busPerformance = data?.busPerformance || [];
  const workerPerformance = data?.workerPerformance || [];
  const bookingSources = data?.bookingSources || [];
  const paymentCollection = data?.paymentCollection || [];
  const trendData = data?.trendData || [];
  const recentBookings = data?.recentBookings || [];

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header & Date Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl">
            Executive Operations Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time fleet performance, passenger bookings, cash flows, and profit analytics
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white p-1.5 shadow-sm border border-slate-200">
          <button
            onClick={() => setFilter('today')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              filter === 'today'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter('yesterday')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              filter === 'yesterday'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Yesterday
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              filter === 'week'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setFilter('month')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              filter === 'month'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            This Month
          </button>

          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setFilter('custom');
              }}
              className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={fetchDashboardData}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-700"
              title="Refresh Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Top Summary Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Revenue"
          value={`₹${(summary.totalRevenue || 0).toLocaleString('en-IN')}`}
          subtext={`Gross: ₹${(summary.grossTicketRevenue || 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="emerald"
          trend={12.4}
        />
        <StatCard
          title="Today's Expenses"
          value={`₹${(summary.totalExpenses || 0).toLocaleString('en-IN')}`}
          subtext="Fuel, Salaries, Toll & Maintenance"
          icon={Receipt}
          color="rose"
        />
        <StatCard
          title="Net Operating Profit"
          value={`₹${(summary.netProfit || 0).toLocaleString('en-IN')}`}
          subtext={`Profit Margin: ${summary.profitMargin || 0}%`}
          icon={TrendingUp}
          color={summary.netProfit >= 0 ? 'emerald' : 'rose'}
          trend={summary.profitMargin || 0}
        />
        <StatCard
          title="Tickets & Seats"
          value={`${summary.ticketsSold || 0} Sold`}
          subtext={`Occupancy: ${summary.occupancyPercentage || 0}% (${summary.occupiedSeats || 0}/${summary.totalCapacity || 0} Seats)`}
          icon={Armchair}
          color="blue"
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Seats</span>
          <p className="text-xl font-black text-emerald-600 mt-1">{summary.availableSeats || 0}</p>
          <span className="text-[10px] text-slate-500">Across scheduled trips</span>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Fleet</span>
          <p className="text-xl font-black text-slate-800 mt-1">{summary.activeBuses || 0} / {summary.totalBuses || 0}</p>
          <span className="text-[10px] text-slate-500">Buses running on routes</span>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Staff</span>
          <p className="text-xl font-black text-indigo-600 mt-1">{summary.totalWorkers || 0}</p>
          <span className="text-[10px] text-slate-500">Booking staff & workers</span>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cancellations</span>
          <p className="text-xl font-black text-amber-600 mt-1">{summary.cancelledBookings || 0}</p>
          <span className="text-[10px] text-slate-500">Cancelled ticket requests</span>
        </div>
      </div>

      {/* Charts & Analytical Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Expenses Trend Visual */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-emerald-600" />
                <span>Daily Financial & Occupancy Trend</span>
              </h3>
              <p className="text-xs text-slate-500">Revenue, Expense, and Net Profit trajectory</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
              5-Day Overview
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {trendData.map((day) => {
              const maxVal = Math.max(...trendData.map(d => Math.max(d.revenue, d.expenses))) || 100000;
              const revWidth = `${Math.min(100, Math.round((day.revenue / maxVal) * 100))}%`;
              const expWidth = `${Math.min(100, Math.round((day.expenses / maxVal) * 100))}%`;

              return (
                <div key={day.date} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-700">
                    <span className="font-mono text-slate-900">{day.date} ({day.tickets} Tickets)</span>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-700 font-bold">₹{day.revenue.toLocaleString('en-IN')}</span>
                      <span className="text-rose-600">₹{day.expenses.toLocaleString('en-IN')}</span>
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        Profit: ₹{day.profit.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar */}
                  <div className="space-y-1">
                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500"
                        style={{ width: revWidth }}
                      />
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-rose-500 transition-all duration-500"
                        style={{ width: expWidth }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-center gap-6 border-t border-slate-100 pt-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span>Ticket Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              <span>Bus Expenses</span>
            </div>
          </div>
        </div>

        {/* Booking Sources & Payment Breakdown */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
          {/* Booking Sources */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <PieChart className="h-4 w-4 text-emerald-600" />
              <span>Booking Sources</span>
            </h3>
            <div className="mt-3 space-y-2 text-xs">
              {bookingSources.map((src) => (
                <div key={src.source} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">{src.source}</span>
                    <span className="text-slate-900 font-bold">{src.count} Tix ({src.percentage}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{ width: `${src.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <span>Payment Methods</span>
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {paymentCollection.map((pay) => (
                <div key={pay.method} className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium block">{pay.method}</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                    ₹{pay.amount.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-600">{pay.percentage}% of Total</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row: Bus Performance & Worker Sales Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bus Performance Table */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bus className="h-4 w-4 text-emerald-600" />
                <span>Bus-wise Fleet Performance</span>
              </h3>
              <p className="text-xs text-slate-500">Occupancy & net revenue per vehicle</p>
            </div>
            <button
              onClick={() => onNavigate('buses')}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              View All Buses
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Bus Details</th>
                  <th className="py-2.5 px-3 text-center">Occupancy</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {busPerformance.map((b) => (
                  <tr key={b.busId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900">{b.busNumber}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{b.busName}</p>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 font-bold text-[10px] ${
                        b.occupancyRate >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {b.occupiedSeats}/{b.totalSeats} ({b.occupancyRate}%)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ₹{b.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                      ₹{b.profit.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Worker-wise Ticket Sales Leaderboard */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                <span>Worker & Staff Sales Leaderboard</span>
              </h3>
              <p className="text-xs text-slate-500">Individual ticket sales and collections</p>
            </div>
            <button
              onClick={() => onNavigate('workers')}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              View All Workers
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Staff Member</th>
                  <th className="py-2.5 px-3 text-center">Confirmed</th>
                  <th className="py-2.5 px-3 text-center">Cancelled</th>
                  <th className="py-2.5 px-3 text-right">Net Collection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workerPerformance.slice(0, 6).map((w, idx) => (
                  <tr key={w.workerId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 font-bold text-[10px] text-slate-600">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{w.workerName}</p>
                          <p className="text-[10px] text-slate-400">{w.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700">
                      {w.confirmedTickets} Tix
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-400">
                      {w.cancelledTickets || 0}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900">
                      ₹{w.revenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Live Bookings Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-emerald-600" />
              <span>Recent Live Bookings</span>
            </h3>
            <p className="text-xs text-slate-500">Real-time ticket issue stream</p>
          </div>
          <button
            onClick={() => onNavigate('bookings')}
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            Manage All Bookings
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Ticket / PNR</th>
                <th className="py-2.5 px-3">Passenger</th>
                <th className="py-2.5 px-3">Journey & Bus</th>
                <th className="py-2.5 px-3 text-center">Seat</th>
                <th className="py-2.5 px-3 text-right">Fare</th>
                <th className="py-2.5 px-3">Booked By</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                    {b.ticketNumber}
                  </td>
                  <td className="py-2.5 px-3">
                    <p className="font-bold text-slate-900">{b.passengerName}</p>
                    <p className="text-[10px] text-slate-400">{b.passengerMobile}</p>
                  </td>
                  <td className="py-2.5 px-3">
                    <p className="font-semibold text-slate-800">{b.fromCity} ➔ {b.toCity}</p>
                    <p className="text-[10px] text-slate-500">{b.busNumber}</p>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="rounded-lg bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 text-[11px]">
                      {b.seatNumber}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-900">
                    ₹{b.finalAmount}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {b.workerName} <span className="text-[10px] text-slate-400">({b.bookingSource})</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onViewTicket(b)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-700 transition-colors"
                      title="View & Print Ticket"
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

export default AdminDashboard;
