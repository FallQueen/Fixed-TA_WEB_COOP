import {
  AlertCircle,
  CheckCircle,
  CheckSquare,
  Clock3,
  Eye,
  FileWarning,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import GuidancePanel from './GuidancePanel';
import PaginationControls from './PaginationControls';
import StatusSegmentedControl from './StatusSegmentedControl';
import {
  adminColors,
  actionButtonGroup,
  actionCell,
  actionIconButton,
  badge,
  compactButton,
  emptyState,
  metricTone,
  metricCard,
  metricGrid,
  statusTones,
  tableShell,
  tabPageHeader,
  tabSubtitle,
  tabTitle,
  toolbar,
} from './sharedTabStyles';
import usePagedData from './usePagedData';
import { getRegistrationStatus } from '../helpers';

const missingFile = (file) => !file || String(file).trim() === '' || String(file).includes('null');

const hasMissingRequiredDocs = (user) => (
  missingFile(user.bukti_konsul_file) || missingFile(user.sptjm_file)
);

const getInitials = (user) => {
  const firstInitial = String(user.first_name || user.email || 'M').trim().charAt(0);
  const lastInitial = String(user.last_name || '').trim().charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

const documentGroup = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const readinessPanel = (isMobile) => ({
  marginBottom: '22px',
  padding: isMobile ? '14px' : '16px',
  backgroundColor: adminColors.panel,
  border: `1px solid ${adminColors.border}`,
  borderRadius: '14px',
});

const studentAvatar = {
  width: '34px',
  height: '34px',
  borderRadius: '12px',
  backgroundColor: statusTones.primary.tint,
  color: statusTones.primary.color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  fontWeight: '900',
  flexShrink: 0,
};

function ApprovalTab({
  styles,
  isMobile,
  showIncompleteOnly,
  setShowIncompleteOnly,
  filterStatusAkun,
  setFilterStatusAkun,
  selectedUserIds,
  handleBulkDeleteUsers,
  filteredPending,
  inactiveApprovalUsers = [],
  handleApproveAllStudents,
  approvalDataFiltered,
  handleToggleUserSelection,
  handleApproveStudent,
  handleRejectStudent,
  handleDeleteStudentAccount,
}) {
  const isRejectedRegistration = (user) => getRegistrationStatus(user) === 'rejected';
  const visibleApprovalData = approvalDataFiltered.filter((user) => {
    if (!showIncompleteOnly) return true;

    return hasMissingRequiredDocs(user) || isRejectedRegistration(user);
  });

  const activeUsers = approvalDataFiltered.filter((user) => user.is_active);
  const pendingUsers = approvalDataFiltered.filter((user) => !user.is_active && !isRejectedRegistration(user));
  const rejectedUsers = inactiveApprovalUsers.filter(isRejectedRegistration);
  const incompleteUserIds = new Set([
    ...visibleApprovalData.filter(hasMissingRequiredDocs).map((user) => user.id),
    ...rejectedUsers.map((user) => user.id),
  ]);
  const pageTitle = filterStatusAkun === 'ditolak'
    ? 'Pendaftaran Akun Ditolak'
    : (showIncompleteOnly ? 'Mahasiswa Berkas Bermasalah' : 'Antrean Persetujuan');
  const canApproveAll = filteredPending.length > 0 && !showIncompleteOnly;
  const visiblePendingUsers = visibleApprovalData.filter((user) => !user.is_active && !isRejectedRegistration(user));
  const readyPendingUsers = visiblePendingUsers.filter((user) => !hasMissingRequiredDocs(user));
  const incompletePendingUsers = visiblePendingUsers.filter(hasMissingRequiredDocs);
  const readinessPercent = visiblePendingUsers.length > 0
    ? Math.round((readyPendingUsers.length / visiblePendingUsers.length) * 100)
    : 100;
  const readinessColor = incompletePendingUsers.length > 0 ? statusTones.warning.color : statusTones.success.color;
  const latestPendingUsers = visiblePendingUsers.slice(0, 4);
  const {
    page,
    pageSize,
    pagedItems: pagedApprovalData,
    setPage,
    totalItems,
    totalPages,
  } = usePagedData(visibleApprovalData);

  const summaryCards = [
    {
      icon: Users,
      value: approvalDataFiltered.length,
      label: 'Total Pendaftar',
      caption: 'Mahasiswa terdata',
      ...metricTone('info'),
    },
    {
      icon: Clock3,
      value: pendingUsers.length,
      label: 'Menunggu Validasi',
      caption: 'Belum diaktivasi',
      ...metricTone('warning'),
    },
    {
      icon: UserCheck,
      value: activeUsers.length,
      label: 'Akun Terverifikasi',
      caption: 'Approved admin',
      ...metricTone('success'),
    },
    {
      icon: FileWarning,
      value: incompleteUserIds.size,
      label: 'Berkas Bermasalah',
      caption: `${rejectedUsers.length} ditolak`,
      ...metricTone('danger'),
    },
  ];

  return (
    <div>
      <div style={metricGrid(isMobile)}>
        {summaryCards.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} style={{ ...metricCard, minHeight: '112px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '12px', backgroundColor: item.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                  <Icon size={17} />
                </div>
                <span style={{ color: item.color, backgroundColor: item.tint, borderRadius: '999px', padding: '5px 9px', fontSize: '9px', fontWeight: '900', whiteSpace: 'nowrap' }}>{item.caption}</span>
              </div>
              <div style={{ marginTop: '18px', color: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.7px' }}>{item.label}</div>
              <div style={{ marginTop: '7px', color: '#111827', fontSize: '28px', lineHeight: 1, fontWeight: '900' }}>{item.value}</div>
            </div>
          );
        })}
      </div>

      <div style={styles.card}>
        <div style={tabPageHeader(isMobile)}>
          <div>
            <h2 style={tabTitle(isMobile)}>
              {pageTitle}
            </h2>
            <p style={tabSubtitle}>
              {filterStatusAkun === 'ditolak'
                ? `${visibleApprovalData.length} akun ditolak menunggu mahasiswa memperbaiki dokumen dan daftar ulang.`
                : `${visibleApprovalData.length} akun sesuai filter. Setujui akun valid atau tolak agar mahasiswa bisa daftar ulang.`}
            </p>
          </div>

          <div style={toolbar(isMobile)}>
            {selectedUserIds.length > 0 && (
              <button className="btn-hover" onClick={handleBulkDeleteUsers} style={compactButton(styles, 'danger', { height: '42px', width: isMobile ? '100%' : 'auto' })}>
                <Trash2 size={15} /> Hapus Akun Terpilih ({selectedUserIds.length})
              </button>
            )}

            {showIncompleteOnly && (
              <button className="btn-hover" onClick={() => setShowIncompleteOnly(false)} style={compactButton(styles, 'slate', { height: '42px', width: isMobile ? '100%' : 'auto' })}>
                <RotateCcw size={15} /> Reset Tampilan
              </button>
            )}

            {canApproveAll && (
              <button className="btn-hover" onClick={handleApproveAllStudents} style={compactButton(styles, 'primary', { height: '42px', width: isMobile ? '100%' : 'auto' })}>
                <CheckCircle size={15} /> Setujui Semua ({filteredPending.length})
              </button>
            )}
          </div>
        </div>

        {filterStatusAkun !== 'ditolak' && <div style={readinessPanel(isMobile)}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <span style={badge(incompletePendingUsers.length > 0 ? 'warning' : 'success')}>
                <ShieldCheck size={12} /> Kesiapan Validasi
              </span>
              <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '800' }}>
                {readyPendingUsers.length} dari {visiblePendingUsers.length} akun pending siap disetujui
              </span>
            </div>
            <h3 style={{ margin: 0, color: '#111827', fontSize: isMobile ? '18px' : '21px', fontWeight: '900', lineHeight: 1.25 }}>
              {incompletePendingUsers.length > 0
                ? `${incompletePendingUsers.length} akun masih perlu perhatian berkas`
                : 'Semua akun pending pada filter ini siap diproses'}
            </h3>
            <p style={{ margin: '7px 0 14px', color: '#64748b', fontSize: '12px', fontWeight: '600', lineHeight: 1.55 }}>
              Gunakan Setujui untuk akun dengan dokumen lengkap. Jika ditolak, alasan akan disimpan dan mahasiswa dapat daftar ulang menggunakan email yang sama.
            </p>
            <div style={{ height: '10px', borderRadius: '999px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
              <div style={{ width: `${readinessPercent}%`, height: '100%', borderRadius: '999px', backgroundColor: readinessColor, transition: 'width 0.25s ease' }} />
            </div>
            <div style={{ marginTop: '7px', color: readinessColor, fontSize: '11px', fontWeight: '900' }}>
              {readinessPercent}% siap validasi
            </div>
          </div>

        </div>}

        <div style={{ marginBottom: '22px' }}>
          <StatusSegmentedControl
            value={filterStatusAkun}
            onChange={setFilterStatusAkun}
            isMobile={isMobile}
            options={[
              { value: '', label: 'Menunggu' },
              { value: 'aktif', label: 'Aktif' },
              { value: 'ditolak', label: 'Ditolak' },
              { value: 'semua', label: 'Semua' },
            ]}
          />
        </div>

        <div style={tableShell}>
          <table style={{ ...styles.table, marginTop: 0 }}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: '48px', textAlign: 'center', borderTopLeftRadius: '16px' }}>
                  <CheckSquare size={14} color="#94a3b8" />
                </th>
                <th style={styles.th}>NIM</th>
                <th style={styles.th}>Nama Lengkap</th>
                <th style={styles.th}>Program Studi</th>
                <th style={styles.th}>Status Akun</th>
                <th style={styles.th}>Berkas Syarat</th>
                <th style={{ ...styles.th, ...actionCell, minWidth: '132px', borderTopRightRadius: '16px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagedApprovalData.map((user) => {
                const noKonsul = missingFile(user.bukti_konsul_file);
                const noSPTJM = missingFile(user.sptjm_file);
                const hasMissingDocs = noKonsul || noSPTJM;
                const isRejected = isRejectedRegistration(user);
                const isSelected = selectedUserIds.includes(user.id);
                const rowBg = isSelected ? statusTones.warning.tint : (isRejected ? statusTones.danger.tint : (hasMissingDocs && !user.is_active ? statusTones.warning.tint : adminColors.surface));
                const rowAccent = user.is_active ? statusTones.success.color : (isRejected ? statusTones.danger.color : (hasMissingDocs ? statusTones.warning.color : statusTones.success.color));

                return (
                  <tr key={user.id} style={{ ...styles.tr, backgroundColor: rowBg, boxShadow: `inset 3px 0 0 ${rowAccent}` }}>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <input type="checkbox" className="custom-checkbox" checked={isSelected} onChange={() => handleToggleUserSelection(user.id)} />
                    </td>
                    <td style={{ ...styles.td, fontWeight: '900', color: adminColors.inputText, whiteSpace: 'nowrap' }}>{user.nim || '-'}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={studentAvatar}>{getInitials(user)}</div>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ color: adminColors.text, fontSize: '13px', textTransform: 'capitalize', display: 'block', lineHeight: 1.4 }}>{user.first_name} {user.last_name}</strong>
                          <span style={{ fontSize: '11px', color: adminColors.textMuted, display: 'block', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...badge('info'), textTransform: 'uppercase' }}>
                        {user.program_studi || '-'}{user.angkatan ? ` Angk. ${user.angkatan}` : ''}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={badge(user.is_active ? 'success' : (isRejected ? 'danger' : 'warning'))}>
                        {user.is_active ? 'Aktif' : (isRejected ? 'Ditolak' : 'Menunggu')}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={documentGroup}>
                        {!noKonsul ? (
                          <a className="btn-hover" href={user.bukti_konsul_file} target="_blank" rel="noreferrer" style={{ ...badge('success'), textDecoration: 'none' }}><Eye size={12} /> Bukti Konsul</a>
                        ) : (
                          <span style={badge('danger')}><AlertCircle size={12} /> Konsul Kosong</span>
                        )}
                        {!noSPTJM ? (
                          <a className="btn-hover" href={user.sptjm_file} target="_blank" rel="noreferrer" style={{ ...badge('info'), textDecoration: 'none' }}><Eye size={12} /> SPTJM</a>
                        ) : (
                          <span style={badge('danger')}><AlertCircle size={12} /> SPTJM Kosong</span>
                        )}
                      </div>
                      {isRejected && user.registration_rejection_reason && (
                        <p style={{ margin: '8px 0 0', maxWidth: '310px', color: statusTones.danger.foreground, fontSize: '11px', fontWeight: '700', lineHeight: 1.5 }}>
                          Alasan: {user.registration_rejection_reason}
                        </p>
                      )}
                    </td>
                    <td style={{ ...styles.td, ...actionCell, minWidth: '132px' }}>
                      <div style={actionButtonGroup(isMobile)}>
                        {user.is_active || isRejected ? (
                          <button
                            className="btn-hover"
                            onClick={() => handleDeleteStudentAccount(user)}
                            style={actionIconButton('danger')}
                            title="Hapus akun mahasiswa"
                            aria-label={`Hapus akun ${user.first_name || user.email || 'mahasiswa'}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn-hover"
                              onClick={() => handleApproveStudent(user)}
                              style={actionIconButton('success')}
                              title={hasMissingDocs ? 'Paksa setujui akun' : 'Setujui akun'}
                              aria-label={`Setujui akun ${user.first_name || user.email || 'mahasiswa'}`}
                            >
                              <CheckCircle size={15} />
                            </button>
                            <button
                              className="btn-hover"
                              onClick={() => handleRejectStudent(user)}
                              style={actionIconButton('danger')}
                              title="Tolak pendaftaran"
                              aria-label={`Tolak pendaftaran ${user.first_name || user.email || 'mahasiswa'}`}
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visibleApprovalData.length === 0 && (
                <tr><td colSpan="7" style={emptyState}>Tidak ada pendaftar yang sesuai filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <PaginationControls
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            isMobile={isMobile}
            itemLabel="akun"
          />
          <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '11px', fontWeight: '700' }}>
            {selectedUserIds.length > 0 ? `${selectedUserIds.length} akun dipilih.` : 'Belum ada akun yang dipilih'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: '18px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8eef7', borderRadius: '14px', padding: '20px', boxShadow: '0 14px 34px rgba(15, 23, 42, 0.06)' }}>
          <h3 style={{ color: '#111827', margin: 0, fontSize: '22px', fontWeight: '900' }}>Aktivitas Terbaru</h3>
          <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>Ringkasan akun yang paling baru muncul pada antrean validasi.</p>
          <div style={{ display: 'grid', gap: '10px', marginTop: '16px' }}>
            {latestPendingUsers.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700', backgroundColor: '#f8fafc', border: '1px solid #e8eef7', borderRadius: '12px', padding: '14px' }}>
                Tidak ada akun pending pada filter ini.
              </div>
            ) : (
              latestPendingUsers.map((user) => (
                <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', backgroundColor: '#f8fafc', border: '1px solid #e8eef7', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div style={{ ...studentAvatar, width: '30px', height: '30px', borderRadius: '10px' }}>{getInitials(user)}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: '#111827', fontSize: '12px', fontWeight: '900', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.first_name} {user.last_name}</div>
                      <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.program_studi || 'Program belum diisi'} {user.nim ? `- ${user.nim}` : ''}</div>
                    </div>
                  </div>
                  <span style={badge(hasMissingRequiredDocs(user) ? 'danger' : 'warning')}>
                    {hasMissingRequiredDocs(user) ? 'Cek Berkas' : 'Pending'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <GuidancePanel
          title="Panduan Administrator"
          description="Gunakan area ini untuk menjaga proses verifikasi akun tetap konsisten."
          icon={ShieldCheck}
          items={[
            'Pastikan NIM, program studi, bukti konsul, dan SPTJM sudah sesuai sebelum akun disetujui.',
            'Jika ada data lama yang belum lengkap, tolak pendaftaran agar mahasiswa bisa daftar ulang dengan dokumen yang benar.',
            'Pakai checkbox untuk menghapus pendaftar yang jelas duplikat atau salah input.',
          ]}
        />
      </div>
    </div>
  );
}

export default ApprovalTab;
