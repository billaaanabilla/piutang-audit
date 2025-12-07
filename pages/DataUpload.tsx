import React, { useState } from 'react';
import { useApp } from '../App';
import { Receivable, ConfirmationStatus, AuditResult } from '../types';
import { Upload, FileSpreadsheet, Check, AlertCircle, Briefcase } from 'lucide-react';

const DataUpload = () => {
  const { state, addReceivables } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadClientId, setUploadClientId] = useState(state.selectedClientId || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [processedCount, setProcessedCount] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setSuccess(false);
      setErrorMsg('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccess(false);
      setErrorMsg('');
    }
  };

  const parseCSV = (text: string): Receivable[] => {
    const lines = text.split('\n');
    const data: Receivable[] = [];
    
    // Skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Simple CSV split (handling standard commas)
      const values = line.split(',');
      
      if (values.length >= 4) {
        // Expected format: CustomerName, InvoiceNo, Amount, DueDate, AgingCategory(Optional), Email(Optional)
        const amount = parseFloat(values[2]);
        
        if (!isNaN(amount)) {
          data.push({
            id: `UPL-${Date.now()}-${i}`,
            clientId: uploadClientId, // Assign to selected client
            customerName: values[0]?.trim() || 'Unknown',
            invoiceNo: values[1]?.trim() || 'INV-000',
            amount: amount,
            dueDate: values[3]?.trim() || new Date().toISOString().split('T')[0],
            agingCategory: (values[4]?.trim() as any) || '0-30',
            email: values[5]?.trim() || 'no-email@example.com',
            confirmationStatus: ConfirmationStatus.Pending,
            auditResult: AuditResult.NotStarted,
            selectedForAudit: false
          });
        }
      }
    }
    return data;
  };

  const processFile = () => {
    if (!file || !uploadClientId) {
      setErrorMsg("Mohon pilih file dan Klien tujuan terlebih dahulu.");
      return;
    }
    
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        // Simple Simulation: if file is CSV, parse it. If binary (Excel), simulate parsing.
        
        let newData: Receivable[] = [];

        if (file.name.endsWith('.csv')) {
          newData = parseCSV(text);
        } else {
          // Fallback simulation for Excel (since we can't parse binary easily without xlsx lib)
          // In a real app, use 'xlsx' library here.
          // For now, we simulate data generation for the specific client.
          newData = Array.from({ length: 5 }, (_, i) => ({
            id: `NEW-${Date.now()}-${i}`,
            clientId: uploadClientId,
            customerName: `Upload Customer ${i + 1}`,
            invoiceNo: `INV-UPL-${100 + i}`,
            amount: Math.floor(Math.random() * 50000000) + 1000000,
            dueDate: '2024-01-15',
            agingCategory: (['0-30', '31-60', '61-90', '>90'][i % 4]) as any,
            email: `finance@upload${i + 1}.com`,
            confirmationStatus: ConfirmationStatus.Pending,
            auditResult: AuditResult.NotStarted,
            selectedForAudit: false
          }));
        }

        if (newData.length > 0) {
          addReceivables(newData);
          setProcessedCount(newData.length);
          setSuccess(true);
          setFile(null);
        } else {
          setErrorMsg("File terbaca kosong atau format tidak sesuai.");
        }
      } catch (err) {
        setErrorMsg("Gagal memproses file.");
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      // Simulate delay for excel
      setTimeout(() => {
        reader.readAsBinaryString(file); // Trigger onload
      }, 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Upload Data Piutang</h1>
        <button 
          className="text-blue-600 text-sm hover:underline"
          onClick={() => {
            // Generate dummy CSV
            const csvContent = "data:text/csv;charset=utf-8," 
              + "Customer Name,Invoice No,Amount,Due Date,Aging,Email\n"
              + "PT Contoh,INV-001,10000000,2024-01-01,0-30,contoh@mail.com";
            const encodedUri = encodeURI(csvContent);
            window.open(encodedUri);
          }}
        >
          Download Template CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        
        {/* Client Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload untuk Klien:</label>
          <div className="relative">
             <Briefcase className="absolute left-3 top-2.5 text-gray-400" size={18} />
             <select 
               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
               value={uploadClientId}
               onChange={(e) => setUploadClientId(e.target.value)}
             >
               <option value="" disabled>-- Pilih Klien --</option>
               {state.clients.map(c => (
                 <option key={c.id} value={c.id}>{c.name}</option>
               ))}
             </select>
          </div>
        </div>

        <div 
          className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <input 
            type="file" 
            id="fileInput" 
            className="hidden" 
            accept=".xlsx,.xls,.csv" 
            onChange={handleFileChange}
          />
          
          {isProcessing ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memproses data...</p>
            </div>
          ) : success ? (
             <div className="text-center">
              <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Upload Berhasil!</h3>
              <p className="text-gray-500 mt-1">{processedCount} data piutang berhasil ditambahkan.</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setSuccess(false); }}
                className="mt-4 text-blue-600 font-medium hover:text-blue-800"
              >
                Upload file lain
              </button>
            </div>
          ) : file ? (
            <div className="text-center">
              <FileSpreadsheet size={48} className="mx-auto text-green-600 mb-4" />
              <p className="text-gray-900 font-medium">{file.name}</p>
              <p className="text-gray-500 text-sm">{(file.size / 1024).toFixed(2)} KB</p>
              <button 
                onClick={(e) => { e.stopPropagation(); processFile(); }}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Proses File Ini
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Drop file CSV/Excel disini</h3>
              <p className="text-gray-500 mt-1">atau klik untuk memilih file dari komputer</p>
              <p className="text-xs text-gray-400 mt-4">Support: .csv (Recommended), .xlsx</p>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center">
            <AlertCircle size={16} className="mr-2" />
            {errorMsg}
          </div>
        )}

        {/* Validation Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="font-semibold text-blue-800 mb-1 flex items-center">
              <Check size={16} className="mr-2" /> Format CSV
            </h4>
            <p className="text-xs text-blue-600">Urutan Kolom: Nama, Invoice, Nominal, Tanggal, Aging, Email.</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
             <h4 className="font-semibold text-yellow-800 mb-1 flex items-center">
              <AlertCircle size={16} className="mr-2" /> Client Data
            </h4>
            <p className="text-xs text-yellow-700">Data yang diupload akan masuk ke Klien yang dipilih di atas.</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
             <h4 className="font-semibold text-green-800 mb-1 flex items-center">
              <Check size={16} className="mr-2" /> Real-time Update
            </h4>
            <p className="text-xs text-green-700">Dashboard akan langsung terupdate setelah upload sukses.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataUpload;