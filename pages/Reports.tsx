import React, { useState } from 'react';
import { useApp } from '../App';
import { generateAuditAnalysis } from '../services/geminiService';
import { Download, Sparkles, FileText, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports = () => {
  const { state } = useApp();
  const [analysisText, setAnalysisText] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);

  // Filter receivables by selected client
  const clientReceivables = state.receivables.filter(r => r.clientId === state.selectedClientId);

  // Prepare Report Data
  const agingGroups = ['0-30', '31-60', '61-90', '>90'];
  const agingData = agingGroups.map(group => {
    const items = clientReceivables.filter(r => r.agingCategory === group);
    const totalAmount = items.reduce((sum, r) => sum + r.amount, 0);
    // Simple provision rule: >90 days gets 50% provision, others 1%
    const provisionRate = group === '>90' ? 0.5 : 0.01; 
    const provisionAmount = totalAmount * provisionRate;
    
    return {
      name: group,
      Total: totalAmount,
      Provision: provisionAmount,
    };
  });

  const handleGenerateAI = async () => {
    setLoadingAI(true);
    const result = await generateAuditAnalysis(clientReceivables);
    setAnalysisText(result);
    setLoadingAI(false);
  };

  const handleExport = () => {
    alert("Simulasi: Mengunduh Laporan PDF untuk Klien ini...");
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan Audit & Analisis</h1>
          <p className="text-gray-500 text-sm">Working paper otomatis dan analisis cadangan kerugian piutang</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <Printer size={16} className="mr-2" /> Print Preview
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
          >
            <Download size={16} className="mr-2" /> Export PDF
          </button>
        </div>
      </div>

      {/* Aging & Provision Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Analisis Aging & Estimasi Penyisihan (Provision)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agingData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(val) => `${val/1000000}M`} />
              <Tooltip formatter={(val: number) => `Rp ${val.toLocaleString('id-ID')}`} />
              <Legend />
              <Bar dataKey="Total" fill="#3b82f6" name="Total Piutang" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Provision" fill="#ef4444" name="Estimasi Penyisihan (CKPN)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-xl border border-blue-100 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="bg-white p-2 rounded-full shadow-sm mr-3">
              <Sparkles className="text-purple-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">AI Audit Assistant</h3>
          </div>
          
          {!analysisText ? (
            <div>
              <p className="text-gray-600 mb-6 max-w-2xl">
                Gunakan kecerdasan buatan untuk menghasilkan ringkasan temuan audit secara otomatis berdasarkan data statistik piutang saat ini. Membantu mempercepat penulisan laporan akhir.
              </p>
              <button 
                onClick={handleGenerateAI}
                disabled={loadingAI}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all shadow-md flex items-center"
              >
                {loadingAI ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Menganalisis Data...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="mr-2" /> Generate Temuan Audit
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100 animate-fade-in">
              <h4 className="text-sm font-bold text-purple-700 uppercase tracking-wide mb-3">Draft Laporan Audit (Generated by AI)</h4>
              <div className="prose prose-blue text-gray-700 whitespace-pre-wrap leading-relaxed">
                {analysisText}
              </div>
              <div className="mt-4 flex space-x-3">
                <button 
                  onClick={() => setAnalysisText('')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Reset
                </button>
                <button 
                  onClick={() => navigator.clipboard.writeText(analysisText)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Copy Text
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-100 rounded-full opacity-50 blur-3xl"></div>
      </div>

      {/* Detailed Table for Report */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <FileText size={20} className="text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-700">Detail Kertas Kerja (Working Paper)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3 text-right">Saldo Buku</th>
                <th className="px-6 py-3 text-right">Saldo Konfirmasi</th>
                <th className="px-6 py-3 text-right">Selisih</th>
                <th className="px-6 py-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientReceivables.length > 0 ? (
                clientReceivables.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">{r.customerName}</td>
                    <td className="px-6 py-3 text-right">Rp {r.amount.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-3 text-right">
                      {r.auditResult === 'Match' ? `Rp ${r.amount.toLocaleString('id-ID')}` : 
                       r.auditResult === 'Dispute' && r.confirmedAmount ? `Rp ${r.confirmedAmount.toLocaleString('id-ID')}` : 
                       r.auditResult === 'Dispute' ? '-' : '-'}
                    </td>
                    <td className="px-6 py-3 text-right text-red-600 font-medium">
                      {r.auditResult === 'Dispute' && r.confirmedAmount ? 
                        `(Rp ${(r.amount - r.confirmedAmount).toLocaleString('id-ID')})` : 
                        r.auditResult === 'Dispute' ? '(Tidak ada data)' : '-'}
                    </td>
                    <td className="px-6 py-3 text-gray-500 italic">
                      {r.auditResult === 'Dispute' ? 'Selisih pencatatan (Timing Diff)' : r.auditResult}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-400">Tidak ada data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;