import React, { useState, useEffect } from 'react';
import { X, GraduationCap, ArrowRight, Check, Users, History, Loader2, AlertCircle } from 'lucide-react';

export default function NaikKelasModal({ isOpen, onClose, onSuccess, addToast }) {
  const [allSantri, setAllSantri] = useState([]);
  const [loadingSantri, setLoadingSantri] = useState(false);
  const [mode, setMode] = useState('massal'); // 'massal' | 'manual'
  
  // Massal mode state
  const [selectedAsalKelas, setSelectedAsalKelas] = useState('');
  const [selectedAsalJenjang, setSelectedAsalJenjang] = useState('');
  
  // Destination state
  const [tujuanJenjang, setTujuanJenjang] = useState('SMP');
  const [tujuanKelas, setTujuanKelas] = useState('');
  const [tahunAjaran, setTahunAjaran] = useState(`${new Date().getFullYear()}/${new Date().getFullYear() + 1}`);
  const [isLulus, setIsLulus] = useState(false);

  // Manual mode state
  const [selectedSantriIds, setSelectedSantriIds] = useState(new Set());
  const [searchManual, setSearchManual] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Fetch all students for selection
  useEffect(() => {
    if (!isOpen) return;

    async function fetchStudents() {
      setLoadingSantri(true);
      try {
        const token = localStorage.getItem('sikeja_token');
        const res = await fetch('/api/sikeja?type=santri&limit=500', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json && json.data) {
          setAllSantri(json.data);
          // Set first available class as default
          const classes = Array.from(new Set(json.data.map((s) => s.kelas).filter(Boolean)));
          if (classes.length > 0 && !selectedAsalKelas) {
            setSelectedAsalKelas(classes[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching students for promotion:', err);
      } finally {
        setLoadingSantri(false);
      }
    }

    fetchStudents();
  }, [isOpen]);

  if (!isOpen) return null;

  // Extract unique classes
  const availableClasses = Array.from(
    new Set(allSantri.map((s) => `${s.jenjang} - ${s.kelas}`))
  ).sort();

  // Filter students based on mode
  let affectedSantri = [];
  if (mode === 'massal') {
    if (selectedAsalKelas) {
      affectedSantri = allSantri.filter((s) => `${s.jenjang} - ${s.kelas}` === selectedAsalKelas && s.status !== 'Lulus');
    }
  } else {
    affectedSantri = allSantri.filter((s) => selectedSantriIds.has(s.id));
  }

  const toggleSelectSantri = (id) => {
    const next = new Set(selectedSantriIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedSantriIds(next);
  };

  const handleSelectAllManual = () => {
    const filteredManual = allSantri.filter((s) =>
      s.status !== 'Lulus' &&
      (s.nama_lengkap.toLowerCase().includes(searchManual.toLowerCase()) ||
       s.nis.toLowerCase().includes(searchManual.toLowerCase()) ||
       s.kelas.toLowerCase().includes(searchManual.toLowerCase()))
    );

    if (selectedSantriIds.size === filteredManual.length) {
      setSelectedSantriIds(new Set());
    } else {
      setSelectedSantriIds(new Set(filteredManual.map((s) => s.id)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (affectedSantri.length === 0) {
      addToast('Pilih minimal 1 santri untuk diproses kenaikan kelas / kelulusan.', 'warning');
      return;
    }

    if (!isLulus && !tujuanKelas.trim()) {
      addToast('Nama kelas tujuan wajib diisi (misal: 8-A atau Semester 2).', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('sikeja_token');
      const res = await fetch('/api/sikeja', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'naik_kelas',
          santri_ids: affectedSantri.map((s) => s.id),
          ke_kelas: isLulus ? 'Alumni / Lulus' : tujuanKelas.trim(),
          ke_jenjang: tujuanJenjang,
          tahun_ajaran: tahunAjaran.trim(),
          status_baru: isLulus ? 'Lulus' : 'Aktif',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        addToast(data.error || 'Gagal memproses kenaikan kelas.', 'error');
      } else {
        addToast(data.message || `Berhasil memproses ${affectedSantri.length} santri!`, 'success');
        onSuccess();
        onClose();
      }
    } catch (err) {
      addToast('Terjadi kesalahan jaringan.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in no-print overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6 p-5 sm:p-7 rounded-2xl glass-panel-elevated bg-[#0f2d35]/95 border border-white/15 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-950/40">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Kenaikan Kelas & Kelulusan Santri
            </h3>
            <p className="text-xs text-slate-300">
              Promosikan santri ke kelas berikutnya dengan pengarsipan otomatis riwayat sebelumnya
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => setMode('massal')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'massal'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Massal per Kelas / Rombel</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'manual'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Pilih Santri Manual</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section: Sumber Santri */}
          {mode === 'massal' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Pilih Kelas Asal yang Akan Naik / Lulus
              </label>
              <select
                value={selectedAsalKelas}
                onChange={(e) => setSelectedAsalKelas(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
              >
                {availableClasses.length === 0 ? (
                  <option value="" className="bg-slate-900">Belum ada kelas terdaftar</option>
                ) : (
                  availableClasses.map((cls, idx) => (
                    <option key={idx} value={cls} className="bg-slate-900">
                      Kelas: {cls}
                    </option>
                  ))
                )}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Pilih Santri Terpilih ({selectedSantriIds.size} dipilih)
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllManual}
                  className="text-[11px] text-emerald-400 hover:underline font-semibold"
                >
                  Pilih / Batal Semua
                </button>
              </div>
              <input
                type="text"
                value={searchManual}
                onChange={(e) => setSearchManual(e.target.value)}
                placeholder="Cari santri berdasarkan nama / NIS..."
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white mb-2"
              />
              <div className="max-h-40 overflow-y-auto rounded-xl border border-white/10 divide-y divide-white/5 bg-slate-950/40 p-1">
                {allSantri
                  .filter((s) =>
                    s.status !== 'Lulus' &&
                    (s.nama_lengkap.toLowerCase().includes(searchManual.toLowerCase()) ||
                     s.nis.toLowerCase().includes(searchManual.toLowerCase()) ||
                     s.kelas.toLowerCase().includes(searchManual.toLowerCase()))
                  )
                  .map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center justify-between p-2 hover:bg-white/[0.04] rounded-lg cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedSantriIds.has(s.id)}
                          onChange={() => toggleSelectSantri(s.id)}
                          className="rounded border-white/20 text-emerald-500 focus:ring-emerald-400"
                        />
                        <div>
                          <span className="font-semibold text-white">{s.nama_lengkap}</span>
                          <span className="text-slate-400 font-mono text-[11px] ml-2">({s.nis})</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                        {s.jenjang} - {s.kelas}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          )}

          {/* Destination Form */}
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                Target Promosi / Tujuan
              </span>

              {/* Toggle Lulus */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLulus}
                  onChange={(e) => setIsLulus(e.target.checked)}
                  className="rounded border-white/20 text-emerald-500 focus:ring-emerald-400"
                />
                <span className="text-xs font-semibold text-sky-300">Tandai Santri Lulus (Alumni)</span>
              </label>
            </div>

            {!isLulus ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Jenjang Tujuan
                  </label>
                  <select
                    value={tujuanJenjang}
                    onChange={(e) => setTujuanJenjang(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  >
                    <option value="SMP" className="bg-slate-900">SMP</option>
                    <option value="MA" className="bg-slate-900">MA</option>
                    <option value="Mahasiswa" className="bg-slate-900">Mahasiswa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Kelas Tujuan Baru
                  </label>
                  <input
                    type="text"
                    required
                    value={tujuanKelas}
                    onChange={(e) => setTujuanKelas(e.target.value)}
                    placeholder="Misal: 8-A, 11-IPA, Smt 3"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Tahun Ajaran Baru
                  </label>
                  <input
                    type="text"
                    required
                    value={tahunAjaran}
                    onChange={(e) => setTahunAjaran(e.target.value)}
                    placeholder="Misal: 2026/2027"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-200 text-xs">
                Santri yang ditandai <strong>Lulus (Alumni)</strong> akan diubah statusnya menjadi <strong>Lulus</strong> dan tidak akan diikutsertakan lagi dalam tagihan bulanan otomatis, namun riwayat transaksi lama dan kelas sebelumnya tetap tersimpan rapi sebagai arsip resmi.
              </div>
            )}
          </div>

          {/* Summary Banner */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-center justify-between">
            <span>
              Total santri yang akan diproses: <strong>{affectedSantri.length} santri</strong>
            </span>
            <span className="text-[11px] text-slate-300">Histori kelas lama diarsipkan otomatis</span>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || affectedSantri.length === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Kenaikan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Proses Kenaikan ({affectedSantri.length} Santri)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

