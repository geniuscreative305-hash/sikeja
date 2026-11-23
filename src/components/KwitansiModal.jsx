import React, { useState } from 'react';
import { Printer, X, CheckCircle2, MessageCircle, Send, PhoneCall } from 'lucide-react';
import { formatIDR } from './DashboardView';

export default function KwitansiModal({ isOpen, onClose, transaction, settings }) {
  const [customPhone, setCustomPhone] = useState('');
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);

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

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    let digits = String(phone).replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = '62' + digits.slice(1);
    } else if (digits.startsWith('8')) {
      digits = '62' + digits;
    }
    return digits;
  };

  const buildWhatsAppMessage = () => {
    const pesantrenName = settings?.nama_pesantren || 'Pondok Pesantren Babakan Jamanis';
    const santriName = transaction.santri?.nama_lengkap || '-';
    const nis = transaction.santri?.nis || '-';
    const jenjang = transaction.santri?.jenjang || '-';
    const kelas = transaction.santri?.kelas || '-';
    const gender = transaction.santri?.gender || '-';
    const wali = transaction.santri?.nama_wali || 'Wali Santri';
    const noKwitansi = transaction.kode_transaksi;
    const metode = transaction.metode_bayar || 'Cash';
    const kasir = transaction.admin_input || 'Bendahara';

    return `*BUKTI PEMBAYARAN RESMI (KWITANSI)*
🏛️ *${pesantrenName.toUpperCase()}*
-----------------------------------------
No. Kwitansi : *${noKwitansi}*
Waktu Bayar  : ${formattedDate} WIB
Metode Bayar : ${metode}
Kasir / Admin: ${kasir}

👤 *DATA SANTRI*
Nama Santri  : *${santriName}*
NIS          : ${nis}
Kelas        : ${jenjang} - ${kelas} (${gender})
Wali Santri  : ${wali}
Tagihan Bulan: *${billingMonthName} ${transaction.tahun_tagihan}*

💰 *RINCIAN PEMBAYARAN*
• Syahriah (SPP) : ${formatIDR(transaction.alokasi_syahriah)}
• Uang Makan     : ${formatIDR(transaction.alokasi_makan)}
-----------------------------------------
*TOTAL DIBAYAR*  : *${formatIDR(transaction.nominal_bayar)}*
Sisa Tunggakan   : ${formatIDR(transaction.sisa_tunggakan)}
Status Tagihan   : *${(transaction.status_bayar || 'Lunas').toUpperCase()}*
-----------------------------------------
_Harap simpan pesan kwitansi ini sebagai bukti pembayaran yang sah. Diterbitkan otomatis oleh sistem informasi keuangan pesantren SIKEJA._`;
  };

  const handleSendWhatsApp = () => {
    const defaultPhone = transaction.santri?.no_hp || '';
    const formatted = formatPhoneNumber(defaultPhone);
    if (!formatted || formatted === '62') {
      setShowPhonePrompt(true);
      return;
    }
    const msg = buildWhatsAppMessage();
    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleConfirmCustomPhone = (e) => {
    e.preventDefault();
    const formatted = formatPhoneNumber(customPhone);
    if (!formatted || formatted.length < 10) {
      alert('Nomor WhatsApp tidak valid. Masukkan minimal 10 digit angka (contoh: 081234567890).');
      return;
    }
    setShowPhonePrompt(false);
    const msg = buildWhatsAppMessage();
    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:backdrop-blur-none print:overflow-visible print:block print:h-auto print:min-h-0 print-modal-backdrop">
      {/* Dedicated Print Style for Standard A5 Receipt */}
      <style jsx global>{`
        @media print {
          @page {
            size: A5 portrait !important;
            margin: 6mm 8mm !important;
          }
          .print-receipt-a5 {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 4mm 6mm !important;
            border: 1px solid #475569 !important;
            border-radius: 6px !important;
            background: #ffffff !important;
            color: #000000 !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
        }
      `}</style>

      <div className="w-full max-w-md my-auto flex flex-col items-center print:max-w-none print:w-full print:block print:m-0">
        {/* Floating Action Bar (Hidden on print) */}
        <div className="w-full flex items-center justify-between gap-2 mb-3 no-print">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-white/15"
              title="Cetak Kuitansi ke Kertas atau Simpan PDF"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Cetak PDF</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-all hover:scale-105"
              title="Kirim Struk Otomatis ke WhatsApp Wali Santri"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Kirim ke WA Wali</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Prompt Input Nomor WA jika Santri Belum Ada No HP */}
        {showPhonePrompt && (
          <div className="w-full mb-3 p-4 rounded-xl glass-panel bg-slate-900/95 border border-emerald-500/30 text-white space-y-3 no-print animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Masukkan Nomor WhatsApp Wali</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPhonePrompt(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Batal
              </button>
            </div>
            <p className="text-[11px] text-slate-300">
              Santri ini belum memiliki nomor HP yang tersimpan di sistem. Masukkan nomor WhatsApp wali tujuan:
            </p>
            <form onSubmit={handleConfirmCustomPhone} className="flex gap-2">
              <input
                type="text"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs text-white"
                autoFocus
                required
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </button>
            </form>
          </div>
        )}

        {/* Printable Receipt Card (Thermal / A5 Style) */}
        <div className="print-area print-receipt print-receipt-a5 w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 print:p-4 bg-white text-slate-900 rounded-xl shadow-2xl font-mono text-xs leading-relaxed border border-slate-200 print:max-w-none print:w-full print:mx-auto print:max-h-none print:overflow-visible print:border print:border-slate-400 print:shadow-none print:rounded-lg">
          {/* Header Institution */}
          <div className="text-center pb-4 print:pb-2 border-b-2 border-dashed border-slate-300">
            {settings?.kop_surat_r2_url ? (
              <img
                src={settings.kop_surat_r2_url}
                alt="Kop Pesantren"
                className="max-h-16 print:max-h-11 mx-auto mb-2 print:mb-1 object-contain"
              />
            ) : null}
            <h2 className="text-base print:text-sm font-bold uppercase tracking-tight text-slate-900 font-sans">
              {settings?.nama_pesantren || 'Pondok Pesantren Babakan Jamanis'}
            </h2>
            <p className="text-[10px] print:text-[8.5pt] text-slate-600 font-sans">
              {settings?.alamat_pesantren || 'Jln. Cigugur KM 03 Pasirkiara Karangbenda Kec. Parigi Kab. Pangandaran Prov. Jawa Barat 46393'}
            </p>
            <div className="mt-2 print:mt-1 inline-block px-3 py-1 print:py-0.5 bg-slate-100 rounded text-[11px] print:text-[9pt] font-bold tracking-widest text-slate-800 font-sans">
              BUKTI PEMBAYARAN SANTRI (KWITANSI)
            </div>
          </div>

          {/* Transaction Meta */}
          <div className="py-3 print:py-1.5 border-b border-dashed border-slate-300 space-y-1 print:space-y-0.5 text-[11px] print:text-[9pt]">
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
          <div className="py-3 print:py-1.5 border-b border-dashed border-slate-300 space-y-1 print:space-y-0.5 text-[11px] print:text-[9pt]">
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
            {transaction.santri?.no_hp && (
              <div className="flex justify-between text-[10px] print:text-[8pt] text-emerald-700">
                <span>WhatsApp Wali:</span>
                <span className="font-semibold">{transaction.santri.no_hp}</span>
              </div>
            )}
          </div>

          {/* Breakdown Items */}
          <div className="py-3 print:py-1.5 border-b-2 border-dashed border-slate-300 space-y-2 print:space-y-1 text-[11px] print:text-[9pt]">
            <div className="flex justify-between">
              <span>Alokasi Syahriah (SPP):</span>
              <span className="font-semibold">{formatIDR(transaction.alokasi_syahriah)}</span>
            </div>
            <div className="flex justify-between">
              <span>Alokasi Uang Makan:</span>
              <span className="font-semibold">{formatIDR(transaction.alokasi_makan)}</span>
            </div>
            <div className="pt-2 print:pt-1 border-t border-slate-200 flex justify-between font-bold text-xs print:text-[10pt] text-slate-900">
              <span>TOTAL DIBAYAR:</span>
              <span className="text-sm print:text-[10.5pt]">{formatIDR(transaction.nominal_bayar)}</span>
            </div>
            <div className="flex justify-between text-[11px] print:text-[8.5pt] text-slate-600">
              <span>Sisa Tunggakan:</span>
              <span className={transaction.sisa_tunggakan > 0 ? 'font-bold text-red-600' : 'text-slate-700'}>
                {formatIDR(transaction.sisa_tunggakan)}
              </span>
            </div>
            <div className="flex justify-between text-[11px] print:text-[8.5pt]">
              <span>Status:</span>
              <span className={`font-bold uppercase ${transaction.status_bayar === 'Lunas' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {transaction.status_bayar}
              </span>
            </div>
          </div>

          {/* Signatures / Footer */}
          <div className="pt-4 print:pt-2 flex justify-between items-end text-[10px] print:text-[8.5pt] text-slate-600 font-sans">
            <div className="text-center w-28">
              <p>Penyetor,</p>
              <div className="h-12 print:h-7 flex items-center justify-center italic text-slate-400">
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
                  className="h-10 print:h-7 mx-auto object-contain my-1 print:my-0.5"
                />
              ) : (
                <div className="h-12 print:h-7 flex items-center justify-center italic text-slate-400">
                  ( Tanda Tangan )
                </div>
              )}
              <p className="border-t border-slate-300 pt-0.5 font-bold text-slate-900">
                {settings?.nama_pejabat || 'KH. Ahmad Fauzi'}
              </p>
            </div>
          </div>

          {/* WhatsApp Direct Action Button inside receipt */}
          <div className="mt-4 pt-3 border-t border-dashed border-slate-200 no-print">
            <button
              onClick={handleSendWhatsApp}
              className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Kirim Struk Ini ke WhatsApp Wali</span>
            </button>
          </div>

          <div className="mt-4 print:mt-2 text-center text-[9px] print:text-[7.5pt] text-slate-500 border-t border-dashed border-slate-200 pt-2 print:pt-1 font-sans">
            Harap simpan struk kwitansi ini sebagai bukti pembayaran yang sah. Terima kasih.
          </div>
        </div>
      </div>
    </div>
  );
}

