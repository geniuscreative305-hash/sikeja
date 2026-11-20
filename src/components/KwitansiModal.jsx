import React from 'react';
import { Printer, X, CheckCircle2 } from 'lucide-react';
import { formatIDR } from './DashboardView';

export default function KwitansiModal({ isOpen, onClose, transaction, settings }) {
  if (!isOpen || !transaction) return null;

  const dateObj = new Date(transaction.tanggal_waktu || Date.now());
  const formattedDate = dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  });

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const billingMonthName = transaction.bulan_tagihan ? monthNames[transaction.bulan_tagihan - 1] : '-';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Floating Action Bar (Hidden on print) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 no-print">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl flex items-center gap-2 transition-all hover:scale-105"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Struk / PDF</span>
        </button>
        <button
          onClick={onClose}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Printable Receipt Card (Thermal / A5 Style) */}
      <div className="print-area w-full max-w-md my-8 p-6 sm:p-8 bg-white text-slate-900 rounded-xl shadow-2xl font-mono text-xs leading-relaxed border border-slate-200">
        {/* Header Institution */}
        <div className="text-center pb-4 border-b-2 border-dashed border-slate-300">
          {settings?.kop_surat_r2_url ? (
            <img
              src={settings.kop_surat_r2_url}
              alt="Kop Pesantren"
              className="max-h-16 mx-auto mb-2 object-contain"
            />
          ) : null}
          <h2 className="text-base font-bold uppercase tracking-tight text-slate-900 font-sans">
            {settings?.nama_pesantren || 'Pondok Pesantren Al-Farabi'}
          </h2>
          <p className="text-[10px] text-slate-600 font-sans">
            {settings?.alamat_pesantren || 'Jl. Raya Pesantren No. 1, Kediri'}
          </p>
          <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded text-[11px] font-bold tracking-widest text-slate-800">
            BUKTI PEMBAYARAN SANTRI (KWITANSI)
          </div>
        </div>

        {/* Transaction Meta */}
        <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">No. Kwitansi:</span>
            <span className="font-bold text-slate-900">{transaction.kode_transaksi}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Waktu Bayar:</span>
            <span className="text-slate-800">{formattedDate} WIB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Metode Bayar:</span>
            <span className="font-semibold text-slate-800">{transaction.metode_bayar || 'Cash'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Kasir / Admin:</span>
            <span className="text-slate-800">{transaction.admin_input || 'Admin'}</span>
          </div>
        </div>

        {/* Student Details */}
        <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">NIS Santri:</span>
            <span className="font-semibold text-slate-900">{transaction.santri?.nis || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Nama Santri:</span>
            <span className="font-bold text-slate-900 text-right">{transaction.santri?.nama_lengkap || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Jenjang / Kelas:</span>
            <span className="text-slate-800">{transaction.santri?.jenjang} - {transaction.santri?.kelas} ({transaction.santri?.gender})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tagihan Bulan:</span>
            <span className="font-semibold text-slate-900">{billingMonthName} {transaction.tahun_tagihan}</span>
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="py-3 border-b-2 border-dashed border-slate-300 space-y-2 text-[11px]">
          <div className="flex justify-between">
            <span>Alokasi Syahriah (SPP):</span>
            <span className="font-semibold">{formatIDR(transaction.alokasi_syahriah)}</span>
          </div>
          <div className="flex justify-between">
            <span>Alokasi Uang Makan:</span>
            <span className="font-semibold">{formatIDR(transaction.alokasi_makan)}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-xs text-slate-900">
            <span>TOTAL DIBAYAR:</span>
            <span className="text-sm">{formatIDR(transaction.nominal_bayar)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-600">
            <span>Sisa Tunggakan:</span>
            <span className={transaction.sisa_tunggakan > 0 ? 'font-bold text-red-600' : 'text-slate-700'}>
              {formatIDR(transaction.sisa_tunggakan)}
            </span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Status:</span>
            <span className={`font-bold uppercase ${transaction.status_bayar === 'Lunas' ? 'text-emerald-700' : 'text-amber-700'}`}>
              {transaction.status_bayar}
            </span>
          </div>
        </div>

        {/* Signatures / Footer */}
        <div className="pt-4 flex justify-between items-end text-[10px] text-slate-600 font-sans">
          <div className="text-center w-28">
            <p>Penyetor,</p>
            <div className="h-12 flex items-center justify-center italic text-slate-400">
              ( Wali Santri )
            </div>
            <p className="border-t border-slate-300 pt-0.5">{transaction.santri?.nama_wali || 'Wali Santri'}</p>
          </div>

          <div className="text-center w-36">
            <p>{settings?.jabatan_pejabat || 'Bendahara Umum'},</p>
            {settings?.ttd_r2_url ? (
              <img
                src={settings.ttd_r2_url}
                alt="TTD"
                className="h-10 mx-auto object-contain my-1"
              />
            ) : (
              <div className="h-12 flex items-center justify-center italic text-slate-400">
                ( Tanda Tangan )
              </div>
            )}
            <p className="border-t border-slate-300 pt-0.5 font-bold text-slate-900">
              {settings?.nama_pejabat || 'KH. Ahmad Fauzi'}
            </p>
          </div>
        </div>

        <div className="mt-5 text-center text-[9px] text-slate-500 border-t border-dashed border-slate-200 pt-2 font-sans">
          Harap simpan struk kwitansi ini sebagai bukti pembayaran yang sah. Terima kasih.
        </div>
      </div>
    </div>
  );
}

