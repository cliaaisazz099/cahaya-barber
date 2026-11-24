# Product Requirements Document (PRD)
# Cahaya Barber — Sistem Reservasi & Manajemen Barbershop Multi-Cabang

---

## 1. Document Overview

- **Product Name:** Cahaya Barber Management & Online Reservation System
- **Document Version:** 1.0.0
- **Status:** `Pending Approval`
- **Owner / Author:** Product Management & Engineering Team
- **Target Audience:** Tim Pengembang, UI/UX Designer, Stakeholder (Owner & Admin Barbershop)
- **Document Purpose:** Menjadi panduan tunggal kebenaran (*single source of truth*) yang mendefinisikan masalah, tujuan produk, personas, batasan ruang lingkup (MVP, V2, Later), user stories, functional requirements, serta edge cases untuk pengembangan sistem Cahaya Barber dari fase frontend hingga produk final beroperasi penuh di produksi.

---

## 2. Problem Statement

### 2.1 Konteks & Masalah
1. **Bagi Pelanggan:**
   - **Antrean Fisik Tidak Terprediksi:** Pelanggan barbershop sering kali harus datang langsung dan menunggu tanpa kepastian waktu, terutama pada jam sibuk (*peak hours*) akhir pekan atau malam hari.
   - **Kesulitan Memilih Kapster Favorit:** Pelanggan sering kali kecewa jika kapster andalan mereka sedang tidak bertugas atau sedang melayani pelanggan lain tanpa informasi sebelumnya.
   - **Hambatan Reservasi Konvensional:** Booking melalui chat WhatsApp manual sering kali lambat direspons saat kapster/kasir sedang sibuk memotong rambut, serta rentan pencatatan ganda (*double booking*).

2. **Bagi Pemilik & Pengelola Barbershop (Owner & Admin Cabang):**
   - **Pencatatan Operasional Multi-Cabang Masih Tersebar:** Cahaya Barber beroperasi di 3 cabang (Manislor, Jalaksana, Veteran). Tanpa sistem terpusat, Owner kesulitan memantau volume reservasi, performa kapster, dan status harian masing-masing cabang.
   - **Koordinasi Penugasan Kapster:** Penjadwalan, mutasi tugas kapster antar-cabang, atau pengarsipan kapster yang tidak aktif membutuhkan kontrol yang rapi agar tidak terjadi bentrok operasional.
   - **Pelacakan Booking yang Terlewat:** Reservasi yang dicatat di buku fisik atau chat rentan hilang, lupa dikonfirmasi, atau tidak tercatat status akhirnya (apakah pelanggan hadir atau tidak).

### 2.2 Status Bukti
- **Dikonfirmasi (*Confirmed*):** Cahaya Barber memiliki 3 cabang fisik di Kuningan (Manislor, Jalaksana, Veteran). Model bisnis barbershop melayani potong rambut dan perawatan pria dengan sistem bayar langsung di tempat (*Pay-at-Store*).
- **Asumsi (*Assumption*):** Sebagian besar pelanggan mengakses informasi dan melakukan booking melalui perangkat ponsel pintar (mobile-first behavior) dan menggunakan WhatsApp sebagai kanal komunikasi utama.

---

## 3. Target Users and Personas

### 3.1 Primary User Groups
1. **Pelanggan Publik (Customer):** Pria dewasa/remaja yang ingin merapikan penampilan, menginginkan kepastian jadwal potong, dan memilih kapster favorit tanpa antre lama di lokasi.
2. **Admin Cabang:** Staf operasional/kasir di cabang tertentu (Manislor/Jalaksana/Veteran) yang mengawasi antrean harian, memverifikasi kedatangan pelanggan, dan mengonfirmasi status booking.
3. **Owner (Pemilik Usaha):** Pemilik Cahaya Barber yang mengawasi seluruh cabang, mengelola data induk layanan, memantau utilisasi kapster, dan melihat metrik bisnis keseluruhan.

---

### 3.2 User Personas

#### Persona 1: Pelanggan Publik
- **Nama:** Reza Pratama (27 tahun, Karyawan Swasta)
- **Karakter & Kebutuhan:**
  - Menghargai waktu dan tidak suka membuang waktu 1–2 jam menunggu antrean di tempat.
  - Memiliki preferensi model rambut spesifik (Two-Block / Fade) dan hanya ingin dipotong oleh kapster kepercayaannya.
  - Ingin proses booking cepat langsung dari smartphone tanpa perlu download aplikasi toko aplikasi (cukup via web browser).
