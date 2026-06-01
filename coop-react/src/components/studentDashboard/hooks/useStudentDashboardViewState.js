import { useEffect, useState } from 'react';
import {
  buildSupervisorReminderLink,
  getEvaluation,
  getIsFirstMonthReport,
  getPlacementState,
  isMobileViewport,
} from '../helpers';
import { getDashboardStyles } from '../styles';

const buildSeenStorageKey = (userId, placementId, reportType) =>
  `student-dashboard:${userId}:${placementId}:${reportType}:seen`;

const getStoredSeenState = (userId, placementId, reportType) => {
  if (!userId || !placementId) {
    return false;
  }

  return localStorage.getItem(buildSeenStorageKey(userId, placementId, reportType)) === 'true';
};

const setStoredSeenState = (userId, placementId, reportType) => {
  if (!userId || !placementId) {
    return;
  }

  localStorage.setItem(buildSeenStorageKey(userId, placementId, reportType), 'true');
};

export default function useStudentDashboardViewState({
  activeTab,
  setActiveTab,
  evaluations,
  monthlyReports,
  placements,
  editingReportId,
  reportForm,
  userId,
}) {
  const [isMobile, setIsMobile] = useState(isMobileViewport());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const mobileViewport = isMobileViewport();
      setIsMobile(mobileViewport);

      if (!mobileViewport) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (tab === 'laporan_uts') {
      setStoredSeenState(userId, placementState.approvedPlacementId, 'uts');
    }

    if (tab === 'laporan_akhir') {
      setStoredSeenState(userId, placementState.approvedPlacementId, 'uas');
    }

    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const styles = getDashboardStyles(isMobile, isSidebarOpen, isSidebarCollapsed);
  const placementState = getPlacementState(placements);
  const monthlyReportPlacementId = reportForm?.placement || placementState.approvedPlacementId;
  const utsEvaluation = getEvaluation(evaluations, placementState.approvedPlacementId, 'UTS');
  const uasEvaluation = getEvaluation(evaluations, placementState.approvedPlacementId, 'UAS');
  const hasSeenUts = getStoredSeenState(userId, placementState.approvedPlacementId, 'uts');
  const hasSeenUas = getStoredSeenState(userId, placementState.approvedPlacementId, 'uas');

  return {
    activeTab,
    setActiveTab,
    handleTabChange,
    hasSeenUas,
    hasSeenUts,
    isApplying,
    setIsApplying,
    isMobile,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isSidebarOpen,
    setIsSidebarOpen,
    previewDoc,
    setPreviewDoc,
    selectedVacancy,
    setSelectedVacancy,
    styles,
    ...placementState,
    isFirstMonthReport: getIsFirstMonthReport(monthlyReports, editingReportId, monthlyReportPlacementId),
    isUasTriggered: Boolean(uasEvaluation),
    isUtsTriggered: Boolean(utsEvaluation),
    uasEvaluation,
    uasReminderLink: buildSupervisorReminderLink(placementState.approvedPlacement, 'UAS'),
    utsEvaluation,
    utsReminderLink: buildSupervisorReminderLink(placementState.approvedPlacement, 'UTS'),
  };
}
