import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ExcelImportModal({ isOpen, onClose, onSuccess, addToast }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validCount, setValidCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle Download Official Excel Template
  const handleDownloadTemplate = () => {
    try {
      const templateData = [
        {
          'NIS': '202601001',
          'Nama Lengkap': 'Muhammad Ilham Pratama',
          'Jenis Kelamin': 'Putra',
          'Jenjang': 'SMP',
          'Kelas': '7-A',
          'Nama Wali': 'Ahmad Fauzi',
          'No WhatsApp': '081234567890',
          'Status': 'Aktif'
        },
        {
          'NIS': '202601002',
          'Nama Lengkap': 'Ahmad Dani Firmansyah',
          'Jenis Kelamin': 'Putra',
          'Jenjang': 'MA',
          'Kelas': '10-IPA',
          'Nama Wali': 'Bambang Irawan',
          'No WhatsApp': '081298765432',
          'Status': 'Aktif'
        },
        {
          'NIS': '202602001',
          'Nama Lengkap': 'Aisyah Nur Salsabila',
          'Jenis Kelamin': 'Putri',
          'Jenjang': 'Mahasiswa',
          'Kelas': 'Semester 1',
          'Nama Wali': 'Siti Rahma',
          'No WhatsApp': '085211223344',
          'Status': 'Aktif'
        }
      ];

      const ws = XLSX.utils.json_to_sheet(templateData);

      // Auto column widths
      ws['!cols'] = [
        { wch: 14 }, // NIS
        { wch: 28 }, // Nama Lengkap
        { wch: 14 }, // Jenis Kelamin
        { wch: 14 }, // Jenjang
        { wch: 14 }, // Kelas
        { wch: 22 }, // Nama Wali
        { wch: 16 }, // No WhatsApp
        { wch: 12 }, // Status
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template Santri');
      XLSX.writeFile(wb, 'Template_Data_Santri_SIKEJA.xlsx');

      addToast('Template Excel berhasil diunduh.', 'success');
    } catch (err) {
      console.error('Error generating template:', err);
      addToast('Gagal membuat template Excel.', 'error');
    }
  };

  // Parse Excel File on select
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      addToast('Harap pilih file dengan format Excel (.xlsx atau .xls).', 'warning');
      return;
    }

    setFile(selectedFile);
    parseExcel(selectedFile);
  };

  const parseExcel = (f) => {
    setParsing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          addToast('File Excel kosong atau tidak memiliki data.', 'warning');
          setParsedData([]);
          setParsing(false);
          return;
        }

        // Validate and normalize fields
        const seenNis = new Set();
        const errors = [];
        let valid = 0;

        const normalized = rawJson.map((row, idx) => {
          const rowNum = idx + 2; // header is row 1
          const nis = String(row['NIS'] || row['nis'] || '').trim();
          const nama = String(row['Nama Lengkap'] || row['Nama'] || row['nama_lengkap'] || '').trim();
          let gender = String(row['Jenis Kelamin'] || row['Gender'] || row['gender'] || 'Putra').trim();
          let jenjang = String(row['Jenjang'] || row['jenjang'] || 'SMP').trim();
          const kelas = String(row['Kelas'] || row['kelas'] || '').trim();
          const namaWali = String(row['Nama Wali'] || row['nama_wali'] || '').trim();
          const noHp = String(row['No WhatsApp'] || row['No HP'] || row['no_hp'] || '').trim();
          let status = String(row['Status'] || row['status'] || 'Aktif').trim();

          // Normalization
          if (gender.toLowerCase().includes('putri') || gender.toLowerCase() === 'p') {
            gender = 'Putri';
          } else {
            gender = 'Putra';
          }

          if (jenjang.toLowerCase().includes('mahasiswa') || jenjang.toLowerCase().includes('kuliah') || jenjang.toLowerCase().includes('inn')) {
            jenjang = 'Mahasiswa';
          } else if (jenjang.toLowerCase().includes('ma') || jenjang.toLowerCase().includes('aliyah')) {
            jenjang = 'MA';
          } else {
            jenjang = 'SMP';
          }

          if (status.toLowerCase().includes('non') || status.toLowerCase().includes('cuti') || status.toLowerCase().includes('pindah')) {
            status = 'Nonaktif';
          } else if (status.toLowerCase().includes('lulus') || status.toLowerCase().includes('alumni')) {
            status = 'Lulus';
          } else {
            status = 'Aktif';
          }

          // Validation rules
          const rowIssues = [];
          if (!nis) rowIssues.push('NIS kosong');
          else if (seenNis.has(nis)) rowIssues.push(`NIS ${nis} duplikat di file`);
          else seenNis.add(nis);

          if (!nama) rowIssues.push('Nama kosong');
          if (!kelas) rowIssues.push('Kelas kosong');

          const isValid = rowIssues.length === 0;
          if (isValid) valid++;
          else errors.push({ row: rowNum, nis, nama, issues: rowIssues });

          return {
            rowNum,
            nis,
            nama_lengkap: nama,
            gender,
            jenjang,
            kelas,
            nama_wali: namaWali,
            no_hp: noHp,
            status,
            isValid,
            issues: rowIssues,
          };
        });

        setParsedData(normalized);
        setValidationErrors(errors);
        setValidCount(valid);
      } catch (err) {
        console.error('Error parsing excel:', err);
        addToast('Gagal membaca file Excel. Pastikan format tabel sesuai.', 'error');
      } finally {
        setParsing(false);
      }
    };

    reader.readAsArrayBuffer(f);
  };

  // Submit parsed santri to backend
  const handleImportSubmit = async () => {
    const validRows = parsedData.filter((r) => r.isValid);
    if (validRows.length === 0) {
      addToast('Tidak ada data valid yang dapat diimpor.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('sikeja_token');
      const payload = validRows.map((r) => ({
        nis: r.nis,
        nama_lengkap: r.nama_lengkap,
        gender: r.gender,
        jenjang: r.jenjang,
        kelas: r.kelas,
        nama_wali: r.nama_wali,
        no_hp: r.no_hp,
        status: r.status,
      }));

      const res = await fetch('/api/sikeja', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'import_excel_santri',
          santri_list: payload,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        addToast(data.error || 'Gagal mengimpor data santri.', 'error');
      } else {
        addToast(data.message || `${validRows.length} santri berhasil diimpor!`, 'success');
        onSuccess();
        onClose();
      }
    } catch (err) {
      addToast('Terjadi kesalahan jaringan saat mengimpor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in no-print overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6 p-5 sm:p-7 rounded-2xl glass-panel-elevated bg-[#0f2d35]/95 border border-white/15 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-950/40">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Import Data Santri via Excel
            </h3>
            <p className="text-xs text-slate-300">
              Pendaftaran santri massal otomatis dari spreadsheet (.xlsx / .xls)
            </p>
          </div>
        </div>

        {/* Step 1: Download Template */}
        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Unduh Template Resmi SIKEJA</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Disarankan
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Format header sudah disesuaikan dengan sistem (SMP, MA, Mahasiswa, Status Aktif/Nonaktif/Lulus).
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-semibold flex items-center gap-2 transition-all shrink-0 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Unduh Template (.xlsx)</span>
          </button>
        </div>

        {/* Step 2: Upload Dropzone */}
        <div className="mb-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 hover:border-emerald-500/60 rounded-xl p-5 text-center cursor-pointer transition-all bg-white/[0.02] hover:bg-white/[0.05]"
          >
            <Upload className="w-7 h-7 mx-auto mb-2 text-emerald-400" />
            <div className="text-xs font-semibold text-white">
              {file ? file.name : 'Klik untuk memilih file Excel (.xlsx / .xls)'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {file ? `Ukuran: ${(file.size / 1024).toFixed(1)} KB (Klik lagi untuk ganti file)` : 'Atau seret dan lepaskan file ke sini'}
            </p>
          </div>
        </div>

        {/* Step 3: Parsing / Validation Summary */}
        {parsing && (
          <div className="py-6 text-center text-xs text-slate-300 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Sedang membaca dan memvalidasi file Excel...</span>
          </div>
        )}

        {parsedData.length > 0 && !parsing && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">
                Pratinjau Data ({parsedData.length} baris terdeteksi)
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                  {validCount} Siap Impor
                </span>
                {validationErrors.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-bold">
                    {validationErrors.length} Ada Kendala
                  </span>
                )}
              </div>
            </div>

            {/* Preview Table */}
            <div className="max-h-56 overflow-y-auto overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-[11px] min-w-[600px]">
                <thead>
                  <tr className="bg-white/[0.06] text-slate-300 border-b border-white/10 whitespace-nowrap sticky top-0">
                    <th className="py-2 px-3">No</th>
                    <th className="py-2 px-3">NIS</th>
                    <th className="py-2 px-3">Nama Santri</th>
                    <th className="py-2 px-3">Jenjang</th>
                    <th className="py-2 px-3">Kelas</th>
                    <th className="py-2 px-3">Gender</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Validasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-slate-950/40">
                  {parsedData.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className={row.isValid ? 'hover:bg-white/[0.02]' : 'bg-red-500/10'}>
                      <td className="py-1.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-1.5 px-3 font-mono text-slate-200">{row.nis || '-'}</td>
                      <td className="py-1.5 px-3 font-semibold text-white">{row.nama_lengkap || '-'}</td>
                      <td className="py-1.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 border border-white/10">
                          {row.jenjang}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-slate-300">{row.kelas || '-'}</td>
                      <td className="py-1.5 px-3 text-slate-300">{row.gender}</td>
                      <td className="py-1.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          row.status === 'Aktif' ? 'bg-emerald-500/20 text-emerald-300' :
                          row.status === 'Lulus' ? 'bg-sky-500/20 text-sky-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-1.5 px-3">
                        {row.isValid ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Valid
                          </span>
                        ) : (
                          <span className="text-red-400 flex items-center gap-1 font-semibold text-[10px]" title={row.issues.join(', ')}>
                            <AlertCircle className="w-3 h-3" /> {row.issues[0]}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedData.length > 50 && (
              <p className="text-[10px] text-slate-400 italic text-right">
                Menampilkan 50 baris pertama dari total {parsedData.length} baris.
              </p>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleImportSubmit}
            disabled={loading || validCount === 0}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengimpor {validCount} Santri...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Impor {validCount} Santri Valid</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