- **Frustrasi:** Datang ke barbershop dan ternyata kapster favoritnya sedang libur atau antrean sudah penuh hingga malam.

#### Persona 2: Admin Cabang
- **Nama:** Rizky Kurniawan (24 tahun, Kasir & Admin Cabang Manislor)
- **Karakter & Kebutuhan:**
  - Bertanggung jawab atas alur meja kasir dan antrean di cabang Manislor.
  - Butuh daftar ringkas siapa pelanggan yang akan datang per jam hari ini.
  - Butuh kemudahan mengubah status pelanggan (Tiba -> Dilayani -> Selesai / Batal).
- **Frustrasi:** Pelanggan booking manual via WhatsApp pribadi yang tumpang-tindih di jam yang sama sehingga ruang tunggu penuh sesak.

#### Persona 3: Owner Barbershop
- **Nama:** Hendra Wijaya (42 tahun, Pemilik Usaha Cahaya Barber)
- **Karakter & Kebutuhan:**
  - Membutuhkan visibilitas operasional di seluruh 3 cabang tanpa harus mengunjungi lokasi fisik satu per satu setiap hari.
  - Mengelola penempatan kapster (misal: memindahkan kapster senior untuk memperkuat cabang baru).
- **Frustrasi:** Tidak memiliki data historis yang akurat mengenai cabang mana yang paling padat dan kapster mana yang paling produktif.

---

## 4. Goals and Non-Goals

### 4.1 Product Goals
1. **Kepastian Jadwal Pelanggan:** Mengurangi waktu tunggu antrean fisik di lokasi dengan menyediakan alur reservasi mandiri 4 langkah yang transparan terkait cabang, kapster, layanan, dan jam operasional.
2. **Device-Friendly Ticket Access:** Memungkinkan pelanggan mengecek status tiket booking mereka secara instan dari perangkat yang sama tanpa mewajibkan registrasi akun (*frictionless booking*).
3. **Sentralisasi Operasional Multi-Cabang:** Menyediakan satu portal administrasi terpadu berbasis peran (Owner vs Admin Cabang) untuk mengelola reservasi dan kapster.
4. **Jembatan WhatsApp yang Mulus:** Memanfaatkan popularitas WhatsApp di Indonesia dengan menyematkan format pesan booking dan pembatalan otomatis sekali klik.
5. **Kesiapan Menuju Sistem Produksi Penuh:** Membangun antarmuka dan kontrak alur data yang modular sehingga transisi dari fase frontend/mock ke backend Supabase berjalan tanpa merombak logika UI.

### 4.2 Non-Goals (Hal yang Sengaja Tidak Dilakukan pada Fase Ini)
1. **Bukan Pembayaran / Gateway Online:** Sistem tidak memproses transaksi kartu kredit, QRIS online, atau uang muka (*DP*) digital di web. Semua transaksi keuangan diselesaikan langsung di kasir (*Pay-at-Store*).
2. **Bukan Aplikasi Native App Store / Play Store:** Produk tidak dibuat sebagai file APK/iOS native, melainkan Web Responsive (PWA-ready).
3. **Bukan Sistem POS/Inventaris Barang Lengkap:** Sistem ini difokuskan pada manajemen reservasi dan kapster, bukan untuk pencatatan stok pomade/shampoo atau pembukuan akuntansi laba-rugi mendalam.
4. **Bukan Bot WhatsApp Otomatis Mandiri (Chatbot AI):** Konfirmasi dan pembatalan via WhatsApp tetap melibatkan komunikasi interpersonal antara pelanggan dan admin manusia.

---

## 5. User Stories

