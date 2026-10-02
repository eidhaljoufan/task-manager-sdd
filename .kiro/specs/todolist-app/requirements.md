# Requirements Document

## Feature: Todolist App

## Introduction

Todolist App adalah aplikasi manajemen tugas yang memungkinkan pengguna untuk membuat, mengorganisir, dan mengelola daftar tugas mereka. Aplikasi ini dirancang untuk membantu pengguna melacak prioritas mereka, menandai tugas yang telah selesai, dan meningkatkan produktivitas mereka.

## Glossary

- **Task**: Unit terkecil dari pekerjaan yang dapat dikelola oleh pengguna
- **Todolist App**: Aplikasi utama untuk manajemen tugas
- **Task_Manager**: Komponen yang mengelola operasi CRUD pada tugas
- **Task_Storage**: Komponen yang menyimpan dan mengambil data tugas
- **Priority_Level**: Tingkat prioritas tugas (High, Medium, Low)
- **Completion_Status**: Status penyelesaian tugas (Completed, Incomplete)
- **Due_Date**: Tanggal target penyelesaian tugas

## Requirements

### Requirement 1: Create Task

**User Story:** Sebagai pengguna, saya ingin membuat tugas baru, sehingga saya dapat melacak pekerjaan yang perlu saya lakukan.

#### Acceptance Criteria

1. WHEN pengguna menginput detail tugas dengan judul (required, max 255 karakter), deskripsi (optional, max 2000 karakter), dan prioritas dari nilai yang valid (High, Medium, Low), THE Task_Manager SHALL membuat tugas baru dengan status "Incomplete"
2. WHEN tugas baru berhasil dibuat dan disimpan ke Task_Storage, THE Task_Manager SHALL menetapkan creation_date secara otomatis menggunakan sistem timestamp saat waktu pembuatan
3. WHEN tugas baru berhasil dibuat, THE Task_Storage SHALL menyimpan tugas ke dalam penyimpanan persistenten dalam waktu maksimal 5 detik
4. IF pengguna tidak memberikan judul (nilai kosong, null, atau hanya whitespace), THEN THE Task_Manager SHALL menolak pembuatan dan menampilkan pesan kesalahan yang mengindikasikan judul wajib diisi
5. IF pengguna memberikan judul lebih dari 255 karakter atau deskripsi lebih dari 2000 karakter, THEN THE Task_Manager SHALL menolak pembuatan dan menampilkan pesan kesalahan yang mengindikasikan batas panjang teks telah terlampaui

### Requirement 2: View All Tasks

**User Story:** Sebagai pengguna, saya ingin melihat semua tugas saya, sehingga saya dapat meninjau semua pekerjaan yang perlu dilakukan.

#### Acceptance Criteria

1. THE Todolist App SHALL menampilkan daftar semua tugas yang tersimpan dengan batas pagination maksimal 50 tugas per halaman
2. WHEN tugas ditampilkan, THE Todolist App SHALL menunjukkan judul, deskripsi, prioritas, status, dan due date untuk setiap tugas
3. WHERE filter status tersedia, THE Todolist App SHALL memungkinkan pengguna memfilter tugas berdasarkan status (Completed/Incomplete) dan merespons dalam waktu maksimal 500 milidetik
4. WHERE filter prioritas tersedia, THE Todolist App SHALL memungkinkan pengguna memfilter tugas berdasarkan prioritas (High/Medium/Low) dan merespons dalam waktu maksimal 500 milidetik
5. WHEN daftar tugas kosong (tidak ada tugas tersimpan), THE Todolist App SHALL menampilkan pesan empty state yang mengindikasikan "Tidak ada tugas ditemukan"
6. WHEN pengguna membuka halaman task list, THE Todolist App SHALL menampilkan tugas dalam urutan default (sorted by creation date, newest first)
7. WHEN pengguna menavigasi ke halaman berikutnya dalam pagination, THE Todolist App SHALL memuat dan menampilkan set 50 tugas berikutnya dalam waktu maksimal 1 detik

### Requirement 3: Update Task

**User Story:** Sebagai pengguna, saya ingin memperbarui detail tugas, sehingga saya dapat mengubah informasi tugas sesuai kebutuhan saya.

#### Acceptance Criteria

1. WHEN pengguna memilih tugas dan mengubah detail dengan constraint (judul 1-255 karakter, deskripsi max 1000 karakter, prioritas enum (High/Medium/Low), due date format ISO 8601), THE Task_Manager SHALL memperbarui tugas di penyimpanan
2. WHEN tugas diperbarui, THE Task_Manager SHALL mencatat waktu pembaruan terakhir dalam format ISO 8601 dengan presisi detik dan meminta konfirmasi pengguna sebelum menyimpan perubahan
3. IF pengguna mencoba memperbarui judul menjadi kosong, null, atau hanya whitespace, THEN THE Task_Manager SHALL menolak pembaruan dan menampilkan pesan kesalahan yang mengindikasikan judul wajib diisi
4. IF pengguna memberikan judul lebih dari 255 karakter atau deskripsi lebih dari 1000 karakter atau format due date tidak sesuai ISO 8601, THEN THE Task_Manager SHALL menolak pembaruan dan menampilkan pesan kesalahan yang spesifik mengenai field yang tidak valid

### Requirement 4: Mark Task as Complete

**User Story:** Sebagai pengguna, saya ingin menandai tugas sebagai selesai, sehingga saya dapat melacak kemajuan saya.

