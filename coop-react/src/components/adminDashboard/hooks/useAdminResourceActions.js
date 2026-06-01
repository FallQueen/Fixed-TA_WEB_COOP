import * as XLSX from 'xlsx';
import api from '../../../api/axios';
import { API_ROUTES, CERTIFICATE_GRADE_OPTIONS } from '../constants';
import {
  buildEvaluationExportData,
  buildIndustryExportData,
  buildSelectedDetail,
  getCertificateIssueMissingFields,
  getDefaultEmailContent,
  getFileName,
} from '../helpers';
import { getFeedbackApi } from './useAdminFeedback.js';

export default function useAdminResourceActions({
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
  feedback,
}) {
  const { notify, showAlert, showConfirm, showPrompt } = getFeedbackApi(feedback);

  const closeEmailModal = () => {
    setEmailModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleIssueCertificate = async (studentId, placementId) => {
    const grade = String(gradeInput[placementId] || '').trim().toUpperCase();
    if (!CERTIFICATE_GRADE_OPTIONS.includes(grade)) {
      notify({ type: 'warning', title: 'Grade Belum Dipilih', message: `Pilih Nilai Konversi ${CERTIFICATE_GRADE_OPTIONS.join(', ')} terlebih dahulu.` });
      return;
    }

    const placement = placements.find((item) => String(item.id) === String(placementId));
    const missing = getCertificateIssueMissingFields(placement, monthlyReports, utsReports, finalReports, evaluations, placements);

    if (missing.length > 0) {
      await showAlert({
        type: 'warning',
        title: 'Sertifikat Belum Bisa Diterbitkan',
        message: 'Data kelulusan mahasiswa belum lengkap.',
        details: missing,
      });
      return;
    }

    const confirmed = await showConfirm({
      type: 'confirm',
      title: 'Terbitkan Sertifikat?',
      message: `Semua berkas sudah lengkap. Sertifikat akan diterbitkan dengan grade ${grade}.`,
      confirmLabel: 'Terbitkan Sertifikat',
    });
    if (!confirmed) return;

    try {
      await api.post(API_ROUTES.certificates, { student: studentId, placement: placementId, grade });
      notify({ type: 'success', title: 'Sertifikat Diterbitkan', message: `Sertifikat berhasil diterbitkan dengan grade ${grade}.` });
      setSelectedDetail(null);
      await fetchAdminData();
    } catch (error) {
      const responseData = error?.response?.data;
      const errorMessage = responseData?.error
        || responseData?.detail
        || responseData?.non_field_errors?.join?.(' ')
        || 'Sertifikat belum berhasil diterbitkan.';
      notify({ type: 'danger', title: 'Gagal Menerbitkan Sertifikat', message: errorMessage });
    }
  };

  const openEmailModal = (actionType, targetId = null, targetName = '', placementId = null, targetEmail = '') => {
    const { subject, message } = getDefaultEmailContent(actionType, targetName);
    setEmailModal({ isOpen: true, actionType, targetId, targetName, targetEmail, placementId, subject, message });
  };

  const handleSendCustomEmail = async (e) => {
    e.preventDefault();
    setSendingEmail(true);

    try {
      if (emailModal.actionType.includes('send_eval')) {
        const evalType = emailModal.actionType === 'send_eval_uts' ? 'UTS' : 'UAS';
        const res = await api.post(API_ROUTES.evaluations, {
          placement: emailModal.placementId,
          eval_type: evalType,
          is_filled: false,
          subject: emailModal.subject,
          message: emailModal.message,
        });
        notify({
          type: 'success',
          title: `Form Evaluasi ${evalType} Dikirim`,
          message: res.data?.message || 'Supervisor sudah mendapatkan permintaan evaluasi.',
        });
        await fetchAdminData();
        closeEmailModal();
      } else {
        const endpoint = emailModal.actionType === 'job_seeker' ? API_ROUTES.sendReminders : API_ROUTES.sendReportReminders;
        const payload = {
          subject: emailModal.subject,
          message: emailModal.message,
          ...(emailModal.actionType.includes('report') ? { report_type: emailModal.actionType.includes('uts') ? 'UTS' : 'UAS' } : {}),
          ...(emailModal.targetId ? { student_id: emailModal.targetId } : {}),
        };

        const res = await api.post(endpoint, payload);
        notify({ type: 'success', title: 'Email Berhasil Dikirim', message: res.data?.message || 'Pesan admin sudah dikirim.' });
        closeEmailModal();
      }
    } catch {
      notify({ type: 'danger', title: 'Gagal Mengirim Email', message: 'Pesan belum berhasil dikirim.' });
    } finally {
      setSendingEmail(false);
    }
  };

  const openDetailModal = (placement, student) => {
    setSelectedDetail(
      buildSelectedDetail(
        placement,
        student,
        monthlyReports,
        utsReports,
        finalReports,
        evaluations,
        certificates,
        placements
      )
    );
  };

  const handleTemplateChange = (e) => {
    setTemplateFiles({ ...templateFiles, [e.target.name]: e.target.files[0] });
  };

  const handleTemplateSubmit = async (e, type) => {
    e.preventDefault();
    if (!templateFiles[`${type}_template`]) {
      notify({ type: 'warning', title: 'File Belum Dipilih', message: `Pilih file template ${type.toUpperCase()} terlebih dahulu.` });
      return;
    }

    setUploadingTemplate(type);
    const formData = new FormData();
    formData.append(`${type}_template`, templateFiles[`${type}_template`]);

    try {
      await api.post(API_ROUTES.templates, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const res = await api.get(API_ROUTES.templates);
      setCurrentTemplates(res.data);
      notify({ type: 'success', title: `Template ${type.toUpperCase()} Diperbarui`, message: 'Template laporan berhasil diunggah.' });
      setTemplateFiles({ ...templateFiles, [`${type}_template`]: null });
      e.target.reset();
    } catch {
      notify({ type: 'danger', title: `Gagal Upload Template ${type.toUpperCase()}`, message: 'Template laporan belum berhasil diunggah.' });
    } finally {
      setUploadingTemplate(null);
    }
  };

  const handleExportEvaluations = () => {
    const dataToExport = buildEvaluationExportData(placements, students, evaluations);
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap_Evaluasi');
    XLSX.writeFile(workbook, 'Rekap_Evaluasi_Coop.xlsx');
    notify({ type: 'success', title: 'Export Evaluasi Dimulai', message: 'File rekap evaluasi sedang diunduh.' });
  };

  const handleSendCompletionReminders = async (placementId = null) => {
    const isSingleStudent = Boolean(placementId);
    const confirmed = await showConfirm({
      type: 'confirm',
      title: isSingleStudent ? 'Kirim Reminder Kelengkapan?' : 'Kirim Reminder Massal?',
      message: isSingleStudent
        ? 'Sistem akan mengirim email dan notifikasi portal berisi daftar syarat kelulusan yang masih kurang.'
        : 'Sistem akan mengirim email dan notifikasi portal kepada semua mahasiswa yang syarat kelulusannya masih belum lengkap.',
      confirmLabel: 'Kirim Reminder',
    });

    if (!confirmed) return;

    try {
      const response = await api.post(
        API_ROUTES.sendCompletionReminders,
        placementId ? { placement_id: placementId } : {}
      );
      notify({
        type: 'success',
        title: 'Reminder Kelengkapan Diproses',
        message: response.data?.message || 'Reminder kelengkapan berhasil diproses.',
      });
    } catch (error) {
      const responseData = error?.response?.data;
      notify({
        type: 'danger',
        title: 'Gagal Mengirim Reminder',
        message: responseData?.error || responseData?.detail || 'Reminder kelengkapan belum berhasil dikirim.',
      });
    }
  };

  const handleApproveSupervisorChange = async (placement) => {
    const confirmed = await showConfirm({
      type: 'confirm',
      title: 'Setujui Perubahan Supervisor?',
      message: (
        `Kontak supervisor akan diperbarui menjadi ${placement.pending_supervisor_name} `
        + `(${placement.pending_supervisor_email}). Link evaluasi yang masih menunggu akan dikirim ulang ke email baru.`
      ),
      confirmLabel: 'Setujui Perubahan',
    });

    if (!confirmed) return;

    try {
      const response = await api.post(`${API_ROUTES.placements}${placement.id}/approve-supervisor-change/`);
      notify({
        type: 'success',
        title: 'Kontak Supervisor Diperbarui',
        message: response.data?.message || 'Kontak supervisor baru sudah aktif.',
      });
      await fetchAdminData();
    } catch (error) {
      notify({
        type: 'danger',
        title: 'Perubahan Belum Disetujui',
        message: error?.response?.data?.detail || 'Kontak supervisor belum berhasil diperbarui.',
      });
    }
  };

  const handleRejectSupervisorChange = async (placement) => {
    const reason = await showPrompt({
      type: 'prompt',
      title: 'Tolak Perubahan Supervisor?',
      message: `Tuliskan alasan agar mahasiswa dapat memperbaiki data kontak supervisor untuk ${placement.company_name}.`,
      inputLabel: 'Alasan penolakan',
      placeholder: 'Contoh: Gunakan email kantor supervisor yang aktif.',
      multiline: true,
      confirmLabel: 'Tolak Pengajuan',
      validate: (value) => (value.trim() ? '' : 'Alasan penolakan wajib diisi.'),
    });

    if (reason === null) return;

    try {
      const response = await api.post(
        `${API_ROUTES.placements}${placement.id}/reject-supervisor-change/`,
        { reason: reason.trim() }
      );
      notify({
        type: 'success',
        title: 'Pengajuan Perlu Diperbaiki',
        message: response.data?.message || 'Alasan penolakan sudah dikirim ke mahasiswa.',
      });
      await fetchAdminData();
    } catch (error) {
      notify({
        type: 'danger',
        title: 'Pengajuan Belum Ditolak',
        message: error?.response?.data?.detail || 'Status pengajuan belum berhasil diperbarui.',
      });
    }
  };

  const handleExportIndustries = () => {
    if (industries.length === 0) {
      notify({ type: 'warning', title: 'Data Mitra Kosong', message: 'Data Mitra Industri masih kosong.' });
      return;
    }

    const dataToExport = buildIndustryExportData(industries);
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mitra_Industri');
    XLSX.writeFile(workbook, 'Data_Mitra_Industri_Coop.xlsx');
    notify({ type: 'success', title: 'Export Industri Dimulai', message: 'File data mitra industri sedang diunduh.' });
  };

  return {
    closeEmailModal,
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
  };
}
