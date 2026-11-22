-- ============================================================================
-- SIKEJA (Sistem Informasi Keuangan Santri)
-- Idempotent & Non-Destructive PostgreSQL Migration Script
-- Compatible with Supabase PostgreSQL
-- ============================================================================

-- Enable pgcrypto extension for gen_random_uuid() if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TABEL: santri
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS santri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nis VARCHAR(50) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Putra', 'Putri')) NOT NULL,
    jenjang VARCHAR(10) CHECK (jenjang IN ('SMP', 'MA')) NOT NULL,
    kelas VARCHAR(30) NOT NULL,
    nama_wali VARCHAR(150),
    no_hp VARCHAR(30),
    status_aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast search and filtering
CREATE INDEX IF NOT EXISTS idx_santri_nis ON santri(nis);
CREATE INDEX IF NOT EXISTS idx_santri_nama ON santri(nama_lengkap);
CREATE INDEX IF NOT EXISTS idx_santri_jenjang ON santri(jenjang);
CREATE INDEX IF NOT EXISTS idx_santri_gender ON santri(gender);
CREATE INDEX IF NOT EXISTS idx_santri_status ON santri(status_aktif);

-- ----------------------------------------------------------------------------
-- 2. TABEL: transaksi
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transaksi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_transaksi VARCHAR(40) UNIQUE NOT NULL,
    tanggal_waktu TIMESTAMPTZ DEFAULT NOW(),
    jenis_transaksi VARCHAR(20) CHECK (jenis_transaksi IN ('Pemasukan', 'Pengeluaran')) NOT NULL,
    santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
    bulan_tagihan INT CHECK (bulan_tagihan BETWEEN 1 AND 12),
    tahun_tagihan INT,
    nominal_tagihan NUMERIC(12,2) DEFAULT 0,
    nominal_bayar NUMERIC(12,2) DEFAULT 0,
    alokasi_syahriah NUMERIC(12,2) DEFAULT 0,
    alokasi_makan NUMERIC(12,2) DEFAULT 0,
    sisa_tunggakan NUMERIC(12,2) DEFAULT 0,
    status_bayar VARCHAR(20) CHECK (status_bayar IN ('Lunas', 'Sebagian', 'Belum Bayar')) DEFAULT 'Belum Bayar',
    metode_bayar VARCHAR(20) CHECK (metode_bayar IN ('Cash', 'Transfer', '-')) DEFAULT '-',
    keterangan TEXT,
    admin_input VARCHAR(100)
);

-- Indexes for performance on transaction queries
CREATE INDEX IF NOT EXISTS idx_transaksi_kode ON transaksi(kode_transaksi);
CREATE INDEX IF NOT EXISTS idx_transaksi_santri ON transaksi(santri_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_jenis ON transaksi(jenis_transaksi);
CREATE INDEX IF NOT EXISTS idx_transaksi_status ON transaksi(status_bayar);
CREATE INDEX IF NOT EXISTS idx_transaksi_periode ON transaksi(tahun_tagihan, bulan_tagihan);
CREATE INDEX IF NOT EXISTS idx_transaksi_tanggal ON transaksi(tanggal_waktu);

-- ----------------------------------------------------------------------------
-- 3. TABEL: setting
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS setting (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    keterangan TEXT
);

-- Seed Default Settings (Idempotent: ON CONFLICT DO NOTHING)
INSERT INTO setting (key, value, keterangan) VALUES
('syahriah_putra', '75000', 'Tarif SPP/Syahriah bulanan santri putra (IDR)'),
('syahriah_putri', '100000', 'Tarif SPP/Syahriah bulanan santri putri (IDR)'),
('uang_makan', '380000', 'Tarif uang makan bulanan seluruh santri (IDR)'),
('nama_pesantren', 'Pondok Pesantren Al-Farabi', 'Nama lembaga pesantren resmi'),
('alamat_pesantren', 'Jl. Raya Pesantren No. 1, Kediri, Jawa Timur', 'Alamat lengkap lembaga untuk kop surat'),
('kop_surat_r2_url', '', 'URL publik gambar kop surat di Cloudflare R2'),
('ttd_r2_url', '', 'URL publik gambar tanda tangan / stempel di Cloudflare R2'),
('nama_pejabat', 'KH. Ahmad Fauzi', 'Nama penandatangan dokumen keuangan'),
('jabatan_pejabat', 'Bendahara Umum', 'Jabatan resmi penandatangan dokumen keuangan')
ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. TABEL: users (RBAC: Admin & Guest)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nama_tampilan VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('Admin', 'Guest')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Users:
-- admin / admin123 (SHA-256: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9)
-- tamu  / tamu123  (SHA-256: 3b8cd3da133887e38bcdaf4f098c701567f6e4e8460197bf8537ced9c3507f7f)
INSERT INTO users (username, password_hash, nama_tampilan, role) VALUES
('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Administrator Utama', 'Admin'),
('tamu', '3b8cd3da133887e38bcdaf4f098c701567f6e4e8460197bf8537ced9c3507f7f', 'Tamu Pemantau (Guest)', 'Guest')
ON CONFLICT (username) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. INITIAL SEED DATA: Santri (Sample SMP & MA, Putra & Putri)
-- ----------------------------------------------------------------------------
INSERT INTO santri (nis, nama_lengkap, gender, jenjang, kelas, nama_wali, no_hp, status_aktif) VALUES
('202601001', 'Muhammad Ilham Pratama', 'Putra', 'SMP', '7-A', 'H. Bambang S.', '081234567891', TRUE),
('202601002', 'Ahmad Dani Firmansyah', 'Putra', 'SMP', '8-B', 'Suryono Hadi', '081234567892', TRUE),
('202601003', 'Fathir Rabbani', 'Putra', 'MA', '10-IPA', 'H. Ridwan Kamil', '081234567893', TRUE),
('202601004', 'Zulfikar Ali Wardhana', 'Putra', 'MA', '11-IPS', 'Drs. Subagyo', '081234567894', TRUE),
('202602001', 'Aisyah Nur Salsabila', 'Putri', 'SMP', '7-C Putri', 'Hj. Siti Aminah', '081234567895', TRUE),
('202602002', 'Fatimah Zahra Wardani', 'Putri', 'SMP', '8-C Putri', 'H. Abdullah', '081234567896', TRUE),
('202602003', 'Nabilah Husna Rahmawati', 'Putri', 'MA', '10-Keagamaan', 'Ustadz Mansur', '081234567897', TRUE),
('202602004', 'Zaskia Adilla Putri', 'Putri', 'MA', '12-IPA Putri', 'H. Agus Waluyo', '081234567898', TRUE)
ON CONFLICT (nis) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. PERMISSIONS & ROLES GRANTS (Supabase PostgREST Access)
-- ----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;


