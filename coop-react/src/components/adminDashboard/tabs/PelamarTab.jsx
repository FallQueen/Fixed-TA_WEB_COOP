import { BriefcaseBusiness, CheckCircle, Clock3, Eye, Trash2, Undo2, UserRoundCheck, UsersRound, XCircle } from 'lucide-react';
import {
  actionButtonGroup,
  actionCell,
  actionIconButton,
  badge,
  emptyState,
  metricTone,
  metricCard,
  metricGrid,
  tabPageHeader,
  tabSubtitle,
  tabTitle,
  tableShell,
} from './sharedTabStyles';
import GuidancePanel from './GuidancePanel';
import ProgressStatusPanel from './ProgressStatusPanel';
import StatusSegmentedControl from './StatusSegmentedControl';

const mobileListCard = {
  backgroundColor: '#ffffff',
  border: '1px solid #e8eef7',
  borderRadius: '14px',
  padding: '14px',
  boxShadow: '0 12px 28px rgba(15, 23, 42, 0.055)',
};

function PelamarTab({
  styles,
  isMobile,
  filterStatusPelamar,
  setFilterStatusPelamar,
  applicationsFiltered,
  students,
  vacancies,
  setSelectedApplication,
  handleArchiveApplication,
}) {
  const metrics = [
    { icon: UsersRound, label: 'Total Pelamar', value: applicationsFiltered.length, ...metricTone('info') },
    { icon: BriefcaseBusiness, label: 'Menunggu Tindakan', value: applicationsFiltered.filter((app) => ['pending', 'reviewed'].includes(app.status)).length, ...metricTone('warning') },
    { icon: UserRoundCheck, label: 'Diterima', value: applicationsFiltered.filter((app) => app.status === 'accepted').length, ...metricTone('success') },
    { icon: XCircle, label: 'Ditolak', value: applicationsFiltered.filter((app) => app.status === 'rejected').length, ...metricTone('danger') },
    { icon: XCircle, label: 'Ditarik', value: applicationsFiltered.filter((app) => app.status === 'withdrawn').length, ...metricTone('neutral') },
  ];
  const waitingActionCount = applicationsFiltered.filter((app) => ['pending', 'reviewed'].includes(app.status)).length;
  const processedApplicationCount = applicationsFiltered.length - waitingActionCount;
  const reviewProgressPercent = applicationsFiltered.length > 0
    ? Math.round((processedApplicationCount / applicationsFiltered.length) * 100)
    : 100;
  const priorityQueue = applicationsFiltered
    .filter((app) => ['pending', 'reviewed'].includes(app.status))
    .map((app) => {
      const studentId = app.student?.id || app.student;
      const vacancyId = app.vacancy?.id || app.vacancy;
      const student = app.student?.id ? app.student : students.find((item) => item.id === studentId);
      const vacancy = app.vacancy?.id ? app.vacancy : vacancies.find((item) => item.id === vacancyId);

      return { app, student, vacancy };
    })
    .filter((item) => item.student && item.vacancy)
    .sort((a, b) => new Date(a.app.applied_at) - new Date(b.app.applied_at))
    .slice(0, 5);
  const applicationRows = applicationsFiltered
    .map((app) => {
      const studentId = app.student?.id || app.student;
      const vacancyId = app.vacancy?.id || app.vacancy;
      const student = app.student?.id ? app.student : students.find((item) => item.id === studentId);
      const vacancy = app.vacancy?.id ? app.vacancy : vacancies.find((item) => item.id === vacancyId);

      if (!student || !vacancy) return null;
      return { app, student, vacancy };
    })
    .filter(Boolean);

  const renderStatus = (status) => {
    if (status === 'pending' || status === 'reviewed') return <span style={badge('warning')}><Clock3 size={13} /> Menunggu Tindakan</span>;
    if (status === 'accepted') return <span style={badge('success')}><CheckCircle size={13} /> Diterima</span>;
    if (status === 'rejected') return <span style={badge('danger')}><XCircle size={13} /> Ditolak</span>;
    if (status === 'withdrawn') return <span style={badge('neutral')}><Undo2 size={13} /> Ditarik</span>;
    return <span style={badge('neutral')}>{status || '-'}</span>;
  };

  return (
    <div>
      <div style={metricGrid(isMobile, 5)}>
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
            <h2 style={tabTitle(isMobile)}>Daftar Pelamar</h2>
            <p style={tabSubtitle}>Cek CV, pesan, dan status lamaran aktif. Mahasiswa yang sudah magang/lulus tidak ditampilkan di daftar ini.</p>
          </div>

        </div>

        <ProgressStatusPanel
          isMobile={isMobile}
          icon={BriefcaseBusiness}
          label="Progress Lamaran"
          title={waitingActionCount > 0 ? `${waitingActionCount} lamaran masih menunggu tindakan` : 'Semua lamaran pada filter ini sudah ditindaklanjuti'}
          description="Progress dihitung dari lamaran yang sudah diberi keputusan diterima, ditolak, atau ditarik dari daftar pelamar aktif."
          percent={reviewProgressPercent}
          tone={waitingActionCount > 0 ? 'warning' : 'success'}
          meta={`${processedApplicationCount}/${applicationsFiltered.length} ditindaklanjuti`}
          percentLabel="ditindaklanjuti"
        />

        <div style={{ marginBottom: '22px' }}>
          <StatusSegmentedControl
            value={filterStatusPelamar}
            onChange={setFilterStatusPelamar}
            isMobile={isMobile}
            options={[
              { value: '', label: 'Semua' },
              { value: 'menunggu', label: 'Menunggu' },
              { value: 'diterima', label: 'Diterima' },
              { value: 'ditolak', label: 'Ditolak' },
              { value: 'ditarik', label: 'Ditarik' },
            ]}
          />
        </div>

        {isMobile && (
          <div style={{ display: 'grid', gap: '12px' }}>
            {applicationRows.length === 0 ? (
              <div style={{ ...mobileListCard, textAlign: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: '800' }}>
                Belum ada pelamar yang sesuai filter.
              </div>
            ) : (
              applicationRows.map(({ app, student, vacancy }) => (
                <div key={app.id} style={mobileListCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ color: '#111827', fontSize: '14px', textTransform: 'capitalize', lineHeight: 1.35 }}>{student.first_name} {student.last_name}</strong>
                      <div style={{ marginTop: '4px', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{student.program_studi} ({student.nim})</div>
                    </div>
                    {renderStatus(app.status)}
                  </div>

                  <div style={{ marginTop: '12px', padding: '11px', borderRadius: '11px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7' }}>
                    <div style={{ color: '#111827', fontSize: '12px', fontWeight: '900', lineHeight: 1.4 }}>{vacancy.title}</div>
                    <div style={{ marginTop: '4px', color: '#64748b', fontSize: '11px', fontWeight: '700' }}>{vacancy.company_name}</div>
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <span style={badge('neutral')}>{new Date(app.applied_at).toLocaleDateString('id-ID')}</span>
                    <div style={actionButtonGroup(true)}>
                      <button
                        className="btn-hover"
                        onClick={() => setSelectedApplication({ app, student, vacancy })}
                        style={actionIconButton('primary')}
                        title="Cek CV dan pesan"
                        aria-label={`Cek CV dan pesan ${student.first_name || student.email || 'pelamar'}`}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="btn-hover"
                        onClick={() => handleArchiveApplication(app)}
                        style={actionIconButton('danger')}
                        title="Arsipkan pelamar"
                        aria-label={`Arsipkan lamaran ${student.first_name || student.email || 'pelamar'}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!isMobile && <div style={tableShell}>
          <table style={{ ...styles.table, marginTop: 0 }}>
            <thead>
              <tr>
                <th style={{ ...styles.th, borderTopLeftRadius: '16px' }}>Nama Pelamar</th>
                <th style={styles.th}>Posisi & Perusahaan</th>
                <th style={styles.th}>Tanggal Apply</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, ...actionCell, borderTopRightRadius: '16px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {applicationRows.length === 0 ? (
                <tr><td colSpan="5" style={emptyState}>Belum ada pelamar yang sesuai filter.</td></tr>
              ) : (
                applicationRows.map(({ app, student, vacancy }) => (
                    <tr key={app.id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong style={{ color: '#111827', fontSize: '13px', textTransform: 'capitalize' }}>{student.first_name} {student.last_name}</strong><br />
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{student.program_studi} ({student.nim})</span>
                      </td>
                      <td style={styles.td}>
                        <strong style={{ color: '#111827', fontSize: '13px' }}>{vacancy.title}</strong><br />
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{vacancy.company_name}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={badge('neutral')}>{new Date(app.applied_at).toLocaleDateString('id-ID')}</span>
                      </td>
                      <td style={styles.td}>{renderStatus(app.status)}</td>
                      <td style={{ ...styles.td, ...actionCell }}>
                        <div style={actionButtonGroup(isMobile)}>
                          <button
                            className="btn-hover"
                            onClick={() => setSelectedApplication({ app, student, vacancy })}
                            style={actionIconButton('primary')}
                            title="Cek CV dan pesan"
                            aria-label={`Cek CV dan pesan ${student.first_name || student.email || 'pelamar'}`}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="btn-hover"
                            onClick={() => handleArchiveApplication(app)}
                            style={actionIconButton('danger')}
                            title="Arsipkan pelamar"
                            aria-label={`Arsipkan lamaran ${student.first_name || student.email || 'pelamar'}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '18px', marginTop: '18px' }}>
        <GuidancePanel
          title="Catatan Keputusan"
          description="Checklist singkat sebelum memutuskan status pelamar."
          icon={Eye}
          items={[
            'Baca CV dan pesan pelamar sebelum mengubah status lamaran.',
            'Cocokkan program studi, minat, dan skill mahasiswa dengan persyaratan lowongan.',
            'Jika profil sesuai, ubah status menjadi diterima setelah keputusan final tersedia.',
            'Jika ditolak, pastikan alasan internalnya konsisten dan tidak bertentangan dengan data pelamar.',
          ]}
        />

        <GuidancePanel
          title="Antrian Prioritas"
          description="Lamaran yang belum diberi keputusan paling lama masuk ditampilkan lebih dulu."
          icon={BriefcaseBusiness}
        >
          {priorityQueue.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>Tidak ada pelamar yang menunggu tindakan dalam filter saat ini.</div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {priorityQueue.map(({ app, student, vacancy }, index) => (
                <div key={app.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', backgroundColor: '#f8fafc', border: '1px solid #e8eef7', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '10px', backgroundColor: '#fff1f2', color: '#b31312', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900', flexShrink: 0 }}>
                      {index + 1}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: '#111827', fontSize: '12px', fontWeight: '900', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.first_name} {student.last_name}</div>
                      <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vacancy.title} - {new Date(app.applied_at).toLocaleDateString('id-ID')}</div>
                    </div>
                  </div>
                  <div style={actionButtonGroup(isMobile, { flexShrink: 0 })}>
                    <button
                      className="btn-hover"
                      onClick={() => setSelectedApplication({ app, student, vacancy })}
                      style={actionIconButton('neutral')}
                      title="Cek pelamar"
                      aria-label={`Cek pelamar ${student.first_name || student.email || 'mahasiswa'}`}
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GuidancePanel>
      </div>
    </div>
  );
}

export default PelamarTab;
