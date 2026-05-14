import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  API_BASE_URL,
  EMPTY_APPLICATION_FORM,
  EMPTY_FINAL_REPORT_DATA,
  EMPTY_PASSWORD_FORM,
  EMPTY_PLACEMENT_FORM,
  EMPTY_PROFILE_FORM,
  EMPTY_REPORT_FORM,
  EMPTY_UTS_REPORT_DATA,
  EMPTY_WEEKLY_FORM,
  PLACEMENT_DATA_TABS,
  REPORT_TEMPLATE_TABS,
  createAuthHeaders,
  getAuthToken,
} from './constants';

function useStudentDashboardData({ activeTab, navigate, onUnauthorized }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const onUnauthorizedRef = useRef(onUnauthorized);

  const [vacancies, setVacancies] = useState([]);
  const [loadingVacancies, setLoadingVacancies] = useState(false);

  const [applicationForm, setApplicationForm] = useState({ ...EMPTY_APPLICATION_FORM });
  const [submittingApplication, setSubmittingApplication] = useState(false);

  const [files, setFiles] = useState({ cv_file: null, portofolio_file: null });
  const [uploading, setUploading] = useState(false);

  const [profileForm, setProfileForm] = useState({ ...EMPTY_PROFILE_FORM });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const profileFormDirtyRef = useRef(false);

  const [passwordForm, setPasswordForm] = useState({ ...EMPTY_PASSWORD_FORM });
  const [changingPassword, setChangingPassword] = useState(false);

  const [placementForm, setPlacementForm] = useState({ ...EMPTY_PLACEMENT_FORM });
  const [acceptanceLetter, setAcceptanceLetter] = useState(null);
  const [submittingPlacement, setSubmittingPlacement] = useState(false);
  const [placements, setPlacements] = useState([]);

  const [reportForm, setReportForm] = useState({ ...EMPTY_REPORT_FORM });
  const [submittingReport, setSubmittingReport] = useState(false);
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [editingReportId, setEditingReportId] = useState(null);

  const [weeklyReports, setWeeklyReports] = useState([]);
  const [weeklyForm, setWeeklyForm] = useState({ ...EMPTY_WEEKLY_FORM });
  const [submittingWeekly, setSubmittingWeekly] = useState(false);

  const [utsReportData, setUtsReportData] = useState({ ...EMPTY_UTS_REPORT_DATA });
  const [utsReportFile, setUtsReportFile] = useState(null);
  const [submittingUts, setSubmittingUts] = useState(false);
  const [submittedUts, setSubmittedUts] = useState(null);

  const [finalReportData, setFinalReportData] = useState({ ...EMPTY_FINAL_REPORT_DATA });
  const [finalReportFile, setFinalReportFile] = useState(null);
  const [submittingFinal, setSubmittingFinal] = useState(false);
  const [submittedFinal, setSubmittedFinal] = useState(null);

  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [templates, setTemplates] = useState({ uts_template: null, uas_template: null });
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  }, [onUnauthorized]);

  const syncProfileForm = useCallback((profile) => {
    profileFormDirtyRef.current = false;
    setProfileForm({
      username: profile?.username || '',
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
    });
  }, []);

  const markProfileFormDirty = useCallback(() => {
    profileFormDirtyRef.current = true;
  }, []);

  const fetchProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/users/me/`, {
        headers: createAuthHeaders(),
      });

      setUserData(response.data);

      if (!profileFormDirtyRef.current) {
        syncProfileForm(response.data);
      }
    } catch {
      onUnauthorizedRef.current?.();
    } finally {
      setLoading(false);
    }
  }, [navigate, syncProfileForm]);

  const fetchVacancies = async () => {
    setLoadingVacancies(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/vacancies/`, {
        headers: createAuthHeaders(),
      });
      setVacancies(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingVacancies(false);
    }
  };

  const fetchPlacementsAndEvaluations = async () => {
    try {
      const [placementResponse, evaluationResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/placements/`, { headers: createAuthHeaders() }),
        axios.get(`${API_BASE_URL}/evaluations/`, { headers: createAuthHeaders() }),
      ]);

      setPlacements(placementResponse.data);
      setEvaluations(evaluationResponse.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMonthlyReports = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/monthly-reports/`, {
        headers: createAuthHeaders(),
      });
      setMonthlyReports(response.data);
    } catch (error) {
      console.error('Gagal ambil laporan bulanan', error);
    }
  };

  const fetchSubmittedReports = async () => {
    try {
      const [utsResponse, finalResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/uts-reports/`, { headers: createAuthHeaders() }),
        axios.get(`${API_BASE_URL}/final-reports/`, { headers: createAuthHeaders() }),
      ]);

      setSubmittedUts(utsResponse.data?.[0] || null);
      setSubmittedFinal(finalResponse.data?.[0] || null);
    } catch (error) {
      console.error('Gagal mengambil data laporan', error);
    }
  };

  const fetchCertificates = async () => {
    setLoadingCertificates(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/certificates/`, {
        headers: createAuthHeaders(),
      });
      setCertificates(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCertificates(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/templates/`, {
        headers: createAuthHeaders(),
      });

      if (response.data && !response.data.detail) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Gagal mengambil template', error);
    }
  };

  const fetchWeeklyReports = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/weekly-reports/`, {
        headers: createAuthHeaders(),
      });
      setWeeklyReports(response.data);
    } catch (error) {
      console.error('Gagal ambil data', error);
    }
  };

  const fetchNotifications = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      return;
    }

    setLoadingNotifications(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/`, {
        headers: createAuthHeaders(),
      });
      setNotifications(response.data);
    } catch {
      onUnauthorizedRef.current?.();
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    const response = await axios.post(
      `${API_BASE_URL}/notifications/${notificationId}/mark_read/`,
      {},
      { headers: createAuthHeaders() }
    );

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId ? response.data : notification
      )
    );

    return response.data;
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    await axios.post(
      `${API_BASE_URL}/notifications/mark_all_read/`,
      {},
      { headers: createAuthHeaders() }
    );

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({ ...notification, is_read: true }))
    );
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    await axios.delete(`${API_BASE_URL}/notifications/${notificationId}/`, {
      headers: createAuthHeaders(),
    });

    setNotifications((currentNotifications) =>
      currentNotifications.filter((notification) => notification.id !== notificationId)
    );
  }, []);

  const deleteAllNotifications = useCallback(async () => {
    await axios.delete(`${API_BASE_URL}/notifications/delete_all/`, {
      headers: createAuthHeaders(),
    });

    setNotifications([]);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (activeTab === 'lowongan') fetchVacancies();
    if (PLACEMENT_DATA_TABS.includes(activeTab)) fetchPlacementsAndEvaluations();
    if (activeTab === 'laporan_bulanan') fetchMonthlyReports();
    if (activeTab === 'sertifikat') fetchCertificates();
    if (REPORT_TEMPLATE_TABS.includes(activeTab)) {
      fetchTemplates();
      fetchSubmittedReports();
    }
    if (activeTab === 'lapor_mingguan') fetchWeeklyReports();
    if (activeTab === 'notifikasi') fetchNotifications();
  }, [activeTab]);

  return {
    acceptanceLetter,
    applicationForm,
    certificates,
    changingPassword,
    editingReportId,
    evaluations,
    files,
    finalReportData,
    finalReportFile,
    fetchMonthlyReports,
    fetchNotifications,
    fetchPlacementsAndEvaluations,
    fetchProfile,
    fetchSubmittedReports,
    fetchWeeklyReports,
    isUpdatingProfile,
    loading,
    loadingCertificates,
    loadingNotifications,
    loadingVacancies,
    deleteAllNotifications,
    deleteNotification,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    monthlyReports,
    notifications,
    passwordForm,
    placementForm,
    placements,
    profileForm,
    reportForm,
    setAcceptanceLetter,
    setApplicationForm,
    setCertificates,
    setChangingPassword,
    setEditingReportId,
    setEvaluations,
    setFiles,
    setFinalReportData,
    setFinalReportFile,
    setIsUpdatingProfile,
    setMonthlyReports,
    setPasswordForm,
    setPlacementForm,
    setPlacements,
    setProfileForm,
    markProfileFormDirty,
    setReportForm,
    setSubmittingApplication,
    setSubmittingFinal,
    setSubmittingPlacement,
    setSubmittingReport,
    setSubmittingUts,
    setSubmittingWeekly,
    setSubmittedFinal,
    setSubmittedUts,
    setTemplates,
    setUploading,
    setUserData,
    setUtsReportData,
    setUtsReportFile,
    setVacancies,
    setWeeklyForm,
    setWeeklyReports,
    syncProfileForm,
    submittedFinal,
    submittedUts,
    submittingApplication,
    submittingFinal,
    submittingPlacement,
    submittingReport,
    submittingUts,
    submittingWeekly,
    templates,
    uploading,
    userData,
    utsReportData,
    utsReportFile,
    vacancies,
    weeklyForm,
    weeklyReports,
  };
}

export default useStudentDashboardData;
