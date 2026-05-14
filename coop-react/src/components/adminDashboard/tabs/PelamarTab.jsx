import { BriefcaseBusiness, CheckCircle, Eye, UserRoundCheck, UsersRound, XCircle } from 'lucide-react';
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
} from './sharedTabStyles';
import GuidancePanel from './GuidancePanel';
import StatusSegmentedControl from './StatusSegmentedControl';

function PelamarTab({
  styles,
  isMobile,
  filterStatusPelamar,
  setFilterStatusPelamar,
  applicationsFiltered,
  students,
  vacancies,
  setSelectedApplication,
}) {
  const metrics = [
    { icon: UsersRound, label: 'Total Pelamar', value: applicationsFiltered.length, tint: '#eef2ff', color: '#4f46e5' },
    { icon: BriefcaseBusiness, label: 'Menunggu Review', value: applicationsFiltered.filter((app) => app.status === 'pending').length, tint: '#fff7ed', color: '#f97316' },
    { icon: UserRoundCheck, label: 'Diterima', value: applicationsFiltered.filter((app) => app.status === 'accepted').length, tint: '#ecfdf5', color: '#10b981' },
    { icon: XCircle, label: 'Ditolak', value: applicationsFiltered.filter((app) => app.status === 'rejected').length, tint: '#fff1f2', color: '#f43f5e' },
  ];
  const priorityQueue = applicationsFiltered
    .filter((app) => app.status === 'pending')
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

  const renderStatus = (status) => {
    if (status === 'pending') return <span style={badge('warning')}>Menunggu Review</span>;
    if (status === 'reviewed') return <span style={badge('info')}>Telah Diteruskan</span>;
    if (status === 'accepted') return <span style={badge('success')}><CheckCircle size={13} /> Diterima Magang</span>;
    if (status === 'rejected') return <span style={badge('danger')}>Ditolak</span>;
    return <span style={badge('neutral')}>{status || '-'}</span>;
  };

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
            <h2 style={tabTitle(isMobile)}>Daftar Pelamar</h2>
            <p style={tabSubtitle}>Review CV, pesan, dan status lamaran mahasiswa untuk lowongan mitra.</p>
          </div>

        </div>

        <div style={{ marginBottom: '22px' }}>
          <StatusSegmentedControl
            value={filterStatusPelamar}
            onChange={setFilterStatusPelamar}
            isMobile={isMobile}
            options={[
              { value: '', label: 'Semua' },
              { value: 'review', label: 'Review' },
              { value: 'diterima', label: 'Diterima' },
              { value: 'ditolak', label: 'Ditolak' },
            ]}
          />
        </div>

        <div style={tableShell}>
          <table style={{ ...styles.table, marginTop: 0 }}>
            <thead>
              <tr>
                <th style={{ ...styles.th, borderTopLeftRadius: '16px' }}>Nama Pelamar</th>
                <th style={styles.th}>Posisi & Perusahaan</th>
                <th style={styles.th}>Tanggal Apply</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, borderTopRightRadius: '16px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {applicationsFiltered.length === 0 ? (
                <tr><td colSpan="5" style={emptyState}>Belum ada pelamar yang sesuai filter.</td></tr>
              ) : (
                applicationsFiltered.map((app) => {
                  const studentId = app.student?.id || app.student;
                  const vacancyId = app.vacancy?.id || app.vacancy;
                  const student = app.student?.id ? app.student : students.find((item) => item.id === studentId);
                  const vacancy = app.vacancy?.id ? app.vacancy : vacancies.find((item) => item.id === vacancyId);
                  if (!student || !vacancy) return null;

                  return (
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
                      <td style={styles.td}>
                        <button className="btn-hover" onClick={() => setSelectedApplication({ app, student, vacancy })} style={compactButton(styles, 'primary')}>
                          <Eye size={14} /> Cek CV & Pesan
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '18px', marginTop: '18px' }}>
        <GuidancePanel
          title="Catatan Review"
          description="Checklist singkat sebelum memutuskan status pelamar."
          icon={Eye}
          items={[
            'Baca CV dan pesan pelamar sebelum mengubah status lamaran.',
            'Cocokkan program studi, minat, dan skill mahasiswa dengan persyaratan lowongan.',
            'Jika profil layak diteruskan, gunakan catatan email yang jelas untuk perusahaan mitra.',
            'Jika ditolak, pastikan alasan internalnya konsisten dan tidak bertentangan dengan data pelamar.',
          ]}
        />

        <GuidancePanel
          title="Antrian Prioritas"
          description="Lamaran pending paling lama masuk ditampilkan lebih dulu."
          icon={BriefcaseBusiness}
        >
          {priorityQueue.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>Tidak ada pelamar pending dalam filter saat ini.</div>
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
                  <button className="btn-hover" onClick={() => setSelectedApplication({ app, student, vacancy })} style={compactButton(styles, 'neutral', { padding: '8px 10px', flexShrink: 0 })}>
                    Review
                  </button>
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
