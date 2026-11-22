import React, { useState } from 'react';
import { ArrowDownRight, X, Loader2, Check } from 'lucide-react';
import { formatIDR } from './DashboardView';

export default function ExpenseModal({ isOpen, onClose, onSuccess, addToast }) {
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [peruntukan, setPeruntukan] = useState('Umum');
  const [metodeBayar, setMetodeBayar] = useState('Cash');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(nominal);
    if (!amount || amount <= 0) {
      addToast('Nominal pengeluaran harus lebih besar dari 0.', 'warning');
      return;
    }
    if (!keterangan.trim()) {
      addToast('Keterangan pengeluaran wajib diisi.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('sikeja_token');
      const cleanKeterangan = keterangan.trim().replace(/^\[(Umum|Putra|Putri)\]\s*/i, '');
      const finalKeterangan = `[${peruntukan}] ${cleanKeterangan}`;

      const res = await fetch('/api/sikeja', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'create_expense',
          nominal: amount,
          keterangan: finalKeterangan,
          metode_bayar: metodeBayar,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        addToast(data.error || 'Gagal mencatat pengeluaran.', 'error');
      } else {
        addToast(data.message || 'Pengeluaran kas pesantren berhasil dicatat.', 'success');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in no-print">
      <div className="relative w-full max-w-lg p-6 sm:p-7 rounded-2xl glass-panel-elevated bg-[#0f2d35]/95 border border-white/15 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Catat Kas Keluar Pesantren</h3>
            <p className="text-xs text-slate-300">Biaya operasional, logistik konsumsi, dan sarana</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Nominal Pengeluaran (Rp)
            </label>
            <input
              type="number"
              min="1000"
              step="500"
              required
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
              placeholder="Contoh: 250000"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-semibold tabular-numbers"
            />
            {nominal && (
              <p className="text-xs text-emerald-400 mt-1 font-medium">
                Terbaca: {formatIDR(parseFloat(nominal))}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Keterangan Pengeluaran
            </label>
            <textarea
              required
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Pembelian beras 10 karung untuk santri putri"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Peruntukan Pos Pengeluaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPeruntukan('Umum')}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all text-center ${
                  peruntukan === 'Umum'
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-md'
                    : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08]'
                }`}
              >
                Umum
              </button>
              <button
                type="button"
                onClick={() => setPeruntukan('Putra')}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all text-center ${
                  peruntukan === 'Putra'
                    ? 'bg-blue-500/25 text-blue-300 border-blue-500/50 shadow-md'
                    : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08]'
                }`}
              >
                Santri Putra
              </button>
              <button
                type="button"
                onClick={() => setPeruntukan('Putri')}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all text-center ${
                  peruntukan === 'Putri'
                    ? 'bg-lime-500/25 text-lime-300 border-lime-500/50 shadow-md'
                    : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08]'
                }`}
              >
                Santri Putri
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Metode Pengeluaran
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMetodeBayar('Cash')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  metodeBayar === 'Cash'
                    ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-md'
                    : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08]'
                }`}
              >
                Kas Tunai (Cash)
              </button>
              <button
                type="button"
                onClick={() => setMetodeBayar('Transfer')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  metodeBayar === 'Transfer'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-md'
                    : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08]'
                }`}
              >
                Transfer Rekening
              </button>
            </div>
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-red-950/40 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Pengeluaran</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

