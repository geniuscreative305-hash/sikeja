# DRAFT RENCANA REVISI: 6 Fitur & Peningkatan Sistem SIKEJA v2.0
================================================================================
STATUS: SELESAI DITERAPKAN & DIVERIFIKASI (v2.1 VERIFIED & DEPLOYED)
ENGINE: ZettBOT Core v4.1 (by Zettbos)
STANDAR: UI-UX-PRO-MAX (Academic Continuity, Financial Integrity, Batch Processing)
================================================================================

## 1. Analisis Kebutuhan & Akar Masalah

### Poin 1: Penambahan Tingkat Pendidikan "Mahasiswa"
- **Kebutuhan**: Pesantren Al-Farabi menaungi perguruan tinggi (Institut Nasional Nusantara / INN Al-Farabi), sehingga jenjang santri kini meliputi: **SMP**, **MA**, dan **Mahasiswa**.
- **Dampak Database**: Constraint check pada tabel `santri(jenjang)` di Supabase harus diperbarui dari `('SMP', 'MA')` menjadi `('SMP', 'MA', 'Mahasiswa')`.
- **Dampak UI**: Semua filter, form pendaftaran santri, dan komparasi dasbor diselaraskan dengan 3 jenjang ini.

### Poin 2: Filter Ekstensif Saat Cetak Laporan (PDF & CSV)
- **Kebutuhan**: Admin membutuhkan filter terperinci sebelum mencetak/mengunduh laporan:
  1. Tingkat Pendidikan (Semua, SMP, MA, Mahasiswa)
  2. Jenis Santri / Gender (Semua, Putra, Putri)
  3. Kelas (Semua Kelas, atau kelas spesifik: 7-A, 8-B, Semester 1, dst.)
  4. Status Kelunasan (Semua, Lunas, Sebagian, Belum Bayar/Nunggak)
- **Dampak Sistem**: Endpoint backend `/api/sikeja?type=collective_report` dan fungsi `handleExportCSV` diperkaya dengan query parameter `gender` dan `kelas`.

### Poin 3: Import Santri via File Excel (.xlsx) & Template Standar
- **Kebutuhan**: Admin tidak perlu menginput santri satu per satu. Tersedia fitur unggah file Excel untuk mendaftarkan puluhan/ratusan santri secara otomatis.
- **Standar Template Excel**:
  - Kolom: `NIS` (Wajib, Unik), `Nama Lengkap` (Wajib), `Gender` (Putra/Putri), `Tingkat` (SMP/MA/Mahasiswa), `Kelas` (misal 7-A, 10-IPA, Semester 1), `Nama Wali`, `No WhatsApp`, `Status` (Aktif/Nonaktif/Lulus).
  - Dilengkapi tombol **"Unduh Template Excel (.xlsx)"** langsung dari web.
  - Terdapat layar **Pratinjau & Validasi** data sebelum disimpan ke database (mencegah NIS duplikat atau kolom kosong).

### Poin 4: Perbaikan Bug Status Pelunasan (Sebagian -> Lunas)
- **Akar Masalah**: Pada file `src/app/api/sikeja/route.js` dan `MultiMonthPayModal.jsx`, ketika santri melunasi sisa tagihan yang sebelumnya berstatus "Sebagian", sistem menganggap nominal pembayaran baru sebagai total baru (`nominalBayarFinal = payAmount`), bukan menambahkan ke pembayaran sebelumnya (`totalBayar = bayarSebelumnya + bayarSekarang`). Akibatnya, sisa tunggakan tidak menjadi 0 dan status tetap "Sebagian".
- **Solusi**: Kalkulasi diperbaiki menjadi akumulatif:
  $$\text{Nominal Bayar Baru} = \text{Nominal Terbayar Sebelumnya} + \text{Nominal Bayar Saat Ini}$$
  Jika $\text{Nominal Bayar Baru} \ge \text{Nominal Tagihan}$, maka $\text{Sisa Tunggakan} = 0$ dan Status otomatis berubah menjadi **LUNAS**.

### Poin 5: Fitur Naik Kelas & Arsip Riwayat Akademik
- **Kebutuhan**: Santri yang naik tingkat (misal kelas 7 -> 8, atau semester 1 -> 2) dapat dipromosikan tanpa menghilangkan histori pembayaran dan kelas di masa lalu.
- **Solusi Rekayasa**:
  1. Tambahkan kolom/tabel `riwayat_kelas` pada santri untuk mencatat perjalanan kelas (contoh: 2025/2026: SMP 7-A, 2026/2027: SMP 8-A).
  2. Transaksi keuangan masa lalu tetap mengunci snapshot kelas saat transaksi terjadi, sehingga cetak struk kwitansi lama tidak berubah.
  3. Sediakan Modal **"Kenaikan Kelas"**: Admin dapat menaikkan kelas santri perorangan atau massal per kelas dengan 1 klik.

