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
  Filter
} from 'lucide-react';
import { formatIDR } from './DashboardView';

export default function SantriView({ 
  user, 
  onNavigateToPay, 
  onOpenIndividualReport, 
  onOpenAddSantri, 
  onOpenEditSantri,
  onOpenDeleteConfirm,
  refreshTrigger 
}) {
  const [santriList, setSantriList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [jenjang, setJenjang] = useState('');
  const [gender, setGender] = useState('');
  const [statusAktif, setStatusAktif] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 15 });

  const fetchSantri = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sikeja_token');
      let url = `/api/sikeja?type=santri&page=${page}&limit=15`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (jenjang) url += `&jenjang=${jenjang}`;
      if (gender) url += `&gender=${gender}`;
      if (statusAktif) url += `&status_aktif=${statusAktif}`;

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
  }, [page, jenjang, gender, statusAktif, refreshTrigger]);

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
            Manajemen biodata santri SMP & MA beserta monitoring status tagihan bulan berjalan.
          </p>
        </div>

        {user?.role === 'Admin' && (
          <button
            onClick={onOpenAddSantri}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Santri Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama santri, NIS, atau kelas..."
              className="w-full pl-10 pr-20 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors"
            >
              Cari
            </button>
          </form>

          {/* Jenjang Filter */}
          <div className="md:col-span-2">
            <select
              value={jenjang}
              onChange={(e) => { setJenjang(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
            >
              <option value="" className="bg-slate-900">Semua Jenjang</option>
              <option value="SMP" className="bg-slate-900">Unit SMP</option>
              <option value="MA" className="bg-slate-900">Unit MA</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div className="md:col-span-2">
            <select
              value={gender}
              onChange={(e) => { setGender(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
            >
              <option value="" className="bg-slate-900">Semua Gender</option>
              <option value="Putra" className="bg-slate-900">Putra (Santri)</option>
              <option value="Putri" className="bg-slate-900">Putri (Santriwati)</option>
            </select>
          </div>

          {/* Status Keaktifan */}
          <div className="md:col-span-3">
            <select
              value={statusAktif}
              onChange={(e) => { setStatusAktif(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
            >
              <option value="" className="bg-slate-900">Semua Status Aktif</option>
              <option value="true" className="bg-slate-900">Aktif Saja</option>
              <option value="false" className="bg-slate-900">Non-Aktif Saja</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-white/[0.04] text-slate-300 font-semibold border-b border-white/10">
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
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                        {s.nis}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{s.nama_lengkap}</div>
                        {!s.status_aktif && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                            Non-Aktif
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          s.jenjang === 'SMP' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-teal-500/20 text-teal-300'
                        }`}>
                          {s.jenjang} - {s.kelas}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-slate-300">{s.gender}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-medium text-white">{s.nama_wali || '-'}</div>
                        <div className="text-[11px] text-slate-400">{s.no_hp || '-'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadgeClass}`}>
                          {statusText}
                        </span>
                        {bill?.sisa_tunggakan > 0 && (
                          <div className="text-[10px] text-amber-400 mt-1 tabular-numbers">
                            Sisa: {formatIDR(bill.sisa_tunggakan)}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Action Button: Kelola Bayar (jumps to Keuangan) */}
                          <button
                            onClick={() => onNavigateToPay(s.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                            title="Kelola & Catat Pembayaran Santri Ini"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Kelola Bayar</span>
                          </button>

                          {/* Individual 3-month Report Button */}
                          <button
                            onClick={() => onOpenIndividualReport(s.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                            title="Cetak Laporan 3-Bulan Perorangan"
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

