const fs = require('fs');
const path = require('path');
const seedData = require('../seedData');

const DB_FILE = path.join(__dirname, 'db.json');

// Helper to pad numbers
const pad = (num, size = 3) => String(num).padStart(size, '0');

class DataStore {
  constructor() {
    this.data = {
      settings: seedData.settings,
      users: [...seedData.users],
      routes: [...seedData.routes],
      buses: [...seedData.buses],
      passengers: [...seedData.passengers],
      trips: [],
      bookings: [],
      expenses: [],
      payments: [],
      auditLogs: [],
      notifications: []
    };
    this.init();
  }

  init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log('📦 Loaded database from disk successfully.');
        return;
      } catch (err) {
        console.warn('⚠️ Could not parse existing db.json, generating fresh dataset...');
      }
    }
    this.generateSeedData();
    this.save();
  }

  save() {
    try {
      if (!fs.existsSync(path.dirname(DB_FILE))) {
        fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  generateSeedData() {
    const dates = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'];
    let tripCounter = 1;
    let bookingCounter = 1;
    let expenseCounter = 1;
    let paymentCounter = 1;
    let auditCounter = 1;

    const sources = ['Counter', 'Worker', 'Website', 'Phone', 'Agent'];
    const payMethods = ['UPI', 'Cash', 'Card', 'Online'];
    const workers = this.data.users.filter(u => u.role === 'worker');

    // Create trips across dates for all buses
    dates.forEach((dateStr) => {
      this.data.buses.forEach((bus, busIdx) => {
        const route = this.data.routes.find(r => r.id === bus.routeId) || this.data.routes[0];
        const isToday = dateStr === '2026-10-05';
        const isPast = dateStr < '2026-10-05';

        const tripId = `trip_${tripCounter++}`;
        const tripNumber = `TRIP-${dateStr.replace(/-/g, '')}-${pad(busIdx + 1, 2)}`;
        
        let status = 'Completed';
        if (isToday) {
          status = busIdx === 0 ? 'Running' : (busIdx === 1 ? 'Scheduled' : 'Scheduled');
        }

        const trip = {
          id: tripId,
          tripNumber,
          busId: bus.id,
          busNumber: bus.busNumber,
          busName: bus.busName,
          busType: bus.busType,
          routeId: route.id,
          routeName: route.routeName,
          from: route.from,
          to: route.to,
          tripDate: dateStr,
          departureTime: bus.departureTime,
          arrivalTime: bus.arrivalTime,
          driverName: bus.driverName,
          driverMobile: bus.driverMobile,
          conductorName: bus.conductorName,
          conductorMobile: bus.conductorMobile,
          totalSeats: bus.totalSeats,
          seatLayoutType: bus.seatLayoutType,
          ticketPrice: route.ticketPrice,
          bookedSeats: [],
          status,
          createdAt: `${dateStr}T06:00:00.000Z`
        };

        // Bookings for this trip
        // Occupancy between 65% and 90%
        const bookedCount = Math.floor(bus.totalSeats * (0.65 + (busIdx * 0.05)));
        const bookedSeatNumbers = [];

        for (let s = 1; s <= bookedCount; s++) {
          const seatNum = pad(s, 2);
          bookedSeatNumbers.push(seatNum);

          const pax = this.data.passengers[(s + busIdx * 3) % this.data.passengers.length];
          const worker = workers[(s + busIdx) % workers.length];
          const bookingSource = sources[(s + busIdx) % sources.length];
          const paymentMethod = payMethods[(s + busIdx * 2) % payMethods.length];

          const bkgId = `bkg_${bookingCounter++}`;
          const ticketNumber = `TKT-${dateStr.replace(/-/g, '')}-${pad(bookingCounter, 4)}`;

          const isCancelled = (dateStr === '2026-10-04' && s === 3) || (dateStr === '2026-10-05' && s === 2 && busIdx === 1);
          const bookingStatus = isCancelled ? 'Cancelled' : 'Confirmed';

          if (!isCancelled) {
            trip.bookedSeats.push(seatNum);
          }

          const discount = (s % 5 === 0) ? 50 : 0;
          const finalAmount = route.ticketPrice - discount;

          const booking = {
            id: bkgId,
            bookingNumber: `BKG-${dateStr.replace(/-/g, '')}-${pad(bookingCounter, 4)}`,
            ticketNumber,
            tripId: trip.id,
            tripNumber: trip.tripNumber,
            busId: bus.id,
            busNumber: bus.busNumber,
            busName: bus.busName,
            routeId: route.id,
            routeName: route.routeName,
            fromCity: route.from,
            toCity: route.to,
            journeyDate: dateStr,
            passengerId: pax.id,
            passengerName: pax.name,
            passengerMobile: pax.mobile,
            passengerAge: pax.age,
            passengerGender: pax.gender,
            seatNumber: seatNum,
            ticketPrice: route.ticketPrice,
            discount,
            finalAmount,
            paymentMethod,
            paymentStatus: isCancelled ? 'Refunded' : 'Paid',
            bookingSource,
            bookedBy: worker.id,
            workerName: worker.name,
            status: bookingStatus,
            cancellationDetails: isCancelled ? {
              cancelledAt: `${dateStr}T14:30:00.000Z`,
              reason: "Passenger personal emergency",
              cancelledBy: "Admin",
              cancellationCharge: Math.round(finalAmount * 0.15),
              refundAmount: Math.round(finalAmount * 0.85)
            } : null,
            createdAt: `${dateStr}T09:${pad((s * 7) % 55, 2)}:00.000Z`
          };

          this.data.bookings.push(booking);

          // Payment record
          this.data.payments.push({
            id: `pay_${paymentCounter++}`,
            paymentId: `PAY-${dateStr.replace(/-/g, '')}-${pad(paymentCounter, 4)}`,
            bookingId: booking.id,
            ticketNumber: booking.ticketNumber,
            amount: finalAmount,
            paymentMethod,
            status: isCancelled ? 'Refunded' : 'Success',
            collectedBy: worker.name,
            date: dateStr,
            createdAt: booking.createdAt
          });
        }

        this.data.trips.push(trip);

        // Realistic expenses for this bus & trip
        const fuelExpense = {
          id: `exp_${expenseCounter++}`,
          expenseDate: dateStr,
          busId: bus.id,
          busNumber: bus.busNumber,
          tripId: trip.id,
          tripNumber: trip.tripNumber,
          category: 'Fuel',
          amount: 3200 + (busIdx * 450),
          paidTo: 'Indian Oil Petrol Pump, Nanded',
          paymentMethod: 'Card',
          description: `Diesel filling for ${bus.busNumber} trip ${trip.tripNumber}`,
          receiptNumber: `IOCL-${dateStr.replace(/-/g, '')}-${busIdx + 1}`,
          addedBy: 'Admin (Suresh Deshmukh)',
          createdAt: `${dateStr}T08:00:00.000Z`
        };

        const tollExpense = {
          id: `exp_${expenseCounter++}`,
          expenseDate: dateStr,
          busId: bus.id,
          busNumber: bus.busNumber,
          tripId: trip.id,
          tripNumber: trip.tripNumber,
          category: 'Toll',
          amount: 850 + (busIdx * 120),
          paidTo: 'NHAI FASTag Auto Debit',
          paymentMethod: 'Online',
          description: `Fastag toll charges for ${route.routeName}`,
          receiptNumber: `FASTAG-${dateStr.replace(/-/g, '')}-${busIdx + 1}`,
          addedBy: 'Admin (Suresh Deshmukh)',
          createdAt: `${dateStr}T10:00:00.000Z`
        };

        const driverSalary = {
          id: `exp_${expenseCounter++}`,
          expenseDate: dateStr,
          busId: bus.id,
          busNumber: bus.busNumber,
          tripId: trip.id,
          tripNumber: trip.tripNumber,
          category: 'Driver Salary',
          amount: 1200,
          paidTo: bus.driverName,
          paymentMethod: 'Cash',
          description: `Daily trip allowance and bata for driver ${bus.driverName}`,
          receiptNumber: `VCH-DRV-${dateStr.replace(/-/g, '')}-${busIdx + 1}`,
          addedBy: 'Admin (Suresh Deshmukh)',
          createdAt: `${dateStr}T21:00:00.000Z`
        };

        this.data.expenses.push(fuelExpense, tollExpense, driverSalary);

        if (busIdx === 0 && (dateStr === '2026-10-02' || dateStr === '2026-10-05')) {
          this.data.expenses.push({
            id: `exp_${expenseCounter++}`,
            expenseDate: dateStr,
            busId: bus.id,
            busNumber: bus.busNumber,
            tripId: trip.id,
            tripNumber: trip.tripNumber,
            category: 'Maintenance',
            amount: 2400,
            paidTo: 'Shree Auto Garage, Nanded',
            paymentMethod: 'UPI',
            description: 'AC filter cleaning, brake pad inspection and cabin sanitization',
            receiptNumber: `GARAGE-${dateStr.replace(/-/g, '')}-01`,
            addedBy: 'Admin (Suresh Deshmukh)',
            createdAt: `${dateStr}T12:00:00.000Z`
          });
        }
      });
    });

    // Audit logs
    this.data.auditLogs = [
      {
        id: `aud_${auditCounter++}`,
        user: "Rahul Patil",
        userRole: "worker",
        action: "Booked Ticket",
        module: "Booking",
        details: "Booked ticket TKT-20261005-0012 for Anand Deshpande (Seat 04, Bus MH-26-BE-4455)",
        recordId: "bkg_12",
        ipAddress: "192.168.1.45",
        createdAt: "2026-10-05T18:45:00.000Z"
      },
      {
        id: `aud_${auditCounter++}`,
        user: "Amit Sharma",
        userRole: "worker",
        action: "Booked Ticket",
        module: "Booking",
        details: "Booked ticket TKT-20261005-0015 for Pooja Kulkarni (Seat 09, Bus MH-26-TR-8899)",
        recordId: "bkg_15",
        ipAddress: "192.168.1.48",
        createdAt: "2026-10-05T18:12:00.000Z"
      },
      {
        id: `aud_${auditCounter++}`,
        user: "Admin (Suresh Deshmukh)",
        userRole: "admin",
        action: "Added Expense",
        module: "Expense",
        details: "Added Diesel Fuel expense ₹4,100 for Bus MH-26-TR-8899",
        recordId: "exp_10",
        ipAddress: "192.168.1.10",
        createdAt: "2026-10-05T17:30:00.000Z"
      },
      {
        id: `aud_${auditCounter++}`,
        user: "Super Admin",
        userRole: "superadmin",
        action: "Cancelled Ticket",
        module: "Booking",
        details: "Cancelled ticket TKT-20261005-0002 for Sunita Gaikwad (Refund ₹552 credited)",
        recordId: "bkg_2",
        ipAddress: "192.168.1.1",
        createdAt: "2026-10-05T14:30:00.000Z"
      },
      {
        id: `aud_${auditCounter++}`,
        user: "Admin (Suresh Deshmukh)",
        userRole: "admin",
        action: "Created Trip",
        module: "Trip",
        details: "Scheduled trip TRIP-20261005-01 for Nanded to Hyderabad",
        recordId: "trip_1",
        ipAddress: "192.168.1.10",
        createdAt: "2026-10-05T06:00:00.000Z"
      }
    ];

    // Notifications
    this.data.notifications = [
      {
        id: "notif_1",
        title: "New Booking Created",
        message: "Rahul Patil booked seat 04 on Nanded ➔ Hyderabad (₹650)",
        type: "booking",
        targetRole: "all",
        isRead: false,
        createdAt: "2026-10-05T18:45:00.000Z"
      },
      {
        id: "notif_2",
        title: "Ticket Cancellation",
        message: "Seat 02 on Bus MH-26-TR-8899 has been cancelled and seat is now Available",
        type: "cancellation",
        targetRole: "admin",
        isRead: false,
        createdAt: "2026-10-05T14:30:00.000Z"
      },
      {
        id: "notif_3",
        title: "High Occupancy Alert",
        message: "Bus MH-26-BE-4455 (Nanded to Hyderabad) has reached 88% occupancy today",
        type: "system",
        targetRole: "admin",
        isRead: true,
        createdAt: "2026-10-05T12:15:00.000Z"
      },
      {
        id: "notif_4",
        title: "Expense Logged",
        message: "Fuel expense of ₹4,100 logged for Bus MH-26-TR-8899",
        type: "expense",
        targetRole: "admin",
        isRead: true,
        createdAt: "2026-10-05T17:30:00.000Z"
      }
    ];
  }

  // Audit Logger Helper
  logAudit(user, userRole, action, module, details, recordId = '', ipAddress = '127.0.0.1') {
    const logEntry = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      user: user || 'System',
      userRole: userRole || 'system',
      action,
      module,
      details,
      recordId,
      ipAddress,
      createdAt: new Date().toISOString()
    };
    this.data.auditLogs.unshift(logEntry);
    this.save();
    return logEntry;
  }

  // Notification Helper
  addNotification(title, message, type = 'system', targetRole = 'all', link = '') {
    const notif = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      type,
      targetRole,
      isRead: false,
      link,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }
}

const store = new DataStore();
module.exports = store;
