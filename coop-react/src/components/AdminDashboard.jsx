import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hitungDurasi } from '../utils/helper';
import { stemRed } from '../styles/adminstyles';
import DashboardShell from './adminDashboard/DashboardShell';
import DashboardModals from './adminDashboard/DashboardModals';
import ApprovalTab from './adminDashboard/tabs/ApprovalTab';
import OverviewTab from './adminDashboard/tabs/OverviewTab';
import BerkasTab from './adminDashboard/tabs/BerkasTab';
import JobSeekerTab from './adminDashboard/tabs/JobSeekerTab';
import IndustriTab from './adminDashboard/tabs/IndustriTab';
import LowonganTab from './adminDashboard/tabs/LowonganTab';
import PelamarTab from './adminDashboard/tabs/PelamarTab';
import EvaluasiTab from './adminDashboard/tabs/EvaluasiTab';
import PengaturanTab from './adminDashboard/tabs/PengaturanTab';
import AdminFeedbackLayer from './adminDashboard/AdminFeedbackLayer';
import useResponsiveSidebar from './adminDashboard/hooks/useResponsiveSidebar';
import useAdminDashboardData from './adminDashboard/hooks/useAdminDashboardData';
import useStudentActions from './adminDashboard/hooks/useStudentActions';
import useVacancyPlacementActions from './adminDashboard/hooks/useVacancyPlacementActions';
import useAdminResourceActions from './adminDashboard/hooks/useAdminResourceActions';
import useAdminDashboardViewState from './adminDashboard/hooks/useAdminDashboardViewState';
import { useAdminFeedback } from './adminDashboard/hooks/useAdminFeedback.js';
import { buildSelectedDetail, isSameStudent } from './adminDashboard/helpers';

const LOADING_STYLE = {
  textAlign: 'center',
  marginTop: '50px',
  fontFamily: '"Montserrat", sans-serif',
  color: stemRed,
  fontWeight: 'bold',
};

