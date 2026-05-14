import api from '../../../api/axios';
import { API_ROUTES, EMPTY_VACANCY_FORM } from '../constants';
import { buildApprovalFormData, buildPlacementFromApplicationData } from '../helpers';

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
}) {
  const openApprovePlacementModal = (placement, student) => {
    setPlacementToApprove({ placement, student });
  };

  const confirmApprovePlacement = async () => {
    if (!placementToApprove) return;

    try {
      await api.patch(`${API_ROUTES.placements}${placementToApprove.placement.id}/`, buildApprovalFormData());
      alert('Tempat Magang Berhasil Diverifikasi! ✅');
      setPlacementToApprove(null);
      await fetchAdminData();
    } catch {
      alert('Gagal memverifikasi tempat magang.');
    }
  };

  const handleApproveAllPlacements = async () => {
    const pendingPlacements = placements.filter((placement) => !placement.is_approved);
    if (pendingPlacements.length === 0) return;
    if (!window.confirm(`Yakin ingin memverifikasi semua (${pendingPlacements.length}) tempat magang?`)) return;

    try {
      await Promise.all(
        pendingPlacements.map((placement) => api.patch(`${API_ROUTES.placements}${placement.id}/`, buildApprovalFormData()))
      );
      alert(`Berhasil memverifikasi ${pendingPlacements.length} tempat magang. ✅`);
      await fetchAdminData();
    } catch {
      alert('Terjadi kesalahan.');
    }
  };

  const handleVacancyChange = (e) => {
    setVacancyForm({ ...vacancyForm, [e.target.name]: e.target.value });
  };

  const handleVacancySubmit = async (e) => {
    e.preventDefault();
    setSubmittingVacancy(true);

    const dataToSend = { ...vacancyForm, is_active: true };
    if (!dataToSend.expires_at) delete dataToSend.expires_at;

    try {
      if (editingVacancyId) {
        const response = await api.put(`${API_ROUTES.vacancies}${editingVacancyId}/`, dataToSend);
        setVacancies((prev) => prev.map((job) => (job.id === editingVacancyId ? response.data : job)));
        alert('Lowongan berhasil diperbarui! ✅');
        setEditingVacancyId(null);
      } else {
        const response = await api.post(API_ROUTES.vacancies, dataToSend);
        setVacancies((prev) => [response.data, ...prev]);
        alert('Lowongan berhasil diposting! ✅');
      }

      setVacancyForm(EMPTY_VACANCY_FORM);
      await fetchVacancies();
    } catch {
      alert('Gagal memproses lowongan.');
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
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingVacancyId(null);
    setVacancyForm(EMPTY_VACANCY_FORM);
  };

  const handleDeleteVacancy = async (id) => {
    if (!window.confirm('Yakin ingin menghapus lowongan ini?')) return;

    const previousVacancies = vacancies;
    setVacancies((prev) => prev.filter((job) => job.id !== id));

    try {
      await api.delete(`${API_ROUTES.vacancies}${id}/`);
      await fetchVacancies();
    } catch {
      setVacancies(previousVacancies);
      alert('Gagal menghapus lowongan.');
    }
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    const previousApplications = applications;
    setApplications((prev) => prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app)));

    try {
      await api.patch(`${API_ROUTES.applications}${appId}/`, { status: newStatus });

      if (newStatus === 'accepted' && selectedApplication) {
        const { student, vacancy } = selectedApplication;
        const existingPlacement = placements.find((placement) => placement.student === student.id);

        if (!existingPlacement) {
          await api.post(API_ROUTES.placements, buildPlacementFromApplicationData(student.id, vacancy));
        } else if (!existingPlacement.is_approved) {
          await api.patch(`${API_ROUTES.placements}${existingPlacement.id}/`, buildApprovalFormData());
        }
      }

      alert(newStatus === 'accepted' ? 'Pelamar Diterima & Data Magang Dibuat! ✅' : `Status diubah menjadi: ${newStatus}`);
      await fetchAdminData();
      setSelectedApplication(null);
    } catch (error) {
      setApplications(previousApplications);
      alert(`Gagal! Detail error: ${error.message}`);
    }
  };

  return {
    openApprovePlacementModal,
    confirmApprovePlacement,
    handleApproveAllPlacements,
    handleVacancyChange,
    handleVacancySubmit,
    handleEditClick,
    handleCancelEdit,
    handleDeleteVacancy,
    handleUpdateAppStatus,
  };
}
