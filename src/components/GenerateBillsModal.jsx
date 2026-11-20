import React, { useState } from 'react';
import { Calendar, X, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function GenerateBillsModal({ isOpen, onClose, onSuccess, addToast, settings }) {
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
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
          action: 'generate_bills',
          bulan: parseInt(bulan, 10),
          tahun: parseInt(tahun, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        addToast(data.error || 'Gagal men-generate tagihan.', 'error');
      } else {
        addToast(data.message || 'Tagihan bulanan berhasil dibuat.', 'success');
        onSuccess();
        onClose();
      }
    } catch (err) {
      addToast('Terjadi kesalahan jaringan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const syahriahPutra = settings?.syahriah_putra || 75000;
  const syahriahPutri = settings?.syahriah_putri || 100000;
  const uangMakan = settings?.uang_makan || 380000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in no-print">
      <div className="relative w-full max-w-lg p-6 sm:p-7 rounded-2xl glass-panel-elevated bg-[#0f2d35]/95 border border-white/15 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-950/40">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Generate Tagihan Bulanan</h3>
            <p className="text-xs text-slate-300">Batch massal otomatis 1-klik untuk seluruh santri aktif</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Pilih Bulan
              </label>
              <select
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
              >
                {monthNames.map((m, idx) => (
                  <option key={idx} value={idx + 1} className="bg-slate-900 text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Pilih Tahun
              </label>
              <input
                type="number"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                min="2020"
                max="2035"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
              />
            </div>
          </div>

          {/* Pricing Preview Info */}
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-2 text-xs">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulasi Tarif Sesuai Setting:</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Santri Putra (Syahriah + Makan):</span>
              <span className="font-bold text-white tabular-numbers">
                Rp {(syahriahPutra + uangMakan).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Santri Putri (Syahriah + Makan):</span>
              <span className="font-bold text-white tabular-numbers">
                Rp {(syahriahPutri + uangMakan).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Sistem otomatis melewati santri yang sudah memiliki tagihan pada bulan & tahun ini sehingga tidak akan terjadi tagihan ganda (duplikat).
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Tagihan Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

