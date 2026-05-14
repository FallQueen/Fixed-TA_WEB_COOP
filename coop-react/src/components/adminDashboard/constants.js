import {
  ShieldCheck,
  Activity,
  Building2,
  Briefcase,
  Users,
  Target,
  FileEdit,
  GraduationCap,
  Settings,
} from 'lucide-react';

export const EMPTY_VACANCY_FORM = {
  title: '',
  company_name: '',
  description: '',
  requirements: '',
  expires_at: '',
  external_apply_link: '',
};

export const EMPTY_TEMPLATE_FILES = {
  uts_template: null,
  uas_template: null,
};

export const EMPTY_CURRENT_TEMPLATES = {
  uts_template: null,
  uas_template: null,
};

export const EMPTY_EMAIL_MODAL = {
  isOpen: false,
  actionType: '',
  targetId: null,
  targetName: '',
  placementId: null,
  subject: '',
  message: '',
};

export const EMPTY_PASSWORD_FORM = {
  old_password: '',
  new_password: '',
  confirm_password: '',
};

export const PROFILE_INITIAL_FORM = {
  username: '',
  first_name: '',
  last_name: '',
};

export const API_ROUTES = {
  me: 'users/me/',
  users: 'users/',
  placements: 'placements/',
  evaluations: 'evaluations/',
  monthlyReports: 'monthly-reports/',
  utsReports: 'uts-reports/',
  finalReports: 'final-reports/',
  certificates: 'certificates/',
  templates: 'templates/',
  weeklyReports: 'weekly-reports/',
  applications: 'applications/',
  industries: 'industries/',
  vacancies: 'vacancies/',
  changePassword: 'users/change-password/',
  sendReminders: 'send-reminders/',
  sendReportReminders: 'send-report-reminders/',
};

export const SIDEBAR_SECTIONS = [
  {
    label: 'Dashboard Utama',
    items: [
      { key: 'approval', label: 'Persetujuan Akun', icon: ShieldCheck, badgeKey: 'approval' },
      { key: 'overview', label: 'Overview & Tracking', icon: Activity, badgeKey: 'overview' },
    ],
  },
  {
    label: 'Bursa & Mitra',
    items: [
      { key: 'industri', label: 'Data Mitra Industri', icon: Building2 },
      { key: 'lowongan', label: 'Kelola Lowongan', icon: Briefcase },
      { key: 'pelamar', label: 'Daftar Pelamar', icon: Users, badgeKey: 'pelamar' },
    ],
  },
  {
    label: 'Akademik & Laporan',
    items: [
      { key: 'job_seeker', label: 'Pantau Job Seeker', icon: Target },
      { key: 'evaluasi', label: 'Evaluasi Supervisor', icon: FileEdit, badgeKey: 'evaluasi' },
      { key: 'berkas', label: 'Berkas & Sertifikasi', icon: GraduationCap, badgeKey: 'berkas' },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { key: 'pengaturan', label: 'Pengaturan Keamanan', icon: Settings },
    ],
  },
];
