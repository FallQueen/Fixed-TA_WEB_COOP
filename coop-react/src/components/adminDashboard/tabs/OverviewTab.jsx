import { Activity, Briefcase, CheckCircle, Clock3, Edit2, UserRoundCheck, Users, XCircle } from 'lucide-react';
import {
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
  tabPageHeader,
  tabSubtitle,
  tabTitle,
  tableShell,
  toolbar,
} from './sharedTabStyles';
import GuidancePanel from './GuidancePanel';
import PaginationControls from './PaginationControls';
import ProgressStatusPanel from './ProgressStatusPanel';
import StatusSegmentedControl from './StatusSegmentedControl';
import usePagedData from './usePagedData';
import PlacementCompanyCell from './PlacementCompanyCell';
import {
  getLatestPlacementsByStudent,
  getPendingPlacementApprovals,
  getPlacementId,
  isPendingPlacementApproval,
  isSameStudent,
} from '../helpers';

const studentInitialBadge = {
  width: '34px',
  height: '34px',
  borderRadius: '12px',
  backgroundColor: statusTones.info.tint,
  border: `1px solid ${statusTones.info.borderColor}`,
  color: statusTones.info.foreground,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  fontWeight: '900',
  flexShrink: 0,
};

function OverviewTab({
  styles,
  isMobile,
  filterStatusMagang,
  setFilterStatusMagang,
  placements,
  handleApproveAllPlacements,
  overviewStudentsFiltered,
  monthlyReports,
  hitungDurasi,
  setEditingStudent,
  handleRejectPlacement,
  openApprovePlacementModal,
}) {
  const currentPlacements = getLatestPlacementsByStudent(placements);
  const getStudentPlacement = (student) => currentPlacements.find((placement) => isSameStudent(placement.student, student.id));
  const pendingPlacements = getPendingPlacementApprovals(placements);
  const verifiedCount = overviewStudentsFiltered.filter((student) => {
    const placement = getStudentPlacement(student);
    return placement?.is_approved;
  }).length;
  const waitingCount = overviewStudentsFiltered.filter((student) => {
    const placement = getStudentPlacement(student);
    return isPendingPlacementApproval(placement);
  }).length;
  const rejectedCount = overviewStudentsFiltered.filter((student) => {
    const placement = getStudentPlacement(student);
    return placement?.status === 'rejected';
  }).length;
  const noPlacementCount = overviewStudentsFiltered.filter((student) => (
    !getStudentPlacement(student)
  )).length;
  const notTrackedCount = waitingCount + noPlacementCount + rejectedCount;
  const trackingProgressPercent = overviewStudentsFiltered.length > 0
    ? Math.round((verifiedCount / overviewStudentsFiltered.length) * 100)
    : 100;

  const metrics = [
    { icon: Users, label: 'Mahasiswa Aktif', value: overviewStudentsFiltered.length, ...metricTone('info') },
    { icon: UserRoundCheck, label: 'Terverifikasi', value: verifiedCount, ...metricTone('success') },
    { icon: Clock3, label: 'Menunggu ACC', value: waitingCount, ...metricTone('warning') },
    { icon: Briefcase, label: 'Belum Input', value: noPlacementCount, ...metricTone('danger') },
  ];
  const {
    page,
    pageSize,
    pagedItems: pagedStudents,
    setPage,
    totalItems,
    totalPages,
  } = usePagedData(overviewStudentsFiltered);

  return (
    <div>
      <div style={metricGrid(isMobile)}>
        {metrics.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} style={metricCard}>
              <div style={{ width: '34px', height: '34px', borderRadius: '12px', backgroundColor: item.tint, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={17} />
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
            <h2 style={tabTitle(isMobile)}>Overview & Tracking</h2>
            <p style={tabSubtitle}>Pantau status tempat magang, durasi, dan progres laporan mahasiswa aktif.</p>
          </div>

          <div style={toolbar(isMobile)}>
            {pendingPlacements.length > 0 && (
              <button className="btn-hover" onClick={handleApproveAllPlacements} style={compactButton(styles, 'primary', { height: '42px', width: isMobile ? '100%' : 'auto' })}>
                <CheckCircle size={15} /> Verifikasi Semua ({pendingPlacements.length})
              </button>
            )}
          </div>
        </div>

        <ProgressStatusPanel
          isMobile={isMobile}
          icon={Activity}
          label="Progress Tracking"
          title={
            overviewStudentsFiltered.length === 0
              ? 'Tidak ada mahasiswa pada filter ini'
              : notTrackedCount > 0
                ? `${notTrackedCount} mahasiswa belum masuk tracking aktif`
                : 'Semua mahasiswa pada filter ini sudah terverifikasi'
          }
          description="Progress dihitung dari mahasiswa aktif yang sudah memiliki tempat magang terverifikasi. Status Menunggu ACC perlu direview, sedangkan Belum Input perlu diarahkan untuk mengisi data magang."
          percent={trackingProgressPercent}
          tone={notTrackedCount > 0 ? 'warning' : 'success'}
          meta={`${verifiedCount}/${overviewStudentsFiltered.length} mahasiswa terverifikasi`}
          percentLabel="terverifikasi"
        />

        <div style={{ marginBottom: '22px' }}>
          <StatusSegmentedControl
            value={filterStatusMagang}
            onChange={setFilterStatusMagang}
            isMobile={isMobile}
            options={[
              { value: '', label: 'Semua' },
              { value: 'menunggu', label: 'Menunggu' },
              { value: 'terverifikasi', label: 'Terverifikasi' },
              { value: 'belum_input', label: 'Belum Input' },
              { value: 'ditolak', label: 'Ditolak' },
            ]}
          />
        </div>

        <div style={tableShell}>
          <table style={{ ...styles.table, marginTop: 0 }}>
            <thead>
              <tr>
                <th style={{ ...styles.th, borderTopLeftRadius: '16px' }}>NIM</th>
                <th style={styles.th}>Nama Mahasiswa</th>
                <th style={styles.th}>Perusahaan</th>
                <th style={styles.th}>Durasi</th>
                <th style={styles.th}>Status Tempat Magang</th>
                <th style={styles.th}>Progres Laporan Bulanan</th>
                <th style={{ ...styles.th, ...actionCell, borderTopRightRadius: '16px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagedStudents.map((student) => {
                const mhsPlacement = getStudentPlacement(student);
                const trackedPlacementIds = mhsPlacement
                  ? [mhsPlacement.id, ...(mhsPlacement.historyPlacements || []).map((item) => item.id)].map(String)
                  : [];
                const reportCount = trackedPlacementIds.length > 0
                  ? monthlyReports.filter((report) => trackedPlacementIds.includes(String(getPlacementId(report)))).length
                  : 0;
                const canRejectPlacement = isPendingPlacementApproval(mhsPlacement);

                return (
                  <tr key={student.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: '900', color: '#334155', whiteSpace: 'nowrap' }}>{student.nim || '-'}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div style={studentInitialBadge}>
                          {String(student.first_name || student.email || 'M').trim().charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ color: '#111827', fontSize: '13px', textTransform: 'capitalize', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {student.first_name} {student.last_name}
                          </strong>
                          <div style={{ marginTop: '4px', fontSize: '11px', color: '#64748b', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {student.program_studi || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}><PlacementCompanyCell placement={mhsPlacement} /></td>
                    <td style={styles.td}>
                      {mhsPlacement ? (
                        <span style={badge('neutral')}>
                          <Clock3 size={13} /> {hitungDurasi(mhsPlacement.start_date, mhsPlacement.end_date)}
                        </span>
                      ) : <span style={{ color: '#cbd5e1' }}>-</span>}
                    </td>
                    <td style={styles.td}>
                      {!mhsPlacement ? (
                        <span style={badge('neutral')}>Belum Input</span>
                      ) : mhsPlacement.is_approved ? (
                        <span style={badge('success')}><CheckCircle size={13} /> Terverifikasi</span>
                      ) : isPendingPlacementApproval(mhsPlacement) ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={badge('warning')}>Menunggu ACC</span>
                          <button className="btn-hover" onClick={() => openApprovePlacementModal(mhsPlacement, student)} style={compactButton(styles, 'neutral', { padding: '8px 12px' })}>
                            Review Berkas
                          </button>
                        </div>
                      ) : mhsPlacement.status === 'rejected' ? (
                        <span style={badge('danger')} title={mhsPlacement.rejection_reason || 'Pengajuan ditolak admin'}><XCircle size={13} /> Ditolak</span>
                      ) : (
                        <span style={badge('neutral')}>{mhsPlacement.status || 'Belum Aktif'}</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {mhsPlacement?.is_approved ? (
                        reportCount > 0 ? (
                          <span style={badge('info')}>{reportCount} Laporan</span>
                        ) : <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>Belum ada</span>
                      ) : <span style={{ color: '#cbd5e1' }}>-</span>}
                    </td>
                    <td style={{ ...styles.td, ...actionCell }}>
                      <div style={actionButtonGroup(isMobile)}>
                        <button
                          className="btn-hover"
                          onClick={() => setEditingStudent(student)}
                          style={actionIconButton('neutral')}
                          title="Edit data mahasiswa"
                          aria-label={`Edit data ${student.first_name || student.email || 'mahasiswa'}`}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-hover"
                          onClick={() => canRejectPlacement && handleRejectPlacement(mhsPlacement, student)}
                          style={actionIconButton(canRejectPlacement ? 'danger' : 'neutral', !canRejectPlacement)}
                          title={canRejectPlacement ? 'Reject pengajuan tempat magang' : 'Tidak ada pengajuan pending untuk direject'}
                          aria-label={`Reject pengajuan tempat magang ${student.first_name || student.email || 'mahasiswa'}`}
                          disabled={!canRejectPlacement}
                        >
                          <XCircle size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {overviewStudentsFiltered.length === 0 && (
                <tr><td colSpan="7" style={emptyState}>Tidak ada mahasiswa yang sesuai filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          isMobile={isMobile}
          itemLabel="mahasiswa"
        />
      </div>

      <div style={{ marginTop: '18px' }}>
        <GuidancePanel
          title="Panduan Tracking"
          description="Gunakan tab ini untuk menjaga alur validasi tempat magang dan laporan bulanan tetap rapi."
          items={[
            'Prioritaskan mahasiswa berstatus Menunggu ACC agar data tempat magang segera masuk ke tracking aktif.',
            'Cek durasi magang sebelum verifikasi untuk menghindari periode yang tidak sesuai.',
            'Pantau jumlah laporan bulanan setelah tempat magang terverifikasi.',
          ]}
        />
      </div>
    </div>
  );
}

export default OverviewTab;
