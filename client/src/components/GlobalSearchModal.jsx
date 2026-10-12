import React, { useState, useEffect } from 'react';
import { Search, X, Ticket, Bus, MapPin, User, Users, Calendar, ArrowRight } from 'lucide-react';
import api from '../services/api';

const GlobalSearchModal = ({ isOpen, onClose, onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    bookings: [],
    buses: [],
    routes: [],
    passengers: [],
    workers: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ bookings: [], buses: [], routes: [], passengers: [], workers: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [bookingsRes, busesRes, routesRes, paxRes] = await Promise.all([
          api.get(`/bookings?search=${encodeURIComponent(query)}&limit=5`),
          api.get(`/buses?search=${encodeURIComponent(query)}`),
          api.get(`/routes?search=${encodeURIComponent(query)}`),
          api.get(`/passengers?search=${encodeURIComponent(query)}`)
        ]);

        setResults({
          bookings: bookingsRes.bookings || [],
          buses: busesRes.buses || [],
          routes: routesRes.routes || [],
          passengers: paxRes.passengers?.slice(0, 5) || [],
          workers: []
        });
      } catch (err) {
        console.warn('Search query error', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = results.bookings.length + results.buses.length + results.routes.length + results.passengers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-4 pt-20 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-200 px-5 py-4 bg-slate-50/50">
          <Search className="h-5 w-5 text-emerald-600 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type ticket number, passenger name, mobile, bus, route..."
            className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="mr-2 rounded-lg p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 shadow-sm">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="py-8 text-center text-xs font-semibold text-slate-400">
              Searching database...
            </div>
          )}

          {!loading && !query && (
            <div className="py-8 text-center text-xs text-slate-400">
              Search by Ticket Number (e.g., TKT-20261005-0001), Bus Number (MH-26), City, or Passenger Mobile
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="py-8 text-center text-xs font-semibold text-slate-400">
              No matching records found for "{query}"
            </div>
          )}

          {/* Bookings & Tickets */}
          {results.bookings.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
                Tickets & Bookings
              </span>
              <div className="space-y-1">
                {results.bookings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSelectResult({ type: 'booking', data: b });
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-2.5 text-xs hover:bg-emerald-50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <Ticket className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-emerald-800">
                          {b.ticketNumber} — {b.passengerName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {b.fromCity} ➔ {b.toCity} | Seat {b.seatNumber} | ₹{b.finalAmount}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buses */}
          {results.buses.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
                Buses
              </span>
              <div className="space-y-1">
                {results.buses.map((bus) => (
                  <button
                    key={bus.id}
                    onClick={() => {
                      onSelectResult({ type: 'bus', data: bus });
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-2.5 text-xs hover:bg-blue-50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        <Bus className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-blue-800">
                          {bus.busNumber} — {bus.busName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {bus.busType} | {bus.totalSeats} Seats | Status: {bus.status}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Routes */}
          {results.routes.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
                Routes
              </span>
              <div className="space-y-1">
                {results.routes.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onSelectResult({ type: 'route', data: r });
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-2.5 text-xs hover:bg-amber-50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-amber-800">
                          {r.routeName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {r.distance} | {r.estimatedTravelTime} | Fare: ₹{r.ticketPrice}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Passengers */}
          {results.passengers.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
                Passengers
              </span>
              <div className="space-y-1">
                {results.passengers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectResult({ type: 'passenger', data: p });
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-2.5 text-xs hover:bg-purple-50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-purple-800">
                          {p.name} ({p.mobile})
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {p.totalTrips} Trips | Total Spent: ₹{p.totalAmountSpent}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
