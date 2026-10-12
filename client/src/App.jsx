import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TicketModal from './components/TicketModal';
import CancelModal from './components/CancelModal';
import GlobalSearchModal from './components/GlobalSearchModal';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import TripsManagement from './pages/TripsManagement';
import TicketBooking from './pages/TicketBooking';
import BookingsManagement from './pages/BookingsManagement';
import BusManagement from './pages/BusManagement';
import RouteManagement from './pages/RouteManagement';
import SeatManagement from './pages/SeatManagement';
import WorkerManagement from './pages/WorkerManagement';
import PassengerManagement from './pages/PassengerManagement';
import ExpenseManagement from './pages/ExpenseManagement';
import PaymentManagement from './pages/PaymentManagement';
import ReportsManagement from './pages/ReportsManagement';
import AuditLogPage from './pages/AuditLogPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';

const MainLayout = () => {
  const { isAuthenticated, loading, isAdmin, isWorker } = useAuth();
  const [activeTab, setActiveTab] = useState(isAdmin ? 'dashboard' : 'worker-dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Modals state
  const [viewingTicket, setViewingTicket] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [preselectedTripForBooking, setPreselectedTripForBooking] = useState(null);

  // Sync initial tab when user role changes
  React.useEffect(() => {
    if (isAuthenticated) {
      setActiveTab(isAdmin ? 'dashboard' : 'worker-dashboard');
    }
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">Loading TravelPro TMS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleBookTrip = (trip) => {
    setPreselectedTripForBooking(trip);
    setActiveTab('booking');
  };

  const handleBookingSuccess = (newBooking) => {
    setViewingTicket(newBooking);
  };

  const handleSearchResult = ({ type, data }) => {
    if (type === 'booking') {
      setViewingTicket(data);
    } else if (type === 'bus') {
      setActiveTab('buses');
    } else if (type === 'route') {
      setActiveTab('routes');
    } else if (type === 'passenger') {
      setActiveTab('passengers');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Responsive Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onNavigate={(tabId) => setActiveTab(tabId)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigate={(tabId) => setActiveTab(tabId)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && isAdmin && (
            <AdminDashboard
              onNavigate={(tabId) => setActiveTab(tabId)}
              onViewTicket={(b) => setViewingTicket(b)}
            />
          )}

          {activeTab === 'worker-dashboard' && (
            <WorkerDashboard
              onNavigate={(tabId) => setActiveTab(tabId)}
              onViewTicket={(b) => setViewingTicket(b)}
              onBookTrip={handleBookTrip}
            />
          )}

          {activeTab === 'trips' && (
            <TripsManagement onBookTrip={handleBookTrip} />
          )}

          {activeTab === 'booking' && (
            <TicketBooking
              selectedTripProp={preselectedTripForBooking}
              onBookingSuccess={handleBookingSuccess}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsManagement
              onViewTicket={(b) => setViewingTicket(b)}
              onCancelTicket={(b) => setCancellingBooking(b)}
              onNavigate={(tabId) => setActiveTab(tabId)}
            />
          )}

          {activeTab === 'buses' && isAdmin && (
            <BusManagement />
          )}

          {activeTab === 'routes' && isAdmin && (
            <RouteManagement />
          )}

          {activeTab === 'seats' && (
            <SeatManagement />
          )}

          {activeTab === 'workers' && isAdmin && (
            <WorkerManagement />
          )}

          {activeTab === 'passengers' && (
            <PassengerManagement
              onViewTicket={(b) => setViewingTicket(b)}
            />
          )}

          {activeTab === 'expenses' && isAdmin && (
            <ExpenseManagement />
          )}

          {activeTab === 'payments' && isAdmin && (
            <PaymentManagement />
          )}

          {activeTab === 'reports' && isAdmin && (
            <ReportsManagement />
          )}

          {activeTab === 'audit' && isAdmin && (
            <AuditLogPage />
          )}

          {activeTab === 'settings' && isAdmin && (
            <SettingsPage />
          )}

          {activeTab === 'profile' && (
            <ProfilePage />
          )}
        </main>
      </div>

      {/* Global Modals */}
      {viewingTicket && (
        <TicketModal
          booking={viewingTicket}
          onClose={() => setViewingTicket(null)}
          onCancelTicket={(b) => {
            setViewingTicket(null);
            setCancellingBooking(b);
          }}
          canCancel={isAdmin}
        />
      )}

      {cancellingBooking && (
        <CancelModal
          booking={cancellingBooking}
          onClose={() => setCancellingBooking(null)}
          onSuccess={(updatedBooking) => {
            setViewingTicket(updatedBooking);
          }}
        />
      )}

      {isSearchOpen && (
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectResult={handleSearchResult}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