### Poin 6: Status Santri 3-State (Aktif, Nonaktif, Lulus)
- **Kebutuhan**: Mengganti status santri dari boolean 2-arah menjadi 3 status resmi:
  1. **Aktif**: Menjalani pendidikan pesantren, otomatis masuk daftar tagihan bulanan.
  2. **Nonaktif**: Berhenti sementara / cuti / pindah, tidak ditagih biaya bulanan.
  3. **Lulus**: Alumni yang telah menyelesaikan jenjang pendidikan / wisuda, tidak ditagih biaya bulanan namun riwayatnya tetap tersimpan rapi.
- **Dampak Database**: Tambahkan kolom `status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif', 'Lulus'))` pada tabel `santri`.

---

## 2. Tabel Komparasi Sebelum vs Sesudah Revisi

| No | Fitur | Sebelum Revisi | Sesudah Revisi (Target) |
| :--- | :--- | :--- | :--- |
| 1 | **Jenjang Pendidikan** | Hanya SMP dan MA | **SMP, MA, dan Mahasiswa** di seluruh sistem |
| 2 | **Filter Cetak & Ekspor** | Terbatas (Bulan, Tahun, Jenjang) | **Lengkap: Jenjang, Kelas Spesifik, Gender (Putra/Putri), Status Bayar** |
| 3 | **Input Data Santri** | Manual satu per satu | **Bisa manual + Upload File Excel (.xlsx)** dengan template resmi otomatis |
| 4 | **Pelunasan Sebagian** | Status macet di "Sebagian" saat pelunasan | **Akumulatif & Otomatis Lunas** jika sisa tunggakan terbayar penuh |
| 5 | **Kenaikan Kelas** | Mengubah teks kelas secara manual (risiko timpa riwayat) | **Fitur Naik Kelas Khusus** dengan pencatatan arsip riwayat akademik |
| 6 | **Status Keaktifan** | Hanya Aktif & Nonaktif (Boolean) | **3 Status Resmi: Aktif, Nonaktif, dan Lulus (Alumni)** |

---

## 3. Berkas yang Akan Diubah / Dibuat

1. **Database Supabase (`supabase/schema.sql` & SQL Editor)**:
   - Perbarui constraint jenjang `('SMP', 'MA', 'Mahasiswa')`.
   - Tambahkan status `('Aktif', 'Nonaktif', 'Lulus')` dan kolom `riwayat_kelas`.
2. **Backend Engine (`src/app/api/sikeja/route.js`)**:
   - Perbaiki akumulasi kalkulasi pelunasan pada action `pay_bills`.
   - Tambahkan action `import_excel_santri` dan `naik_kelas`.
   - Update filter `gender` & `kelas` pada `collective_report`.
   - Update logika generate tagihan (hanya untuk santri berstatus `Aktif`).
3. **Komponen Frontend**:
   - `src/components/SantriView.jsx`: Tombol Upload Excel, Kenaikan Kelas, filter 3 status & Mahasiswa.
   - `src/components/SantriFormModal.jsx`: Pilihan jenjang Mahasiswa & 3 status.
   - `src/components/ExcelImportModal.jsx` *(Baru)*: Modal upload Excel, unduh template, dan pratinjau data.
   - `src/components/NaikKelasModal.jsx` *(Baru)*: Modal promosi kenaikan kelas santri.
   - `src/components/MultiMonthPayModal.jsx`: Form kalkulasi pelunasan akumulatif yang tepat.
   - `src/components/CollectiveReportModal.jsx`: Filter lengkap Kelas, Gender, Jenjang Mahasiswa.
   - `src/components/KeuanganView.jsx`: Filter ekspor CSV & jenjang Mahasiswa.
   - `src/components/DashboardView.jsx`: Komparasi santri & keuangan yang menyertakan jenjang Mahasiswa.
4. **Dependensi**:
   - Instalasi paket `xlsx` (SheetJS) untuk pemrosesan file spreadsheet di frontend & backend.

---

## 4. Rencana Eksekusi Bertahap (Non-Destructive)
1. **Langkah 1**: Menjalankan query migrasi DDL di Supabase untuk memperbarui constraint `jenjang` dan menambahkan kolom `status` serta `riwayat_kelas` tanpa menghapus data santri yang sudah ada.
2. **Langkah 2**: Menginstal library `xlsx` dan memperbaiki logika pembayaran pelunasan akumulatif di backend.
3. **Langkah 3**: Membangun komponen modal `ExcelImportModal` dan `NaikKelasModal`.
4. **Langkah 4**: Menyelaraskan seluruh filter laporan cetak dan jenjang Mahasiswa di seluruh UI.
5. **Langkah 5**: Menjalankan `npm run build` dan push ke GitHub/Vercel.
