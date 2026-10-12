import React, { useState } from 'react';
import { User, Lock, Save, Key, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileMsg('');
    setProfileError('');

    try {
      const res = await api.put('/auth/profile', { name, mobile, email, address });
      if (res.success) {
        setProfileMsg('Profile updated successfully!');
        updateUser(res.user);
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassError('New password and confirmation do not match.');
      return;
    }

    setLoadingPass(true);
    setPassMsg('');
    setPassError('');

    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      if (res.success) {
        setPassMsg('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPassError(err.message || 'Failed to update password.');
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <h2 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl flex items-center gap-2.5">
          <User className="h-6 w-6 text-emerald-600" />
          <span>User Profile & Security Settings</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Update account details, phone number, and change login password
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Profile Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name}
              className="h-12 w-12 rounded-2xl bg-emerald-100 object-cover ring-2 ring-emerald-500/30"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900">{user?.name}</h3>
              <p className="text-[11px] text-slate-500">Employee ID: {user?.employeeId || 'EMP-01'}</p>
              <span className="inline-block mt-1 rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-800">
                {user?.role}
              </span>
            </div>
          </div>

          {profileMsg && (
            <div className="rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-800 font-bold">
              {profileMsg}
            </div>
          )}
          {profileError && (
            <div className="rounded-xl bg-red-50 p-2.5 text-xs text-red-700 font-bold">
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Address / Location
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loadingProfile}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loadingProfile ? 'Saving...' : 'Update Details'}</span>
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock className="h-4 w-4 text-emerald-600" />
            <span>Change Login Password</span>
          </h3>

          {passMsg && (
            <div className="rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-800 font-bold">
              {passMsg}
            </div>
          )}
          {passError && (
            <div className="rounded-xl bg-red-50 p-2.5 text-xs text-red-700 font-bold">
              {passError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loadingPass}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 font-bold text-white hover:bg-slate-800 shadow-md shadow-slate-900/20 disabled:opacity-50"
            >
              <Key className="h-4 w-4" />
              <span>{loadingPass ? 'Updating...' : 'Change Password'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
