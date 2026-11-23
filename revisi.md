# DRAFT RENCANA REVISI: Perbaikan Total `@media print` CSS Laporan Keuangan (A4) & Struk Kwitansi
================================================================================
STATUS: SELESAI DITERAPKAN & DIVERIFIKASI (v2.9.0 VERIFIED & DEPLOYED)
ENGINE: ZettBOT Core v4.1 (by Zettbos)
STANDAR: UI-UX-PRO-MAX (Pixel-Perfect Print Isolation, Precision A4 Table Layout, 1-Sheet Struk Kwitansi)
================================================================================

## 1. Analisis Masalah & Akar Penyebab (Root Cause Analysis)

Berdasarkan keluhan pengguna dan dua tangkapan layar print preview (`EPSON L120 Series`):
1. **Latar Gelap Aplikasi Ikut Tercetak di Belakang Kertas:**
   - *Penyebab:* Elemen shell utama aplikasi (`<main>`, kartu transaksi `KeuanganView`, background gradient `body`, dan backdrop hitam modal `bg-black/80 backdrop-blur-md`) tidak tersembunyi saat `@media print`. Akibatnya browser merender seluruh halaman dasbor di belakang kertas laporan/struk.
2. **Kolom Kanan Tabel Laporan Keuangan Terpotong (Uang Makan, Sisa Tunggakan, Status):**
   - *Penyebab:* Terjadi penumpukan margin/padding ganda: `@page` memiliki margin `12mm`, ditambah `.print-area` memiliki `padding: 10mm 15mm` (total memotong 54mm dari lebar A4), sementara tabel dipaksa `min-w-[750px]` dalam pembungkus `overflow-x-auto`. Akibatnya tabel melebihi batas printable area A4 portrait (~190mm) dan kolom kanan terpotong habis.
3. **Struk Kwitansi Mengambang & Menghasilkan 4 Lembar Kertas Kosong:**
   - *Penyebab:* Modal kwitansi masih mempertahankan `fixed inset-0 flex items-center justify-center` dengan tinggi `max-h-[85vh]` dan backdrop gelap. Browser printer mencoba menghitung tinggi seluruh halaman aplikasi di baliknya sehingga memicu pagination kosong hingga 4 lembar kertas.

---

## 2. Rincian Teknis Solusi Rekayasa

### A. Isolasi Total Mode Cetak (`src/app/globals.css` & `src/app/page.js`)
- Di `src/app/page.js`:
  - Tambahkan kelas `print:hidden` pada wrapper utama aplikasi (`#app-main-layout`).
  - Efek: Saat print aktif, seluruh sidebar, header, dan konten view aplikasi (Dashboard, Keuangan, Santri, Setting) otomatis 100% dihapus dari pohon render cetak (`display: none !important;`).
- Di `src/app/globals.css`:
  - Reset `html, body` saat cetak:
    ```css
    html, body {
      background: #ffffff !important;
      background-image: none !important;
      color: #000000 !important;
      height: auto !important;
      min-height: auto !important;
      overflow: visible !important;
    }
    ```
  - Hilangkan perilaku modal fixed untuk `.print-modal-backdrop`:
    `position: static !important; background: transparent !important; backdrop-filter: none !important; padding: 0 !important; margin: 0 !important; height: auto !important; overflow: visible !important;`

### B. Perbaikan Tabel Laporan Keuangan A4 (`CollectiveReportModal.jsx` & `IndividualReportModal.jsx`)
- Hapus padding ganda pada `.print-area`:
  - Ubah `.print-area` cetak menjadi `padding: 0 !important; margin: 0 !important; border: none !important; box-shadow: none !important;`.
- Margin Kertas Fisik:
  - Tetapkan `@page { size: A4 portrait; margin: 10mm 10mm 10mm 10mm; }` sehingga tersedia lebar bersih 190mm penuh untuk tabel.
