import React, { useState, useEffect } from 'react';
import { Printer, X, User, Calendar, Loader2 } from 'lucide-react';
import { formatIDR } from './DashboardView';

export default function IndividualReportModal({ isOpen, onClose, settings, initialSantriId = null }) {
  const [santriList, setSantriList] = useState([]);
  const [selectedSantriId, setSelectedSantriId] = useState(initialSantriId || '');
  const [quarter, setQuarter] = useState('Q1');
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Load student list for select dropdown
  useEffect(() => {
    async function loadStudents() {
      try {
        const token = localStorage.getItem('sikeja_token');
        const res = await fetch('/api/sikeja?type=santri&limit=200', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data?.data) {
          setSantriList(data.data);
          if (initialSantriId) {
            setSelectedSantriId(initialSantriId);
          } else if (data.data.length > 0) {
            setSelectedSantriId(data.data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    }
    if (isOpen) {
      loadStudents();
    }
  }, [isOpen, initialSantriId]);

  // Fetch report when santri, quarter or year changes
  useEffect(() => {
    if (!isOpen || !selectedSantriId) return;

    async function fetchIndividual() {
      setLoading(true);
      try {
        const token = localStorage.getItem('sikeja_token');
        const res = await fetch(
          `/api/sikeja?type=individual_report&santri_id=${selectedSantriId}&quarter=${quarter}&year=${year}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setReport(data);
      } catch (err) {
        console.error('Error fetching individual report:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchIndividual();
  }, [isOpen, selectedSantriId, quarter, year]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const student = report?.santri;
  const transactions = report?.transactions || [];

  // Group by months for this quarter or full year
  const isYearMode = quarter === 'YEAR' || quarter === 'FULL';
  let quarterMonthIndices = [1, 2, 3];
  if (quarter === 'Q2') quarterMonthIndices = [4, 5, 6];
  else if (quarter === 'Q3') quarterMonthIndices = [7, 8, 9];
  else if (quarter === 'Q4') quarterMonthIndices = [10, 11, 12];
  else if (isYearMode) quarterMonthIndices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const syahriahTariff = student?.gender === 'Putri'
    ? (settings?.syahriah_putri || 100000)
    : (settings?.syahriah_putra || 75000);
  const makanTariff = settings?.uang_makan || 380000;

  // Build rows for each of the 3 months in quarter
  const quarterRows = quarterMonthIndices.map((m) => {
    const trx = transactions.find((t) => t.bulan_tagihan === m);
    const nominalTagihan = trx ? parseFloat(trx.nominal_tagihan) : (syahriahTariff + makanTariff);
    const nominalBayar = trx ? parseFloat(trx.nominal_bayar) : 0;
    const alokasiSyahriah = trx ? parseFloat(trx.alokasi_syahriah) : 0;
    const alokasiMakan = trx ? parseFloat(trx.alokasi_makan) : 0;
    const sisaTunggakan = trx ? parseFloat(trx.sisa_tunggakan) : nominalTagihan;
    const status = trx ? trx.status_bayar : 'Belum Ditagih';

    return {
      monthNumber: m,
      monthName: monthNames[m - 1],
      nominalTagihan,
      nominalBayar,
      alokasiSyahriah,
      alokasiMakan,
      sisaTunggakan,
      status,
      metodeBayar: trx?.metode_bayar || '-',
    };
  });

  const totalTagihan = quarterRows.reduce((s, r) => s + r.nominalTagihan, 0);
  const totalBayar = quarterRows.reduce((s, r) => s + r.nominalBayar, 0);
  const totalTunggakan = quarterRows.reduce((s, r) => s + r.sisaTunggakan, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-5 py-8 sm:py-12 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:backdrop-blur-none print:overflow-visible print:block print:h-auto print:min-h-0 print-modal-backdrop">
      {/* Floating Action Controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 no-print">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl flex items-center gap-2 transition-all hover:scale-105"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak PDF Laporan {isYearMode ? 'Tahunan' : 'Perorangan'}</span>
        </button>
        <button
          onClick={onClose}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full max-w-4xl my-8 print:my-0 print:max-w-none print:w-full">
        {/* Filter Controls (No print) */}
        <div className="glass-panel p-4 rounded-2xl mb-4 text-white flex flex-wrap items-center gap-4 no-print">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-[10px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Pilih Santri
            </label>
            <select
              value={selectedSantriId}
              onChange={(e) => setSelectedSantriId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg glass-input text-xs text-white"
            >
              {santriList.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900">
                  {s.nis} - {s.nama_lengkap} ({s.jenjang} / {s.kelas})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Periode Laporan
            </label>
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              className="px-3 py-1.5 rounded-lg glass-input text-xs text-white"
            >
              <option value="Q1" className="bg-slate-900">Kuartal 1 (Januari - Maret)</option>
              <option value="Q2" className="bg-slate-900">Kuartal 2 (April - Juni)</option>
              <option value="Q3" className="bg-slate-900">Kuartal 3 (Juli - September)</option>
              <option value="Q4" className="bg-slate-900">Kuartal 4 (Oktober - Desember)</option>
              <option value="YEAR" className="bg-slate-900 font-bold text-emerald-400">1 Tahun Penuh (Januari - Desember)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Tahun
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="w-24 px-3 py-1.5 rounded-lg glass-input text-xs text-white"
            />
          </div>
        </div>

        {/* Official Printable Paper Document (A4 format) */}
        <div className="print-area bg-white text-slate-900 p-6 sm:p-12 print:p-0 rounded-xl print:rounded-none shadow-2xl print:shadow-none font-sans text-xs leading-normal border border-slate-200 print:border-none overflow-x-auto print:overflow-visible">
          {/* Institutional Letterhead */}
          <div className="border-b-4 border-double border-slate-900 pb-4 mb-6">
            {settings?.kop_surat_r2_url ? (
              <div className="flex justify-start mb-2">
                <img
                  src={settings.kop_surat_r2_url}
                  alt="Kop Surat Resmi"
                  className="max-h-24 object-contain"
                />
              </div>
            ) : (
              <div className="text-center space-y-1">
                <h1 className="text-xl font-extrabold uppercase tracking-wider text-slate-950 font-serif">
                  {settings?.nama_pesantren || 'PONDOK PESANTREN BABAKAN JAMANIS'}
                </h1>
                <p className="text-xs text-slate-700 max-w-xl mx-auto">
                  {settings?.alamat_pesantren || 'Jln. Cigugur KM 03 Pasirkiara Karangbenda Kec. Parigi Kab. Pangandaran Prov. Jawa Barat 46393'}
                </p>
                <p className="text-[11px] text-slate-600 font-medium">
                  Unit Pendidikan: Sekolah Menengah Pertama (SMP) & Madrasah Aliyah (MA)
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="text-center my-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wide underline underline-offset-4 text-slate-950">
              {isYearMode
                ? 'LEMBAR LAPORAN KEUANGAN & TUNGGAKAN PERORANGAN (1 TAHUN PENUH)'
                : 'LEMBAR LAPORAN KEUANGAN & TUNGGAKAN PERORANGAN (3 BULAN)'}
            </h2>
            <p className="text-xs text-slate-700 mt-1">
              {isYearMode ? (
                <>Periode: <strong>Tahun {year} (Januari - Desember)</strong></>
              ) : (
                <>Periode Kuartal: <strong>{quarter} Tahun {year}</strong></>
              )}
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              Menyiapkan data santri...
            </div>
          ) : student ? (
            <>
              {/* Student Identity Card Box */}
              <div className="my-5 p-4 rounded-lg bg-slate-50 border border-slate-300">
                <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-[11px]">
                  <div className="flex">
                    <span className="w-28 text-slate-600">Nomor Induk (NIS):</span>
                    <span className="font-bold text-slate-950">{student.nis}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-600">Jenjang / Kelas:</span>
                    <span className="font-bold text-slate-950">{student.jenjang} - {student.kelas}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-600">Nama Lengkap:</span>
                    <span className="font-extrabold text-slate-950">{student.nama_lengkap}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-600">Jenis Kelamin:</span>
                    <span className="font-medium text-slate-900">{student.gender}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-600">Nama Wali:</span>
                    <span className="font-medium text-slate-900">{student.nama_wali || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-600">No. WhatsApp / HP:</span>
                    <span className="font-medium text-slate-900">{student.no_hp || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="overflow-x-auto my-4 print:overflow-visible">
                <table className={`w-full border-collapse border border-slate-900 ${isYearMode ? 'text-[10px]' : 'text-[11px]'} min-w-[650px] print:min-w-0 print:text-[8.5pt] print-table`}>
                  <thead>
                    <tr className="bg-slate-100 text-slate-950 font-bold border-b border-slate-900">
                      <th className={`border border-slate-900 px-3 ${isYearMode ? 'py-1.5' : 'py-2'} text-left`}>Bulan Tagihan</th>
                      <th className={`border border-slate-900 px-3 ${isYearMode ? 'py-1.5' : 'py-2'} text-right`}>Syahriah (SPP)</th>
                      <th className={`border border-slate-900 px-3 ${isYearMode ? 'py-1.5' : 'py-2'} text-right`}>Uang Makan</th>
                      <th className={`border border-slate-900 px-3 ${isYearMode ? 'py-1.5' : 'py-2'} text-right`}>Total Tagihan</th>
                      <th className={`border border-slate-900 px-3 ${isYearMode ? 'py-1.5' : 'py-2'} text-right`}>Telah Dibayar</th>
                      <th className={`border border-slate-900 px-3 ${isYearMode ? 'py-1.5' : 'py-2'} text-right`}>Sisa Tunggakan</th>
                      <th className={`border border-slate-900 px-3 ${isYearMode ? 'py-1.5' : 'py-2'} text-center`}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {quarterRows.map((row, idx) => (
                      <tr key={idx} className="tabular-numbers">
                        <td className={`border border-slate-400 px-3 ${isYearMode ? 'py-1' : 'py-2'} font-bold text-slate-950`}>
                          {row.monthName} {year}
                        </td>
                        <td className={`border border-slate-400 px-3 ${isYearMode ? 'py-1' : 'py-2'} text-right`}>
                          <div>{formatIDR(syahriahTariff)}</div>
                          <div className={`${isYearMode ? 'text-[9px]' : 'text-[10px]'} text-slate-500`}>Bayar: {formatIDR(row.alokasiSyahriah)}</div>
                        </td>
                        <td className={`border border-slate-400 px-3 ${isYearMode ? 'py-1' : 'py-2'} text-right`}>
                          <div>{formatIDR(makanTariff)}</div>
                          <div className={`${isYearMode ? 'text-[9px]' : 'text-[10px]'} text-slate-500`}>Bayar: {formatIDR(row.alokasiMakan)}</div>
                        </td>
                        <td className={`border border-slate-400 px-3 ${isYearMode ? 'py-1' : 'py-2'} text-right font-medium`}>
                          {formatIDR(row.nominalTagihan)}
                        </td>
                        <td className={`border border-slate-400 px-3 ${isYearMode ? 'py-1' : 'py-2'} text-right font-bold text-emerald-800`}>
                          {formatIDR(row.nominalBayar)}
                        </td>
                        <td className={`border border-slate-400 px-3 ${isYearMode ? 'py-1' : 'py-2'} text-right font-bold text-red-700`}>
                          {formatIDR(row.sisaTunggakan)}
                        </td>
                        <td className={`border border-slate-400 px-3 ${isYearMode ? 'py-1 text-[9px]' : 'py-2 text-[10px]'} text-center font-bold uppercase`}>
                          {row.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-extrabold text-slate-950 border-t-2 border-slate-900 tabular-numbers">
                      <td colSpan={3} className={`border border-slate-900 px-3 ${isYearMode ? 'py-1.5' : 'py-2'} text-right`}>
                        {isYearMode ? `TOTAL TAHUNAN ${year}` : `TOTAL KUARTAL ${quarter}`}
                      </td>
                      <td className={`border border-slate-900 px-3 ${isYearMode ? 'py-1.5' : 'py-2'} text-right`}>
                        {formatIDR(totalTagihan)}
                      </td>
                      <td className={`border border-slate-900 px-3 ${isYearMode ? 'py-1.5' : 'py-2'} text-right text-emerald-800`}>
                        {formatIDR(totalBayar)}
                      </td>
                      <td className={`border border-slate-900 px-3 ${isYearMode ? 'py-1.5' : 'py-2'} text-right text-red-800`}>
                        {formatIDR(totalTunggakan)}
                      </td>
                      <td className={`border border-slate-900 text-center ${isYearMode ? 'text-[9px]' : 'text-[10px]'}`}>
                        {totalTunggakan === 0 ? (isYearMode ? 'LUNAS 1 TAHUN' : 'LUNAS KUARTAL') : 'BELUM LUNAS'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Status Note Box */}
              <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-50 text-[11px] leading-relaxed">
                <span className="font-bold text-slate-900">Catatan Keuangan: </span>
                {totalTunggakan === 0 ? (
                  <span className="text-emerald-800 font-medium">
                    Alhamdulillah, seluruh kewajiban administrasi syahriah dan uang makan santri pada periode {isYearMode ? `Tahun ${year} (12 Bulan)` : `Kuartal ${quarter} (${quarterRows.map(r => r.monthName).join(', ')})`} telah TERLUNASI.
                  </span>
                ) : (
                  <span className="text-red-800 font-medium">
                    Terdapat sisa tunggakan sebesar <strong>{formatIDR(totalTunggakan)}</strong>. Diharapkan wali santri dapat menyelesaikan sebelum dimulainya evaluasi semester pesantren.
                  </span>
                )}
              </div>

              {/* Signature Section */}
              <div className="mt-8 pt-4 flex justify-between items-start text-xs text-slate-800 no-break-inside">
                <div className="text-center w-48">
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Orang Tua / Wali Santri</p>
                  <div className="my-2 h-20 flex items-center justify-center italic text-slate-400">
                    ( Tanda Tangan )
                  </div>
                  <p className="font-bold text-slate-950 border-b border-slate-900 pb-0.5 inline-block">
                    {student.nama_wali || 'Wali Santri'}
                  </p>
                </div>

                <div className="text-center w-60">
                  <p>Parigi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
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
          ) : (
            <div className="py-12 text-center text-slate-500 italic">
              Santri tidak ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

