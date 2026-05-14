export { API_BASE_URL } from '../api/config';

export const EMPTY_APPLICATION_FORM = { cover_letter: '' };
export const EMPTY_PROFILE_FORM = { username: '', first_name: '', last_name: '' };
export const EMPTY_PASSWORD_FORM = { old_password: '', new_password: '', confirm_password: '' };
export const EMPTY_PLACEMENT_FORM = {
  company_name: '', company_address: '', business_sector: '', position: '',
  start_date: '', end_date: '',
  supervisor_name: '', supervisor_email: '', supervisor_phone: ''
};
export const EMPTY_REPORT_FORM = {
  placement: '', 
  report_month: '', 
  company_profile: '', 
  job_description: '', 
  work_environment: '', 
  useful_courses: '', 
  new_skills: ''
};
export const EMPTY_WEEKLY_FORM = {
  week_number: '', 
  companies_applied: '', 
  challenges: '', 
  next_plan: ''
};
export const EMPTY_UTS_REPORT_DATA = { placement: '', description: '' };
export const EMPTY_FINAL_REPORT_DATA = { placement: '', description: '' };

export const PLACEMENT_DATA_TABS = ['profil', 'lapor', 'laporan_bulanan', 'laporan_uts', 'laporan_akhir', 'lowongan', 'pengaturan'];
export const REPORT_TEMPLATE_TABS = ['laporan_uts', 'laporan_akhir'];

export const getAuthToken = () => localStorage.getItem('token');

export const createAuthHeaders = (extraHeaders = {}) => ({
  Authorization: `Token ${getAuthToken()}`,
  ...extraHeaders,
});

export const getPlacementId = (placement) => placement?.id || placement;
