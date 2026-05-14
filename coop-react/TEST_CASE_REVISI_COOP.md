# Revisi Test Case Website COOP

Dokumen ini adalah versi revisi dari test case berdasarkan implementasi code saat ini pada frontend dan backend.

Catatan:
- Snapshot analisis mengacu pada codebase yang ada di repo pada saat review.
- Status default di dokumen ini diset sebagai `Belum Diuji` agar bisa dipakai ulang untuk pengujian berikutnya.
- Dokumen ini fokus pada flow yang benar-benar ada di sistem saat ini, termasuk kondisi khusus dan pembatasan akses.

## Bagian A: Modul Mahasiswa

### Flow 0: Registrasi dan Approval Awal Akun
Deskripsi: Menguji pendaftaran akun baru, status pending, dan perilaku login sebelum/sesudah approval admin.

| ID | Skenario Pengujian | Langkah-Langkah | Hasil yang Diharapkan | Status |
| --- | --- | --- | --- | --- |
| TC-0.1 | Registrasi mahasiswa baru | Buka halaman daftar, isi data identitas, unggah berkas registrasi, klik daftar. | Akun berhasil dibuat dengan status menunggu persetujuan admin. | Belum Diuji |
| TC-0.2 | Login sebelum approval admin | Gunakan akun yang baru didaftarkan untuk login. | Login ditolak dan muncul pesan bahwa akun belum disetujui admin. | Belum Diuji |
| TC-0.3 | Login setelah approval admin | Admin menyetujui akun, lalu mahasiswa login kembali. | Login berhasil dan mahasiswa masuk ke dashboard. | Belum Diuji |

### Flow 1: Manajemen Profil dan Keamanan Akun
Deskripsi: Menguji pembaruan data login, unggah dokumen profil, dan perubahan password.

| ID | Skenario Pengujian | Langkah-Langkah | Hasil yang Diharapkan | Status |
| --- | --- | --- | --- | --- |
| TC-1.1 | Ubah username dan nama profil | Login, buka menu Pengaturan, ubah username/nama, simpan. | Data profil tersimpan dan username baru digunakan untuk login berikutnya. | Belum Diuji |
| TC-1.2 | Unggah dokumen CV (PDF) | Buka menu Profil, pilih file CV PDF, klik simpan. | File berhasil terunggah dan tombol lihat file muncul. | Belum Diuji |
| TC-1.3 | Unggah portofolio tambahan | Buka menu Profil, pilih file portofolio PDF, klik simpan. | File portofolio berhasil terunggah dan tombol lihat file muncul. | Belum Diuji |
| TC-1.4 | Ubah password | Buka menu Pengaturan, isi password lama dan password baru, klik simpan. | Password berubah dan user otomatis logout. | Belum Diuji |
| TC-1.5 | Gagal ubah password karena konfirmasi tidak sama | Isi password baru dan konfirmasi berbeda, lalu submit. | Sistem menolak perubahan password dan menampilkan pesan error. | Belum Diuji |

### Flow 2: Bursa Magang dan Lamaran
Deskripsi: Menguji alur melihat detail lowongan, melamar internal, dan apply melalui link eksternal.

| ID | Skenario Pengujian | Langkah-Langkah | Hasil yang Diharapkan | Status |
| --- | --- | --- | --- | --- |
| TC-2.1 | Melihat detail lowongan | Buka menu Bursa Magang, klik lihat detail. | Muncul modal berisi deskripsi dan persyaratan lowongan. | Belum Diuji |
| TC-2.2 | Blokir lamaran jika CV belum diunggah | Buka detail lowongan internal tanpa CV di profil, klik lanjut lamar. | Sistem menolak lanjut lamaran dan meminta user upload CV lebih dulu. | Belum Diuji |
| TC-2.3 | Mengirim lamaran internal | Pastikan CV sudah ada, buka detail lowongan internal, isi cover letter opsional, kirim lamaran. | Lamaran berhasil dikirim dan CV terlampir otomatis dari profil. | Belum Diuji |
| TC-2.4 | Cegah lamaran ganda ke lowongan yang sama | Kirim lamaran ke lowongan yang sama untuk kedua kalinya. | Sistem menolak lamaran duplikat. | Belum Diuji |
| TC-2.5 | Apply via link eksternal | Buka detail lowongan yang punya external apply link, klik tombol apply eksternal. | User diarahkan ke website/permalink eksternal perusahaan. | Belum Diuji |
| TC-2.6 | Blokir akses lamar saat sudah punya placement aktif/pending | Pastikan mahasiswa sudah punya placement aktif atau pending, lalu buka Bursa Magang. | Tombol lamar terkunci dan user tidak bisa mengirim lamaran baru. | Belum Diuji |

### Flow 3: Pelaporan Magang Mandiri dan Pindah Tempat
Deskripsi: Menguji input placement baru, pending overwrite, dan arsip placement lama saat pindah.

| ID | Skenario Pengujian | Langkah-Langkah | Hasil yang Diharapkan | Status |
| --- | --- | --- | --- | --- |
| TC-3.1 | Input data magang baru | Buka menu Input Lapor Magang, isi form lengkap dan upload LoA, lalu submit. | Data placement baru tersimpan dengan status pending dan menunggu verifikasi admin. | Belum Diuji |
| TC-3.2 | Kirim ulang saat placement masih pending | Saat masih punya placement pending, isi form placement baru dan submit. | Placement pending lama diarsipkan, placement baru tersimpan sebagai pending terbaru. | Belum Diuji |
| TC-3.3 | Pengajuan pindah tempat dari placement aktif | Saat status magang aktif/approved, isi form placement baru dan submit. | Placement lama diarsipkan menjadi histori, status approval lama nonaktif, dan placement baru masuk sebagai pending. | Belum Diuji |
| TC-3.4 | Riwayat tempat magang tampil di profil | Setelah pernah pindah tempat, buka tab Profil. | Riwayat placement sebelumnya tampil sebagai histori. | Belum Diuji |

### Flow 4: Laporan Progress Mingguan (Weekly Hunt)
Deskripsi: Menguji input progress bagi mahasiswa yang belum memiliki placement approved.

| ID | Skenario Pengujian | Langkah-Langkah | Hasil yang Diharapkan | Status |
| --- | --- | --- | --- | --- |
| TC-4.1 | Input progress mingguan | Buka menu Progress Mingguan, isi seluruh field, lalu submit. | Data tersimpan dan muncul di timeline rekam jejak. | Belum Diuji |
| TC-4.2 | Validasi menu hanya muncul untuk job seeker | Pastikan mahasiswa belum memiliki placement approved, lalu cek sidebar. | Menu Progress Mingguan tampil hanya untuk mahasiswa yang belum approved magang. | Belum Diuji |

### Flow 5: Laporan Bulanan dan Revisi
Deskripsi: Menguji pengisian laporan bulanan, field bulan pertama, dan revisi laporan yang sudah ada.

| ID | Skenario Pengujian | Langkah-Langkah | Hasil yang Diharapkan | Status |
| --- | --- | --- | --- | --- |
| TC-5.1 | Submit laporan bulanan pertama | Pilih placement aktif, isi periode dan seluruh field laporan bulan pertama, lalu kirim. | Laporan pertama berhasil tersimpan dan muncul di riwayat. | Belum Diuji |
| TC-5.2 | Submit laporan bulanan lanjutan | Isi laporan bulan berikutnya pada placement yang sama. | Laporan berhasil tersimpan meskipun field khusus bulan pertama tidak wajib. | Belum Diuji |
| TC-5.3 | Edit atau revisi laporan bulanan | Klik revisi pada riwayat laporan, ubah isi, lalu simpan. | Laporan diperbarui tanpa membuat data duplikat. | Belum Diuji |

### Flow 6: Evaluasi UTS dan UAS
Deskripsi: Menguji syarat munculnya menu UTS/UAS, preview template, reminder supervisor, dan upload laporan.

| ID | Skenario Pengujian | Langkah-Langkah | Hasil yang Diharapkan | Status |
| --- | --- | --- | --- | --- |
| TC-6.1 | Menu UTS/UAS hanya muncul setelah trigger evaluasi dibuat admin | Pastikan placement sudah approved, lalu cek sidebar sebelum dan sesudah admin membuat evaluasi. | Menu Laporan UTS/UAS hanya muncul jika evaluasi terkait sudah dibuat admin. | Belum Diuji |
| TC-6.2 | Download dan preview template laporan | Buka tab UTS/UAS, klik preview atau download template. | File template terbuka atau terunduh sesuai file yang diunggah admin. | Belum Diuji |
| TC-6.3 | Reminder supervisor via WhatsApp | Saat evaluasi supervisor belum terisi, buka tab UTS/UAS lalu klik hubungi via WA. | Link WhatsApp terbuka dengan pesan pengingat yang sudah terisi. | Belum Diuji |
| TC-6.4 | Unggah laporan UTS | Pilih placement aktif, unggah file laporan UTS, isi keterangan opsional, lalu submit. | Notifikasi sukses muncul dan file laporan UTS tercatat di sistem. | Belum Diuji |
| TC-6.5 | Unggah laporan UAS | Pilih placement aktif, unggah file laporan UAS, isi keterangan opsional, lalu submit. | Notifikasi sukses muncul dan file laporan UAS tercatat di sistem. | Belum Diuji |
| TC-6.6 | Update file laporan UTS/UAS | Setelah pernah submit, unggah file pengganti pada tab yang sama. | File laporan diperbarui tanpa membuat entri baru terpisah. | Belum Diuji |

### Flow 7: Sertifikat Kelulusan di Dashboard Mahasiswa
Deskripsi: Menguji tampilan sertifikat yang sudah diterbitkan admin.

| ID | Skenario Pengujian | Langkah-Langkah | Hasil yang Diharapkan | Status |
| --- | --- | --- | --- | --- |
| TC-7.1 | Melihat sertifikat kelulusan | Setelah admin menerbitkan sertifikat, buka tab Sertifikat Kelulusan. | Sertifikat tampil di dashboard mahasiswa beserta identitas dan grade. | Belum Diuji |

## Bagian B: Modul Admin

### Flow 8: Approval Akun Mahasiswa
Deskripsi: Menguji approval akun mahasiswa lengkap dan akun yang datanya belum lengkap.

| ID | Skenario Pengujian | Langkah-Langkah | Hasil yang Diharapkan | Status |
| --- | --- | --- | --- | --- |
| TC-8.1 | Approval pengguna baru dengan data lengkap | Buka tab Approval, pilih mahasiswa dengan berkas lengkap, klik setujui akun. | Akun menjadi aktif dan mahasiswa bisa login. | Belum Diuji |
| TC-8.2 | Force approve akun dengan berkas belum lengkap | Buka tab Approval pada mahasiswa dengan berkas kurang, klik paksa setujui dan konfirmasi. | Akun tetap bisa diaktifkan setelah admin mengonfirmasi warning. | Belum Diuji |
| TC-8.3 | Approve all hanya memproses akun lengkap | Gunakan tombol Setujui Semua saat antrean berisi akun lengkap dan tidak lengkap. | Hanya akun lengkap yang aktif, akun tidak lengkap tetap pending. | Belum Diuji |

### Flow 9: Approval Tempat Magang
Deskripsi: Menguji verifikasi placement mahasiswa mandiri.

| ID | Skenario Pengujian | Langkah-Langkah | Hasil yang Diharapkan | Status |
| --- | --- | --- | --- | --- |
| TC-9.1 | Review detail pengajuan tempat magang | Buka tab Overview, pilih placement pending, klik review berkas. | Admin dapat melihat detail placement, supervisor, dan file LoA. | Belum Diuji |
| TC-9.2 | Approval placement pending | Dari modal review, klik approve. | Status placement berubah menjadi verified/approved dan mahasiswa dapat membuka flow akademik terkait. | Belum Diuji |
| TC-9.3 | Approve semua placement pending | Di tab Overview, klik Verifikasi Semua saat ada beberapa placement pending. | Semua placement pending berubah menjadi approved. | Belum Diuji |

### Flow 10: Pengelolaan Pelamar Internal
Deskripsi: Menguji review pelamar dari lowongan internal dan perubahan status lamaran.

