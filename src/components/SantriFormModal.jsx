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
  const [status, setStatus] = useState('Aktif');
  const [beasiswaJenis, setBeasiswaJenis] = useState('Reguler');
  const [beasiswaTipe, setBeasiswaTipe] = useState('Full');
  const [bebasSyahriah, setBebasSyahriah] = useState(true);
  const [bebasMakan, setBebasMakan] = useState(false);
  const [nominalPotongan, setNominalPotongan] = useState(0);
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
      setStatus(
        editingSantri.status ||
        (editingSantri.status_aktif === false ? 'Nonaktif' : 'Aktif')
      );
      if (editingSantri.beasiswa) {
        setBeasiswaJenis(editingSantri.beasiswa.jenis || 'Reguler');
        setBeasiswaTipe(editingSantri.beasiswa.tipe || 'Full');
        setBebasSyahriah(editingSantri.beasiswa.bebas_syahriah ?? true);
        setBebasMakan(editingSantri.beasiswa.bebas_makan ?? false);
        setNominalPotongan(editingSantri.beasiswa.nominal_potongan || 0);
      } else {
        setBeasiswaJenis('Reguler');
        setBeasiswaTipe('Full');
        setBebasSyahriah(true);
        setBebasMakan(false);
        setNominalPotongan(0);
      }
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
      setStatus('Aktif');
      setBeasiswaJenis('Reguler');
      setBeasiswaTipe('Full');
      setBebasSyahriah(true);
      setBebasMakan(false);
      setNominalPotongan(0);
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
          status,
          status_aktif: status === 'Aktif',
          beasiswa: {
            jenis: beasiswaJenis,
            tipe: beasiswaTipe,
            bebas_syahriah: bebasSyahriah,
            bebas_makan: bebasMakan,
            nominal_potongan: parseFloat(nominalPotongan) || 0,
          },
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
                <option value="Mahasiswa" className="bg-slate-900">Mahasiswa (Perguruan Tinggi / INN)</option>
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

          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
            <div>
              <div className="text-xs font-bold text-white">Status Santri di Pesantren</div>
              <div className="text-[11px] text-slate-400">
                Pilih status keaktifan akademik untuk menentukan tagihan bulanan
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStatus('Aktif')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  status === 'Aktif'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-950/40'
                    : 'bg-white/[0.02] text-slate-400 border-white/10 hover:bg-white/5 hover:text-white'
                }`}
              >
                ● Aktif
              </button>
              <button
                type="button"
                onClick={() => setStatus('Nonaktif')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  status === 'Nonaktif'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-950/40'
                    : 'bg-white/[0.02] text-slate-400 border-white/10 hover:bg-white/5 hover:text-white'
                }`}
              >
                ○ Nonaktif
              </button>
              <button
                type="button"
                onClick={() => setStatus('Lulus')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  status === 'Lulus'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-md shadow-sky-950/40'
                    : 'bg-white/[0.02] text-slate-400 border-white/10 hover:bg-white/5 hover:text-white'
                }`}
              >
                🎓 Lulus (Alumni)
              </button>
            </div>
          </div>

          {/* Beasiswa & Diskon Biaya Section */}
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-300">Program Beasiswa & Diskon</div>
                <div className="text-[11px] text-slate-400">
                  Keringanan biaya bagi santri berprestasi atau afirmasi
                </div>
              </div>
              {beasiswaJenis !== 'Reguler' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {beasiswaTipe === 'Full' ? 'Bebas 100%' : 'Parsial'}
                </span>
              )}
            </div>

            {/* Kategori Beasiswa */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBeasiswaJenis('Reguler')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                  beasiswaJenis === 'Reguler'
                    ? 'bg-slate-700/60 text-white border-white/30 shadow-md'
                    : 'bg-white/[0.02] text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                Reguler
              </button>
              <button
                type="button"
                onClick={() => setBeasiswaJenis('Prestasi')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                  beasiswaJenis === 'Prestasi'
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-md'
                    : 'bg-white/[0.02] text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                Prestasi
              </button>
              <button
                type="button"
                onClick={() => setBeasiswaJenis('Keluarga Tidak Mampu')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                  beasiswaJenis === 'Keluarga Tidak Mampu'
                    ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-md'
                    : 'bg-white/[0.02] text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                Afirmasi / Dhuafa
              </button>
            </div>

            {/* Detail Beasiswa jika bukan Reguler */}
            {beasiswaJenis !== 'Reguler' && (
              <div className="pt-2 border-t border-white/10 space-y-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-300">Tipe Keringanan:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBeasiswaTipe('Full')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        beasiswaTipe === 'Full'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                          : 'bg-white/[0.04] text-slate-300 border-white/10'
                      }`}
                    >
                      Full (100% Bebas Biaya)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBeasiswaTipe('Sebagian')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        beasiswaTipe === 'Sebagian'
                          ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold'
                          : 'bg-white/[0.04] text-slate-300 border-white/10'
                      }`}
                    >
                      Sebagian (Parsial)
                    </button>
                  </div>
                </div>

                {beasiswaTipe === 'Sebagian' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={bebasSyahriah}
                          onChange={(e) => setBebasSyahriah(e.target.checked)}
                          className="rounded border-white/20 text-emerald-500 focus:ring-0 bg-slate-900"
                        />
                        <span>Bebas Syahriah (SPP)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={bebasMakan}
                          onChange={(e) => setBebasMakan(e.target.checked)}
                          className="rounded border-white/20 text-emerald-500 focus:ring-0 bg-slate-900"
                        />
                        <span>Bebas Uang Makan</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Potongan Nominal Khusus Tambahan (Rp)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        value={nominalPotongan}
                        onChange={(e) => setNominalPotongan(e.target.value)}
                        placeholder="Contoh: 150000"
                        className="w-full px-3 py-1.5 rounded-lg glass-input text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
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

