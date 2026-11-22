# DRAFT RENCANA REVISI: Animated Statistics & Typing Text Effect di Hero Banner SIKEJA
================================================================================
STATUS: SELESAI DITERAPKAN & DIVERIFIKASI (v2.6 VERIFIED & DEPLOYED)
ENGINE: ZettBOT Core v4.1 (by Zettbos)
STANDAR: UI-UX-PRO-MAX (Micro-Interactions, Human-Crafted Aesthetic, Zero Dependency Jank)
================================================================================

## 1. Analisis Kebutuhan Pengguna

Pengguna meminta 2 peningkatan estetika visual interaktif pada halaman depan (**Landing Page / Hero Section**):
1. **Animated Counter (Perhitungan Angka dari 0 ke Target)** pada Panel Statistik Populasi Santri:
   - Angka `Total Santri & Santriwati Aktif`, `Santri Putra`, dan `Santri Putri` tidak langsung muncul statis, melainkan berhitung naik secara halus (*smooth count-up animation*) dari 0 sampai ke angka riil database (misal: 0 → 28, 0 → 27, 0 → 1).
2. **Typing Text Effect & Blinking Cursor** pada Headline Banner Hero:
   - Teks headline mengetik karakter demi karakter secara otomatis memakai JavaScript murni, berhenti sejenak, menghapus (*backspace*), lalu berganti ke judul/fitur berikutnya secara berulang (*looping*).
   - Dilengkapi kursor ketik berkedip (*blinking cursor* `|`) bergaya modern khas UI premium anti-AI.

---

## 2. Rincian Teknis Rekayasa (Surgical Implementation)

### A. Fitur 1: Animated Counter (CountUp via requestAnimationFrame)
- **Komponen**: Dibuat komponen mini/hook `AnimatedCounter({ value, duration = 1200 })` di dalam `LandingPage.jsx`.
- **Logika Animasi**:
  - Menggunakan `requestAnimationFrame` dengan formula *Cubic Ease-Out* ($1 - (1 - t)^3$) agar pergerakan angka terasa natural (cepat di awal, melambat lembut saat mendekati target).
  - Bekerja otomatis saat data stats selesai di-load dari API `/api/sikeja?type=public_stats` maupun saat initial snapshot.
  - Ringan (0kb library eksternal), bebas re-render berlebih, dan 60fps mulus.
- **Titik Penerapan**:
  1. Box Utama: `Total Santri & Santriwati Aktif` (0 → target)
  2. Box Kiri: `Santri Putra` (0 → target)
  3. Box Kanan: `Santri Putri` (0 → target)

### B. Fitur 2: Typing Text Effect & Blinking Cursor
- **Komponen**: State mesin pengetik berbasis JavaScript murni (`typingIndex`, `charIndex`, `isDeleting`, `displayedText`).
- **Daftar Kalimat Fitur yang Diketik Bergantian**:
  Prefix tetap: `Akurat, Transparan, & Terpercaya untuk `
  Frasa yang mengetik bergantian (highlight gradasi hijau-lime):
  1. `"Kas Pesantren."`
  2. `"Syahriah & Uang Makan."`
  3. `"Pembukuan Real-time."`
  4. `"Kuitansi & Laporan Cetak."`
  5. `"Manajemen Data Santri."`
- **Ritme Waktu (Timing)**:
  - Kecepatan ketik: ~80ms per karakter.
  - Jeda saat kalimat selesai diketik: ~2.000ms (2 detik waktu baca).
  - Kecepatan hapus (backspace): ~40ms per karakter.
  - Jeda sebelum mulai kata berikutnya: ~400ms.
- **Kursor Berkedip**:
  - Menggunakan elemen kursor vertikal beranimasi `inline-block w-[3px] h-[0.9em] ml-1.5 bg-lime-400 animate-pulse align-middle rounded-full` agar presisi dan elegan.

---

## 3. Tabel Komparasi Sebelum vs Sesudah Revisi

| No | Elemen UI | Kondisi Saat Ini (Sebelum) | Rencana Hasil (Sesudah) |
| :--- | :--- | :--- | :--- |
| 1 | **Panel Statistik** | Angka populasi santri muncul kaku & instan (statis 28, 27, 1) | **Efek Count-Up 60fps**: Angka menggelinding halus dari 0 ke target riil dalam 1,2 detik dengan *cubic easing*. |
| 2 | **Headline Hero** | Teks `"Kas Pesantren."` diam dan statis | **Typing Text Effect**: Bergantian mengetik 5 variasi fitur otomatis dengan kursor ketik berkedip hijau lime. |
| 3 | **Performa & Desain** | Ringan & elegan | **Tetap 100% ringan**, tanpa menambah package npm eksternal, desain dan warna asli tetap terjaga rapi. |

---

## 4. Berkas yang Akan Diubah

- `src/components/LandingPage.jsx` *(Surgical edit: hanya menambahkan state & hook animasi count-up dan typing effect, tanpa menyentuh layout, tombol, maupun fitur lainnya)*.

---

## 5. Kriteria Verifikasi

1. Buka landing page: angka total santri, putra, dan putri berhitung dari 0 ke angka aktual.
2. Teks headline mengetik bergantian tanpa loncatan layout (*layout shift*).
3. Build verifikasi: `npm run build` berhasil tanpa warning/error (exit code 0).
