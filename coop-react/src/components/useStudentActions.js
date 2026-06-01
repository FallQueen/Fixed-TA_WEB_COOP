import axios from 'axios';
import {
  API_BASE_URL,
  EMPTY_APPLICATION_FORM,
  EMPTY_FINAL_REPORT_DATA,
  EMPTY_REPORT_FORM,
  EMPTY_UTS_REPORT_DATA,
  EMPTY_WEEKLY_FORM,
  MIN_INTERNSHIP_WORKING_DAYS,
  calculateWorkingDays,
  createAuthHeaders,
} from './constants';
import { getFeedbackApi } from './adminDashboard/hooks/useAdminFeedback';

const getApiErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.join('\n');
  if (data.error) return Array.isArray(data.error) ? data.error.join('\n') : data.error;
  if (data.detail) return Array.isArray(data.detail) ? data.detail.join('\n') : data.detail;

  return Object.entries(data)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join('\n') || fallback;
};

function useStudentActions({
  fetchMonthlyReports,
  fetchNotifications,
  fetchPlacementsAndEvaluations,
  fetchProfile,
  fetchSubmittedReports,
  fetchStudentApplications,
  fetchWeeklyReports,
  handleLogout,
  deleteAllNotifications,
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  selectedVacancy,
  setActiveTab,
  setApplicationForm,
  setChangingPassword,
  setEditingReportId,
  setFiles,
  setFinalReportData,
  setFinalReportFile,
  setIsApplying,
  setIsUpdatingProfile,
  markProfileFormDirty,
  syncProfileForm,
  setProfileForm,
  setReportForm,
  setSelectedVacancy,
  setSubmittingApplication,
  setSubmittingFinal,
  setSubmittingPlacement,
  setSubmittingReport,
  setSubmittingUts,
  setSubmittingWeekly,
  setUploading,
  setUserData,
  setUtsReportData,
  setUtsReportFile,
  setWeeklyForm,
  userData,
  feedback,
}) {
  const { notify, showAlert, showConfirm } = getFeedbackApi(feedback);

  const closeModal = () => {
    setSelectedVacancy(null);
    setIsApplying(false);
    setApplicationForm({ ...EMPTY_APPLICATION_FORM });
  };

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    setFiles((currentFiles) => ({ ...currentFiles, [name]: files[0] }));
  };

  const handleUpload = async (event, files) => {
    event.preventDefault();
    if (!files.cv_file && !files.portofolio_file) {
      notify({ type: 'warning', title: 'File Belum Dipilih', message: 'Pilih file yang ingin diupload terlebih dahulu.' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    if (files.cv_file) formData.append('cv_file', files.cv_file);
    if (files.portofolio_file) formData.append('portofolio_file', files.portofolio_file);

    try {
      const response = await axios.patch(`${API_BASE_URL}/users/me/`, formData, {
        headers: createAuthHeaders({ 'Content-Type': 'multipart/form-data' }),
      });

      notify({ type: 'success', title: 'Berkas Diperbarui', message: 'Berkas profil berhasil diperbarui.' });
      setUserData(response.data);
      setFiles({ cv_file: null, portofolio_file: null });
      document.getElementById('upload-form')?.reset();
    } catch {
      notify({ type: 'danger', title: 'Gagal Upload Berkas', message: 'Berkas belum berhasil diunggah.' });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (event, profileForm) => {
    event.preventDefault();
    if (!profileForm.username) {
      notify({ type: 'warning', title: 'Username Kosong', message: 'Username tidak boleh kosong.' });
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/users/${userData.id}/`,
        {
          username: profileForm.username.trim(),
          first_name: profileForm.first_name,
          last_name: profileForm.last_name,
        },
        { headers: createAuthHeaders() }
      );

      notify({ type: 'success', title: 'Profil Diperbarui', message: 'Profil dan username berhasil diperbarui. Gunakan username baru saat login berikutnya.' });
      setUserData(response.data);
      syncProfileForm(response.data);
      fetchProfile();
    } catch (error) {
      const errorMessage =
        error.response?.data?.username?.[0] ||
        'Gagal memperbarui profil. Pastikan username belum dipakai orang lain.';
      notify({ type: 'danger', title: 'Gagal Memperbarui Profil', message: errorMessage });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleProfileFormChange = (event) => {
    const { name, value } = event.target;

    markProfileFormDirty();
    setProfileForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handlePasswordChange = async (event, passwordForm) => {
    event.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      notify({ type: 'warning', title: 'Konfirmasi Password Tidak Cocok', message: 'Password baru dan konfirmasi password tidak cocok.' });
      return;
    }

    setChangingPassword(true);
    try {
      await axios.patch(
        `${API_BASE_URL}/users/change-password/`,
        {
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password,
        },
        { headers: createAuthHeaders() }
      );

      await showAlert({
        type: 'success',
        title: 'Password Diperbarui',
        message: 'Password kamu telah diperbarui. Sesi akan berakhir, silakan login kembali.',
        confirmLabel: 'Login Ulang',
      });
      handleLogout();
    } catch (error) {
      notify({
        type: 'danger',
        title: 'Gagal Mengubah Password',
        message: error.response?.data?.old_password?.[0] || 'Gagal mengubah password. Cek kembali password lama kamu.',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleApplySubmit = async (event, applicationForm) => {
    event.preventDefault();
    if (!userData?.cv_file) {
      await showAlert({
        type: 'warning',
        title: 'CV Belum Diunggah',
        message: 'Kamu wajib mengunggah CV di tab Profil terlebih dahulu sebelum melamar.',
      });
      return;
    }

    setSubmittingApplication(true);
    try {
      await axios.post(
        `${API_BASE_URL}/applications/`,
        { vacancy: selectedVacancy.id, cover_letter: applicationForm.cover_letter },
        { headers: createAuthHeaders() }
      );

      notify({ type: 'success', title: 'Lamaran Berhasil Dikirim', message: 'Admin akan meneruskan data kamu ke perusahaan.' });
      closeModal();
      fetchStudentApplications?.();
    } catch {
      notify({ type: 'danger', title: 'Gagal Mengirim Lamaran', message: 'Terjadi kesalahan. Mungkin kamu sudah melamar posisi ini.' });
    } finally {
      setSubmittingApplication(false);
    }
  };

  const handleWithdrawApplication = async (application, reason) => {
    if (!application) {
      return { ok: false, message: 'Lamaran tidak ditemukan.' };
    }

    const withdrawalReason = String(reason || '').trim();
    if (!withdrawalReason) {
      return { ok: false, message: 'Alasan menarik lamaran wajib diisi.' };
    }

    try {
      await axios.patch(
        `${API_BASE_URL}/applications/${application.id}/`,
        {
          status: 'withdrawn',
          withdrawal_reason: withdrawalReason,
        },
        { headers: createAuthHeaders() }
      );

      fetchStudentApplications?.();
      fetchNotifications?.();
      return { ok: true, message: 'Lamaran berhasil ditarik. Admin akan melihat alasan penarikanmu.' };
    } catch (error) {
      return { ok: false, message: getApiErrorMessage(error, 'Gagal menarik lamaran. Silakan coba lagi.') };
    }
  };

  const handlePlacementSubmit = async (event, acceptanceLetter, placementForm) => {
    event.preventDefault();

    if (
      placementForm.previous_placement_end_date
      && placementForm.start_date
      && placementForm.start_date <= placementForm.previous_placement_end_date
    ) {
      await showAlert({
        type: 'warning',
        title: 'Tanggal Pindah Tidak Valid',
        message: 'Tanggal mulai tempat magang baru harus setelah tanggal terakhir bekerja di tempat magang lama.',
      });
      return;
    }

    if (placementForm.previous_placement_end_date && !String(placementForm.transfer_reason || '').trim()) {
      notify({ type: 'warning', title: 'Alasan Pindah Kosong', message: 'Alasan pindah tempat magang wajib diisi.' });
      return;
    }

    const workingDays = calculateWorkingDays(placementForm.start_date, placementForm.end_date);
    if (!placementForm.previous_placement_end_date && workingDays < MIN_INTERNSHIP_WORKING_DAYS) {
      await showAlert({
        type: 'warning',
        title: 'Durasi Magang Belum Cukup',
        message: `Durasi magang minimal ${MIN_INTERNSHIP_WORKING_DAYS} hari kerja (Senin-Jumat). Durasi yang dipilih saat ini ${workingDays} hari kerja.`,
      });
      return;
    }

    setSubmittingPlacement(true);

    const formData = new FormData();
    Object.entries(placementForm).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (acceptanceLetter) formData.append('acceptance_letter', acceptanceLetter);

    try {
      await axios.post(`${API_BASE_URL}/placements/`, formData, {
        headers: createAuthHeaders({ 'Content-Type': 'multipart/form-data' }),
      });

      notify({ type: 'success', title: 'Laporan Magang Dikirim', message: 'Laporan magang berhasil dikirim dan menunggu verifikasi admin.' });
      setActiveTab('profil');
      fetchPlacementsAndEvaluations();
      fetchStudentApplications?.();
    } catch (error) {
      notify({ type: 'danger', title: 'Gagal Mengirim Laporan', message: getApiErrorMessage(error, 'Gagal mengirim laporan.') });
    } finally {
      setSubmittingPlacement(false);
    }
  };

  const handleRequestSupervisorChange = async (placementId, supervisorChangeForm) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/placements/${placementId}/request-supervisor-change/`,
        supervisorChangeForm,
        { headers: createAuthHeaders() }
      );

      notify({
        type: 'success',
        title: 'Perubahan Supervisor Diajukan',
        message: response.data?.message || 'Data supervisor baru sedang menunggu persetujuan admin.',
      });
      fetchPlacementsAndEvaluations();
      fetchNotifications?.();
      return true;
    } catch (error) {
      notify({
        type: 'danger',
        title: 'Pengajuan Belum Terkirim',
        message: getApiErrorMessage(error, 'Perubahan kontak supervisor belum berhasil diajukan.'),
      });
      return false;
    }
  };

  const handleWeeklySubmit = async (event, weeklyForm) => {
    event.preventDefault();
    setSubmittingWeekly(true);

    try {
      await axios.post(`${API_BASE_URL}/weekly-reports/`, weeklyForm, {
        headers: createAuthHeaders(),
      });

      notify({ type: 'success', title: 'Laporan Mingguan Dikirim', message: 'Laporan mingguan berhasil dikirim.' });
      setWeeklyForm({ ...EMPTY_WEEKLY_FORM });
      fetchWeeklyReports();
    } catch {
      notify({ type: 'danger', title: 'Gagal Mengirim Laporan', message: 'Laporan mingguan belum berhasil dikirim.' });
    } finally {
      setSubmittingWeekly(false);
    }
  };

  const handleReportChange = (event) => {
    const { name, value } = event.target;
    setReportForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleReportSubmit = async (event, editingReportId, reportForm) => {
    event.preventDefault();
    setSubmittingReport(true);

    try {
      if (editingReportId) {
        await axios.patch(`${API_BASE_URL}/monthly-reports/${editingReportId}/`, reportForm, {
          headers: createAuthHeaders(),
        });
        notify({ type: 'success', title: 'Laporan Bulanan Diperbarui', message: 'Laporan bulanan berhasil diperbarui.' });
      } else {
        await axios.post(`${API_BASE_URL}/monthly-reports/`, reportForm, {
          headers: createAuthHeaders(),
        });
        notify({ type: 'success', title: 'Laporan Bulanan Dikirim', message: 'Laporan bulanan berhasil dikirim.' });
      }

      setReportForm({ ...EMPTY_REPORT_FORM });
      setEditingReportId(null);
      fetchMonthlyReports();
    } catch (error) {
      notify({ type: 'danger', title: 'Gagal Memproses Laporan', message: getApiErrorMessage(error, 'Gagal memproses laporan.') });
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleEditMonthlyReport = (report) => {
    setEditingReportId(report.id);
    setReportForm({
      placement: typeof report.placement === 'object' ? report.placement.id : report.placement,
      report_month: report.report_month,
      company_profile: report.company_profile,
      job_description: report.job_description,
      work_environment: report.work_environment,
      useful_courses: report.useful_courses,
      new_skills: report.new_skills,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch {
      notify({ type: 'danger', title: 'Gagal Memperbarui Notifikasi', message: 'Gagal menandai notifikasi sebagai dibaca.' });
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllNotificationsAsRead();
    } catch {
      notify({ type: 'danger', title: 'Gagal Memperbarui Notifikasi', message: 'Gagal menandai semua notifikasi.' });
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    const confirmed = await showConfirm({
      type: 'confirm',
      title: 'Hapus Notifikasi?',
      message: 'Notifikasi ini akan dihapus dari daftar kamu.',
      confirmLabel: 'Hapus',
    });
    if (!confirmed) {
      return;
    }

    try {
      await deleteNotification(notificationId);
    } catch {
      notify({ type: 'danger', title: 'Gagal Menghapus Notifikasi', message: 'Gagal menghapus notifikasi.' });
    }
  };

  const handleDeleteAllNotifications = async () => {
    const confirmed = await showConfirm({
      type: 'danger',
      title: 'Hapus Semua Notifikasi?',
      message: 'Semua notifikasi akan dihapus. Tindakan ini tidak bisa dibatalkan.',
      confirmLabel: 'Hapus Semua',
    });
    if (!confirmed) {
      return;
    }

    try {
      await deleteAllNotifications();
    } catch {
      notify({ type: 'danger', title: 'Gagal Menghapus Notifikasi', message: 'Gagal menghapus semua notifikasi.' });
    }
  };

  const handleOpenNotification = async (notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
      } catch {
        notify({ type: 'danger', title: 'Gagal Membuka Notifikasi', message: 'Gagal membuka notifikasi.' });
        return;
      }
    }

    if (notification.target_tab) {
      setActiveTab(notification.target_tab);
      fetchNotifications();
    }
  };

  const cancelEditMonthlyReport = () => {
    setEditingReportId(null);
    setReportForm({ ...EMPTY_REPORT_FORM });
  };

  const submitEvaluationReport = async ({
    endpoint,
    existingReport,
    file,
    payload,
    resetData,
    setSubmitting,
    successMessages,
  }) => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append('placement', payload.placement);
    formData.append('description', payload.description);
    if (file) formData.append('report_file', file);

    try {
      if (existingReport) {
        await axios.patch(`${API_BASE_URL}/${endpoint}/${existingReport.id}/`, formData, {
          headers: createAuthHeaders({ 'Content-Type': 'multipart/form-data' }),
        });
        notify({ type: 'success', title: 'Laporan Diperbarui', message: successMessages.update });
      } else {
        await axios.post(`${API_BASE_URL}/${endpoint}/`, formData, {
          headers: createAuthHeaders({ 'Content-Type': 'multipart/form-data' }),
        });
        notify({ type: 'success', title: 'Laporan Dikirim', message: successMessages.create });
      }

      resetData();
      fetchSubmittedReports();
    } catch {
      notify({ type: 'danger', title: 'Gagal Memproses Laporan', message: 'Gagal memproses laporan.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUtsReportSubmit = async (event, submittedUts, utsReportData, utsReportFile) => {
    event.preventDefault();
    await submitEvaluationReport({
      endpoint: 'uts-reports',
      existingReport: submittedUts,
      file: utsReportFile,
      payload: utsReportData,
      resetData: () => {
        setUtsReportData({ ...EMPTY_UTS_REPORT_DATA });
        setUtsReportFile(null);
      },
      setSubmitting: setSubmittingUts,
      successMessages: {
        create: 'Laporan UTS berhasil dikumpulkan!',
        update: 'File Laporan UTS berhasil diperbarui!',
      },
    });
  };

  const handleFinalReportSubmit = async (
    event,
    submittedFinal,
    finalReportData,
    finalReportFile
  ) => {
    event.preventDefault();
    await submitEvaluationReport({
      endpoint: 'final-reports',
      existingReport: submittedFinal,
      file: finalReportFile,
      payload: finalReportData,
      resetData: () => {
        setFinalReportData({ ...EMPTY_FINAL_REPORT_DATA });
        setFinalReportFile(null);
      },
      setSubmitting: setSubmittingFinal,
      successMessages: {
        create: 'Laporan Akhir (UAS) berhasil dikumpulkan!',
        update: 'File Laporan Akhir (UAS) berhasil diperbarui!',
      },
    });
  };

  return {
    cancelEditMonthlyReport,
    closeModal,
    handleDeleteAllNotifications,
    handleDeleteNotification,
    handleApplySubmit,
    handleWithdrawApplication,
    handleEditMonthlyReport,
    handleFileChange,
    handleFinalReportSubmit,
    handleMarkAllNotificationsRead,
    handleMarkNotificationRead,
    handleOpenNotification,
    handlePasswordChange,
    handlePlacementSubmit,
    handleRequestSupervisorChange,
    handleProfileFormChange,
    handleReportChange,
    handleReportSubmit,
    handleUpdateProfile,
    handleUpload,
    handleUtsReportSubmit,
    handleWeeklySubmit,
  };
}

export default useStudentActions;
