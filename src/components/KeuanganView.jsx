import React, { useState, useEffect } from 'react';
import { 
  WalletCards, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  PlusCircle, 
  Receipt, 
  FileText, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { formatIDR } from './DashboardView';

export default function KeuanganView({ 
  user, 
  settings, 
  onOpenGenerateBills, 
  onOpenPayBills, 
  onOpenNewExpense, 
  onOpenKwitansi, 
  onOpenCollectiveReport, 
  onOpenIndividualReport,
  addToast,
  initialFilter = {},
  refreshTrigger 
}) {
  const [activeTab, setActiveTab] = useState('Pemasukan'); // 'Pemasukan' | 'Pengeluaran'
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [quarter, setQuarter] = useState(initialFilter.quarter || '');
  const [month, setMonth] = useState(initialFilter.month || '');
  const [year, setYear] = useState(initialFilter.year || new Date().getFullYear());
  const [gender, setGender] = useState(initialFilter.gender || '');
  const [jenjang, setJenjang] = useState(initialFilter.jenjang || '');
  const [statusBayar, setStatusBayar] = useState(initialFilter.status_bayar || '');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 15 });

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sikeja_token');
      let url = `/api/sikeja?type=transactions&jenis_transaksi=${activeTab}&page=${page}&limit=15`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (quarter) url += `&quarter=${quarter}`;
      if (month) url += `&month=${month}`;
      if (year) url += `&year=${year}`;
      if (gender && activeTab === 'Pemasukan') url += `&gender=${gender}`;
      if (jenjang && activeTab === 'Pemasukan') url += `&jenjang=${jenjang}`;
      if (statusBayar && activeTab === 'Pemasukan') url += `&status_bayar=${statusBayar}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.data) {
        setTransactions(data.data);
        setPagination(data.pagination || { total: data.data.length, totalPages: 1, limit: 15 });
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [activeTab, page, quarter, month, year, gender, jenjang, statusBayar, refreshTrigger]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleQuarterClick = (q) => {
    if (quarter === q) {
      setQuarter(''); // toggle off
    } else {
      setQuarter(q);
      setMonth('');
    }
    setPage(1);
  };

  // Export CSV handler
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      addToast('Tidak ada data untuk diekspor.', 'warning');
      return;
    }

    const headers = activeTab === 'Pemasukan'
      ? ['Kode Transaksi', 'Tanggal Waktu', 'NIS', 'Nama Santri', 'Jenjang', 'Kelas', 'Gender', 'Bulan Tagihan', 'Tahun', 'Tagihan', 'Syahriah', 'Makan', 'Dibayar', 'Tunggakan', 'Status', 'Metode', 'Admin']
      : ['Kode Transaksi', 'Tanggal Waktu', 'Keterangan', 'Nominal Pengeluaran', 'Metode Bayar', 'Admin'];

    const rows = transactions.map((t) => {
      if (activeTab === 'Pemasukan') {
        return [
          t.kode_transaksi,
          `"${new Date(t.tanggal_waktu).toLocaleString('id-ID')}"`,
          t.santri?.nis || '-',
          `"${t.santri?.nama_lengkap || '-'}"`,
          t.santri?.jenjang || '-',
          t.santri?.kelas || '-',
          t.santri?.gender || '-',
          t.bulan_tagihan || '-',
          t.tahun_tagihan || '-',
          t.nominal_tagihan,
          t.alokasi_syahriah,
          t.alokasi_makan,
          t.nominal_bayar,
          t.sisa_tunggakan,
          t.status_bayar,
          t.metode_bayar,
          `"${t.admin_input || '-'}"`,
        ];
      } else {
        return [
          t.kode_transaksi,
          `"${new Date(t.tanggal_waktu).toLocaleString('id-ID')}"`,
          `"${t.keterangan || '-'}"`,
          t.nominal_bayar,
          t.metode_bayar,
          `"${t.admin_input || '-'}"`,
        ];
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SIKEJA_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Data ${activeTab} berhasil diekspor ke file CSV.`, 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Manajemen Keuangan Pesantren
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {pagination.total} Catatan
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            Pencatatan tagihan syahriah & makan santri, auto-alokasi pos kas, dan pengeluaran operasional.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 whitespace-nowrap"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Ekspor CSV</span>
          </button>

          {/* Collective Report */}
          <button
            onClick={onOpenCollectiveReport}
            className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 whitespace-nowrap"
            title="Cetak Laporan Kolektif Lunas & Nunggak"
          >
            <Printer className="w-3.5 h-3.5 text-lime-400" />
            <span>Laporan Kolektif</span>
          </button>

          {/* Individual Report Shortcut */}
          <button
            onClick={() => onOpenIndividualReport()}
            className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 whitespace-nowrap"
            title="Cetak Laporan 3-Bulan Perorangan"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Laporan 3-Bulan</span>
          </button>

          {/* Admin Operations */}
          {user?.role === 'Admin' ? (
            <>
              {activeTab === 'Pemasukan' ? (
                <>
                  <button
                    onClick={onOpenGenerateBills}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-teal-950/40 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Tagihan</span>
                  </button>
                  <button
                    onClick={() => onOpenPayBills()}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-400 hover:to-lime-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Catat Bayar</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onOpenNewExpense}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-red-950/40 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Catat Pengeluaran</span>
                </button>
              )}
            </>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
              Mode Tamu (Read-Only)
            </span>
          )}
        </div>
      </div>

      {/* Dual Mode Tabs (Pemasukan vs Pengeluaran) */}
      <div className="grid grid-cols-2 gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => { setActiveTab('Pemasukan'); setPage(1); }}
          className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'Pemasukan'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
              : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 shrink-0" />
          <span className="sm:hidden">Pemasukan</span>
          <span className="hidden sm:inline">Pemasukan (Pembayaran Santri)</span>
        </button>
        <button
          onClick={() => { setActiveTab('Pengeluaran'); setPage(1); }}
          className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'Pengeluaran'
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
              : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          <ArrowDownRight className="w-4 h-4 shrink-0" />
          <span className="sm:hidden">Pengeluaran</span>
          <span className="hidden sm:inline">Pengeluaran Pesantren</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="glass-panel p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === 'Pemasukan' ? "Cari kode, nama santri, atau NIS..." : "Cari kode atau keterangan..."}
              className="w-full pl-10 pr-20 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors"
            >
              Cari
            </button>
          </form>

          {/* Quick Quarter Filter Buttons & Year Selector */}
          <div className="md:col-span-8 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Kuartal:
              </span>
              {[
                { id: 'Q1', label: 'Q1: Jan–Mar' },
                { id: 'Q2', label: 'Q2: Apr–Jun' },
                { id: 'Q3', label: 'Q3: Jul–Sep' },
                { id: 'Q4', label: 'Q4: Okt–Des' },
              ].map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleQuarterClick(q.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    quarter === q.id
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                      : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/5'
                  }`}
                >
                  {q.id}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Tahun:</span>
              <input
                type="number"
                value={year}
                onChange={(e) => { setYear(e.target.value); setPage(1); }}
                className="w-20 px-2.5 py-1.5 rounded-xl glass-input text-xs text-white tabular-numbers"
              />
            </div>
          </div>
        </div>

        {/* Second Row of Filters for Pemasukan (Compact 2 cols on mobile, 4 cols on desktop) */}
        {activeTab === 'Pemasukan' && (
          <div className="pt-2 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Status Bayar */}
            <div>
              <select
                value={statusBayar}
                onChange={(e) => { setStatusBayar(e.target.value); setPage(1); }}
                className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-white"
              >
                <option value="" className="bg-slate-900">Semua Status Bayar</option>
                <option value="Lunas" className="bg-slate-900">Lunas</option>
                <option value="Sebagian" className="bg-slate-900">Sebagian</option>
                <option value="Belum Bayar" className="bg-slate-900">Belum Bayar (Nunggak)</option>
              </select>
            </div>

            {/* Jenjang */}
            <div>
              <select
                value={jenjang}
                onChange={(e) => { setJenjang(e.target.value); setPage(1); }}
                className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-white"
              >
                <option value="" className="bg-slate-900">Semua Jenjang</option>
                <option value="SMP" className="bg-slate-900">Unit SMP</option>
                <option value="MA" className="bg-slate-900">Unit MA</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <select
                value={gender}
                onChange={(e) => { setGender(e.target.value); setPage(1); }}
                className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-white"
              >
                <option value="" className="bg-slate-900">Semua Gender</option>
                <option value="Putra" className="bg-slate-900">Putra</option>
                <option value="Putri" className="bg-slate-900">Putri</option>
              </select>
            </div>

            {/* Specific Month (optional override) */}
            <div>
              <select
                value={month}
                onChange={(e) => { setMonth(e.target.value); setQuarter(''); setPage(1); }}
                className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-white"
              >
                <option value="" className="bg-slate-900">Bulan Bebas (Semua)</option>
                {monthNames.map((m, idx) => (
                  <option key={idx} value={idx + 1} className="bg-slate-900">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Container (Responsive: Mobile Cards + Desktop Table) */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        {/* 1. Mobile Cards View (< md) */}
        <div className="block md:hidden p-3 sm:p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
              Memuat transaksi keuangan...
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 italic">
              Tidak ada data transaksi yang cocok.
            </div>
          ) : activeTab === 'Pemasukan' ? (
            transactions.map((t) => {
              const monthLabel = t.bulan_tagihan ? monthNames[t.bulan_tagihan - 1] : '-';
              const dateStr = new Date(t.tanggal_waktu).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              let statusClass = 'bg-slate-700/60 text-slate-300 border-slate-600/50';
              if (t.status_bayar === 'Lunas') {
                statusClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
              } else if (t.status_bayar === 'Sebagian') {
                statusClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
              } else if (t.status_bayar === 'Belum Bayar') {
                statusClass = 'bg-red-500/20 text-red-300 border-red-500/30';
              }

              return (
                <div key={t.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2.5">
                  {/* Top: Kode & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-white text-xs">{t.kode_transaksi}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${statusClass}`}>
                      {t.status_bayar}
                    </span>
                  </div>

                  {/* Middle: Santri Info */}
                  <div>
                    <div className="font-bold text-white text-sm leading-snug">{t.santri?.nama_lengkap || '-'}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2">
                      <span>{t.santri?.nis}</span>
                      <span>• {t.santri?.jenjang}-{t.santri?.kelas} ({t.santri?.gender === 'Putra' ? 'L' : 'P'})</span>
                      <span>• Periode: <strong className="text-slate-200">{monthLabel} {t.tahun_tagihan}</strong></span>
                    </div>
                  </div>

                  {/* Financial Breakdown Grid */}
                  <div className="p-2.5 rounded-lg bg-black/20 border border-white/5 grid grid-cols-2 gap-2 text-[11px] tabular-numbers">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Tagihan:</span>
                      <span className="font-semibold text-slate-200">{formatIDR(t.nominal_tagihan)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Telah Dibayar:</span>
                      <span className="font-bold text-emerald-300">{formatIDR(t.nominal_bayar)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Alokasi SPP & Makan:</span>
                      <span className="text-slate-300">S: {formatIDR(t.alokasi_syahriah)} | M: {formatIDR(t.alokasi_makan)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sisa Tunggakan:</span>
                      <span className="font-bold text-amber-400">{formatIDR(t.sisa_tunggakan)}</span>
                    </div>
                  </div>

                  {/* Bottom: Date & Actions */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">{dateStr}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenKwitansi(t)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-white/10 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Struk</span>
                      </button>

                      {user?.role === 'Admin' && t.status_bayar !== 'Lunas' && t.santri_id && (
                        <button
                          onClick={() => onOpenPayBills(t.santri_id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                        >
                          Bayar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Mobile Cards for Pengeluaran */
            transactions.map((t) => (
              <div key={t.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-red-400 text-xs">{t.kode_transaksi}</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300">
                    {t.metode_bayar || 'Cash'}
                  </span>
                </div>
                <div className="font-medium text-white text-xs leading-snug">{t.keterangan || '-'}</div>
                <div className="pt-1.5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {new Date(t.tanggal_waktu).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })} • {t.admin_input || 'Admin'}
                  </span>
                  <span className="font-extrabold text-red-300 text-sm tabular-numbers">
                    -{formatIDR(t.nominal_bayar)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 2. Desktop Table View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          {activeTab === 'Pemasukan' ? (
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead>
                <tr className="bg-white/[0.04] text-slate-300 font-semibold border-b border-white/10 whitespace-nowrap">
                  <th className="py-3 px-4">Kode & Waktu</th>
                  <th className="py-3 px-4">Santri / Siswa</th>
                  <th className="py-3 px-4">Bulan Tagihan</th>
                  <th className="py-3 px-4 text-right">Tagihan</th>
                  <th className="py-3 px-4 text-right">Alokasi (SPP / Makan)</th>
                  <th className="py-3 px-4 text-right">Dibayar</th>
                  <th className="py-3 px-4 text-right">Tunggakan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
                      Memuat transaksi keuangan...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 italic">
                      Tidak ada data tagihan atau pembayaran yang cocok.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => {
                    const monthLabel = t.bulan_tagihan ? monthNames[t.bulan_tagihan - 1] : '-';
                    const dateStr = new Date(t.tanggal_waktu).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    });

                    let statusClass = 'bg-slate-700/60 text-slate-300 border-slate-600/50';
                    if (t.status_bayar === 'Lunas') {
                      statusClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                    } else if (t.status_bayar === 'Sebagian') {
                      statusClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                    } else if (t.status_bayar === 'Belum Bayar') {
                      statusClass = 'bg-red-500/20 text-red-300 border-red-500/30';
                    }

                    return (
                      <tr key={t.id} className="hover:bg-white/[0.03] transition-colors tabular-numbers">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-white text-[11px]">{t.kode_transaksi}</div>
                          <div className="text-[10px] text-slate-400">{dateStr}</div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-white">{t.santri?.nama_lengkap || '-'}</div>
                          <div className="text-[10px] text-slate-400">
                            {t.santri?.nis} • {t.santri?.jenjang}-{t.santri?.kelas} ({t.santri?.gender === 'Putra' ? 'L' : 'P'})
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-200 whitespace-nowrap">
                          {monthLabel} {t.tahun_tagihan}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-200 whitespace-nowrap">
                          {formatIDR(t.nominal_tagihan)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-[11px] text-slate-300 whitespace-nowrap">
                          <div>S: {formatIDR(t.alokasi_syahriah)}</div>
                          <div className="text-slate-400">M: {formatIDR(t.alokasi_makan)}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-300 whitespace-nowrap">
                          {formatIDR(t.nominal_bayar)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-amber-400 whitespace-nowrap">
                          {formatIDR(t.sisa_tunggakan)}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${statusClass}`}>
                            {t.status_bayar}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Struk Kwitansi Button */}
                            <button
                              onClick={() => onOpenKwitansi(t)}
                              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 text-[11px] flex items-center gap-1 transition-colors whitespace-nowrap"
                              title="Cetak Kuitansi Struk Thermal / A5"
                            >
                              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Struk</span>
                            </button>

                            {/* Pay button if not full Lunas */}
                            {user?.role === 'Admin' && t.status_bayar !== 'Lunas' && t.santri_id && (
                              <button
                                onClick={() => onOpenPayBills(t.santri_id)}
                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors whitespace-nowrap"
                                title="Bayar Tagihan Ini"
                              >
                                Bayar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* Pengeluaran Table */
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="bg-white/[0.04] text-slate-300 font-semibold border-b border-white/10 whitespace-nowrap">
                  <th className="py-3 px-4">Kode Pengeluaran</th>
                  <th className="py-3 px-4">Tanggal & Waktu</th>
                  <th className="py-3 px-4">Keterangan / Keperluan</th>
                  <th className="py-3 px-4">Metode Bayar</th>
                  <th className="py-3 px-4 text-right">Nominal Kas Keluar</th>
                  <th className="py-3 px-4">Admin Input</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-red-400" />
                      Memuat pengeluaran...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                      Belum ada catatan pengeluaran kas pesantren.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.03] transition-colors tabular-numbers">
                      <td className="py-3.5 px-4 font-mono font-bold text-red-400 whitespace-nowrap">
                        {t.kode_transaksi}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {new Date(t.tanggal_waktu).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'Asia/Jakarta',
                        })} WIB
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white max-w-md">
                        {t.keterangan || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] whitespace-nowrap">
                          {t.metode_bayar || 'Cash'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-red-300 text-sm whitespace-nowrap">
                        -{formatIDR(t.nominal_bayar)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {t.admin_input || 'Admin'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <div>
            Halaman <span className="font-bold text-white">{page}</span> dari{' '}
            <span className="font-bold text-white">{pagination.totalPages}</span> ({pagination.total} total)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

