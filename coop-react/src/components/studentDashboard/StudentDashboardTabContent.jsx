import {
  CertificatesTab,
  MonthlyReportsTab,
  NotificationsTab,
  PlacementReportTab,
  ProfileTab,
  SettingsTab,
  SubmissionReportTab,
  VacanciesTab,
  WeeklyProgressTab,
} from './StudentDashboardSections';
import {
  formatSubmissionDate,
  getPlacementOptionLabel,
} from './helpers';

export default function StudentDashboardTabContent({ actions, data, viewState }) {
  const {
    acceptanceLetter,
    certificates,
    changingPassword,
    editingReportId,
    files,
    finalReportData,
    finalReportFile,
    isUpdatingProfile,
    loadingCertificates,
    loadingNotifications,
    loadingVacancies,
    monthlyReports,
    notifications,
    passwordForm,
    placementForm,
    profileForm,
    reportForm,
    setAcceptanceLetter,
    setFinalReportData,
    setFinalReportFile,
    setPasswordForm,
    setPlacementForm,
    setUtsReportData,
    setUtsReportFile,
    setWeeklyForm,
    submittedFinal,
    submittedUts,
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
    approvedPlacements,
  } = data;
  const {
    handleDeleteAllNotifications,
    handleDeleteNotification,
    cancelEditMonthlyReport,
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
  } = actions;
  const {
    activeTab,
    currentPlacement,
    hasApprovedPlacement,
    hasAnyPlacement,
    hasPendingPlacement,
    historyPlacements,
    isFirstMonthReport,
    isMobile,
    isUasTriggered,
    isUtsTriggered,
    setPreviewDoc,
    setSelectedVacancy,
    styles,
    uasEvaluation,
    uasReminderLink,
    utsEvaluation,
    utsReminderLink,
  } = viewState;

  if (activeTab === 'profil') {
    return (
      <ProfileTab
        files={files}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
        hasPendingPlacement={hasPendingPlacement}
        historyPlacements={historyPlacements}
        isMobile={isMobile}
        styles={styles}
        uploading={uploading}
        userData={userData}
      />
    );
  }

  if (activeTab === 'pengaturan') {
    return (
      <SettingsTab
        changingPassword={changingPassword}
        handlePasswordChange={handlePasswordChange}
        handleProfileFormChange={handleProfileFormChange}
        handleUpdateProfile={handleUpdateProfile}
        isMobile={isMobile}
        isUpdatingProfile={isUpdatingProfile}
        passwordForm={passwordForm}
        profileForm={profileForm}
        setPasswordForm={setPasswordForm}
        styles={styles}
      />
    );
  }

  if (activeTab === 'notifikasi') {
    return (
      <NotificationsTab
        handleDeleteAllNotifications={handleDeleteAllNotifications}
        handleDeleteNotification={handleDeleteNotification}
        handleMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        handleMarkNotificationRead={handleMarkNotificationRead}
        handleOpenNotification={handleOpenNotification}
        isMobile={isMobile}
        loadingNotifications={loadingNotifications}
        notifications={notifications}
        styles={styles}
      />
    );
  }

  if (activeTab === 'lowongan') {
    return (
      <VacanciesTab
        hasAnyPlacement={hasAnyPlacement}
        loadingVacancies={loadingVacancies}
        setSelectedVacancy={setSelectedVacancy}
        styles={styles}
        vacancies={vacancies}
      />
    );
  }

  if (activeTab === 'lapor') {
    return (
      <PlacementReportTab
        acceptanceLetter={acceptanceLetter}
        currentPlacement={currentPlacement}
        handlePlacementSubmit={handlePlacementSubmit}
        hasApprovedPlacement={hasApprovedPlacement}
        hasPendingPlacement={hasPendingPlacement}
        placementForm={placementForm}
        setAcceptanceLetter={setAcceptanceLetter}
        setPlacementForm={setPlacementForm}
        styles={styles}
        submittingPlacement={submittingPlacement}
      />
    );
  }

  if (activeTab === 'lapor_mingguan') {
    return (
      <WeeklyProgressTab
        formatSubmissionDate={formatSubmissionDate}
        handleWeeklySubmit={handleWeeklySubmit}
        isMobile={isMobile}
        setWeeklyForm={setWeeklyForm}
        styles={styles}
        submittingWeekly={submittingWeekly}
        weeklyForm={weeklyForm}
        weeklyReports={weeklyReports}
      />
    );
  }

  if (activeTab === 'laporan_bulanan' && hasApprovedPlacement) {
    return (
      <MonthlyReportsTab
        approvedPlacements={approvedPlacements}
        cancelEditMonthlyReport={cancelEditMonthlyReport}
        editingReportId={editingReportId}
        formatSubmissionDate={formatSubmissionDate}
        getPlacementOptionLabel={getPlacementOptionLabel}
        handleEditMonthlyReport={handleEditMonthlyReport}
        handleReportChange={handleReportChange}
        handleReportSubmit={handleReportSubmit}
        isFirstMonthReport={isFirstMonthReport}
        isMobile={isMobile}
        monthlyReports={monthlyReports}
        reportForm={reportForm}
        styles={styles}
        submittingReport={submittingReport}
      />
    );
  }

  if (activeTab === 'laporan_uts' && isUtsTriggered && hasApprovedPlacement) {
    return (
      <SubmissionReportTab
        approvedPlacements={approvedPlacements}
        evaluation={utsEvaluation}
        evaluationSuccessSubtitle="Pembimbing Lapangan Anda telah mengumpulkan nilai evaluasi UTS."
        evaluationSuccessTitle="Penilaian Supervisor Selesai"
        fileLabel={submittedUts ? 'Upload File Baru Pengganti (PDF/Word)' : 'Upload File Final Laporan UTS (PDF/Word)'}
        formData={utsReportData}
        getPlacementOptionLabel={getPlacementOptionLabel}
        handleSubmit={(event) =>
          handleUtsReportSubmit(event, submittedUts, utsReportData, utsReportFile)
        }
        isMobile={isMobile}
        reminderLink={utsReminderLink}
        sectionTitle={submittedUts ? 'Revisi / Ganti File Laporan' : 'Form Pengumpulan'}
        setFile={setUtsReportFile}
        setFormData={setUtsReportData}
        setPreviewDoc={setPreviewDoc}
        styles={styles}
        submittedDescription="Portal pengumpulan dokumen resmi UTS Anda telah dibuka oleh Admin."
        submittedReport={submittedUts}
        submittedTitle="Anda sudah berhasil mengunggah Laporan UTS ke dalam sistem."
        submitting={submittingUts}
        submitLabel={submittedUts ? 'Update & Ganti File Laporan' : 'Kumpulkan Laporan UTS Sekarang'}
        successTitle="Laporan Telah Dikumpulkan"
        templateFile={templates?.uts_template}
        templateTitle="Template Dokumen Laporan UTS"
        title="Laporan Tengah Semester (UTS)"
        uploadButtonLabel="Keterangan Tambahan / Link Pendukung (Opsional)"
        uploadedFileLabel="Jika ukuran file terlalu besar, letakkan link GDrive di sini..."
        waitingEvaluationSubtitle={
          <>
            <span>
              Pembimbing Lapangan Anda <strong>belum</strong> mengisi form Evaluasi UTS.
              Harap hubungi beliau.
            </span>
          </>
        }
      />
    );
  }

  if (activeTab === 'laporan_akhir' && isUasTriggered && hasApprovedPlacement) {
    return (
      <SubmissionReportTab
        approvedPlacements={approvedPlacements}
        evaluation={uasEvaluation}
        evaluationSuccessSubtitle="Pembimbing Lapangan Anda telah mengumpulkan nilai evaluasi Akhir (UAS)."
        evaluationSuccessTitle="Penilaian Akhir Supervisor Selesai"
        fileLabel={submittedFinal ? 'Upload File Baru Pengganti (PDF/Word)' : 'Upload File Laporan Akhir (PDF/Word)'}
        formData={finalReportData}
        getPlacementOptionLabel={getPlacementOptionLabel}
        handleSubmit={(event) =>
          handleFinalReportSubmit(event, submittedFinal, finalReportData, finalReportFile)
        }
        isMobile={isMobile}
        reminderLink={uasReminderLink}
        sectionTitle={submittedFinal ? 'Revisi / Ganti File Laporan Akhir' : 'Form Pengumpulan Final'}
        setFile={setFinalReportFile}
        setFormData={setFinalReportData}
        setPreviewDoc={setPreviewDoc}
        styles={styles}
        submittedDescription="Portal pengumpulan dokumen tugas akhir magang Anda."
        submittedReport={submittedFinal}
        submittedTitle="Anda sudah berhasil mengunggah Laporan Akhir (UAS) ke dalam sistem."
        submitting={submittingFinal}
        submitLabel={submittedFinal ? 'Update & Ganti File UAS' : 'Kumpulkan Laporan UAS (Akhir)'}
        successTitle="Laporan Telah Dikumpulkan"
        templateFile={templates?.uas_template}
        templateTitle="Template Dokumen Laporan Akhir (UAS)"
        title="Laporan Akhir (UAS)"
        uploadButtonLabel="Ucapan Terima Kasih / Keterangan Tambahan (Opsional)"
        uploadedFileLabel="Silakan tinggalkan pesan kesan magang atau link pendukung lainnya..."
        waitingEvaluationSubtitle={
          <>
            <span>
              Pembimbing Lapangan Anda <strong>belum</strong> mengisi form Evaluasi UAS.
              Harap hubungi beliau.
            </span>
          </>
        }
      />
    );
  }

  if (activeTab === 'sertifikat' && hasApprovedPlacement) {
    return (
      <CertificatesTab
        certificates={certificates}
        isMobile={isMobile}
        loadingCertificates={loadingCertificates}
        styles={styles}
      />
    );
  }

  return null;
}
