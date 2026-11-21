import React, { useState, useEffect } from 'react';
import { X, Check, CreditCard, User, Layers, Calculator, Loader2 } from 'lucide-react';
import { formatIDR } from './DashboardView';

export default function MultiMonthPayModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  addToast, 
  settings, 
  initialSantriId = null 
}) {
  const [santriList, setSantriList] = useState([]);
  const [selectedSantriId, setSelectedSantriId] = useState(initialSantriId || '');
  const [selectedSantri, setSelectedSantri] = useState(null);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [selectedBillIds, setSelectedBillIds] = useState(new Set());
  const [billPayments, setBillPayments] = useState({}); // { [billId]: payAmount }
  const [metodeBayar, setMetodeBayar] = useState('Cash');
  const [keterangan, setKeterangan] = useState('Pembayaran Syahriah & Uang Makan');
  const [loading, setLoading] = useState(false);
  const [fetchingBills, setFetchingBills] = useState(false);

  // Month names helper
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Fetch all active students for dropdown
  useEffect(() => {
    async function fetchStudents() {
      try {
        const token = localStorage.getItem('sikeja_token');
        const res = await fetch('/api/sikeja?type=santri&limit=200&status_aktif=true', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data && data.data) {
          setSantriList(data.data);
          if (initialSantriId) {
            setSelectedSantriId(initialSantriId);
          }
        }
      } catch (err) {
        console.error('Error fetching santri list:', err);
      }
    }
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen, initialSantriId]);

  // When selectedSantriId changes, fetch unpaid bills for that santri
  useEffect(() => {
    if (!selectedSantriId) {
      setSelectedSantri(null);
      setUnpaidBills([]);
      setSelectedBillIds(new Set());
      setBillPayments({});
      return;
    }

    const st = santriList.find((s) => s.id === selectedSantriId);
    setSelectedSantri(st || null);

    async function fetchUnpaid() {
      setFetchingBills(true);
      try {
        const token = localStorage.getItem('sikeja_token');
        // Fetch bills for this santri that are not yet Lunas
        const res = await fetch(`/api/sikeja?type=transactions&santri_id=${selectedSantriId}&limit=50&jenis_transaksi=Pemasukan`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json && json.data) {
          // Filter to bills that have sisa_tunggakan > 0 or status_bayar != 'Lunas'
          const openBills = json.data.filter((b) => b.status_bayar !== 'Lunas');
          setUnpaidBills(openBills);

          // By default, select all unpaid bills or the first one
          const initialSet = new Set(openBills.map((b) => b.id));
          setSelectedBillIds(initialSet);

          // Populate default full payment amounts
          const initPayments = {};
          openBills.forEach((b) => {
            initPayments[b.id] = parseFloat(b.sisa_tunggakan || b.nominal_tagihan || 0);
          });
          setBillPayments(initPayments);
        }
      } catch (err) {
        console.error('Error fetching student bills:', err);
      } finally {
        setFetchingBills(false);
      }
    }

    fetchUnpaid();
  }, [selectedSantriId, santriList]);

  if (!isOpen) return null;

  const syahriahTariff = selectedSantri?.gender === 'Putri'
    ? (settings?.syahriah_putri || 100000)
    : (settings?.syahriah_putra || 75000);
  const makanTariff = settings?.uang_makan || 380000;

  // Toggle selection of a bill
  const toggleBillSelect = (billId) => {
    const nextSet = new Set(selectedBillIds);
    if (nextSet.has(billId)) {
      nextSet.delete(billId);
    } else {
      nextSet.add(billId);
    }
    setSelectedBillIds(nextSet);
  };

  // Select all or deselect all
  const toggleSelectAll = () => {
    if (selectedBillIds.size === unpaidBills.length) {
      setSelectedBillIds(new Set());
    } else {
      setSelectedBillIds(new Set(unpaidBills.map((b) => b.id)));
    }
  };

  // Change payment amount for a specific bill
  const handlePaymentChange = (billId, val) => {
    setBillPayments((prev) => ({
      ...prev,
      [billId]: val,
    }));
  };

  // Calculate live breakdown for each selected bill
  const calculations = unpaidBills
    .filter((b) => selectedBillIds.has(b.id))
    .map((b) => {
      const payAmount = parseFloat(billPayments[b.id]) || 0;
      const prevPaid = parseFloat(b.nominal_bayar) || 0;
      const nominalTagihan = parseFloat(b.nominal_tagihan) || 0;
      const totalPaidAfter = prevPaid + payAmount;
      const sisaTunggakan = Math.max(0, nominalTagihan - totalPaidAfter);

      // Auto allocation based on total paid after transaction:
      const alokasiSyahriah = Math.min(totalPaidAfter, syahriahTariff);
      const alokasiMakan = Math.min(Math.max(0, totalPaidAfter - syahriahTariff), makanTariff);

      let status = 'Belum Bayar';
      if (sisaTunggakan === 0 && totalPaidAfter >= nominalTagihan) {
        status = 'Lunas';
      } else if (totalPaidAfter > 0) {
        status = 'Sebagian';
      }

      return {
        bill: b,
        payAmount,
        prevPaid,
        totalPaidAfter,
        alokasiSyahriah,
        alokasiMakan,
        sisaTunggakan,
        status,
      };
    });

  const grandTotalPay = calculations.reduce((sum, item) => sum + item.payAmount, 0);
  const grandTotalTagihan = calculations.reduce((sum, item) => sum + parseFloat(item.bill.nominal_tagihan || 0), 0);
  const grandTotalTunggakan = calculations.reduce((sum, item) => sum + item.sisaTunggakan, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSantriId) {
      addToast('Silakan pilih santri terlebih dahulu.', 'warning');
      return;
    }

    if (calculations.length === 0) {
      addToast('Pilih minimal 1 bulan tagihan yang ingin dibayar.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('sikeja_token');
      const payloadBills = calculations.map((c) => ({
        transaction_id: c.bill.id,
        nominal_bayar: c.payAmount,
      }));

      const res = await fetch('/api/sikeja', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'pay_bills',
          santri_id: selectedSantriId,
          bills: payloadBills,
          metode_bayar: metodeBayar,
          keterangan,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        addToast(data.error || 'Gagal menyimpan pembayaran.', 'error');
      } else {
        addToast(data.message || 'Pembayaran berhasil disimpan.', 'success');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in no-print overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6 p-6 sm:p-8 rounded-2xl glass-panel-elevated bg-[#0f2d35]/95 border border-white/15 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-950/40">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Input Pembayaran Multi-Bulan</h3>
            <p className="text-xs text-slate-300">Auto-alokasi pos Syahriah & Uang Makan secara otomatis</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Santri Selection & Info */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Pilih Santri / Santriwati
              </label>
              <select
                value={selectedSantriId}
                onChange={(e) => setSelectedSantriId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                required
              >
                <option value="" className="bg-slate-900 text-slate-400">
                  -- Pilih Santri --
                </option>
                {santriList.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.nis} - {s.nama_lengkap} ({s.jenjang} / {s.kelas})
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-populated Student Badges */}
            <div className="md:col-span-6 flex flex-wrap items-center gap-2 pt-2 sm:pt-6">
              {selectedSantri ? (
                <>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {selectedSantri.jenjang} • Kelas {selectedSantri.kelas}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Gender: {selectedSantri.gender}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/[0.06] text-slate-300 border border-white/10">
                    Wali: {selectedSantri.nama_wali || '-'}
                  </span>
                </>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Pilih santri untuk menampilkan informasi kelas & tarif.
                </span>
              )}
            </div>
          </div>

          {/* Unpaid Bills Multi-Selection List */}
          {selectedSantriId && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Daftar Tagihan Belum Lunas ({unpaidBills.length})
                  </span>
                </div>
                {unpaidBills.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    {selectedBillIds.size === unpaidBills.length ? 'Batal Pilih Semua' : 'Pilih Semua Bulan'}
                  </button>
                )}
              </div>

              {fetchingBills ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                  Memuat data tagihan santri...
                </div>
              ) : unpaidBills.length === 0 ? (
                <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs text-center">
                  Santri ini tidak memiliki tunggakan tagihan. Semua tagihan sudah Lunas!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {unpaidBills.map((bill) => {
                    const isChecked = selectedBillIds.has(bill.id);
                    const monthLabel = monthNames[(bill.bulan_tagihan || 1) - 1];

                    return (
                      <div
                        key={bill.id}
                        className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isChecked
                            ? 'bg-emerald-950/40 border-emerald-500/40'
                            : 'bg-white/[0.02] border-white/10 opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleBillSelect(bill.id)}
                            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                          />
                          <div>
                            <div className="font-bold text-sm text-white">
                              Tagihan {monthLabel} {bill.tahun_tagihan}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>Total: {formatIDR(bill.nominal_tagihan)}</span>
                              <span>•</span>
                              <span className="text-amber-400">
                                Sisa: {formatIDR(bill.sisa_tunggakan || bill.nominal_tagihan)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isChecked && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-300 font-medium whitespace-nowrap">
                              Bayar (Rp):
                            </span>
                            <input
                              type="number"
                              min="0"
                              max={parseFloat(bill.sisa_tunggakan !== undefined ? bill.sisa_tunggakan : bill.nominal_tagihan)}
                              value={billPayments[bill.id] !== undefined ? billPayments[bill.id] : (bill.sisa_tunggakan || bill.nominal_tagihan)}
                              onChange={(e) => handlePaymentChange(bill.id, e.target.value)}
                              className="w-32 px-2.5 py-1.5 rounded-lg glass-input text-xs font-semibold text-right tabular-numbers text-emerald-300"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Auto-Allocation Live Calculation Summary */}
          {calculations.length > 0 && (
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300 pb-2 border-b border-white/10">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" />
                  <span>Ringkasan Alokasi Otomatis ({calculations.length} Bulan Terpilih)</span>
                </span>
                <span className="text-white tabular-numbers">
                  Tarif: Syahriah {formatIDR(syahriahTariff)} | Makan {formatIDR(makanTariff)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/5">
                      <th className="pb-2">Bulan</th>
                      <th className="pb-2 text-right">Bayar</th>
                      <th className="pb-2 text-right">Alokasi Syahriah</th>
                      <th className="pb-2 text-right">Alokasi Makan</th>
                      <th className="pb-2 text-right">Sisa Tunggakan</th>
                      <th className="pb-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {calculations.map((calc, idx) => (
                      <tr key={idx} className="tabular-numbers">
                        <td className="py-2 text-white font-medium">
                          {monthNames[(calc.bill.bulan_tagihan || 1) - 1]} {calc.bill.tahun_tagihan}
                        </td>
                        <td className="py-2 text-right font-bold text-emerald-300">
                          {formatIDR(calc.payAmount)}
                        </td>
                        <td className="py-2 text-right text-slate-300">
                          {formatIDR(calc.alokasiSyahriah)}
                        </td>
                        <td className="py-2 text-right text-slate-300">
                          {formatIDR(calc.alokasiMakan)}
                        </td>
                        <td className="py-2 text-right text-amber-300">
                          {formatIDR(calc.sisaTunggakan)}
                        </td>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            calc.status === 'Lunas'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {calc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-white/10 font-bold text-white tabular-numbers">
                      <td className="pt-2">TOTAL</td>
                      <td className="pt-2 text-right text-emerald-300 text-sm">
                        {formatIDR(grandTotalPay)}
                      </td>
                      <td colSpan={2}></td>
                      <td className="pt-2 text-right text-amber-300">
                        {formatIDR(grandTotalTunggakan)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Payment Method & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodeBayar('Cash')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    metodeBayar === 'Cash'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-md'
                      : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08]'
                  }`}
                >
                  Tunai (Cash)
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
                  Transfer Bank
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Catatan / Keterangan
              </label>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Misal: Diterima dari wali santri"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
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
              disabled={loading || calculations.length === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Pembayaran...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Pembayaran ({formatIDR(grandTotalPay)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

