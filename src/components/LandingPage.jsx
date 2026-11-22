import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  BarChart3, 
  Sparkles, 
  GraduationCap, 
  Receipt, 
  FileSpreadsheet, 
  Building2, 
  Lock
} from 'lucide-react';

// Animated Number Component (Counts up smoothly from 0 to target)
function AnimatedNumber({ value, duration = 1200 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const targetVal = Number(value) || 0;
  const currentValRef = useRef(0);

  useEffect(() => {
    let animId;
    let startTimestamp = null;
    const startVal = currentValRef.current;
    const diff = targetVal - startVal;

    if (diff === 0 && startVal === targetVal) {
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      // Cubic ease-out curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + diff * easeOut);
      
      currentValRef.current = current;
      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        currentValRef.current = targetVal;
        setDisplayValue(targetVal);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [targetVal, duration]);

  return <>{displayValue}</>;
}

const TYPING_PHRASES = [
  'Kas Pesantren.',
  'Syahriah & Uang Makan.',
  'Pembukuan Real-time.',
  'Kuitansi & Laporan Cetak.',
  'Manajemen Santri Terpadu.',
];

export default function LandingPage({ onOpenLogin, onBrowseStats }) {
  // Pre-filled with reliable initial snapshot for zero-delay rendering
  const [stats, setStats] = useState({
    total_santri: 28,
    total_putra: 27,
    total_putri: 1,
  });

  // Typing effect state
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState(TYPING_PHRASES[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = TYPING_PHRASES[phraseIndex];
    let timer;

    if (!isDeleting) {
      if (currentText.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        }, 75);
      } else {
        // Pause at full text before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, currentText.length - 1));
        }, 35);
      } else {
        // Pause briefly after deleting before starting next phrase
        timer = setTimeout(() => {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % TYPING_PHRASES.length);
        }, 350);
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex]);

  useEffect(() => {
    async function fetchPublicStats() {
      try {
        const res = await fetch('/api/sikeja?type=public_stats');
        const data = await res.json();
        if (data && !data.error && data.total_santri !== undefined) {
          setStats(data);
        }
      } catch (err) {
        // Keep smooth fallback state
      }
    }
    fetchPublicStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b2239] via-[#0f3d3e] to-[#14533c] text-white selection:bg-emerald-500/30">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-xl bg-[#0b2239]/70">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-400 p-0.5 shadow-lg shadow-emerald-950/40">
              <div className="w-full h-full bg-[#0b2239] rounded-[10px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">SIKEJA</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-lime-400/20 text-lime-300 border border-lime-400/30">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-300">Sistem Informasi Keuangan Santri</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenLogin}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/25 flex items-center gap-2 hover:scale-[1.02]"
            >
              <Lock className="w-4 h-4" />
              <span>Masuk ke Sistem</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Description */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Keuangan Santri Terpadu</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Akurat, Transparan, & Terpercaya untuk{' '}
              <span className="inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-300">
                  {currentText || '\u00A0'}
                </span>
                <span 
                  className="inline-block w-[3px] h-[0.85em] ml-1.5 bg-lime-400 align-middle rounded-full animate-cursor-blink shadow-[0_0_8px_rgba(163,230,53,0.8)]"
                  aria-hidden="true"
                />
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              Kelola tagihan syahriah bulanan, uang makan, dan kas operasional santri SMP & MA secara otomatis.
              Dilengkapi generator tagihan massal, auto-alokasi pembayaran multi-bulan, kuitansi struk cetak instan,
              dan laporan keuangan resmi siap cetak A4.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onOpenLogin}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all duration-200 shadow-xl shadow-emerald-950/50 flex items-center gap-2.5 hover:scale-[1.02]"
              >
                <span>Buka Dashboard SIKEJA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onBrowseStats}
                className="px-6 py-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/15 text-white font-semibold text-sm transition-all duration-200 flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Lihat Statistik Publik</span>
              </button>
            </div>

            {/* Micro Feature Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Kuitansi Thermal / A5</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                <span>Ekspor Excel & CSV</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-lime-400" />
                <span>Role Admin & Tamu</span>
              </div>
            </div>
          </div>

          {/* Right Column: Frosted Glass Live Statistics Card */}
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-lime-500 rounded-3xl blur-xl opacity-25"></div>

              {/* Main Glass Card */}
              <div className="relative rounded-2xl glass-panel-elevated p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Status Populasi Santri</h3>
                      <p className="text-xs text-slate-300">Data real-time terverifikasi sistem</p>
                    </div>
                  </div>
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>

                {/* Big Stat Box */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10">
                  <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Total Santri & Santriwati Aktif
                  </span>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white tabular-numbers">
                      <AnimatedNumber value={stats.total_santri} />
                    </span>
                    <span className="text-sm font-medium text-emerald-400">Santri Terdaftar</span>
                  </div>
                </div>

                {/* Split Gender Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Santri Putra */}
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-emerald-300 text-xs font-semibold">
                      <GraduationCap className="w-4 h-4" />
                      <span>Santri Putra</span>
                    </div>
                    <div className="text-2xl font-bold text-white tabular-numbers">
                      <AnimatedNumber value={stats.total_putra} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">SMP & MA Putra</p>
                  </div>

                  {/* Santri Putri */}
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-lime-500/40 transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-lime-300 text-xs font-semibold">
                      <GraduationCap className="w-4 h-4" />
                      <span>Santri Putri</span>
                    </div>
                    <div className="text-2xl font-bold text-white tabular-numbers">
                      <AnimatedNumber value={stats.total_putri} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">SMP & MA Putri</p>
                  </div>
                </div>

                {/* Security Guarantee Note */}
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    Sistem diamankan dengan kontrol akses berbasis peran (RBAC). Data rincian nominal dan kas hanya dapat diakses melalui kredensial resmi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
