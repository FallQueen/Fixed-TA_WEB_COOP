export { API_BASE_URL } from '../api/config';

export const EMPTY_APPLICATION_FORM = {
  cover_letter: '',
  internship_start_date: '',
  internship_end_date: '',
};
export const EMPTY_PROFILE_FORM = { username: '', first_name: '', last_name: '' };
export const EMPTY_PASSWORD_FORM = { old_password: '', new_password: '', confirm_password: '' };
export const EMPTY_PLACEMENT_FORM = {
  company_name: '', company_address: '', business_sector: '', position: '',
  start_date: '', end_date: '',
  supervisor_name: '', supervisor_email: '', supervisor_phone: '',
  withdrawal_reason: '',
  previous_placement_end_date: '',
  transfer_reason: '',
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
export const MIN_INTERNSHIP_WORKING_DAYS = 90;

export const ADMIN_COOP_CONTACT = {
  name: 'Admin Co-op Prasmul',
  email: 'coop@prasetiyamulya.ac.id',
  phone: '+62 851-1751-2341',
};

export const PLACEMENT_DATA_TABS = ['profil', 'lapor', 'laporan_bulanan', 'laporan_uts', 'laporan_akhir', 'lowongan', 'pengaturan', 'sertifikat'];
export const REPORT_TEMPLATE_TABS = ['laporan_uts', 'laporan_akhir'];

export const getAuthToken = () => localStorage.getItem('token');

export const createAuthHeaders = (extraHeaders = {}) => ({
  Authorization: `Token ${getAuthToken()}`,
  ...extraHeaders,
});

export const getPlacementId = (placement) => placement?.id || placement;

const parseDateValue = (value) => {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;

  return new Date(Date.UTC(year, month - 1, day));
};

const formatDateValue = (date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getNextDateValue = (dateValue) => {
  const date = parseDateValue(dateValue);
  if (!date) return '';

  date.setUTCDate(date.getUTCDate() + 1);
  return formatDateValue(date);
};

const isWorkingDay = (date) => {
  const day = date.getUTCDay();
  return day >= 1 && day <= 5;
};

export const calculateWorkingDays = (startDate, endDate) => {
  const start = parseDateValue(startDate);
  const end = parseDateValue(endDate);

  if (!start || !end || start > end) return 0;

  let workingDays = 0;
  const cursor = new Date(start);

  while (cursor <= end) {
    if (isWorkingDay(cursor)) workingDays += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return workingDays;
};

export const getMinimumInternshipEndDate = (
  startDate,
  requiredWorkingDays = MIN_INTERNSHIP_WORKING_DAYS
) => {
  const start = parseDateValue(startDate);
  if (!start) return '';

  let workingDays = 0;
  const cursor = new Date(start);

  while (workingDays < requiredWorkingDays) {
    if (isWorkingDay(cursor)) workingDays += 1;
    if (workingDays < requiredWorkingDays) {
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  return formatDateValue(cursor);
};