| ID | Aktor | Story | Prioritas | Acceptance Criteria (Kriteria Selesai) |
|---|---|---|---|---|
| **US-001** | Pelanggan | Sebagai pelanggan, saya ingin melihat profil cabang, layanan, estimasi durasi, dan harga di halaman beranda, agar saya dapat menentukan perawatan yang tepat. | P0 (Must Have) | - Menampilkan 3 cabang lengkap dengan alamat ringkas.<br>- Menampilkan daftar layanan lengkap beserta durasi (menit) dan harga (Rp). |
| **US-002** | Pelanggan | Sebagai pelanggan, saya ingin memilih cabang dan kapster yang tersedia di cabang tersebut, agar saya dipotong oleh orang yang tepat. | P0 (Must Have) | - Setelah memilih cabang, sistem hanya menampilkan kapster aktif yang bertugas di cabang tersebut.<br>- Tidak dapat lanjut ke Step 2 sebelum cabang & kapster dipilih. |
| **US-003** | Pelanggan | Sebagai pelanggan, saya ingin memilih tanggal dan slot waktu kunjungan (10.00–21.00 WIB), agar saya tahu kapan harus datang. | P0 (Must Have) | - Tanggal minimal adalah hari ini (tidak bisa memilih tanggal lampau).<br>- Slot waktu disesuaikan dengan jam operasional (10.00–21.00 WIB) dengan interval 30 menit.<br>- Slot yang sudah penuh/bentrok dengan booking kapster lain tidak dapat dipilih. |
| **US-004** | Pelanggan | Sebagai pelanggan, saya ingin mengisi nama, nomor WhatsApp, dan catatan tambahan, lalu mengonfirmasi booking untuk mendapatkan tiket unik. | P0 (Must Have) | - Validasi nomor WhatsApp dan nama wajib diisi.<br>- Sistem menerbitkan Kode Booking unik berformat `CB-[KODE_CABANG]-[YYMMDD]-[NO]`.<br>- Tiket aktif tersimpan di memori perangkat (`localStorage`). |
| **US-005** | Pelanggan | Sebagai pelanggan, saya ingin langsung mengirim rincian tiket reservasi ke WhatsApp Admin dengan sekali klik, agar jadwal saya segera diverifikasi. | P0 (Must Have) | - Tombol memicu tautan `wa.me` dengan teks pesan yang sudah terisi otomatis (Kode, Nama, Layanan, Kapster, Jadwal). |
| **US-006** | Pelanggan | Sebagai pelanggan yang sudah memiliki tiket aktif, saya ingin melihat tiket saya saat membuka web kembali, agar saya tidak perlu mencatat manual. | P0 (Must Have) | - Jika perangkat memiliki tiket aktif berstatus pending/confirmed, halaman reservasi otomatis menampilkan tiket tersebut.<br>- Ada opsi untuk "Buat Booking Baru" jika ingin memesan jadwal lain. |
| **US-007** | Pelanggan | Sebagai pelanggan, saya dicegah membuat booking ganda jika nomor WhatsApp atau nama saya masih memiliki reservasi aktif di jam operasional. | P1 (Should Have) | - Sistem mendeteksi nomor WA/nama yang sedang berstatus pending/confirmed dan menampilkan peringatan serta langsung mengarahkan ke tiket aktifnya. |
| **US-008** | Pelanggan | Sebagai pelanggan, saya ingin dapat menghubungi WhatsApp Admin untuk pembatalan atau perubahan jadwal jika berhalangan. | P1 (Should Have) | - Terdapat tombol khusus pada tiket untuk memicu pesan WhatsApp permohonan pembatalan terstruktur. |
| **US-009** | Admin Cabang | Sebagai admin cabang, saya ingin login ke portal manajemen dan melihat ringkasan antrean cabang saya hari ini. | P0 (Must Have) | - Login membedakan peran Admin Cabang.<br>- Dashboard hanya memuat total booking, kapster aktif, dan tabel reservasi untuk cabang yang menjadi wewenang admin tersebut. |
| **US-010** | Admin Cabang | Sebagai admin cabang, saya ingin mengubah status reservasi pelanggan (Konfirmasi, Selesai, Batal), agar antrean operasional tetap akurat. | P0 (Must Have) | - Status `pending` dapat diubah menjadi `confirmed` atau `cancelled`.<br>- Status `confirmed` dapat diubah menjadi `completed` saat pelayanan selesai.<br>- Status `cancelled` atau `completed` terkunci (*immutable*). |
| **US-011** | Owner | Sebagai owner, saya ingin memantau seluruh cabang dan mengelola data kapster (tambah, edit, atur cabang, aktifkan/nonaktifkan, arsip, hapus permanen). | P0 (Must Have) | - Owner memiliki akses *All Branches*.<br>- Form tambah kapster baru dan penentuan penugasan cabang (1 kapster = 1 cabang tetap).<br>- Opsi nonaktifkan sementara, arsipkan, pulihkan, dan hapus permanen kapster. |
| **US-012** | Owner & Admin | Sebagai pengelola, saya ingin melihat dan mengelola katalog layanan (Owner: CRUD, arsipkan, pulihkan, hapus permanen; Admin Cabang: read-only referensi kasir) serta ulasan pelanggan. | P0 (Must Have) | - Owner: kontrol penuh CRUD paket treatment, tarif, durasi, arsipkan, pulihkan, dan hapus permanen.<br>- Admin Cabang: mode referensi kasir (read-only) dengan banner informasi.<br>- Tampilan feedback ulasan pelanggan per cabang. |
| **US-013** | Pelanggan | Sebagai pelanggan, saya ingin mencari dan membuka kembali tiket reservasi saya (via Kode Booking atau No WhatsApp) serta memberikan rating bintang (1–5 star) dan ulasan setelah layanan selesai tanpa perlu login. | P0 (Must Have) | - Tombol "Cek Tiket" di Navbar dan Hero dengan modal pencarian kode booking / No WhatsApp.<br>- Tiket berstatus `completed` menampilkan form Star Rating interaktif (1–5) dan kolom pesan ulasan.<br>- Setelah dikirim, ulasan otomatis tersimpan ke katalog review dan muncul di halaman ulasan admin serta testimoni beranda. |

