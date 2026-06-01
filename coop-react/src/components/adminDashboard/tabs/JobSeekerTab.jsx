import { Activity, Eye, Mail, Send, UserRoundSearch } from 'lucide-react';
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
import useLocalNotes from './useLocalNotes';
import usePagedData from './usePagedData';
import { isPendingPlacementApproval, isSameStudent } from '../helpers';

function JobSeekerTab({
  styles,
  isMobile,
  filterStatusJobSeeker,
  setFilterStatusJobSeeker,
  openEmailModal,
  jobSeekerFiltered,
  placements,
  weeklyReports,
  setSelectedStudentReports,
}) {
  const getStudentWeeklyReports = (student) => weeklyReports.filter((report) => isSameStudent(report.student, student.id));
  const getPendingPlacement = (student) => placements.find((placement) => (
    isSameStudent(placement.student, student.id) && isPendingPlacementApproval(placement)
  ));
  const withReports = jobSeekerFiltered.filter((student) => getStudentWeeklyReports(student).length > 0).length;
  const withoutReports = jobSeekerFiltered.length - withReports;
  const waitingApproval = jobSeekerFiltered.filter((student) => getPendingPlacement(student)).length;
  const monitoredCount = jobSeekerFiltered.filter((student) => (
    getStudentWeeklyReports(student).length > 0 || getPendingPlacement(student)
  )).length;
  const jobSeekerProgressPercent = jobSeekerFiltered.length > 0
    ? Math.round((monitoredCount / jobSeekerFiltered.length) * 100)
    : 100;
  const needsFollowUpCount = jobSeekerFiltered.length - monitoredCount;
  const { notes, updateNote } = useLocalNotes('admin-job-seeker-follow-up-notes');
  const {
    page,
    pageSize,
    pagedItems: pagedJobSeekers,
    setPage,
    totalItems,
    totalPages,
  } = usePagedData(jobSeekerFiltered);

  const metrics = [
    { icon: UserRoundSearch, label: 'Job Seeker', value: jobSeekerFiltered.length, ...metricTone('info') },
    { icon: Activity, label: 'Pernah Lapor', value: withReports, ...metricTone('success') },
    { icon: Mail, label: 'Belum Pernah Lapor', value: withoutReports, ...metricTone('danger') },
    { icon: Send, label: 'Menunggu ACC', value: waitingApproval, ...metricTone('warning') },
  ];

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
            <h2 style={tabTitle(isMobile)}>Pantau Job Seeker</h2>
            <p style={tabSubtitle}>Monitor mahasiswa yang belum punya tempat magang approved, progress pencarian, dan pengajuan yang menunggu ACC.</p>
          </div>

          <div style={toolbar(isMobile)}>
            <button className="btn-hover" onClick={() => openEmailModal('job_seeker')} style={compactButton(styles, 'primary', { height: '42px', width: isMobile ? '100%' : 'auto' })}>
              <Mail size={15} /> Kirim Email Massal
            </button>
          </div>
        </div>

        <ProgressStatusPanel
          isMobile={isMobile}
          icon={Activity}
          label="Progress Monitoring"
          title={needsFollowUpCount > 0 ? `${needsFollowUpCount} job seeker belum punya sinyal progress` : 'Semua job seeker pada filter ini sudah terpantau'}
          description="Mahasiswa dianggap terpantau jika sudah pernah mengirim laporan mingguan atau sudah mengajukan tempat magang yang menunggu ACC."
          percent={jobSeekerProgressPercent}
          tone={needsFollowUpCount > 0 ? 'warning' : 'success'}
          meta={`${monitoredCount}/${jobSeekerFiltered.length} mahasiswa terpantau`}
          percentLabel="terpantau"
        />

        <div style={{ marginBottom: '22px' }}>
          <StatusSegmentedControl
            value={filterStatusJobSeeker}
            onChange={setFilterStatusJobSeeker}
            isMobile={isMobile}
            options={[
              { value: '', label: 'Semua' },
              { value: 'menunggu_acc', label: 'Menunggu ACC' },
              { value: 'pernah_lapor', label: 'Pernah Lapor' },
              { value: 'belum_pernah_lapor', label: 'Belum Pernah Lapor' },
            ]}
          />
        </div>

        <div style={tableShell}>
          <table style={{ ...styles.table, marginTop: 0 }}>
            <thead>
              <tr>
                <th style={{ ...styles.th, borderTopLeftRadius: '16px' }}>NIM / Nama</th>
                <th style={styles.th}>Program Studi</th>
                <th style={styles.th}>Status Progress</th>
                <th style={styles.th}>Catatan Follow Up</th>
                <th style={{ ...styles.th, ...actionCell, borderTopRightRadius: '16px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagedJobSeekers.map((student) => {
                const mhsPlacement = getPendingPlacement(student);
                const mhsWeeklyReports = getStudentWeeklyReports(student)
                  .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

                return (
                  <tr key={student.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong style={{ color: '#111827', fontSize: '13px', textTransform: 'capitalize' }}>{student.first_name} {student.last_name}</strong><br />
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{student.nim}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={badge('info')}>{student.program_studi || '-'}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                        {mhsPlacement && (
                          <span style={badge('warning')}>Menunggu ACC Admin</span>
                        )}
                        {mhsWeeklyReports.length > 0 ? (
                          <span style={badge('success')}>{mhsWeeklyReports.length} Progress Pernah Dikirim</span>
                        ) : (
                          <span style={badge('neutral')}>Belum pernah lapor progress</span>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <textarea
                        value={notes[student.id] || ''}
                        onChange={(event) => updateNote(student.id, event.target.value)}
                        placeholder="Catatan kontak terakhir..."
                        rows={2}
                        style={{ width: '220px', minHeight: '58px', resize: 'vertical', border: '1px solid #e8eef7', borderRadius: '10px', padding: '9px 10px', color: '#334155', backgroundColor: '#f8fafc', fontSize: '11px', fontFamily: 'inherit', fontWeight: '600' }}
                      />
                    </td>
                    <td style={{ ...styles.td, ...actionCell }}>
                      <div style={actionButtonGroup(isMobile)}>
                        <button
                          className="btn-hover"
                          onClick={() => setSelectedStudentReports({ student, reports: mhsWeeklyReports })}
                          style={actionIconButton('primary')}
                          title="Lihat riwayat progress"
                          aria-label={`Lihat riwayat progress ${student.first_name || student.email || 'mahasiswa'}`}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="btn-hover"
                          onClick={() => openEmailModal('job_seeker', student.id, `${student.first_name} ${student.last_name}`)}
                          style={actionIconButton('neutral')}
                          title="Kirim reminder"
                          aria-label={`Kirim reminder ke ${student.first_name || student.email || 'mahasiswa'}`}
                        >
                          <Mail size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {jobSeekerFiltered.length === 0 && (
                <tr>
                  <td colSpan="5" style={emptyState}>
                    {filterStatusJobSeeker ? 'Tidak ada mahasiswa yang sesuai filter.' : 'Semua mahasiswa saat ini sudah mendapat tempat magang.'}
                  </td>
                </tr>
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
          title="Panduan Follow Up"
          description="Gunakan panduan ini saat menghubungi mahasiswa yang belum memiliki tempat magang."
          icon={Mail}
          items={[
            'Mulai dari mahasiswa yang Belum Pernah Lapor karena admin belum punya konteks progress pencarian.',
            'Untuk yang Pernah Lapor, buka Lihat Riwayat lalu kirim reminder yang spesifik.',
            'Mahasiswa Menunggu ACC sudah mengisi data magang dan perlu diverifikasi di Overview & Tracking.',
            'Gunakan email massal untuk pengingat umum, lalu follow-up personal untuk kasus yang sudah berulang.',
          ]}
        />
      </div>
    </div>
  );
}

export default JobSeekerTab;
