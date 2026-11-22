import React, { useState, useEffect } from 'react';
import { 
  Users2, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Upload,
  GraduationCap
} from 'lucide-react';
import { formatIDR } from './DashboardView';

export default function SantriView({ 
  user, 
  onNavigateToPay, 
  onOpenIndividualReport, 
  onOpenAddSantri, 
  onOpenEditSantri,
  onOpenDeleteConfirm,
  onOpenExcelImport,
  onOpenNaikKelas,
  refreshTrigger 
}) {
  const [santriList, setSantriList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [jenjang, setJenjang] = useState('');
  const [gender, setGender] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 15 });

  const fetchSantri = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sikeja_token');
      let url = `/api/sikeja?type=santri&page=${page}&limit=15`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (jenjang) url += `&jenjang=${encodeURIComponent(jenjang)}`;
      if (gender) url += `&gender=${encodeURIComponent(gender)}`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.data) {
        setSantriList(data.data);
        setPagination(data.pagination || { total: data.data.length, totalPages: 1, limit: 15 });
      }
    } catch (err) {
      console.error('Error fetching santri list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSantri();
  }, [page, jenjang, gender, statusFilter, refreshTrigger]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSantri();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Data Santri & Santriwati</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Total {pagination.total} Terdata
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Manajemen biodata santri SMP, MA, & Mahasiswa beserta monitoring status tagihan dan kenaikan kelas.
          </p>
        </div>

        {user?.role === 'Admin' && (
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              onClick={onOpenExcelImport}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
              title="Unggah Data Santri via File Excel"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Import Excel</span>
            </button>

            <button
              onClick={onOpenNaikKelas}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
              title="Kenaikan Kelas Santri & Arsip Histori"
            >
              <GraduationCap className="w-4 h-4 text-sky-400" />
              <span>Naik Kelas</span>
            </button>

            <button
              onClick={onOpenAddSantri}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Santri</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-3.5 sm:p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama santri, NIS, atau kelas..."
              className="w-full pl-10 pr-20 py-2.5 sm:py-2 rounded-xl glass-input text-xs text-white placeholder-slate-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors"
            >
              Cari
            </button>
          </form>

          {/* Filters Grid for Mobile (2 cols on mobile, 7 cols on desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:col-span-7 gap-2">
            {/* Jenjang Filter */}
            <div>
              <select
                value={jenjang}
                onChange={(e) => { setJenjang(e.target.value); setPage(1); }}
                className="w-full px-2.5 py-2 rounded-xl glass-input text-xs text-white"
              >
                <option value="" className="bg-slate-900">Semua Jenjang</option>
                <option value="SMP" className="bg-slate-900">Unit SMP</option>
                <option value="MA" className="bg-slate-900">Unit MA</option>
                <option value="Mahasiswa" className="bg-slate-900">Mahasiswa (INN)</option>
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <select
                value={gender}
                onChange={(e) => { setGender(e.target.value); setPage(1); }}
                className="w-full px-2.5 py-2 rounded-xl glass-input text-xs text-white"
              >
                <option value="" className="bg-slate-900">Semua Gender</option>
                <option value="Putra" className="bg-slate-900">Putra</option>
                <option value="Putri" className="bg-slate-900">Putri</option>
              </select>
            </div>

            {/* Status Santri (Aktif, Nonaktif, Lulus) */}
            <div className="col-span-2 sm:col-span-1">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full px-2.5 py-2 rounded-xl glass-input text-xs text-white"
              >
                <option value="" className="bg-slate-900">Semua Status</option>
                <option value="Aktif" className="bg-slate-900">Aktif Saja</option>
                <option value="Nonaktif" className="bg-slate-900">Non-Aktif Saja</option>
                <option value="Lulus" className="bg-slate-900">Lulus (Alumni)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Data Santri Container (Responsive: Mobile Cards + Desktop Table) */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        {/* 1. Mobile Cards View (< md) */}
        <div className="block md:hidden divide-y divide-white/5 p-3 sm:p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
              Memuat data santri...
            </div>
          ) : santriList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 italic">
              Tidak ada santri yang ditemukan.
            </div>
          ) : (
            santriList.map((s) => {
              const bill = s.current_bill;
              let statusBadgeClass = 'bg-slate-700/60 text-slate-400 border-slate-600/50';
              let statusText = 'Belum Ditagih';

              if (bill?.status_bayar === 'Lunas') {
                statusBadgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                statusText = 'Lunas';
              } else if (bill?.status_bayar === 'Sebagian') {
                statusBadgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                statusText = 'Sebagian';
              } else if (bill?.status_bayar === 'Belum Bayar') {
                statusBadgeClass = 'bg-red-500/20 text-red-300 border-red-500/30';
                statusText = 'Nunggak';
              }

              return (
                <div key={s.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2.5">
                  {/* Top: NIS & Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-medium text-slate-300 text-xs">{s.nis}</span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap ${
                        s.jenjang === 'Mahasiswa'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : s.jenjang === 'MA'
                          ? 'bg-teal-500/20 text-teal-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {s.jenjang} - {s.kelas}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 whitespace-nowrap">
                        {s.gender}
                      </span>
                      {s.status === 'Lulus' ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 whitespace-nowrap">
                          🎓 Lulus
                        </span>
                      ) : (s.status === 'Nonaktif' || !s.status_aktif) ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                          Non-Aktif
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                          Aktif
                        </span>
                      )}
                      {Array.isArray(s.riwayat_kelas) && s.riwayat_kelas.length > 0 && (
                        <span 
                          className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10 whitespace-nowrap"
                          title={s.riwayat_kelas.map(r => `${r.tahun_ajaran || ''}: ${r.dari_kelas} → ${r.ke_kelas}`).join('\n')}
                        >
                          Histori: {s.riwayat_kelas.length}x
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Nama & Wali */}
                  <div>
                    <div className="font-bold text-white text-sm leading-snug">{s.nama_lengkap}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2">
                      <span>Wali: <strong className="text-slate-200">{s.nama_wali || '-'}</strong></span>
                      {s.no_hp && <span>• {s.no_hp}</span>}
                    </div>
                  </div>

                  {/* Status Tagihan */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Tagihan Bulan Ini:</span>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${statusBadgeClass}`}>
                        {statusText}
                      </span>
                      {bill?.sisa_tunggakan > 0 && (
                        <div className="text-[10px] text-amber-400 mt-0.5 tabular-numbers font-medium">
                          Sisa: {formatIDR(bill.sisa_tunggakan)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons for Mobile */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => onNavigateToPay(s.id)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Kelola Bayar</span>
                    </button>

                    <button
                      onClick={() => onOpenIndividualReport(s.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-teal-400 border border-white/10 transition-colors"
                      title="Cetak Laporan Perorangan Santri"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    {user?.role === 'Admin' && (
                      <>
                        <button
                          onClick={() => onOpenEditSantri(s)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sky-400 border border-white/10 transition-colors"
                          title="Edit Data Santri"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenDeleteConfirm(s)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400 border border-white/10 transition-colors"
                          title="Hapus Santri"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 2. Desktop Table View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead>
              <tr className="bg-white/[0.04] text-slate-300 font-semibold border-b border-white/10 whitespace-nowrap">
                <th className="py-3 px-4">NIS</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4 text-center">Unit / Kelas</th>
                <th className="py-3 px-4 text-center">Gender</th>
                <th className="py-3 px-4">Wali & WhatsApp</th>
                <th className="py-3 px-4 text-center">Tagihan Bulan Ini</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
                    Memuat data santri...
                  </td>
                </tr>
              ) : santriList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    Tidak ada santri yang ditemukan.
                  </td>
                </tr>
              ) : (
                santriList.map((s) => {
                  const bill = s.current_bill;
                  let statusBadgeClass = 'bg-slate-700/60 text-slate-400 border-slate-600/50';
                  let statusText = 'Belum Ditagih';

                  if (bill?.status_bayar === 'Lunas') {
                    statusBadgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                    statusText = 'Lunas';
                  } else if (bill?.status_bayar === 'Sebagian') {
                    statusBadgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                    statusText = 'Sebagian';
                  } else if (bill?.status_bayar === 'Belum Bayar') {
                    statusBadgeClass = 'bg-red-500/20 text-red-300 border-red-500/30';
                    statusText = 'Nunggak';
                  }

                  return (
                    <tr key={s.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-300 whitespace-nowrap">
                        {s.nis}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm whitespace-nowrap">{s.nama_lengkap}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {s.status === 'Lulus' ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 whitespace-nowrap">
                              🎓 Lulus
                            </span>
                          ) : (s.status === 'Nonaktif' || !s.status_aktif) ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                              Non-Aktif
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                              Aktif
                            </span>
                          )}
                          {Array.isArray(s.riwayat_kelas) && s.riwayat_kelas.length > 0 && (
                            <span 
                              className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/10 whitespace-nowrap"
                              title={s.riwayat_kelas.map(r => `${r.tahun_ajaran || ''}: ${r.dari_kelas} → ${r.ke_kelas}`).join('\n')}
                            >
                              Histori: {s.riwayat_kelas.length}x
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap ${
                          s.jenjang === 'Mahasiswa'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : s.jenjang === 'MA'
                            ? 'bg-teal-500/20 text-teal-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {s.jenjang} - {s.kelas}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="text-slate-300">{s.gender}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-medium text-white whitespace-nowrap">{s.nama_wali || '-'}</div>
                        <div className="text-[11px] text-slate-400 whitespace-nowrap">{s.no_hp || '-'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${statusBadgeClass}`}>
                          {statusText}
                        </span>
                        {bill?.sisa_tunggakan > 0 && (
                          <div className="text-[10px] text-amber-400 mt-1 tabular-numbers whitespace-nowrap">
                            Sisa: {formatIDR(bill.sisa_tunggakan)}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Action Button: Kelola Bayar (jumps to Keuangan) */}
                          <button
                            onClick={() => onNavigateToPay(s.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-all whitespace-nowrap"
                            title="Kelola & Catat Pembayaran Santri Ini"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Kelola Bayar</span>
                          </button>

                          {/* Individual 3-month Report Button */}
                          <button
                            onClick={() => onOpenIndividualReport(s.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                            title="Cetak Laporan Perorangan Santri"
                          >
                            <FileText className="w-4 h-4 text-teal-400" />
                          </button>

                          {/* Edit Button (Admin Only) */}
                          {user?.role === 'Admin' && (
                            <button
                              onClick={() => onOpenEditSantri(s)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                              title="Edit Data Santri"
                            >
                              <Edit3 className="w-4 h-4 text-sky-400" />
                            </button>
                          )}

                          {/* Delete Button (Admin Only) */}
                          {user?.role === 'Admin' && (
                            <button
                              onClick={() => onOpenDeleteConfirm(s)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-colors"
                              title="Hapus Santri"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
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