function AdminDashboard() {
  const navigate = useNavigate();
  const {
    isMobile,
    isSidebarOpen,
    setIsSidebarOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useResponsiveSidebar();
  const adminFeedback = useAdminFeedback();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);
  const {
    adminData,
    loading,
    students,
    pendingUsers,
    placements,
    evaluations,
    industries,
    monthlyReports,
    utsReports,
    finalReports,
    certificates,
    weeklyReports,
    vacancies,
    setVacancies,
    applications,
    setApplications,
    currentTemplates,
    setCurrentTemplates,
    fetchAdminData,
    fetchVacancies,
  } = useAdminDashboardData({
    navigate,
    onUnauthorized: handleLogout,
  });
  const {
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
  } = useAdminDashboardViewState({
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
  });

  const {
    handleToggleUserSelection,
    handleBulkDeleteUsers,
    handleEditStudentSubmit,
    handleDeleteStudentAccount,
    handleForceResetPassword,
    handleUpdateProfile,
    handleProfileFormChange,
    handleAdminPasswordChange,
    handlePasswordFormChange,
    handleApproveStudent,
    handleRejectStudent,
    handleApproveAllStudents,
  } = useStudentActions({
    selectedUserIds,
    setSelectedUserIds,
    editingStudent,
    setEditingStudent,
    profileForm,
    setProfileForm,
    setIsUpdatingProfile,
    adminData,
    fetchAdminData,
    passwordForm,
    setPasswordForm,
    setIsChangingPassword,
    handleLogout,
    filteredPending,
    setShowIncompleteOnly,
    feedback: adminFeedback,
  });

  const {
    openApprovePlacementModal,
    confirmApprovePlacement,
    handleApproveAllPlacements,
    handleVacancyChange,
    handleVacancySubmit,
    handleEditClick,
    handleCancelEdit,
    handleDeleteVacancy,
    handleUpdateAppStatus,
    handleArchiveApplication,
    handleRejectPlacement,
  } = useVacancyPlacementActions({
    placementToApprove,
    setPlacementToApprove,
    fetchAdminData,
    placements,
    vacancyForm,
    setVacancyForm,
    setSubmittingVacancy,
    editingVacancyId,
    setEditingVacancyId,
    vacancies,
    setVacancies,
    fetchVacancies,
    applications,
    setApplications,
    selectedApplication,
    setSelectedApplication,
    feedback: adminFeedback,
  });

  const {
    handleIssueCertificate,
    openEmailModal,
    handleSendCustomEmail,
    openDetailModal,
    handleTemplateChange,
    handleTemplateSubmit,
    getFileName,
    handleExportEvaluations,
    handleSendCompletionReminders,
    handleApproveSupervisorChange,
    handleRejectSupervisorChange,
    handleExportIndustries,
  } = useAdminResourceActions({
    gradeInput,
    monthlyReports,
    utsReports,
    finalReports,
    evaluations,
    setSelectedDetail,
    certificates,
    emailModal,
    setEmailModal,
    setSendingEmail,
    fetchAdminData,
    templateFiles,
    setTemplateFiles,
    setUploadingTemplate,
    setCurrentTemplates,
    industries,
    placements,
    students,
    feedback: adminFeedback,
  });

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  useEffect(() => {
    if (!adminData) {
      return;
    }

    setProfileForm({
      username: adminData.username || '',
      first_name: adminData.first_name || '',
      last_name: adminData.last_name || '',
    });
  }, [adminData, setProfileForm]);

  useEffect(() => {
    if (!selectedDetail?.placement?.id || !selectedDetail?.student?.id) {
      return;
    }

    const selectedPlacementId = selectedDetail.placement.id;
    const selectedStudentId = selectedDetail.student.id;
    const freshPlacement = placements.find((placement) => String(placement.id) === String(selectedPlacementId));
    if (!freshPlacement) {
      setSelectedDetail(null);
      return;
    }

    const freshStudent = students.find((student) => isSameStudent(freshPlacement.student, student.id))
      || students.find((student) => String(student.id) === String(selectedStudentId));

    if (!freshStudent) {
      return;
    }

    setSelectedDetail(buildSelectedDetail(
      freshPlacement,
      freshStudent,
      monthlyReports,
      utsReports,
      finalReports,
      evaluations,
      certificates,
      placements
    ));
  }, [
    selectedDetail?.placement?.id,
    selectedDetail?.student?.id,
    placements,
    students,
    monthlyReports,
    utsReports,
    finalReports,
    evaluations,
    certificates,
    setSelectedDetail,
  ]);

  useEffect(() => {
    const needsVacancyData = activeTab === 'lowongan' || activeTab === 'pelamar';

    if (needsVacancyData) {
      fetchVacancies();
    }

    if (activeTab !== 'lowongan') {
      fetchAdminData();
    }

    resetTabState();
  }, [activeTab, fetchAdminData, fetchVacancies, resetTabState]);

  const sharedTabProps = { styles, isMobile };
  const activeTabContent = {
    approval: (
      <ApprovalTab
        {...sharedTabProps}
        showIncompleteOnly={showIncompleteOnly}
        setShowIncompleteOnly={setShowIncompleteOnly}
        filterStatusAkun={filterStatusAkun}
        setFilterStatusAkun={setFilterStatusAkun}
        selectedUserIds={selectedUserIds}
        handleBulkDeleteUsers={handleBulkDeleteUsers}
        filteredPending={filteredPending}
        inactiveApprovalUsers={filteredInactive}
        handleApproveAllStudents={handleApproveAllStudents}
        approvalDataFiltered={approvalDataFiltered}
        handleToggleUserSelection={handleToggleUserSelection}
        handleApproveStudent={handleApproveStudent}
        handleRejectStudent={handleRejectStudent}
        handleDeleteStudentAccount={handleDeleteStudentAccount}
      />
    ),
    overview: (
      <OverviewTab
        {...sharedTabProps}
        filterStatusMagang={filterStatusMagang}
        setFilterStatusMagang={setFilterStatusMagang}
        placements={placements}
        handleApproveAllPlacements={handleApproveAllPlacements}
        overviewStudentsFiltered={overviewStudentsFiltered}
        monthlyReports={monthlyReports}
        hitungDurasi={hitungDurasi}
        setEditingStudent={setEditingStudent}
        handleRejectPlacement={handleRejectPlacement}
        openApprovePlacementModal={openApprovePlacementModal}
      />
    ),
    job_seeker: (
      <JobSeekerTab
        {...sharedTabProps}
        filterStatusJobSeeker={filterStatusJobSeeker}
        setFilterStatusJobSeeker={setFilterStatusJobSeeker}
        openEmailModal={openEmailModal}
        jobSeekerFiltered={jobSeekerFiltered}
        placements={placements}
        weeklyReports={weeklyReports}
        setSelectedStudentReports={setSelectedStudentReports}
      />
    ),
    industri: (
      <IndustriTab
        {...sharedTabProps}
        industries={industriesFiltered}
        handleExportIndustries={handleExportIndustries}
      />
    ),
    lowongan: (
      <LowonganTab
        {...sharedTabProps}
        editingVacancyId={editingVacancyId}
        handleVacancySubmit={handleVacancySubmit}
        handleVacancyChange={handleVacancyChange}
        vacancyForm={vacancyForm}
        handleCancelEdit={handleCancelEdit}
        submittingVacancy={submittingVacancy}
        vacancies={vacanciesFiltered}
        handleEditClick={handleEditClick}
        handleDeleteVacancy={handleDeleteVacancy}
      />
    ),
    pelamar: (
      <PelamarTab
        {...sharedTabProps}
        filterStatusPelamar={filterStatusPelamar}
        setFilterStatusPelamar={setFilterStatusPelamar}
        applicationsFiltered={applicationsFiltered}
        students={students}
        vacancies={vacancies}
        setSelectedApplication={setSelectedApplication}
        handleArchiveApplication={handleArchiveApplication}
      />
    ),
    evaluasi: (
      <EvaluasiTab
        {...sharedTabProps}
        filterStatusEvaluasi={filterStatusEvaluasi}
        setFilterStatusEvaluasi={setFilterStatusEvaluasi}
        openEmailModal={openEmailModal}
        handleExportEvaluations={handleExportEvaluations}
        evaluasiFiltered={evaluasiFiltered}
        students={students}
        evaluations={evaluations}
        utsReports={utsReports}
        finalReports={finalReports}
        handleApproveSupervisorChange={handleApproveSupervisorChange}
        handleRejectSupervisorChange={handleRejectSupervisorChange}
      />
    ),
    berkas: (
      <BerkasTab
        {...sharedTabProps}
        handleTemplateSubmit={handleTemplateSubmit}
        currentTemplates={currentTemplates}
        getFileName={getFileName}
        handleTemplateChange={handleTemplateChange}
        uploadingTemplate={uploadingTemplate}
        filterStatusBerkas={filterStatusBerkas}
        setFilterStatusBerkas={setFilterStatusBerkas}
        berkasFiltered={berkasFiltered}
        students={students}
        certificates={certificates}
        placements={placements}
        monthlyReports={monthlyReports}
        utsReports={utsReports}
        finalReports={finalReports}
        evaluations={evaluations}
        openDetailModal={openDetailModal}
        handleSendCompletionReminders={handleSendCompletionReminders}
      />
    ),
    pengaturan: (
      <PengaturanTab
        {...sharedTabProps}
        handleUpdateProfile={handleUpdateProfile}
        profileForm={profileForm}
        handleProfileFormChange={handleProfileFormChange}
        isUpdatingProfile={isUpdatingProfile}
        handleAdminPasswordChange={handleAdminPasswordChange}
        passwordForm={passwordForm}
        handlePasswordFormChange={handlePasswordFormChange}
        isChangingPassword={isChangingPassword}
      />
    ),
  };

  const dashboardShellProps = {
    styles,
    stemRed,
    activeTab,
    setActiveTab,
    adminData,
    handleLogout,
    isMobile,
    isSearching: false,
    isSidebarOpen,
    setIsSidebarOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    badges,
    searchQuery,
    setSearchQuery,
    filterProdi,
    setFilterProdi,
    uniqueProdis,
  };

  const dashboardModalsProps = {
    styles,
    isMobile,
    uniqueProdis,
    editingStudent,
    setEditingStudent,
    handleEditStudentSubmit,
    handleForceResetPassword,
    selectedApplication,
    setSelectedApplication,
    handleUpdateAppStatus,
    handleArchiveApplication,
    placementToApprove,
    setPlacementToApprove,
    confirmApprovePlacement,
    selectedStudentReports,
    setSelectedStudentReports,
    selectedDetail,
    setSelectedDetail,
    gradeInput,
    setGradeInput,
    handleIssueCertificate,
    emailModal,
    setEmailModal,
    handleSendCustomEmail,
    sendingEmail,
    placements
  };

  if (loading) {
    return <div style={LOADING_STYLE}>Memuat Portal Admin STEM...</div>;
  }

  return (
    <DashboardShell {...dashboardShellProps}>
      {activeTabContent[activeTab] || null}

      <DashboardModals {...dashboardModalsProps} />
      <AdminFeedbackLayer feedback={adminFeedback} isMobile={isMobile} />
    </DashboardShell>
  );
}

export default AdminDashboard;
