const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middleware/auth');

const authCtrl = require('../controllers/authController');
const dashCtrl = require('../controllers/dashboardController');
const busCtrl = require('../controllers/busController');
const routeCtrl = require('../controllers/routeController');
const tripCtrl = require('../controllers/tripController');
const bookingCtrl = require('../controllers/bookingController');
const workerCtrl = require('../controllers/workerController');
const passengerCtrl = require('../controllers/passengerController');
const expenseCtrl = require('../controllers/expenseController');
const reportCtrl = require('../controllers/reportController');
const notifCtrl = require('../controllers/notificationController');
const auditCtrl = require('../controllers/auditController');
const settingsCtrl = require('../controllers/settingsController');

// 1. Auth routes (Public)
router.post('/auth/login', authCtrl.login);
router.post('/auth/forgot-password', authCtrl.forgotPassword);
router.post('/auth/reset-password', authCtrl.resetPasswordWithPin);

// Protected Auth
router.get('/auth/profile', authenticate, authCtrl.getProfile);
router.put('/auth/profile', authenticate, authCtrl.updateProfile);
router.put('/auth/change-password', authenticate, authCtrl.changePassword);

// 2. Dashboard
router.get('/dashboard/admin', authenticate, authorize('admin', 'superadmin'), dashCtrl.getAdminDashboard);
router.get('/dashboard/worker', authenticate, dashCtrl.getWorkerDashboard);

// 3. Buses
router.get('/buses', authenticate, busCtrl.getAllBuses);
router.get('/buses/:id', authenticate, busCtrl.getBusById);
router.post('/buses', authenticate, authorize('admin', 'superadmin'), busCtrl.createBus);
router.put('/buses/:id', authenticate, authorize('admin', 'superadmin'), busCtrl.updateBus);
router.delete('/buses/:id', authenticate, authorize('admin', 'superadmin'), busCtrl.deleteBus);

// 4. Routes
router.get('/routes', authenticate, routeCtrl.getAllRoutes);
router.get('/routes/:id', authenticate, routeCtrl.getRouteById);
router.post('/routes', authenticate, authorize('admin', 'superadmin'), routeCtrl.createRoute);
router.put('/routes/:id', authenticate, authorize('admin', 'superadmin'), routeCtrl.updateRoute);
router.delete('/routes/:id', authenticate, authorize('admin', 'superadmin'), routeCtrl.deleteRoute);

// 5. Trips
router.get('/trips', authenticate, tripCtrl.getAllTrips);
router.get('/trips/:id', authenticate, tripCtrl.getTripById);
router.post('/trips', authenticate, authorize('admin', 'superadmin'), tripCtrl.createTrip);
router.put('/trips/:id', authenticate, authorize('admin', 'superadmin'), tripCtrl.updateTrip);
router.post('/trips/:id/seats/block', authenticate, authorize('admin', 'superadmin'), tripCtrl.toggleBlockSeat);

// 6. Bookings & Tickets
router.get('/bookings', authenticate, bookingCtrl.getAllBookings);
router.get('/bookings/:id', authenticate, bookingCtrl.getBookingById);
router.post('/bookings', authenticate, bookingCtrl.createBooking);
router.post('/bookings/:id/cancel', authenticate, bookingCtrl.cancelBooking);

// 7. Workers
router.get('/workers', authenticate, authorize('admin', 'superadmin'), workerCtrl.getAllWorkers);
router.get('/workers/:id', authenticate, authorize('admin', 'superadmin'), workerCtrl.getWorkerById);
router.post('/workers', authenticate, authorize('admin', 'superadmin'), workerCtrl.createWorker);
router.put('/workers/:id', authenticate, authorize('admin', 'superadmin'), workerCtrl.updateWorker);
router.delete('/workers/:id', authenticate, authorize('admin', 'superadmin'), workerCtrl.deleteWorker);

// 8. Passengers
router.get('/passengers', authenticate, passengerCtrl.getAllPassengers);
router.get('/passengers/:id', authenticate, passengerCtrl.getPassengerById);
router.put('/passengers/:id', authenticate, authorize('admin', 'superadmin'), passengerCtrl.updatePassenger);

// 9. Expenses
router.get('/expenses', authenticate, expenseCtrl.getAllExpenses);
router.post('/expenses', authenticate, authorize('admin', 'superadmin'), expenseCtrl.createExpense);
router.put('/expenses/:id', authenticate, authorize('admin', 'superadmin'), expenseCtrl.updateExpense);
router.delete('/expenses/:id', authenticate, authorize('admin', 'superadmin'), expenseCtrl.deleteExpense);

// 10. Reports (Admin only)
router.get('/reports/daily', authenticate, authorize('admin', 'superadmin'), reportCtrl.getDailyReport);
router.get('/reports/bus', authenticate, authorize('admin', 'superadmin'), reportCtrl.getBusReport);
router.get('/reports/worker', authenticate, authorize('admin', 'superadmin'), reportCtrl.getWorkerReport);
router.get('/reports/profit-loss', authenticate, authorize('admin', 'superadmin'), reportCtrl.getProfitLossReport);
router.get('/reports/payment', authenticate, authorize('admin', 'superadmin'), reportCtrl.getPaymentReport);

// 11. Notifications
router.get('/notifications', authenticate, notifCtrl.getNotifications);
router.put('/notifications/:id/read', authenticate, notifCtrl.markAsRead);

// 12. Audit Logs
router.get('/audit-logs', authenticate, authorize('admin', 'superadmin'), auditCtrl.getAuditLogs);

// 13. Settings
router.get('/settings', settingsCtrl.getSettings);
router.put('/settings', authenticate, authorize('admin', 'superadmin'), settingsCtrl.updateSettings);

module.exports = router;
