import React, { useState } from 'react';
import { AlertTriangle, X, Check, RefreshCw } from 'lucide-react';
import api from '../services/api';

const CancelModal = ({ booking, onClose, onSuccess }) => {
  const [reason, setReason] = useState('Passenger requested cancellation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!booking) return null;

  const cancellationCharge = Math.round((booking.finalAmount * 0.15));
  const refundAmount = booking.finalAmount - cancellationCharge;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post(`/bookings/${booking.id}/cancel`, { reason });
      if (res.success) {
        if (onSuccess) onSuccess(res.booking);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Cancel Ticket Booking</h3>
            <p className="text-xs text-slate-500">Ticket: {booking.ticketNumber}</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Booking Details Preview */}
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Passenger</span>
            <span className="font-bold text-slate-800">{booking.passengerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Route & Bus</span>
            <span className="font-semibold text-slate-800">{booking.fromCity} ➔ {booking.toCity} ({booking.busNumber})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Assigned Seat</span>
            <span className="font-bold text-emerald-700">Seat {booking.seatNumber}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold">
            <span className="text-slate-500">Original Amount Paid</span>
            <span className="text-slate-900">₹{booking.finalAmount}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Cancellation Fee (15%)</span>
            <span>-₹{cancellationCharge}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-emerald-700">
            <span>Refund Amount to Customer</span>
            <span>₹{refundAmount}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Cancellation Reason
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for cancelling ticket..."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Keep Ticket
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-md shadow-red-600/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm & Release Seat</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelModal;
