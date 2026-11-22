# DRAFT RENCANA REVISI: Konversi Sistem Diskon Libur dari Persentase (%) ke Nominal Rupiah (Rp)
================================================================================
STATUS: SELESAI DITERAPKAN & DIVERIFIKASI (v2.8.1 VERIFIED & DEPLOYED)
ENGINE: ZettBOT Core v4.1 (by Zettbos)
STANDAR: UI-UX-PRO-MAX (Surgical Refactor, Direct Nominal Ease, Clean Financial Input)
================================================================================

## 1. Analisis Kebutuhan Pengguna

Pengguna meminta penyederhanaan sistem diskon libur pondok:
- Mengganti input **Persentase (%)** pada kartu *"Pengaturan Diskon Libur Pondok"* menjadi **Nominal Rupiah (Rp)** langsung.
- Alasan: Bendahara/Admin lebih mudah langsung mengetikkan nominal potongan uang (misal: potongan uang makan Rp 380.000 atau Rp 190.000) tanpa perlu menghitung persentase matematika.

---

## 2. Rincian Teknis Perubahan

### A. Komponen Frontend (`src/components/SettingView.jsx`)
- Mengganti state & label:
  - Dari `diskon_libur_makan_persen` (0–100%) $\rightarrow$ menjadi `diskon_libur_makan_nominal` (Rp).
  - Dari `diskon_libur_syahriah_persen` (0–100%) $\rightarrow$ menjadi `diskon_libur_syahriah_nominal` (Rp).
- Tampilan Input:
  - Input angka step 5.000/10.000 (contoh: Rp 380.000 untuk bebas uang makan).
  - Dilengkapi teks format live: `Terbaca: Rp 380.000` menggunakan `formatIDR()`.
  - Placeholder & helper text membumi:
    - *"Contoh: 380000 (Potongan penuh uang makan saat santri libur di rumah)"*
    - *"Contoh: 0 (Jika syahriah tetap penuh tanpa potongan, atau isi nominal potongan)"*

### B. Backend Engine (`src/app/api/sikeja/route.js`)
- Di fungsi `getSettingsMap()`:
  - Membaca `diskon_libur_makan_nominal` (default Rp 380.000) dan `diskon_libur_syahriah_nominal` (default Rp 0).
- Di aksi `generate_bills`:
  - Kalkulasi saat bulan libur menjadi pengurangan langsung nominal:
    $$\text{Tarif Makan Efektif} = \max(0, \text{Uang Makan} - \text{Potongan Makan Nominal})$$
    $$\text{Tarif Syahriah Efektif} = \max(0, \text{Syahriah} - \text{Potongan Syahriah Nominal})$$
  - Bebas dari konversi persentase, 100% presisi dan tidak ada pembulatan desimal aneh.

---

## 3. Tabel Komparasi Sebelum vs Sesudah

| Elemen UI / Backend | Sebelum Revisi (Persen %) | Sesudah Revisi (Target: Nominal Rp) |
| :--- | :--- | :--- |
| **Input Potongan Makan** | `Potongan Uang Makan Saat Libur (%)` (Isi: 100) | `Potongan Uang Makan Saat Libur (Rp)` (Isi: 380.000) |
| **Input Potongan Syahriah** | `Potongan Syahriah/SPP Saat Libur (%)` (Isi: 0) | `Potongan Syahriah/SPP Saat Libur (Rp)` (Isi: 0) |
| **Bantuan Keterangan** | Menjelaskan persentase 0-100% | Format mata uang live `Terbaca: Rp 380.000` |
| **Kalkulasi Tagihan** | `uangMakan * (1 - persen/100)` | `uangMakan - potonganNominal` (Langsung & Mudah) |

---

## 4. Berkas yang Akan Dimodifikasi

1. `src/components/SettingView.jsx` (Ganti input % ke Rp + helper format IDR live).
2. `src/app/api/sikeja/route.js` (Sesuaikan pembacaan setting dan formula pengurangan nominal pada `generate_bills`).
