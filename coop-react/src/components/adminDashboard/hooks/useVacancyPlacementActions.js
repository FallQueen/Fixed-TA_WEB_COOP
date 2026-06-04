import api from '../../../api/axios';
import { API_ROUTES, EMPTY_VACANCY_FORM } from '../constants';
import {
  buildApprovalFormData,
  buildPlacementFromApplicationData,
  getLatestPlacementForStudent,
  getPendingPlacementApprovals,
  isPendingPlacementApproval,
} from '../helpers';
import { getFeedbackApi } from './useAdminFeedback.js';

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

export default function useVacancyPlacementActions({
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
  feedback,
}) {
  const { notify, showConfirm, showPrompt } = getFeedbackApi(feedback);

  const openApprovePlacementModal = (placement, student) => {
    setPlacementToApprove({ placement, student });
  };

  const confirmApprovePlacement = async () => {
    if (!placementToApprove) return;

    try {
      await api.patch(`${API_ROUTES.placements}${placementToApprove.placement.id}/`, buildApprovalFormData());
      notify({ type: 'success', title: 'Tempat Magang Diverifikasi', message: 'Data tempat magang berhasil disetujui.' });
      setPlacementToApprove(null);
      await fetchAdminData();
    } catch (error) {
      notify({
        type: 'danger',
        title: 'Verifikasi Gagal',
        message: getApiErrorMessage(error, 'Tempat magang belum berhasil diverifikasi.'),
      });
    }
  };

  const handleRejectPlacement = async (placement, student = null) => {
    if (!placement) return;

    const studentName = student
      ? `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.email
      : 'mahasiswa ini';
    const rejectionReason = await showPrompt({
      type: 'danger',
      title: 'Tolak Data Magang?',
      message: (
        `Pengajuan tempat magang ${studentName} di ${placement.company_name || 'perusahaan ini'} akan ditolak.\n\n` +
        'Tuliskan alasan yang jelas agar mahasiswa tahu data atau dokumen yang harus diperbaiki.'
      ),
      inputLabel: 'Alasan Penolakan',
      placeholder: 'Contoh: LoA belum mencantumkan periode magang yang sesuai.',
      confirmLabel: 'Tolak Pengajuan',
      multiline: true,
      validate: (value) => (value.trim() ? '' : 'Alasan penolakan wajib diisi.'),
    });
    if (!rejectionReason) return;

    try {
      const formData = new FormData();
      formData.append('status', 'rejected');
      formData.append('is_approved', 'false');
      formData.append('rejection_reason', rejectionReason.trim());
      await api.patch(`${API_ROUTES.placements}${placement.id}/`, formData);
      notify({ type: 'success', title: 'Pengajuan Ditolak', message: 'Alasan penolakan telah dikirim ke mahasiswa melalui email dan notifikasi portal.' });
      setPlacementToApprove((current) => (current?.placement?.id === placement.id ? null : current));
      await fetchAdminData();
    } catch (error) {
      notify({
        type: 'danger',
        title: 'Gagal Menolak Pengajuan',
        message: getApiErrorMessage(error, 'Pengajuan tempat magang belum berhasil ditolak.'),
      });
    }
  };

  const handleApproveAllPlacements = async () => {
    const pendingPlacements = getPendingPlacementApprovals(placements);
    if (pendingPlacements.length === 0) return;

    const confirmed = await showConfirm({
      type: 'confirm',
      title: 'Verifikasi Semua Tempat Magang?',
      message: `${pendingPlacements.length} tempat magang yang menunggu approval akan diverifikasi.`,
      confirmLabel: 'Verifikasi Semua',
    });
    if (!confirmed) return;

    try {
      await Promise.all(
        pendingPlacements.map((placement) => api.patch(`${API_ROUTES.placements}${placement.id}/`, buildApprovalFormData()))
      );
      notify({ type: 'success', title: 'Verifikasi Massal Selesai', message: `${pendingPlacements.length} tempat magang berhasil diverifikasi.` });
      await fetchAdminData();
    } catch (error) {
      notify({
        type: 'danger',
        title: 'Verifikasi Massal Gagal',
        message: getApiErrorMessage(error, 'Terjadi kesalahan saat memverifikasi tempat magang.'),
      });
    }
  };

  const handleVacancyChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setVacancyForm({ ...vacancyForm, [e.target.name]: value });
  };

  const handleVacancySubmit = async (e) => {
    e.preventDefault();
    setSubmittingVacancy(true);

    const dataToSend = {
      ...vacancyForm,
      expires_at: vacancyForm.expires_at || null,
      is_active: true,
    };
    if (editingVacancyId) delete dataToSend.notify_job_seekers;

    try {
      if (editingVacancyId) {
        const response = await api.put(`${API_ROUTES.vacancies}${editingVacancyId}/`, dataToSend);
        setVacancies((prev) => prev.map((job) => (job.id === editingVacancyId ? response.data : job)));
        notify({ type: 'success', title: 'Lowongan Diperbarui', message: 'Informasi lowongan berhasil disimpan.' });
        setEditingVacancyId(null);
        window.dispatchEvent(new CustomEvent('admin-vacancy-saved'));
      } else {
        const response = await api.post(API_ROUTES.vacancies, dataToSend);
        setVacancies((prev) => [response.data, ...prev]);
        notify({
          type: 'success',
          title: 'Lowongan Diposting',
          message: response.data?.notification_message || 'Lowongan baru berhasil dipublikasikan.',
        });
      }

      setVacancyForm(EMPTY_VACANCY_FORM);
      await fetchVacancies();
    } catch (error) {
      notify({ type: 'danger', title: 'Gagal Memproses Lowongan', message: getApiErrorMessage(error, 'Lowongan belum berhasil disimpan.') });
    } finally {
      setSubmittingVacancy(false);
    }
  };

  const handleEditClick = (job) => {
    setEditingVacancyId(job.id);
    setVacancyForm({
      title: job.title,
      company_name: job.company_name,
      description: job.description,
      requirements: job.requirements,
      expires_at: job.expires_at || '',
      external_apply_link: job.external_apply_link || '',
      supervisor_name: job.supervisor_name || '',
      supervisor_email: job.supervisor_email || '',
      supervisor_phone: job.supervisor_phone || '',
      notify_job_seekers: false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingVacancyId(null);
    setVacancyForm(EMPTY_VACANCY_FORM);
  };

  const handleDeleteVacancy = async (id) => {
    const confirmed = await showConfirm({
      type: 'danger',
      title: 'Hapus Lowongan?',
      message: 'Lowongan ini akan dihapus dari daftar peluang mahasiswa.',
      confirmLabel: 'Hapus Lowongan',
    });
    if (!confirmed) return;

    const previousVacancies = vacancies;
    setVacancies((prev) => prev.filter((job) => job.id !== id));

    try {
      await api.delete(`${API_ROUTES.vacancies}${id}/`);
      notify({ type: 'success', title: 'Lowongan Dihapus', message: 'Lowongan berhasil dihapus.' });
      await fetchVacancies();
    } catch (error) {
      setVacancies(previousVacancies);
      notify({ type: 'danger', title: 'Gagal Menghapus Lowongan', message: getApiErrorMessage(error, 'Lowongan dikembalikan karena proses hapus gagal.') });
    }
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    const previousApplications = applications;
    setApplications((prev) => prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app)));

    try {
      await api.patch(`${API_ROUTES.applications}${appId}/`, { status: newStatus });

      if (newStatus === 'accepted' && selectedApplication) {
        const { student, vacancy } = selectedApplication;
        const existingPlacement = getLatestPlacementForStudent(placements, student.id);

        if (!existingPlacement || ['resigned', 'rejected', 'completed', 'finished'].includes(existingPlacement.status)) {
          await api.post(API_ROUTES.placements, buildPlacementFromApplicationData(student.id, vacancy, selectedApplication.app));
        } else if (isPendingPlacementApproval(existingPlacement)) {
          await api.patch(`${API_ROUTES.placements}${existingPlacement.id}/`, buildApprovalFormData());
        }
      }

      notify({
        type: 'success',
        title: newStatus === 'accepted' ? 'Pelamar Diterima' : 'Status Lamaran Diperbarui',
        message: newStatus === 'accepted' ? 'Data magang mahasiswa sudah dibuat atau diverifikasi.' : `Status lamaran diubah menjadi ${newStatus}.`,
      });
      await fetchAdminData();
      setSelectedApplication(null);
    } catch (error) {
      setApplications(previousApplications);
      notify({ type: 'danger', title: 'Gagal Mengubah Status', message: getApiErrorMessage(error, error.message || 'Status lamaran belum berhasil diperbarui.') });
    }
  };

  const handleArchiveApplication = async (application) => {
    if (!application) return;

    const confirmed = await showConfirm({
      type: 'danger',
      title: 'Arsipkan Pelamar dari Daftar?',
      message: 'Lamaran ini akan disembunyikan dari daftar pelamar admin, tetapi histori tetap tersimpan di database.',
      confirmLabel: 'Arsipkan Pelamar',
    });
    if (!confirmed) return;

    const previousApplications = applications;
    setApplications((prev) => prev.filter((app) => app.id !== application.id));

    try {
      await api.delete(`${API_ROUTES.applications}${application.id}/`);
      notify({ type: 'success', title: 'Pelamar Diarsipkan', message: 'Lamaran berhasil disembunyikan dari daftar pelamar.' });
      if (selectedApplication?.app?.id === application.id) {
        setSelectedApplication(null);
      }
      await fetchAdminData();
    } catch (error) {
      setApplications(previousApplications);
      notify({
        type: 'danger',
        title: 'Gagal Mengarsipkan Pelamar',
        message: getApiErrorMessage(error, 'Lamaran dikembalikan karena proses arsip gagal.'),
      });
    }
  };

  return {
    openApprovePlacementModal,
    confirmApprovePlacement,
    handleRejectPlacement,
    handleApproveAllPlacements,
    handleVacancyChange,
    handleVacancySubmit,
    handleEditClick,
    handleCancelEdit,
    handleDeleteVacancy,
    handleUpdateAppStatus,
    handleArchiveApplication,
  };
}