---

## 6. Feature Scope and Priorities

| Fase Pengembangan | Ruang Lingkup Utama | Fokus Deliverable |
|---|---|---|
| **Fase 1: MVP (Progres Saat Ini)** | Frontend-First & Operasional Mock | Landing Page, Alur Booking 4 Langkah, Filter Kapster per Cabang, Proteksi Bentrok Jadwal, Tiket Perangkat, Direct WhatsApp, Portal Admin/Owner Mock. |
| **Fase 2: V2 (Sistem Lengkap)** | Integrasi Backend Penuh & Realtime | Database Cloud Supabase (PostgreSQL), Supabase Auth & RLS, Realtime Status Sync, CRUD Layanan & Jam Operasional, No. WhatsApp Dinamis Cabang. |
| **Fase 3: Later (Ekspansi)** | Otomasi Lanjutan & Skalabilitas Bisnis | WhatsApp Gateway API/Bot terotomasi, Reschedule Mandiri dengan Token/OTP, Program Loyalitas Pelanggan, Modul Komisi Kapster. |

### 6.1 Fase 1: MVP (Fokus Saat Ini — Frontend-First & Operasional Mock)
- **Status:** Dalam tahap pengerjaan aktif.
- **Tujuan:** Menyelesaikan seluruh pengalaman pengguna (UI/UX) di sisi pelanggan dan admin dengan alur data lokal yang realistis sebelum migrasi backend.
- **Fitur Termasuk:**
  1. Halaman Depan Pelanggan: Hero, Profil 3 Cabang, Daftar Layanan lengkap dengan Harga & Durasi.
  2. Wizard Pemesanan 4 Tahap: Pemilihan Cabang -> Filter Kapster Cabang -> Pilih Layanan -> Pilih Jadwal & Jam -> Formulir Data Diri.
  3. Sinkronisasi Data Kapster: Dropdown kapster terhubung dengan data kapster aktif yang terdaftar di cabang tersebut.
  4. Validasi Bentrok: Pencegahan booking ganda untuk pelanggan yang sama serta pencegahan bentrok jam pada kapster yang sama.
  5. Penyimpanan Tiket Perangkat: Pelanggan dapat melihat kembali status tiket aktif mereka tanpa login.
  6. Integrasi Tombol WhatsApp: Tombol konfirmasi dan pembatalan dengan pesan otomatis.
  7. Portal Admin/Owner: Login demo, Dashboard statistik, Manajemen status reservasi (Pending, Confirmed, Completed, Cancelled), CRUD kapster (tambah, edit, 1 kapster = 1 cabang, status aktif, arsipkan, pulihkan, hapus permanen), serta Manajemen Layanan Terpusat (Owner-only CRUD, status aktif, arsipkan, pulihkan, hapus permanen; Admin Cabang read-only referensi kasir).
  8. Sistem Cek Tiket & Ulasan Terverifikasi: Tombol "Cek Tiket" mandiri di Navbar & Hero, pencarian via Kode Booking atau Nomor WhatsApp, form Star Rating interaktif (1–5 bintang) + pesan ulasan pada tiket yang berstatus completed, serta dashboard ulasan role-based (Admin Cabang per cabang, Owner seluruh cabang).

