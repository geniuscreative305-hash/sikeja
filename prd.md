# PRD (Product Requirements Document) - SIKEJA
================================================================================
Aplikasi: SIKEJA (Sistem Informasi Keuangan Santri)
Arsitek: ZettBOT by Zettbos (System Architect & Mentor)
Status: Approved & In-Development
Target Platform: Web (Responsive Desktop & Mobile), Vercel Ready
Stack: Next.js 14 (App Router), Tailwind CSS, Lucide Icons, Supabase (PostgreSQL), Cloudflare R2
================================================================================

================================================================================
ZONA ATAS: SPESIFIKASI KEBUTUHAN PRODUK (BLUEPRINT AWAL)
================================================================================

## 1. Problem Statement & Deskripsi Produk
Pengelolaan administrasi keuangan pesantren konvensional (syahriah bulanan, uang makan, dan pengeluaran operasional) kerap menghadapi kendala pencatatan manual, rekapitulasi tunggakan santri yang lambat, kesalahan kalkulasi multi-bulan, serta kesulitan menyajikan kuitansi struk dan laporan resmi kuartal (3 bulanan).
**SIKEJA** hadir sebagai aplikasi web modern, cepat, berestetika tinggi (Dark-Emerald Glassmorphism, Anti-AI look), dengan penomoran unik otomatis sekuensial, auto-alokasi pos pembayaran, bulk bill generator 1-klik, dan laporan siap cetak A4/Thermal yang terintegrasi dengan Cloudflare R2 untuk Kop Surat dan Tanda Tangan resmi.

## 2. Peran Pengguna (Role & RBAC)
1. **Admin**:
   - Memiliki akses penuh (Full CRUD): Manajemen santri, bulk generate tagihan bulanan, input/update pembayaran santri, input pengeluaran pesantren, ubah pengaturan tarif pesantren, upload Kop Surat dan Tanda Tangan ke Cloudflare R2, serta unduh/cetak seluruh format laporan.
2. **Guest (Tamu / Wali Santri / Monitor)**:
   - Akses Read-Only (Hanya Lihat / Monitoring Mode).
   - Menikmati dashboard statistik, daftar santri, dan laporan keuangan tanpa tombol manipulasi data (tombol Buat, Ubah, Hapus, Generate, dan Simpan Setting dinonaktifkan di UI dan diblokir ketat di level API dengan status 403 Forbidden).

## 3. Arsitektur & Lingkungan Kerja
- **Frontend & Server Engine**: Next.js (App Router) fullstack application.
- **Styling**: Tailwind CSS dengan palet Dark-Emerald Glassmorphism, font Plus Jakarta Sans / Inter, tabular numbers untuk mata uang Rupiah, dan aturan cetak `@media print` murni kertas A4 putih bersih.
- **Database**: Supabase PostgreSQL dengan skema tabel relasional aman (Idempotent non-destructive DDL).
- **Object Storage**: Cloudflare R2 (S3-compatible via `@aws-sdk/client-s3`) untuk penyimpanan gambar aset Kop Surat (`kop_surat`) dan Tanda Tangan digital (`ttd`).
- **Deployment**: Siap deploy langsung ke platform Vercel dengan environment variables terstandarisasi.

## 4. Alur Kerja Aplikasi (User Flow)
1. **Public Landing**: Siapa saja dapat membuka halaman utama, melihat profil singkat SIKEJA, ringkasan jumlah santri aktif, santri putra, dan putri secara real-time (tanpa membocorkan angka kas/keuangan), lalu menekan tombol "Masuk ke Sistem".
2. **Login & Session**: Pengguna memilih login sebagai Admin atau Guest. Token sesi diamankan di client state & cookie/header API.
3. **Dashboard Navigasi**:
   - Menampilkan 4 KPI Utama: Total Pemasukan, Total Pengeluaran, Saldo Kas Bersih, dan Persentase Kelunasan Bulan Berjalan.
   - Widget komparasi unit SMP vs MA (rasio lunas vs nunggak).
   - Grafik tren pemasukan vs pengeluaran 3 bulan (kuartal).
