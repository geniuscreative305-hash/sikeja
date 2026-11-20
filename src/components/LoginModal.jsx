import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, X, Users, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, addToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/sikeja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Login gagal. Periksa username dan password.');
        if (addToast) addToast('Username atau password tidak sesuai.', 'error');
      } else {
        if (addToast) addToast(`Selamat datang, ${data.user.nama_tampilan} (${data.user.role})!`, 'success');
        onLoginSuccess(data.token, data.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg('Terjadi kendala jaringan saat menghubungkan ke server.');
      if (addToast) addToast('Kendala jaringan saat proses autentikasi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const setGuestDemoCredentials = () => {
    setUsername('tamu');
    setPassword('tamu123');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in no-print">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-2xl glass-panel-elevated bg-[#0f2d35]/95 border border-white/15 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 p-0.5 shadow-lg shadow-emerald-950/50">
            <div className="w-full h-full bg-[#0b2239] rounded-[10px] flex items-center justify-center">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Masuk ke SIKEJA</h2>
          <p className="text-xs text-slate-300 mt-1">Sistem Informasi Keuangan Santri</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs leading-relaxed animate-fade-in">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Public Demo Access: Guest Only (Security-Hardened) */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Akses Pratinjau Publik:</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Aman / Read-Only</span>
            </span>
          </div>

          <button
            type="button"
            onClick={setGuestDemoCredentials}
            className="w-full p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left transition-colors flex items-center justify-between text-xs group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-lime-500/20 text-lime-300 border border-lime-500/30">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-lime-300">Masuk sebagai Tamu (Guest)</div>
                <div className="text-[10px] text-slate-400">Lihat Dashboard & Monitoring Keuangan</div>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 group-hover:text-white font-medium">
              Isi Otomatis &rarr;
            </span>
          </button>

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Akun <strong>Admin Utama</strong> bersifat privat untuk bendahara resmi pesantren.
          </p>
        </div>
      </div>
    </div>
  );
}
