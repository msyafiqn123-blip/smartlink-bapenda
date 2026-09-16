-- ==========================================================
-- SMARTLINK BAPENDA PURWAKARTA - SUPABASE DATABASE SETUP
-- Buka Dashboard Supabase -> Masuk ke Project Anda -> SQL Editor
-- Salin seluruh kode di bawah ini lalu klik RUN
-- ==========================================================

-- 1. Tabel Profile
CREATE TABLE IF NOT EXISTS profile (
  id INT PRIMARY KEY DEFAULT 1,
  title TEXT NOT NULL DEFAULT 'SmartLink',
  bio TEXT NOT NULL DEFAULT 'Subbidang Pendataan Penilaian PBB dan BPHTB',
  avatar_url TEXT NOT NULL DEFAULT '/bapenda.png',
  theme TEXT NOT NULL DEFAULT 'dark',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Admin Auth
CREATE TABLE IF NOT EXISTS admin_auth (
  id INT PRIMARY KEY DEFAULT 1,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Links
CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'link',
  title TEXT NOT NULL,
  url TEXT,
  thumbnail TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 1,
  clicks INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Buat Policy agar data publik dapat dibaca secara aman
DROP POLICY IF EXISTS "Public can read profile" ON profile;
CREATE POLICY "Public can read profile" ON profile FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read active links" ON links;
CREATE POLICY "Public can read active links" ON links FOR SELECT USING (true);

-- Izinkan full access untuk service_role key (server-side Next.js)
DROP POLICY IF EXISTS "Service role full access on profile" ON profile;
CREATE POLICY "Service role full access on profile" ON profile FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on admin_auth" ON admin_auth;
CREATE POLICY "Service role full access on admin_auth" ON admin_auth FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on links" ON links;
CREATE POLICY "Service role full access on links" ON links FOR ALL USING (true);

-- Bersihkan data lama jika ada untuk inisialisasi ulang
TRUNCATE TABLE profile;
TRUNCATE TABLE admin_auth;
TRUNCATE TABLE links;

-- Masukkan Data Profile Awal
INSERT INTO profile (id, title, bio, avatar_url, theme)
VALUES (1, 'SmartLink', 'Subbidang Pendataan Penilaian PBB dan BPHTB', '/bapenda.png', 'dark');

-- Masukkan Data Admin Auth Awal (Password default: admin123)
INSERT INTO admin_auth (id, password_hash, salt)
VALUES (1, '1a28d6a28b95dfc47a52a457b5a2e0f026147d0078d818b73981c0be9a0384b7', '4827e5cd513f87298ae9fb536f4af61a');

-- Masukkan Semua 34 Tautan Awal
INSERT INTO links (id, type, title, url, thumbnail, is_active, display_order, clicks, created_at)
VALUES
('link-585141563', 'link', 'dhkp.pdf - Google Drive', 'https://drive.google.com/file/d/19aeLiCZQKDrHyvepa3jZmzGyJ9S8dCWC/view?usp=drive_link', NULL, false, 1, 0, '2026-09-14T08:22:29.963Z'),
('link-578194922', 'link', 'RT RW CAMPAKA - Google Sheets', 'https://docs.google.com/spreadsheets/d/1_AznqDuGDzLd0P2rZO60v6QHr28kLsvfW_4-0J-cW90/edit?usp=sharing', NULL, false, 2, 0, '2026-09-14T08:22:29.968Z'),
('link-578160991', 'link', 'Verifikasi Lapangan PBB-BPHTB', 'https://verlap.streamlit.app', '/thumbnails/thumb_lt_578160991.png', true, 3, 0, '2026-09-14T08:22:30.591Z'),
('link-563834047', 'link', 'Koreksi Kategori Perusahaan - Google Sheets', 'https://docs.google.com/spreadsheets/d/1W-TF3C_hLqTrunn7OrhmCWk1Bw8UNIe_628WSAFJIa8/edit?usp=sharing', '/thumbnails/thumb_lt_563834047.png', false, 4, 0, '2026-09-14T08:22:31.315Z'),
('link-533452031', 'link', '2026 BA', 'https://drive.google.com/drive/folders/1dddxf0Y7N-5Y5H8tNUJGfvHXBg6XLjGD?usp=sharing', NULL, true, 5, 0, '2026-09-14T08:22:31.316Z'),
('link-531722611', 'link', 'PENDATAAN SPPT BPHTB 2025', 'https://docs.google.com/spreadsheets/d/1ulqXvtbJAVadhjRrQAHCo3fcVrvvIko-gRXMoJ16b_o/edit?usp=sharing', '/thumbnails/thumb_lt_531722611.png', false, 6, 0, '2026-09-14T08:22:31.808Z'),
('link-427627371', 'link', '2025 BA', 'https://drive.google.com/drive/folders/1Ie1CLWx8F_56WMh6EbfZF7LArACRTvHO?usp=sharing', NULL, true, 7, 0, '2026-09-14T08:22:31.808Z'),
('link-575697780', 'link', 'ARSIP BA', 'https://drive.google.com/drive/u/0/folders/1dP9WXS7MPGwJvDhd1KNTpXyI8AXWDLwp', NULL, true, 8, 0, '2026-09-14T08:22:31.808Z'),
('link-592922539', 'link', 'TTE Surat Perintah', 'https://drive.google.com/drive/folders/1vwT9x3I992FNC8ek05f4c31M3fCgH0ZH?usp=sharing', NULL, true, 9, 0, '2026-09-14T08:22:31.808Z'),
('link-347487708', 'link', '2024 BA', 'https://drive.google.com/drive/folders/1bVjPqMl2yyUu_8LwqFT57AXWuxRZOUKe?usp=sharing', NULL, false, 10, 0, '2026-09-14T08:22:31.808Z'),
('hdr-335914670', 'header', 'PBB', NULL, NULL, true, 11, 0, '2026-09-14T08:22:31.808Z'),
('link-539510149', 'link', 'PENDAFTARAN PBB 2026', 'https://docs.google.com/spreadsheets/d/1mrbqAXbRDK7MR-rjlMsVxFzzo6jlhxHpbtHAT5W55RQ/edit?usp=sharing', '/thumbnails/thumb_lt_539510149.png', true, 12, 0, '2026-09-14T08:22:32.462Z'),
('link-320636457', 'link', 'PENDAFTARAN PBB 2025', 'https://docs.google.com/spreadsheets/d/1X3s77rlZqTq8Du_7SbcC4Z3oFUvvSfBJMhSHxwm5Wps/edit?usp=sharing', NULL, true, 13, 0, '2026-09-14T08:22:32.462Z'),
('link-540727520', 'link', 'BA 2026', 'https://docs.google.com/spreadsheets/d/1PXecV5-RbgF9oDmSXtBukikHacqBz5JDIsVI7dS1RpI/edit?gid=860149025#gid=860149025', '/thumbnails/thumb_lt_540727520.png', true, 14, 0, '2026-09-14T08:22:32.952Z'),
('link-320638606', 'link', 'BA 2025', 'https://docs.google.com/spreadsheets/d/1ks72Ez52rkMBdvLyQAlay6H8VdDncOPiyhX0qamUPEI/edit?usp=sharing', NULL, true, 15, 0, '2026-09-14T08:22:32.952Z'),
('link-357174385', 'link', 'PENDAFTARAN PBB 2024', 'https://docs.google.com/spreadsheets/d/1YQ66saF2nzB9XBXvKKbej3GE6b4chT4b4KBs4bRQ7Qc/edit?usp=sharing', '/thumbnails/thumb_lt_357174385.png', false, 16, 0, '2026-09-14T08:22:33.485Z'),
('link-357174480', 'link', 'BA 2024', 'https://docs.google.com/spreadsheets/d/1-GYJNr4A3fJmmlSv81LPpvMPvmpqm-JoTctJdMi4vbA/edit?usp=sharing', '/thumbnails/thumb_lt_357174480.png', false, 17, 0, '2026-09-14T08:22:33.827Z'),
('hdr-335914709', 'header', 'BPHTB', NULL, NULL, true, 18, 0, '2026-09-14T08:22:33.827Z'),
('link-335914907', 'link', 'PENDAFTARAN BPHTB 2025', 'https://docs.google.com/spreadsheets/d/1wXklOIsIIo5sX6knQ_vG7cAvKpTkiazVktVq1iE0NJE/edit?usp=sharing', NULL, true, 19, 0, '2026-09-14T08:22:33.827Z'),
('link-321095034', 'link', 'FILE BPHTB TH 2025', 'https://docs.google.com/spreadsheets/d/1Quuof32hRgphZwSQMMjNSqMnEGoExnL9WWUGuAWSs1Q/edit?usp=sharing', NULL, true, 20, 0, '2026-09-14T08:22:33.827Z'),
('link-353495212', 'link', 'PENDAFTARAN BPHTB 2024', 'https://docs.google.com/spreadsheets/d/1d4Weg1a78Qnb8bPFCXpeCpNXmxnyyLe_MZVjDvGCNA0/edit?usp=sharing', '/thumbnails/thumb_lt_353495212.png', false, 21, 0, '2026-09-14T08:22:34.274Z'),
('link-353495246', 'link', 'FILE BPHTB TH 2024', 'https://docs.google.com/spreadsheets/u/1/d/1ThRUVtVVrwcPMb90eeiMZWRKcRy5PktZOUsLP3Vj2d8/edit#gid=1966753612', '/thumbnails/thumb_lt_353495246.png', false, 22, 0, '2026-09-14T08:22:34.645Z'),
('link-355586076', 'link', 'DATA BIAYA BPHTB', 'https://docs.google.com/spreadsheets/d/1_aYfEU6798bA_ap6mzRBVVBLzNRfaQfrwhTZPSCquug/edit?usp=sharing', '/thumbnails/thumb_lt_355586076.png', true, 23, 0, '2026-09-14T08:22:34.947Z'),
('link-395541405', 'link', 'ARSIP KELUAR MASUK PBB BPHTB', 'https://drive.google.com/drive/folders/1JNgS-Jwj73jkGKafjw6WnI0jsfKYbMAI?usp=drive_link', NULL, true, 24, 0, '2026-09-14T08:22:34.947Z'),
('hdr-323125593', 'header', 'HARGA PASAR', NULL, NULL, false, 25, 0, '2026-09-14T08:22:34.947Z'),
('link-328666365', 'link', 'DATA HARGA PASAR PBB', 'https://docs.google.com/spreadsheets/d/1HbZcxcmXoEhkvqW7gO7mH3VOnHoTufRbmQA8IdEkCTI/edit?usp=sharing', '/thumbnails/thumb_lt_328666365.png', false, 26, 0, '2026-09-14T08:22:35.477Z'),
('link-323126533', 'link', 'File Harga Data Pasar', 'https://drive.google.com/drive/folders/1Kx21o48to99g_e2L6bLWcASVENU3wMvP?usp=sharing', NULL, false, 27, 0, '2026-09-14T08:22:35.477Z'),
('link-335133762', 'link', 'Dokumentasi Desa', 'https://drive.google.com/drive/folders/1EQF3wlddoBL6aRs1gBsUgRCUhy6ta-NG?usp=sharing', '/thumbnails/thumb_lt_335133762.svg', false, 28, 0, '2026-09-14T08:22:35.856Z'),
('link-343724610', 'link', 'LAMPIRAN PERATURAN', 'https://drive.google.com/drive/folders/1veBrdbl1rvto6JnHA_5RPt-J5FS1K1y_?usp=sharing', NULL, false, 29, 0, '2026-09-14T08:22:35.856Z'),
('hdr-333240183', 'header', 'DATA PENDANIL', NULL, NULL, true, 30, 0, '2026-09-14T08:22:35.856Z'),
('link-333240148', 'link', 'File Data Lahan Sawah', 'https://drive.google.com/drive/folders/16PamcA3pWckc-fx1ulmGJXspZdXPDGGd?usp=sharing', NULL, false, 31, 0, '2026-09-14T08:22:35.856Z'),
('link-391665154', 'link', 'Data Tower', 'https://docs.google.com/spreadsheets/d/12-zpycYpluYP_YQIH2OFsVzQAaxOQsLHHndFuHZ6iHc/edit?usp=sharing', NULL, true, 32, 0, '2026-09-14T08:22:35.856Z'),
('link-392401640', 'link', 'Data Tanah Desa', 'https://docs.google.com/spreadsheets/d/1SHf6C700APjm7ZUtv7Zc9RgW5ieWT3Z_DIdiK1AeItU/edit?usp=sharing', '/thumbnails/thumb_lt_392401640.png', true, 33, 0, '2026-09-14T08:22:36.108Z'),
('link-426033997', 'link', 'Jawaban Formulir Konsultasi BPHTB', 'https://docs.google.com/spreadsheets/d/1-nny60JvFbzdo-mmFWUJtHjIcJ6g9vVpYcRxqb5doyQ/edit?usp=sharing', '/thumbnails/thumb_lt_426033997.png', true, 34, 0, '2026-09-14T08:22:36.406Z');

-- SELESAI: Setup dan Seed Database Berhasil!