### 6.2 Fase 2: V2 (Integrasi Backend Penuh — Supabase & Realtime)
- **Tujuan:** Menghubungkan seluruh frontend yang sudah tervalidasi ke database cloud Supabase untuk operasional multi-perangkat yang sinkron.
- **Fitur Termasuk:**
  1. Migrasi schema database relasional ke PostgreSQL Supabase (tabel `branches`, `barbers`, `services`, `branch_barber_assignments`, `bookings`, `profiles`).
  2. Autentikasi Admin/Owner aman via Supabase Auth dengan Row Level Security (RLS) berbasis role.
  3. Realtime Updates: Saat pelanggan melakukan booking, dashboard admin langsung terupdate otomatis tanpa refresh.
  4. Konfigurasi Nomor WhatsApp Dinamis per Cabang: Pesan langsung terarah ke nomor resmi masing-masing cabang.
  5. Pengelolaan Katalog Layanan & Jam Shift langsung dari antarmuka Admin/Owner.

### 6.3 Fase 3: Later (Ekspansi & Otomasi Lanjutan)
- **Fitur Termasuk:**
  1. WhatsApp Cloud API / Webhook: Konfirmasi otomatis dari sistem ke WhatsApp pelanggan tanpa perlu klik manual.
  2. Fitur Reschedule Mandiri: Pelanggan dapat memindahkan jam potong sendiri dengan link verifikasi OTP/Token.
  3. Loyalty & Riwayat Potong: Pelanggan yang sering datang mendapatkan stempel digital (potong ke-10 gratis).
  4. Modul Perhitungan Komisi Kapster berdasarkan jumlah kepala/layanan yang diselesaikan.

---

## 7. Functional Requirements

### 7.1 Area Pelanggan (Customer Experience)

- **FR-001 (Katalog Cabang & Layanan):** Sistem harus menampilkan 3 cabang fisik (Manislor, Jalaksana, Veteran) dan daftar layanan beserta durasi pengerjaan dan tarif biaya (Rp). *(Mapped to US-001)*
- **FR-002 (Pemilihan Berjenjang Cabang & Kapster):** Sistem hanya mengizinkan pemilihan kapster setelah cabang dipilih. Daftar kapster yang ditampilkan harus difilter secara dinamis hanya untuk kapster yang berstatus aktif dan memiliki penugasan (*assignment*) pada cabang terpilih. *(Mapped to US-002)*
- **FR-003 (Pemberian Batasan Kalender):** Input tanggal reservasi tidak boleh mengizinkan pemilihan tanggal sebelum hari ini (`min = today`). *(Mapped to US-003)*
- **FR-004 (Pembangkitan Slot Waktu Operasional):** Sistem harus membangkitkan slot waktu mulai pukul 10.00 hingga 21.00 WIB dengan interval 30 menit, dengan memperhitungkan durasi layanan terpilih agar tidak melebihi jam tutup operasional. *(Mapped to US-003)*
- **FR-005 (Pencegahan Bentrok Jam Kapster):** Slot waktu untuk kapster tertentu harus dinonaktifkan (*disabled*) jika kapster tersebut sudah memiliki jadwal dengan status `pending` atau `confirmed` pada tanggal dan rentang jam yang sama. *(Mapped to US-003)*
- **FR-006 (Format Kode Booking Terstandar):** Setiap reservasi yang berhasil disubmit harus diberikan kode booking 15 karakter permanen dengan format: `CB-[KodeCabang]-[YYMMDD]-[NoUrut2Digit]`, contoh: `CB-MN-261123-01`. *(Mapped to US-004)*
- **FR-007 (Penyimpanan Tiket di Perangkat):** Setelah formulir disubmit, sistem harus menyimpan ID booking pada `localStorage` perangkat klien dan langsung menampilkan halaman tiket aktif. *(Mapped to US-004, US-006)*
- **FR-008 (Pencegahan Booking Ganda Pelanggan):** Jika nomor WhatsApp atau nama pelanggan yang diinput sedang memiliki reservasi berstatus `pending` atau `confirmed` di sistem, sistem harus menolak pembuatan reservasi baru, menampilkan modal/alert peringatan, dan menyajikan tiket aktif yang sudah ada. *(Mapped to US-007)*
- **FR-009 (Tautan WhatsApp Terstruktur):** Sistem harus menyediakan tombol aksi WhatsApp yang secara otomatis membuka aplikasi/web WhatsApp dengan nomor admin dan pesan terenkode rapi yang mencantumkan Kode Booking, Nama, Layanan, Kapster, dan Jadwal. *(Mapped to US-005, US-008)*

