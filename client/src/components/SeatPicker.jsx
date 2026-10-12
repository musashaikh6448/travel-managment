import React, { useState } from 'react';
import { Armchair, Lock, User, Check, Sparkles, Navigation } from 'lucide-react';

const SeatPicker = ({ 
  totalSeats = 40, 
  seatLayoutType = '2x2', 
  bookedSeats = [], 
  blockedSeats = [], 
  seatMap = [], 
  selectedSeat = null, 
  onSelectSeat,
  ticketPrice = 650,
  readonly = false
}) => {
  const [deck, setDeck] = useState('lower');
  const isSleeper = seatLayoutType.includes('sleeper') || totalSeats <= 36;

  // Determine seat count per deck
  const seatsPerDeck = isSleeper ? Math.ceil(totalSeats / 2) : totalSeats;
  const startSeat = deck === 'upper' ? seatsPerDeck + 1 : 1;
  const endSeat = deck === 'upper' ? totalSeats : (isSleeper ? seatsPerDeck : totalSeats);

  const pad = (n) => String(n).padStart(2, '0');

  // Build grid of seats
  const renderSeats = () => {
    const rows = [];
    const step = isSleeper ? 3 : 4; // 2+1 or 2+2

    for (let i = startSeat; i <= endSeat; i += step) {
      const rowSeats = [];
      for (let j = 0; j < step; j++) {
        const seatNum = i + j;
        if (seatNum <= endSeat) {
          const seatStr = pad(seatNum);
          
          // Check status
          const isBooked = bookedSeats.includes(seatStr) || (seatMap.find(s => s.seatNumber === seatStr)?.status === 'Booked');
          const isBlocked = blockedSeats.includes(seatStr) || (seatMap.find(s => s.seatNumber === seatStr)?.status === 'Blocked');
          const isSelected = selectedSeat === seatStr;
          
          const seatInfo = seatMap.find(s => s.seatNumber === seatStr);
          const isFemale = seatInfo?.passenger?.gender === 'Female';

          rowSeats.push({
            seatNum: seatStr,
            isBooked,
            isBlocked,
            isSelected,
            isFemale,
            passenger: seatInfo?.passenger
          });
        }
      }
      rows.push(rowSeats);
    }
    return rows;
  };

  const rows = renderSeats();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Top Header & Deck Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Armchair className="h-4 w-4 text-emerald-600" />
            <span>Select Your Seat</span>
          </h4>
          <p className="text-xs text-slate-500">
            Click an available seat to proceed with booking
          </p>
        </div>

        {isSleeper && (
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setDeck('lower')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                deck === 'lower'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lower Deck
            </button>
            <button
              type="button"
              onClick={() => setDeck('upper')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                deck === 'upper'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upper Deck
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="my-4 flex flex-wrap items-center justify-center gap-4 rounded-xl bg-slate-50/80 p-3 text-xs font-medium text-slate-600 border border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-md border-2 border-emerald-500 bg-white" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-md bg-emerald-600 text-white flex items-center justify-center">
            <Check className="h-3 w-3" />
          </div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-md bg-blue-500 text-white flex items-center justify-center text-[10px]">
            <User className="h-3 w-3" />
          </div>
          <span>Booked (Male)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-md bg-pink-500 text-white flex items-center justify-center text-[10px]">
            <User className="h-3 w-3" />
          </div>
          <span>Booked (Female)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-md bg-slate-300 text-slate-600 flex items-center justify-center">
            <Lock className="h-3 w-3" />
          </div>
          <span>Blocked</span>
        </div>
      </div>

      {/* Bus Layout Container */}
      <div className="mx-auto max-w-sm rounded-3xl border-2 border-slate-300 bg-slate-100/50 p-4 shadow-inner relative">
        {/* Front Cabin & Driver Indicator */}
        <div className="mb-4 flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-3 px-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Navigation className="h-4 w-4 text-emerald-600 rotate-45" />
            <span>Front / Entry</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Driver Cabin</span>
          </div>
        </div>

        {/* Seats Grid */}
        <div className="space-y-2.5">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex items-center justify-between gap-2">
              {/* Left Side Seats (2 or 1) */}
              <div className="flex items-center gap-2">
                {row.slice(0, isSleeper ? 2 : 2).map((seat) => (
                  <SeatButton
                    key={seat.seatNum}
                    seat={seat}
                    isSleeper={isSleeper}
                    onSelectSeat={onSelectSeat}
                    readonly={readonly}
                  />
                ))}
              </div>

              {/* Aisle Space */}
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-1">
                AISLE
              </div>

              {/* Right Side Seats (1 or 2) */}
              <div className="flex items-center gap-2">
                {row.slice(isSleeper ? 2 : 2).map((seat) => (
                  <SeatButton
                    key={seat.seatNum}
                    seat={seat}
                    isSleeper={isSleeper}
                    onSelectSeat={onSelectSeat}
                    readonly={readonly}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Seat Summary Bar */}
      {selectedSeat && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 p-3 border border-emerald-200 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
              {selectedSeat}
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">Seat {selectedSeat} Selected</p>
              <p className="text-[11px] text-emerald-700">Fare: ₹{ticketPrice}</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
            Ready to Book
          </span>
        </div>
      )}
    </div>
  );
};

const SeatButton = ({ seat, isSleeper, onSelectSeat, readonly }) => {
  const { seatNum, isBooked, isBlocked, isSelected, isFemale, passenger } = seat;

  let btnStyle = 'border-2 border-emerald-500 bg-white text-slate-800 hover:bg-emerald-50 hover:scale-105 active:scale-95 shadow-sm';
  let title = `Seat ${seatNum} - Available`;

  if (isSelected) {
    btnStyle = 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-md ring-2 ring-emerald-400/50 scale-105';
    title = `Seat ${seatNum} - Selected`;
  } else if (isBooked) {
    if (isFemale) {
      btnStyle = 'bg-pink-500 text-white border-pink-600 opacity-90 cursor-not-allowed';
      title = `Seat ${seatNum} - Booked (Female: ${passenger?.name || 'Passenger'})`;
    } else {
      btnStyle = 'bg-blue-600 text-white border-blue-700 opacity-90 cursor-not-allowed';
      title = `Seat ${seatNum} - Booked (Male: ${passenger?.name || 'Passenger'})`;
    }
  } else if (isBlocked) {
    btnStyle = 'bg-slate-300 text-slate-500 border-slate-400 opacity-80 cursor-not-allowed';
    title = `Seat ${seatNum} - Blocked by Admin`;
  }

  const handleClick = () => {
    if (readonly || isBooked || isBlocked) return;
    if (onSelectSeat) onSelectSeat(seatNum);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={readonly || isBooked || isBlocked}
      title={title}
      className={`group relative flex flex-col items-center justify-center rounded-xl font-bold transition-all duration-150 ${
        isSleeper ? 'h-12 w-14 text-xs' : 'h-10 w-10 text-[11px]'
      } ${btnStyle}`}
    >
      <span className="leading-none">{seatNum}</span>
      {isSelected ? (
        <Check className="h-3 w-3 mt-0.5" />
      ) : isBooked ? (
        <User className="h-3 w-3 mt-0.5" />
      ) : isBlocked ? (
        <Lock className="h-3 w-3 mt-0.5" />
      ) : (
        <span className="text-[9px] font-normal opacity-60 mt-0.5">{isSleeper ? 'Sleep' : 'Seat'}</span>
      )}
    </button>
  );
};

export default SeatPicker;
