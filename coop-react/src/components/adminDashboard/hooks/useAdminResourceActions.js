import * as XLSX from 'xlsx';
import api from '../../../api/axios';
import { API_ROUTES } from '../constants';
import {
  buildEvaluationExportData,
  buildIndustryExportData,
  buildSelectedDetail,
  getCertificateIssueMissingFields,
  getDefaultEmailContent,
  getFileName,
} from '../helpers';

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
}) {
  const closeEmailModal = () => {
    setEmailModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleIssueCertificate = async (studentId, placementId) => {
    const grade = gradeInput[placementId];
    if (!grade) return alert('Isi Nilai Konversi (A, B+, dll) terlebih dahulu!');

    const missing = getCertificateIssueMissingFields(placementId, monthlyReports, finalReports, evaluations);

    if (missing.length > 0) {
      const confirmMsg = `⚠️ MAHASISWA INI BELUM MEMENUHI SYARAT KELULUSAN!\n\nKekurangan berkas/nilai:\n${missing.join('\n')}\n\nApakah Anda yakin ingin TETAP MENERBITKAN sertifikat kelulusan?`;
      if (!window.confirm(confirmMsg)) return;
    } else if (!window.confirm('Semua berkas lengkap. Terbitkan sertifikat kelulusan sekarang?')) {
      return;
    }

    try {
      await api.post(API_ROUTES.certificates, { student: studentId, placement: placementId, grade });
      alert('Sertifikat Berhasil Diterbitkan! 🎓');
      setSelectedDetail(null);
      await fetchAdminData();
    } catch {
      alert('Gagal menerbitkan sertifikat.');
    }
  };

  const openEmailModal = (actionType, targetId = null, targetName = '', placementId = null) => {
    const { subject, message } = getDefaultEmailContent(actionType, targetName);
    setEmailModal({ isOpen: true, actionType, targetId, targetName, placementId, subject, message });
  };

  const handleSendCustomEmail = async (e) => {
    e.preventDefault();
    setSendingEmail(true);

    try {
      if (emailModal.actionType.includes('send_eval')) {
        const evalType = emailModal.actionType === 'send_eval_uts' ? 'UTS' : 'UAS';
        await api.post(API_ROUTES.evaluations, {
          placement: emailModal.placementId,
          eval_type: evalType,
          is_filled: false,
          subject: emailModal.subject,
          message: emailModal.message,
        });
        alert(`Form Evaluasi ${evalType} berhasil dikirim! ✅`);
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
        alert(res.data?.message || 'Email berhasil dikirim! ✅');
        closeEmailModal();
      }
    } catch {
      alert('Gagal mengirim email.');
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
    if (!templateFiles[`${type}_template`]) return alert('Pilih file terlebih dahulu!');

    setUploadingTemplate(type);
    const formData = new FormData();
    formData.append(`${type}_template`, templateFiles[`${type}_template`]);

    try {
      await api.post(API_ROUTES.templates, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const res = await api.get(API_ROUTES.templates);
      setCurrentTemplates(res.data);
      alert(`Template ${type.toUpperCase()} berhasil diupload! ✅`);
      setTemplateFiles({ ...templateFiles, [`${type}_template`]: null });
      e.target.reset();
    } catch {
      alert(`Gagal mengupload template ${type.toUpperCase()}.`);
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
  };

  const handleExportIndustries = () => {
    if (industries.length === 0) return alert('Data Mitra Industri masih kosong!');

    const dataToExport = buildIndustryExportData(industries);
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mitra_Industri');
    XLSX.writeFile(workbook, 'Data_Mitra_Industri_Coop.xlsx');
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
    handleExportIndustries,
  };
}