---

### 7.2 Area Administrasi (Admin & Owner Portal)

- **FR-010 (Otentikasi & Pembatasan Akses Role):** Sistem harus menyediakan halaman login yang memvalidasi kredensial pengguna dan mengarahkan ke dashboard sesuai role:
  - Role `admin`: Terikat pada satu `branch_id` spesifik.
  - Role `owner`: Memiliki hak istimewa untuk seluruh cabang (`branch_id = null / all`). *(Mapped to US-009)*
- **FR-011 (Route Guarding):** Semua rute di bawah `/admin/*` (kecuali `/admin/login`) wajib dilindungi oleh komponen penjaga (*Guard*). Pengguna tanpa sesi aktif harus dialihkan ke `/admin/login`. *(Mapped to US-009)*
- **FR-012 (Filter Data Dashboard per Cabang):** Dashboard Admin Cabang hanya boleh mengagregasi metrik (jumlah booking, jumlah kapster aktif, booking terbaru) untuk cabangnya sendiri, sedangkan Owner dapat melihat statistik gabungan maupun filter per cabang. *(Mapped to US-009)*
- **FR-013 (Siklus Status Booking):**
  - Reservasi baru masuk dengan status `pending`.
  - Admin/Owner dapat mengubah status `pending` menjadi `confirmed` atau `cancelled`.
  - Reservasi `confirmed` dapat diubah menjadi `completed` setelah layanan selesai.
  - Reservasi `cancelled` dan `completed` bersifat final dan tidak dapat diubah kembali ke status aktif. *(Mapped to US-010)*
- **FR-014 (Manajemen Data Kapster oleh Owner):** Owner dapat menambahkan kapster baru, mengedit profil (nama, telepon, foto, deskripsi), menonaktifkan status, mengarsipkan kapster, dan mengatur penugasan cabang kapster. *(Mapped to US-011)*
- **FR-015 (Katalog Layanan & Ulasan):** Sistem menyediakan tampilan daftar paket layanan yang terdaftar serta daftar feedback ulasan pelanggan per cabang. *(Mapped to US-012)*

---

## 8. Conceptual Data Model

Berikut adalah entitas data konseptual yang digunakan oleh sistem (diimplementasikan pada `mockDb` di fase MVP, dan akan dipetakan ke tabel relasional Supabase pada fase V2):

### 8.1 Ringkasan Relasi Antar-Entitas (Aturan 1 Kapster = 1 Cabang)
- **Cabang (Branch):** Memiliki banyak kapster tetap (*Barber*), menerima banyak reservasi (*Booking*), dan menjadi lokasi tugas akun staf (*User Profile*).
- **Kapster (Barber):** Terikat secara eksklusif pada tepat **satu cabang penempatan** (`branch_id`) dan melayani reservasi (*Booking*) di cabang tersebut. Mutasi cabang hanya dapat dilakukan oleh Owner.
- **Layanan (Service):** Menjadi referensi paket yang dipilih di setiap reservasi (*Booking*).
- **Reservasi (Booking):** Menghubungkan satu pelanggan dengan satu Cabang, satu Kapster, dan satu Layanan pada jadwal tertentu.

### 8.2 Struktur Entitas Data

