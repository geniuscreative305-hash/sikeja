# DRAFT RENCANA REVISI: Perbaikan Cetak PDF, Widget Gender Dashboard, Sistem Diskon & Optimasi Animasi (v2.8.0)
================================================================================
STATUS: SELESAI DITERAPKAN & DIVERIFIKASI (v2.8 VERIFIED & DEPLOYED)
ENGINE: ZettBOT Core v4.1 (by Zettbos)
STANDAR: UI-UX-PRO-MAX (Zero-Delay, Print A4 Perfection, Dynamic Financial Logic)
================================================================================

## 1. Analisis Kebutuhan & Akar Masalah

### Poin 1: Perbaikan Bug Tampilan Saat Mau Cetak PDF (Screenshot 1)
- **Akar Masalah**:
  Pada `CollectiveReportModal.jsx` dan `IndividualReportModal.jsx`, pembungkus modal menggunakan kelas `flex items-center justify-center overflow-y-auto`. Saat data tabel panjang (36+ santri), CSS Flexbox menengahkan konten secara vertikal dan mendorong Kop Surat, judul dokumen, serta baris 1-3 ke luar batas atas viewport (*negative Y coordinate*). Scrollbar tidak bisa menjangkau bagian yang terpotong.
- **Solusi**:
  1. Ganti `items-center` menjadi `items-start py-8 overflow-y-auto` pada kedua modal laporan cetak.
  2. Perbaiki aturan `@media print` agar tabel multi-halaman terbagi secara alami (*no awkward page cutoff*).

---

### Poin 2: Widget Total Pemasukan & Pengeluaran Santri Putra & Putri di Dashboard (Screenshot 2)
- **Kebutuhan**:
  Menampilkan pemisahan arus kas (Pemasukan & Pengeluaran) antara Santri Putra dan Santri Putri di Dashboard Keuangan.
- **Implementasi (Opsi A - Terpilih)**:
  1. **Pemasukan**: Dihitung otomatis dari tabel `transaksi` berdasarkan gender santri (`santri.gender === 'Putra'` vs `'Putri'`).
  2. **Pengeluaran**: Pada modal `ExpenseModal.jsx` (Catat Pengeluaran), tambahkan dropdown peruntukan pos pengeluaran:
     - `Operasional Umum Pesantren` (Biaya listrik, kantor, umum)
     - `Khusus Asrama Putra` (Logistik/kebutuhan santri putra)
     - `Khusus Asrama Putri` (Logistik/kebutuhan santri putri)
  3. **Widget Dashboard**:
     Tambahkan kartu komparasi visual bernuansa Emerald (Putra) & Lime (Putri) yang menampilkan:
     - Total Pemasukan Putra vs Total Pengeluaran Putra (Arus Kas Bersih Putra)
     - Total Pemasukan Putri vs Total Pengeluaran Putri (Arus Kas Bersih Putri)

---

### Poin 3: Sistem Diskon Pembiayaan (Diskon Libur & Diskon Beasiswa)

#### A. Diskon Libur Bulanan (Seasonal)
- **Konfigurasi di Setting**:
  - Pilihan bulan yang mendapatkan diskon libur (misal: Maret, Juni, atau Ramadhan).
  - Pilihan pos yang dipotong: Uang Makan (% atau Rp) dan/atau Syahriah (% atau Rp).
  - Contoh: Saat libur pondok 1 bulan, biaya makan diskon 100% (Rp 0) karena santri makan di rumah, syahriah tetap.
- **Integrasi Generate Tagihan**:
  - Saat men-generate tagihan untuk bulan libur tersebut, sistem otomatis memotong tagihan makan seluruh santri sesuai aturan diskon libur.

#### B. Diskon Beasiswa (Prestasi & Keluarga Tidak Mampu)
- **Kategori Status**:
  1. `Prestasi` (Tahfidz, Juara Kelas, dsb)
  2. `Keluarga Tidak Mampu / Afirmasi` (Yatim, Dhuafa)
- **Fleksibilitas Pengaturan per Santri**:
  - Di `SantriFormModal.jsx` (Tambah/Edit Santri) dan `SantriView.jsx`, tambahkan opsi:
    - Status Beasiswa: `Reguler (Tanpa Beasiswa)`, `Prestasi`, `Keluarga Tidak Mampu`
    - Tipe Beasiswa:
      - `Full (100% Bebas Biaya)`: Tagihan Rp 0 (otomatis berstatus *Lunas Beasiswa*).
      - `Sebagian (Parsial)`: Bebas Syahriah saja, Bebas Makan saja, atau Potongan Nominal Tertentu.
