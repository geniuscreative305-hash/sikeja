'use client';

import React, { useState, useEffect, useCallback } from 'react';
import LandingPage from '@/components/LandingPage';
import LoginModal from '@/components/LoginModal';
import Sidebar from '@/components/Sidebar';
import DashboardView from '@/components/DashboardView';
import KeuanganView from '@/components/KeuanganView';
import SantriView from '@/components/SantriView';
import SettingView from '@/components/SettingView';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';

// Modals
import GenerateBillsModal from '@/components/GenerateBillsModal';
import MultiMonthPayModal from '@/components/MultiMonthPayModal';
import ExpenseModal from '@/components/ExpenseModal';
import KwitansiModal from '@/components/KwitansiModal';
import CollectiveReportModal from '@/components/CollectiveReportModal';
import IndividualReportModal from '@/components/IndividualReportModal';
import SantriFormModal from '@/components/SantriFormModal';
import ExcelImportModal from '@/components/ExcelImportModal';
import NaikKelasModal from '@/components/NaikKelasModal';

import {
  Building2,
  Menu,
  RefreshCw,
  Bell,
  Calendar,
  ShieldCheck,
  Users
} from 'lucide-react';

export default function AppRoot() {
  // Auth state
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // App navigation state
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'keuangan' | 'santri' | 'setting'
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [keuanganInitialFilter, setKeuanganInitialFilter] = useState({});

  // Global settings & dashboard stats state
  const [settings, setSettings] = useState({
    nama_pesantren: 'Pondok Pesantren Babakan Jamanis',
  });
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isGenerateBillsOpen, setIsGenerateBillsOpen] = useState(false);
  const [isPayBillsOpen, setIsPayBillsOpen] = useState(false);
  const [paySantriId, setPaySantriId] = useState(null);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isKwitansiOpen, setIsKwitansiOpen] = useState(false);
  const [selectedKwitansiTrx, setSelectedKwitansiTrx] = useState(null);
  const [isCollectiveReportOpen, setIsCollectiveReportOpen] = useState(false);
  const [isIndividualReportOpen, setIsIndividualReportOpen] = useState(false);
  const [individualSantriId, setIndividualSantriId] = useState(null);
  const [isSantriModalOpen, setIsSantriModalOpen] = useState(false);
  const [editingSantri, setEditingSantri] = useState(null);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [isNaikKelasOpen, setIsNaikKelasOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingSantri, setDeletingSantri] = useState(null);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Initial Auth Check from LocalStorage & Instant Cache Hydration
  useEffect(() => {
    const storedToken = localStorage.getItem('sikeja_token');
    const storedUser = localStorage.getItem('sikeja_user');
    const storedSettings = localStorage.getItem('sikeja_settings');
    const storedStats = localStorage.getItem('sikeja_dashboard_stats');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (storedSettings) {
          try {
            setSettings(JSON.parse(storedSettings));
          } catch { }
        }
        if (storedStats) {
          try {
            setDashboardStats(JSON.parse(storedStats));
          } catch { }
        }
      } catch {
        localStorage.removeItem('sikeja_token');
        localStorage.removeItem('sikeja_user');
      }
    }
    setAuthChecked(true);
  }, []);

  // 2. Fetch Settings
  const fetchSettings = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/sikeja?type=settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data && !data.error) {
        setSettings(data);
        localStorage.setItem('sikeja_settings', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }, [token]);

  // 3. Fetch Dashboard Stats
  const fetchDashboardStats = useCallback(async () => {
    if (!token) return;
    setStatsLoading(true);
    try {
      const res = await fetch('/api/sikeja?type=dashboard_stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data && !data.error) {
        setDashboardStats(data);
        localStorage.setItem('sikeja_dashboard_stats', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchSettings();
      fetchDashboardStats();
    }
  }, [token, fetchSettings, fetchDashboardStats, refreshTrigger]);

  // Handle Login Success
  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('sikeja_token', newToken);
    localStorage.setItem('sikeja_user', JSON.stringify(newUser));
  };

  // Handle Logout
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sikeja_token');
    localStorage.removeItem('sikeja_user');
    addToast('Anda telah berhasil keluar dari sistem.', 'info');
  };

  // Quick navigation helper
  const handleNavigate = (tab, filter = {}) => {
    setActiveTab(tab);
    if (tab === 'keuangan') {
      setKeuanganInitialFilter(filter);
    }
  };

  // Navigate to pay a specific student
  const handleNavigateToPay = (studentId) => {
    setPaySantriId(studentId);
    setIsPayBillsOpen(true);
  };

  // Open individual report for a specific student
  const handleOpenIndividualReport = (studentId = null) => {
    setIndividualSantriId(studentId);
    setIsIndividualReportOpen(true);
  };

  // Delete santri handler
  const confirmDeleteSantri = async () => {
    if (!deletingSantri) return;
    try {
      const res = await fetch('/api/sikeja', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'delete_santri',
          id: deletingSantri.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        addToast(data.error || 'Gagal menghapus santri.', 'error');
      } else {
        addToast('Santri berhasil dihapus dari sistem.', 'success');
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch {
      addToast('Terjadi kesalahan jaringan.', 'error');
    } finally {
      setIsDeleteConfirmOpen(false);
      setDeletingSantri(null);
    }
  };

  // Invalidate & refresh all state
  const handleDataMutationSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Formatted date string in Indonesian (e.g. "Jumat, 20 November 2026")
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Show nothing while checking initial local storage
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b2239] text-white">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is not authenticated, show Public Landing Page
  if (!token || !user) {
    return (
      <>
        <LandingPage
          onOpenLogin={() => setIsLoginOpen(true)}
          onBrowseStats={() => setIsLoginOpen(true)}
        />
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          addToast={addToast}
        />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // Authenticated Application Shell
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b2239] via-[#0f3d3e] to-[#14533c] text-white flex overflow-x-hidden w-full">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        user={user}
        onLogout={handleLogout}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 w-full ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-white/10 backdrop-blur-xl bg-[#0b2239]/80 px-3 sm:px-6 lg:px-8 flex items-center justify-between no-print min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white lg:hidden transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Institution Badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight truncate max-w-[140px] sm:max-w-xs md:max-w-md">
                {settings?.nama_pesantren || 'Pondok Pesantren Babakan Jamanis'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 whitespace-nowrap ${user.role === 'Admin'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-lime-500/20 text-lime-300 border-lime-500/30'
                }`}>
                {user.role === 'Admin' ? 'Admin Utama' : 'Tamu (Read-Only)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Active Date Display */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{todayFormatted}</span>
            </div>

            {/* Instant Refresh Button */}
            <button
              onClick={() => setRefreshTrigger((p) => p + 1)}
              disabled={statsLoading}
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-all shrink-0"
              title="Sinkronisasi Data Mutakhir"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${statsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* View Content Router */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={dashboardStats}
              loading={statsLoading}
              onRefresh={() => setRefreshTrigger((p) => p + 1)}
              onNavigate={handleNavigate}
              user={user}
              onOpenGenerateBills={() => setIsGenerateBillsOpen(true)}
              onOpenNewExpense={() => setIsExpenseOpen(true)}
            />
          )}

          {activeTab === 'keuangan' && (
            <KeuanganView
              user={user}
              settings={settings}
              onOpenGenerateBills={() => setIsGenerateBillsOpen(true)}
              onOpenPayBills={(sid = null) => {
                setPaySantriId(sid);
                setIsPayBillsOpen(true);
              }}
              onOpenNewExpense={() => setIsExpenseOpen(true)}
              onOpenKwitansi={(trx) => {
                setSelectedKwitansiTrx(trx);
                setIsKwitansiOpen(true);
              }}
              onOpenCollectiveReport={() => setIsCollectiveReportOpen(true)}
              onOpenIndividualReport={(sid = null) => handleOpenIndividualReport(sid)}
              addToast={addToast}
              initialFilter={keuanganInitialFilter}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === 'santri' && (
            <SantriView
              user={user}
              onNavigateToPay={handleNavigateToPay}
              onOpenIndividualReport={handleOpenIndividualReport}
              onOpenAddSantri={() => {
                setEditingSantri(null);
                setIsSantriModalOpen(true);
              }}
              onOpenEditSantri={(s) => {
                setEditingSantri(s);
                setIsSantriModalOpen(true);
              }}
              onOpenDeleteConfirm={(s) => {
                setDeletingSantri(s);
                setIsDeleteConfirmOpen(true);
              }}
              onOpenExcelImport={() => setIsExcelImportOpen(true)}
              onOpenNaikKelas={() => setIsNaikKelasOpen(true)}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === 'setting' && (
            <SettingView
              user={user}
              settings={settings}
              onRefreshSettings={fetchSettings}
              addToast={addToast}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <GenerateBillsModal
        isOpen={isGenerateBillsOpen}
        onClose={() => setIsGenerateBillsOpen(false)}
        onSuccess={handleDataMutationSuccess}
        addToast={addToast}
        settings={settings}
      />

      <MultiMonthPayModal
        isOpen={isPayBillsOpen}
        onClose={() => {
          setIsPayBillsOpen(false);
          setPaySantriId(null);
        }}
        onSuccess={handleDataMutationSuccess}
        addToast={addToast}
        settings={settings}
        initialSantriId={paySantriId}
      />

      <ExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        onSuccess={handleDataMutationSuccess}
        addToast={addToast}
      />

      <KwitansiModal
        isOpen={isKwitansiOpen}
        onClose={() => {
          setIsKwitansiOpen(false);
          setSelectedKwitansiTrx(null);
        }}
        transaction={selectedKwitansiTrx}
        settings={settings}
      />

      <CollectiveReportModal
        isOpen={isCollectiveReportOpen}
        onClose={() => setIsCollectiveReportOpen(false)}
        settings={settings}
      />

      <IndividualReportModal
        isOpen={isIndividualReportOpen}
        onClose={() => {
          setIsIndividualReportOpen(false);
          setIndividualSantriId(null);
        }}
        settings={settings}
        initialSantriId={individualSantriId}
      />

      <SantriFormModal
        isOpen={isSantriModalOpen}
        onClose={() => {
          setIsSantriModalOpen(false);
          setEditingSantri(null);
        }}
        onSuccess={handleDataMutationSuccess}
        addToast={addToast}
        editingSantri={editingSantri}
      />

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Konfirmasi Hapus Santri"
        message={`Apakah Anda yakin ingin menghapus santri "${deletingSantri?.nama_lengkap}" (NIS: ${deletingSantri?.nis})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Santri"
        cancelText="Batal"
        isDanger={true}
        onConfirm={confirmDeleteSantri}
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setDeletingSantri(null);
        }}
      />

      <ExcelImportModal
        isOpen={isExcelImportOpen}
        onClose={() => setIsExcelImportOpen(false)}
        onSuccess={handleDataMutationSuccess}
        addToast={addToast}
      />

      <NaikKelasModal
        isOpen={isNaikKelasOpen}
        onClose={() => setIsNaikKelasOpen(false)}
        onSuccess={handleDataMutationSuccess}
        addToast={addToast}
      />

      {/* Global Toast Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

