# DRAFT RENCANA REVISI: Multi-Section Landing Page SIKEJA (v2.7.0)
================================================================================
STATUS: SELESAI DITERAPKAN & DIVERIFIKASI (v2.7 VERIFIED & DEPLOYED)
ENGINE: ZettBOT Core v4.1 (by Zettbos)
STANDAR: UI-UX-PRO-MAX (Dark-Emerald Glassmorphism, Responsive Multi-Section, Dynamic Settings)
================================================================================

## 1. Analisis Kebutuhan Pengguna

Memperbarui Landing Page SIKEJA dari satu layar (*single-fold*) menjadi halaman web penuh (*full multi-section web page*) yang dapat di-scroll ke bawah secara halus (*smooth scrolling*), tetap mempertahankan estetika **Dark-Emerald Glassmorphism**, dengan 4 seksi terpadu:
1. **Smooth-Scroll Navbar**: Tautan navigasi di header (Beranda, Tarif & Syahriah, Keunggulan, Alur Bayar) + tombol "Masuk ke Sistem".
2. **Seksi 1 (Tarif Bulanan)**: Kartu transparansi tarif bulanan Putra vs Putri (Syahriah + Uang Makan) yang datanya ditarik dinamis dari tabel `setting` di database.
3. **Seksi 2 (4 Keunggulan Tata Kelola)**: Grid 4 kartu kaca keunggulan sistem (Tagihan Massal, Auto-Alokasi Multi-Pos, Kuitansi & WhatsApp, Laporan Resmi A4).
4. **Seksi 3 (Alur Pembayaran 3 Langkah)**: Panduan 3 langkah bagi santri/wali santri (Terima Tagihan, Bayar Kasir/Transfer, Terima Kuitansi Sah). *Sesuai instruksi pengguna: Widget Cek NIS publik ditiadakan.*
5. **Seksi 4 (Footer Resmi Pesantren)**: Nama pesantren, alamat, kontak dari tabel `setting`, tautan navigasi cepat, dan copyright SIKEJA.

---

## 2. Berkas yang Dimodifikasi

1. `src/app/api/sikeja/route.js`:
   - Pada handler `type === 'public_stats'`, menambahkan pengambilan data dari tabel `setting` via `Promise.all` (tarif syahriah putra/putri, tarif makan, nama pesantren, alamat, telepon) secara publik tanpa autentikasi.
2. `src/components/LandingPage.jsx`:
   - Menambahkan navbar links dengan smooth scroll (`onClick={() => scrollToSection('id')}` atau native `#id`).
   - Menambahkan Seksi 1: Kartu Transparansi Tarif Bulanan (Putra vs Putri).
   - Menambahkan Seksi 2: Grid 4 Keunggulan Tata Kelola Keuangan.
   - Menambahkan Seksi 3: Alur Pembayaran 3 Langkah.
   - Menambahkan Seksi 4: Footer resmi pesantren berestetika Dark-Emerald.

---

## 3. Desain & Estetika (Preservasi Dark-Emerald Glassmorphism)

- Latar belakang gradasi konsisten: `from-[#0b2239] via-[#0f3d3e] to-[#14533c]`.
- Kartu menggunakan `glass-panel` dan `glass-panel-elevated` dengan border halus `border-white/10`.
- Ikon vektor Lucide SVG yang serasi: `CheckCircle2`, `Wallet`, `Utensils`, `Layers`, `ShieldCheck`, `FileText`, `Send`, `CreditCard`, `Receipt`, `Building2`.
- Format mata uang Rupiah otomatis menggunakan helper `Intl.NumberFormat('id-ID')`.
- Mobile responsive: Grid 1 kolom di HP, 2-4 kolom di tablet & desktop.
