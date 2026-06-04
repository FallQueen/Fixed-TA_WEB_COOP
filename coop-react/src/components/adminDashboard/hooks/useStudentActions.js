import { useState } from 'react';
import api from '../../../api/axios';
import { API_ROUTES } from '../constants';
import { getStudentApprovalMissingFields } from '../helpers';
import { getFeedbackApi } from './useAdminFeedback.js';

export default function useStudentActions({
  selectedUserIds,
  setSelectedUserIds,
  editingStudent,
  setEditingStudent,
  profileForm,
  setProfileForm,
  setIsUpdatingProfile,
  adminData,
  fetchAdminData,
  passwordForm,
  setPasswordForm,
  setIsChangingPassword,
  handleLogout,
  filteredPending,
  setShowIncompleteOnly,
  feedback,
}) {
  const { notify, showAlert, showConfirm, showPrompt } = getFeedbackApi(feedback);
  const [isUpdatingMicrosoftConnection, setIsUpdatingMicrosoftConnection] = useState(false);

  const handleToggleUserSelection = (userId) => {
    setSelectedUserIds((prev) => (
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    ));
  };

  const handleBulkDeleteUsers = async () => {
    if (selectedUserIds.length === 0) return;

    const confirmed = await showConfirm({
      type: 'danger',
      title: 'Hapus Pendaftar Terpilih?',
      message: `Anda akan menghapus ${selectedUserIds.length} data pendaftar secara permanen.`,
      confirmLabel: 'Hapus Data',
    });
    if (!confirmed) return;

    try {
      await Promise.all(selectedUserIds.map((id) => api.delete(`${API_ROUTES.users}${id}/`)));
      notify({ type: 'success', title: 'Pendaftar Dihapus', message: `${selectedUserIds.length} data pendaftar berhasil dihapus.` });
      setSelectedUserIds([]);
      await fetchAdminData();
    } catch {
      notify({ type: 'danger', title: 'Gagal Menghapus', message: 'Beberapa data pendaftar tidak berhasil dihapus.' });
    }
  };

  const handleEditStudentSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.patch(`${API_ROUTES.users}${editingStudent.id}/`, {
        first_name: editingStudent.first_name,
        last_name: editingStudent.last_name,
        nim: editingStudent.nim,
        email: editingStudent.email,
        program_studi: editingStudent.program_studi,
      });
      notify({ type: 'success', title: 'Data Mahasiswa Diperbarui', message: 'Perubahan data master mahasiswa berhasil disimpan.' });
      setEditingStudent(null);
      await fetchAdminData();
    } catch {
      notify({ type: 'danger', title: 'Gagal Menyimpan', message: 'Data mahasiswa belum berhasil diperbarui.' });
    }
  };

  const handleDeleteStudentAccount = async (student) => {
    const studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim()
      || student.email
      || 'mahasiswa ini';
    const confirmed = await showConfirm({
      type: 'danger',
      title: 'Hapus Akun Mahasiswa?',
      message: (
        `Akun ${studentName} akan dihapus permanen dari sistem.\n\n` +
        'Data terkait akun ini juga dapat ikut terhapus. Lanjutkan hanya jika akun memang salah atau tidak aktif.'
      ),
      confirmLabel: 'Hapus Akun',
    });

    if (!confirmed) return;

    try {
      await api.delete(`${API_ROUTES.users}${student.id}/`);
      setSelectedUserIds((prev) => prev.filter((id) => id !== student.id));
      setEditingStudent((current) => (current?.id === student.id ? null : current));
      notify({ type: 'success', title: 'Akun Dihapus', message: `Akun ${studentName} berhasil dihapus.` });
      await fetchAdminData();
    } catch {
      notify({ type: 'danger', title: 'Gagal Menghapus Akun', message: 'Akun mahasiswa belum berhasil dihapus.' });
    }
  };

  const handleForceResetPassword = async (studentOrId) => {
    const userId = typeof studentOrId === 'object' ? studentOrId.id : studentOrId;
    const studentName = typeof studentOrId === 'object'
      ? (`${studentOrId.first_name || ''} ${studentOrId.last_name || ''}`.trim() || studentOrId.email || 'mahasiswa ini')
      : 'mahasiswa ini';

    const confirmed = await showConfirm({
      type: 'warning',
      title: 'Kirim Link Reset Password?',
      message: `Sistem akan mengirim link reset password ke email ${studentName}. Mahasiswa akan membuat password baru sendiri melalui link tersebut.`,
      confirmLabel: 'Kirim Link',
    });
    if (!confirmed) return;

    try {
      const response = await api.post(`${API_ROUTES.users}${userId}/send-password-reset/`);
      await showAlert({
        type: 'success',
        title: 'Link Reset Terkirim',
        message: response.data?.message || 'Link reset password telah dikirim ke email mahasiswa.',
      });
    } catch {
      notify({ type: 'danger', title: 'Reset Password Gagal', message: 'Link reset password belum berhasil dikirim.' });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.username) {
      notify({ type: 'warning', title: 'Username Kosong', message: 'Username tidak boleh kosong.' });
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await api.patch(`${API_ROUTES.users}${adminData.id}/`, {
        username: profileForm.username.trim(),
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        phone_number: profileForm.phone_number,
      });

      notify({ type: 'success', title: 'Profil Admin Diperbarui', message: 'ID login dan profil admin berhasil disimpan.' });
      await fetchAdminData();
    } catch {
      notify({ type: 'danger', title: 'Gagal Memperbarui Profil', message: 'Username atau profil admin belum berhasil diperbarui.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleProfileFormChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleAdminPasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      notify({ type: 'warning', title: 'Konfirmasi Tidak Sama', message: 'Konfirmasi password baru belum cocok.' });
      return;
    }
    if (passwordForm.new_password.length < 8) {
      notify({ type: 'warning', title: 'Password Terlalu Pendek', message: 'Password minimal 8 karakter.' });
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.patch(API_ROUTES.changePassword, {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });

      await showAlert({ type: 'success', title: 'Sandi Berhasil Diperbarui', message: 'Silakan login kembali dengan sandi baru.' });
      handleLogout();
    } catch {
      notify({ type: 'danger', title: 'Gagal Mengubah Sandi', message: 'Sandi admin belum berhasil diperbarui.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordFormChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleConnectMicrosoft = async () => {
    setIsUpdatingMicrosoftConnection(true);
    try {
      const response = await api.post(API_ROUTES.microsoftAdminLink);
      if (!response.data?.authorization_url) {
        throw new Error('Microsoft authorization URL is missing.');
      }
      window.location.assign(response.data.authorization_url);
    } catch {
      notify({
        type: 'danger',
        title: 'Koneksi Microsoft Gagal Dimulai',
        message: 'Portal belum dapat membuka halaman login Microsoft. Periksa konfigurasi SSO atau coba lagi.',
      });
      setIsUpdatingMicrosoftConnection(false);
    }
  };

  const handleDisconnectMicrosoft = async () => {
    const confirmed = await showConfirm({
      type: 'warning',
      title: 'Putuskan Koneksi Microsoft?',
      message: 'Login Microsoft untuk akun admin ini akan dinonaktifkan. Admin tetap dapat masuk memakai ID login dan password portal.',
      confirmLabel: 'Putuskan Koneksi',
    });
    if (!confirmed) return;

    setIsUpdatingMicrosoftConnection(true);
    try {
      const response = await api.post(API_ROUTES.microsoftAdminUnlink);
      notify({
        type: 'success',
        title: 'Koneksi Microsoft Diputuskan',
        message: response.data?.message || 'Akun Microsoft tidak lagi terhubung ke akun admin.',
      });
      await fetchAdminData();
    } catch {
      notify({
        type: 'danger',
        title: 'Gagal Memutuskan Koneksi',
        message: 'Koneksi Microsoft belum berhasil diputuskan.',
      });
    } finally {
      setIsUpdatingMicrosoftConnection(false);
    }
  };

  const handleApproveStudent = async (user) => {
    const missing = getStudentApprovalMissingFields(user);

    if (missing.length > 0) {
      const confirmed = await showConfirm({
        type: 'warning',
        title: 'Data Pendaftar Belum Lengkap',
        message: `Data pendaftar atas nama ${user.first_name} belum lengkap. Tetap setujui akun ini?`,
        details: missing,
        confirmLabel: 'Tetap Setujui',
      });
      if (!confirmed) return;
    } else {
      const confirmed = await showConfirm({
        type: 'confirm',
        title: 'Setujui Akun Mahasiswa?',
        message: `Setujui akun ${user.first_name} agar bisa login ke sistem?`,
        confirmLabel: 'Setujui Akun',
      });
      if (!confirmed) return;
    }

    try {
      await api.patch(`${API_ROUTES.users}${user.id}/`, { is_active: true });
      notify({ type: 'success', title: 'Akun Disetujui', message: 'Akun mahasiswa berhasil diaktifkan.' });
      await fetchAdminData();
    } catch {
      notify({ type: 'danger', title: 'Gagal Menyetujui Akun', message: 'Akun mahasiswa belum berhasil diaktifkan.' });
    }
  };

  const handleRejectStudent = async (user) => {
    const studentName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'mahasiswa ini';
    const rejectionReason = await showPrompt({
      type: 'danger',
      title: 'Tolak Pendaftaran?',
      message: (
        `Tolak pendaftaran akun ${studentName}?\n\n` +
        'Tuliskan alasan yang jelas. Status akun akan berubah menjadi Ditolak dan mahasiswa dapat daftar ulang menggunakan email yang sama.'
      ),
      inputLabel: 'Alasan Penolakan',
      placeholder: 'Contoh: Dokumen SPTJM tidak terbaca. Silakan unggah ulang dokumen yang benar.',
      confirmLabel: 'Tolak Pendaftaran',
      multiline: true,
      validate: (value) => (value.trim() ? '' : 'Alasan penolakan wajib diisi.'),
    });

    if (!rejectionReason) return;

    try {
      const response = await api.post(`${API_ROUTES.users}${user.id}/reject-registration/`, {
        rejection_reason: rejectionReason.trim(),
      });
      setSelectedUserIds((prev) => prev.filter((id) => id !== user.id));
      notify({
        type: 'success',
        title: 'Pendaftaran Ditolak',
        message: response.data?.message || 'Status akun diubah menjadi Ditolak dan alasan telah dikirim ke mahasiswa.',
      });
      await fetchAdminData();
    } catch {
      notify({ type: 'danger', title: 'Gagal Menolak Pendaftaran', message: 'Status pendaftaran belum berhasil diubah.' });
    }
  };

  const handleApproveAllStudents = async () => {
    if (filteredPending.length === 0) return;

    const validUsers = filteredPending.filter((user) => getStudentApprovalMissingFields(user).length === 0);
    const incompleteUsersCount = filteredPending.length - validUsers.length;

    if (validUsers.length === 0) {
      await showAlert({
        type: 'warning',
        title: 'Persetujuan Massal Ditolak',
        message: `Semua ${filteredPending.length} mahasiswa dalam antrean saat ini belum melengkapi data master/berkas.`,
      });
      setShowIncompleteOnly(true);
      return;
    }

    if (incompleteUsersCount > 0) {
      const confirmed = await showConfirm({
        type: 'warning',
        title: 'Lewati Data Belum Lengkap?',
        message: `Ada ${incompleteUsersCount} mahasiswa yang datanya belum lengkap. Mereka akan dilewati dan ${validUsers.length} akun yang lengkap akan disetujui.`,
        confirmLabel: 'Setujui yang Lengkap',
      });
      if (!confirmed) return;

      try {
        await Promise.all(validUsers.map((user) => api.patch(`${API_ROUTES.users}${user.id}/`, { is_active: true })));
        notify({ type: 'success', title: 'Approval Massal Selesai', message: `${validUsers.length} akun disetujui. ${incompleteUsersCount} akun tetap pending karena data belum lengkap.` });
        await fetchAdminData();
        setShowIncompleteOnly(true);
      } catch {
        notify({ type: 'danger', title: 'Approval Massal Gagal', message: 'Terjadi kesalahan saat memproses approval massal.' });
      }
      return;
    }

    const confirmed = await showConfirm({
      type: 'confirm',
      title: 'Setujui Semua Akun?',
      message: `${validUsers.length} akun mahasiswa baru akan disetujui.`,
      confirmLabel: 'Setujui Semua',
    });
    if (!confirmed) return;

    try {
      await Promise.all(validUsers.map((user) => api.patch(`${API_ROUTES.users}${user.id}/`, { is_active: true })));
      notify({ type: 'success', title: 'Semua Akun Disetujui', message: `${validUsers.length} akun mahasiswa berhasil diaktifkan.` });
      await fetchAdminData();
      setShowIncompleteOnly(false);
    } catch {
      notify({ type: 'danger', title: 'Approval Massal Gagal', message: 'Terjadi kesalahan saat memproses approval massal.' });
    }
  };

  return {
    handleToggleUserSelection,
    handleBulkDeleteUsers,
    handleEditStudentSubmit,
    handleDeleteStudentAccount,
    handleForceResetPassword,
    handleUpdateProfile,
    handleProfileFormChange,
    handleAdminPasswordChange,
    handlePasswordFormChange,
    handleConnectMicrosoft,
    handleDisconnectMicrosoft,
    isUpdatingMicrosoftConnection,
    handleApproveStudent,
    handleRejectStudent,
    handleApproveAllStudents,
  };
}
