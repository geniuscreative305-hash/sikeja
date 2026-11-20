import React, { useState, useEffect } from 'react';
import { Printer, X, Filter, Loader2 } from 'lucide-react';
import { formatIDR } from './DashboardView';

export default function CollectiveReportModal({ isOpen, onClose, settings }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [jenjang, setJenjang] = useState('');
  const [statusBayar, setStatusBayar] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  useEffect(() => {
    if (!isOpen) return;
    async function fetchReport() {
      setLoading(true);
      try {
        const token = localStorage.getItem('sikeja_token');
        let url = `/api/sikeja?type=collective_report&month=${month}&year=${year}`;
        if (jenjang) url += `&jenjang=${jenjang}`;
        if (statusBayar) url += `&status_bayar=${statusBayar}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setReportData(data);
      } catch (err) {
        console.error('Error fetching collective report:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [isOpen, month, year, jenjang, statusBayar]);

  if (!isOpen) return null;

  const records = reportData?.records || [];
  const totalTagihan = records.reduce((s, r) => s + (parseFloat(r.nominal_tagihan) || 0), 0);
  const totalBayar = records.reduce((s, r) => s + (parseFloat(r.nominal_bayar) || 0), 0);
  const totalTunggakan = records.reduce((s, r) => s + (parseFloat(r.sisa_tunggakan) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Floating Action Controls (Hidden when printing) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 no-print">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl flex items-center gap-2 transition-all hover:scale-105"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Laporan / Simpan PDF</span>
        </button>
        <button
          onClick={onClose}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Document Container */}
      <div className="w-full max-w-5xl my-8">
        {/* Filter Controls (Hidden when printing) */}
        <div className="glass-panel p-4 rounded-2xl mb-4 text-white flex flex-wrap items-center gap-3 no-print">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <Filter className="w-4 h-4" />
            <span>Filter Laporan:</span>
          </div>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 rounded-lg glass-input text-xs text-white"
          >
            {monthNames.map((m, idx) => (
              <option key={idx} value={idx + 1} className="bg-slate-900 text-white">
                Bulan {m}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="w-20 px-3 py-1.5 rounded-lg glass-input text-xs text-white"
          />
          <select
            value={jenjang}
            onChange={(e) => setJenjang(e.target.value)}
            className="px-3 py-1.5 rounded-lg glass-input text-xs text-white"
          >
            <option value="" className="bg-slate-900">Semua Jenjang (SMP & MA)</option>
            <option value="SMP" className="bg-slate-900">Hanya SMP</option>
            <option value="MA" className="bg-slate-900">Hanya MA</option>
          </select>
          <select
            value={statusBayar}
            onChange={(e) => setStatusBayar(e.target.value)}
            className="px-3 py-1.5 rounded-lg glass-input text-xs text-white"
          >
            <option value="" className="bg-slate-900">Semua Status Kelunasan</option>
            <option value="Lunas" className="bg-slate-900">Lunas Saja</option>
            <option value="Sebagian" className="bg-slate-900">Sebagian Saja</option>
            <option value="Belum Bayar" className="bg-slate-900">Belum Bayar (Nunggak)</option>
          </select>
        </div>

        {/* Official Printable Paper Document (A4 format) */}
        <div className="print-area bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-2xl font-sans text-xs leading-normal border border-slate-200">
          {/* Institutional Letterhead (KOP SURAT) */}
          <div className="border-b-4 border-double border-slate-900 pb-4 mb-6">
            {settings?.kop_surat_r2_url ? (
              <div className="flex justify-center mb-2">
                <img
                  src={settings.kop_surat_r2_url}
                  alt="Kop Surat Resmi"
                  className="max-h-24 object-contain"
                />
              </div>
            ) : (
              <div className="text-center space-y-1">
                <h1 className="text-xl font-extrabold uppercase tracking-wider text-slate-950 font-serif">
                  {settings?.nama_pesantren || 'PONDOK PESANTREN AL-FARABI'}
                </h1>
                <p className="text-xs text-slate-700 max-w-xl mx-auto">
                  {settings?.alamat_pesantren || 'Jl. Raya Pesantren No. 1, Kediri, Jawa Timur'}
                </p>
                <p className="text-[11px] text-slate-600 font-medium">
                  Unit Pendidikan: Sekolah Menengah Pertama (SMP) & Madrasah Aliyah (MA)
                </p>
              </div>
            )}
          </div>

          {/* Title of Document */}
          <div className="text-center my-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wide underline underline-offset-4 text-slate-950">
              REKAPITULASI KEUANGAN & STATUS TAGIHAN SANTRI
            </h2>
            <p className="text-xs text-slate-700 mt-1">
              Periode: <strong>{monthNames[month - 1]} {year}</strong>
              {jenjang ? ` • Unit: ${jenjang}` : ' • Unit: Seluruh Jenjang'}
              {statusBayar ? ` • Status: ${statusBayar}` : ''}
            </p>
          </div>

          {/* Content Table */}
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              Menyiapkan dokumen laporan...
            </div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-slate-500 italic">
              Tidak ada data transaksi yang sesuai dengan filter yang dipilih.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto my-4">
                <table className="w-full border-collapse border border-slate-900 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-950 font-bold border-b border-slate-900">
                      <th className="border border-slate-900 px-2 py-2 text-center w-8">No</th>
                      <th className="border border-slate-900 px-2 py-2 text-left">NIS</th>
                      <th className="border border-slate-900 px-2 py-2 text-left">Nama Santri</th>
                      <th className="border border-slate-900 px-2 py-2 text-center">Kelas</th>
                      <th className="border border-slate-900 px-2 py-2 text-center">Gdr</th>
                      <th className="border border-slate-900 px-2 py-2 text-right">Tagihan</th>
                      <th className="border border-slate-900 px-2 py-2 text-right">Syahriah</th>
                      <th className="border border-slate-900 px-2 py-2 text-right">Makan</th>
                      <th className="border border-slate-900 px-2 py-2 text-right">Dibayar</th>
                      <th className="border border-slate-900 px-2 py-2 text-right">Tunggakan</th>
                      <th className="border border-slate-900 px-2 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {records.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-slate-50 tabular-numbers">
                        <td className="border border-slate-400 px-2 py-1.5 text-center">{idx + 1}</td>
                        <td className="border border-slate-400 px-2 py-1.5 font-mono text-[10px]">{r.santri?.nis || '-'}</td>
                        <td className="border border-slate-400 px-2 py-1.5 font-medium text-slate-950">{r.santri?.nama_lengkap || '-'}</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center">{r.santri?.jenjang}-{r.santri?.kelas}</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center">{r.santri?.gender === 'Putra' ? 'L' : 'P'}</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-right font-medium">{formatIDR(r.nominal_tagihan)}</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-right">{formatIDR(r.alokasi_syahriah)}</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-right">{formatIDR(r.alokasi_makan)}</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-right font-bold text-slate-950">{formatIDR(r.nominal_bayar)}</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-right font-semibold text-red-700">{formatIDR(r.sisa_tunggakan)}</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-bold uppercase text-[10px]">
                          {r.status_bayar}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-extrabold text-slate-950 border-t-2 border-slate-900 tabular-numbers">
                      <td colSpan={5} className="border border-slate-900 px-3 py-2 text-right">TOTAL KESELURUHAN</td>
                      <td className="border border-slate-900 px-2 py-2 text-right">{formatIDR(totalTagihan)}</td>
                      <td colSpan={2} className="border border-slate-900"></td>
                      <td className="border border-slate-900 px-2 py-2 text-right text-emerald-800">{formatIDR(totalBayar)}</td>
                      <td className="border border-slate-900 px-2 py-2 text-right text-red-800">{formatIDR(totalTunggakan)}</td>
                      <td className="border border-slate-900"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatory Section (TTD Digital Cloudflare R2) */}
              <div className="mt-8 pt-4 flex justify-between items-start text-xs text-slate-800 no-break-inside">
                <div className="w-48 text-slate-600">
                  <p>Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Jakarta' })} WIB</p>
                  <p className="mt-1">Dokumen ini diterbitkan sah oleh sistem informasi keuangan pesantren SIKEJA.</p>
                </div>

                <div className="text-center w-60">
                  <p>Kediri, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-semibold">{settings?.jabatan_pejabat || 'Bendahara Umum'},</p>
                  <div className="my-2 h-20 flex items-center justify-center">
                    {settings?.ttd_r2_url ? (
                      <img
                        src={settings.ttd_r2_url}
                        alt="Tanda Tangan Resmi"
                        className="max-h-20 max-w-44 object-contain"
                      />
                    ) : (
                      <div className="italic text-slate-400">( Tanda Tangan & Stempel )</div>
                    )}
                  </div>
                  <p className="font-extrabold text-slate-950 border-b border-slate-900 pb-0.5 inline-block">
                    {settings?.nama_pejabat || 'KH. Ahmad Fauzi'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

