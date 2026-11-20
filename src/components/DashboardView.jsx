import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Scale, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  TrendingUp, 
  RefreshCw,
  PlusCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

export function formatIDR(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function DashboardView({ 
  stats, 
  loading, 
  onRefresh, 
  onNavigate, 
  user,
  onOpenGenerateBills,
  onOpenNewExpense 
}) {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const currentMonthName = stats?.current_month ? monthNames[stats.current_month - 1] : '';
  const currentYear = stats?.current_year || new Date().getFullYear();

  // Max amount for trend chart normalization
  const trendMax = Math.max(
    1,
    ...(stats?.quarterly_trend || []).map((t) => Math.max(t.income, t.expense))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Keuangan
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Periode {currentMonthName} {currentYear}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitoring arus kas, tagihan bulanan santri, dan rasio kelunasan unit SMP & MA.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
            title="Sinkronisasi Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>

          {user?.role === 'Admin' && (
            <>
              <button
                onClick={onOpenGenerateBills}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Generate Tagihan</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Uang Masuk */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Total Uang Masuk
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tabular-numbers">
            {formatIDR(stats?.total_pemasukan)}
          </div>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <span>Pemasukan Syahriah & Makan</span>
          </p>
        </div>

        {/* Total Uang Keluar */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-red-500/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Total Pengeluaran
            </span>
            <div className="p-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tabular-numbers">
            {formatIDR(stats?.total_pengeluaran)}
          </div>
          <p className="text-[11px] text-red-400 mt-2 flex items-center gap-1">
            <span>Biaya Operasional Pesantren</span>
          </p>
        </div>

        {/* Saldo Kas Bersih */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-teal-500/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Saldo Kas Bersih
            </span>
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold tabular-numbers ${(stats?.saldo_kas || 0) >= 0 ? 'text-teal-300' : 'text-red-400'}`}>
            {formatIDR(stats?.saldo_kas)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Kas Riil Tersedia (Net Saldo)
          </p>
        </div>

        {/* Persentase Kelunasan */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-lime-500/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Kelunasan Bulan Ini
            </span>
            <div className="p-2 rounded-xl bg-lime-500/20 text-lime-300 border border-lime-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tabular-numbers">
              {stats?.persentase_kelunasan || 0}%
            </span>
            <span className="text-xs text-slate-400">
              ({stats?.lunas_count || 0}/{stats?.total_current_bills || 0} Santri)
            </span>
          </div>
          {/* Mini progress bar */}
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-lime-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats?.persentase_kelunasan || 0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: SMP vs MA Comparison + Quarterly Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SMP vs MA Comparison Widget */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Komparasi Unit: SMP vs MA</h3>
                <p className="text-xs text-slate-400">Rasio kelunasan tagihan santri bulan {currentMonthName}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Unit SMP Card */}
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Unit SMP
                </span>
                <span className="text-lg font-extrabold text-white tabular-numbers">
                  {stats?.smp_comparison?.percentage || 0}%
                </span>
              </div>

              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats?.smp_comparison?.percentage || 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{stats?.smp_comparison?.lunas || 0} Lunas</span>
                </span>
                <span className="text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{stats?.smp_comparison?.nunggak || 0} Nunggak</span>
                </span>
              </div>
            </div>

            {/* Unit MA Card */}
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Unit MA
                </span>
                <span className="text-lg font-extrabold text-white tabular-numbers">
                  {stats?.ma_comparison?.percentage || 0}%
                </span>
              </div>

              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats?.ma_comparison?.percentage || 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-teal-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{stats?.ma_comparison?.lunas || 0} Lunas</span>
                </span>
                <span className="text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{stats?.ma_comparison?.nunggak || 0} Nunggak</span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-300">Ingin melihat rekapitulasi data nunggak?</span>
            <button
              onClick={() => onNavigate('keuangan', { status_bayar: 'Belum Bayar' })}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>Buka Filter Nunggak</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive Visual Chart: Quarterly (3-Month) Trend */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-lime-500/20 text-lime-300 border border-lime-500/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Tren Arus Kas 3 Bulan Terakhir</h3>
                <p className="text-xs text-slate-400">Pemasukan vs Pengeluaran per bulan</p>
              </div>
            </div>
            {/* Chart Legend */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="text-slate-300">Masuk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-red-400" />
                <span className="text-slate-300">Keluar</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-5 pt-2">
            {(stats?.quarterly_trend || []).map((trend, idx) => {
              const incomePercent = Math.min(100, Math.round((trend.income / trendMax) * 100));
              const expensePercent = Math.min(100, Math.round((trend.expense / trendMax) * 100));

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{trend.label}</span>
                    <div className="flex items-center gap-3 text-[11px] tabular-numbers">
                      <span className="text-emerald-300 font-medium">+{formatIDR(trend.income)}</span>
                      <span className="text-red-300 font-medium">-{formatIDR(trend.expense)}</span>
                    </div>
                  </div>

                  {/* Dual Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(4, incomePercent)}%` }}
                        title={`Masuk: ${formatIDR(trend.income)}`}
                      />
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-red-400/80 h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(4, expensePercent)}%` }}
                        title={`Keluar: ${formatIDR(trend.expense)}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-right">
            <button
              onClick={() => onNavigate('keuangan')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Lihat riwayat pembukuan lengkap &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

