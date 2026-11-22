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
  Lock,
  CheckCircle2,
  Wallet,
  Layers,
  MapPin,
  CreditCard,
  FileText,
  Check,
  ChevronRight
} from 'lucide-react';

// Format currency helper
const formatRupiah = (num) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num || 0);
};

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
    settings: {
      syahriah_putra: 75000,
      syahriah_putri: 100000,
      uang_makan: 380000,
      nama_pesantren: 'Pondok Pesantren Babakan Jamanis',
      alamat_pesantren: 'Jln. Cigugur KM 03 Pasirkiara Karangbenda Kec. Parigi Kab. Pangandaran Prov. Jawa Barat 46393',
    }
  });

  // Typing effect state
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState(TYPING_PHRASES[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Smooth scroll handler
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
          setStats((prev) => ({
            ...prev,
            total_santri: data.total_santri,
            total_putra: data.total_putra,
            total_putri: data.total_putri,
            settings: data.settings || prev.settings,
          }));
        }
      } catch (err) {
        // Keep smooth fallback state
      }
    }
    fetchPublicStats();
  }, []);

  const tarifPutraTotal = (stats.settings?.syahriah_putra || 75000) + (stats.settings?.uang_makan || 380000);
  const tarifPutriTotal = (stats.settings?.syahriah_putri || 100000) + (stats.settings?.uang_makan || 380000);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b2239] via-[#0f3d3e] to-[#14533c] text-white selection:bg-emerald-500/30 scroll-smooth">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-xl bg-[#0b2239]/80 transition-all">
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

          {/* Smooth-Scroll Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <a
              href="#hero"
              onClick={(e) => scrollToSection(e, 'hero')}
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Beranda
            </a>
            <a
              href="#tarif"
              onClick={(e) => scrollToSection(e, 'tarif')}
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Tarif Bulanan
            </a>
            <a
              href="#keunggulan"
              onClick={(e) => scrollToSection(e, 'keunggulan')}
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Keunggulan
            </a>
            <a
              href="#alur-bayar"
              onClick={(e) => scrollToSection(e, 'alur-bayar')}
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Alur Pembayaran
            </a>
          </nav>

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
      <section id="hero" className="max-w-7xl mx-auto px-6 pt-12 pb-24">
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
      </section>

      {/* SEKSI 1: Transparansi Tarif Bulanan Putra & Putri */}
      <section id="tarif" className="py-20 border-t border-white/10 bg-[#0b2239]/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Wallet className="w-3.5 h-3.5" />
              <span>Transparansi Biaya Pendidikan</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Struktur Tarif Bulanan Resmi
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Rincian alokasi biaya syahriah pendidikan dan uang makan santri yang amanah, transparan, dan ditarik dinamis dari pengaturan resmi pesantren.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Card Santri Putra */}
            <div className="glass-panel-elevated rounded-2xl p-8 border border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-300 relative group">
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Santri Putra</h3>
                    <p className="text-xs text-slate-300">Unit Pendidikan SMP & MA</p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Reguler Putra
                </span>
              </div>

              {/* Price Banner */}
              <div className="my-6 p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/25">
                <span className="text-xs text-slate-300 uppercase tracking-wider font-medium">
                  Total Biaya per Bulan
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tabular-numbers">
                    {formatRupiah(tarifPutraTotal)}
                  </span>
                  <span className="text-xs text-slate-400">/ bulan</span>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                  <span className="text-slate-300">Syahriah Pendidikan Bulanan</span>
                  <span className="font-semibold text-white tabular-numbers">
                    {formatRupiah(stats.settings?.syahriah_putra || 75000)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                  <span className="text-slate-300">Biaya Makan (3x Sehari / Bulan)</span>
                  <span className="font-semibold text-white tabular-numbers">
                    {formatRupiah(stats.settings?.uang_makan || 380000)}
                  </span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="mt-6 pt-4 border-t border-white/10 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Pemeliharaan fasilitas asrama & sarana belajar</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Konsumsi makanan bergizi 3x sehari terjadwal</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Pencatatan sistem otomatis & kuitansi sah</span>
                </div>
              </div>
            </div>

            {/* Card Santri Putri */}
            <div className="glass-panel-elevated rounded-2xl p-8 border border-lime-400/30 hover:border-lime-400/60 transition-all duration-300 relative group">
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-lime-400/20 text-lime-300 border border-lime-400/30">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Santri Putri</h3>
                    <p className="text-xs text-slate-300">Unit Pendidikan SMP & MA</p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-lime-400/20 text-lime-300 border border-lime-400/30">
                  Reguler Putri
                </span>
              </div>

              {/* Price Banner */}
              <div className="my-6 p-5 rounded-xl bg-lime-950/40 border border-lime-400/25">
                <span className="text-xs text-slate-300 uppercase tracking-wider font-medium">
                  Total Biaya per Bulan
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tabular-numbers">
                    {formatRupiah(tarifPutriTotal)}
                  </span>
                  <span className="text-xs text-slate-400">/ bulan</span>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                  <span className="text-slate-300">Syahriah Pendidikan Bulanan</span>
                  <span className="font-semibold text-white tabular-numbers">
                    {formatRupiah(stats.settings?.syahriah_putri || 100000)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                  <span className="text-slate-300">Biaya Makan (3x Sehari / Bulan)</span>
                  <span className="font-semibold text-white tabular-numbers">
                    {formatRupiah(stats.settings?.uang_makan || 380000)}
                  </span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="mt-6 pt-4 border-t border-white/10 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-lime-400 flex-shrink-0" />
                  <span>Pemeliharaan fasilitas asrama putri & keamanan</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-lime-400 flex-shrink-0" />
                  <span>Konsumsi makanan bergizi 3x sehari terjadwal</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-lime-400 flex-shrink-0" />
                  <span>Pencatatan sistem otomatis & kuitansi sah</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEKSI 2: Grid 4 Keunggulan Tata Kelola Keuangan */}
      <section id="keunggulan" className="py-20 border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-300 text-xs font-semibold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Standar Akuntabilitas Tinggi</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              4 Keunggulan Tata Kelola Kas Pesantren
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Dirancang khusus menjawab kebutuhan transparansi, kecepatan operasional, dan kerapian administrasi keuangan pesantren modern.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Keunggulan 1 */}
            <div className="glass-panel p-6 rounded-2xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Tagihan Massal 1-Klik</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Penerbitan tagihan bulanan otomatis untuk ratusan santri aktif tiap awal bulan tanpa khawatir terlewat atau salah hitung.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-white/10 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bulk Bill Generator</span>
              </div>
            </div>

            {/* Keunggulan 2 */}
            <div className="glass-panel p-6 rounded-2xl hover:border-teal-400/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Auto-Alokasi Multi-Pos</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Algoritma cerdas memprioritaskan pelunasan pos Syahriah terlebih dahulu, kemudian alokasi Uang Makan saat santri membayar akumulatif.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-white/10 flex items-center gap-2 text-xs text-teal-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Algoritma Kas Presisi</span>
              </div>
            </div>

            {/* Keunggulan 3 */}
            <div className="glass-panel p-6 rounded-2xl hover:border-lime-400/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-lime-400/20 text-lime-300 border border-lime-400/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Kuitansi Instan & WhatsApp</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Cetak bukti bayar kasir format Thermal dan A5 dalam hitungan detik, serta bagikan tanda terima resmi langsung ke nomor WhatsApp wali santri.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-white/10 flex items-center gap-2 text-xs text-lime-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Struk Thermal / A5 / WA</span>
              </div>
            </div>

            {/* Keunggulan 4 */}
            <div className="glass-panel p-6 rounded-2xl hover:border-emerald-400/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Laporan Resmi Siap Cetak</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Rekapitulasi kas kolektif, kuartal (3 bulanan), dan tahunan siap cetak dokumen resmi ber-Kop Surat dan tanda tangan pejabat sah.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-white/10 flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Standar Legalitas A4</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEKSI 3: Alur Pembayaran 3 Langkah */}
      <section id="alur-bayar" className="py-20 border-t border-white/10 bg-[#0b2239]/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Panduan Transaksi Mudah</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Alur Pembayaran 3 Langkah Praktis
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Panduan sederhana bagi santri dan wali santri dalam menyelesaikan kewajiban administrasi syahriah bulanan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Step 1 */}
            <div className="glass-panel-elevated p-8 rounded-2xl relative border border-white/10 hover:border-emerald-500/40 transition-all duration-300 group">
              <div className="text-5xl font-black text-white/10 absolute top-5 right-6 select-none group-hover:text-emerald-500/20 transition-colors">
                01
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center mb-6">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Terbit Rincian Tagihan</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Setiap awal bulan berjalan, tagihan syahriah dan biaya makan diterbitkan otomatis oleh sistem sesuai dengan data jenjang santri.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-panel-elevated p-8 rounded-2xl relative border border-white/10 hover:border-teal-400/40 transition-all duration-300 group">
              <div className="text-5xl font-black text-white/10 absolute top-5 right-6 select-none group-hover:text-teal-400/20 transition-colors">
                02
              </div>
              <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center mb-6">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Bayar di Kasir / Transfer</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Wali santri atau santri menyetorkan pembayaran langsung ke bendahara pesantren di kantor administrasi atau melalui transfer rekening resmi.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-panel-elevated p-8 rounded-2xl relative border border-white/10 hover:border-lime-400/40 transition-all duration-300 group">
              <div className="text-5xl font-black text-white/10 absolute top-5 right-6 select-none group-hover:text-lime-400/20 transition-colors">
                03
              </div>
              <div className="w-14 h-14 rounded-2xl bg-lime-400/20 text-lime-300 border border-lime-400/30 flex items-center justify-center mb-6">
                <Receipt className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Kuitansi Sah & Konfirmasi</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Menerima struk kuitansi fisik atau bukti digital via WhatsApp, dan status tagihan santri otomatis tercatat lunas seketika di sistem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEKSI 4: Footer Resmi Pesantren */}
      <footer className="border-t border-white/10 bg-[#071726] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            {/* Identity & Address */}
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-400 p-0.5 shadow-md">
                  <div className="w-full h-full bg-[#0b2239] rounded-[10px] flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h4 className="font-extrabold text-lg text-white">
                    {stats.settings?.nama_pesantren || 'Pondok Pesantren Babakan Jamanis'}
                  </h4>
                  <p className="text-xs text-emerald-400">SIKEJA - Sistem Informasi Keuangan Santri</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                <span>
                  {stats.settings?.alamat_pesantren || 'Jln. Cigugur KM 03 Pasirkiara Karangbenda Kec. Parigi Kab. Pangandaran Prov. Jawa Barat 46393'}
                </span>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-lime-400" />
                <span>Data tersinkronisasi aman dengan enkripsi database terpusat.</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-3">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Navigasi Halaman</h5>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                <li>
                  <a
                    href="#hero"
                    onClick={(e) => scrollToSection(e, 'hero')}
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Beranda Utama</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#tarif"
                    onClick={(e) => scrollToSection(e, 'tarif')}
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tarif Bulanan Putra & Putri</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#keunggulan"
                    onClick={(e) => scrollToSection(e, 'keunggulan')}
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Keunggulan Sistem</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#alur-bayar"
                    onClick={(e) => scrollToSection(e, 'alur-bayar')}
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Alur Pembayaran Santri</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Admin CTA */}
            <div className="md:col-span-3 space-y-4">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Akses Bendahara</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kelola pembukuan, kuitansi, dan monitoring tagihan santri melalui panel pengurus.
              </p>
              <button
                onClick={onOpenLogin}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-emerald-500 hover:text-slate-950 border border-white/15 text-white font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400 group-hover:text-slate-950 transition-colors" />
                <span>Masuk Dashboard</span>
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} SIKEJA. Dikelola resmi untuk Kas Pesantren Babakan Jamanis.
            </p>
            <div className="flex items-center gap-4 text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                Sistem Aktif & Terverifikasi
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
