const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const store = require('./data/store');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
let PORT = parseInt(process.env.PORT || 5001, 10);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Static uploads / media if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api', apiRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Travel & Bus Management System API',
    version: '1.0.0',
    currentTime: new Date().toISOString(),
    records: {
      buses: store.data.buses.length,
      routes: store.data.routes.length,
      trips: store.data.trips.length,
      bookings: store.data.bookings.length,
      workers: store.data.users.filter(u => u.role === 'worker').length
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Travel Management System API is running smoothly.',
    docs: '/api/health'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred.'
  });
});

function startServer(portToTry) {
  const server = app.listen(portToTry, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Travel Management System Server running on port ${portToTry}`);
    console.log(`🔗 API Base URL: http://localhost:${portToTry}/api`);
    console.log(`🚌 Active Buses: ${store.data.buses.length} | Routes: ${store.data.routes.length} | Trips: ${store.data.trips.length}`);
    console.log(`👤 Super Admin: admin@travelmgmt.com (Password: admin123)`);
    console.log(`👤 Admin: manager@travelmgmt.com (Password: admin123)`);
    console.log(`👤 Worker Demo: rahul@travelmgmt.com / 9822011101`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${portToTry} is currently in use by another process.`);
      const nextPort = portToTry + 1;
      console.log(`🔄 Automatically attempting to bind on port ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);

module.exports = app;