#### Acceptance Criteria

1. WHEN pengguna menandai tugas sebagai selesai melalui button atau checkbox interaction, THE Task_Manager SHALL mengubah status tugas menjadi "Completed"
2. WHEN status tugas berubah menjadi "Completed", THE Task_Manager SHALL mencatat waktu penyelesaian dalam format ISO 8601 dengan presisi detik
3. THE Todolist App SHALL menampilkan indikasi visual untuk tugas yang telah diselesaikan (strikethrough text, checkmark icon, atau disabled appearance)
4. IF pengguna mencoba menandai tugas yang tidak valid atau tidak ditemukan, THEN THE Task_Manager SHALL menampilkan pesan kesalahan dan mempertahankan status tugas yang sebelumnya

### Requirement 5: Delete Task

**User Story:** Sebagai pengguna, saya ingin menghapus tugas, sehingga saya dapat menghilangkan tugas yang tidak lagi relevan.

#### Acceptance Criteria

1. WHEN pengguna menghapus tugas, THE Todolist App SHALL menampilkan dialog konfirmasi penghapusan sebelum tugas benar-benar dihapus
2. WHEN pengguna mengonfirmasi penghapusan, THE Task_Manager SHALL menghapus tugas dari Task_Storage dan menampilkan pesan sukses penghapusan
3. IF pengguna membatalkan konfirmasi penghapusan, THEN THE Task_Manager SHALL tetap menyimpan tugas tanpa perubahan
4. IF Task_Storage tidak tersedia atau penghapusan gagal, THEN THE Task_Manager SHALL menampilkan pesan kesalahan dan mempertahankan tugas di penyimpanan

### Requirement 6: Search Task

**User Story:** Sebagai pengguna, saya ingin mencari tugas berdasarkan kata kunci, sehingga saya dapat menemukan tugas tertentu dengan cepat.

#### Acceptance Criteria

1. WHEN pengguna memasukkan kata kunci pencarian (1-255 karakter), THE Task_Manager SHALL mencari tugas berdasarkan judul dan deskripsi dengan case-insensitive partial matching
2. THE Todolist App SHALL menampilkan hasil pencarian yang sesuai dengan kata kunci dalam urutan berdasarkan relevance, dengan batas maksimal 100 hasil
3. WHEN hasil pencarian ditemukan, THE Todolist App SHALL merespons dalam waktu maksimal 300 milidetik
4. IF tidak ada tugas yang sesuai dengan kata kunci, THEN THE Todolist App SHALL menampilkan pesan "Tidak ada tugas ditemukan"
5. IF pengguna memasukkan kata kunci kosong atau hanya whitespace, THEN THE Todolist App SHALL menampilkan semua tugas tanpa filter pencarian

### Requirement 7: Set Priority Level

**User Story:** Sebagai pengguna, saya ingin menetapkan tingkat prioritas untuk setiap tugas, sehingga saya dapat fokus pada tugas yang paling penting.

#### Acceptance Criteria

1. WHEN pengguna membuat atau memperbarui tugas, THE Task_Manager SHALL memungkinkan pemilihan Priority_Level dari nilai yang valid (High, Medium, Low)
2. IF pengguna tidak menetapkan Priority_Level, THEN THE Task_Manager SHALL menetapkan default priority sebagai "Medium"
3. THE Todolist App SHALL menyimpan Priority_Level untuk setiap tugas dalam Task_Storage
4. WHERE filter prioritas tersedia, THE Todolist App SHALL memungkinkan pengguna mengurutkan/memfilter tugas berdasarkan Priority_Level dengan urutan High → Medium → Low
5. IF pengguna mencoba menetapkan priority dengan nilai yang tidak valid, THEN THE Task_Manager SHALL menolak dan menampilkan pesan kesalahan yang mengindikasikan pilihan priority yang valid

### Requirement 8: Set Due Date

**User Story:** Sebagai pengguna, saya ingin menetapkan tanggal jatuh tempo untuk tugas, sehingga saya dapat merencanakan pekerjaan saya dengan lebih baik.

#### Acceptance Criteria

1. WHEN pengguna membuat atau memperbarui tugas, THE Task_Manager SHALL memungkinkan penetapan Due_Date dalam format ISO 8601 (YYYY-MM-DD)
2. IF pengguna tidak menetapkan Due_Date, THEN THE Task_Manager SHALL menyimpan Due_Date sebagai null tanpa menampilkan error
3. IF pengguna memberikan format Due_Date yang tidak sesuai ISO 8601, THEN THE Task_Manager SHALL menolak dan menampilkan pesan kesalahan mengenai format tanggal yang benar
4. THE Task_Storage SHALL menyimpan Due_Date untuk setiap tugas dengan format konsisten (ISO 8601)
5. WHILE tugas belum melewati Due_Date dan status masih "Incomplete", THE Todolist App SHALL menampilkan Due_Date secara normal tanpa indikasi visual khusus
6. WHEN tugas telah melewati Due_Date dan masih "Incomplete" (evaluasi dilakukan pada saat halaman dibuka/di-refresh), THE Todolist App SHALL menampilkan indikasi visual overdue (red color, warning icon, atau bold text)
7. IF tugas telah ditandai "Completed" sebelum atau sesudah Due_Date, THEN THE Todolist App SHALL tidak menampilkan indikasi overdue terlepas dari kapan Due_Date terlampaui

