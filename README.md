# Travel & Bus Management System (TravelPro TMS)

A production-style, professional, and responsive **Travel & Bus Ticket Management System** web application built using **React.js, Tailwind CSS, Node.js, Express, and MongoDB-compatible Data Store with JWT Role-Based Authentication**.

Inspired by clean enterprise management dashboards, this system provides bus & travel companies with end-to-end management over fleet buses, multi-stop routes, departures/trips, live interactive seat layouts, passenger ticketing, daily expenses, worker sales attribution, and comprehensive profit/loss analytics.

---

## 🌟 Key Features

### 1. 🔐 Role-Based Authentication & Security
- **Super Admin, Admin, and Bus Worker / Booking Staff** roles.
- JWT-based authentication with bcrypt password hashing.
- One-click demo credentials on the login screen for instant testing.
- Password recovery via verification PIN and change password in user profile.

### 2. 📊 Executive Operations Dashboard (Admin & Worker)
- **Top Metrics**: Today's Ticket Count, Today's Gross Revenue (₹), Daily Expenses (₹), Net Operating Profit (₹), Occupancy Percentage, Available vs Occupied Seats.
- **Date Filters**: Today, Yesterday, This Week, This Month, and Custom Date Range.
- **Financial Visuals**: Daily Revenue vs. Expenses trajectory, Fleet Occupancy rates.
- **Leaderboards**: Staff sales rankings and bus-wise performance table.
- **Payment & Source Breakdown**: UPI, Cash, Card, Online channels; Counter, Worker, Website, Phone, Agent sources.

### 3. 🎫 Fast Ticket Booking Console
- Live trip selector showing departure time and seat counts.
- **Interactive Visual Seat Layout**: Supports 2x2 Seater and 2x1 Sleeper layouts (Lower/Upper deck) with steering wheel and driver cabin layout.
- Real-time seat status indicators: **Available**, **Booked (Male/Female)**, **Blocked**, and **Selected**.
- Passenger auto-lookup by mobile number to auto-fill returning customer profiles.
- Discount support, payment mode selection, booking channel, and staff attribution.
- Instant ticket generation with celebratory feedback and printable boarding pass view.

### 4. 📄 E-Ticket & Boarding Pass (Printable & Downloadable)
- Ticket number (e.g., `TKT-20261005-0012`) with PNR, QR code aesthetic, and barcode.
- Passenger details, origin/destination, bus model & registration number, assigned seat, boarding point, reporting instructions, fare breakdown, and cancellation terms.
- Built-in one-click browser print styles formatted specifically for paper receipts / PDF export.

### 5. ❌ Ticket Cancellation & Refund Workflow
- Cancellation verification with instant seat release back to available inventory.
- Automatic cancellation fee calculation (e.g. 15%) and net customer refund computation.
- Comprehensive cancellation audit log entry and refund payment record.

### 6. 🚌 Bus Fleet & Crew Management
- Full CRUD for buses (Bus Number, Name, Type: AC Sleeper, AC Semi-Sleeper, AC Seater, Volvo Multi-Axle; Total Seats, Layout type).
- Crew assignments: Driver Name/Phone, Conductor Name/Phone.
- Route, boarding point, and dropping point configuration.
- Vehicle-level financial performance (Revenue, Expenses, Net Profit, Occupancy %).

### 7. 🗺️ Multi-Stop Route Management
- Origin to Destination corridors with intermediate stop waypoints.
- Distance (km), estimated journey duration, and base ticket fare.

### 8. 📅 Trip & Departure Scheduling
- Scheduled, Running, Completed, and Cancelled statuses.
- Independent trip-based booking, seat map, revenue, and expense tracking (never mixed across dates or buses).

### 9. 💺 Seat Inventory & Admin Blocking
- Live visual overview of all seats across scheduled trips.
- Administrative seat block / unblock tools for VIP or maintenance holds.

### 10. 👥 Worker / Booking Staff Tracking
- Employee directory with Employee IDs, contact details, and assigned buses/routes.
- Individual sales tracking (Tickets Sold, Cancellations, Gross Collection, Net Revenue).

### 11. 👤 Passenger CRM
- Comprehensive passenger directory with mobile number lookup.
- Total lifetime trips, cumulative spend (₹), and full journey history logs.

### 12. 💸 Daily Expense & Voucher Management
- Categories: Fuel (Diesel), Driver Salary, Conductor Salary, Toll Taxes (FASTag), Maintenance, Food, Cleaning, Repair, Commission, Other.
- Linked to specific buses and trips for accurate profit & loss attribution.

### 13. 📈 Comprehensive Reports & Analytics
- **Daily Master Report**: Single-day operational audit (Trips, Tickets, Occupancy, Revenue, Expenses, Net Profit, Worker Sales, Payment Methods).
- **Bus-wise Fleet Report**: Vehicle-level utilization and profitability.
- **Worker Sales Report**: Staff performance and commission audit.
- **Profit & Loss Statement**: Revenue minus cost centers with margin percentages.
- **Payment & Source Reports**: Gateway and booking channel distributions.
- **CSV & Excel Export**: Instant download of all filtered records.

### 14. 📜 System Audit Trail & Logs
- Immutable chronological log recording operator name, role, module, action description, and timestamp.

### 15. ⚙️ Company & System Settings
- Configurable Company Name, Tagline, Logo, Office Address, Contact Numbers, Ticket Serial Prefix, Currency Symbol (₹), Cancellation Fee (%), and Terms & Conditions.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ or v20+)
- npm

### 1. Start the Backend API Server
```bash
cd server
npm install
node server.js
```
*Backend runs on `http://localhost:5001/api` with preloaded seed data.*

### 2. Start the Frontend Application
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000/`.*

---

## 🔑 Demo Login Credentials

| Role | Identifier / Email | Mobile | Password |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@travelmgmt.com` | `9876543210` | `admin123` |
| **Admin** | `manager@travelmgmt.com` | `9876543211` | `admin123` |
| **Booking Staff** | `rahul@travelmgmt.com` | `9822011101` | `admin123` |
| **Hyderabad Desk** | `amit@travelmgmt.com` | `9822011102` | `admin123` |

*Note: The login page includes 1-click quick login buttons to fill credentials instantly.*
