import { useCallback, useState } from 'react';
import { getAdminStyles } from '../../../styles/adminstyles';
import {
  EMPTY_EMAIL_MODAL,
  EMPTY_PASSWORD_FORM,
  PROFILE_INITIAL_FORM,
  EMPTY_TEMPLATE_FILES,
  EMPTY_VACANCY_FORM,
} from '../constants';
import {
  filterUsersByProdi,
  getApplicationsFiltered,
  getApprovalDataFiltered,
  getBerkasFiltered,
  getDashboardBadges,
  getEvaluasiFiltered,
  getJobSeekerFiltered,
  getOverviewStudentsFiltered,
  getRegistrationStatus,
  getUniqueProdis,
} from '../helpers';

export default function useAdminDashboardViewState({
  isMobile,
  isSidebarCollapsed,
  isSidebarOpen,
  setIsSidebarOpen,
  students,
  pendingUsers,
  placements,
  evaluations,
  applications,
  finalReports,
  certificates,
  weeklyReports,
  industries,
  vacancies,
}) {
  const [activeTab, setActiveTab] = useState('approval');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProdi, setFilterProdi] = useState('');
  const [filterStatusMagang, setFilterStatusMagang] = useState('');
  const [filterStatusAkun, setFilterStatusAkun] = useState('');
  const [filterStatusPelamar, setFilterStatusPelamar] = useState('');
  const [filterStatusEvaluasi, setFilterStatusEvaluasi] = useState('');
  const [filterStatusJobSeeker, setFilterStatusJobSeeker] = useState('');
  const [filterStatusBerkas, setFilterStatusBerkas] = useState('');
  const [gradeInput, setGradeInput] = useState({});
  const [selectedStudentReports, setSelectedStudentReports] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [placementToApprove, setPlacementToApprove] = useState(null);
  const [vacancyForm, setVacancyForm] = useState(EMPTY_VACANCY_FORM);
  const [submittingVacancy, setSubmittingVacancy] = useState(false);
  const [editingVacancyId, setEditingVacancyId] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [templateFiles, setTemplateFiles] = useState(EMPTY_TEMPLATE_FILES);
  const [uploadingTemplate, setUploadingTemplate] = useState(null);
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [emailModal, setEmailModal] = useState(EMPTY_EMAIL_MODAL);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState(PROFILE_INITIAL_FORM);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const lowerQuery = searchQuery.toLowerCase();
  const matchesLowerQuery = (...values) => (
    !lowerQuery || values
      .filter((value) => value !== null && value !== undefined)
      .join(' ')
      .toLowerCase()
      .includes(lowerQuery)
  );
  const prodiFilteredPending = filterUsersByProdi(pendingUsers, filterProdi);
  const prodiFilteredActive = filterUsersByProdi(students, filterProdi);
  const filteredInactive = prodiFilteredPending.filter((user) =>
    matchesLowerQuery(user.first_name, user.last_name, user.nim, user.program_studi, user.email)
  );
  const filteredPending = filteredInactive.filter((user) => getRegistrationStatus(user) !== 'rejected');
  const filteredActive = prodiFilteredActive.filter((student) =>
    matchesLowerQuery(student.first_name, student.last_name, student.nim, student.program_studi, student.email)
  );
  const overviewStudentsFiltered = getOverviewStudentsFiltered(prodiFilteredActive, placements, filterStatusMagang, lowerQuery);
  const approvalDataFiltered = getApprovalDataFiltered(filteredInactive, filteredActive, filterStatusAkun);
  const applicationsFiltered = getApplicationsFiltered(applications, students, vacancies, placements, certificates, filterStatusPelamar, filterProdi, lowerQuery);
  const evaluasiFiltered = getEvaluasiFiltered(placements, evaluations, students, filterStatusEvaluasi, filterProdi, lowerQuery);
  const jobSeekerFiltered = getJobSeekerFiltered(prodiFilteredActive, placements, weeklyReports, filterStatusJobSeeker, lowerQuery);
  const berkasFiltered = getBerkasFiltered(placements, certificates, students, filterStatusBerkas, filterProdi, lowerQuery);
  const industriesFiltered = industries.filter((item) =>
    matchesLowerQuery(item.company_name, item.supervisor_name, item.supervisor_email, item.supervisor_phone)
  );
  const vacanciesFiltered = vacancies.filter((item) =>
    matchesLowerQuery(item.title, item.company_name, item.description, item.requirements, item.external_apply_link)
  );
  const uniqueProdis = getUniqueProdis(students, pendingUsers);
  const badges = getDashboardBadges(
    pendingUsers,
    placements,
    evaluations,
    applications,
    finalReports,
    certificates,
  );
  const styles = getAdminStyles(isMobile, isSidebarCollapsed, isSidebarOpen);

  const resetTabState = useCallback(() => {
    [
      setSearchQuery,
      setFilterStatusMagang,
      setFilterStatusAkun,
      setFilterStatusPelamar,
      setFilterStatusEvaluasi,
      setFilterStatusJobSeeker,
      setFilterStatusBerkas,
    ].forEach((resetState) => resetState(''));

    setSelectedUserIds([]);
    setEditingVacancyId(null);
    setVacancyForm(EMPTY_VACANCY_FORM);
    setPasswordForm(EMPTY_PASSWORD_FORM);

    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile, setIsSidebarOpen]);

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filterProdi,
    setFilterProdi,
    filterStatusMagang,
    setFilterStatusMagang,
    filterStatusAkun,
    setFilterStatusAkun,
    filterStatusPelamar,
    setFilterStatusPelamar,
    filterStatusEvaluasi,
    setFilterStatusEvaluasi,
    filterStatusJobSeeker,
    setFilterStatusJobSeeker,
    filterStatusBerkas,
    setFilterStatusBerkas,
    gradeInput,
    setGradeInput,
    selectedStudentReports,
    setSelectedStudentReports,
    selectedDetail,
    setSelectedDetail,
    placementToApprove,
    setPlacementToApprove,
    vacancyForm,
    setVacancyForm,
    submittingVacancy,
    setSubmittingVacancy,
    editingVacancyId,
    setEditingVacancyId,
    selectedApplication,
    setSelectedApplication,
    templateFiles,
    setTemplateFiles,
    uploadingTemplate,
    setUploadingTemplate,
    showIncompleteOnly,
    setShowIncompleteOnly,
    selectedUserIds,
    setSelectedUserIds,
    editingStudent,
    setEditingStudent,
    emailModal,
    setEmailModal,
    sendingEmail,
    setSendingEmail,
    passwordForm,
    setPasswordForm,
    isChangingPassword,
    setIsChangingPassword,
    profileForm,
    setProfileForm,
    isUpdatingProfile,
    setIsUpdatingProfile,
    filteredPending,
    filteredInactive,
    overviewStudentsFiltered,
    approvalDataFiltered,
    applicationsFiltered,
    evaluasiFiltered,
    jobSeekerFiltered,
    berkasFiltered,
    industriesFiltered,
    vacanciesFiltered,
    uniqueProdis,
    badges,
    styles,
    resetTabState,
  };
}