4. **Keuangan**:
   - **Mode Pemasukan**: Tabel transaksi pembayaran santri dengan pencarian cepat nama/NIS, filter kuartal (Q1–Q4), gender (Putra/Putri), jenjang (SMP/MA), dan status bayar (Lunas/Sebagian/Belum Bayar) berbasis server-side pagination.
   - **Generate Tagihan**: 1-klik untuk men-generate tagihan seluruh santri aktif pada bulan/tahun tertentu, otomatis menghitung tarif berdasarkan gender, dan melewati santri yang sudah memiliki tagihan.
   - **Input Bayar Multi-Bulan**: Memilih santri, memilih satu atau beberapa bulan tagihan (misal bayar 1 kuartal sekaligus), sistem otomatis mengalokasikan pembayaran: pertama untuk Syahriah hingga penuh, sisanya untuk Uang Makan hingga penuh. Menghitung sisa tunggakan dan memperbarui status lunas/sebagian.
   - **Mode Pengeluaran**: Pencatatan kas keluar pesantren dengan kode unik `OUT-YYYYMMDD-0001`.
   - **Kuitansi & Laporan**: Cetak struk kuitansi instan per baris transaksi, cetak Laporan Kolektif (Lunas/Nunggak) ber-Kop Surat dan Tanda Tangan resmi, serta Laporan Perorangan 3-Bulanan untuk santri tertentu.
5. **Data Santri**: Kelola biodata santri (NIS, Nama, Gender, Jenjang SMP/MA, Kelas, Wali, No HP, Status Aktif). Menampilkan status kelunasan bulan berjalan, dan tombol cepat "Kelola Bayar" untuk lompat langsung ke transaksi santri tersebut.
6. **Setting**: Form konfigurasi tarif Syahriah Putra/Putri, Uang Makan, identitas pesantren, nama & jabatan penandatangan, serta form unggah file gambar Kop Surat & TTD ke Cloudflare R2 dengan pratinjau langsung.

## 5. Desain Basis Data (PostgreSQL)
1. **santri** (`id`, `nis`, `nama_lengkap`, `gender`, `jenjang`, `kelas`, `nama_wali`, `no_hp`, `status_aktif`, `created_at`)
2. **transaksi** (`id`, `kode_transaksi`, `tanggal_waktu`, `jenis_transaksi`, `santri_id`, `bulan_tagihan`, `tahun_tagihan`, `nominal_tagihan`, `nominal_bayar`, `alokasi_syahriah`, `alokasi_makan`, `sisa_tunggakan`, `status_bayar`, `metode_bayar`, `keterangan`, `admin_input`)
3. **setting** (`key`, `value`, `keterangan`)
4. **users** (`id`, `username`, `password_hash`, `nama_tampilan`, `role`)

## 6. Aturan Validasi & Logika Khusus
- **Penomoran Kode Unik Sekuensial**:
  - Pemasukan: `TRX-YYYYMMDD-0001` (reset harian dengan pemindaian nomor tertinggi hari ini).
  - Pengeluaran: `OUT-YYYYMMDD-0001` (reset harian).
- **Tarif Berdasarkan Gender**:
  - Santri Putra: Syahriah Putra (default Rp 75.000) + Uang Makan (default Rp 380.000) = Rp 455.000/bulan.
  - Santri Putri: Syahriah Putri (default Rp 100.000) + Uang Makan (default Rp 380.000) = Rp 480.000/bulan.
- **Auto-Alokasi Pos Pembayaran**:
  - `alokasi_syahriah = min(nominal_bayar, tarif_syahriah)`
  - `alokasi_makan = min(max(0, nominal_bayar - tarif_syahriah), tarif_makan)`
  - `sisa_tunggakan = nominal_tagihan - nominal_bayar`
  - Status: `nominal_bayar >= nominal_tagihan` -> Lunas; `nominal_bayar > 0 && sisa_tunggakan > 0` -> Sebagian; `nominal_bayar === 0` -> Belum Bayar.

## 7. Rencana Antarmuka
- Tampilan Dark-Emerald Glassmorphism modern (`from-[#0b2239] via-[#0f3d3e] to-[#14533c]`), glass cards `bg-white/[0.06] backdrop-blur-xl border-white/[0.12]`, aksen Emerald `#10b981` dan Lime `#a3e635`.
- Sidebar responsif (`w-64` ke `w-20`), drawer mobile, toast kustom, modal konfirmasi non-native alert.
- Aturan cetak `@media print` A4 bebas sidebar, putih bersih, teks tajam.

================================================================================
ZONA BAWAH: MASTER CONTEXT & LOGIKA SISTEM TERKINI (LIVING CONTEXT)
================================================================================
- Versi Rilis: v2.7.0 (Multi-Section Landing Page & Dynamic Tariff Transparency Edition)
- Stack Aktif: Next.js 14 App Router, Supabase PostgreSQL, Tailwind CSS 3.4, SheetJS (xlsx).
- RBAC Enforcement: 
  * Login Publik: Hanya menyediakan tombol demo untuk Tamu (Guest / Read-Only).
  * Admin: Akun privat pengurus, full CRUD, tidak bisa diakses publik secara sengaja/tak sengaja.
