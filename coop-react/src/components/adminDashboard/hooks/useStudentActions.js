import api from '../../../api/axios';
import { API_ROUTES } from '../constants';
import { getStudentApprovalMissingFields } from '../helpers';

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
}) {
  const handleToggleUserSelection = (userId) => {
    setSelectedUserIds((prev) => (
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    ));
  };

  const handleBulkDeleteUsers = async () => {
    if (selectedUserIds.length === 0) return;
    if (!window.confirm(`⚠️ PERINGATAN: Anda akan menghapus ${selectedUserIds.length} data pendaftar secara permanen.\n\nLanjutkan penghapusan massal?`)) return;

    try {
      await Promise.all(selectedUserIds.map((id) => api.delete(`${API_ROUTES.users}${id}/`)));
      alert(`Berhasil menghapus ${selectedUserIds.length} data pendaftar. ✅`);
      setSelectedUserIds([]);
      await fetchAdminData();
    } catch {
      alert('Gagal menghapus beberapa data.');
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
      alert('Data Master Mahasiswa berhasil diperbarui! ✅');
      setEditingStudent(null);
      await fetchAdminData();
    } catch {
      alert('Gagal mengupdate data mahasiswa.');
    }
  };

  const handleForceResetPassword = async (userId) => {
    const newPassword = window.prompt('🔑 Masukkan password sementara untuk mahasiswa ini:\n\nSyarat: Minimal 8 karakter');
    if (!newPassword) return;
    if (newPassword.length < 8) return alert('Batal mereset: Password terlalu pendek!');
    if (!window.confirm(`Yakin ingin menimpa password mahasiswa ini menjadi:\n\n"${newPassword}" ?`)) return;

    try {
      await api.patch(`${API_ROUTES.users}${userId}/`, { password: newPassword });
      alert(`Sukses! ✅\nPassword telah diubah menjadi: ${newPassword}`);
    } catch {
      alert('Gagal mereset password.');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.username) return alert('Username tidak boleh kosong!');

    setIsUpdatingProfile(true);
    try {
      await api.patch(`${API_ROUTES.users}${adminData.id}/`, {
        username: profileForm.username.trim(),
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
      });

      alert('ID Login & Profil berhasil diperbarui! ✅');
      await fetchAdminData();
    } catch {
      alert('Gagal memperbarui username.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleProfileFormChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleAdminPasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) return alert('Batal! Konfirmasi password tidak sama.');
    if (passwordForm.new_password.length < 8) return alert('Password minimal 8 karakter.');

    setIsChangingPassword(true);
    try {
      await api.patch(API_ROUTES.changePassword, {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });

      alert('Sandi berhasil diperbarui! ✅\nSilakan login kembali.');
      handleLogout();
    } catch {
      alert('Gagal mengubah password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordFormChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleApproveStudent = async (user) => {
    const missing = getStudentApprovalMissingFields(user);

    if (missing.length > 0) {
      const confirmMsg = `⚠️ PERINGATAN!\n\nData pendaftar atas nama ${user.first_name} BELUM LENGKAP:\n${missing.join('\n')}\n\nApakah Anda yakin ingin MEMAKSAKAN persetujuan akun ini?`;
      if (!window.confirm(confirmMsg)) return;
    } else if (!window.confirm(`Setujui akun ${user.first_name} agar bisa login ke sistem?`)) {
      return;
    }

    try {
      await api.patch(`${API_ROUTES.users}${user.id}/`, { is_active: true });
      alert('Akun Mahasiswa Berhasil Disetujui! ✅');
      await fetchAdminData();
    } catch {
      alert('Gagal menyetujui akun.');
    }
  };

  const handleApproveAllStudents = async () => {
    if (filteredPending.length === 0) return;

    const validUsers = filteredPending.filter((user) => getStudentApprovalMissingFields(user).length === 0);
    const incompleteUsersCount = filteredPending.length - validUsers.length;

    if (validUsers.length === 0) {
      alert(`⚠️ Peringatan!\n\nSemua ${filteredPending.length} mahasiswa dalam antrean saat ini BELUM melengkapi data master/berkas.\nSistem menolak persetujuan massal.`);
      setShowIncompleteOnly(true);
      return;
    }

    if (incompleteUsersCount > 0) {
      if (!window.confirm(`⚠️ PERINGATAN!\n\nAda ${incompleteUsersCount} mahasiswa yang datanya BELUM LENGKAP. Mereka akan dilewati.\n\nKlik 'OK' jika ingin menyetujui ${validUsers.length} akun yang LENGKAP saja.`)) return;

      try {
        await Promise.all(validUsers.map((user) => api.patch(`${API_ROUTES.users}${user.id}/`, { is_active: true })));
        alert(`Berhasil! ${validUsers.length} akun disetujui. ✅\nSisa ${incompleteUsersCount} akun dibiarkan pending karena data tidak lengkap.`);
        await fetchAdminData();
        setShowIncompleteOnly(true);
      } catch {
        alert('Terjadi kesalahan saat memproses.');
      }
      return;
    }

    if (!window.confirm(`Yakin ingin menyetujui SEMUA (${validUsers.length}) akun mahasiswa baru?`)) return;

    try {
      await Promise.all(validUsers.map((user) => api.patch(`${API_ROUTES.users}${user.id}/`, { is_active: true })));
      alert(`Berhasil! ${validUsers.length} akun disetujui. ✅`);
      await fetchAdminData();
      setShowIncompleteOnly(false);
    } catch {
      alert('Terjadi kesalahan saat memproses.');
    }
  };

  return {
    handleToggleUserSelection,
    handleBulkDeleteUsers,
    handleEditStudentSubmit,
    handleForceResetPassword,
    handleUpdateProfile,
    handleProfileFormChange,
    handleAdminPasswordChange,
    handlePasswordFormChange,
    handleApproveStudent,
    handleApproveAllStudents,
  };
}
