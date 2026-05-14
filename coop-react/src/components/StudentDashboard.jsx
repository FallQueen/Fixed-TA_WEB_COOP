import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentPreviewModal,
  VacancyModal,
} from './studentDashboard/StudentDashboardSections';
import StudentDashboardSidebar from './studentDashboard/StudentDashboardSidebar';
import StudentDashboardTabContent from './studentDashboard/StudentDashboardTabContent';
import useStudentDashboardViewState from './studentDashboard/hooks/useStudentDashboardViewState';
import { GLOBAL_STYLES } from './studentDashboard/styles';
import useStudentActions from './useStudentActions';
import useStudentDashboardData from './useStudentDashboardData';

import { Loader2, Menu } from 'lucide-react';

function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profil');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  const dashboardData = useStudentDashboardData({
    activeTab,
    navigate,
    onUnauthorized: handleLogout,
  });

  const viewState = useStudentDashboardViewState({
    activeTab,
    setActiveTab,
    editingReportId: dashboardData.editingReportId,
    evaluations: dashboardData.evaluations,
    monthlyReports: dashboardData.monthlyReports,
    placements: dashboardData.placements,
    userId: dashboardData.userData?.id,
  });

  const studentActions = useStudentActions({
    fetchMonthlyReports: dashboardData.fetchMonthlyReports,
    fetchNotifications: dashboardData.fetchNotifications,
    fetchPlacementsAndEvaluations: dashboardData.fetchPlacementsAndEvaluations,
    fetchProfile: dashboardData.fetchProfile,
    fetchSubmittedReports: dashboardData.fetchSubmittedReports,
    fetchWeeklyReports: dashboardData.fetchWeeklyReports,
    handleLogout,
    deleteAllNotifications: dashboardData.deleteAllNotifications,
    deleteNotification: dashboardData.deleteNotification,
    markAllNotificationsAsRead: dashboardData.markAllNotificationsAsRead,
    markNotificationAsRead: dashboardData.markNotificationAsRead,
    selectedVacancy: viewState.selectedVacancy,
    setActiveTab: viewState.setActiveTab,
    setApplicationForm: dashboardData.setApplicationForm,
    setChangingPassword: dashboardData.setChangingPassword,
    setEditingReportId: dashboardData.setEditingReportId,
    setFiles: dashboardData.setFiles,
    setFinalReportData: dashboardData.setFinalReportData,
    setFinalReportFile: dashboardData.setFinalReportFile,
    setIsApplying: viewState.setIsApplying,
    setIsUpdatingProfile: dashboardData.setIsUpdatingProfile,
    markProfileFormDirty: dashboardData.markProfileFormDirty,
    syncProfileForm: dashboardData.syncProfileForm,
    setProfileForm: dashboardData.setProfileForm,
    setReportForm: dashboardData.setReportForm,
    setSelectedVacancy: viewState.setSelectedVacancy,
    setSubmittingApplication: dashboardData.setSubmittingApplication,
    setSubmittingFinal: dashboardData.setSubmittingFinal,
    setSubmittingPlacement: dashboardData.setSubmittingPlacement,
    setSubmittingReport: dashboardData.setSubmittingReport,
    setSubmittingUts: dashboardData.setSubmittingUts,
    setSubmittingWeekly: dashboardData.setSubmittingWeekly,
    setUploading: dashboardData.setUploading,
    setUserData: dashboardData.setUserData,
    setUtsReportData: dashboardData.setUtsReportData,
    setUtsReportFile: dashboardData.setUtsReportFile,
    setWeeklyForm: dashboardData.setWeeklyForm,
    userData: dashboardData.userData,
  });

  const dataForTabs = {
    ...dashboardData,
    approvedPlacements: viewState.approvedPlacements,
  };

  if (dashboardData.loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '15px',
          color: '#003366',
          fontFamily: '"Montserrat", sans-serif',
        }}
      >
        <Loader2 size={40} className="animate-spin" />
        <span style={{ fontSize: '18px', fontWeight: '600' }}>Memuat Portal Co-op...</span>
      </div>
    );
  }

  return (
    <div style={viewState.styles.dashboardContainer}>
      <style>{GLOBAL_STYLES}</style>

      <StudentDashboardSidebar
        activeTab={viewState.activeTab}
        handleLogout={handleLogout}
        handleTabChange={viewState.handleTabChange}
        hasApprovedPlacement={viewState.hasApprovedPlacement}
        hasSeenUas={viewState.hasSeenUas}
        hasSeenUts={viewState.hasSeenUts}
        isMobile={viewState.isMobile}
        isSidebarCollapsed={viewState.isSidebarCollapsed}
        isSidebarOpen={viewState.isSidebarOpen}
        isUasTriggered={viewState.isUasTriggered}
        isUtsTriggered={viewState.isUtsTriggered}
        notificationCount={dashboardData.notifications.filter((notification) => !notification.is_read).length}
        setIsSidebarCollapsed={viewState.setIsSidebarCollapsed}
        setIsSidebarOpen={viewState.setIsSidebarOpen}
        styles={viewState.styles}
        submittedFinal={dashboardData.submittedFinal}
        submittedUts={dashboardData.submittedUts}
      />

      <div style={viewState.styles.mainContent}>
        {viewState.isMobile && (
          <div style={viewState.styles.mobileHeader}>
            <button
              onClick={() => viewState.setIsSidebarOpen(true)}
              style={viewState.styles.hamburgerBtn}
            >
              <Menu size={20} />
            </button>
            <h3 style={{ margin: 0, color: '#003366', fontSize: '18px', fontWeight: '700' }}>Portal Co-op</h3>
          </div>
        )}

        <StudentDashboardTabContent
          actions={studentActions}
          data={dataForTabs}
          viewState={viewState}
        />
      </div>

      <VacancyModal
        applicationForm={dashboardData.applicationForm}
        closeModal={studentActions.closeModal}
        handleApplySubmit={studentActions.handleApplySubmit}
        hasAnyPlacement={viewState.hasAnyPlacement}
        isApplying={viewState.isApplying}
        isMobile={viewState.isMobile}
        selectedVacancy={viewState.selectedVacancy}
        setApplicationForm={dashboardData.setApplicationForm}
        setIsApplying={viewState.setIsApplying}
        styles={viewState.styles}
        submittingApplication={dashboardData.submittingApplication}
        userData={dashboardData.userData}
      />

      <DocumentPreviewModal
        isMobile={viewState.isMobile}
        previewDoc={viewState.previewDoc}
        setPreviewDoc={viewState.setPreviewDoc}
        styles={viewState.styles}
      />
    </div>
  );
}

export default StudentDashboard;
