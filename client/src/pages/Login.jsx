import React, { useState } from 'react';
import { Bus, Lock, Mail, Phone, ArrowRight, ShieldCheck, UserCheck, Key, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('admin@travelmgmt.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Forgot password states
  const [forgotInput, setForgotInput] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: enter email, 2: enter pin & new pass
  const [forgotUserId, setForgotUserId] = useState('');
  const [demoPin, setDemoPin] = useState('');
  const [enteredPin, setEnteredPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(identifier, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role) => {
    if (role === 'superadmin') {
      setIdentifier('admin@travelmgmt.com');
      setPassword('admin123');
    } else if (role === 'admin') {
      setIdentifier('manager@travelmgmt.com');
      setPassword('admin123');
    } else if (role === 'worker') {
      setIdentifier('rahul@travelmgmt.com');
      setPassword('admin123');
    }
    setError('');
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');

    try {
      const res = await api.post('/auth/forgot-password', { identifier: forgotInput });
      if (res.success) {
        setForgotUserId(res.userId);
        setDemoPin(res.demoPin);
        setEnteredPin(res.demoPin); // Auto-fill for ease of demonstration
        setForgotMessage(res.message);
        setForgotStep(2);
      }
    } catch (err) {
      setForgotError(err.message || 'User not found.');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    try {
      const res = await api.post('/auth/reset-password', {
        userId: forgotUserId,
        pin: enteredPin,
        newPassword
      });
      if (res.success) {
        alert('Password has been reset successfully! You can now log in.');
        setShowForgotModal(false);
        setPassword(newPassword);
        setForgotStep(1);
      }
    } catch (err) {
      setForgotError(err.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-700/60 bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-lg shadow-emerald-600/30">
            <Bus className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
            Travel<span className="text-emerald-600">Pro</span> TMS
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Bus & Travel Ticket Management System
          </p>
        </div>

        {/* Quick Demo Login Picker */}
        <div className="mt-5 rounded-2xl bg-slate-50 p-3 border border-slate-200/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center mb-2">
            One-Click Demo Credentials:
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setDemoCredentials('superadmin')}
              className="rounded-xl border border-emerald-300 bg-emerald-50 px-2 py-1.5 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('admin')}
              className="rounded-xl border border-blue-300 bg-blue-50 px-2 py-1.5 text-[11px] font-bold text-blue-800 hover:bg-blue-100 transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('worker')}
              className="rounded-xl border border-purple-300 bg-purple-50 px-2 py-1.5 text-[11px] font-bold text-purple-800 hover:bg-purple-100 transition-colors"
            >
              Staff / Worker
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200 animate-in fade-in">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Mobile Number or Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. admin@travelmgmt.com or 9876543210"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-700 hover:to-green-800 active:scale-[0.99] transition-all disabled:opacity-60"
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          Role-Based Access: Super Admin • Admin • Booking Staff
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-600" />
              <span>Password Recovery</span>
            </h3>

            {forgotError && (
              <div className="mt-3 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 font-semibold">
                {forgotError}
              </div>
            )}
            {forgotMessage && (
              <div className="mt-3 rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-800 font-medium">
                {forgotMessage}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotSubmit} className="mt-4 space-y-3">
                <p className="text-xs text-slate-500">
                  Enter your registered Email or Mobile number to receive a verification PIN.
                </p>
                <input
                  type="text"
                  required
                  value={forgotInput}
                  onChange={(e) => setForgotInput(e.target.value)}
                  placeholder="admin@travelmgmt.com or 9876543210"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    Send PIN
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Verification PIN</label>
                  <input
                    type="text"
                    required
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value)}
                    placeholder="6-digit PIN"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    Reset & Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
