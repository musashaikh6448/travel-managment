import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Building2, Phone, Mail, FileText, IndianRupee } from 'lucide-react';
import api from '../services/api';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    companyName: 'Royal Express Travel & Bus Management',
    tagline: 'Connecting Cities, Delivering Comfort',
    companyAddress: '',
    contactNumber: '',
    email: '',
    ticketPrefix: 'TKT',
    currency: '₹',
    defaultTicketPrice: 650,
    taxPercentage: 5,
    cancellationChargePercentage: 15,
    termsAndConditions: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/settings');
        if (res.success && res.settings) {
          setSettings(res.settings);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put('/settings', settings);
      if (res.success) {
        setMessage('Company configuration saved successfully!');
      }
    } catch (err) {
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-emerald-600" />
            <span>Company & System Settings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage company details, ticket prefix, cancellation rules, and billing policies
          </p>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200 animate-in fade-in flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Branding */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="h-4 w-4 text-emerald-600" />
            <span>Company Profile & Branding</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Helpdesk Phone / Mobile
              </label>
              <input
                type="text"
                value={settings.contactNumber}
                onChange={(e) => handleChange('contactNumber', e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
              Registered Head Office Address
            </label>
            <input
              type="text"
              value={settings.companyAddress}
              onChange={(e) => handleChange('companyAddress', e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
            />
          </div>
        </div>

        {/* Ticketing & Cancellation Rules */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="h-4 w-4 text-emerald-600" />
            <span>Ticketing Configuration & Cancellation Rules</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Ticket Serial Prefix
              </label>
              <input
                type="text"
                value={settings.ticketPrefix}
                onChange={(e) => handleChange('ticketPrefix', e.target.value)}
                placeholder="TKT"
                className="w-full rounded-xl border border-slate-300 p-2.5 font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Cancellation Fee (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.cancellationChargePercentage}
                onChange={(e) => handleChange('cancellationChargePercentage', parseFloat(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
              Ticket Terms & Conditions
            </label>
            <textarea
              rows={4}
              value={settings.termsAndConditions}
              onChange={(e) => handleChange('termsAndConditions', e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-mono text-[11px]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
