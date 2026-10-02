# Todolist App

Aplikasi manajemen tugas berbasis Node.js yang menyediakan operasi CRUD lengkap, pencarian teks, penyaringan berdasarkan status dan prioritas, serta pengelolaan tanggal jatuh tempo.

## Fitur Utama

1. **Buat Tugas** — Tambah tugas baru dengan judul, deskripsi opsional, dan tingkat prioritas. Status awal diatur otomatis ke `Incomplete` dan tanggal pembuatan dicatat secara otomatis.

2. **Lihat Semua Tugas** — Tampilkan daftar tugas dalam format paginasi (50 item per halaman), diurutkan berdasarkan tanggal pembuatan terbaru. Menampilkan pesan `Tidak ada tugas ditemukan` saat daftar kosong.

3. **Perbarui Tugas** — Ubah judul, deskripsi, prioritas, atau tanggal jatuh tempo tugas yang ada. Setiap perubahan memerlukan konfirmasi pengguna dan mencatat timestamp `last_updated` secara otomatis.

4. **Tandai Selesai** — Ubah status tugas menjadi `Completed` dengan satu aksi. Waktu penyelesaian (`completion_time`) dicatat secara otomatis.

5. **Hapus Tugas** — Hapus tugas setelah konfirmasi pengguna. Tugas tetap tersimpan jika pengguna membatalkan atau operasi penyimpanan gagal.

6. **Cari Tugas** — Pencarian teks sebagian tanpa membedakan huruf besar/kecil pada judul dan deskripsi, dengan waktu respons target kurang dari 300ms dan maksimal 100 hasil.

7. **Tingkat Prioritas** — Setiap tugas memiliki prioritas `High`, `Medium`, atau `Low` (default: `Medium`). Daftar tugas dapat disaring dan diurutkan berdasarkan prioritas.

8. **Tanggal Jatuh Tempo** — Tanggal jatuh tempo bersifat opsional dan disimpan dalam format ISO 8601 (`YYYY-MM-DD`). Tugas yang belum selesai dan telah melewati tanggal jatuh tempo ditandai sebagai `OVERDUE`.

## Instalasi dan Menjalankan Proyek

**Prasyarat:** Node.js versi 14 atau lebih baru.

```bash
# 1. Clone repositori
git clone <url-repositori>
cd todolist-app

# 2. Install dependensi
npm install

# 3. Jalankan seluruh test suite
npm test

# 4. Jalankan test dalam mode watch (otomatis re-run saat ada perubahan file)
npm run test:watch

# 5. Hasilkan laporan code coverage
npm run test:coverage

todolist-app/
├── src/
│   ├── index.js                  # Entry point; menginisialisasi tiga lapisan arsitektur
│   ├── index.test.js             # Pengujian inisialisasi proyek
│   ├── task-model.js             # Definisi model data Task, konstanta, dan utilitas timestamp
│   ├── task-model.test.js        # Unit test untuk model Task
│   ├── task-validation.js        # Fungsi validasi input dengan pesan error berbahasa Indonesia
│   ├── task-validation.test.js   # Unit test untuk fungsi validasi
│   ├── task-manager.js           # Lapisan logika bisnis; orkestrasi CRUD dan validasi
│   ├── task-storage.js           # Lapisan persistensi data; penyimpanan in-memory
│   ├── task-storage.test.js      # Unit test dan integration test untuk penyimpanan
│   └── ui.js                     # Lapisan presentasi; format tampilan dan interaksi pengguna
├── jest.config.js                # Konfigurasi test runner Jest
├── package.json                  # Metadata proyek dan dependensi
└── README.md                     # Dokumentasi proyek
