import React, { useState, useEffect } from 'react';
import { X, User, Check, Loader2 } from 'lucide-react';

export default function SantriFormModal({ isOpen, onClose, onSuccess, addToast, editingSantri = null }) {
  const [nis, setNis] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [gender, setGender] = useState('Putra');
  const [jenjang, setJenjang] = useState('SMP');
  const [kelas, setKelas] = useState('');
  const [namaWali, setNamaWali] = useState('');
  const [noHp, setNoHp] = useState('');
  const [statusAktif, setStatusAktif] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingSantri) {
      setNis(editingSantri.nis || '');
      setNamaLengkap(editingSantri.nama_lengkap || '');
      setGender(editingSantri.gender || 'Putra');
      setJenjang(editingSantri.jenjang || 'SMP');
      setKelas(editingSantri.kelas || '');
      setNamaWali(editingSantri.nama_wali || '');
      setNoHp(editingSantri.no_hp || '');
      setStatusAktif(editingSantri.status_aktif !== undefined ? editingSantri.status_aktif : true);
    } else {
      // Auto recommend NIS format with current year
      const y = new Date().getFullYear();
      setNis(`${y}01${String(Math.floor(100 + Math.random() * 900))}`);
      setNamaLengkap('');
      setGender('Putra');
      setJenjang('SMP');
      setKelas('7-A');
      setNamaWali('');
      setNoHp('');
      setStatusAktif(true);
    }
  }, [editingSantri, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nis.trim() || !namaLengkap.trim() || !kelas.trim()) {
      addToast('NIS, Nama Lengkap, dan Kelas wajib diisi.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('sikeja_token');
      const res = await fetch('/api/sikeja', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'save_santri',
          id: editingSantri?.id || null,
          nis: nis.trim(),
          nama_lengkap: namaLengkap.trim(),
          gender,
          jenjang,
          kelas: kelas.trim(),
          nama_wali: namaWali.trim(),
          no_hp: noHp.trim(),
          status_aktif: statusAktif,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        addToast(data.error || 'Gagal menyimpan data santri.', 'error');
      } else {
        addToast(data.message || 'Data santri berhasil disimpan.', 'success');
        onSuccess();
        onClose();
      }
    } catch (err) {
      addToast('Terjadi kesalahan jaringan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in no-print overflow-y-auto">
      <div className="relative w-full max-w-lg my-6 p-6 sm:p-7 rounded-2xl glass-panel-elevated bg-[#0f2d35]/95 border border-white/15 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-950/40">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {editingSantri ? 'Edit Biodata Santri' : 'Tambah Santri / Santriwati Baru'}
            </h3>
            <p className="text-xs text-slate-300">Data induk peserta didik pondok pesantren</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Nomor Induk Santri (NIS)
              </label>
              <input
                type="text"
                required
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="Misal: 202601001"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Jenis Kelamin (Gender)
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
              >
                <option value="Putra" className="bg-slate-900">Putra (Santri)</option>
                <option value="Putri" className="bg-slate-900">Putri (Santriwati)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              placeholder="Masukkan nama lengkap santri"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Jenjang Pendidikan
              </label>
              <select
                value={jenjang}
                onChange={(e) => setJenjang(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
              >
                <option value="SMP" className="bg-slate-900">SMP (Sekolah Menengah Pertama)</option>
                <option value="MA" className="bg-slate-900">MA (Madrasah Aliyah)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Kelas
              </label>
              <input
                type="text"
                required
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder="Misal: 7-A atau 10-IPA"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Nama Orang Tua / Wali
              </label>
              <input
                type="text"
                value={namaWali}
                onChange={(e) => setNamaWali(e.target.value)}
                placeholder="Nama ayah/ibu/wali"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                No. WhatsApp / HP
              </label>
              <input
                type="text"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Status Keaktifan Santri</div>
              <div className="text-[11px] text-slate-400">
                Santri aktif akan diikutsertakan dalam tagihan bulanan otomatis
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={statusAktif}
                onChange={(e) => setStatusAktif(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

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
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editingSantri ? 'Simpan Perubahan' : 'Tambahkan Santri'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

