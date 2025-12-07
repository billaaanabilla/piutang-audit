export enum ConfirmationStatus {
  Pending = 'Pending',       // Belum dikirim
  Sent = 'Sent',             // Terkirim
  Delivered = 'Delivered',   // Diterima server
  Opened = 'Opened',         // Dibuka user
  Responded = 'Responded',   // Ada balasan
}

export enum AuditResult {
  NotStarted = 'NotStarted',
  Match = 'Match',           // Hijau
  Dispute = 'Dispute',       // Kuning
  NoResponse = 'NoResponse', // Merah (setelah batas waktu)
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  fiscalYear: string;
}

export interface Receivable {
  id: string;
  clientId: string; // Link to Client
  customerName: string;
  invoiceNo: string;
  amount: number;
  confirmedAmount?: number; // Nilai yang diakui customer (jika selisih)
  dueDate: string;
  agingCategory: '0-30' | '31-60' | '61-90' | '>90';
  email: string;
  confirmationStatus: ConfirmationStatus;
  auditResult: AuditResult;
  lastActionDate?: string;
  notes?: string;
  selectedForAudit: boolean;
}

export interface AppState {
  clients: Client[];
  selectedClientId: string | null;
  receivables: Receivable[];
  user: { name: string; email: string } | null;
}

export interface DashboardStats {
  totalAR: number;
  totalCustomers: number;
  responseRate: number;
  disputeRate: number;
}