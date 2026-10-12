import React from 'react';
import { 
  X, 
  Printer, 
  Bus, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Phone
} from 'lucide-react';

const TicketModal = ({ booking, onClose, onCancelTicket, canCancel = true }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const isCancelled = booking.status === 'Cancelled';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Modal Top Header (No print) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white no-print">
          <div className="flex items-center gap-2.5">
            <Bus className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-base">E-Ticket & Boarding Pass</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>Print Ticket</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Area */}
        <div id="printable-ticket" className="p-6 sm:p-8 bg-white text-slate-900">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-900 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
                  <Bus className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                  Royal Express Travels
                </h2>
              </div>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                Central Bus Station Complex, Airport Road, Nanded - 431605 | Helpline: +91 98765 43210
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block rounded-lg bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-slate-800 border border-slate-200">
                {booking.ticketNumber}
              </div>
              <div className="mt-1.5 flex items-center justify-end gap-1.5">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  isCancelled ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isCancelled ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                  {booking.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Journey Highlight Banner */}
          <div className="my-6 rounded-2xl bg-gradient-to-r from-emerald-700 to-green-800 p-5 text-white shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">ORIGIN</span>
                <p className="text-xl font-black">{booking.fromCity}</p>
                <p className="text-xs text-emerald-100">{booking.departureTime || '21:00'}</p>
              </div>

              <div className="flex flex-col items-center px-4">
                <span className="text-xs font-semibold text-emerald-200">Direct Express</span>
                <div className="my-1 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-300" />
                  <div className="h-0.5 w-16 sm:w-24 bg-emerald-300/60" />
                  <Bus className="h-4 w-4 text-white" />
                  <div className="h-0.5 w-16 sm:w-24 bg-emerald-300/60" />
                  <div className="h-2 w-2 rounded-full bg-emerald-300" />
                </div>
                <span className="text-[10px] text-emerald-200 font-medium">Journey Date: {booking.journeyDate}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">DESTINATION</span>
                <p className="text-xl font-black">{booking.toCity}</p>
                <p className="text-xs text-emerald-100">{booking.arrivalTime || '05:30'}</p>
              </div>
            </div>
          </div>

          {/* Passenger & Bus Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-200 pb-6 text-xs">
            <div className="space-y-2 rounded-xl bg-slate-50 p-4 border border-slate-100">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-emerald-600" />
                <span>Passenger Information</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 pt-1 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Name</span>
                  <span className="font-bold text-slate-900">{booking.passengerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Mobile</span>
                  <span className="font-semibold text-slate-900">{booking.passengerMobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Age / Gender</span>
                  <span className="font-medium text-slate-900">{booking.passengerAge || 28} Yrs / {booking.passengerGender || 'Male'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Booking Source</span>
                  <span className="font-medium text-slate-900">{booking.bookingSource || 'Counter'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded-xl bg-slate-50 p-4 border border-slate-100">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Bus className="h-3.5 w-3.5 text-emerald-600" />
                <span>Bus & Boarding Details</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 pt-1 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Bus Number</span>
                  <span className="font-bold text-slate-900">{booking.busNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Bus Model</span>
                  <span className="font-semibold text-slate-900 truncate">{booking.busName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px]">Boarding Point</span>
                  <span className="font-medium text-slate-900">{booking.boardingPoint || 'Central Bus Station Corner'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seat & Payment Section */}
          <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Seat Badge */}
            <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                ASSIGNED SEAT NO
              </span>
              <p className="text-4xl font-black text-emerald-700 tracking-tight mt-1">
                {booking.seatNumber}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">Lower/Upper Deck</span>
            </div>

            {/* Fare Breakdown */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs space-y-1.5 sm:col-span-2">
              <div className="flex justify-between text-slate-500">
                <span>Base Ticket Fare</span>
                <span>₹{booking.ticketPrice}</span>
              </div>
              {booking.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Special Discount</span>
                  <span>-₹{booking.discount}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm font-black text-slate-900">
                <span>Total Paid Amount</span>
                <span className="text-emerald-700">₹{booking.finalAmount}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Payment Mode: <strong>{booking.paymentMethod}</strong></span>
                <span>Issued By: <strong>{booking.workerName || 'Staff'}</strong></span>
              </div>
            </div>
          </div>

          {/* Cancellation Notice if cancelled */}
          {isCancelled && booking.cancellationDetails && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900">
              <h5 className="font-bold flex items-center gap-1.5 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span>Ticket Cancellation Record</span>
              </h5>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>Reason: <strong>{booking.cancellationDetails.reason}</strong></div>
                <div>Cancellation Charge: <strong>₹{booking.cancellationDetails.cancellationCharge}</strong></div>
                <div>Refund Amount: <strong>₹{booking.cancellationDetails.refundAmount}</strong></div>
              </div>
            </div>
          )}

          {/* Bottom Bar: Terms & QR Aesthetic */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4 text-[11px] text-slate-500">
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-700">Important Instructions:</p>
              <p>• Please report at boarding point 15 mins prior to departure.</p>
              <p>• Valid Gov ID proof is mandatory during journey.</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <QrCode className="h-10 w-10 text-slate-800" />
              <div className="text-[9px] font-mono text-slate-500">
                <span>SCAN E-PASS</span><br />
                <span>SECURE TMS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (No print) */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4 no-print">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {!isCancelled && canCancel && onCancelTicket && (
              <button
                onClick={() => onCancelTicket(booking)}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition-colors"
              >
                Cancel Booking
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
            >
              <Printer className="h-4 w-4" />
              <span>Print Boarding Pass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
