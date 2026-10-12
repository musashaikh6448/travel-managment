import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Printer, 
  Search, 
  Bus, 
  Users, 
  TrendingUp, 
  CreditCard, 
  Globe, 
  RefreshCw,
  IndianRupee,
  Receipt,
  Armchair,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';

const ReportsManagement = () => {
  const [activeReportTab, setActiveReportTab] = useState('daily');
  const [date, setDate] = useState('2026-10-05');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-05');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let endpoint = `/reports/${activeReportTab}?date=${date}&startDate=${startDate}&endDate=${endDate}`;
      if (activeReportTab === 'monthly') {
        endpoint = `/reports/profit-loss?startDate=2026-10-01&endDate=2026-10-05`;
      }
      const res = await api.get(endpoint);
      if (res.success) {
        setReportData(res);
      }
    } catch (err) {
      console.error('Report fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeReportTab, date, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    let headers = [];
    let rows = [];

    if (activeReportTab === 'daily') {
      headers = ['Bus Number', 'Trips', 'Capacity', 'Occupied', 'Occupancy %', 'Revenue', 'Expenses', 'Net Profit'];
      rows = (reportData.busPerformance || []).map(b => [
        b.busNumber,
        b.tripsCount,
        b.capacity,
        b.occupied,
        `${b.occupancyRate}%`,
        b.revenue,
        b.expense,
        b.profit
      ]);
    } else if (activeReportTab === 'bus') {
      headers = ['Bus Number', 'Model', 'Total Trips', 'Occupied Seats', 'Occupancy %', 'Total Revenue', 'Total Expenses', 'Profit'];
      rows = (reportData.buses || []).map(b => [
        b.busNumber,
        `"${b.busName}"`,
        b.totalTrips,
        b.bookedSeats,
        `${b.occupancyRate}%`,
        b.totalRevenue,
        b.totalExpenses,
        b.totalProfit
      ]);
    } else if (activeReportTab === 'worker') {
      headers = ['Worker Name', 'Employee ID', 'Tickets Sold', 'Cancelled', 'Net Collection'];
      rows = (reportData.workers || []).map(w => [
        `"${w.workerName}"`,
        w.employeeId,
        w.totalTickets,
        w.cancelledTickets,
        w.netRevenue
      ]);
    } else {
      headers = ['Item', 'Amount'];
      rows = [['Total Revenue', reportData.summary?.totalRevenue || 0], ['Total Expenses', reportData.summary?.totalExpenses || 0], ['Net Profit', reportData.summary?.netProfit || 0]];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TMS_Report_${activeReportTab}_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'daily', label: 'Daily Master Report', icon: Calendar },
    { id: 'bus', label: 'Bus-wise Report', icon: Bus },
    { id: 'worker', label: 'Worker-wise Sales', icon: Users },
    { id: 'profit-loss', label: 'Profit & Loss Statement', icon: TrendingUp },
    { id: 'payment', label: 'Payment Channels & Source', icon: CreditCard },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4 no-print">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl flex items-center gap-2.5">
            <BarChart3 className="h-6 w-6 text-emerald-600" />
            <span>Reports & Performance Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed daily, monthly, bus-wise, staff-wise, and profit & loss audit reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-md shadow-slate-900/20"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 no-print">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm no-print">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="font-bold text-slate-700">Filter Date:</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-1.5 font-bold text-slate-800 focus:border-emerald-500 focus:outline-none"
          />
          <button
            onClick={fetchReport}
            className="rounded-xl bg-emerald-600 px-4 py-1.5 font-bold text-white hover:bg-emerald-700"
          >
            Generate
          </button>
        </div>
      </div>

      {/* Report Output Container */}
      <div id="printable-ticket" className="space-y-6">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-xs font-semibold text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
            Generating report analytics...
          </div>
        ) : !reportData ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            Select a date to generate report.
          </div>
        ) : (
          <>
            {/* 1. Daily Report Tab */}
            {activeReportTab === 'daily' && (
              <div className="space-y-6">
                {/* Summary Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5">
                    <span className="text-[10px] font-bold uppercase text-emerald-800">Gross Ticket Revenue</span>
                    <p className="text-2xl font-black text-emerald-950 mt-1">
                      ₹{(reportData.summary?.totalRevenue || 0).toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] text-emerald-700">{reportData.summary?.totalTickets || 0} Tickets Issued</span>
                  </div>

                  <div className="rounded-3xl border border-rose-100 bg-rose-50/60 p-5">
                    <span className="text-[10px] font-bold uppercase text-rose-800">Total Bus Expenses</span>
                    <p className="text-2xl font-black text-rose-950 mt-1">
                      ₹{(reportData.summary?.totalExpenses || 0).toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] text-rose-700">Fuel, Toll, Drivers</span>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white">
                    <span className="text-[10px] font-bold uppercase text-emerald-400">Net Daily Profit</span>
                    <p className="text-2xl font-black text-emerald-400 mt-1">
                      ₹{(reportData.summary?.netProfit || 0).toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] text-slate-400">Margin: {reportData.summary?.profitMargin || 0}%</span>
                  </div>

                  <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
                    <span className="text-[10px] font-bold uppercase text-blue-800">Fleet Occupancy</span>
                    <p className="text-2xl font-black text-blue-950 mt-1">
                      {reportData.summary?.occupancyRate || 0}%
                    </p>
                    <span className="text-[10px] text-blue-700">
                      {reportData.summary?.bookedSeats}/{reportData.summary?.totalSeats} Seats Booked
                    </span>
                  </div>
                </div>

                {/* Bus Performance Table */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Daily Bus Fleet Performance & Revenue
                  </h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                        <tr>
                          <th className="py-2.5 px-3">Bus Number</th>
                          <th className="py-2.5 px-3">Bus Model</th>
                          <th className="py-2.5 px-3 text-center">Trips</th>
                          <th className="py-2.5 px-3 text-center">Occupancy</th>
                          <th className="py-2.5 px-3 text-right">Revenue</th>
                          <th className="py-2.5 px-3 text-right">Expenses</th>
                          <th className="py-2.5 px-3 text-right">Net Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(reportData.busPerformance || []).map((b) => (
                          <tr key={b.busNumber} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{b.busNumber}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-700">{b.busName}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-800">{b.tripsCount}</td>
                            <td className="py-2.5 px-3 text-center font-semibold text-emerald-700">
                              {b.occupied}/{b.capacity} ({b.occupancyRate}%)
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                              ₹{b.revenue.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 text-right text-rose-600">
                              ₹{b.expense.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                              ₹{b.profit.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Worker Sales on Date */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Daily Staff Ticket Issue Breakdown
                  </h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                        <tr>
                          <th className="py-2.5 px-3">Staff Member</th>
                          <th className="py-2.5 px-3">Employee ID</th>
                          <th className="py-2.5 px-3 text-center">Confirmed Tickets</th>
                          <th className="py-2.5 px-3 text-center">Cancelled</th>
                          <th className="py-2.5 px-3 text-right">Net Collection</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(reportData.workerSales || []).map((w) => (
                          <tr key={w.workerName} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 font-bold text-slate-900">{w.workerName}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{w.employeeId}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{w.tickets}</td>
                            <td className="py-2.5 px-3 text-center text-slate-400">{w.cancelled || 0}</td>
                            <td className="py-2.5 px-3 text-right font-black text-slate-900">
                              ₹{w.revenue.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Bus-wise Performance Tab */}
            {activeReportTab === 'bus' && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm overflow-hidden">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Bus-Wise Fleet Operational Report
                </h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                      <tr>
                        <th className="py-3 px-4">Bus Number</th>
                        <th className="py-3 px-4">Bus Name</th>
                        <th className="py-3 px-4 text-center">Total Trips</th>
                        <th className="py-3 px-4 text-center">Capacity</th>
                        <th className="py-3 px-4 text-center">Occupancy Rate</th>
                        <th className="py-3 px-4 text-right">Revenue</th>
                        <th className="py-3 px-4 text-right">Expenses</th>
                        <th className="py-3 px-4 text-right">Net Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(reportData.buses || []).map((b) => (
                        <tr key={b.busId} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{b.busNumber}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{b.busName}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-800">{b.totalTrips}</td>
                          <td className="py-3 px-4 text-center text-slate-600">{b.bookedSeats} / {b.totalSeats}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                              {b.occupancyRate}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            ₹{b.totalRevenue.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right text-rose-600 font-medium">
                            ₹{b.totalExpenses.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-emerald-700 text-sm">
                            ₹{b.totalProfit.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Worker-wise Report Tab */}
            {activeReportTab === 'worker' && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm overflow-hidden">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Worker-Wise Ticket Sales Performance
                </h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                      <tr>
                        <th className="py-3 px-4">Staff Member</th>
                        <th className="py-3 px-4">Employee ID</th>
                        <th className="py-3 px-4 text-center">Tickets Sold</th>
                        <th className="py-3 px-4 text-center">Cancelled Tickets</th>
                        <th className="py-3 px-4 text-right">Net Revenue Collection</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(reportData.workers || []).map((w) => (
                        <tr key={w.workerId} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-bold text-slate-900">{w.workerName}</td>
                          <td className="py-3 px-4 font-mono text-slate-500">{w.employeeId}</td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-700">{w.totalTickets}</td>
                          <td className="py-3 px-4 text-center text-slate-400">{w.cancelledTickets}</td>
                          <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                            ₹{w.netRevenue.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Profit & Loss Statement Tab */}
            {activeReportTab === 'profit-loss' && (
              <div className="space-y-6">
                <div className="rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Statement of Profit & Loss</span>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <span className="text-xs text-slate-400">Total Ticket Revenue</span>
                      <p className="text-2xl font-black text-emerald-400">
                        ₹{(reportData.summary?.totalRevenue || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Total Operating Expenses</span>
                      <p className="text-2xl font-black text-rose-400">
                        ₹{(reportData.summary?.totalExpenses || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Net Operating Profit</span>
                      <p className="text-2xl font-black text-white">
                        ₹{(reportData.summary?.netProfit || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expense Categories Breakdown */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Expense Cost Center Breakdown
                  </h3>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(reportData.expenseCategories || []).map((cat) => (
                      <div key={cat.category} className="rounded-2xl bg-slate-50 p-3 border border-slate-100 text-xs">
                        <span className="text-slate-500 font-medium block">{cat.category}</span>
                        <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                          ₹{cat.amount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. Payment Channel & Source Report */}
            {activeReportTab === 'payment' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Payment Gateway Distribution
                  </h3>
                  <div className="mt-4 space-y-3 text-xs">
                    {(reportData.paymentMethods || []).map((pm) => (
                      <div key={pm.method} className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>{pm.method}</span>
                          <span>₹{pm.amount.toLocaleString('en-IN')} ({pm.percentage}%)</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-600"
                            style={{ width: `${pm.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Booking Channels & Agents
                  </h3>
                  <div className="mt-4 space-y-3 text-xs">
                    {(reportData.bookingSources || []).map((bs) => (
                      <div key={bs.source} className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>{bs.source}</span>
                          <span>{bs.tickets} Tix • ₹{bs.revenue.toLocaleString('en-IN')} ({bs.percentage}%)</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${bs.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsManagement;
