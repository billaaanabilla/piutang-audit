import React from 'react';
import { useApp } from '../App';
import { AuditResult, ConfirmationStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, CheckCircle, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { state } = useApp();
  const { receivables, selectedClientId } = state;

  // Filter receivables by selected client
  const clientReceivables = receivables.filter(r => r.clientId === selectedClientId);

  // Stats Calculations
  const totalAR = clientReceivables.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCustomers = new Set(clientReceivables.map(r => r.customerName)).size;
  
  const matchCount = clientReceivables.filter(r => r.auditResult === AuditResult.Match).length;
  const disputeCount = clientReceivables.filter(r => r.auditResult === AuditResult.Dispute).length;
  const noResponseCount = clientReceivables.filter(r => r.auditResult === AuditResult.NoResponse).length;
  const pendingCount = clientReceivables.filter(r => r.auditResult === AuditResult.NotStarted).length;

  const responseCount = clientReceivables.filter(r => 
    r.confirmationStatus === ConfirmationStatus.Responded || 
    r.auditResult !== AuditResult.NotStarted
  ).length;
  
  const responseRate = clientReceivables.length > 0 ? Math.round((responseCount / clientReceivables.length) * 100) : 0;

  // Chart Data
  const statusData = [
    { name: 'Cocok (Match)', value: matchCount, color: '#22c55e' }, // Green
    { name: 'Selisih (Dispute)', value: disputeCount, color: '#eab308' }, // Yellow
    { name: 'Tidak Respon', value: noResponseCount, color: '#ef4444' }, // Red
    { name: 'Pending', value: pendingCount, color: '#94a3b8' }, // Slate
  ];

  const agingSummary = clientReceivables.reduce((acc, curr) => {
    acc[curr.agingCategory] = (acc[curr.agingCategory] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const agingData = Object.keys(agingSummary).map(key => ({
    name: key,
    amount: agingSummary[key]
  }));

  if (!selectedClientId) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Silakan pilih klien terlebih dahulu dari sidebar.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Audit Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Piutang" 
          value={`Rp ${(totalAR / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Jt`} 
          icon={<DollarSign className="text-blue-600" />} 
          bg="bg-blue-50"
        />
        <StatCard 
          title="Response Rate" 
          value={`${responseRate}%`} 
          icon={<CheckCircle className="text-green-600" />} 
          bg="bg-green-50"
        />
        <StatCard 
          title="Total Customer" 
          value={totalCustomers.toString()} 
          icon={<Users className="text-purple-600" />} 
          bg="bg-purple-50"
        />
        <StatCard 
          title="Dispute / Selisih" 
          value={disputeCount.toString()} 
          icon={<AlertTriangle className="text-yellow-600" />} 
          bg="bg-yellow-50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Status Konfirmasi</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aging Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Distribusi Aging Piutang</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => `${val/1000000}M`} />
                <Tooltip formatter={(val: number) => `Rp ${val.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#3b82f6" name="Total Amount" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Mini Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">Aktivitas Terkini</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Invoice</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Update Terakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientReceivables.length > 0 ? (
                clientReceivables.slice(0, 5).map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{r.customerName}</td>
                    <td className="px-6 py-3 text-gray-500">{r.invoiceNo}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${r.auditResult === AuditResult.Match ? 'bg-green-100 text-green-700' :
                          r.auditResult === AuditResult.Dispute ? 'bg-yellow-100 text-yellow-700' :
                          r.auditResult === AuditResult.NoResponse ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'}`}>
                        {r.auditResult === AuditResult.NotStarted ? r.confirmationStatus : r.auditResult}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{r.lastActionDate || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-400">Belum ada data piutang untuk klien ini. Silakan upload data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Simple Stat Card Component
const StatCard = ({ title, value, icon, bg }: { title: string, value: string, icon: React.ReactNode, bg: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
    <div className={`p-3 rounded-full mr-4 ${bg}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
    </div>
  </div>
);

export default Dashboard;