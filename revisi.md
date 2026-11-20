# CATATAN REVISI: SIKEJA (v1.1) - SELESAI DITERAPKAN
================================================================================
Status: DITERAPKAN & TERVERIFIKASI (Build 100% Lolos, Server Ready)
Waktu: 2026-11-20
================================================================================

1. Keamanan Akses Publik vs Admin:
   - Tombol pintas demo publik "Admin Utama" telah DICABUT dari layar login.
   - Tombol demo publik sekarang HANYA untuk "Tamu (Guest / Read-Only)".
   - Akses Admin Utama privat bagi pengurus resmi dengan mengetikkan username & password manual.
   - Kredensial akun Tamu (tamu / tamu123) telah disinkronkan dan dapat masuk 100% sukses.

2. Eliminasi Total Cloudflare R2:
   - Berkas `src/lib/r2.js` telah dihapus secara permanen.
   - Paket `@aws-sdk/client-s3` telah dibersihkan dari `package.json`.
   - Konfigurasi `R2_...` dibersihkan dari `.env.example` dan `.env.local`.
   - Penyimpanan gambar Kop Surat & TTD dialihkan murni ke database Supabase (Base64).
   - Teks UI di menu Setting diperbarui menjadi "Aset Dokumen Resmi Pesantren".

3. Perbaikan Responsif & Layout Sidebar (Sesuai Screenshot):
   - Masalah logo terpotong chevron pada sidebar menciut (`w-20`) telah DIPERBAIKI TOTAL.
   - Tombol ciut/lebar diposisikan melayang (*sleek floating pill*) di perbatasan kanan sidebar (`-right-3.5 top-7`), sehingga logo pesantren di header selalu berada di tengah dan TIDAK PERNAH terpotong lagi.
   - Ikon navigasi menu terpusat secara proporsional dengan tooltip melayang yang tajam saat sidebar menciut.

4. Eliminasi Delay Loading Awal:
   - Font dialihkan ke modul `next/font/google` (`Plus_Jakarta_Sans`) lokal Next.js tanpa dependensi unduh eksternal saat runtime.
   - Angka statistik landing page memiliki initial state instan (0 detik blank screen).
