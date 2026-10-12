import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Printer, 
  Ban, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';

const BookingsManagement = ({ onViewTicket, onCancelTicket, onNavigate }) => {
  const [bookings, setBookings] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [busId, setBusId] = useState('all');
  const [source, setSource] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let query = `/bookings?page=${page}&limit=15`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (status !== 'all') query += `&status=${status}`;
      if (busId !== 'all') query += `&busId=${busId}`;
      if (source !== 'all') query += `&source=${source}`;
      if (paymentMethod !== 'all') query += `&paymentMethod=${paymentMethod}`;
      if (date) query += `&date=${date}`;

      const res = await api.get(query);
      if (res.success) {
        setBookings(res.bookings || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await api.get('/buses');
        if (res.buses) setBuses(res.buses);
      } catch (err) {
        // ignore
      }
    };
    fetchBuses();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [page, status, busId, source, paymentMethod, date]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) return;
    const headers = ['Ticket Number', 'Passenger Name', 'Mobile', 'From', 'To', 'Bus', 'Seat', 'Amount', 'Payment', 'Source', 'Worker', 'Status', 'Date'];
    const rows = bookings.map(b => [
      b.ticketNumber,
      `"${b.passengerName}"`,
      b.passengerMobile,
      b.fromCity,
      b.toCity,
      b.busNumber,
      b.seatNumber,
      b.finalAmount,
      b.paymentMethod,
      b.bookingSource,
      `"${b.workerName}"`,
      b.status,
      b.journeyDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TMS_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl flex items-center gap-2.5">
            <Ticket className="h-6 w-6 text-emerald-600" />
            <span>Bookings & Ticket Records</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, filter, view, print boarding passes, or manage cancellations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => onNavigate('booking')}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
          >
            <span>+ New Ticket</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2.5">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket no, name, phone, seat..."
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={busId}
            onChange={(e) => { setBusId(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Buses</option>
            {buses.map(b => (
              <option key={b.id} value={b.id}>{b.busNumber}</option>
            ))}
          </select>

          <select
            value={paymentMethod}
            onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Payments</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Online">Online</option>
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
          />

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Search
          </button>
          {(search || status !== 'all' || busId !== 'all' || paymentMethod !== 'all' || date) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatus('all');
                setBusId('all');
                setPaymentMethod('all');
                setDate('');
                setPage(1);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Bookings Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Ticket / PNR</th>
                <th className="py-3.5 px-4">Passenger Details</th>
                <th className="py-3.5 px-4">Route & Bus</th>
                <th className="py-3.5 px-4 text-center">Journey Date</th>
                <th className="py-3.5 px-4 text-center">Seat</th>
                <th className="py-3.5 px-4 text-right">Fare Paid</th>
                <th className="py-3.5 px-4 text-center">Source</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Loading booking records...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No tickets found matching current filters.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-emerald-700">{b.ticketNumber}</span>
                      <span className="text-[10px] text-slate-400 block">{b.bookingNumber}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{b.passengerName}</p>
                      <p className="text-[10px] text-slate-400">{b.passengerMobile} ({b.passengerGender?.charAt(0)})</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{b.fromCity} ➔ {b.toCity}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{b.busNumber}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-700">
                      {b.journeyDate}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="rounded-lg bg-emerald-100 px-2 py-0.5 font-extrabold text-emerald-800 text-xs">
                        {b.seatNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <p className="font-black text-slate-900">₹{b.finalAmount}</p>
                      <span className="text-[10px] text-slate-400">{b.paymentMethod}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-600">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold">
                        {b.bookingSource || 'Counter'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        b.status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {b.status === 'Confirmed' ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onViewTicket(b)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-700"
                          title="View & Print Ticket"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {b.status === 'Confirmed' && onCancelTicket && (
                          <button
                            onClick={() => onCancelTicket(b)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Cancel Ticket & Refund"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-3 text-xs text-slate-500">
          <span>Showing {bookings.length} of {totalCount} total bookings</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-300 bg-white p-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-bold text-slate-800">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-300 bg-white p-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsManagement;
