import React, { useState } from 'react';
import { useApp } from '../App';
import { AuditResult, ConfirmationStatus } from '../types';
import { Search, Phone, Edit, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

const ResponseTracker = () => {
  const { state, updateReceivable } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for Dispute Modal
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [disputeAmount, setDisputeAmount] = useState<string>('');

  // Filter by Client AND Search Term
  const filteredData = state.receivables.filter(r => 
    r.clientId === state.selectedClientId &&
    (r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     r.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStatusUpdate = (id: string, result: AuditResult) => {
    if (result === AuditResult.Dispute) {
      // Open Modal
      const item = state.receivables.find(r => r.id === id);
      setSelectedDisputeId(id);
      setDisputeAmount(item ? item.amount.toString() : '');
      setShowDisputeModal(true);
    } else {
      // Direct update for Match / NoResponse
      updateReceivable(id, {
        auditResult: result,
        confirmationStatus: ConfirmationStatus.Responded,
        lastActionDate: new Date().toISOString().split('T')[0]
      });
    }
  };

  const saveDispute = () => {
    if (selectedDisputeId && disputeAmount) {
      updateReceivable(selectedDisputeId, {
        auditResult: AuditResult.Dispute,
        confirmedAmount: parseFloat(disputeAmount),
        confirmationStatus: ConfirmationStatus.Responded,
        lastActionDate: new Date().toISOString().split('T')[0]
      });
      setShowDisputeModal(false);
      setSelectedDisputeId(null);
      setDisputeAmount('');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Response Tracker</h1>
          <p className="text-gray-500 text-sm">Monitor status dan update hasil konfirmasi manual</p>
        </div>
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Cari Customer / Invoice..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredData.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:border-blue-200 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900">{item.customerName}</h3>
                <span className={`text-xs px-2 py-0.5 rounded border 
                  ${item.agingCategory === '>90' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                  Aging: {item.agingCategory} days
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mt-2">
                <div>
                  <span className="block text-xs text-gray-400">Invoice No</span>
                  {item.invoiceNo}
                </div>
                <div>
                  <span className="block text-xs text-gray-400">Book Amount</span>
                  <span className="font-medium text-gray-900">Rp {item.amount.toLocaleString('id-ID')}</span>
                </div>
                 <div>
                  <span className="block text-xs text-gray-400">Audit Result</span>
                  <span className={`font-bold 
                    ${item.auditResult === 'Match' ? 'text-green-600' : 
                      item.auditResult === 'Dispute' ? 'text-yellow-600' : 
                      item.auditResult === 'NoResponse' ? 'text-red-600' : 'text-gray-400'}`}>
                    {item.auditResult === 'NotStarted' ? '-' : item.auditResult}
                  </span>
                  {item.auditResult === 'Dispute' && item.confirmedAmount && (
                    <div className="text-xs text-red-500 font-semibold mt-1">
                      Diff: Rp {(item.amount - item.confirmedAmount).toLocaleString('id-ID')}
                    </div>
                  )}
                </div>
                <div>
                  <span className="block text-xs text-gray-400">Last Update</span>
                  {item.lastActionDate || '-'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => handleStatusUpdate(item.id, AuditResult.Match)}
                className={`flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                  ${item.auditResult === 'Match' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-700 border-green-200 hover:bg-green-50'}`}
              >
                <CheckCircle size={16} className="mr-2" /> Cocok
              </button>
              <button 
                onClick={() => handleStatusUpdate(item.id, AuditResult.Dispute)}
                className={`flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                  ${item.auditResult === 'Dispute' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-yellow-700 border-yellow-200 hover:bg-yellow-50'}`}
              >
                <AlertTriangle size={16} className="mr-2" /> Selisih
              </button>
              <button 
                onClick={() => handleStatusUpdate(item.id, AuditResult.NoResponse)}
                className={`flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                  ${item.auditResult === 'NoResponse' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-700 border-red-200 hover:bg-red-50'}`}
              >
                <XCircle size={16} className="mr-2" /> No Res
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200" title="Log Call">
                <Phone size={18} />
              </button>
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Tidak ada data ditemukan untuk klien ini.</p>
          </div>
        )}
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Input Konfirmasi Selisih</h3>
              <button onClick={() => setShowDisputeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              Masukkan nominal piutang yang diakui oleh customer. Sistem akan menghitung selisih secara otomatis.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nominal Saldo Buku</label>
              <div className="p-2 bg-gray-100 rounded border border-gray-200 text-gray-600">
                Rp {state.receivables.find(r => r.id === selectedDisputeId)?.amount.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nominal Diakui Customer</label>
              <input 
                type="number" 
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                value={disputeAmount}
                onChange={(e) => setDisputeAmount(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDisputeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button 
                onClick={saveDispute}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseTracker;