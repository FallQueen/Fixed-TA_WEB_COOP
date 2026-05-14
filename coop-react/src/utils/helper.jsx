export const hitungDurasi = (start, end) => {
  if (!start || !end) return '-';
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const months = Math.floor(diffDays / 30);
  const weeks = Math.floor((diffDays % 30) / 7);

  let result = [];
  if (months > 0) result.push(`${months} Bln`);
  if (weeks > 0) result.push(`${weeks} Mgg`);

  return result.length > 0 ? result.join(' ') : `${diffDays} Hari`;
};

export const bannerContent = {
  approval: { title: 'Persetujuan Akun Baru', subtitle: 'Verifikasi pendaftar baru dan berikan hak akses masuk sistem Co-op.' },
  overview: { title: 'Overview & Tracking', subtitle: 'Kelola verifikasi tempat magang dan pantau progres laporan bulanan mahasiswa.' },
  job_seeker: { title: 'Pantau Job Seeker', subtitle: 'Bantu dan pantau progress mahasiswa yang masih berjuang mencari tempat magang.' },
  industri: { title: 'Data Mitra Industri', subtitle: 'Kelola daftar perusahaan mitra dan kontak supervisor lapangan.' },
  lowongan: { title: 'Kelola Bursa Magang', subtitle: 'Posting peluang internship eksklusif untuk mahasiswa STEM Prasmul.' },
  pelamar: { title: 'Daftar Pelamar', subtitle: 'Review dan teruskan profil terbaik mahasiswa STEM ke perusahaan mitra.' },
  evaluasi: { title: 'Evaluasi Pembimbing', subtitle: 'Generate form penilaian dan ingatkan mahasiswa untuk segera mengunggah laporannya.' },
  berkas: { title: 'Berkas & Sertifikasi', subtitle: 'Atur template laporan resmi dan terbitkan sertifikat kelulusan.' },
  pengaturan: { title: 'Pengaturan Keamanan', subtitle: 'Kelola akses profil administrator dan perbarui tingkat keamanan akun Anda.' }
};