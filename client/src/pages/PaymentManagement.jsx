import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  IndianRupee, 
  Search, 
  Download, 
  RefreshCw, 
  Calendar, 
  CheckCircle2, 
  RotateCcw,
  Wallet,
  Smartphone,
  Globe
} from 'lucide-react';
import api from '../services/api';

const PaymentManagement = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('2026-10-05');

  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/payment?date=${date}`);
      if (res.success) {
        setReportData(res);
      }
    } catch (err) {
      console.error('Failed to load payment reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, [date]);

  const paymentMethods = reportData?.paymentMethods || [];
  const bookingSources = reportData?.bookingSources || [];
  const totalCollection = reportData?.totalCollection || 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-emerald-600" />
            <span>Payment Collections & Booking Channels</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown of Cash counter drawer, UPI / QR receipts, card transactions, and distribution sources
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Top Total Collection Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
          Total Net Collection ({date})
        </span>
        <h3 className="mt-2 text-3xl font-black sm:text-4xl text-emerald-400">
          ₹{totalCollection.toLocaleString('en-IN')}
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Collected across counter desks, digital QR codes, POS card swipes, and agent channels
        </p>
      </div>

      {/* Payment Modes Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-emerald-600" />
          <span>Payment Gateway & Method Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paymentMethods.map((pm) => (
            <div key={pm.method} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{pm.method}</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  {pm.percentage}%
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">
                ₹{pm.amount.toLocaleString('en-IN')}
              </p>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mt-2">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${pm.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Sources Breakdown */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-600" />
          <span>Ticket Volume by Booking Source</span>
        </h3>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Booking Channel / Source</th>
                <th className="py-3 px-4 text-center">Tickets Issued</th>
                <th className="py-3 px-4 text-center">Share (%)</th>
                <th className="py-3 px-4 text-right">Revenue Contributed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookingSources.map((bs) => (
                <tr key={bs.source} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {bs.source}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    {bs.tickets} Tickets
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-600">
                    {bs.percentage}%
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                    ₹{bs.revenue.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
