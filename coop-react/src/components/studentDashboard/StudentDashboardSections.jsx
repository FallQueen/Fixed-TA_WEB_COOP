import { useState } from 'react';
import {
  ArrowLeft,
  Award,
  BarChart2,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckCheck,
  CheckCircle,
  ChevronRight,
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
  Mail,
  Map,
  MapPin,
  Phone,
  Printer,
  RefreshCw,
  Save,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
  UploadCloud,
  User,
  UserRound,
  XCircle,
} from 'lucide-react';
import {
  ADMIN_COOP_CONTACT,
  MIN_INTERNSHIP_WORKING_DAYS,
  calculateWorkingDays,
  getNextDateValue,
  getPlacementId,
  getMinimumInternshipEndDate,
} from '../constants';
import { getFeedbackApi } from '../adminDashboard/hooks/useAdminFeedback';

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

const ACTIVE_INTERNAL_APPLICATION_STATUSES = ['pending', 'reviewed', 'accepted'];
const WITHDRAWABLE_APPLICATION_STATUSES = ['pending', 'reviewed'];

const getApplicationStatusLabel = (status) => {
  switch (status) {
    case 'pending':
      return 'Menunggu Tindakan Admin';
    case 'reviewed':
      return 'Sedang Diproses';
    case 'accepted':
      return 'Diterima Perusahaan';
    case 'withdrawn':
      return 'Ditarik Mahasiswa';
    case 'rejected':
      return 'Ditolak Perusahaan';
    default:
      return status || '-';
  }
};

const getApplicationStatusStyle = (status) => {
  if (status === 'pending') return { backgroundColor: '#fff7ed', color: '#9a3412' };
  if (status === 'reviewed') return { backgroundColor: '#fff7ed', color: '#9a3412' };
  if (status === 'accepted') return { backgroundColor: '#dcfce7', color: '#166534' };
  if (status === 'withdrawn') return { backgroundColor: '#f1f5f9', color: '#475569' };
  if (status === 'rejected') return { backgroundColor: '#fee2e2', color: '#991b1b' };
  return { backgroundColor: '#f1f5f9', color: '#475569' };
};

