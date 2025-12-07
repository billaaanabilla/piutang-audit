import { GoogleGenAI } from "@google/genai";
import { Receivable, AuditResult } from '../types';

export const generateAuditAnalysis = async (receivables: Receivable[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key tidak ditemukan. Mohon konfigurasi environment variable.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prepare summary data
  const totalAR = receivables.reduce((sum, r) => sum + r.amount, 0);
  const disputedItems = receivables.filter(r => r.auditResult === AuditResult.Dispute);
  const noResponseItems = receivables.filter(r => r.auditResult === AuditResult.NoResponse);
  const totalDisputed = disputedItems.reduce((sum, r) => sum + r.amount, 0);
  
  const prompt = `
    Anda adalah auditor senior berpengalaman. Analisis ringkasan data konfirmasi piutang berikut ini dan buatkan paragraf "Temuan Audit" (Audit Finding) yang profesional dalam Bahasa Indonesia untuk dimasukkan ke dalam laporan audit.
    
    Data:
    - Total Piutang: Rp ${totalAR.toLocaleString('id-ID')}
    - Jumlah Sampel: ${receivables.length}
    - Total Sengketa (Dispute): Rp ${totalDisputed.toLocaleString('id-ID')} (${disputedItems.length} invoice)
    - Tidak Merespon: ${noResponseItems.length} customer
    
    Instruksi:
    1. Berikan analisis singkat mengenai risiko piutang tak tertagih.
    2. Berikan rekomendasi langkah selanjutnya untuk item yang sengketa dan tidak merespon.
    3. Gunakan bahasa formal auditor.
    4. Maksimal 150 kata.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Gagal menghasilkan analisis.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan saat menghubungi layanan AI. Silakan coba lagi.";
  }
};