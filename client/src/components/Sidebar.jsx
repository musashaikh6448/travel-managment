import React from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  BookmarkCheck, 
  Bus, 
  MapPin, 
  Armchair, 
  Users, 
  UserCheck, 
  Receipt, 
  CreditCard, 
  BarChart3, 
  History, 
  Settings, 
  User, 
  LogOut,
  CalendarDays,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, onNavigate, isMobileOpen, onCloseMobile }) => {
  const { user, isAdmin, logout } = useAuth();

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'trips', label: 'Trips Management', icon: CalendarDays, badge: null },
    { id: 'booking', label: 'Ticket Booking', icon: Ticket, badge: 'New', badgeColor: 'bg-emerald-500' },
    { id: 'bookings', label: 'All Bookings', icon: BookmarkCheck, badge: null },
    { id: 'buses', label: 'Buses Fleet', icon: Bus, badge: null },
    { id: 'routes', label: 'Routes & Stops', icon: MapPin, badge: null },
    { id: 'seats', label: 'Seat Management', icon: Armchair, badge: null },
    { id: 'workers', label: 'Workers / Staff', icon: Users, badge: null },
    { id: 'passengers', label: 'Passengers CRM', icon: UserCheck, badge: null },
    { id: 'expenses', label: 'Daily Expenses', icon: Receipt, badge: null },
    { id: 'payments', label: 'Payment Records', icon: CreditCard, badge: null },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, badge: 'PRO', badgeColor: 'bg-amber-500' },
    { id: 'audit', label: 'System Audit Logs', icon: History, badge: null },
    { id: 'settings', label: 'Company Settings', icon: Settings, badge: null },
  ];

  const workerNavItems = [
    { id: 'worker-dashboard', label: 'Worker Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'booking', label: 'New Ticket Booking', icon: Ticket, badge: 'Action', badgeColor: 'bg-emerald-500' },
    { id: 'bookings', label: 'Today\'s Tickets', icon: BookmarkCheck, badge: null },
    { id: 'trips', label: 'View Trips & Status', icon: CalendarDays, badge: null },
    { id: 'seats', label: 'Seat Availability', icon: Armchair, badge: null },
    { id: 'passengers', label: 'Passenger Lookup', icon: UserCheck, badge: null },
  ];

  const navItems = isAdmin ? adminNavItems : workerNavItems;

  const handleItemClick = (id) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
              <Bus className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white leading-tight">
                Royal Express
              </h1>
              <p className="text-[10px] font-medium text-emerald-400">
                Bus Management System
              </p>
            </div>
          </div>
          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            {isAdmin ? 'ADMIN' : 'STAFF'}
          </span>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-600'
                  }`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${item.badgeColor || 'bg-emerald-500'}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-white/80" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* User Card & Logout Bottom Bar */}
        <div className="border-t border-slate-200 bg-slate-50/80 p-3.5">
          <div className="mb-2.5 flex items-center gap-3 rounded-xl bg-white p-2.5 shadow-sm border border-slate-200/80">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Staff')}`}
              alt={user?.name}
              className="h-8 w-8 rounded-lg bg-emerald-50 object-cover ring-1 ring-emerald-500/20"
            />
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-bold text-slate-800">{user?.name || 'Logged User'}</p>
              <p className="truncate text-[10px] text-slate-500">{user?.email || user?.mobile}</p>
            </div>
            <button
              onClick={() => handleItemClick('profile')}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="View Profile"
            >
              <User className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/50 py-2 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