const formatNotificationTime = (value) =>
  new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatPlacementDate = (value) => {
  if (!value) return '-';
  const parsedDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const getPlacementDurationText = (placement) => {
  if (!placement?.start_date || !placement?.end_date) {
    return '-';
  }

  const workingDays = calculateWorkingDays(placement.start_date, placement.end_date);

  return workingDays > 0 ? `${workingDays} hari kerja` : '-';
};

const getVacancyContact = (vacancy) => ({
  name: String(vacancy?.supervisor_name || '').trim() || ADMIN_COOP_CONTACT.name,
  email: String(vacancy?.supervisor_email || '').trim() || ADMIN_COOP_CONTACT.email,
  phone: String(vacancy?.supervisor_phone || '').trim() || ADMIN_COOP_CONTACT.phone,
});

const getNotificationMeta = (notificationType) => {
  switch (notificationType) {
    case 'certificate':
      return { icon: Award, label: 'Sertifikat', color: '#047857', tint: '#ecfdf5', border: '#a7f3d0' };
    case 'reminder':
      return { icon: Clock, label: 'Pengingat', color: '#b45309', tint: '#fffbeb', border: '#fde68a' };
    case 'application':
      return { icon: Briefcase, label: 'Lamaran', color: '#0369a1', tint: '#f0f9ff', border: '#bae6fd' };
    case 'vacancy':
      return { icon: Building2, label: 'Lowongan', color: '#4338ca', tint: '#eef2ff', border: '#c7d2fe' };
    case 'account':
      return { icon: UserRound, label: 'Akun', color: '#7c3aed', tint: '#f5f3ff', border: '#ddd6fe' };
    default:
      return { icon: Bell, label: 'Informasi', color: '#1d4ed8', tint: '#eff6ff', border: '#bfdbfe' };
  }
};

const getNotificationTargetLabel = (targetTab) => ({
  profil: 'Buka Profil',
  lowongan: 'Buka Bursa',
  lapor: 'Buka Data Magang',
  lapor_mingguan: 'Buka Progress',
  laporan_bulanan: 'Buka Laporan Bulanan',
  laporan_uts: 'Buka Laporan UTS',
  laporan_akhir: 'Buka Laporan Akhir',
  sertifikat: 'Buka Sertifikat',
}[targetTab] || 'Buka Detail');

const OUTLOOK_WEB_URL = 'https://outlook.office.com/mail/';

const getNotificationExternalAction = (notification) => {
  if (notification.action_url) {
    return {
      label: notification.action_label || 'Buka Tautan',
      url: notification.action_url,
    };
  }

  const normalizedMessage = String(notification.message || '').toLowerCase();
  if (normalizedMessage.includes('buka email tersebut') || normalizedMessage.includes('cek email kampus')) {
    return {
      label: 'Buka Email Kampus',
      url: OUTLOOK_WEB_URL,
    };
  }

  return null;
};

export function ProfileTab({
  currentPlacement,
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

      {currentPlacement?.is_approved && (
        <div style={{ ...styles.card, marginBottom: '30px', borderTop: '4px solid #003366', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '14px', flexDirection: isMobile ? 'column' : 'row', marginBottom: '18px' }}>
            <div>
              <span style={{ display: 'block', color: '#94a3b8', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '5px' }}>Tempat Magang Aktif</span>
              <h3 style={{ margin: 0, color: '#003366', fontSize: isMobile ? '19px' : '22px', fontWeight: '900', lineHeight: 1.25 }}>
                {currentPlacement.company_name}
              </h3>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>{currentPlacement.position}</p>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '999px', backgroundColor: '#ecfdf5', color: '#047857', fontSize: '11px', fontWeight: '900', border: '1px solid #bbf7d0' }}>
              <CheckCircle size={13} /> Aktif Magang
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}><Calendar size={13} /> Tanggal Mulai</span>
              <strong style={{ display: 'block', marginTop: '7px', color: '#0f172a', fontSize: '14px' }}>{formatPlacementDate(currentPlacement.start_date)}</strong>
            </div>
            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}><Calendar size={13} /> Tanggal Selesai</span>
              <strong style={{ display: 'block', marginTop: '7px', color: '#0f172a', fontSize: '14px' }}>{formatPlacementDate(currentPlacement.end_date)}</strong>
            </div>
            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1d4ed8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}><Clock size={13} /> Durasi Magang</span>
              <strong style={{ display: 'block', marginTop: '7px', color: '#003366', fontSize: '14px' }}>{getPlacementDurationText(currentPlacement)}</strong>
            </div>
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
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '14px' : '30px', alignItems: 'start' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
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
  const [activeFilter, setActiveFilter] = useState('all');
  const unreadCount = notifications.filter((notification) => !notification.is_read).length;
  const readCount = notifications.length - unreadCount;
  const visibleNotifications = notifications.filter((notification) => {
    if (activeFilter === 'unread') return !notification.is_read;
    if (activeFilter === 'read') return notification.is_read;
    return true;
  });
  const filters = [
    { id: 'all', label: 'Semua', count: notifications.length },
    { id: 'unread', label: 'Belum Dibaca', count: unreadCount },
    { id: 'read', label: 'Sudah Dibaca', count: readCount },
  ];

  return (
    <div className="no-print">
      <div style={styles.heroBanner}>
        <h1 style={styles.heroTitle}>Pusat Notifikasi</h1>
        <p style={styles.heroSubtitle}>Pantau kabar terbaru dari Admin Unit Co-op dalam satu tempat.</p>
      </div>

      <div style={{ ...styles.card, marginBottom: isMobile ? '14px' : '20px', padding: isMobile ? '16px' : '22px 24px' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(2, max-content)', gap: '12px' }}>
            <div style={{ minWidth: isMobile ? 0 : '120px', paddingRight: isMobile ? 0 : '18px', borderRight: isMobile ? 'none' : '1px solid #e2e8f0' }}>
              <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>Total Pesan</div>
              <strong style={{ display: 'block', marginTop: '6px', color: '#0f172a', fontSize: '26px', lineHeight: 1 }}>{notifications.length}</strong>
            </div>
            <div style={{ minWidth: isMobile ? 0 : '130px' }}>
              <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>Perlu Dibaca</div>
              <strong style={{ display: 'block', marginTop: '6px', color: unreadCount > 0 ? '#b45309' : '#047857', fontSize: '26px', lineHeight: 1 }}>{unreadCount}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
            <button
              type="button"
              title="Tandai semua notifikasi sebagai dibaca"
              aria-label="Tandai semua notifikasi sebagai dibaca"
              onClick={handleMarkAllNotificationsRead}
              disabled={notifications.length === 0 || unreadCount === 0}
              className="btn-hover"
              style={{ ...styles.btnPrimary, backgroundColor: unreadCount === 0 ? '#e2e8f0' : '#003366', color: unreadCount === 0 ? '#94a3b8' : '#ffffff', width: isMobile ? '100%' : 'auto', cursor: unreadCount === 0 ? 'not-allowed' : 'pointer' }}
            >
              <CheckCheck size={16} /> Tandai Semua Dibaca
            </button>
            <button
              type="button"
              title="Hapus semua notifikasi"
              aria-label="Hapus semua notifikasi"
              onClick={handleDeleteAllNotifications}
              disabled={notifications.length === 0}
              className="btn-hover"
              style={{ width: '44px', minWidth: '44px', height: '42px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: notifications.length === 0 ? '#f8fafc' : '#fff1f2', color: notifications.length === 0 ? '#cbd5e1' : '#dc2626', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: notifications.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', overflowX: 'auto' }}>
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                style={{ border: `1px solid ${isActive ? '#bfdbfe' : '#e2e8f0'}`, borderRadius: '999px', padding: '8px 11px', backgroundColor: isActive ? '#eff6ff' : '#ffffff', color: isActive ? '#003366' : '#64748b', fontSize: '11px', lineHeight: 1, fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
              >
                {filter.label} <span style={{ marginLeft: '4px', opacity: 0.7 }}>{filter.count}</span>
              </button>
            );
          })}
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
      ) : visibleNotifications.length === 0 ? (
        <div style={{ ...styles.card, textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1' }}>
          <Bell size={38} color="#cbd5e1" style={{ marginBottom: '8px' }} />
          <h3 style={{ margin: '8px 0', color: '#003366', fontSize: '16px' }}>Tidak Ada Pesan pada Filter Ini</h3>
          <p style={{ margin: 0, fontSize: '13px' }}>Pilih filter lain untuk melihat notifikasi yang tersedia.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {visibleNotifications.map((notification) => {
            const notificationMeta = getNotificationMeta(notification.notification_type);
            const NotificationIcon = notificationMeta.icon;
            const externalAction = getNotificationExternalAction(notification);

            return (
              <div
                key={notification.id}
                style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '14px', padding: isMobile ? '16px' : '17px 18px', borderRadius: '10px', border: `1px solid ${notification.is_read ? '#e2e8f0' : notificationMeta.border}`, backgroundColor: notification.is_read ? '#ffffff' : '#fffefa', boxShadow: notification.is_read ? 'none' : '0 8px 18px rgba(15, 23, 42, 0.04)' }}
              >
                <div style={{ display: 'flex', gap: '13px', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: notificationMeta.color, backgroundColor: notificationMeta.tint, border: `1px solid ${notificationMeta.border}` }}>
                    <NotificationIcon size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                      <span style={{ color: notificationMeta.color, fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>{notificationMeta.label}</span>
                      {!notification.is_read && <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />}
                    </div>
                    <strong style={{ display: 'block', marginTop: '5px', color: '#0f172a', fontSize: '14px', lineHeight: 1.45 }}>{notification.title}</strong>
                    <p style={{ margin: '5px 0 0', color: '#64748b', lineHeight: 1.65, fontSize: '13px', whiteSpace: 'pre-line' }}>{notification.message}</p>
                    <p style={{ margin: '9px 0 0', color: '#94a3b8', fontSize: '11px', fontWeight: '600' }}>{formatNotificationTime(notification.created_at)}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: isMobile ? 'stretch' : 'center', gap: '7px', paddingLeft: 0, flexWrap: isMobile ? 'wrap' : 'nowrap', width: isMobile ? '100%' : 'auto' }}>
                  {externalAction ? (
                    <a
                      href={externalAction.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (!notification.is_read) handleMarkNotificationRead(notification.id);
                      }}
                      className="btn-hover"
                      style={{ ...styles.btnPrimary, padding: '10px 12px', backgroundColor: '#003366', width: isMobile ? '100%' : 'auto', flex: isMobile ? '1 0 100%' : '0 0 auto', fontSize: '12px', whiteSpace: 'nowrap', textDecoration: 'none' }}
                    >
                      {externalAction.label} <ExternalLink size={14} />
                    </a>
                  ) : notification.target_tab && (
                    <button
                      type="button"
                      onClick={() => handleOpenNotification(notification)}
                      className="btn-hover"
                      style={{ ...styles.btnPrimary, padding: '10px 12px', backgroundColor: '#003366', width: isMobile ? '100%' : 'auto', flex: isMobile ? '1 0 100%' : '0 0 auto', fontSize: '12px', whiteSpace: 'nowrap' }}
                    >
                      {getNotificationTargetLabel(notification.target_tab)} <ChevronRight size={15} />
                    </button>
                  )}
                  {!notification.is_read && (
                    <button
                      type="button"
                      title="Tandai sebagai dibaca"
                      aria-label="Tandai sebagai dibaca"
                      onClick={() => handleMarkNotificationRead(notification.id)}
                      className="btn-hover"
                      style={{ width: isMobile ? 'auto' : '38px', flex: isMobile ? '1 1 0' : '0 0 auto', height: '38px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Hapus notifikasi"
                    aria-label="Hapus notifikasi"
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="btn-hover"
                    style={{ width: isMobile ? 'auto' : '38px', flex: isMobile ? '1 1 0' : '0 0 auto', height: '38px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fff1f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function VacanciesTab({
  handleWithdrawApplication,
  hasAnyPlacement,
  isMobile,
  loadingVacancies,
  setSelectedVacancy,
  studentApplications = [],
  styles,
  vacancies,
}) {
  const [withdrawModal, setWithdrawModal] = useState({
    application: null,
    reason: '',
    error: '',
    submitting: false,
  });
  const [withdrawFeedback, setWithdrawFeedback] = useState(null);
  const visibleApplications = studentApplications.filter((application) => !application.is_archived_by_admin);
  const getVacancyForApplication = (application) => {
    if (application.vacancy?.id) return application.vacancy;
    return vacancies.find((vacancy) => String(vacancy.id) === String(application.vacancy));
  };
  const selectedWithdrawalVacancy = withdrawModal.application
    ? getVacancyForApplication(withdrawModal.application)
    : null;
  const closeWithdrawModal = () => {
    if (withdrawModal.submitting) return;
    setWithdrawModal({ application: null, reason: '', error: '', submitting: false });
  };
  const openWithdrawModal = (application) => {
    setWithdrawFeedback(null);
    setWithdrawModal({ application, reason: '', error: '', submitting: false });
  };
  const submitWithdrawApplication = async (event) => {
    event.preventDefault();

    const withdrawalReason = withdrawModal.reason.trim();
    if (!withdrawalReason) {
      setWithdrawModal((current) => ({ ...current, error: 'Alasan menarik lamaran wajib diisi.' }));
      return;
    }

    setWithdrawModal((current) => ({ ...current, error: '', submitting: true }));
    const result = await handleWithdrawApplication(withdrawModal.application, withdrawalReason);

    if (result?.ok) {
      setWithdrawModal({ application: null, reason: '', error: '', submitting: false });
      setWithdrawFeedback({ type: 'success', message: result.message });
      return;
    }

    setWithdrawModal((current) => ({
      ...current,
      error: result?.message || 'Gagal menarik lamaran. Silakan coba lagi.',
      submitting: false,
    }));
  };

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
      {visibleApplications.length > 0 && (
        <div style={{ ...styles.card, marginBottom: isMobile ? '14px' : '24px' }}>
          <h3 style={{ margin: '0 0 14px 0', color: '#003366', fontSize: isMobile ? '16px' : '18px', lineHeight: 1.3, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={18} /> Lamaran Internal Saya
          </h3>
          {withdrawFeedback && (
            <div style={{ marginBottom: '14px', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${withdrawFeedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`, backgroundColor: withdrawFeedback.type === 'success' ? '#f0fdf4' : '#fef2f2', color: withdrawFeedback.type === 'success' ? '#166534' : '#991b1b', fontSize: '13px', fontWeight: '700', lineHeight: '1.5' }}>
              {withdrawFeedback.message}
            </div>
          )}
          <div style={{ display: 'grid', gap: '12px' }}>
            {visibleApplications.map((application) => {
              const vacancy = getVacancyForApplication(application);
              const statusStyle = getApplicationStatusStyle(application.status);
              const canWithdraw = WITHDRAWABLE_APPLICATION_STATUSES.includes(application.status);

              return (
                <div key={application.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: isMobile ? '13px' : '14px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '14px', fontWeight: '800' }}>
                        {vacancy?.title || 'Lowongan tidak ditemukan'}
                      </h4>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: '700' }}>
                        {vacancy?.company_name || '-'} - Apply {new Date(application.applied_at).toLocaleDateString('id-ID')}
                      </p>
                      <p style={{ margin: '5px 0 0', color: '#94a3b8', fontSize: '11px', fontWeight: '800' }}>
                        Periode: {application.internship_start_date || '-'} - {application.internship_end_date || '-'}
                      </p>
                    </div>
                    <span style={{ ...statusStyle, display: 'inline-flex', alignItems: 'center', borderRadius: '999px', padding: '6px 10px', fontSize: '11px', fontWeight: '800' }}>
                      {getApplicationStatusLabel(application.status)}
                    </span>
                  </div>
                  {application.status === 'withdrawn' && application.withdrawal_reason && (
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px', lineHeight: '1.6' }}>
                      Alasan ditarik: {application.withdrawal_reason}
                    </p>
                  )}
                  {canWithdraw && (
                    <button
                      type="button"
                      className="btn-hover"
                      onClick={() => openWithdrawModal(application)}
                      style={{ ...styles.btnPrimary, backgroundColor: '#fff', color: '#991b1b', border: '1px solid #fecaca', width: isMobile ? '100%' : 'fit-content' }}
                    >
                      <XCircle size={16} /> Tarik Lamaran
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {loadingVacancies ? (
        <div style={{ textAlign: 'center', padding: isMobile ? '36px 18px' : '60px', color: '#64748b' }}>
          <Loader2 size={40} className="animate-spin" style={{ marginBottom: '10px', color: '#003366' }} />
          <p>Memuat daftar peluang magang...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: isMobile ? '14px' : '24px' }}>
          {vacancies.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: isMobile ? '34px 18px' : '60px', backgroundColor: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <Inbox size={48} color="#94a3b8" style={{ marginBottom: '15px' }} />
              <h3 style={{ margin: '0 0 5px 0', color: '#003366' }}>Belum Ada Lowongan</h3>
              <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Tim admin sedang menyiapkan peluang terbaik untuk Anda. Cek kembali nanti!</p>
            </div>
          ) : vacancies.map((job) => {
            const contact = getVacancyContact(job);

            return (
            <div key={job.id} className="job-card" style={{ opacity: hasAnyPlacement ? 0.6 : 1 }}>
              <div className="job-card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: '#e6f0fa', color: '#003366', fontSize: '11px', fontWeight: '700', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <Sparkles size={12} /> OPEN INTERNSHIP
                  </span>
                </div>
                <h3 style={{ margin: '0 0 8px 0', color: '#003366', fontSize: isMobile ? '18px' : '20px', lineHeight: '1.3', fontWeight: '700', overflowWrap: 'anywhere' }}>{job.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '14px', fontWeight: '500' }}>
                  <Building2 size={16} /> <span>{job.company_name}</span>
                </div>
              </div>
              <div className="job-card-body">
                <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748b', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{job.description}</p>
                <div style={{ marginBottom: '18px', padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'grid', gap: '6px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Kontak Lowongan</span>
                  <strong style={{ color: '#003366', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><UserRound size={13} /> {contact.name}</strong>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', overflowWrap: 'anywhere' }}><Mail size={13} /> {contact.email}</span>
                  <span style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={13} /> {contact.phone}</span>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginTop: 'auto' }}>
                  <button className="btn-hover" onClick={() => setSelectedVacancy(job)} style={{ width: '100%', padding: '12px', backgroundColor: '#fff', color: '#003366', border: '2px solid #003366', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: '0.2s', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onMouseOver={(e) => { e.target.style.backgroundColor = '#003366'; e.target.style.color = '#fff'; }} onMouseOut={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.color = '#003366'; }}>
                    <Eye size={16} /> Lihat Detail Pekerjaan
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
      {withdrawModal.application && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '560px' }}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, color: '#003366', fontSize: '18px', fontWeight: '800' }}>Tarik Lamaran Internal</h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '12px', fontWeight: '600' }}>
                  {selectedWithdrawalVacancy?.title || 'Lowongan internal'} - {selectedWithdrawalVacancy?.company_name || 'Perusahaan mitra'}
                </p>
              </div>
              <button type="button" onClick={closeWithdrawModal} style={styles.closeBtn} disabled={withdrawModal.submitting}>
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={submitWithdrawApplication}>
              <div style={{ padding: isMobile ? '18px' : '24px', backgroundColor: '#f8fafc' }}>
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', fontSize: '13px', lineHeight: '1.6', fontWeight: '700', marginBottom: '16px' }}>
                  Setelah ditarik, lamaran ini tidak lagi diproses admin/HRD. Tulis alasan yang jelas supaya admin punya catatan prosesnya.
                </div>
                <label style={{ ...styles.labelStyle, color: '#003366' }}>Alasan Penarikan Lamaran</label>
                <textarea
                  autoFocus
                  rows="5"
                  value={withdrawModal.reason}
                  onChange={(event) => setWithdrawModal((current) => ({ ...current, reason: event.target.value, error: '' }))}
                  placeholder="Contoh: Saya sudah diterima magang di perusahaan luar bursa Co-op."
                  className="input-focus"
                  style={{ ...styles.inputStyle, backgroundColor: '#fff', resize: 'vertical' }}
                  disabled={withdrawModal.submitting}
                />
                {withdrawModal.error && (
                  <div style={{ marginTop: '12px', padding: '12px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '13px', fontWeight: '700' }}>
                    {withdrawModal.error}
                  </div>
                )}
              </div>
              <div style={{ padding: isMobile ? '16px 18px' : '18px 24px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap', backgroundColor: 'white', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  className="btn-hover"
                  onClick={closeWithdrawModal}
                  disabled={withdrawModal.submitting}
                  style={{ ...styles.btnPrimary, backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-hover"
                  disabled={withdrawModal.submitting}
                  style={{ ...styles.btnPrimary, backgroundColor: withdrawModal.submitting ? '#94a3b8' : '#991b1b', color: '#fff' }}
                >
                  {withdrawModal.submitting ? <><Loader2 size={16} className="animate-spin" /> Memproses...</> : <><XCircle size={16} /> Tarik Lamaran</>}
                </button>
              </div>
            </form>
          </div>
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
  feedback,
}) {
  const { showAlert } = getFeedbackApi(feedback);
  if (!selectedVacancy) return null;

  const hasCv = Boolean(userData?.cv_file);
  const hasPortfolio = Boolean(userData?.portofolio_file);
  const missingRequiredDocuments = !hasCv;
  const todayInput = new Date().toISOString().split('T')[0];
  const minimumApplicationEndDate = getMinimumInternshipEndDate(applicationForm.internship_start_date);
  const selectedApplicationWorkingDays = calculateWorkingDays(
    applicationForm.internship_start_date,
    applicationForm.internship_end_date
  );
  const isInternalApplicationPeriodIncomplete = !applicationForm.internship_start_date || !applicationForm.internship_end_date;
  const isInternalApplicationDurationInvalid = Boolean(
    applicationForm.internship_start_date
    && applicationForm.internship_end_date
    && selectedApplicationWorkingDays < MIN_INTERNSHIP_WORKING_DAYS
  );
  const isApplyDisabled = submittingApplication
    || hasAnyPlacement
    || missingRequiredDocuments
    || (isApplying && (isInternalApplicationPeriodIncomplete || isInternalApplicationDurationInvalid));
  const vacancyContact = getVacancyContact(selectedVacancy);

  const handleProceedToApply = () => {
    if (!hasCv) {
      showAlert({
        type: 'warning',
        title: 'CV Belum Diunggah',
        message: 'Sebelum lanjut melamar, lengkapi CV terlebih dahulu di tab Profil. Portofolio juga disarankan jika kamu punya.',
      });
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
              <div style={{ marginBottom: isMobile ? '18px' : '25px', padding: isMobile ? '14px' : '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h4 style={{ color: '#003366', margin: '0 0 12px 0', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}><UserRound size={17} /> Kontak Lowongan</h4>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
                  <div>
                    <span style={{ display: 'block', color: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Nama</span>
                    <strong style={{ display: 'block', marginTop: '5px', color: '#334155', fontSize: '13px' }}>{vacancyContact.name}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Email</span>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', color: '#334155', fontSize: '13px', overflowWrap: 'anywhere' }}><Mail size={14} /> {vacancyContact.email}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>WhatsApp</span>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', color: '#334155', fontSize: '13px' }}><Phone size={14} /> {vacancyContact.phone}</strong>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: isMobile ? '18px' : '25px' }}>
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
              <div style={{ backgroundColor: '#fff', padding: isMobile ? '16px' : '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: isMobile ? '14px' : '20px' }}>
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
              <div style={{ backgroundColor: '#fff', padding: isMobile ? '16px' : '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: isMobile ? '14px' : '20px' }}>
                <label style={{ ...styles.labelStyle, fontSize: '14px', color: '#003366', display: 'flex', alignItems: 'center', gap: '7px' }}><Calendar size={16} /> Rencana Periode Magang</label>
                <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
                  Isi periode magang yang diajukan ke perusahaan. Sistem menghitung minimal {MIN_INTERNSHIP_WORKING_DAYS} hari kerja.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={styles.labelStyle}>Tanggal Mulai</label>
                    <input
                      type="date"
                      required
                      min={todayInput}
                      value={applicationForm.internship_start_date}
                      onChange={(event) => {
                        const nextStartDate = event.target.value;
                        const nextMinimumEndDate = getMinimumInternshipEndDate(nextStartDate);
                        const shouldResetEndDate = applicationForm.internship_end_date
                          && nextMinimumEndDate
                          && applicationForm.internship_end_date < nextMinimumEndDate;

                        setApplicationForm({
                          ...applicationForm,
                          internship_start_date: nextStartDate,
                          internship_end_date: shouldResetEndDate ? '' : applicationForm.internship_end_date,
                        });
                      }}
                      className="input-focus"
                      style={styles.inputStyle}
                    />
                  </div>
                  <div>
                    <label style={styles.labelStyle}>Tanggal Selesai</label>
                    <input
                      type="date"
                      required
                      min={minimumApplicationEndDate || applicationForm.internship_start_date || todayInput}
                      value={applicationForm.internship_end_date}
                      onChange={(event) => setApplicationForm({ ...applicationForm, internship_end_date: event.target.value })}
                      className="input-focus"
                      style={styles.inputStyle}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '12px', padding: '12px 14px', borderRadius: '8px', border: isInternalApplicationDurationInvalid ? '1px solid #fecaca' : '1px solid #bfdbfe', backgroundColor: isInternalApplicationDurationInvalid ? '#fef2f2' : '#eff6ff', color: isInternalApplicationDurationInvalid ? '#991b1b' : '#1d4ed8', fontSize: '12px', lineHeight: '1.5', fontWeight: '700' }}>
                  {applicationForm.internship_start_date && minimumApplicationEndDate
                    ? `Tanggal selesai paling cepat: ${minimumApplicationEndDate}.`
                    : 'Pilih tanggal mulai untuk melihat batas tanggal selesai.'}
                  {applicationForm.internship_start_date && applicationForm.internship_end_date
                    ? ` Durasi pilihan saat ini: ${selectedApplicationWorkingDays} hari kerja.`
                    : ''}
                </div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: isMobile ? '16px' : '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
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
              <button type="button" className="btn-hover" onClick={closeModal} style={{ ...styles.btnPrimary, backgroundColor: '#f1f5f9', color: '#475569', padding: '12px 20px', border: '1px solid #cbd5e1', order: isMobile ? 2 : 0 }}>Batal</button>
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
                  title={missingRequiredDocuments ? 'Upload CV di tab Profil terlebih dahulu' : undefined}
                  style={{ ...styles.btnPrimary, padding: '12px 30px', fontSize: '15px', backgroundColor: isApplyDisabled ? '#94a3b8' : '#003366', color: '#ffffff', cursor: isApplyDisabled ? 'not-allowed' : 'pointer', boxShadow: isApplyDisabled ? 'none' : undefined, opacity: isApplyDisabled ? 0.75 : 1 }}
                >
                  {hasAnyPlacement ? <><Lock size={16} /> Terkunci (Sudah Magang)</> : missingRequiredDocuments ? <><Lock size={16} /> Lengkapi CV Dulu</> : <><Send size={16} /> Lanjut Lamar</>}
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
  handleRequestSupervisorChange,
  hasApprovedPlacement,
  hasPendingPlacement,
  isMobile,
  placementForm,
  setAcceptanceLetter,
  setPlacementForm,
  styles,
  studentApplications = [],
  submittingPlacement,
  vacancies = [],
  onOpenVacanciesTab,
  feedback,
}) {
  const { showAlert } = getFeedbackApi(feedback);
  const [supervisorChangeModal, setSupervisorChangeModal] = useState({
    isOpen: false,
    supervisor_name: '',
    supervisor_email: '',
    supervisor_phone: '',
    reason: '',
  });
  const [submittingSupervisorChange, setSubmittingSupervisorChange] = useState(false);
  const activeInternalApplications = studentApplications.filter((application) =>
    !application.is_archived_by_admin
    && ACTIVE_INTERNAL_APPLICATION_STATUSES.includes(application.status)
  );
  const hasActiveInternalApplications = activeInternalApplications.length > 0;
  const hasAcceptedInternalApplication = activeInternalApplications.some(
    (application) => application.status === 'accepted'
  );
  const isTransferFlow = Boolean(hasApprovedPlacement && currentPlacement);
  const transferMinimumStartDate = isTransferFlow
    ? getNextDateValue(placementForm.previous_placement_end_date)
    : '';
  const previousPlacementWorkingDays = isTransferFlow
    ? calculateWorkingDays(currentPlacement.start_date, placementForm.previous_placement_end_date)
    : 0;
  const requiredNewWorkingDays = isTransferFlow && placementForm.previous_placement_end_date
    ? Math.max(MIN_INTERNSHIP_WORKING_DAYS - previousPlacementWorkingDays, 1)
    : MIN_INTERNSHIP_WORKING_DAYS;
  const minimumEndDate = getMinimumInternshipEndDate(placementForm.start_date, requiredNewWorkingDays);
  const selectedWorkingDays = calculateWorkingDays(placementForm.start_date, placementForm.end_date);
  const accumulatedTransferWorkingDays = previousPlacementWorkingDays + selectedWorkingDays;
  const showDurationWarning = placementForm.start_date
    && placementForm.end_date
    && (
      isTransferFlow
        ? accumulatedTransferWorkingDays < MIN_INTERNSHIP_WORKING_DAYS
        : selectedWorkingDays < MIN_INTERNSHIP_WORKING_DAYS
    );
  const showTransferOverlapWarning = isTransferFlow
    && placementForm.previous_placement_end_date
    && placementForm.start_date
    && placementForm.start_date <= placementForm.previous_placement_end_date;
  const supervisorChangePending = currentPlacement?.supervisor_change_status === 'pending';
  const supervisorChangeRejected = currentPlacement?.supervisor_change_status === 'rejected';
  const isPlacementSubmitDisabled = submittingPlacement || hasActiveInternalApplications;
  const placementSubmitStyle = {
    ...styles.btnPrimary,
    width: '100%',
    marginTop: '30px',
    padding: '16px 22px',
    minHeight: '56px',
    fontSize: '16px',
    borderRadius: '12px',
    background: hasActiveInternalApplications
      ? '#94a3b8'
      : hasApprovedPlacement
        ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
        : 'linear-gradient(135deg, #003366 0%, #004a8f 100%)',
    color: '#ffffff',
    fontWeight: '800',
    cursor: isPlacementSubmitDisabled ? 'not-allowed' : 'pointer',
    boxShadow: hasActiveInternalApplications
      ? 'none'
      : hasApprovedPlacement
        ? '0 12px 24px rgba(220, 38, 38, 0.24)'
        : '0 12px 24px rgba(0, 51, 102, 0.24)',
    opacity: submittingPlacement ? 0.78 : 1,
    letterSpacing: '0.01em',
  };

  const openSupervisorChangeModal = () => {
    setSupervisorChangeModal({
      isOpen: true,
      supervisor_name: currentPlacement?.supervisor_name || '',
      supervisor_email: currentPlacement?.supervisor_email || '',
      supervisor_phone: currentPlacement?.supervisor_phone || '',
      reason: '',
    });
  };

  const closeSupervisorChangeModal = () => {
    if (submittingSupervisorChange) return;
    setSupervisorChangeModal((current) => ({ ...current, isOpen: false }));
  };

  const submitSupervisorChange = async (event) => {
    event.preventDefault();
    setSubmittingSupervisorChange(true);

    const success = await handleRequestSupervisorChange(currentPlacement.id, {
      supervisor_name: supervisorChangeModal.supervisor_name,
      supervisor_email: supervisorChangeModal.supervisor_email,
      supervisor_phone: supervisorChangeModal.supervisor_phone,
      reason: supervisorChangeModal.reason,
    });

    setSubmittingSupervisorChange(false);
    if (success) {
      setSupervisorChangeModal((current) => ({ ...current, isOpen: false }));
    }
  };

  const handlePreviousPlacementEndDateChange = (event) => {
    const previousEndDate = event.target.value;
    const newMinimumStartDate = getNextDateValue(previousEndDate);
    const shouldResetStartDate = placementForm.start_date
      && newMinimumStartDate
      && placementForm.start_date < newMinimumStartDate;

    setPlacementForm({
      ...placementForm,
      previous_placement_end_date: previousEndDate,
      start_date: shouldResetStartDate ? '' : placementForm.start_date,
      end_date: shouldResetStartDate ? '' : placementForm.end_date,
    });
  };

  const handleStartDateChange = (event) => {
    const startDate = event.target.value;
    const newMinimumEndDate = getMinimumInternshipEndDate(startDate);
    const shouldResetEndDate = placementForm.end_date
      && newMinimumEndDate
      && placementForm.end_date < newMinimumEndDate;

    setPlacementForm({
      ...placementForm,
      start_date: startDate,
      end_date: shouldResetEndDate ? '' : placementForm.end_date,
    });
  };
  const handlePlacementFormSubmit = (event) => {
    if (hasActiveInternalApplications) {
      event.preventDefault();
      showAlert({
        type: 'warning',
        title: 'Lamaran Internal Masih Berjalan',
        message: 'Tarik dulu semua lamaran internal yang masih berjalan di tab Bursa Magang sebelum mengajukan tempat magang luar.',
      });
      return;
    }

    handlePlacementSubmit(event, acceptanceLetter, placementForm);
  };

  return (
    <div className="no-print">
      <div style={{ maxWidth: isMobile ? '100%' : '1120px', margin: '0 auto' }}>
        <div style={styles.heroBanner}>
          <h1 style={styles.heroTitle}>{hasApprovedPlacement ? 'Pengajuan Pindah Tempat Magang' : 'Input Data Magang'}</h1>
          <p style={styles.heroSubtitle}>{hasApprovedPlacement ? 'Gunakan form ini HANYA jika Anda ingin pindah tempat kerja. Data magang saat ini akan diarsipkan.' : 'Daftarkan tempat magang yang Anda dapatkan di luar bursa resmi kami.'}</p>
        </div>
        <div style={styles.card}>
        {hasApprovedPlacement && currentPlacement && (
          <div style={{ marginBottom: '24px', border: '1px solid #bfdbfe', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
            <div style={{ padding: isMobile ? '14px' : '15px 17px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', gap: '14px', backgroundColor: '#eff6ff', borderBottom: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                  <UserRound size={19} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#0f172a', fontSize: '15px', fontWeight: '800' }}>Kontak Supervisor Aktif</h3>
                  <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: '12px', lineHeight: 1.45 }}>Ajukan koreksi jika pembimbing lapangan atau email tujuan evaluasi berubah.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={openSupervisorChangeModal}
                disabled={supervisorChangePending}
                className="btn-hover"
                style={{ ...styles.btnPrimary, padding: '10px 13px', backgroundColor: supervisorChangePending ? '#cbd5e1' : '#003366', cursor: supervisorChangePending ? 'not-allowed' : 'pointer', fontSize: '12px', width: isMobile ? '100%' : 'auto' }}
              >
                <Edit size={14} /> {supervisorChangeRejected ? 'Perbaiki Pengajuan' : 'Ajukan Perubahan'}
              </button>
            </div>
            <div style={{ padding: isMobile ? '14px' : '15px 17px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(190px, 1fr))', gap: '13px' }}>
              <div>
                <span style={{ display: 'block', color: '#94a3b8', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>Nama Supervisor</span>
                <strong style={{ display: 'block', marginTop: '5px', color: '#334155', fontSize: '13px' }}>{currentPlacement.supervisor_name}</strong>
              </div>
              <div>
                <span style={{ display: 'block', color: '#94a3b8', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>Email Evaluasi</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', color: '#334155', fontSize: '13px', overflowWrap: 'anywhere' }}><Mail size={14} /> {currentPlacement.supervisor_email}</strong>
              </div>
              <div>
                <span style={{ display: 'block', color: '#94a3b8', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>WhatsApp</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', color: '#334155', fontSize: '13px' }}><Phone size={14} /> {currentPlacement.supervisor_phone || '-'}</strong>
              </div>
            </div>
            {supervisorChangePending && (
              <div style={{ margin: '0 17px 15px', padding: '12px 13px', borderRadius: '8px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '12px', lineHeight: 1.6 }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}><Clock size={14} /> Menunggu persetujuan admin</strong>
                Data usulan: {currentPlacement.pending_supervisor_name} ({currentPlacement.pending_supervisor_email}).
              </div>
            )}
            {supervisorChangeRejected && (
              <div style={{ margin: '0 17px 15px', padding: '12px 13px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '12px', lineHeight: 1.6 }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}><XCircle size={14} /> Pengajuan perlu diperbaiki</strong>
                {currentPlacement.supervisor_change_rejection_reason}
              </div>
            )}
          </div>
        )}
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
              <p style={{ margin: 0, color: '#991b1b', fontSize: '13px' }}>Status Anda saat ini <strong>Aktif Magang</strong> di {currentPlacement?.company_name}. Jika pengajuan disetujui admin, sistem akan <strong>menutup tempat lama</strong> sesuai tanggal terakhir bekerja dan menjadikan tempat baru sebagai pengajuan aktif.</p>
            </div>
          </div>
        )}
        <form onSubmit={handlePlacementFormSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginBottom: '22px' }}>
            {[
              { number: '01', label: 'Data Perusahaan', icon: Building2 },
              { number: '02', label: 'Kontak Supervisor', icon: UserRound },
              { number: '03', label: 'Bukti Penerimaan', icon: FileCheck },
            ].map((step) => {
              const StepIcon = step.icon;

              return (
                <div key={step.number} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#003366', backgroundColor: '#e6f0fa' }}><StepIcon size={15} /></div>
                  <div>
                    <span style={{ display: 'block', color: '#94a3b8', fontSize: '9px', fontWeight: '800' }}>LANGKAH {step.number}</span>
                    <strong style={{ display: 'block', marginTop: '3px', color: '#334155', fontSize: '11px' }}>{step.label}</strong>
                  </div>
                </div>
              );
            })}
          </div>
          {activeInternalApplications.length > 0 && (
            <div style={{ marginBottom: '26px', overflow: 'hidden', borderRadius: isMobile ? '14px' : '18px', border: '1px solid #fed7aa', backgroundColor: '#fff7ed', boxShadow: '0 18px 40px rgba(154, 52, 18, 0.10)' }}>
              <div style={{ padding: isMobile ? '16px' : '18px 20px', display: 'flex', alignItems: 'flex-start', gap: '14px', borderBottom: '1px solid #fed7aa', background: 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '14px', backgroundColor: '#ffedd5', border: '1px solid #fdba74', color: '#9a3412', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldAlert size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0, color: '#9a3412', fontSize: '16px', fontWeight: '900' }}>Lamaran Internal Masih Berjalan</h4>
                    <span style={{ padding: '6px 10px', borderRadius: '999px', backgroundColor: '#ffffff', border: '1px solid #fed7aa', color: '#9a3412', fontSize: '11px', fontWeight: '900', whiteSpace: 'nowrap' }}>
                      {activeInternalApplications.length} lamaran aktif
                    </span>
                  </div>
                  <p style={{ margin: '8px 0 0', color: '#9a3412', fontSize: '13px', lineHeight: '1.65' }}>
                    Selesaikan dulu lamaran dari bursa internal sebelum mengajukan magang luar, supaya data pelamaran dan data tempat magang tidak bertabrakan.
                    {hasAcceptedInternalApplication ? ' Karena ada lamaran yang sudah diterima perusahaan, tulis alasan penarikan dengan jelas.' : ''}
                  </p>
                </div>
              </div>
              <div style={{ padding: isMobile ? '16px' : '18px 20px', display: 'grid', gap: '14px' }}>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {activeInternalApplications.map((application) => {
                    const vacancy = application.vacancy?.id
                      ? application.vacancy
                      : vacancies.find((item) => String(item.id) === String(application.vacancy));
                    const statusStyle = getApplicationStatusStyle(application.status);

                    return (
                      <div key={application.id} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '10px', padding: '13px 14px', borderRadius: '13px', backgroundColor: '#ffffff', border: '1px solid #fed7aa' }}>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ display: 'block', color: '#0f172a', fontSize: '13px', fontWeight: '900', marginBottom: '4px' }}>
                            {vacancy?.title || 'Lowongan internal'}
                          </strong>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9a3412', fontSize: '12px', fontWeight: '700' }}>
                            <Building2 size={14} /> {vacancy?.company_name || 'Perusahaan mitra'}
                          </span>
                        </div>
                        <span style={{ ...statusStyle, display: 'inline-flex', alignItems: 'center', borderRadius: '999px', padding: '6px 10px', fontSize: '11px', fontWeight: '900', whiteSpace: 'nowrap' }}>
                          {getApplicationStatusLabel(application.status)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', paddingTop: '2px' }}>
                  <p style={{ margin: 0, color: '#9a3412', fontSize: '12px', lineHeight: '1.55', fontWeight: '700', maxWidth: '560px' }}>
                    Klik tombol di samping, pilih lamaran yang ingin ditarik, lalu isi alasan penarikan di modal website.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenVacanciesTab}
                    className="btn-hover"
                    style={{ ...styles.btnPrimary, backgroundColor: '#F2A900', color: '#003366', boxShadow: '0 10px 20px rgba(242, 169, 0, 0.25)', width: isMobile ? '100%' : 'auto' }}
                  >
                    <Briefcase size={16} /> Buka Bursa Magang
                  </button>
                </div>
              </div>
            </div>
          )}
          {isTransferFlow && (
            <div style={{ marginBottom: '24px', padding: '18px', borderRadius: '12px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#9a3412', fontSize: '15px', fontWeight: '800' }}>Data Pindah Tempat Magang</h4>
              <p style={{ margin: '0 0 14px 0', color: '#9a3412', fontSize: '13px', lineHeight: '1.6' }}>
                Tempat lama: <strong>{currentPlacement.company_name}</strong> ({currentPlacement.start_date} s/d {currentPlacement.end_date}). Tanggal mulai tempat baru harus setelah tanggal terakhir bekerja di tempat lama.
              </p>
              <div style={styles.grid2}>
                <div>
                  <label style={{ ...styles.labelStyle, color: '#9a3412' }}>Tanggal Terakhir Bekerja di Tempat Lama</label>
                  <input
                    type="date"
                    name="previous_placement_end_date"
                    required
                    min={currentPlacement.start_date || undefined}
                    max={currentPlacement.end_date || undefined}
                    value={placementForm.previous_placement_end_date}
                    onChange={handlePreviousPlacementEndDateChange}
                    className="input-focus"
                    style={{ ...styles.inputStyle, backgroundColor: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ ...styles.labelStyle, color: '#9a3412' }}>Alasan Pindah Tempat Magang</label>
                  <textarea
                    name="transfer_reason"
                    rows="3"
                    required
                    value={placementForm.transfer_reason}
                    onChange={(e) => setPlacementForm({ ...placementForm, transfer_reason: e.target.value })}
                    placeholder="Contoh: Perusahaan lama menghentikan program magang, lalu saya diterima di perusahaan baru."
                    className="input-focus"
                    style={{ ...styles.inputStyle, backgroundColor: '#fff', resize: 'vertical' }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '12px', color: showTransferOverlapWarning ? '#991b1b' : '#9a3412', fontSize: '12px', lineHeight: '1.5', fontWeight: '700' }}>
                {transferMinimumStartDate
                  ? `Tanggal mulai tempat baru paling cepat: ${transferMinimumStartDate}.`
                  : 'Isi tanggal terakhir bekerja untuk membuka batas tanggal mulai tempat baru.'}
                {placementForm.previous_placement_end_date ? ` Durasi tempat lama yang diakui: ${previousPlacementWorkingDays} hari kerja. Sisa minimal tempat baru: ${requiredNewWorkingDays} hari kerja.` : ''}
                {showTransferOverlapWarning ? ' Tanggal mulai yang dipilih masih overlap dengan tempat lama.' : ''}
              </div>
            </div>
          )}
          <h4 style={styles.sectionTitle}>1. Data Perusahaan & Posisi</h4>
          <div style={styles.grid2}>
            <div><label style={styles.labelStyle}>Nama Perusahaan</label><input type="text" name="company_name" required value={placementForm.company_name} onChange={(e) => setPlacementForm({ ...placementForm, company_name: e.target.value })} className="input-focus" style={styles.inputStyle} /></div>
            <div><label style={styles.labelStyle}>Sektor Bisnis / Industri</label><input type="text" name="business_sector" required value={placementForm.business_sector} onChange={(e) => setPlacementForm({ ...placementForm, business_sector: e.target.value })} className="input-focus" style={styles.inputStyle} /></div>
            <div><label style={styles.labelStyle}>Posisi / Departemen</label><input type="text" name="position" required value={placementForm.position} onChange={(e) => setPlacementForm({ ...placementForm, position: e.target.value })} className="input-focus" style={styles.inputStyle} /></div>
            <div><label style={styles.labelStyle}>Alamat Lengkap Perusahaan</label><input type="text" name="company_address" required value={placementForm.company_address} onChange={(e) => setPlacementForm({ ...placementForm, company_address: e.target.value })} className="input-focus" style={styles.inputStyle} /></div>
          </div>
          <div style={{ ...styles.grid2, marginTop: '20px' }}>
            <div><label style={styles.labelStyle}>Tanggal Mulai Magang</label><input type="date" name="start_date" required min={transferMinimumStartDate || undefined} value={placementForm.start_date} onChange={handleStartDateChange} className="input-focus" style={styles.inputStyle} /></div>
            <div><label style={styles.labelStyle}>Tanggal Selesai Magang</label><input type="date" name="end_date" required min={minimumEndDate || undefined} value={placementForm.end_date} onChange={(e) => setPlacementForm({ ...placementForm, end_date: e.target.value })} className="input-focus" style={styles.inputStyle} /></div>
          </div>
          <div style={{ marginTop: '12px', padding: '12px 14px', borderRadius: '8px', border: showDurationWarning ? '1px solid #fecaca' : '1px solid #bfdbfe', backgroundColor: showDurationWarning ? '#fef2f2' : '#eff6ff', color: showDurationWarning ? '#991b1b' : '#1d4ed8', fontSize: '12px', lineHeight: '1.5', fontWeight: '700' }}>
            {isTransferFlow ? `Akumulasi durasi magang minimal ${MIN_INTERNSHIP_WORKING_DAYS} hari kerja (tempat lama + baru).` : `Durasi magang minimal ${MIN_INTERNSHIP_WORKING_DAYS} hari kerja (Senin-Jumat).`} {placementForm.start_date && minimumEndDate ? `Tanggal selesai paling cepat: ${minimumEndDate}.` : 'Pilih tanggal mulai untuk melihat batas tanggal selesai.'} {placementForm.start_date && placementForm.end_date ? `Durasi pilihan saat ini: ${isTransferFlow ? `${accumulatedTransferWorkingDays} hari kerja total (${previousPlacementWorkingDays} lama + ${selectedWorkingDays} baru)` : `${selectedWorkingDays} hari kerja`}.` : ''}
          </div>
          <h4 style={styles.sectionTitle}>2. Data Supervisor (Pembimbing Lapangan)</h4>
          <div style={styles.grid2}>
            <div><label style={styles.labelStyle}>Nama Lengkap & Gelar</label><input type="text" name="supervisor_name" required value={placementForm.supervisor_name} onChange={(e) => setPlacementForm({ ...placementForm, supervisor_name: e.target.value })} className="input-focus" style={styles.inputStyle} /></div>
            <div><label style={styles.labelStyle}>Email Aktif Supervisor</label><input type="email" name="supervisor_email" required value={placementForm.supervisor_email} onChange={(e) => setPlacementForm({ ...placementForm, supervisor_email: e.target.value })} className="input-focus" style={styles.inputStyle} /></div>
            <div><label style={styles.labelStyle}>No. WhatsApp Supervisor</label><input type="text" name="supervisor_phone" value={placementForm.supervisor_phone} onChange={(e) => setPlacementForm({ ...placementForm, supervisor_phone: e.target.value })} className="input-focus" style={styles.inputStyle} placeholder="Cth: 08123456789" /></div>
          </div>
          <h4 style={styles.sectionTitle}>3. Dokumen Validasi (Letter of Acceptance)</h4>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '14px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px dashed #cbd5e1', flexWrap: 'wrap' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#003366', backgroundColor: '#e6f0fa', flexShrink: 0 }}><UploadCloud size={20} /></div>
            <div style={{ flex: 1, minWidth: isMobile ? 0 : '220px' }}>
              <label style={{ ...styles.labelStyle, marginBottom: '3px' }}>Surat Diterima Magang / Offering Letter</label>
              <p style={{ margin: '0 0 9px', color: '#64748b', fontSize: '11px', lineHeight: 1.5 }}>Gunakan dokumen PDF atau gambar yang dapat dibaca dengan jelas.</p>
              <input type="file" accept=".pdf,image/*" required onChange={(e) => setAcceptanceLetter(e.target.files[0])} style={{ ...styles.fileInput, marginTop: 0, backgroundColor: '#fff' }} />
            </div>
          </div>
          <button className="btn-hover" type="submit" disabled={isPlacementSubmitDisabled} style={placementSubmitStyle}>
            {submittingPlacement ? <><Loader2 size={18} className="animate-spin" /> Sedang Memproses Data...</> : <><Send size={18} /> {hasActiveInternalApplications ? 'Tarik Lamaran Internal Dulu' : hasApprovedPlacement ? 'Ajukan Pindah Tempat Magang' : 'Kirim Data Magang Saya'}</>}
          </button>
        </form>
      </div>
      </div>
      {supervisorChangeModal.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '610px' }}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9px', color: '#1d4ed8', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <RefreshCw size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: isMobile ? '16px' : '18px', lineHeight: 1.3, fontWeight: '800' }}>Ajukan Perubahan Supervisor</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '12px' }}>Admin akan memeriksa data sebelum email tujuan evaluasi diganti.</p>
                </div>
              </div>
              <button type="button" onClick={closeSupervisorChangeModal} style={styles.closeBtn} aria-label="Tutup form perubahan supervisor"><XCircle size={22} /></button>
            </div>
            <form onSubmit={submitSupervisorChange}>
              <div style={{ padding: isMobile ? '18px' : '22px 24px', display: 'grid', gap: '16px' }}>
                <div>
                  <label style={styles.labelStyle}>Nama Lengkap Supervisor</label>
                  <input type="text" required value={supervisorChangeModal.supervisor_name} onChange={(event) => setSupervisorChangeModal({ ...supervisorChangeModal, supervisor_name: event.target.value })} className="input-focus" style={styles.inputStyle} />
                </div>
                <div>
                  <label style={styles.labelStyle}>Email Aktif Supervisor</label>
                  <input type="email" required value={supervisorChangeModal.supervisor_email} onChange={(event) => setSupervisorChangeModal({ ...supervisorChangeModal, supervisor_email: event.target.value })} className="input-focus" style={styles.inputStyle} />
                  <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '11px', lineHeight: 1.5 }}>Link evaluasi UTS dan UAS berikutnya akan dikirim ke alamat ini setelah disetujui admin.</p>
                </div>
                <div>
                  <label style={styles.labelStyle}>Nomor WhatsApp Supervisor</label>
                  <input type="text" value={supervisorChangeModal.supervisor_phone} onChange={(event) => setSupervisorChangeModal({ ...supervisorChangeModal, supervisor_phone: event.target.value })} placeholder="Contoh: 08123456789" className="input-focus" style={styles.inputStyle} />
                </div>
                <div>
                  <label style={styles.labelStyle}>Alasan Perubahan</label>
                  <textarea required rows="4" value={supervisorChangeModal.reason} onChange={(event) => setSupervisorChangeModal({ ...supervisorChangeModal, reason: event.target.value })} placeholder="Contoh: Supervisor sebelumnya berpindah divisi dan penilaian dilanjutkan oleh pembimbing baru." className="input-focus" style={{ ...styles.inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" onClick={closeSupervisorChangeModal} disabled={submittingSupervisorChange} className="btn-hover" style={{ ...styles.btnPrimary, backgroundColor: '#ffffff', color: '#475569', border: '1px solid #cbd5e1' }}>Batal</button>
                <button type="submit" disabled={submittingSupervisorChange} className="btn-hover" style={{ ...styles.btnPrimary, backgroundColor: '#003366' }}>
                  {submittingSupervisorChange ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {submittingSupervisorChange ? 'Mengirim Pengajuan...' : 'Kirim untuk Ditinjau Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '14px' : '30px', alignItems: 'flex-start' }}>
        <div style={{ ...styles.card, flex: 1, width: '100%', position: isMobile ? 'static' : 'sticky', top: '20px', borderTop: '4px solid #003366' }}>
          <div style={{ marginBottom: isMobile ? '18px' : '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#003366', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><Edit3 size={20} /> Buat Laporan Baru</h3>
            <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '12px', lineHeight: 1.5 }}>Isi progres pencarian magang mingguan dan rencana tindak lanjut berikutnya.</p>
          </div>
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
        <div style={{ ...styles.card, flex: 1, width: '100%' }}>
          <h3 style={{ margin: '0 0 25px 0', color: '#003366', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><History size={20} /> Rekam Jejak Mingguan</h3>
          {weeklyReports.length === 0 ? (
            <div style={{ padding: '30px', backgroundColor: '#f8fafc', borderRadius: '12px', textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1' }}>
              <BarChart2 size={40} color="#cbd5e1" style={{ marginBottom: '10px' }} />
              <p style={{ margin: 0 }}>Belum ada riwayat laporan.<br />Mulai laporkan progress pertama Anda!</p>
            </div>
          ) : (
            <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: '15px' } : { paddingLeft: '5px' }}>
              {weeklyReports.map((report) => (
                <div key={report.id} className={isMobile ? undefined : 'timeline-item'} style={isMobile ? { padding: '15px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' } : undefined}>
                  {!isMobile && <div className="timeline-dot"></div>}
                  <div style={isMobile ? {} : { padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', gap: isMobile ? '6px' : '0' }}>
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
        <p style={styles.heroSubtitle}>Catat pekerjaan, pembelajaran, dan perkembangan magang secara berkala.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '14px' : '30px', alignItems: 'flex-start' }}>
        <div style={{ ...styles.card, flex: 1.5, width: '100%', borderTop: editingReportId ? '4px solid #0ea5e9' : '4px solid #003366' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: '12px', marginBottom: isMobile ? '18px' : '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#003366', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><Edit3 size={20} /> {editingReportId ? 'Mode Revisi Laporan' : 'Buat Laporan Baru'}</h3>
              <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '12px', lineHeight: 1.5 }}>{editingReportId ? 'Perbarui jawaban yang perlu disesuaikan lalu simpan revisi.' : 'Isi satu laporan untuk setiap bulan masa magang.'}</p>
            </div>
            {editingReportId && <button type="button" onClick={cancelEditMonthlyReport} style={{ padding: '9px 11px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', whiteSpace: 'nowrap', width: isMobile ? '100%' : 'auto' }}><XCircle size={14} /> Batal</button>}
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
            {isFirstMonthReport && (
              <div style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '12px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', lineHeight: '1.5', fontWeight: '600' }}>
                Ini laporan pertama untuk tempat magang yang dipilih, jadi pertanyaan lengkap wajib diisi satu kali. Laporan berikutnya akan kembali ke format ringkas.
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {isFirstMonthReport && <div><label style={styles.labelStyle}>1. Deskripsikan Profil Perusahaan Singkat</label><textarea name="company_profile" rows="3" required onChange={handleReportChange} value={reportForm.company_profile} placeholder="Ceritakan bidang usaha, produk, atau layanan utama perusahaan." className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc', resize: 'vertical', lineHeight: 1.65 }} /></div>}
              <div>
                <label style={styles.labelStyle}>{isFirstMonthReport ? '2. Rincian Pekerjaan (Jobdesk) Selama Sebulan Terakhir' : 'Highlight Pekerjaan (Jobdesk) Bulan Ini'}</label>
                <textarea name="job_description" rows="4" required onChange={handleReportChange} value={reportForm.job_description} placeholder="Tuliskan tugas utama, proyek yang dikerjakan, dan hasil yang sudah dicapai." className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc', resize: 'vertical', lineHeight: 1.65 }} />
              </div>
              {isFirstMonthReport && (
                <>
                  <div><label style={styles.labelStyle}>3. Bagaimana Suasana Lingkungan & Budaya Kerjanya?</label><textarea name="work_environment" rows="3" required onChange={handleReportChange} value={reportForm.work_environment} placeholder="Ceritakan pola kerja tim, komunikasi, atau budaya perusahaan." className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc', resize: 'vertical', lineHeight: 1.65 }} /></div>
                  <div><label style={styles.labelStyle}>4. Materi Kuliah Apa yang Paling Berguna di Sini?</label><textarea name="useful_courses" rows="3" required onChange={handleReportChange} value={reportForm.useful_courses} placeholder="Sebutkan mata kuliah atau konsep yang kamu terapkan selama bekerja." className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc', resize: 'vertical', lineHeight: 1.65 }} /></div>
                  <div><label style={styles.labelStyle}>5. Keahlian atau Skill Baru yang Anda Pelajari</label><textarea name="new_skills" rows="3" required onChange={handleReportChange} value={reportForm.new_skills} placeholder="Tuliskan tools, proses kerja, atau kemampuan baru yang kamu pelajari." className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc', resize: 'vertical', lineHeight: 1.65 }} /></div>
                </>
              )}
            </div>
            <div style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <button className="btn-hover" type="submit" disabled={submittingReport} style={{ ...styles.btnPrimary, backgroundColor: editingReportId ? '#0ea5e9' : '#003366', padding: '14px 24px', fontSize: '15px', width: '100%' }}>
                {submittingReport ? <Loader2 size={16} className="animate-spin" /> : (editingReportId ? <Save size={16} /> : <Send size={16} />)}
                {submittingReport ? 'Memproses Dokumen...' : (editingReportId ? 'Simpan Revisi Laporan' : 'Kirim Laporan Bulanan')}
              </button>
            </div>
          </form>
        </div>
        <div style={{ ...styles.card, flex: 1, width: '100%', position: isMobile ? 'static' : 'sticky', top: '20px' }}>
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
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#003366', fontSize: '15px', fontWeight: '700' }}>{report.report_month}</h4>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Dikirim: {formatSubmissionDate(report.submitted_at)}</span>
                    </div>
                    <button onClick={() => handleEditMonthlyReport(report)} style={{ padding: '8px 10px', backgroundColor: editingReportId === report.id ? '#0ea5e9' : '#f1f5f9', color: editingReportId === report.id ? '#fff' : '#003366', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: isMobile ? '100%' : 'auto' }}>
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
  const [selectedFileName, setSelectedFileName] = useState('');
  const isFinalReport = title.toLowerCase().includes('uas') || title.toLowerCase().includes('akhir');
  const studentButtonTone = {
    primary: '#003366',
    primarySoft: '#e6f0fa',
    primaryBorder: '#b8cce3',
    primaryShadow: '0 12px 24px rgba(0, 51, 102, 0.18)',
  };
  const reportTone = isFinalReport
    ? {
      accent: '#059669',
      accentDark: '#047857',
      accentSoft: '#ecfdf5',
      accentBorder: '#bbf7d0',
      contrast: '#0f766e',
      submitShadow: '0 14px 28px rgba(5, 150, 105, 0.24)',
    }
    : {
      accent: '#2563eb',
      accentDark: '#1d4ed8',
      accentSoft: '#eff6ff',
      accentBorder: '#bfdbfe',
      contrast: '#1e40af',
      submitShadow: '0 14px 28px rgba(37, 99, 235, 0.22)',
    };
  const reportStatusLabel = submittedReport ? 'Sudah terkumpul' : 'Belum terkumpul';
  const supervisorStatusLabel = evaluation?.is_filled ? 'Evaluasi lengkap' : 'Menunggu supervisor';
  const fileInputId = `report-file-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div className="no-print">
      <div style={{ ...styles.heroBanner, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '18px' }}>
          <div>
            <h1 style={styles.heroTitle}>{title}</h1>
            <p style={{ ...styles.heroSubtitle, maxWidth: '760px' }}>{submittedDescription}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '8px 12px', borderRadius: '999px', backgroundColor: submittedReport ? '#ecfdf5' : '#fff7ed', color: submittedReport ? '#047857' : '#c2410c', fontSize: '11px', fontWeight: '900', border: `1px solid ${submittedReport ? '#bbf7d0' : '#fed7aa'}`, flex: isMobile ? '1 1 150px' : '0 0 auto' }}>
              {submittedReport ? <CheckCircle size={13} /> : <Clock size={13} />} {reportStatusLabel}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '8px 12px', borderRadius: '999px', backgroundColor: evaluation?.is_filled ? '#ecfdf5' : '#fffbeb', color: evaluation?.is_filled ? '#047857' : '#b45309', fontSize: '11px', fontWeight: '900', border: `1px solid ${evaluation?.is_filled ? '#bbf7d0' : '#fde68a'}`, flex: isMobile ? '1 1 150px' : '0 0 auto' }}>
              {evaluation?.is_filled ? <FileCheck size={13} /> : <Clock size={13} />} {supervisorStatusLabel}
            </span>
          </div>
        </div>
      </div>

      {isMobile && templateFile && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ ...styles.card, padding: '18px', border: '1px solid #dbe4ef', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '13px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: reportTone.accentSoft, color: reportTone.accentDark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Download size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '15px', lineHeight: 1.35, fontWeight: '900' }}>{templateTitle}</h3>
                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '12px', lineHeight: 1.55 }}>Format resmi dari Admin Co-op.</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginTop: '16px' }}>
              <button type="button" onClick={(e) => { e.preventDefault(); setPreviewDoc(templateFile); }} className="btn-hover" style={{ ...styles.btnPrimary, backgroundColor: '#ffffff', color: studentButtonTone.primary, border: `1px solid ${studentButtonTone.primaryBorder}`, boxShadow: 'none', width: '100%' }}>
                <Eye size={15} /> Preview
              </button>
              <a href={templateFile} target="_blank" rel="noreferrer" className="btn-hover" style={{ ...styles.btnPrimary, backgroundColor: studentButtonTone.primary, boxShadow: studentButtonTone.primaryShadow, textDecoration: 'none', display: 'flex', textAlign: 'center', width: '100%' }}>
                <Download size={15} /> Download
              </a>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.35fr) minmax(300px, 0.65fr)', gap: '18px', alignItems: 'start' }}>
        <div style={{ ...styles.card, padding: 0, overflow: 'hidden', borderTop: `4px solid ${reportTone.accent}` }}>
          <div style={{ padding: isMobile ? '20px' : '24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
              <div>
                <p style={{ margin: '0 0 6px', color: reportTone.contrast, fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>{sectionTitle}</p>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: isMobile ? '20px' : '24px', lineHeight: 1.2, fontWeight: '900' }}>
                  Pengumpulan Dokumen
                </h3>
              </div>
              {submittedReport && (
                <a href={submittedReport.report_file} target="_blank" rel="noreferrer" className="btn-hover" style={{ ...styles.btnPrimary, backgroundColor: '#ffffff', color: studentButtonTone.primary, border: `1px solid ${studentButtonTone.primaryBorder}`, boxShadow: 'none', textDecoration: 'none', width: isMobile ? '100%' : 'auto' }}>
                  <Eye size={16} /> Lihat File Terkirim
                </a>
              )}
            </div>

            {submittedReport && (
              <div style={{ marginTop: '18px', padding: '14px 16px', backgroundColor: reportTone.accentSoft, borderRadius: '12px', border: `1px solid ${reportTone.accentBorder}`, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle size={20} color={reportTone.accentDark} style={{ flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <strong style={{ display: 'block', color: reportTone.accentDark, fontSize: '14px', lineHeight: 1.35 }}>{successTitle}</strong>
                  <span style={{ color: reportTone.contrast, fontSize: '12px', lineHeight: 1.55 }}>{submittedTitle}</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ padding: isMobile ? '20px' : '24px', display: 'grid', gap: '18px' }}>
            <div>
              <label style={{ ...styles.labelStyle, display: 'flex', alignItems: 'center', gap: '7px', color: '#0f172a' }}>
                <MapPin size={15} color={reportTone.accent} /> Tempat Magang Aktif
              </label>
              <select required onChange={(e) => setFormData({ ...formData, placement: e.target.value })} value={formData.placement} className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc', border: '1px solid #dbe4ef', minHeight: '48px', fontWeight: '700' }}>
                <option value="">Pilih tempat magang</option>
                {approvedPlacements.map((placement) => <option key={placement.id} value={placement.id}>{getPlacementOptionLabel(placement)}</option>)}
              </select>
            </div>

            <div>
              <label style={{ ...styles.labelStyle, display: 'flex', alignItems: 'center', gap: '7px', color: '#0f172a' }}>
                <UploadCloud size={15} color={reportTone.accent} /> {fileLabel}
              </label>
              <label htmlFor={fileInputId} className="btn-hover" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '20px', backgroundColor: '#f8fafc', border: `2px dashed ${selectedFileName ? reportTone.accent : '#cbd5e1'}`, borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.2s ease, background-color 0.2s ease' }}>
                <input
                  id={fileInputId}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  required
                  onChange={(e) => {
                    const nextFile = e.target.files?.[0] || null;
                    setSelectedFileName(nextFile?.name || '');
                    setFile(nextFile);
                  }}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, width: '100%' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: selectedFileName ? reportTone.accentSoft : '#eef2f7', color: selectedFileName ? reportTone.accentDark : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {selectedFileName ? <FileCheck size={22} /> : <Folder size={22} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, color: '#0f172a', fontSize: '14px', fontWeight: '900', overflowWrap: 'anywhere' }}>
                      {selectedFileName || 'Pilih file laporan'}
                    </p>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '12px', lineHeight: 1.45 }}>
                      PDF, DOC, atau DOCX
                    </p>
                  </div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', width: isMobile ? '100%' : 'auto', padding: '10px 14px', borderRadius: '10px', backgroundColor: studentButtonTone.primarySoft, border: `1px solid ${studentButtonTone.primaryBorder}`, color: studentButtonTone.primary, fontSize: '12px', fontWeight: '900', flexShrink: 0 }}>
                  <UploadCloud size={14} /> Pilih File
                </span>
              </label>
            </div>

            <div>
              <label style={{ ...styles.labelStyle, display: 'flex', alignItems: 'center', gap: '7px', color: '#0f172a' }}>
                <Edit3 size={15} color={reportTone.accent} /> {uploadButtonLabel}
              </label>
              <textarea rows="4" onChange={(e) => setFormData({ ...formData, description: e.target.value })} value={formData.description} placeholder={uploadedFileLabel} className="input-focus" style={{ ...styles.inputStyle, backgroundColor: '#f8fafc', border: '1px solid #dbe4ef', resize: 'vertical', lineHeight: 1.65, minHeight: '112px' }} />
            </div>

            <button type="submit" disabled={submitting} className="btn-hover" style={{ ...styles.btnPrimary, width: '100%', minHeight: '54px', padding: '15px 20px', borderRadius: '12px', backgroundColor: submitting ? '#94a3b8' : studentButtonTone.primary, boxShadow: submitting ? 'none' : studentButtonTone.primaryShadow, fontSize: '15px', fontWeight: '900' }}>
              {submitting ? <Loader2 size={17} className="animate-spin" /> : <UploadCloud size={17} />}
              {submitting ? 'Mengupload Dokumen...' : submitLabel}
            </button>
          </form>
        </div>

        <div style={{ display: 'grid', gap: '18px' }}>
          <div style={{ ...styles.card, padding: '20px', border: `1px solid ${evaluation?.is_filled ? '#bbf7d0' : '#fde68a'}`, backgroundColor: evaluation?.is_filled ? '#f0fdf4' : '#fffbeb' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '13px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#ffffff', color: evaluation?.is_filled ? '#15803d' : '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${evaluation?.is_filled ? '#bbf7d0' : '#fde68a'}` }}>
                {evaluation?.is_filled ? <CheckCircle size={21} /> : <Clock size={21} />}
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, color: evaluation?.is_filled ? '#14532d' : '#92400e', fontSize: '15px', lineHeight: 1.35, fontWeight: '900' }}>
                  {evaluation?.is_filled ? evaluationSuccessTitle : 'Menunggu Penilaian Supervisor'}
                </h3>
                <p style={{ margin: '6px 0 0', color: evaluation?.is_filled ? '#166534' : '#92400e', fontSize: '12px', lineHeight: 1.55, fontWeight: '650' }}>
                  {evaluation?.is_filled ? evaluationSuccessSubtitle : waitingEvaluationSubtitle}
                </p>
              </div>
            </div>
            {!evaluation?.is_filled && (
              <a href={reminderLink} target="_blank" rel="noreferrer" className="btn-hover" style={{ marginTop: '16px', padding: '12px 14px', backgroundColor: '#25D366', color: '#ffffff', textDecoration: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', width: '100%' }}>
                <Send size={15} /> Hubungi via WA
              </a>
            )}
          </div>

          {!isMobile && templateFile && (
            <div style={{ ...styles.card, padding: '20px', border: '1px solid #dbe4ef', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '13px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: reportTone.accentSoft, color: reportTone.accentDark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Download size={20} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: 0, color: '#0f172a', fontSize: '15px', lineHeight: 1.35, fontWeight: '900' }}>{templateTitle}</h3>
                  <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '12px', lineHeight: 1.55 }}>Format resmi dari Admin Co-op.</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={(e) => { e.preventDefault(); setPreviewDoc(templateFile); }} className="btn-hover" style={{ ...styles.btnPrimary, backgroundColor: '#ffffff', color: studentButtonTone.primary, border: `1px solid ${studentButtonTone.primaryBorder}`, boxShadow: 'none', width: '100%' }}>
                  <Eye size={15} /> Preview
                </button>
                <a href={templateFile} target="_blank" rel="noreferrer" className="btn-hover" style={{ ...styles.btnPrimary, backgroundColor: studentButtonTone.primary, boxShadow: studentButtonTone.primaryShadow, textDecoration: 'none', display: 'flex', textAlign: 'center', width: '100%' }}>
                  <Download size={15} /> Download
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const getRefId = (ref) => (ref && typeof ref === 'object' ? ref.id : ref);

const getPlacementSortTime = (placement) => {
  const rawDate = placement?.start_date || placement?.created_at || placement?.end_date;
  const parsedDate = rawDate ? new Date(rawDate).getTime() : 0;

  return Number.isNaN(parsedDate) ? 0 : parsedDate;
};

const getCertificateHistoryPlacements = (certificate, placements = []) => {
  const certificatePlacementId = getPlacementId(certificate?.placement);
  const certificateStudentId = getRefId(certificate?.student);
  const hiddenHistoryStatuses = ['pending', 'rejected'];

  return placements
    .filter((placement) => {
      const placementStudentId = getRefId(placement.student);
      const isSameStudent = !certificateStudentId || String(placementStudentId) === String(certificateStudentId);
      const isDifferentPlacement = !certificatePlacementId || String(placement.id) !== String(certificatePlacementId);
      const isDisplayableHistory = !hiddenHistoryStatuses.includes(placement.status);

      return isSameStudent && isDifferentPlacement && isDisplayableHistory && placement.company_name;
    })
    .sort((a, b) => getPlacementSortTime(a) - getPlacementSortTime(b));
};

export function CertificatesTab({ certificates, isMobile, loadingCertificates, placements = [], styles }) {
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
          {certificates.map((cert) => {
            const historyPlacements = getCertificateHistoryPlacements(cert, placements);

            return (
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
                  {historyPlacements.length > 0 && (
                    <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1', textAlign: isMobile ? 'center' : 'left', fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
                      <strong style={{ color: '#334155' }}>Perusahaan Sebelumnya:</strong>
                      <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {historyPlacements.map((placement) => (
                          <span key={placement.id}>
                            {placement.company_name}
                            {placement.position ? ` - ${placement.position}` : ''}
                            {(placement.start_date || placement.end_date) ? ` (${placement.start_date || '-'} s/d ${placement.end_date || '-'})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button className="btn-hover no-print" onClick={() => window.print()} style={{ ...styles.btnPrimary, width: '100%', padding: '15px', marginTop: '15px', fontSize: '16px', backgroundColor: '#003366' }}>
                  <Printer size={20} /> Cetak / Download PDF Sertifikat
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
