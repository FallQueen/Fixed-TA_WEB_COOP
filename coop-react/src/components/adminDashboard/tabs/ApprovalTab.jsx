import {
  AlertCircle,
  CheckCircle,
  CheckSquare,
  Clock3,
  Edit2,
  Eye,
  FileWarning,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { stemRed } from '../../../styles/adminstyles';
import GuidancePanel from './GuidancePanel';
import PaginationControls from './PaginationControls';
import StatusSegmentedControl from './StatusSegmentedControl';
import usePagedData from './usePagedData';

const missingFile = (file) => !file || String(file).trim() === '' || String(file).includes('null');

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
  handleApproveAllStudents,
  approvalDataFiltered,
  handleToggleUserSelection,
  setEditingStudent,
  handleApproveStudent,
}) {
  const visibleApprovalData = approvalDataFiltered.filter((user) => {
    if (!showIncompleteOnly) return true;

    return missingFile(user.bukti_konsul_file) || missingFile(user.sptjm_file);
  });

  const activeUsers = approvalDataFiltered.filter((user) => user.is_active);
  const pendingUsers = approvalDataFiltered.filter((user) => !user.is_active);
  const incompleteUsers = visibleApprovalData.filter((user) => (
    missingFile(user.bukti_konsul_file) || missingFile(user.sptjm_file)
  ));
  const pageTitle = showIncompleteOnly ? 'Mahasiswa Berkas Bermasalah' : 'Antrean Persetujuan';
  const canApproveAll = filteredPending.length > 0 && !showIncompleteOnly;
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
      tint: '#eef2ff',
      color: '#4f46e5',
    },
    {
      icon: Clock3,
      value: pendingUsers.length,
      label: 'Menunggu Validasi',
      caption: 'Belum diaktivasi',
      tint: '#fff7ed',
      color: '#f97316',
    },
    {
      icon: UserCheck,
      value: activeUsers.length,
      label: 'Akun Terverifikasi',
      caption: 'Approved admin',
      tint: '#ecfdf5',
      color: '#10b981',
    },
    {
      icon: FileWarning,
      value: incompleteUsers.length,
      label: 'Berkas Bermasalah',
      caption: 'Butuh pengecekan',
      tint: '#fff1f2',
      color: '#f43f5e',
    },
  ];

  return (
    <div>
      <div style={styles.card}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '18px', marginBottom: '22px' }}>
          <div>
            <h2 style={{ color: '#111827', margin: 0, fontSize: isMobile ? '22px' : '28px', fontWeight: '900', letterSpacing: '0' }}>
              {pageTitle}
            </h2>
            <p style={{ margin: '5px 0 0', color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>
              Ditemukan {visibleApprovalData.length} akun yang sesuai dengan filter validasi saat ini.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto', flexWrap: 'wrap', justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
            {selectedUserIds.length > 0 && (
              <button className="btn-hover" onClick={handleBulkDeleteUsers} style={{ ...styles.btnPrimary, backgroundColor: '#dc2626', padding: '12px 16px', borderRadius: '12px', fontSize: '12px', flex: isMobile ? 1 : 'none' }}>
                <Trash2 size={15} /> Hapus Terpilih ({selectedUserIds.length})
              </button>
            )}

            {showIncompleteOnly && (
              <button className="btn-hover" onClick={() => setShowIncompleteOnly(false)} style={{ ...styles.btnAction, backgroundColor: '#94a3b8', padding: '12px 16px', borderRadius: '12px', fontSize: '12px', flex: isMobile ? 1 : 'none' }}>
                <RotateCcw size={15} /> Reset Tampilan
              </button>
            )}

            {canApproveAll && (
              <button className="btn-hover" onClick={handleApproveAllStudents} style={{ ...styles.btnPrimary, backgroundColor: stemRed, padding: '12px 18px', borderRadius: '12px', width: isMobile ? '100%' : 'auto', fontSize: '12px', boxShadow: '0 10px 22px rgba(179, 19, 18, 0.18)' }}>
                <CheckCircle size={15} /> Setujui Semua ({filteredPending.length})
              </button>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '22px' }}>
          <StatusSegmentedControl
            value={filterStatusAkun}
            onChange={setFilterStatusAkun}
            isMobile={isMobile}
            options={[
              { value: '', label: 'Menunggu' },
              { value: 'aktif', label: 'Aktif' },
              { value: 'semua', label: 'Semua' },
            ]}
          />
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #edf2f7', borderRadius: '16px' }}>
          <table style={{ ...styles.table, marginTop: 0 }}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: '48px', textAlign: 'center', borderTopLeftRadius: '16px' }}>
                  <CheckSquare size={14} color="#94a3b8" />
                </th>
                <th style={styles.th}>NIM</th>
                <th style={styles.th}>Nama Lengkap</th>
                <th style={styles.th}>Program Studi</th>
                <th style={styles.th}>Berkas Syarat</th>
                <th style={{ ...styles.th, borderTopRightRadius: '16px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagedApprovalData.map((user) => {
                const noKonsul = missingFile(user.bukti_konsul_file);
                const noSPTJM = missingFile(user.sptjm_file);
                const isBerkasValid = !(noKonsul || noSPTJM);
                const rowBg = selectedUserIds.includes(user.id) ? '#fef2f2' : '#ffffff';

                return (
                  <tr key={user.id} style={{ ...styles.tr, backgroundColor: rowBg }}>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <input type="checkbox" className="custom-checkbox" checked={selectedUserIds.includes(user.id)} onChange={() => handleToggleUserSelection(user.id)} />
                    </td>
                    <td style={{ ...styles.td, fontWeight: '900', color: '#334155', whiteSpace: 'nowrap' }}>{user.nim || '-'}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div>
                          <strong style={{ color: '#111827', fontSize: '13px', textTransform: 'lowercase' }}>{user.first_name} {user.last_name}</strong><br />
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{user.email}</span>
                        </div>
                        <button className="edit-icon-btn" onClick={() => setEditingStudent(user)} title="Edit Typo Profil">
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: '999px', backgroundColor: '#eef2ff', color: '#4f46e5', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {user.program_studi || '-'}{user.angkatan ? ` Angk. ${user.angkatan}` : ''}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {!noKonsul ? (
                          <a className="btn-hover" href={user.bukti_konsul_file} target="_blank" rel="noreferrer" style={{ ...styles.linkDoc, color: '#15803d', backgroundColor: '#ecfdf5', borderColor: '#bbf7d0' }}><Eye size={12} /> Konsul</a>
                        ) : (
                          <span style={styles.badgeDanger}><AlertCircle size={12} /> Konsul Kosong</span>
                        )}
                        {!noSPTJM ? (
                          <a className="btn-hover" href={user.sptjm_file} target="_blank" rel="noreferrer" style={{ ...styles.linkDoc, color: '#1d4ed8', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}><Eye size={12} /> SPTJM</a>
                        ) : (
                          <span style={styles.badgeDanger}><AlertCircle size={12} /> SPTJM Kosong</span>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {user.is_active ? (
                        <span style={{ ...styles.badgeSuccess, padding: '8px 12px' }}><CheckCircle size={13} /> Akun Aktif</span>
                      ) : isBerkasValid ? (
                        <button className="btn-hover" onClick={() => handleApproveStudent(user)} style={{ ...styles.btnSuccess, backgroundColor: stemRed, padding: '9px 16px', fontSize: '11px', minWidth: '150px', borderRadius: '10px', boxShadow: '0 10px 20px rgba(179, 19, 18, 0.16)' }}><CheckCircle size={13} /> Setujui Akun</button>
                      ) : (
                        <button className="btn-hover" onClick={() => handleApproveStudent(user)} style={{ ...styles.btnDanger, backgroundColor: stemRed, color: 'white', padding: '9px 16px', fontSize: '11px', minWidth: '150px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><AlertCircle size={13} /> Paksa Setujui</button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {visibleApprovalData.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>Tidak ada pendaftar yang sesuai filter.</td></tr>
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

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, minmax(0, 1fr))', gap: '18px', marginBottom: '20px' }}>
        {summaryCards.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} style={{ backgroundColor: '#ffffff', border: '1px solid #e8eef7', borderRadius: '14px', padding: '20px', minHeight: '118px', boxShadow: '0 14px 34px rgba(15, 23, 42, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '12px', backgroundColor: item.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                  <Icon size={17} />
                </div>
                <span style={{ color: item.color, backgroundColor: item.tint, borderRadius: '999px', padding: '5px 9px', fontSize: '9px', fontWeight: '900' }}>{item.caption}</span>
              </div>
              <div style={{ marginTop: '18px', color: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.7px' }}>{item.label}</div>
              <div style={{ marginTop: '7px', color: '#111827', fontSize: '28px', lineHeight: 1, fontWeight: '900' }}>{item.value}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: '18px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8eef7', borderRadius: '14px', padding: '20px', boxShadow: '0 14px 34px rgba(15, 23, 42, 0.06)' }}>
          <h3 style={{ color: '#111827', margin: 0, fontSize: '22px', fontWeight: '900' }}>Aktivitas Terbaru</h3>
          <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>Ringkasan akun yang paling baru muncul pada antrean validasi.</p>
        </div>

        <GuidancePanel
          title="Panduan Administrator"
          description="Gunakan area ini untuk menjaga proses verifikasi akun tetap konsisten."
          icon={ShieldCheck}
          items={[
            'Pastikan NIM, program studi, bukti konsul, dan SPTJM sudah sesuai sebelum akun disetujui.',
            'Gunakan Paksa Setujui hanya jika admin memang menerima risiko berkas yang belum lengkap.',
            'Pakai checkbox untuk menghapus pendaftar yang jelas duplikat atau salah input.',
          ]}
        />
      </div>
    </div>
  );
}

export default ApprovalTab;