- **Penyimpanan Non-Destruktif**:
  - Disimpan dengan arsitektur idempoten di tabel `setting` (key: `beasiswa_santri_config`) dan disinkronkan ke santri agar 100% aman tanpa merusak database produksi.
- **Integrasi Generate Tagihan**:
  - Saat tagihan bulanan dibuat, santri beasiswa Full langsung terbit Rp 0 (Lunas), dan santri beasiswa Sebagian tagihannya terpotong proporsional.

---

### Poin 4: Eliminasi Delay Animasi Hero Landing Page
- **Akar Masalah**:
  1. Headline mengetik dimulai dengan teks penuh `"Kas Pesantren."` dan tertahan timer `2.200ms` (2,2 detik) sebelum mulai bergerak. Pengguna mengira animasi macet/delay.
  2. Counter angka menunggu network fetch selesai sebelum bergerak.
- **Solusi**:
  1. Awali headline mengetik seketika sejak 0ms saat halaman dibuka (jeda pembuka dipangkas menjadi ~200ms).
  2. Percepat siklus ketik menjadi snappy dan hidup.
  3. Animated counter angka langsung menggelinding dari 0 ke target secara instan saat frame pertama dirender.

---

## 2. Tabel Komparasi Sebelum vs Sesudah Revisi

| No | Modul | Sebelum Revisi | Sesudah Revisi (Target) |
| :--- | :--- | :--- | :--- |
| 1 | **Pratinjau Cetak PDF** | Terpotong di baris 4, Kop Surat & judul hilang di atas layar | **Tampil utuh dari Kop Surat** hingga TTD bawah, scroll lancar (`items-start`). |
| 2 | **Dashboard Arus Kas** | Hanya total kas gabungan pesantren | **Widget Arus Kas Putra vs Putri** (Pemasukan, Pengeluaran peruntukan, & Netto). |
| 3 | **Diskon Libur** | Tagihan selalu tarif penuh tiap bulan | **Setting Bulan Libur**: Tagihan makan otomatis dipotong saat bulan libur. |
| 4 | **Diskon Beasiswa** | Tidak ada sistem beasiswa (harus edit nominal manual) | **Setting Beasiswa per Santri**: Full (Rp 0) & Sebagian (Prestasi / Tidak Mampu). |
| 5 | **Animasi Hero** | Tertahan delay 2,2 detik sebelum bergerak | **0-Delay**: Mengetik dan berhitung langsung sejak frame pertama dimuat. |

---

## 3. Berkas yang Akan Dimodifikasi

1. `src/components/CollectiveReportModal.jsx` & `IndividualReportModal.jsx` (Fix CSS print & preview clipping).
2. `src/components/ExpenseModal.jsx` (Tambah peruntukan: Umum, Asrama Putra, Asrama Putri).
3. `src/components/DashboardView.jsx` (Tambah widget visual Arus Kas Santri Putra vs Putri).
4. `src/components/SettingView.jsx` (Tambah kartu konfigurasi Diskon Libur Pondok).
5. `src/components/SantriFormModal.jsx` & `SantriView.jsx` (Tambah input & badge status Beasiswa Santri).
6. `src/app/api/sikeja/route.js` (Integrasi diskon libur & beasiswa pada `generate_bills`, hitung arus kas gender pada `dashboard_stats`).
7. `src/components/LandingPage.jsx` (Eliminasi delay 2.2 detik pada typing effect hero).

---

## 4. Rencana Eksekusi Bertahap

1. **Langkah 1**: Perbaiki bug CSS pemotongan dokumen cetak PDF pada `CollectiveReportModal.jsx` & `IndividualReportModal.jsx`.
2. **Langkah 2**: Perbarui `LandingPage.jsx` untuk animasi hero instan tanpa delay.
3. **Langkah 3**: Perkaya `ExpenseModal.jsx` dengan peruntukan pos dan perbarui `route.js` + `DashboardView.jsx` untuk widget Arus Kas Putra vs Putri.
4. **Langkah 4**: Bangun fitur Diskon Libur di `SettingView.jsx` dan Diskon Beasiswa di `SantriFormModal.jsx` + `generate_bills` di `route.js`.
5. **Langkah 5**: Uji build `npm run build`, verifikasi exit code 0, lalu push ke GitHub/Vercel.
