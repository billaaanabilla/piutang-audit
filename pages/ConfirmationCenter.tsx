import React, { useState } from 'react';
import { useApp } from '../App';
import { ConfirmationStatus } from '../types';
import { Send, Filter, CheckSquare, Square, Mail } from 'lucide-react';

const ConfirmationCenter = () => {
  const { state, updateReceivable } = useApp();
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Sent'>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter by selected Client AND status filter
  const filteredData = state.receivables.filter(r => 
    r.clientId === state.selectedClientId &&
    (filter === 'All' ? true : 
     filter === 'Pending' ? r.confirmationStatus === ConfirmationStatus.Pending : 
     r.confirmationStatus !== ConfirmationStatus.Pending)
  );

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map(r => r.id)));
    }
  };

  const sendBulkConfirmation = () => {
    if (selectedIds.size === 0) return;
    
    // Simulate sending
    selectedIds.forEach(id => {
      updateReceivable(id, { 
        confirmationStatus: ConfirmationStatus.Sent,
        lastActionDate: new Date().toISOString().split('T')[0]
      });
    });
    
    alert(`Berhasil mengirim ${selectedIds.size} email konfirmasi.`);
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Confirmation Center</h1>
          <p className="text-gray-500 text-sm">Kelola pengiriman surat konfirmasi piutang</p>
        </div>
        <div className="flex space-x-2">
           <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'All' ? 'bg-gray-200 text-gray-800' : 'bg-white text-gray-600 border border-gray-200'}`}
            onClick={() => setFilter('All')}
          >
            Semua
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'Pending' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600 border border-gray-200'}`}
            onClick={() => setFilter('Pending')}
          >
            Pending
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-2">
            <button onClick={toggleAll} className="text-gray-500 hover:text-gray-700">
              {selectedIds.size > 0 && selectedIds.size === filteredData.length ? <CheckSquare size={20} /> : <Square size={20} />}
            </button>
            <span className="text-sm font-medium text-gray-700">{selectedIds.size} Terpilih</span>
          </div>
          <button 
            onClick={sendBulkConfirmation}
            disabled={selectedIds.size === 0}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors
              ${selectedIds.size > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <Send size={16} className="mr-2" /> Kirim Konfirmasi
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Piutang</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => toggleSelection(row.id)} className="text-blue-600">
                      {selectedIds.has(row.id) ? <CheckSquare size={20} /> : <Square size={20} className="text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{row.customerName}</div>
                    <div className="text-sm text-gray-500">{row.invoiceNo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    Rp {row.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${row.confirmationStatus === 'Pending' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                      {row.confirmationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Preview</button>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    <Mail size={48} className="mx-auto text-gray-300 mb-2" />
                    Tidak ada data piutang untuk filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationCenter;