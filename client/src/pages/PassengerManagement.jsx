import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  IndianRupee, 
  Ticket, 
  Eye, 
  RefreshCw, 
  X,
  History
} from 'lucide-react';
import api from '../services/api';

const PassengerManagement = ({ onViewTicket }) => {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPax, setSelectedPax] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchPassengers = async () => {
    setLoading(true);
    try {
      let url = '/passengers?';
      if (search) url += `search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.success) {
        setPassengers(res.passengers || []);
      }
    } catch (err) {
      console.error('Failed to load passengers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassengers();
  }, []);

  const handleViewHistory = async (paxId) => {
    setLoadingHistory(true);
    try {
      const res = await api.get(`/passengers/${paxId}`);
      if (res.success) {
        setSelectedPax(res.passenger);
      }
    } catch (err) {
      alert('Failed to load passenger history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl flex items-center gap-2.5">
            <UserCheck className="h-6 w-6 text-emerald-600" />
            <span>Passenger CRM & Journey Profiles</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer directory, loyalty trip metrics, lifetime revenue, and complete booking histories
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search passenger by full name, mobile number, or email..."
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            onClick={fetchPassengers}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Search
          </button>
        </div>
      </div>

      {/* Passengers Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Passenger Name</th>
                <th className="py-3.5 px-4">Contact Phone</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4 text-center">Age / Gender</th>
                <th className="py-3.5 px-4 text-center">Total Trips</th>
                <th className="py-3.5 px-4 text-right">Lifetime Spent</th>
                <th className="py-3.5 px-4 text-center">Last Journey</th>
                <th className="py-3.5 px-4 text-center">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Loading passenger directory...
                  </td>
                </tr>
              ) : passengers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No passengers found.
                  </td>
                </tr>
              ) : (
                passengers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-slate-900">{p.name}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {p.mobile}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {p.email || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-700">
                      {p.age || 30} Yrs / {p.gender || 'Male'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        {p.totalTrips || 1} Trips
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      ₹{(p.totalAmountSpent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-600 font-mono text-[11px]">
                      {p.lastJourneyDate || '2026-10-05'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleViewHistory(p.id)}
                        className="flex items-center gap-1 mx-auto rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>History</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Passenger Booking History Modal */}
      {selectedPax && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl my-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedPax(null)}
              className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">{selectedPax.name}</h3>
                <p className="text-xs text-slate-500">{selectedPax.mobile} • {selectedPax.email || 'No email'}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Lifetime Total</span>
                <span className="text-base font-black text-emerald-700">
                  ₹{(selectedPax.totalAmountSpent || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="my-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <History className="h-4 w-4 text-emerald-600" />
                <span>Journey & Booking Records ({selectedPax.bookingHistory?.length || 0})</span>
              </h4>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/50 p-2">
                {(selectedPax.bookingHistory || []).length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">No booking history recorded.</p>
                ) : (
                  selectedPax.bookingHistory.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 text-xs hover:bg-white rounded-xl transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-700">{b.ticketNumber}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800 mt-0.5">{b.fromCity} ➔ {b.toCity}</p>
                        <p className="text-[10px] text-slate-400">{b.journeyDate} • Seat {b.seatNumber} ({b.busNumber})</p>
                      </div>

                      <div className="text-right">
                        <p className="font-black text-slate-900">₹{b.finalAmount}</p>
                        <button
                          onClick={() => {
                            if (onViewTicket) onViewTicket(b);
                          }}
                          className="mt-1 text-[11px] font-bold text-emerald-600 hover:underline"
                        >
                          View Pass
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                onClick={() => setSelectedPax(null)}
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

export default PassengerManagement;
