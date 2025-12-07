import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Upload, Send, MessageSquare, FileText, Menu, X, LogOut, Briefcase, ChevronDown } from 'lucide-react';
import { AppState, Receivable, AuditResult, ConfirmationStatus, Client } from './types';
import { MOCK_RECEIVABLES, MOCK_CLIENTS, NAV_ITEMS } from './constants';

// Pages
import Dashboard from './pages/Dashboard';
import DataUpload from './pages/DataUpload';
import ConfirmationCenter from './pages/ConfirmationCenter';
import ResponseTracker from './pages/ResponseTracker';
import Reports from './pages/Reports';

// Context
interface AppContextType {
  state: AppState;
  setReceivables: (data: Receivable[]) => void;
  updateReceivable: (id: string, updates: Partial<Receivable>) => void;
  addReceivables: (data: Receivable[]) => void;
  setSelectedClient: (clientId: string) => void;
  login: () => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// Main App Component
const App = () => {
  const [state, setState] = useState<AppState>({
    receivables: MOCK_RECEIVABLES,
    clients: MOCK_CLIENTS,
    selectedClientId: MOCK_CLIENTS[0].id, // Default to first client
    user: null, 
  });

  const setReceivables = (data: Receivable[]) => {
    setState(prev => ({ ...prev, receivables: data }));
  };

  const addReceivables = (data: Receivable[]) => {
    setState(prev => ({ ...prev, receivables: [...prev.receivables, ...data] }));
  };

  const updateReceivable = (id: string, updates: Partial<Receivable>) => {
    setState(prev => ({
      ...prev,
      receivables: prev.receivables.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
  };

  const setSelectedClient = (clientId: string) => {
    setState(prev => ({ ...prev, selectedClientId: clientId }));
  };

  const login = () => {
    setState(prev => ({ ...prev, user: { name: 'Auditor Senior', email: 'auditor@piutangflow.com' } }));
  };

  const logout = () => {
    setState(prev => ({ ...prev, user: null }));
  };

  return (
    <AppContext.Provider value={{ state, setReceivables, addReceivables, updateReceivable, setSelectedClient, login, logout }}>
      <Router>
        <Routes>
          {/* If user is logged in, redirect /login to / */}
          <Route path="/login" element={
            state.user ? <Navigate to="/" replace /> : <LoginPage />
          } />
          
          {/* Protected Routes */}
          <Route path="/*" element={
            state.user ? <MainLayout /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
};

// Helper Components for Layout
const LoginPage = () => {
  const { login } = useApp();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate a small delay for better UX
    setTimeout(() => {
      login();
      // No need to setLoading(false) as component will unmount/redirect
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Piutang Flow</h1>
          <p className="text-gray-500">Sistem Otomasi Audit Piutang</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              defaultValue="auditor@example.com" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              defaultValue="password" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
};

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout, state, setSelectedClient } = useApp();

  const getIcon = (path: string) => {
    switch (path) {
      case '/': return <LayoutDashboard size={20} />;
      case '/upload': return <Upload size={20} />;
      case '/confirmation': return <Send size={20} />;
      case '/responses': return <MessageSquare size={20} />;
      case '/reports': return <FileText size={20} />;
      default: return <LayoutDashboard size={20} />;
    }
  };

  const currentClient = state.clients.find(c => c.id === state.selectedClientId);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950">
          <span className="text-xl font-bold tracking-wider">Piutang Flow</span>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-300">
            <X size={24} />
          </button>
        </div>

        {/* Client Selector */}
        <div className="px-4 py-4 border-b border-slate-700">
          <label className="text-xs text-gray-400 uppercase font-semibold">Active Client</label>
          <div className="relative mt-2">
            <Briefcase className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <select 
              className="w-full bg-slate-800 text-white pl-10 pr-8 py-2 rounded-lg appearance-none text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              value={state.selectedClientId || ''}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              {state.clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={14} />
          </div>
        </div>

        <nav className="mt-6 px-3 space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="mr-3">{getIcon(item.path)}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 bg-slate-950">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
              {state.user?.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{state.user?.name}</p>
              <p className="text-xs text-gray-400">Auditor</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 rounded">
            <LogOut size={16} className="mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 h-16 bg-white shadow-sm z-10">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-600 focus:outline-none mr-4">
              <Menu size={24} />
            </button>
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold text-gray-800">
                {currentClient ? currentClient.name : 'Select Client'}
              </h2>
              <p className="text-xs text-gray-500">
                FY {currentClient?.fiscalYear} • {currentClient?.industry}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500 hidden lg:block">
            Terakhir update: {new Date().toLocaleDateString('id-ID')}
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<DataUpload />} />
            <Route path="/confirmation" element={<ConfirmationCenter />} />
            <Route path="/responses" element={<ResponseTracker />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;