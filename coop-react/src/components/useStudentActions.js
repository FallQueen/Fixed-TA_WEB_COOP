import axios from 'axios';
import {
  API_BASE_URL,
  EMPTY_APPLICATION_FORM,
  EMPTY_FINAL_REPORT_DATA,
  EMPTY_REPORT_FORM,
  EMPTY_UTS_REPORT_DATA,
  EMPTY_WEEKLY_FORM,
  createAuthHeaders,
} from './constants';

function useStudentActions({
  fetchMonthlyReports,
  fetchNotifications,
  fetchPlacementsAndEvaluations,
  fetchProfile,
  fetchSubmittedReports,
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
}) {
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
      alert('Pilih file yang ingin diupload terlebih dahulu!');
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

      alert('Berkas berhasil diperbarui! 🎉');
      setUserData(response.data);
      setFiles({ cv_file: null, portofolio_file: null });
      document.getElementById('upload-form')?.reset();
    } catch {
      alert('Gagal mengupload berkas.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (event, profileForm) => {
    event.preventDefault();
    if (!profileForm.username) {
      alert('Username tidak boleh kosong!');
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

      alert('Profil & Username berhasil diperbarui! ✅\nSilakan gunakan Username baru ini saat login berikutnya.');
      setUserData(response.data);
      syncProfileForm(response.data);
      fetchProfile();
    } catch (error) {
      const errorMessage =
        error.response?.data?.username?.[0] ||
        'Gagal memperbarui profil. Pastikan username belum dipakai orang lain.';
      alert(errorMessage);
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
      alert('Password baru dan konfirmasi password tidak cocok!');
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

      alert('Berhasil! Password kamu telah diperbarui. 🔒\nSesi akan berakhir, silakan login kembali.');
      handleLogout();
    } catch (error) {
      alert(
        error.response?.data?.old_password?.[0] ||
          'Gagal mengubah password. Cek kembali password lama kamu.'
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleApplySubmit = async (event, applicationForm) => {
    event.preventDefault();
    if (!userData?.cv_file) {
      alert('Maaf, kamu wajib mengunggah CV di tab Profil terlebih dahulu sebelum melamar!');
      return;
    }

    setSubmittingApplication(true);
    try {
      await axios.post(
        `${API_BASE_URL}/applications/`,
        { vacancy: selectedVacancy.id, cover_letter: applicationForm.cover_letter },
        { headers: createAuthHeaders() }
      );

      alert('Lamaran Berhasil Dikirim! Admin akan meneruskan data kamu ke perusahaan.');
      closeModal();
    } catch {
      alert('Terjadi kesalahan. Mungkin kamu sudah melamar posisi ini?');
    } finally {
      setSubmittingApplication(false);
    }
  };

  const handlePlacementSubmit = async (event, acceptanceLetter, placementForm) => {
    event.preventDefault();
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

      alert('Laporan Magang berhasil dikirim! Menunggu verifikasi Admin.');
      setActiveTab('profil');
      fetchPlacementsAndEvaluations();
    } catch {
      alert('Gagal mengirim laporan.');
    } finally {
      setSubmittingPlacement(false);
    }
  };

  const handleWeeklySubmit = async (event, weeklyForm) => {
    event.preventDefault();
    setSubmittingWeekly(true);

    try {
      await axios.post(`${API_BASE_URL}/weekly-reports/`, weeklyForm, {
        headers: createAuthHeaders(),
      });

      alert('Laporan Mingguan berhasil dikirim!');
      setWeeklyForm({ ...EMPTY_WEEKLY_FORM });
      fetchWeeklyReports();
    } catch {
      alert('Gagal mengirim laporan.');
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
        alert('Laporan Bulanan berhasil diperbarui! ✅');
      } else {
        await axios.post(`${API_BASE_URL}/monthly-reports/`, reportForm, {
          headers: createAuthHeaders(),
        });
        alert('Laporan Bulanan berhasil dikirim! ✅');
      }

      setReportForm({ ...EMPTY_REPORT_FORM });
      setEditingReportId(null);
      fetchMonthlyReports();
    } catch {
      alert('Gagal memproses laporan.');
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
      alert('Gagal menandai notifikasi sebagai dibaca.');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllNotificationsAsRead();
    } catch {
      alert('Gagal menandai semua notifikasi.');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Hapus notifikasi ini?')) {
      return;
    }

    try {
      await deleteNotification(notificationId);
    } catch {
      alert('Gagal menghapus notifikasi.');
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (!window.confirm('Hapus semua notifikasi? Tindakan ini tidak bisa dibatalkan.')) {
      return;
    }

    try {
      await deleteAllNotifications();
    } catch {
      alert('Gagal menghapus semua notifikasi.');
    }
  };

  const handleOpenNotification = async (notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
      } catch {
        alert('Gagal membuka notifikasi.');
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
        alert(successMessages.update);
      } else {
        await axios.post(`${API_BASE_URL}/${endpoint}/`, formData, {
          headers: createAuthHeaders({ 'Content-Type': 'multipart/form-data' }),
        });
        alert(successMessages.create);
      }

      resetData();
      fetchSubmittedReports();
    } catch {
      alert('Gagal memproses laporan.');
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
    handleEditMonthlyReport,
    handleFileChange,
    handleFinalReportSubmit,
    handleMarkAllNotificationsRead,
    handleMarkNotificationRead,
    handleOpenNotification,
    handlePasswordChange,
    handlePlacementSubmit,
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
