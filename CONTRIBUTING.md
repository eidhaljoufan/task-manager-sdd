# Panduan Kontribusi - Todolist App

Terima kasih sudah tertarik untuk berkontribusi. Dokumen ini menjelaskan cara kerja proyek,
bagaimana menyiapkan lingkungan pengembangan, konvensi yang digunakan, dan arah pengembangan
ke depan.

---

## Daftar Isi

- [Cara Memulai](#cara-memulai)
- [Struktur Arsitektur](#struktur-arsitektur)
- [Alur Kontribusi](#alur-kontribusi)
- [Konvensi Kode](#konvensi-kode)
- [Menjalankan Test](#menjalankan-test)
- [Area yang Bisa Dikontribusi](#area-yang-bisa-dikontribusi)
- [Kemungkinan Fitur Mendatang](#kemungkinan-fitur-mendatang)

---

## Cara Memulai

**Prasyarat:** Node.js >= 14

```bash
# 1. Fork repositori ini, lalu clone fork kamu
git clone https://github.com/<username>/todolist-app.git
cd todolist-app

# 2. Install dependensi
npm install

# 3. Pastikan semua test berjalan sebelum mulai mengerjakan sesuatu
npm test
```

---

## Struktur Arsitektur

Proyek ini menggunakan three-layer architecture. Setiap lapisan memiliki tanggung jawab yang
jelas dan tidak boleh saling menembus batas tersebut.

```
UI (ui.js)
    |
    v
Task_Manager (task-manager.js)      <-- validasi + orkestrasi CRUD
    |
    v
Task_Storage (task-storage.js)      <-- persistensi data
```

| Lapisan | File | Tanggung Jawab |
|---|---|---|
| Presentation | `src/ui.js` | Format tampilan, interaksi pengguna, konfirmasi dialog |
| Business Logic | `src/task-manager.js` | Validasi input, orkestrasi CRUD, manajemen timestamp |
| Data Persistence | `src/task-storage.js` | Simpan, ambil, filter, dan cari data tugas |
| Data Model | `src/task-model.js` | Definisi struktur Task, konstanta, dan utilitas timestamp |
| Validation | `src/task-validation.js` | Fungsi validasi murni, terpisah dari storage |

### Aturan Penting Arsitektur

- UI tidak boleh memanggil `Task_Storage` secara langsung. Semua operasi data harus lewat `Task_Manager`.
- Validasi harus dilakukan di `Task_Manager` sebelum memanggil `Task_Storage`.
- `Task_Storage` tidak boleh mengandung logika bisnis — hanya operasi data.
- Pesan error yang ditampilkan ke pengguna harus dalam Bahasa Indonesia.

---

## Alur Kontribusi

1. Buat branch baru dari `main` dengan nama yang deskriptif:

   ```bash
   git checkout -b feat/nama-fitur
   # atau
   git checkout -b fix/nama-bug
   ```

2. Kerjakan perubahan kamu. Pastikan setiap perubahan terbatas pada satu concern (jangan mix
   perbaikan bug dengan fitur baru dalam satu branch).

3. Jalankan test suite sebelum commit:

   ```bash
   npm test
   ```

4. Commit dengan pesan yang jelas:

   ```
   feat: tambah filter berdasarkan due date
   fix: validasi judul tidak menolak karakter spesial
   test: tambah property test untuk pagination
   docs: perbarui komentar pada task-storage.js
   ```

5. Push dan buat Pull Request ke `main`. Sertakan deskripsi singkat tentang apa yang berubah
   dan requirement mana yang dipengaruhi (contoh: "Menangani REQ-6 untuk pencarian kosong").

---

## Konvensi Kode

### Penamaan

- Gunakan `camelCase` untuk variabel dan fungsi.
- Gunakan `PascalCase` untuk nama class.
- Nama file menggunakan `kebab-case` (contoh: `task-manager.js`).

### Validasi

- Semua fungsi validasi baru harus ditempatkan di `src/task-validation.js`.
- Fungsi validasi mengembalikan objek `{ valid: boolean, error?: string }`.
- Pesan error harus dalam Bahasa Indonesia dan spesifik terhadap field yang gagal.

### Timestamp

- Gunakan format ISO 8601 di seluruh codebase.
- `creation_date` dan `last_updated` menggunakan presisi detik: `YYYY-MM-DDTHH:mm:ssZ`.
- `due_date` menggunakan format date-only: `YYYY-MM-DD`.

### Komentar

- Setiap fungsi publik harus memiliki JSDoc yang menjelaskan parameter, return value, dan
  kondisi error yang mungkin terjadi.

### Model Data Task

```javascript
{
  id: string,           // UUID v4, auto-generated
  title: string,        // Required, 1-255 karakter
  description: string,  // Optional, max 2000 (create) / 1000 (update)
  priority: string,     // "High" | "Medium" | "Low", default "Medium"
  status: string,       // "Incomplete" | "Completed"
  due_date: string,     // Optional, format YYYY-MM-DD
  creation_date: string,
  last_updated: string,
  completion_time: string
}
```

---

## Menjalankan Test

```bash
# Jalankan semua test
npm test

# Mode watch (otomatis re-run saat ada perubahan file)
npm run test:watch

# Laporan code coverage
npm run test:coverage
```

### Pendekatan Testing

Proyek ini menggunakan tiga jenis test:

- **Unit test** — Memvalidasi logika satu fungsi secara terisolasi. File: `*.test.js`.
- **Property-based test** — Memvalidasi properti universal dari logika bisnis, misalnya
  "validasi judul selalu menolak string kosong untuk input apapun yang kosong/whitespace".
- **Integration test** — Memvalidasi alur end-to-end: create → read → update → complete → delete.

Saat menambahkan fitur baru, tambahkan test yang sesuai di file test yang relevan. Test baru
tidak boleh membuat test yang sudah ada menjadi gagal.

---

## Area yang Bisa Dikontribusi

Berikut adalah bagian proyek yang masih terbuka untuk dikerjakan, berdasarkan implementation plan
saat ini:

### Task_Manager (Logika Bisnis)

- [ ] `createTask` — Implementasi dan unit test
- [ ] `updateTask` — Implementasi dan unit test
- [ ] `markTaskComplete` — Implementasi dan unit test
- [ ] `deleteTask` — Implementasi dengan konfirmasi dan unit test
- [ ] `searchTasks` — Implementasi dan unit test
- [ ] `filterTasks` — Implementasi dan unit test

### UI Layer

- [ ] Komponen tampilan daftar tugas dengan indikator status dan overdue
- [ ] Kontrol paginasi (next/previous page)
- [ ] Kontrol filter (status dan prioritas)
- [ ] Kontrol pencarian dengan debounce
- [ ] Form pembuatan dan pembaruan tugas
- [ ] Konfirmasi dialog untuk hapus dan update

### Testing

- [ ] Property tests untuk validasi (judul kosong, panjang teks, format tanggal)
- [ ] Property tests untuk filter dan pencarian
- [ ] Property tests untuk paginasi (kelengkapan dan konsistensi halaman)
- [ ] Integration tests untuk siklus lengkap tugas
- [ ] Performance tests untuk memverifikasi target waktu respons

### Dokumentasi

- [ ] Dokumentasi API publik `Task_Manager`
- [ ] Contoh penggunaan untuk setiap operasi

---

## Kemungkinan Fitur Mendatang

Daftar ini bukan roadmap resmi, melainkan arah potensial yang bisa dieksplor jika diperlukan.
Diskusikan terlebih dahulu dengan membuka issue sebelum mulai mengimplementasikannya.

### Persistensi Data Nyata

Saat ini storage menggunakan in-memory (`Map` + `Array`) yang tidak bertahan saat proses Node.js
dihentikan. Kemungkinan arah:

- Integrasi dengan file system (`JSON` atau `SQLite`) sebagai storage backend
- Abstraksi interface `IStorage` agar backend bisa diganti tanpa mengubah `Task_Manager`
- Sinkronisasi dengan database seperti PostgreSQL atau MongoDB untuk use case multi-user

### Pengelompokan dan Label Tugas

- Penambahan field `tags` atau `category` pada model Task
- Filter berdasarkan tag/kategori
- Hierarki tugas: sub-task di bawah tugas induk

### Notifikasi dan Pengingat

- Notifikasi lokal saat tugas mendekati atau melewati due date
- Pengaturan pengingat berulang (recurring task)

### Ekspor dan Impor Data

- Ekspor daftar tugas ke format CSV atau JSON
- Impor tugas dari file eksternal
- Backup dan restore data storage

### Antarmuka Pengguna Berbasis Web

- REST API layer di atas `Task_Manager` menggunakan Express.js
- Frontend sederhana (HTML/CSS/JS atau framework seperti React/Vue)
- Desain responsif untuk penggunaan mobile

### Multi-User dan Kolaborasi

- Autentikasi pengguna (login/register)
- Berbagi tugas antar pengguna
- Komentar dan aktivitas log pada setiap tugas

### Performa dan Skalabilitas

- Indexing pada field `status`, `priority`, dan `due_date` untuk filter lebih cepat
- Caching hasil pencarian yang sering diakses
- Pagination berbasis cursor sebagai alternatif offset-based untuk dataset besar

---

Jika ada pertanyaan atau diskusi, buka issue di repositori ini.