| ID | Skenario Pengujian | Langkah-Langkah | Hasil yang Diharapkan | Status |
| --- | --- | --- | --- | --- |
| TC-10.1 | Lihat CV dan cover letter pelamar | Buka tab Pelamar, pilih salah satu pelamar, klik cek CV dan pesan. | Admin dapat melihat CV, portofolio, dan cover letter pelamar. | Belum Diuji |
| TC-10.2 | Ubah status lamaran menjadi reviewed | Dari detail pelamar, ubah status menjadi reviewed. | Status lamaran berubah menjadi Telah Diteruskan. | Belum Diuji |
| TC-10.3 | Terima pelamar internal | Dari detail pelamar, ubah status menjadi accepted. | Status lamaran berubah menjadi diterima dan sistem membuat atau mengaktifkan placement terkait. | Belum Diuji |
| TC-10.4 | Tolak pelamar internal | Dari detail pelamar, ubah status menjadi rejected. | Status lamaran berubah menjadi ditolak. | Belum Diuji |

### Flow 11: Manajemen Lowongan
Deskripsi: Menguji CRUD lowongan, lowongan eksternal, dan expiry lowongan.

| ID | Skenario Pengujian | Langkah-Langkah | Hasil yang Diharapkan | Status |
| --- | --- | --- | --- | --- |
| TC-11.1 | Tambah lowongan internal baru | Isi form lowongan tanpa external apply link, lalu simpan. | Lowongan muncul di daftar admin dan tersedia di Bursa Magang mahasiswa. | Belum Diuji |
| TC-11.2 | Tambah lowongan dengan external apply link | Isi form lowongan beserta external apply link, lalu simpan. | Lowongan tampil di admin dan mahasiswa mendapat tombol apply eksternal. | Belum Diuji |
| TC-11.3 | Edit lowongan | Klik edit pada lowongan yang sudah ada, ubah data, lalu simpan. | Informasi lowongan diperbarui di list admin dan mahasiswa. | Belum Diuji |
| TC-11.4 | Hapus lowongan | Klik hapus pada lowongan lalu konfirmasi. | Lowongan hilang dari daftar aktif. | Belum Diuji |
| TC-11.5 | Lowongan expired tidak lagi aktif | Gunakan lowongan dengan tanggal kadaluarsa yang sudah lewat. | Lowongan tidak lagi tampil di daftar aktif. | Belum Diuji |

### Flow 12: Evaluasi Supervisor dan Reminder Laporan
Deskripsi: Menguji pembuatan form evaluasi supervisor dan reminder laporan mahasiswa.

| ID | Skenario Pengujian | Langkah-Langkah | Hasil yang Diharapkan | Status |
| --- | --- | --- | --- | --- |
| TC-12.1 | Kirim form evaluasi UTS ke supervisor | Buka tab Evaluasi, pilih mahasiswa, klik Kirim Form UTS. | Record evaluasi UTS dibuat dan email form dikirim ke supervisor. | Belum Diuji |
| TC-12.2 | Kirim form evaluasi UAS ke supervisor | Buka tab Evaluasi, pilih mahasiswa, klik Kirim Form UAS. | Record evaluasi UAS dibuat dan email form dikirim ke supervisor. | Belum Diuji |
| TC-12.3 | Kirim reminder laporan UTS ke mahasiswa | Di tab Evaluasi, klik Ingatkan pada bagian laporan mahasiswa UTS. | Email reminder laporan UTS terkirim ke mahasiswa terkait. | Belum Diuji |
| TC-12.4 | Kirim reminder laporan UAS ke mahasiswa | Di tab Evaluasi, klik Ingatkan pada bagian laporan mahasiswa UAS. | Email reminder laporan UAS terkirim ke mahasiswa terkait. | Belum Diuji |
| TC-12.5 | Kirim reminder massal laporan UTS/UAS | Gunakan tombol reminder massal pada tab Evaluasi. | Email reminder terkirim ke mahasiswa aktif yang belum submit laporan terkait. | Belum Diuji |

### Flow 13: Monitoring Job Seeker
Deskripsi: Menguji monitoring mahasiswa yang belum mendapat tempat magang dan riwayat weekly report.