- Waktu Baku: Asia/Jakarta (WIB) pada transaksi dan stempel cetak.
- Alamat & Identitas Resmi: Pondok Pesantren Babakan Jamanis, Jln. Cigugur KM 03 Pasirkiara Karangbenda Kec. Parigi Kab. Pangandaran Prov. Jawa Barat 46393 (Lokasi TTD: Parigi).
- Asset Storage: Disimpan langsung ke PostgreSQL Supabase (Base64) tanpa Cloudflare R2 (100% Free, No Credit Card).
- UI/UX & Layout: Collapsible Sidebar dengan floating pill toggle (-right-3.5), mobile drawer, fluid typography, Plus Jakarta Sans via next/font/google.
- Riwayat Pembaruan Terkini:
  * [Revisi v1.1]: Eliminasi Cloudflare R2, perbaikan login Tamu (tamu123), perbaikan glitch logo sidebar menciut, dan optimasi 0ms font loading.
  * [Revisi v1.2]: UI/UX Mobile Pro Max pada Menu Data Santri & Keuangan (Dual-mode Mobile Card List + Desktop Table, 2-column compact filter grid, 50:50 symmetric tab switcher, pencegahan text clipping, dan touch-friendly action buttons).
  * [Revisi v1.3]: Proteksi Anti-Cutoff Lintas-Platform (Global overflow-x guard, dynamic viewport height `min-h-[100dvh]`, flex `min-w-0` shrink auto-adjust) dan Fitur Kirim Struk Kuitansi Otomatis ke WhatsApp Wali Santri (format pesan resmi rapi + auto normalisasi nomor HP + fallback input cepat).
  * [Revisi v2.0]: 6 Fitur Utama: Jenjang Mahasiswa, Filter Komprehensif Laporan Cetak PDF & CSV (Gender, Kelas, Jenjang, Status), Import Data Santri Excel (.xlsx) dengan Template Resmi & Validasi, Fix Akumulasi Pelunasan Tagihan Sebagian -> Lunas, Kenaikan Kelas & Arsip Riwayat Akademik (JSONB), serta Status Santri 3-State (Aktif, Nonaktif, Lulus).
  * [Revisi v2.1]: Koreksi Lokasi Cetak TTD Laporan PDF (Kediri -> Parigi) dan pemutakhiran alamat resmi fallback pesantren.
  * [Revisi v2.2]: Penambahan Fitur Cetak Laporan Tahunan Khusus Per Santri (12 Bulan / 1 Tahun Penuh) dengan filter terpadu (Kuartal Q1-Q4 vs 1 Tahun Penuh), rekapitulasi totalan 1 tahun, dan format A4 proporsional.
  * [Revisi v2.3]: Optimasi Kecepatan 0-Delay (Instant LocalStorage Hydration + Parallel Promise.all API Backend) dan pembersihan total nama pesantren menjadi "Pondok Pesantren Babakan Jamanis" di seluruh fallback UI, kwitansi, dan laporan resmi.
  * [Revisi v2.4]: Penambahan Filter Kelas Cerdas pada Menu Data Santri (sinkronisasi opsi dinamis berdasarkan jenjang aktif, backend filter `kelas`, dan layout filter bar responsif 4-kolom).
  * [Revisi v2.5]: Cascade Delete Santri & Auto-Clean Orphaned Keuangan (saat santri dihapus, seluruh tagihan & transaksi di menu keuangan otomatis terhapus bersih; pembersihan otomatis transaksi yatim tanpa santri).
  * [Revisi v2.6]: Animated Counter Statistics & Hero Banner Typing Text Effect (Animasi perhitungan angka populasi santri dari 0 ke nilai target secara 60fps dengan cubic ease-out, headline hero mengetik bergantian 5 fitur otomatis via JavaScript murni, dan kursor ketik berkedip hijau lime neon).
  * [Revisi v2.7]: Multi-Section Landing Page (Full scrollable page dengan smooth-scroll navbar, seksi transparansi tarif bulanan santri putra & putri yang ditarik dinamis dari database setting, grid 4 keunggulan tata kelola keuangan pesantren, seksi alur pembayaran 3 langkah, dan footer resmi pesantren berestetika Dark-Emerald Glassmorphism).

