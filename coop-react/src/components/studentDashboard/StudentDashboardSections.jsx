import {
  ArrowLeft,
  Award,
  BarChart2,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Folder,
  History,
  Inbox,
  Key,
  Loader2,
  Lock,
  Map,
  MapPin,
  Printer,
  Save,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
  UploadCloud,
  User,
  XCircle,
} from 'lucide-react';

const getPlacementStatusMeta = (status) => {
  switch (status) {
    case 'resigned':
      return { label: 'Pindah / Berhenti', backgroundColor: '#fee2e2', color: '#991b1b' };
    case 'rejected':
      return { label: 'Ditolak Admin', backgroundColor: '#f1f5f9', color: '#475569' };
    case 'finished':
      return { label: 'Selesai Magang', backgroundColor: '#f1f5f9', color: '#475569' };
    case 'pending':
      return { label: 'Menunggu Validasi', backgroundColor: '#f1f5f9', color: '#475569' };
    default:
      return { label: 'Status Lainnya', backgroundColor: '#f1f5f9', color: '#475569' };
  }
};

const formatNotificationTime = (value) =>
  new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export function ProfileTab({
  files,
  handleFileChange,
  handleUpload,
  hasPendingPlacement,
  historyPlacements,
  isMobile,
  styles,
  uploading,
  userData,
}) {
  return (
    <div className="no-print">
      <div style={styles.heroBanner}>
        <h1 style={styles.heroTitle}>Selamat Datang, {userData?.first_name}!</h1>
        <p style={styles.heroSubtitle}>Siapkan dirimu untuk pengalaman profesional terbaik bersama Prasetiya Mulya.</p>
      </div>

      <div style={{ ...styles.card, marginBottom: '30px', borderLeft: '6px solid #F2A900', backgroundColor: '#fffdf5' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#003366', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}><Map size={20} color="#003366" /> Panduan Singkat Program Co-op</h3>
        <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px' }}>Ikuti 4 langkah mudah ini untuk menyelesaikan program magangmu:</p>
        <div style={styles.grid2}>
          <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #fde68a', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: '#fffbeb', color: '#b45309', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</div>
            <div><h4 style={{ margin: '0 0 5px 0', color: '#003366', fontSize: '14px', fontWeight: '700' }}>Lengkapi Dokumen</h4><p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>Upload CV PDF kamu di menu profil ini sebagai syarat wajib untuk melamar kerja.</p></div>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #fde68a', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: '#fffbeb', color: '#b45309', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</div>
            <div><h4 style={{ margin: '0 0 5px 0', color: '#003366', fontSize: '14px', fontWeight: '700' }}>Dapatkan Magang</h4><p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>Gunakan <b>Bursa Magang</b> untuk apply, atau lapor di <b>Input Lapor Magang</b> jika cari sendiri.</p></div>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #fde68a', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: '#fffbeb', color: '#b45309', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>3</div>
            <div><h4 style={{ margin: '0 0 5px 0', color: '#003366', fontSize: '14px', fontWeight: '700' }}>Kumpul Laporan</h4><p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>Setelah magang di-ACC, rutin kumpul Laporan Bulanan serta dokumen UTS & UAS.</p></div>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #fde68a', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: '#fffbeb', color: '#b45309', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>4</div>
            <div><h4 style={{ margin: '0 0 5px 0', color: '#003366', fontSize: '14px', fontWeight: '700' }}>Lulus & Sertifikat</h4><p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>Sertifikat terbit otomatis setelah Admin memvalidasi nilai dari Supervisor kamu.</p></div>
          </div>
        </div>
      </div>

      {hasPendingPlacement && (
        <div style={styles.alertWarning}>
          <Clock size={24} color="#b45309" />
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#92400e' }}>Sedang Diproses</h4>
            <p style={{ margin: 0, color: '#92400e', fontSize: '13px' }}>Laporan magangmu sedang divalidasi oleh Admin. Fitur evaluasi akan terbuka setelah disetujui.</p>
          </div>
        </div>
      )}

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <User size={24} color="#003366" />
            <h3 style={{ margin: 0, color: '#003366', fontSize: '18px', fontWeight: '600' }}>Informasi Data Diri</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><span style={styles.textLabel}>Nama Lengkap</span><p style={styles.textValue}>{userData?.first_name} {userData?.last_name}</p></div>
            <div><span style={styles.textLabel}>NIM</span><p style={styles.textValue}>{userData?.nim}</p></div>
            <div><span style={styles.textLabel}>Program Studi</span><p style={styles.textValue}>{userData?.program_studi}</p></div>
            <div><span style={styles.textLabel}>Email Terdaftar</span><p style={styles.textValue}>{userData?.email}</p></div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <Folder size={24} color="#003366" />
            <h3 style={{ margin: '0', color: '#003366', fontSize: '18px', fontWeight: '600' }}>Dokumen Kelengkapan</h3>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', margin: '0 0 10px 0' }}>File Tersimpan Saat Ini:</p>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '10px' : '0', marginBottom: '15px' }}>
              <span style={{ fontSize: '14px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Curriculum Vitae (CV)</span>
              {userData?.cv_file ? <a href={userData.cv_file} target="_blank" rel="noreferrer" style={styles.badgeSuccess}><Eye size={12} /> Lihat File</a> : <span style={styles.badgeDanger}><XCircle size={12} /> Belum Diupload</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '10px' : '0' }}>
              <span style={{ fontSize: '14px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={16} /> Portofolio Tambahan</span>
              {userData?.portofolio_file ? <a href={userData.portofolio_file} target="_blank" rel="noreferrer" style={styles.badgeSuccess}><Eye size={12} /> Lihat File</a> : <span style={{ fontSize: '12px', color: '#94a3b8' }}>Opsional (Kosong)</span>}
            </div>
          </div>

          <form id="upload-form" onSubmit={(e) => handleUpload(e, files)} style={{ display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#fff', border: '1px dashed #cbd5e1', padding: '15px', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Ingin mengganti atau menambahkan file? Upload di sini:</p>
            <div>
              <label style={styles.labelStyle}>Upload CV Baru (PDF)</label>
              <input type="file" name="cv_file" accept=".pdf" onChange={handleFileChange} style={styles.fileInput} />
            </div>
            <div>
              <label style={styles.labelStyle}>Upload Portofolio Baru (PDF/Link)</label>
              <input type="file" name="portofolio_file" accept=".pdf" onChange={handleFileChange} style={styles.fileInput} />
            </div>
            <button type="submit" disabled={uploading} className="btn-hover" style={{ ...styles.btnPrimary, backgroundColor: '#003366' }}>
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              {uploading ? 'Menyimpan Perubahan...' : 'Simpan & Perbarui Dokumen'}
            </button>
          </form>
        </div>
      </div>

      {historyPlacements.length > 0 && (
        <div style={{ ...styles.card, marginTop: '20px', borderLeft: '6px solid #94a3b8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <History size={24} color="#475569" />
            <h3 style={{ margin: '0', color: '#334155', fontSize: '18px', fontWeight: '600' }}>Riwayat Tempat Magang Sebelumnya</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {historyPlacements.map((history, idx) => {
              const statusMeta = getPlacementStatusMeta(history.status);

              return (
                <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '15px' }}>{history.company_name}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Posisi: {history.position}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>{history.start_date} s/d {history.end_date}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: statusMeta.backgroundColor, color: statusMeta.color }}>
                      {statusMeta.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function SettingsTab({
  changingPassword,
  handlePasswordChange,
  handleProfileFormChange,
  handleUpdateProfile,
  isMobile,
  isUpdatingProfile,
  passwordForm,
  profileForm,
  setPasswordForm,
  styles,
}) {
  return (
    <div className="no-print">
      <div style={styles.heroBanner}>
        <h1 style={styles.heroTitle}>Keamanan & Pengaturan Profil</h1>
        <p style={styles.heroSubtitle}>Kelola identitas login dan kata sandi Anda untuk keamanan akses portal.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '30px', alignItems: 'start' }}>
        <div style={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <User size={24} color="#003366" />
            <h3 style={{ margin: 0, color: '#003366', fontSize: '18px', fontWeight: '600' }}>Edit Akun Login</h3>
          </div>
          <form onSubmit={(e) => handleUpdateProfile(e, profileForm)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={styles.labelStyle}>Username (ID Login Baru)</label>
              <input type="text" required name="username" value={profileForm.username} onChange={handleProfileFormChange} className="input-focus" style={{ ...styles.inputStyle, fontWeight: 'bold', color: '#003366' }} placeholder="Username untuk login" />
              <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '5px' }}>*Gunakan ini sebagai pengganti NIM saat login berikutnya.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={styles.labelStyle}>Nama Depan</label>
                <input type="text" name="first_name" value={profileForm.first_name} onChange={handleProfileFormChange} className="input-focus" style={styles.inputStyle} />
              </div>
              <div>
                <label style={styles.labelStyle}>Nama Belakang</label>
                <input type="text" name="last_name" value={profileForm.last_name} onChange={handleProfileFormChange} className="input-focus" style={styles.inputStyle} />
              </div>
            </div>
            <button type="submit" disabled={isUpdatingProfile} className="btn-hover" style={{ ...styles.btnPrimary, backgroundColor: '#0ea5e9', marginTop: '10px' }}>
              {isUpdatingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isUpdatingProfile ? 'Menyimpan...' : 'Simpan ID & Profil'}
            </button>
          </form>
        </div>
        <div style={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <Key size={24} color="#003366" />
            <h3 style={{ margin: 0, color: '#003366', fontSize: '18px', fontWeight: '600' }}>Ubah Kata Sandi</h3>
          </div>
          <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>Perbarui kata sandi Anda secara berkala. Disarankan menggunakan kombinasi huruf dan angka.</p>
          <form onSubmit={(e) => handlePasswordChange(e, passwordForm)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={styles.labelStyle}>Password Saat Ini</label>
              <input type="password" required value={passwordForm.old_password} onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })} className="input-focus" style={styles.inputStyle} placeholder="Masukkan sandi saat ini" />
            </div>
            <div>
              <label style={styles.labelStyle}>Password Baru</label>
              <input type="password" required value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} className="input-focus" style={styles.inputStyle} placeholder="Minimal 8 karakter" />
            </div>
            <div>
              <label style={styles.labelStyle}>Konfirmasi Password Baru</label>
              <input type="password" required value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} className="input-focus" style={styles.inputStyle} placeholder="Ketik ulang sandi baru" />
            </div>
            <button type="submit" disabled={changingPassword} className="btn-hover" style={{ ...styles.btnPrimary, backgroundColor: '#dc2626', marginTop: '10px' }}>
              {changingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              {changingPassword ? 'Memproses...' : 'Perbarui Kata Sandi & Keluar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function NotificationsTab({
  handleDeleteAllNotifications,
  handleDeleteNotification,
  handleMarkAllNotificationsRead,
  handleMarkNotificationRead,
  handleOpenNotification,
  isMobile,
  loadingNotifications,
  notifications,
  styles,
}) {
  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  return (
    <div className="no-print">
      <div style={styles.heroBanner}>
        <h1 style={styles.heroTitle}>Pusat Notifikasi</h1>
        <p style={styles.heroSubtitle}>Semua update penting dari admin, sertifikat, dan hasil proses lamaran akan muncul di sini.</p>
      </div>

      <div style={{ ...styles.card, marginBottom: '25px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '15px' }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0', color: '#003366' }}>Ringkasan Notifikasi</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            {unreadCount > 0 ? `Kamu punya ${unreadCount} notifikasi yang belum dibaca.` : 'Semua notifikasi sudah terbaca.'}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
          <button
            type="button"
            onClick={handleMarkAllNotificationsRead}
            disabled={notifications.length === 0 || unreadCount === 0}
            className="btn-hover"
            style={{ ...styles.btnPrimary, backgroundColor: unreadCount === 0 ? '#94a3b8' : '#003366', width: isMobile ? '100%' : 'auto' }}
          >
            <CheckCircle size={16} /> Tandai Semua Dibaca
          </button>
          <button
            type="button"
            onClick={handleDeleteAllNotifications}
            disabled={notifications.length === 0}
            className="btn-hover"
            style={{ ...styles.btnPrimary, backgroundColor: notifications.length === 0 ? '#cbd5e1' : '#991b1b', width: isMobile ? '100%' : 'auto' }}
          >
            <Trash2 size={16} /> Hapus Semua
          </button>
        </div>
      </div>

      {loadingNotifications ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
          <Loader2 size={20} className="animate-spin" /> Memuat notifikasi...
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ ...styles.card, textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1' }}>
          <Inbox size={42} color="#cbd5e1" style={{ marginBottom: '10px' }} />
          <h3 style={{ margin: '10px 0', color: '#003366' }}>Belum Ada Notifikasi</h3>
          <p>Tidak ada update baru untuk akunmu saat ini.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                ...styles.card,
                borderLeft: notification.is_read ? '6px solid #cbd5e1' : '6px solid #F2A900',
                backgroundColor: notification.is_read ? 'white' : '#fffdf5',
              }}
            >
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: '12px', alignItems: isMobile ? 'flex-start' : 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <strong style={{ color: '#0f172a', fontSize: '16px' }}>{notification.title}</strong>
                    {!notification.is_read && (
                      <span style={{ ...styles.newBadge, backgroundColor: '#dc2626' }}>
                        Baru
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 12px 0', color: '#475569', lineHeight: '1.7', fontSize: '14px', whiteSpace: 'pre-line' }}>
                    {notification.message}
                  </p>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>
                    {formatNotificationTime(notification.created_at)}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'column', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
                  {notification.target_tab && (
                    <button
                      type="button"
                      onClick={() => handleOpenNotification(notification)}
                      className="btn-hover"
                      style={{ ...styles.btnPrimary, backgroundColor: '#003366', width: isMobile ? '100%' : 'auto' }}
                    >
                      <Eye size={16} /> Buka Terkait
                    </button>
                  )}
                  {!notification.is_read && (
                    <button
                      type="button"
                      onClick={() => handleMarkNotificationRead(notification.id)}
                      className="btn-hover"
                      style={{ ...styles.btnPrimary, backgroundColor: '#fff', color: '#003366', border: '1px solid #cbd5e1', width: isMobile ? '100%' : 'auto' }}
                    >
                      <CheckCircle size={16} /> Tandai Dibaca
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="btn-hover"
                    style={{ ...styles.btnPrimary, backgroundColor: '#fff', color: '#991b1b', border: '1px solid #fecaca', width: isMobile ? '100%' : 'auto' }}
                  >
                    <Trash2 size={16} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function VacanciesTab({ hasAnyPlacement, loadingVacancies, setSelectedVacancy, styles, vacancies }) {
  return (
    <div className="no-print">
      <div style={styles.heroBanner}>
        <h1 style={styles.heroTitle}>Bursa Magang Resmi</h1>
        <p style={styles.heroSubtitle}>Eksplorasi lowongan eksklusif dari perusahaan mitra Prasetiya Mulya.</p>
      </div>
      {hasAnyPlacement && (
        <div style={styles.alertDanger}>
          <ShieldAlert size={24} color="#991b1b" />
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#991b1b' }}>Akses Dilindungi (Anti-Double Magang)</h4>
            <p style={{ margin: 0, color: '#991b1b', fontSize: '13px' }}>Anda sudah terdaftar di suatu tempat magang aktif. Tombol lamar untuk lowongan baru telah dikunci oleh sistem.</p>
          </div>
        </div>
      )}
      {loadingVacancies ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <Loader2 size={40} className="animate-spin" style={{ marginBottom: '10px', color: '#003366' }} />
          <p>Memuat daftar peluang magang...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {vacancies.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <Inbox size={48} color="#94a3b8" style={{ marginBottom: '15px' }} />
              <h3 style={{ margin: '0 0 5px 0', color: '#003366' }}>Belum Ada Lowongan</h3>
              <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Tim admin sedang menyiapkan peluang terbaik untuk Anda. Cek kembali nanti!</p>
            </div>
          ) : vacancies.map((job) => (
            <div key={job.id} className="job-card" style={{ opacity: hasAnyPlacement ? 0.6 : 1 }}>
              <div className="job-card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: '#e6f0fa', color: '#003366', fontSize: '11px', fontWeight: '700', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <Sparkles size={12} /> OPEN INTERNSHIP
                  </span>
                </div>
                <h3 style={{ margin: '0 0 8px 0', color: '#003366', fontSize: '20px', lineHeight: '1.3', fontWeight: '700' }}>{job.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '14px', fontWeight: '500' }}>
                  <Building2 size={16} /> <span>{job.company_name}</span>
                </div>
              </div>
              <div className="job-card-body">
                <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748b', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{job.description}</p>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginTop: 'auto' }}>
                  <button className="btn-hover" onClick={() => setSelectedVacancy(job)} style={{ width: '100%', padding: '12px', backgroundColor: '#fff', color: '#003366', border: '2px solid #003366', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: '0.2s', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onMouseOver={(e) => { e.target.style.backgroundColor = '#003366'; e.target.style.color = '#fff'; }} onMouseOut={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.color = '#003366'; }}>
                    <Eye size={16} /> Lihat Detail Pekerjaan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function VacancyModal({
  applicationForm,
  closeModal,
  handleApplySubmit,
  hasAnyPlacement,
  isApplying,
  isMobile,
  selectedVacancy,
  setApplicationForm,
  setIsApplying,
  styles,
  submittingApplication,
  userData,
}) {
  if (!selectedVacancy) return null;

  const hasCv = Boolean(userData?.cv_file);
  const hasPortfolio = Boolean(userData?.portofolio_file);
  const isApplyDisabled = submittingApplication || hasAnyPlacement;

  const handleProceedToApply = () => {
    if (!hasCv) {
      alert(
        'Sebelum lanjut melamar, lengkapi CV terlebih dahulu di tab Profil. Portofolio juga disarankan jika kamu punya.'
      );
      return;
    }

    window.setTimeout(() => setIsApplying(true), 0);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modalContent, display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <div style={styles.modalHeader}>
          <h2 style={{ margin: 0, color: '#003366', fontSize: '20px', fontWeight: '700' }}>{isApplying ? 'Formulir Lamaran' : 'Detail Pekerjaan'}</h2>
          <button type="button" onClick={closeModal} style={styles.closeBtn}><XCircle size={24} /></button>
        </div>
        <div style={{ padding: isMobile ? '20px' : '30px', overflowY: 'auto', flex: 1, backgroundColor: isApplying ? '#f8fafc' : '#fff' }}>
          {!isApplying ? (
            <>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px', alignItems: isMobile ? 'center' : 'flex-start', textAlign: isMobile ? 'center' : 'left', marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: '#e6f0fa', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#003366' }}>
                  <Building2 size={32} />
                </div>
                <div>
                  <h1 style={{ margin: '0 0 5px 0', color: '#003366', fontSize: '24px', lineHeight: '1.2', fontWeight: '700' }}>{selectedVacancy.title}</h1>
                  <h3 style={{ margin: 0, color: '#F2A900', fontSize: '16px', fontWeight: '600' }}>{selectedVacancy.company_name}</h3>
                </div>
              </div>
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: '#003366', margin: '0 0 10px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}><FileText size={18} /> Deskripsi Pekerjaan</h4>
                <p style={{ whiteSpace: 'pre-line', color: '#475569', lineHeight: '1.7', margin: 0, fontSize: '14px' }}>{selectedVacancy.description}</p>
              </div>
              <div>
                <h4 style={{ color: '#003366', margin: '0 0 10px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}><FileCheck size={18} /> Persyaratan Khusus</h4>
                <p style={{ whiteSpace: 'pre-line', color: '#475569', lineHeight: '1.7', margin: 0, fontSize: '14px' }}>{selectedVacancy.requirements || 'Tidak ada persyaratan spesifik yang dicantumkan.'}</p>
              </div>
              {(!hasCv || !hasPortfolio) && (
                <div style={{ ...styles.alertWarning, marginTop: '25px', marginBottom: 0, alignItems: 'flex-start' }}>
                  <ShieldAlert size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', color: '#92400e', fontSize: '14px' }}>
                      Lengkapi Dokumen Sebelum Melamar
                    </h4>
                    <p style={{ margin: 0, color: '#92400e', fontSize: '13px', lineHeight: '1.6' }}>
                      CV wajib diunggah di tab Profil sebelum kamu bisa lanjut melamar.
                      Portofolio bersifat opsional, tapi sangat disarankan untuk memperkuat lamaranmu.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <form id="applyForm" onSubmit={(e) => e.preventDefault()}>
              {!hasPortfolio && (
                <div style={{ ...styles.alertWarning, marginBottom: '20px', alignItems: 'flex-start' }}>
                  <ShieldAlert size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', color: '#92400e', fontSize: '14px' }}>
                      Portofolio Belum Diunggah
                    </h4>
                    <p style={{ margin: 0, color: '#92400e', fontSize: '13px', lineHeight: '1.6' }}>
                      Kamu tetap bisa mengirim lamaran dan mengisi cover letter. Namun, portofolio akan sangat membantu memperkuat profilmu.
                    </p>
                  </div>
                </div>
              )}
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#475569' }}>Kamu akan melamar untuk posisi <strong style={{ color: '#003366' }}>{selectedVacancy.title}</strong> di <strong style={{ color: '#003366' }}>{selectedVacancy.company_name}</strong>.</p>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: '15px', backgroundColor: '#e6f0fa', padding: '15px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <FileText size={32} color="#003366" />
                  <div style={{ flex: 1 }}>
                    <h5 style={{ margin: '0 0 4px 0', color: '#003366', fontSize: '14px' }}>Curriculum Vitae (CV)</h5>
                    <p style={{ margin: 0, fontSize: '12px', color: '#0055A5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {userData?.cv_file ? <><CheckCircle size={14} /> CV mu sudah terlampir otomatis dari profil.</> : <><XCircle size={14} /> Ops! Kamu belum upload CV di tab profil.</>}
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ ...styles.labelStyle, fontSize: '14px', color: '#003366' }}>Pesan Tambahan / Cover Letter (Opsional)</label>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b' }}>Ceritakan sedikit kenapa kamu cocok untuk posisi ini agar Admin & HRD tertarik dengan profilmu.</p>
                <textarea autoFocus rows="6" placeholder="Yth. Bapak/Ibu HRD, Saya sangat tertarik..." className="input-focus" style={{ ...styles.inputStyle, resize: 'vertical' }} value={applicationForm.cover_letter} onChange={(e) => setApplicationForm({ ...applicationForm, cover_letter: e.target.value })} />
              </div>
            </form>
          )}
        </div>
        <div style={styles.modalFooter}>
          {!isApplying ? (
            <>
              <button type="button" className="btn-hover" onClick={closeModal} style={{ ...styles.btnPrimary, backgroundColor: '#f1f5f9', color: '#475569', padding: '12px 20px', border: '1px solid #cbd5e1' }}>Batal</button>
              {selectedVacancy.external_apply_link ? (
                hasAnyPlacement ? (
                  <button disabled style={{ ...styles.btnPrimary, padding: '12px 30px', fontSize: '15px', backgroundColor: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' }}>
                    <Lock size={16} /> Terkunci (Sudah Magang)
                  </button>
                ) : (
                  <a href={selectedVacancy.external_apply_link} target="_blank" rel="noopener noreferrer" className="btn-hover" style={{ ...styles.btnPrimary, padding: '12px 30px', fontSize: '15px', backgroundColor: '#0ea5e9', color: 'white', textDecoration: 'none', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.3)' }}>
                    <ExternalLink size={16} /> Apply via Web Perusahaan
                  </a>
                )
              ) : (
                <button
                  type="button"
                  className="btn-hover"
                  onClick={handleProceedToApply}
                  disabled={isApplyDisabled}
                  style={{ ...styles.btnPrimary, padding: '12px 30px', fontSize: '15px', backgroundColor: isApplyDisabled ? '#94a3b8' : '#003366', cursor: isApplyDisabled ? 'not-allowed' : 'pointer' }}
                >
                  {hasAnyPlacement ? <><Lock size={16} /> Terkunci (Sudah Magang)</> : <><Send size={16} /> Lanjut Lamar</>}
                </button>
              )}
            </>
          ) : (
            <>
              <button type="button" className="btn-hover" onClick={() => setIsApplying(false)} style={{ ...styles.btnPrimary, backgroundColor: '#f1f5f9', color: '#475569', padding: '12px 20px', border: '1px solid #cbd5e1' }}>
                <ArrowLeft size={16} /> Kembali
              </button>
              <button
                type="button"
                className="btn-hover"
                onClick={(e) => handleApplySubmit(e, applicationForm)}
                disabled={isApplyDisabled}
                style={{ ...styles.btnPrimary, padding: '12px 30px', fontSize: '15px', backgroundColor: isApplyDisabled ? '#94a3b8' : '#003366', cursor: isApplyDisabled ? 'not-allowed' : 'pointer' }}
              >
                {submittingApplication ? <><Loader2 size={16} className="animate-spin" /> Mengirim...</> : <><Send size={16} /> Kirim Lamaran Sekarang</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function DocumentPreviewModal({ isMobile, previewDoc, setPreviewDoc, styles }) {
  if (!previewDoc) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modalContent, width: isMobile ? '100%' : '80%', maxWidth: '1000px', height: isMobile ? '100vh' : '90vh', maxHeight: '100vh', borderRadius: isMobile ? '0' : '16px', display: 'flex', flexDirection: 'column' }}>
        <div style={styles.modalHeader}>
          <h2 style={{ margin: '0 0 5px 0', color: '#003366', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><Eye size={20} /> Preview Dokumen</h2>
          <button onClick={() => setPreviewDoc(null)} style={styles.closeBtn}><XCircle size={24} /></button>
        </div>
        <div style={{ flex: 1, backgroundColor: '#525659' }}>
          <iframe src={previewDoc} width="100%" height="100%" style={{ border: 'none' }} title="Document Preview" />
        </div>
        <div style={{ padding: '10px 20px', backgroundColor: '#f8fafc', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
          *Catatan: Jika file berupa Word (.docx) dan tidak muncul, silakan gunakan tombol Download.
        </div>
      </div>
    </div>
  );
}

export function PlacementReportTab({
  acceptanceLetter,
  currentPlacement,
  handlePlacementSubmit,
  hasApprovedPlacement,
  hasPendingPlacement,
  placementForm,
  setAcceptanceLetter,
  setPlacementForm,
  styles,
  submittingPlacement,
}) {
  return (
    <div className="no-print">
      <div style={styles.heroBanner}>
        <h1 style={styles.heroTitle}>{hasApprovedPlacement ? 'Pengajuan Pindah Tempat Magang' : 'Input Data Magang'}</h1>
        <p style={styles.heroSubtitle}>{hasApprovedPlacement ? 'Gunakan form ini HANYA jika Anda ingin pindah tempat kerja. Data magang saat ini akan diarsipkan.' : 'Daftarkan tempat magang yang Anda dapatkan di luar bursa resmi kami.'}</p>
      </div>
      <div style={styles.card}>
        {hasPendingPlacement && (
          <div style={styles.alertWarning}>
            <Clock size={24} color="#b45309" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: '#92400e' }}>Pengajuan Sedang Diproses</h4>
              <p style={{ margin: 0, color: '#92400e', fontSize: '13px' }}>Anda memiliki pengajuan yang sedang <strong>menunggu validasi admin</strong>. Mengirim ulang form ini akan <strong>membatalkan & mengarsipkan</strong> pengajuan sebelumnya.</p>
            </div>
          </div>
        )}
        {hasApprovedPlacement && (
          <div style={styles.alertDanger}>
            <ShieldAlert size={24} color="#991b1b" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: '#991b1b' }}>Peringatan Pemindahan Data</h4>
              <p style={{ margin: 0, color: '#991b1b', fontSize: '13px' }}>Status Anda saat ini <strong>Aktif Magang</strong> di {currentPlacement?.company_name}. Jika Anda men-submit form ini, sistem akan <strong>mengarsipkan tempat lama</strong> dan Anda harus mengulang semua laporan bulanan dari nol di tempat baru.</p>
            </div>
          </div>
        )}
        <form onSubmit={(e) => handlePlacementSubmit(e, acceptanceLetter, placementForm)}>
          <h4 style={styles.sectionTitle}>1. Data Perusahaan & Posisi</h4>
          <div style={styles.grid2}>
            <div><label style={styles.labelStyle}>Nama Perusahaan</label><input type="text" name="company_name" required value={placementForm.company_name} onChange={(e) => setPlacementForm({ ...placementForm, company_name: e.target.value })} className="input-focus" style={styles.inputStyle} /></div>
            <div><label style={styles.labelStyle}>Sektor Bisnis / Industri</label><input type="text" name="business_sector" required value={placementForm.business_sector} onChange={(e) => setPlacementForm({ ...placementForm, business_sector: e.target.value })} className="input-focus" style={styles.inputStyle} /></div>
            <div><label style={styles.labelStyle}>Posisi / Departemen</label><input type="text" name="position" required value={placementForm.position} onChange={(e) => setPlacementForm({ ...placementForm, position: e.target.value })} className="input-focus" style={styles.inputStyle} /></div>
            <div><label style={styles.labelStyle}>Alamat Lengkap Perusahaan</label><input type="text" name="company_address" required value={placementForm.company_address} onChange={(e) => setPlacementForm({ ...placementForm, company_address: e.target.value })} className="input-focus" style={styles.inputStyle} /></div>
          </div>
          <div style={{ ...styles.grid2, marginTop: '20px' }}>
            <div><label style={styles.labelStyle}>Tanggal Mulai Magang</label><input type="date" name="start_date" required value={placementForm.start_date} onChange={(e) => setPlacementForm({ ...placementForm, start_date: e.target.value })} className="input-focus" style={styles.inputStyle} /></div>
            <div><label style={styles.labelStyle}>Tanggal Selesai Magang</label><input type="date" name="end_date" required value={placementForm.end_date} onChange={(e) => setPlacementForm({ ...placementForm, end_date: e.target.value })} className="input-focus" style={styles.inputStyle} /></div>
          </div>
          <h4 style={styles.sectionTitle}>2. Data Supervisor (Pembimbing Lapangan)</h4>
          <div style={styles.grid2}>
            <div><label style={styles.labelStyle}>Nama Lengkap & Gelar</label><input type="text" name="supervisor_name" required value={placementForm.supervisor_name} onChange={(e) => setPlacementForm({ ...placementForm, supervisor_name: e.target.value })} className="input-focus" style={styles.inputStyle} /></div>
            <div><label style={styles.labelStyle}>Email Aktif Supervisor</label><input type="email" name="supervisor_email" required value={placementForm.supervisor_email} onChange={(e) => setPlacementForm({ ...placementForm, supervisor_email: e.target.value })} className="input-focus" style={styles.inputStyle} /></div>
            <div><label style={styles.labelStyle}>No. WhatsApp Supervisor</label><input type="text" name="supervisor_phone" value={placementForm.supervisor_phone} onChange={(e) => setPlacementForm({ ...placementForm, supervisor_phone: e.target.value })} className="input-focus" style={styles.inputStyle} placeholder="Cth: 08123456789" /></div>
          </div>
          <h4 style={styles.sectionTitle}>3. Dokumen Validasi (Letter of Acceptance)</h4>
          <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <label style={{ ...styles.labelStyle, marginBottom: '10px' }}>Upload Surat Diterima Magang / Offering Letter (PDF/JPG)</label>
            <input type="file" accept=".pdf,image/*" required onChange={(e) => setAcceptanceLetter(e.target.files[0])} style={{ ...styles.fileInput, backgroundColor: '#fff' }} />
          </div>
          <button className="btn-hover" type="submit" disabled={submittingPlacement} style={{ ...styles.btnPrimary, width: '100%', marginTop: '30px', padding: '16px', fontSize: '16px', backgroundColor: hasApprovedPlacement ? '#dc2626' : '#F2A900', color: hasApprovedPlacement ? '#ffffff' : '#003366', fontWeight: '700' }}>
            {submittingPlacement ? <><Loader2 size={18} className="animate-spin" /> Sedang Memproses Data...</> : <><Send size={18} /> {hasApprovedPlacement ? 'SAYA YAKIN, AJUKAN PINDAH TEMPAT' : 'Kirim Data Magang Saya'}</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export function WeeklyProgressTab({
  formatSubmissionDate,
  handleWeeklySubmit,
  isMobile,
  setWeeklyForm,
  styles,
  submittingWeekly,
  weeklyForm,
  weeklyReports,
}) {
  return (
    <div className="no-print">
      <div style={styles.heroBanner}>
        <h1 style={styles.heroTitle}>Progress Pencarian Magang</h1>
        <p style={styles.heroSubtitle}>Laporkan upaya mingguan Anda agar Dosen Pembimbing dapat memantau dan memberikan arahan.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '30px', alignItems: 'flex-start' }}>
        <div style={{ ...styles.card, flex: 1, width: isMobile ? 'auto' : '100%', position: isMobile ? 'static' : 'sticky', top: '20px', borderTop: '4px solid #003366' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#003366', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><Edit3 size={20} /> Buat Laporan Baru</h3>
          <form onSubmit={(e) => handleWeeklySubmit(e, weeklyForm)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div><label style={styles.labelStyle}>Minggu Ke-</label><input type="text" name="week_number" placeholder="Contoh: Minggu 1 (Awal Maret)" required onChange={(e) => setWeeklyForm({ ...weeklyForm, week_number: e.target.value })} value={weeklyForm.week_number} className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc' }} /></div>
            <div><label style={styles.labelStyle}>Perusahaan yang Dilamar (Apply)</label><textarea name="companies_applied" rows="3" placeholder="Sebutkan nama perusahaan dan posisinya..." required onChange={(e) => setWeeklyForm({ ...weeklyForm, companies_applied: e.target.value })} value={weeklyForm.companies_applied} className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc', resize: 'vertical' }} /></div>
            <div><label style={styles.labelStyle}>Kendala yang Dihadapi</label><textarea name="challenges" rows="3" placeholder="Misal: Belum ada panggilan interview..." required onChange={(e) => setWeeklyForm({ ...weeklyForm, challenges: e.target.value })} value={weeklyForm.challenges} className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc', resize: 'vertical' }} /></div>
            <div><label style={styles.labelStyle}>Rencana Minggu Depan</label><textarea name="next_plan" rows="2" placeholder="Target perbaikan CV atau apply ke perusahaan X..." required onChange={(e) => setWeeklyForm({ ...weeklyForm, next_plan: e.target.value })} value={weeklyForm.next_plan} className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc', resize: 'vertical' }} /></div>
            <button type="submit" disabled={submittingWeekly} className="btn-hover" style={{ ...styles.btnPrimary, backgroundColor: '#003366', marginTop: '10px', padding: '14px', fontSize: '15px' }}>
              {submittingWeekly ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {submittingWeekly ? 'Mengirim Data...' : 'Kirim Laporan Mingguan'}
            </button>
          </form>
        </div>
        <div style={{ ...styles.card, flex: 1, width: isMobile ? 'auto' : '100%' }}>
          <h3 style={{ margin: '0 0 25px 0', color: '#003366', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><History size={20} /> Rekam Jejak (Timeline)</h3>
          {weeklyReports.length === 0 ? (
            <div style={{ padding: '30px', backgroundColor: '#f8fafc', borderRadius: '12px', textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1' }}>
              <BarChart2 size={40} color="#cbd5e1" style={{ marginBottom: '10px' }} />
              <p style={{ margin: 0 }}>Belum ada riwayat laporan.<br />Mulai laporkan progress pertama Anda!</p>
            </div>
          ) : (
            <div style={{ paddingLeft: '5px' }}>
              {weeklyReports.map((report) => (
                <div key={report.id} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', gap: isMobile ? '5px' : '0' }}>
                      <h4 style={{ margin: 0, color: '#003366', fontSize: '16px', fontWeight: '700' }}>{report.week_number}</h4>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: '4px' }}>{formatSubmissionDate(report.submitted_at)}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div><span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Tujuan Apply</span><p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#334155', fontWeight: '500' }}>{report.companies_applied}</p></div>
                      <div><span style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444', textTransform: 'uppercase' }}>Kendala Utama</span><p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#334155' }}>{report.challenges}</p></div>
                      <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', marginTop: '5px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#003366', textTransform: 'uppercase' }}>Tindak Lanjut (Next Plan)</span>
                        <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>"{report.next_plan}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MonthlyReportsTab({
  approvedPlacements,
  cancelEditMonthlyReport,
  editingReportId,
  formatSubmissionDate,
  getPlacementOptionLabel,
  handleEditMonthlyReport,
  handleReportChange,
  handleReportSubmit,
  isFirstMonthReport,
  isMobile,
  monthlyReports,
  reportForm,
  styles,
  submittingReport,
}) {
  return (
    <div className="no-print">
      <div style={styles.heroBanner}>
        <h1 style={styles.heroTitle}>Laporan Kemajuan Bulanan</h1>
        <p style={styles.heroSubtitle}>Evaluasi mandiri secara berkala untuk memantau performa magang Anda.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '30px', alignItems: 'flex-start' }}>
        <div style={{ ...styles.card, flex: 1.5, width: isMobile ? 'auto' : '100%', borderTop: editingReportId ? '4px solid #0ea5e9' : '4px solid #003366' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#003366', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><Edit3 size={20} /> {editingReportId ? 'Mode Revisi Laporan' : 'Buat Laporan Baru'}</h3>
            {editingReportId && <button type="button" onClick={cancelEditMonthlyReport} style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Batal Revisi</button>}
          </div>
          <form onSubmit={(e) => handleReportSubmit(e, editingReportId, reportForm)}>
            <div style={{ backgroundColor: '#e6f0fa', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
              <div style={styles.grid2}>
                <div>
                  <label style={{ ...styles.labelStyle, color: '#003366', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> Tempat Magang Aktif</label>
                  <select name="placement" required onChange={handleReportChange} value={reportForm.placement} className="input-focus" style={{ ...styles.inputStyle, border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <option value="">-- Konfirmasi Tempat Magang --</option>
                    {approvedPlacements.map((placement) => <option key={placement.id} value={placement.id}>{getPlacementOptionLabel(placement)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ ...styles.labelStyle, color: '#003366', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> Periode Laporan (Bulan Ke-)</label>
                  <input type="text" name="report_month" placeholder="Contoh: Bulan 1 (Maret 2026)" required onChange={handleReportChange} value={reportForm.report_month} className="input-focus" style={{ ...styles.inputStyle, border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {isFirstMonthReport && <div><label style={styles.labelStyle}>1. Deskripsikan Profil Perusahaan Singkat</label><textarea name="company_profile" rows="3" required onChange={handleReportChange} value={reportForm.company_profile} className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc', resize: 'vertical' }} /></div>}
              <div>
                <label style={styles.labelStyle}>{isFirstMonthReport ? '2. Rincian Pekerjaan (Jobdesk) Selama Sebulan Terakhir' : 'Highlight Pekerjaan (Jobdesk) Bulan Ini'}</label>
                <textarea name="job_description" rows="4" required onChange={handleReportChange} value={reportForm.job_description} className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc', resize: 'vertical' }} />
              </div>
              {isFirstMonthReport && (
                <>
                  <div><label style={styles.labelStyle}>3. Bagaimana Suasana Lingkungan & Budaya Kerjanya?</label><textarea name="work_environment" rows="3" required onChange={handleReportChange} value={reportForm.work_environment} className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc', resize: 'vertical' }} /></div>
                  <div><label style={styles.labelStyle}>4. Materi Kuliah Apa yang Paling Berguna di Sini?</label><textarea name="useful_courses" rows="3" required onChange={handleReportChange} value={reportForm.useful_courses} className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc', resize: 'vertical' }} /></div>
                  <div><label style={styles.labelStyle}>5. Keahlian/Skill Baru yang Anda Pelajari</label><textarea name="new_skills" rows="3" required onChange={handleReportChange} value={reportForm.new_skills} className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc', resize: 'vertical' }} /></div>
                </>
              )}
            </div>
            <div style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <button className="btn-hover" type="submit" disabled={submittingReport} style={{ ...styles.btnPrimary, backgroundColor: editingReportId ? '#0ea5e9' : '#003366', padding: '14px 24px', fontSize: '15px', width: '100%' }}>
                {submittingReport ? <Loader2 size={16} className="animate-spin" /> : (editingReportId ? <Save size={16} /> : <Send size={16} />)}
                {submittingReport ? 'Memproses Dokumen...' : (editingReportId ? 'Simpan Revisi Laporan' : 'Kirim Laporan Bulanan ➔')}
              </button>
            </div>
          </form>
        </div>
        <div style={{ ...styles.card, flex: 1, width: isMobile ? 'auto' : '100%', position: isMobile ? 'static' : 'sticky', top: '20px' }}>
          <h3 style={{ margin: '0 0 25px 0', color: '#003366', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><History size={20} /> Rekam Jejak Bulanan</h3>
          {monthlyReports.length === 0 ? (
            <div style={{ padding: '30px', backgroundColor: '#f8fafc', borderRadius: '12px', textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1' }}>
              <BarChart2 size={40} color="#cbd5e1" style={{ marginBottom: '10px' }} />
              <p style={{ margin: 0 }}>Belum ada laporan.<br />Laporan bulanan yang Anda kumpulkan akan muncul di sini.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {monthlyReports.map((report) => (
                <div key={report.id} style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '12px', border: editingReportId === report.id ? '2px solid #0ea5e9' : '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#003366', fontSize: '15px', fontWeight: '700' }}>{report.report_month}</h4>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Dikirim: {formatSubmissionDate(report.submitted_at)}</span>
                    </div>
                    <button onClick={() => handleEditMonthlyReport(report)} style={{ padding: '6px 10px', backgroundColor: editingReportId === report.id ? '#0ea5e9' : '#f1f5f9', color: editingReportId === report.id ? '#fff' : '#003366', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Edit size={12} /> {editingReportId === report.id ? 'Mengedit...' : 'Revisi'}
                    </button>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#003366', textTransform: 'uppercase' }}>Highlight Pekerjaan:</span>
                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{report.job_description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SubmissionReportTab({
  approvedPlacements,
  evaluation,
  evaluationSuccessSubtitle,
  evaluationSuccessTitle,
  fileLabel,
  formData,
  getPlacementOptionLabel,
  handleSubmit,
  isMobile,
  reminderLink,
  sectionTitle,
  setFile,
  setFormData,
  setPreviewDoc,
  styles,
  submittedDescription,
  submittedReport,
  submittedTitle,
  submitting,
  submitLabel,
  successTitle,
  templateFile,
  templateTitle,
  title,
  uploadButtonLabel,
  uploadedFileLabel,
  waitingEvaluationSubtitle,
}) {
  return (
    <div className="no-print">
      <div style={styles.heroBanner}>
        <h1 style={styles.heroTitle}>{title}</h1>
        <p style={styles.heroSubtitle}>{submittedDescription}</p>
      </div>
      <div style={{ ...styles.card, borderTop: '4px solid #F2A900' }}>
        {submittedReport && (
          <div style={{ padding: '20px', backgroundColor: '#e0f2fe', borderRadius: '12px', marginBottom: '25px', border: '1px solid #bae6fd', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '15px' : '0' }}>
            <div>
              <h3 style={{ color: '#0369a1', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={20} /> {successTitle}</h3>
              <p style={{ margin: 0, color: '#0284c7', fontSize: '14px' }}>{submittedTitle}</p>
            </div>
            <a href={submittedReport.report_file} target="_blank" rel="noreferrer" className="btn-hover" style={{ ...styles.btnPrimary, backgroundColor: '#0284c7', textDecoration: 'none' }}>
              <Eye size={16} /> Lihat File Terkirim
            </a>
          </div>
        )}
        {evaluation?.is_filled ? (
          <div style={{ padding: '20px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '12px', marginBottom: '25px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <CheckCircle size={28} />
            <div><strong style={{ display: 'block', fontSize: '16px' }}>{evaluationSuccessTitle}</strong><span style={{ fontSize: '13px' }}>{evaluationSuccessSubtitle}</span></div>
          </div>
        ) : (
          <div style={{ padding: '20px', backgroundColor: '#fffbeb', color: '#b45309', borderRadius: '12px', marginBottom: '25px', border: '1px solid #fde68a', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? '15px' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Clock size={28} />
              <div><strong style={{ display: 'block', fontSize: '16px' }}>Menunggu Penilaian Supervisor</strong><span style={{ fontSize: '13px' }}>{waitingEvaluationSubtitle}</span></div>
            </div>
            <a href={reminderLink} target="_blank" rel="noreferrer" className="btn-hover" style={{ padding: '10px 16px', backgroundColor: '#25D366', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
              <Send size={16} /> Hubungi via WA
            </a>
          </div>
        )}
        {templateFile && (
          <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '30px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', border: '1px dashed #cbd5e1', gap: isMobile ? '15px' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#e6f0fa', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#003366' }}><Download size={20} /></div>
              <div><h4 style={{ margin: '0 0 4px 0', color: '#003366', fontSize: '15px', fontWeight: '700' }}>{templateTitle}</h4><p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Wajib gunakan format resmi dari Admin Co-op.</p></div>
            </div>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
              <button onClick={(e) => { e.preventDefault(); setPreviewDoc(templateFile); }} className="btn-hover" style={{ ...styles.btnPrimary, backgroundColor: '#fff', color: '#003366', border: '1px solid #cbd5e1' }}><Eye size={16} /> Preview</button>
              <a href={templateFile} target="_blank" rel="noreferrer" className="btn-hover" style={{ ...styles.btnPrimary, backgroundColor: '#003366', textDecoration: 'none', display: 'flex', textAlign: 'center' }}><Download size={16} /> Download File</a>
            </div>
          </div>
        )}
        <h3 style={{ margin: '0 0 20px 0', color: '#003366', fontSize: '18px', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>{sectionTitle}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={styles.labelStyle}>Tempat Magang Aktif</label>
            <select required onChange={(e) => setFormData({ ...formData, placement: e.target.value })} value={formData.placement} className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc' }}>
              <option value="">-- Pilih Tempat Magang --</option>
              {approvedPlacements.map((placement) => <option key={placement.id} value={placement.id}>{getPlacementOptionLabel(placement)}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.labelStyle}>{fileLabel}</label>
            <div style={{ padding: '20px', backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '8px' }}>
              <input type="file" accept=".pdf,.doc,.docx" required onChange={(e) => setFile(e.target.files[0])} style={{ width: '100%', cursor: 'pointer', fontFamily: '"Montserrat", sans-serif' }} />
            </div>
          </div>
          <div>
            <label style={styles.labelStyle}>{uploadButtonLabel}</label>
            <textarea rows="3" onChange={(e) => setFormData({ ...formData, description: e.target.value })} value={formData.description} placeholder={uploadedFileLabel} className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc', resize: 'vertical' }} />
          </div>
          <div style={{ marginTop: '10px', textAlign: isMobile ? 'center' : 'right' }}>
            <button type="submit" disabled={submitting} className="btn-hover" style={{ ...styles.btnPrimary, backgroundColor: '#003366', padding: '14px 30px', fontSize: '15px', width: isMobile ? '100%' : 'auto' }}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              {submitting ? 'Mengupload Dokumen...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CertificatesTab({ certificates, isMobile, loadingCertificates, styles }) {
  return (
    <div>
      <div className="no-print" style={styles.heroBanner}>
        <h1 style={styles.heroTitle}>Sertifikat Program Co-op</h1>
        <p style={styles.heroSubtitle}>Bukti resmi kelulusan dan nilai akhir magang Anda di Prasetiya Mulya.</p>
      </div>
      {loadingCertificates ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
          <Loader2 size={20} className="animate-spin" /> Memuat sertifikat...
        </div>
      ) : certificates.length === 0 ? (
        <div className="no-print" style={{ ...styles.card, textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1' }}>
          <Award size={40} color="#cbd5e1" style={{ marginBottom: '10px' }} />
          <h3 style={{ margin: '10px 0', color: '#003366' }}>Belum Ada Sertifikat</h3>
          <p>Sertifikat akan muncul di sini setelah Anda menyelesaikan magang dan dinilai oleh admin.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {certificates.map((cert) => (
            <div key={cert.id}>
              <div className="printable-certificate" style={styles.certificateBox}>
                <h1 style={{ color: '#003366', fontFamily: 'serif', marginBottom: '5px', fontSize: isMobile ? '24px' : '32px' }}>CERTIFICATE OF COMPLETION</h1>
                <p style={{ color: '#475569', fontSize: '14px', marginBottom: '25px' }}>Diberikan kepada:</p>
                <h2 style={{ color: '#F2A900', fontSize: isMobile ? '22px' : '28px', margin: '0 0 5px 0' }}>{cert.student.first_name} {cert.student.last_name}</h2>
                <p style={{ color: '#334155', margin: '0 0 5px 0', fontWeight: 'bold' }}>NIM: {cert.student.nim} | Program Studi: {cert.student.program_studi}</p>
                <p style={{ margin: '25px 0', lineHeight: '1.6', color: '#475569' }}>
                  Telah menyelesaikan Program Co-op dengan predikat kelulusan
                  <br /><strong style={{ fontSize: '18px', color: '#003366' }}>Konversi Nilai: {cert.grade}</strong>
                </p>
                <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px', marginTop: '20px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', fontSize: '14px', color: '#64748b', gap: isMobile ? '15px' : '0' }}>
                  <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                    <strong style={{ color: '#334155' }}>Perusahaan:</strong><br />{cert.placement.company_name}
                  </div>
                  <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
                    <strong style={{ color: '#334155' }}>Periode Magang:</strong><br />
                    {cert.placement.start_date} s/d {cert.placement.end_date}
                  </div>
                </div>
              </div>
              <button className="btn-hover no-print" onClick={() => window.print()} style={{ ...styles.btnPrimary, width: '100%', padding: '15px', marginTop: '15px', fontSize: '16px', backgroundColor: '#003366' }}>
                <Printer size={20} /> Cetak / Download PDF Sertifikat
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
