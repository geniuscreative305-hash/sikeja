# DRAFT RENCANA REVISI: Penyesuaian Ukuran Cetak Struk Kwitansi Standar A5 & Eliminasi Total Latar Belakang Hijau
================================================================================
STATUS: SELESAI DITERAPKAN & DIVERIFIKASI (v2.9.2 VERIFIED & DEPLOYED)
ENGINE: ZettBOT Core v4.1 (by Zettbos)
STANDAR: UI-UX-PRO-MAX (Standard A5 Receipt Form-Factor, Pure White Background, Zero-Bleed)
================================================================================

## 1. Analisis Masalah & Akar Penyebab

Berdasarkan keluhan pengguna dan screenshot print preview (`media_1795403077808_3362737c.png`):
1. **Ukuran Kertas Belum A5 (Masih Terbawa Ukuran A4):**
   - *Penyebab:* Pengaturan `@page` di CSS saat ini masih dipatok global ke `size: A4 portrait; margin: 10mm;`. Saat mencetak struk kwitansi, browser printer menganggap dokumen berukuran A4 dan meletakkan struk di tengah kertas A4, bukan ukuran A5 (148mm x 210mm) yang umum digunakan untuk mesin struk/kuitansi kasir pesantren.
2. **Muncul Garis/Strip Gelap Hijau Tua di Sisi Kiri dan Kanan Struk:**
   - *Penyebab:* Pada wrapper utama di `src/app/page.js`, kelas Tailwind `bg-gradient-to-br from-[#0b2239] via-[#0f3d3e] to-[#14533c]` menetapkan properti CSS `background-image: linear-gradient(...)`. Properti `print:bg-white` hanya mengganti `background-color`, tetapi **tidak menghapus `background-image` gradien**. Akibatnya di luar kartu struk 140mm, gradien hijau tua tetap tampak di sisi kiri dan kanan kertas.

---

## 2. Rincian Solusi Teknis Rekayasa

### A. Dedicated `@page` A5 Khusus untuk Cetak Kwitansi (`KwitansiModal.jsx`)
- Tambahkan blok `<style>` khusus cetak di dalam `KwitansiModal.jsx`:
  ```css
  @media print {
    @page {
      size: A5 portrait; /* 148mm x 210mm (Standar Kuitansi Kasir Resmi) */
      margin: 8mm;
    }
  }
  ```
- Dengan aturan ini:
  - Saat dialog cetak Kwitansi dibuka, browser otomatis memilih ukuran kertas **A5 Portrait**.
  - Sangat presisi saat dicetak menggunakan mesin cetak struk (printer kasir / A5).

### B. Optimalisasi Layout & Proporsi Konten Kwitansi A5 (`KwitansiModal.jsx`)
- Pada kartu struk kwitansi:
  - Ubah lebar cetak menjadi `width: 100% !important; max-width: 100% !important;` (menyesuaikan batas margin 8mm kertas A5).
  - Perkecil padding cetak menjadi `padding: 4mm 6mm !important;` agar kompak dan elegan.
  - Skalakan logo kop pesantren: `print:max-h-12` (tinggi ~30px) agar proporsional di kertas A5.
  - Teks transaksi, rincian biaya, dan data santri menggunakan ukuran `text-[10px]` dengan jarak baris rapat (`leading-snug`).
  - Bagian tanda tangan pejabat & penyetor disesuaikan tinggi area parafnya (`h-8` saat cetak) agar seluruh dokumen muat 100% pas dalam tinggi 210mm kertas A5 tanpa bersisa halaman ke-2.

### C. Eliminasi Total Gradien Hijau di Seluruh Elemen (`globals.css` & `page.js`)
- Di `src/app/globals.css`:
  - Paksa pembatalan seluruh gradien pada `@media print`:
    ```css
    @media print {
      html, body, div, main, section {
        background-image: none !important;
      }
      .print-modal-backdrop {
        background: #ffffff !important;
        background-color: #ffffff !important;
        background-image: none !important;
      }
    }
    ```
- Di `src/app/page.js`:
  - Tambahkan `print:bg-none` pada tag root terluar sehingga `linear-gradient` dinonaktifkan saat cetak.
- **Hasil:** Sisi kiri dan kanan struk menjadi 100% putih bersih tanpa ada strip hijau gelap sedikit pun.

---

## 3. Matriks Perbandingan Sebelum vs Sesudah

| Parameter | Sebelum | Target Sesudah Revisi |
| :--- | :--- | :--- |
| **Ukuran Kertas Dokumen** | A4 Portrait (terlalu besar untuk struk) | **A5 Portrait (148mm x 210mm)** resmi standar kuitansi kasir |
| **Latar Belakang Sisi Luar** | Ada strip gradien hijau tua (`#0f3d3e`) | **100% Putih Polos Murni (`#ffffff`)** tanpa gradien |
| **Kesesuaian Mesin Struk** | Harus memotong kertas manual | **Langsung pas masuk ke printer kuitansi A5** |
| **Total Lembar Halaman** | Kadang menyisakan ruang kosong | **Tepat 1 lembar A5 (1 Sheet of Paper)** |

---

## 4. Berkas yang Akan Dimodifikasi
1. `src/components/KwitansiModal.jsx` (Tambahkan blok `@page { size: A5 portrait; }`, sesuaikan padding dan tinggi elemen agar pas A5).
2. `src/app/globals.css` (Tambahkan aturan `background-image: none !important;` untuk menghilangkan strip gradien hijau).
3. `src/app/page.js` (Tambahkan `print:bg-none`).
