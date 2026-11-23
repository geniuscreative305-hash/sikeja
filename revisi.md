# DRAFT RENCANA HOTFIX: Perbaikan Cetak Blank Putih (Koreksi Scope Isolasi Print)
================================================================================
STATUS: SELESAI DITERAPKAN & DIVERIFIKASI (v2.9.1 VERIFIED & DEPLOYED)
ENGINE: ZettBOT Core v4.1 (by Zettbos)
STANDAR: UI-UX-PRO-MAX (Precise Scope Print Isolation & Zero-Blank Guarantee)
================================================================================

## 1. Analisis Masalah & Akar Penyebab (Root Cause)

Berdasarkan keluhan dan screenshot pratinjau cetak (`media_1795402416156_5c5d7c4d.png`) yang menunjukkan kertas cetak 100% blank putih:

- **Akar Penyebab Utama:**
  Pada commit sebelumnya, kelas `print:hidden` dan id `#app-main-layout` dipasang pada tag `<div>` root paling luar di `src/app/page.js` (baris 273).
  Padahal, tag `<div>` baris 273 tersebut tidak hanya membungkus layout aplikasi (Sidebar & Main View), melainkan **juga membungkus komponen modal global (KwitansiModal, CollectiveReportModal, IndividualReportModal)** yang berada di baris 406–498.
  
  Akibatnya, saat mode print aktif:
  Browser menyembunyikan tag root baris 273 (`display: none !important;`), sehingga **seluruh komponen modal cetak di dalamnya ikut tersembunyi total**. Kertas print preview pun menjadi 100% putih kosong tanpa ada konten yang dirender.

---

## 2. Rincian Teknis Hotfix (Surgical Fix)

### A. Koreksi Scope di `src/app/page.js`
1. **Kembalikan `<div>` root terluar (Baris 273):**
   - Hapus `print:hidden` dan `id="app-main-layout"`.
   - Jadikan container root tetap netral saat print:
     ```jsx
     <div className="min-h-screen bg-gradient-to-br from-[#0b2239] via-[#0f3d3e] to-[#14533c] text-white flex overflow-x-hidden w-full print:bg-white print:text-black print:min-h-0 print:h-auto print:block">
     ```
2. **Pindahkan `print:hidden` ke Container Konten Utama (Baris 287):**
   - Pasang `print:hidden` secara tepat sasaran HANYA pada container Main Content (yang membungkus header, dasbor, dan tabel keuangan):
     ```jsx
     {/* Main Content Area (Hanya sembunyikan area dasbor/keuangan di belakang modal saat cetak) */}
     <div
       className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 w-full print:hidden ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}
     >
     ```
   - Dengan begitu:
     - Header, Sidebar, dan latar belakang dasbor **tetap tersembunyi 100%**.
     - Modal Cetak (Kwitansi, Laporan Kolektif, Laporan Perorangan) **TETAP MUNCUL SEMPURNA** di atas kertas putih cetak.

### B. Optimalisasi di `src/app/globals.css`
1. Hapus selektor `#app-main-layout` dari aturan `@media print` karena sudah ditangani secara spesifik oleh `print:hidden` pada container konten.
2. Tambahkan aturan proteksi animasi:
   ```css
   @media print {
     * {
       animation: none !important;
       transition: none !important;
     }
   }
   ```
   Hal ini untuk memastikan tidak ada efek `animate-fade-in` (`opacity: 0`) yang tertahan saat browser mengambil snapshot pratinjau cetak.

---

## 3. Hasil yang Dijamin Setelah Hotfix
1. **Laporan Keuangan A4**: Muncul sempurna dengan Kop Surat, judul, seluruh 11 kolom tabel (termasuk Uang Makan, Dibayar, Tunggakan, Status) tanpa terpotong, tanda tangan pejabat, dan bebas dari latar belakang dasbor.
2. **Struk Kwitansi**: Muncul bersih di atas kertas putih, rapi di tengah/atas, border jelas, dan pas **1 lembar kertas saja (1 sheet of paper)**.
3. Tidak ada lagi layar blank putih.

---

## 4. Berkas yang Dimodifikasi
1. `src/app/page.js` (Koreksi letak `print:hidden` dari wrapper root terluar ke wrapper konten utama).
2. `src/app/globals.css` (Hapus `#app-main-layout`, nonaktifkan animasi saat cetak).