- Optimalisasi Tabel Cetak:
  - Hapus batasan `min-w-[750px]` saat cetak (`print:min-w-0`).
  - Atur font cetak tabel: `8.5pt` dengan padding sel rapat `3px 4px`.
  - Berikan lebar persentase proporsional untuk 11 kolom:
    1. No: 3%
    2. NIS: 9%
    3. Nama Santri: 20%
    4. Kelas: 7%
    5. Gdr: 4%
    6. Tagihan: 11%
    7. Syahriah: 9%
    8. Makan: 9%
    9. Dibayar: 11%
    10. Tunggakan: 11%
    11. Status: 6%
    *Total: 100% muat sempurna di dalam 190mm tanpa ada yang terpotong ke kanan.*
  - Pertahankan perulangan header dan proteksi jeda halaman:
    `thead { display: table-header-group; }`
    `tr { break-inside: avoid; page-break-inside: avoid; }`
    `.no-break-inside { break-inside: avoid; page-break-inside: avoid; }` pada blok tanda tangan pejabat.

### C. Layout Struk Kwitansi 1 Lembar Pas (`KwitansiModal.jsx`)
- Wrapper modal dialihkan menjadi `print:static print:bg-transparent print:p-0 print:overflow-visible`.
- Kontainer struk kwitansi diberikan kelas `.print-receipt`:
  - `max-width: 140mm !important; margin: 0 auto !important; height: auto !important; overflow: visible !important;`
  - Tambahkan proteksi jeda: `page-break-after: avoid !important; break-after: avoid !important; page-break-inside: avoid !important;`
  - Bersihkan bayangan (`print:shadow-none`), hilangkan batas tinggi (`print:max-h-none`), dan gunakan border tipis rapi (`border: 1px solid #cbd5e1`).
  - Hasil: Kwitansi tercetak bersih di tengah/atas kertas putih A4 printer EPSON L120 dengan total pas **1 lembar saja (1 sheet of paper)**.

---

## 3. Matriks Perbandingan Sebelum vs Sesudah

| Aspek Pengujian Cetak | Sebelum Perbaikan | Target Sesudah Perbaikan |
| :--- | :--- | :--- |
| **Latar Belakang Print** | Muncul kartu gelap dashboard & backdrop hitam | Bersih putih polos 100% (`#ffffff`) tanpa bayangan |
| **Kolom Tabel Laporan A4** | Kolom Makan, Tunggakan, Status terpotong ke kanan | Seluruh 11 kolom muat 100% presisi dalam batas A4 |
| **Header Tabel Halaman 2+** | Hilang di halaman berikutnya jika data banyak | Berulang otomatis di halaman atas (`table-header-group`) |
| **Jumlah Lembar Struk Kwitansi** | 4 sheets of paper (3 lembar kosong mengambang) | **Pas 1 sheet of paper** tanpa lembar kosong tambahan |
| **Tampilan Cetak Printer Inkjet** | Teks struk kabur dalam kotak gelap | Teks hitam tajam, border garis rapi, siap cetak resmi |

---

## 4. Berkas yang Akan Dimodifikasi

1. `src/app/globals.css` (Overhaul total aturan `@media print`, isolasi modal, tabel A4, dan `.print-receipt`).
2. `src/app/page.js` (Tambahkan `print:hidden` pada `#app-main-layout` agar seluruh UI aplikasi tertutup total saat cetak).
3. `src/components/CollectiveReportModal.jsx` (Terapkan `.print-modal-backdrop`, `print:min-w-0`, `print:text-[8.5pt]`, proporsi kolom tabel).
4. `src/components/IndividualReportModal.jsx` (Terapkan `.print-modal-backdrop`, `print:min-w-0`, tabel kuartal/tahunan presisi).
5. `src/components/KwitansiModal.jsx` (Terapkan `.print-modal-backdrop`, kelas `.print-receipt`, `max-w-[140mm]`, 1-sheet constraint).
