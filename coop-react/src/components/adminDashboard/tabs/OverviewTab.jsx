import { Briefcase, CheckCircle, Clock3, Edit2, UserRoundCheck, Users } from 'lucide-react';
import {
  badge,
  compactButton,
  emptyState,
  metricCard,
  metricGrid,
  tabPageHeader,
  tabSubtitle,
  tabTitle,
  tableShell,
  toolbar,
} from './sharedTabStyles';
import GuidancePanel from './GuidancePanel';
import PaginationControls from './PaginationControls';
import StatusSegmentedControl from './StatusSegmentedControl';
import usePagedData from './usePagedData';

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
  openApprovePlacementModal,
}) {
  const pendingPlacements = placements.filter((placement) => !placement.is_approved);
  const verifiedCount = overviewStudentsFiltered.filter((student) => {
    const placement = placements.find((item) => item.student === student.id);
    return placement?.is_approved;
  }).length;
  const waitingCount = overviewStudentsFiltered.filter((student) => {
    const placement = placements.find((item) => item.student === student.id);
    return placement && !placement.is_approved;
  }).length;
  const noPlacementCount = overviewStudentsFiltered.filter((student) => (
    !placements.find((placement) => placement.student === student.id)
  )).length;

  const metrics = [
    { icon: Users, label: 'Mahasiswa Aktif', value: overviewStudentsFiltered.length, tint: '#eef2ff', color: '#4f46e5' },
    { icon: UserRoundCheck, label: 'Terverifikasi', value: verifiedCount, tint: '#ecfdf5', color: '#10b981' },
    { icon: Clock3, label: 'Menunggu ACC', value: waitingCount, tint: '#fff7ed', color: '#f97316' },
    { icon: Briefcase, label: 'Belum Input', value: noPlacementCount, tint: '#fff1f2', color: '#f43f5e' },
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
                <th style={{ ...styles.th, borderTopRightRadius: '16px' }}>Progres Laporan Bulanan</th>
              </tr>
            </thead>
            <tbody>
              {pagedStudents.map((student) => {
                const mhsPlacement = placements.find((placement) => placement.student === student.id);
                const reportCount = mhsPlacement ? monthlyReports.filter((report) => report.placement === mhsPlacement.id).length : 0;

                return (
                  <tr key={student.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: '900', color: '#334155', whiteSpace: 'nowrap' }}>{student.nim || '-'}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ color: '#111827', fontSize: '13px', textTransform: 'capitalize' }}>{student.first_name} {student.last_name}</strong>
                        <button className="edit-icon-btn" onClick={() => setEditingStudent(student)} title="Edit Typo Profil"><Edit2 size={12} /></button>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>{student.program_studi}</div>
                    </td>
                    <td style={styles.td}>{mhsPlacement ? mhsPlacement.company_name : '-'}</td>
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
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={badge('warning')}>Menunggu ACC</span>
                          <button className="btn-hover" onClick={() => openApprovePlacementModal(mhsPlacement, student)} style={compactButton(styles, 'neutral', { padding: '8px 12px' })}>
                            Review Berkas
                          </button>
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      {mhsPlacement?.is_approved ? (
                        reportCount > 0 ? (
                          <span style={badge('info')}>{reportCount} Laporan</span>
                        ) : <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>Belum ada</span>
                      ) : <span style={{ color: '#cbd5e1' }}>-</span>}
                    </td>
                  </tr>
                );
              })}
              {overviewStudentsFiltered.length === 0 && (
                <tr><td colSpan="6" style={emptyState}>Tidak ada mahasiswa yang sesuai filter.</td></tr>
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