| Entitas | Atribut Utama | Tipe / Contoh Nilai | Keterangan |
|---|---|---|---|
| **BRANCH** | `id`<br>`name`<br>`location`<br>`whatsapp_number`<br>`is_active` | `manislor`, `jalaksana`, `veteran`<br>String (misal: "Manislor")<br>String (Alamat cabang)<br>String (No. WA Admin)<br>Boolean | Informasi cabang fisik Cahaya Barber. |
| **BARBER** | `id`<br>`name`<br>`branch_id`<br>`phone`<br>`photo_url`<br>`description`<br>`is_active`<br>`is_archived` | `barber-1`, `barber-2`<br>String (Nama kapster)<br>FK ke `BRANCH.id`<br>String / Null (No. HP)<br>String / Null (Foto URL)<br>String (Keahlian/spesialisasi)<br>Boolean (Status aktif kerja)<br>Boolean (Status arsip) | Profil kapster barbershop (1 kapster = 1 cabang tetap). |
| **SERVICE** | `id`<br>`name`<br>`description`<br>`time`<br>`price`<br>`is_active` | `haircut`, `coloring`, `perm`, `massage`<br>String (Nama paket)<br>String (Deskripsi perawatan)<br>Number (Durasi dalam menit)<br>Number (Harga dalam Rupiah)<br>Boolean | Katalog paket layanan dan tarif. |
| **BOOKING** | `id`<br>`booking_code`<br>`customer_name`<br>`customer_phone`<br>`customer_note`<br>`branch_id`<br>`barber_id`<br>`service_id`<br>`starts_at`<br>`status`<br>`created_at` | `book-xxx`<br>Format: `CB-MN-YYMMDD-01`<br>String (Nama pelanggan)<br>String (No. WA pelanggan)<br>String / Null (Catatan khusus)<br>FK ke `BRANCH.id`<br>FK ke `BARBER.id`<br>FK ke `SERVICE.id`<br>Datetime (ISO 8601)<br>`pending` \| `confirmed` \| `completed` \| `cancelled`<br>Datetime (Waktu submit) | Catatan reservasi kedatangan pelanggan. |
| **USER_PROFILE** | `id`<br>`email`<br>`full_name`<br>`role`<br>`branch_id`<br>`is_active` | String (User ID)<br>String (Email login)<br>String (Nama staf/owner)<br>`admin` \| `owner`<br>FK ke `BRANCH.id` (null jika owner)<br>Boolean | Akun pengelola sistem dan pembatasan hak akses. |

---

## 9. Edge Cases and Failure States

1. **Kapster Tiba-tiba Berhalangan / Sakit Saat Memiliki Booking Aktif:**
   - *Kondisi:* Kapster dinonaktifkan oleh Admin, padahal ada 2 reservasi berstatus `confirmed` untuk hari ini.
   - *Penanganan Sistem:* Sistem tidak membatalkan sepihak secara otomatis di database. Pada dashboard Admin, booking tersebut diberi tanda peringatan (misal *Kapster Nonaktif*), dan admin memiliki tombol pintas untuk menghubungi pelanggan via WhatsApp guna menawarkan ganti kapster atau jadwal baru.
2. **Koneksi Internet Pelanggan Terputus Saat Submit Form:**
   - *Kondisi:* Pelanggan menekan tombol "Konfirmasi Booking" namun koneksi gagal.
   - *Penanganan Sistem:* Sistem menampilkan status loading yang jelas, mencegah pengiriman ganda (*disable button* saat submit), dan jika gagal menampilkan pesan peringatan ramah: *"Gagal mengirim reservasi. Periksa koneksi internet Anda dan coba lagi."*
3. **Penyimpanan Perangkat Klien Penuh atau `localStorage` Diblokir (Incognito Mode):**
   - *Kondisi:* Browser pelanggan berjalan dalam mode penyamaran ketat yang menolak `localStorage.setItem`.
   - *Penanganan Sistem:* Kode dibungkus dalam blok `try...catch`. Jika penyimpanan lokal gagal, sistem tetap menampilkan tiket di layar saat itu dan mengimbau pelanggan untuk menyimpan tangkapan layar (screenshot) atau segera mengklik tombol WhatsApp.
4. **Pelanggan Menginput Nomor HP Tidak Baku:**
   - *Kondisi:* Pelanggan mengetik nomor dengan spasi, tanda strip, atau awalan `+62` / `08`.
   - *Penanganan Sistem:* Sistem melakukan sanitasi regex otomatis (`replace(/\D/g, '')`) sebelum melakukan pengecekan bentrok dan sebelum menyusun link `https://wa.me/`.