| ID | Skenario Pengujian | Langkah-Langkah | Hasil yang Diharapkan | Status |
| --- | --- | --- | --- | --- |
| TC-13.1 | Lihat daftar mahasiswa belum magang | Buka tab Job Seeker. | Tampil daftar mahasiswa yang belum memiliki placement approved. | Belum Diuji |
| TC-13.2 | Lihat detail progress mingguan mahasiswa | Pilih salah satu mahasiswa job seeker lalu klik Lihat Progress. | Muncul modal berisi histori weekly report mahasiswa. | Belum Diuji |
| TC-13.3 | Kirim reminder individual job seeker | Klik Ingatkan pada satu mahasiswa job seeker. | Email reminder terkirim ke mahasiswa tersebut. | Belum Diuji |
| TC-13.4 | Kirim reminder massal job seeker | Klik Kirim Email Massal pada tab Job Seeker. | Email reminder terkirim ke semua mahasiswa aktif yang belum punya placement approved. | Belum Diuji |

### Flow 14: Template Dokumen Laporan
Deskripsi: Menguji pengelolaan template UTS/UAS yang digunakan mahasiswa.

| ID | Skenario Pengujian | Langkah-Langkah | Hasil yang Diharapkan | Status |
| --- | --- | --- | --- | --- |
| TC-14.1 | Upload template UTS | Buka tab Berkas, pilih file template UTS, klik simpan. | Template UTS tersimpan dan tersedia untuk preview/download di dashboard mahasiswa. | Belum Diuji |
| TC-14.2 | Upload template UAS | Buka tab Berkas, pilih file template UAS, klik simpan. | Template UAS tersimpan dan tersedia untuk preview/download di dashboard mahasiswa. | Belum Diuji |

### Flow 15: Monitoring Berkas dan Penerbitan Sertifikat
Deskripsi: Menguji review laporan gabungan mahasiswa dan penerbitan sertifikat kelulusan.

| ID | Skenario Pengujian | Langkah-Langkah | Hasil yang Diharapkan | Status |
| --- | --- | --- | --- | --- |
| TC-15.1 | Baca detail laporan bulanan mahasiswa | Buka tab Berkas, klik Review dan Luluskan, lalu buka detail laporan bulanan. | Admin dapat membaca isi laporan bulanan aktif dan histori placement sebelumnya jika ada. | Belum Diuji |
| TC-15.2 | Lihat rekap berkas UTS/UAS dan nilai supervisor | Dari modal review, cek bagian laporan UTS, UAS, dan nilai supervisor. | Admin dapat melihat status kelengkapan berkas dan nilai evaluasi UTS/UAS. | Belum Diuji |
| TC-15.3 | Terbitkan sertifikat saat semua syarat lengkap | Isi grade lalu klik terbitkan sertifikat. | Sertifikat berhasil dibuat dan muncul di dashboard mahasiswa. | Belum Diuji |
| TC-15.4 | Coba terbitkan sertifikat saat syarat belum lengkap | Isi grade pada mahasiswa yang syaratnya belum lengkap, lalu klik terbitkan. | Sistem menampilkan warning kekurangan berkas atau nilai, lalu admin bisa membatalkan atau melanjutkan. | Belum Diuji |

## Ringkasan Revisi Dibanding Dokumen Lama

- Menambahkan flow registrasi, login sebelum approval, dan login setelah approval.
- Memisahkan lamaran internal dan lowongan eksternal.
- Menambahkan precondition CV wajib sebelum melamar.
- Menambahkan anti-double-magang saat mahasiswa sudah punya placement aktif atau pending.
- Memperjelas bahwa pengajuan placement baru akan mengarsipkan placement lama.
- Menambahkan gating menu UTS/UAS berdasarkan evaluasi yang dibuat admin.
- Menambahkan flow reminder supervisor dan reminder laporan mahasiswa.
- Menambahkan flow Pelamar, Job Seeker, Template Dokumen, edit/hapus lowongan, dan lowongan expired.
- Menyesuaikan approval akun massal agar hanya akun lengkap yang diproses.
- Menyesuaikan flow sertifikat karena sistem saat ini memberi warning, bukan hard block, ketika syarat belum lengkap.
