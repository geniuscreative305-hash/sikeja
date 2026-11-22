import React, { useState, useEffect } from 'react';
import { 
  Settings2, 
  Upload, 
  Check, 
  Loader2, 
  Building, 
  FileSignature, 
  DollarSign, 
  Image as ImageIcon,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Percent
} from 'lucide-react';
import { formatIDR } from './DashboardView';

export default function SettingView({ user, settings, onRefreshSettings, addToast }) {
  const [form, setForm] = useState({
    syahriah_putra: 75000,
    syahriah_putri: 100000,
    uang_makan: 380000,
    nama_pesantren: 'Pondok Pesantren Babakan Jamanis',
    alamat_pesantren: 'Jln. Cigugur KM 03 Pasirkiara Karangbenda Kec. Parigi Kab. Pangandaran Prov. Jawa Barat 46393',
    nama_pejabat: 'KH. Ahmad Fauzi',
    jabatan_pejabat: 'Bendahara Umum',
    kop_surat_r2_url: '',
    ttd_r2_url: '',
    diskon_libur_bulan: '[]',
    diskon_libur_makan_persen: 100,
    diskon_libur_syahriah_persen: 0,
  });

  const [saving, setSaving] = useState(false);
  const [uploadingKop, setUploadingKop] = useState(false);
  const [uploadingTtd, setUploadingTtd] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm((prev) => ({
        ...prev,
        ...settings,
      }));
    }
  }, [settings]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getSelectedHolidayMonths = () => {
    try {
      const parsed = JSON.parse(form.diskon_libur_bulan || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const toggleHolidayMonth = (monthNumber) => {
    const current = getSelectedHolidayMonths();
    let next;
    if (current.includes(monthNumber)) {
      next = current.filter((m) => m !== monthNumber);
    } else {
      next = [...current, monthNumber].sort((a, b) => a - b);
    }
    handleChange('diskon_libur_bulan', JSON.stringify(next));
  };

  const handleSaveTextSettings = async (e) => {
    e.preventDefault();
    if (user?.role === 'Guest') {
      addToast('Akses Ditolak: Tamu hanya memiliki hak akses Read-Only.', 'error');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('sikeja_token');
      const res = await fetch('/api/sikeja', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'save_settings',
          settings: {
            syahriah_putra: form.syahriah_putra,
            syahriah_putri: form.syahriah_putri,
            uang_makan: form.uang_makan,
            nama_pesantren: form.nama_pesantren,
            alamat_pesantren: form.alamat_pesantren,
            nama_pejabat: form.nama_pejabat,
            jabatan_pejabat: form.jabatan_pejabat,
            diskon_libur_bulan: form.diskon_libur_bulan || '[]',
            diskon_libur_makan_persen: form.diskon_libur_makan_persen ?? 100,
            diskon_libur_syahriah_persen: form.diskon_libur_syahriah_persen ?? 0,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        addToast(data.error || 'Gagal menyimpan pengaturan.', 'error');
      } else {
        addToast('Pengaturan lembaga dan tarif berhasil diperbarui.', 'success');
        onRefreshSettings();
      }
    } catch (err) {
      addToast('Terjadi kesalahan jaringan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Upload file helper: stores directly to Supabase as high quality Base64
  const handleFileUpload = async (e, targetKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (user?.role === 'Guest') {
      addToast('Akses Ditolak: Tamu tidak memiliki izin mengunggah aset.', 'error');
      return;
    }

    if (targetKey === 'kop_surat_r2_url') setUploadingKop(true);
    else setUploadingTtd(true);

    try {
      const token = localStorage.getItem('sikeja_token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_key', targetKey);

      const res = await fetch('/api/sikeja', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        addToast(data.error || 'Gagal mengunggah file.', 'error');
      } else {
        addToast('Aset gambar berhasil disimpan!', 'success');
        setForm((prev) => ({
          ...prev,
          [targetKey]: data.public_url,
        }));
        onRefreshSettings();
      }
    } catch (err) {
      addToast('Terjadi kesalahan jaringan saat upload.', 'error');
    } finally {
      if (targetKey === 'kop_surat_r2_url') setUploadingKop(false);
      else setUploadingTtd(false);
    }
  };

  const isGuest = user?.role === 'Guest';

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Pengaturan Sistem & Aset Lembaga</span>
            {isGuest && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Read-Only
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Konfigurasi tarif bulanan santri, identitas lembaga pesantren, dan aset Kop/TTD resmi.
          </p>
        </div>
      </div>

      {isGuest && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            Anda sedang login menggunakan peran <strong>Tamu (Guest)</strong>. Fitur penyimpanan pengaturan dan unggah aset resmi hanya dapat diubah oleh peran Administrator.
          </p>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSaveTextSettings} className="space-y-8">
        {/* Section 1: Tarif Bulanan Santri */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Tarif Iuran Bulanan Santri</h3>
              <p className="text-xs text-slate-400">Dasar nominal generator tagihan bulanan otomatis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Syahriah Putra (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                disabled={isGuest}
                value={form.syahriah_putra}
                onChange={(e) => handleChange('syahriah_putra', parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-bold tabular-numbers disabled:opacity-50"
              />
              <p className="text-[11px] text-emerald-400 mt-1">
                Terbaca: {formatIDR(form.syahriah_putra)}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Syahriah Putri (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                disabled={isGuest}
                value={form.syahriah_putri}
                onChange={(e) => handleChange('syahriah_putri', parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-bold tabular-numbers disabled:opacity-50"
              />
              <p className="text-[11px] text-teal-400 mt-1">
                Terbaca: {formatIDR(form.syahriah_putri)}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Uang Makan Santri (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                disabled={isGuest}
                value={form.uang_makan}
                onChange={(e) => handleChange('uang_makan', parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-bold tabular-numbers disabled:opacity-50"
              />
              <p className="text-[11px] text-lime-400 mt-1">
                Terbaca: {formatIDR(form.uang_makan)}
              </p>
            </div>
          </div>
        </div>

        {/* Section Diskon Libur Pondok */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-lime-500/20 text-lime-300 border border-lime-500/30">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Pengaturan Diskon Libur Pondok</h3>
                <p className="text-xs text-slate-400">Pilih bulan libur santri untuk pemotongan tagihan makan/syahriah otomatis saat generate tagihan</p>
              </div>
            </div>
            {getSelectedHolidayMonths().length > 0 && (
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-lime-500/20 text-lime-300 border border-lime-500/30">
                {getSelectedHolidayMonths().length} Bulan Libur Aktif
              </span>
            )}
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Pilih Bulan Libur Santri (Klik untuk aktifkan/nonaktifkan)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2">
                {[
                  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
                  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
                ].map((name, idx) => {
                  const mNum = idx + 1;
                  const isSelected = getSelectedHolidayMonths().includes(mNum);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isGuest}
                      onClick={() => toggleHolidayMonth(mNum)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        isSelected
                          ? 'bg-lime-500/30 text-lime-300 border-lime-500/60 shadow-md shadow-lime-950/40 scale-105'
                          : 'bg-white/[0.03] text-slate-400 border-white/10 hover:text-white hover:bg-white/5'
                      } disabled:opacity-50`}
                    >
                      {name}
                      {isSelected && <span className="block text-[9px] text-lime-400">Libur</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Potongan Uang Makan Saat Libur (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  disabled={isGuest}
                  value={form.diskon_libur_makan_persen}
                  onChange={(e) => handleChange('diskon_libur_makan_persen', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-bold tabular-numbers disabled:opacity-50"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  100% = Bebas biaya makan (santri makan di rumah saat libur)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Potongan Syahriah/SPP Saat Libur (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  disabled={isGuest}
                  value={form.diskon_libur_syahriah_persen}
                  onChange={(e) => handleChange('diskon_libur_syahriah_persen', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-bold tabular-numbers disabled:opacity-50"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  0% = Syahriah tetap penuh, atau sesuaikan persentase diskon
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Identitas Pesantren & Penandatangan */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Identitas Lembaga & Penandatangan Dokumen</h3>
              <p className="text-xs text-slate-400">Dicantumkan pada kuitansi struk dan laporan resmi cetak</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Nama Lembaga Pesantren
              </label>
              <input
                type="text"
                disabled={isGuest}
                value={form.nama_pesantren}
                onChange={(e) => handleChange('nama_pesantren', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Alamat Lengkap Pesantren
              </label>
              <input
                type="text"
                disabled={isGuest}
                value={form.alamat_pesantren}
                onChange={(e) => handleChange('alamat_pesantren', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Nama Pejabat Penandatangan
              </label>
              <input
                type="text"
                disabled={isGuest}
                value={form.nama_pejabat}
                onChange={(e) => handleChange('nama_pejabat', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Jabatan Resmi Penandatangan
              </label>
              <input
                type="text"
                disabled={isGuest}
                value={form.jabatan_pejabat}
                onChange={(e) => handleChange('jabatan_pejabat', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Submit Button for Text Settings */}
        {!isGuest && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Pengaturan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Pengaturan Tarif & Lembaga</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {/* Section 3: Official Document Assets (Kop Surat & Tanda Tangan) */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <div className="p-2 rounded-xl bg-lime-500/20 text-lime-300 border border-lime-500/30">
            <FileSignature className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Aset Dokumen Resmi Pesantren</h3>
            <p className="text-xs text-slate-400">
              Unggah file gambar Kop Surat dan Tanda Tangan resmi untuk dicantumkan saat cetak kuitansi & PDF
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Kop Surat Upload Card */}
          <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Gambar Kop Surat
              </span>
              {form.kop_surat_r2_url && (
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Aset Tersimpan</span>
                </span>
              )}
            </div>

            {/* Live Preview Box */}
            <div className="h-32 rounded-xl border border-dashed border-white/15 bg-white/[0.02] flex items-center justify-center p-3 overflow-hidden">
              {form.kop_surat_r2_url ? (
                <img
                  src={form.kop_surat_r2_url}
                  alt="Kop Surat Preview"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-500 text-xs">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span>Belum ada kop surat yang diunggah</span>
                </div>
              )}
            </div>

            {/* File Upload Input */}
            {!isGuest && (
              <div>
                <label className="block">
                  <span className="sr-only">Pilih File Kop Surat</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingKop}
                    onChange={(e) => handleFileUpload(e, 'kop_surat_r2_url')}
                    className="block w-full text-xs text-slate-400
                      file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0
                      file:text-xs file:font-semibold
                      file:bg-emerald-500/20 file:text-emerald-300
                      hover:file:bg-emerald-500/30 cursor-pointer disabled:opacity-50"
                  />
                </label>
                {uploadingKop && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan ke database...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. TTD & Stempel Upload Card */}
          <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Gambar Tanda Tangan & Stempel
              </span>
              {form.ttd_r2_url && (
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Aset Tersimpan</span>
                </span>
              )}
            </div>

            {/* Live Preview Box */}
            <div className="h-32 rounded-xl border border-dashed border-white/15 bg-white/[0.02] flex items-center justify-center p-3 overflow-hidden">
              {form.ttd_r2_url ? (
                <img
                  src={form.ttd_r2_url}
                  alt="Tanda Tangan Preview"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-500 text-xs">
                  <FileSignature className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span>Belum ada tanda tangan yang diunggah</span>
                </div>
              )}
            </div>

            {/* File Upload Input */}
            {!isGuest && (
              <div>
                <label className="block">
                  <span className="sr-only">Pilih File Tanda Tangan</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingTtd}
                    onChange={(e) => handleFileUpload(e, 'ttd_r2_url')}
                    className="block w-full text-xs text-slate-400
                      file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0
                      file:text-xs file:font-semibold
                      file:bg-teal-500/20 file:text-teal-300
                      hover:file:bg-teal-500/30 cursor-pointer disabled:opacity-50"
                  />
                </label>
                {uploadingTtd && (
                  <div className="flex items-center gap-1.5 text-xs text-teal-400 mt-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan ke database...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