5. **Dua Pelanggan Memilih Jam yang Sama dalam Hitungan Detik:**
   - *Kondisi:* Pelanggan A dan B membuka form pada waktu bersamaan dan memilih Kapster X jam 14.00.
   - *Penanganan Sistem (Fase MVP):* Pelanggan yang menekan tombol konfirmasi lebih dulu akan berhasil. Pelanggan kedua akan mendapatkan notifikasi validasi bentrok saat submit dan diminta memilih jam lain. Pada Fase V2, validasi ini diperkuat oleh *transaction lock / constraint* database Supabase.

---

## 10. Success Metrics (Metrik Keberhasilan)

| Kategori Metrik | Indikator | Alasan Penting | Cara Pengukuran |
|---|---|---|---|
| **Adopsi Pelanggan** | *Booking Completion Rate* | Mengukur efektivitas dan kemudahan alur booking 4 langkah. | Rasio antara pengunjung yang menyelesaikan formulir (mendapat tiket) dibanding yang memulai Step 1 (Target usulan: >65%). |
| **Operasional** | *Reduction in Wait Time* | Mengukur apakah tujuan utama mengurangi waktu antrean tercapai. | Waktu tunggu rata-rata pelanggan di kursi tunggu sebelum dipotong (Target usulan: < 10 menit dari jadwal reservasi). |
| **Akurasi Jadwal** | *No-Show Rate* | Mengetahui tingkat ketidakhadiran pelanggan yang sudah memesan. | Persentase booking berstatus `cancelled` atau tidak hadir dibanding total booking terkonfirmasi (Target usulan: < 12%). |
| **Kepuasan Pengguna** | *WhatsApp Handshake Rate* | Memastikan pelanggan benar-benar melanjutkan alur ke WhatsApp konfirmasi. | Rasio klik pada tombol "Konfirmasi ke WhatsApp" dari total tiket terbit (Target usulan: > 80%). |

*(Catatan: Target angka di atas merupakan usulan rekomendasi awal untuk benchmark evaluasi pasca peluncuran).*

---

## 11. Assumptions and Constraints

### 11.1 Asumsi (*Assumptions*)
1. Setiap cabang memiliki setidaknya 1 staf yang secara berkala memeriksa pesan WhatsApp masuk dan membuka portal admin selama jam operasional (10.00–21.00 WIB).
2. Sebagian besar pelanggan bersedia melakukan pembayaran tunai atau transfer QRIS di meja kasir setelah selesai mendapatkan perawatan (*Pay-at-Store*).
3. Kapster bekerja berdasarkan durasi layanan standar yang sudah ditetapkan (misal haircut 30 menit, coloring/perm 45 menit).

### 11.2 Batasan Teknis & Bisnis (*Constraints*)
1. **Fase Progresi:** Pengembangan saat ini berada pada tahap **Frontend-first**. Semua alur data operasional sementara dijalankan melalui penyimpanan lokal simulasi (`mockDb` di `localStorage`) sebelum seluruh komponen UI tervalidasi dan siap disambungkan ke backend Supabase.
2. **Ketergantungan WhatsApp:** Karena belum menggunakan WhatsApp Cloud API resmi (gateway bot berbayar), konfirmasi otomatis bergantung pada tindakan aktif pelanggan mengklik tombol chat ke nomor WhatsApp admin.
3. **Jam Operasional Kaku:** Jam operasional dipatok pukul 10.00–21.00 WIB untuk seluruh cabang pada versi awal.

---

## 12. Open Questions

### Non-Blocking Questions (Dapat Diputuskan Menyusul Saat Pengerjaan Berjalan):
1. **Nomor WhatsApp Resmi Cabang:** Berapakah nomor kontak WhatsApp resmi untuk masing-masing cabang (Manislor, Jalaksana, Veteran) untuk menggantikan nomor dummy `6281234567890`?
2. **Toleransi Keterlambatan:** Berapa menit batas toleransi kedatangan sebelum admin cabang berhak membatalkan jadwal pelanggan yang telat hadir (misal 15 menit)?
3. **Rentang Hari Reservasi ke Depan:** Apakah pelanggan boleh memesan jadwal hingga 7 hari ke depan, 14 hari, atau hanya maksimal 3 hari ke depan? (Saat ini defaultnya tidak dibatasi selama tanggal $\ge$ hari ini).

---
