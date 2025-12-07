import { Receivable, ConfirmationStatus, AuditResult, Client } from './types';

export const MOCK_CLIENTS: Client[] = [
  { id: 'C001', name: 'PT Mega Retail Indonesia', industry: 'Retail', fiscalYear: '2023' },
  { id: 'C002', name: 'CV Konstruksi Abadi', industry: 'Construction', fiscalYear: '2023' },
  { id: 'C003', name: 'PT Global Tech Solusi', industry: 'Technology', fiscalYear: '2024' },
];

export const MOCK_RECEIVABLES: Receivable[] = [
  // Data for Client 1 (Mega Retail)
  {
    id: '1',
    clientId: 'C001',
    customerName: 'PT Maju Jaya Abadi',
    invoiceNo: 'INV-2023-001',
    amount: 15000000,
    confirmedAmount: 15000000,
    dueDate: '2023-10-15',
    agingCategory: '>90',
    email: 'finance@majujaya.com',
    confirmationStatus: ConfirmationStatus.Responded,
    auditResult: AuditResult.Match,
    lastActionDate: '2023-11-01',
    selectedForAudit: true,
  },
  {
    id: '2',
    clientId: 'C001',
    customerName: 'CV Sumber Makmur',
    invoiceNo: 'INV-2023-045',
    amount: 5500000,
    dueDate: '2023-12-01',
    agingCategory: '31-60',
    email: 'accounting@sumbermakmur.id',
    confirmationStatus: ConfirmationStatus.Sent,
    auditResult: AuditResult.NotStarted,
    lastActionDate: '2023-12-20',
    selectedForAudit: true,
  },
  {
    id: '3',
    clientId: 'C001',
    customerName: 'PT Teknologi Digital',
    invoiceNo: 'INV-2023-089',
    amount: 45000000,
    confirmedAmount: 40000000, // Selisih 5 juta
    dueDate: '2023-12-15',
    agingCategory: '0-30',
    email: 'ap@tekno.digi.com',
    confirmationStatus: ConfirmationStatus.Responded,
    auditResult: AuditResult.Dispute,
    notes: 'Klien mengklaim retur barang senilai 5jt belum dipotong',
    lastActionDate: '2023-12-28',
    selectedForAudit: true,
  },
  // Data for Client 2 (Konstruksi Abadi)
  {
    id: '4',
    clientId: 'C002',
    customerName: 'Toko Bangunan Berkah',
    invoiceNo: 'KB-2023-092',
    amount: 210000000,
    dueDate: '2023-11-20',
    agingCategory: '61-90',
    email: 'owner@tokoberkah.com',
    confirmationStatus: ConfirmationStatus.Pending,
    auditResult: AuditResult.NotStarted,
    selectedForAudit: false,
  },
  {
    id: '5',
    clientId: 'C002',
    customerName: 'Mega Corp Intl',
    invoiceNo: 'KB-2023-099',
    amount: 1250000000,
    dueDate: '2023-10-01',
    agingCategory: '>90',
    email: 'finance@megacorp.com',
    confirmationStatus: ConfirmationStatus.Opened,
    auditResult: AuditResult.NoResponse,
    lastActionDate: '2023-12-10',
    selectedForAudit: true,
  },
];

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/' },
  { label: 'Upload Data', path: '/upload' },
  { label: 'Confirmation Center', path: '/confirmation' },
  { label: 'Response Tracker', path: '/responses' },
  { label: 'Laporan & Analisis', path: '/reports' },
];