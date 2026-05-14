import { Briefcase, CheckCircle, Download, GraduationCap, Mail, NotebookTabs } from 'lucide-react';
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

function EvaluasiTab({
  styles,
  isMobile,
  filterStatusEvaluasi,
  setFilterStatusEvaluasi,
  openEmailModal,
  handleExportEvaluations,
  evaluasiFiltered,
  students,
  evaluations,
}) {
  const completeCount = evaluasiFiltered.filter((placement) => {
    const evalUTS = evaluations.find((evaluation) => (evaluation.placement?.id || evaluation.placement) === placement.id && evaluation.eval_type === 'UTS');
    const evalUAS = evaluations.find((evaluation) => (evaluation.placement?.id || evaluation.placement) === placement.id && evaluation.eval_type === 'UAS');
    return evalUTS?.is_filled && evalUAS?.is_filled;
  }).length;
  const waitingCount = evaluasiFiltered.length - completeCount;

  const metrics = [
    { icon: NotebookTabs, label: 'Total Evaluasi', value: evaluasiFiltered.length, tint: '#eef2ff', color: '#4f46e5' },
    { icon: CheckCircle, label: 'Lengkap Dinilai', value: completeCount, tint: '#ecfdf5', color: '#10b981' },
    { icon: Mail, label: 'Perlu Reminder', value: waitingCount, tint: '#fff7ed', color: '#f97316' },
  ];
  const {
    page,
    pageSize,
    pagedItems: pagedEvaluasi,
    setPage,
    totalItems,
    totalPages,
  } = usePagedData(evaluasiFiltered);

  const renderEvalBlock = ({ type, evaluation, placement, student }) => (
    <div style={{ minWidth: '250px', border: '1px solid #edf2f7', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '10px 12px', backgroundColor: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Briefcase size={14} color="#64748b" />
          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase' }}>Nilai Supervisor</span>
        </div>
        {!evaluation ? (
          <button className="btn-hover" onClick={() => openEmailModal(`send_eval_${type.toLowerCase()}`, null, placement.supervisor_name, placement.id)} style={compactButton(styles, 'primary', { padding: '7px 10px', fontSize: '10px' })}>
            Kirim Form
          </button>
        ) : evaluation.is_filled ? (
          <span style={badge('success')}><CheckCircle size={12} /> {evaluation.score}</span>
        ) : (
          <span style={badge('warning')}>Menunggu</span>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <GraduationCap size={14} color="#64748b" />
          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase' }}>Laporan Mahasiswa</span>
        </div>
        <button className="btn-hover" onClick={() => openEmailModal(`student_report_${type.toLowerCase()}`, student.id, student.first_name)} style={compactButton(styles, 'neutral', { padding: '7px 10px', fontSize: '10px' })}>
          <Mail size={12} /> Ingatkan
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={metricGrid(isMobile, 3)}>
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
            <h2 style={tabTitle(isMobile)}>Evaluasi Supervisor</h2>
            <p style={tabSubtitle}>Kelola form penilaian UTS/UAS dan reminder laporan mahasiswa dalam satu tabel.</p>
          </div>

          <div style={toolbar(isMobile)}>
            <button className="btn-hover" onClick={() => openEmailModal('mass_report_uts')} style={compactButton(styles, 'warning', { height: '42px', width: isMobile ? '100%' : 'auto' })}>
              <Mail size={15} /> Reminder UTS
            </button>
            <button className="btn-hover" onClick={() => openEmailModal('mass_report_uas')} style={compactButton(styles, 'danger', { height: '42px', width: isMobile ? '100%' : 'auto' })}>
              <Mail size={15} /> Reminder UAS
            </button>
            <button className="btn-hover" onClick={handleExportEvaluations} style={compactButton(styles, 'green', { height: '42px', width: isMobile ? '100%' : 'auto' })}>
              <Download size={15} /> Export Excel
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '22px' }}>
          <StatusSegmentedControl
            value={filterStatusEvaluasi}
            onChange={setFilterStatusEvaluasi}
            isMobile={isMobile}
            options={[
              { value: '', label: 'Semua' },
              { value: 'menunggu', label: 'Menunggu' },
              { value: 'selesai', label: 'Selesai' },
            ]}
          />
        </div>

        <div style={tableShell}>
          <table style={{ ...styles.table, marginTop: 0 }}>
            <thead>
              <tr>
                <th style={{ ...styles.th, borderTopLeftRadius: '16px' }}>Mahasiswa</th>
                <th style={styles.th}>Perusahaan</th>
                <th style={styles.th}>Progress UTS</th>
                <th style={{ ...styles.th, borderTopRightRadius: '16px' }}>Progress UAS</th>
              </tr>
            </thead>
            <tbody>
              {pagedEvaluasi.map((placement) => {
                const student = students.find((item) => item.id === placement.student);
                if (!student) return null;
                const evalUTS = evaluations.find((evaluation) => (evaluation.placement?.id || evaluation.placement) === placement.id && evaluation.eval_type === 'UTS');
                const evalUAS = evaluations.find((evaluation) => (evaluation.placement?.id || evaluation.placement) === placement.id && evaluation.eval_type === 'UAS');

                return (
                  <tr key={placement.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong style={{ color: '#111827', fontSize: '13px', textTransform: 'capitalize' }}>{student.first_name} {student.last_name}</strong><br />
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>{student.program_studi}</span>
                    </td>
                    <td style={styles.td}>{placement.company_name}</td>
                    <td style={styles.td}>{renderEvalBlock({ type: 'UTS', evaluation: evalUTS, placement, student })}</td>
                    <td style={styles.td}>{renderEvalBlock({ type: 'UAS', evaluation: evalUAS, placement, student })}</td>
                  </tr>
                );
              })}
              {evaluasiFiltered.length === 0 && (
                <tr><td colSpan="4" style={emptyState}>Tidak ada mahasiswa yang sesuai filter.</td></tr>
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
          itemLabel="evaluasi"
        />
      </div>

      <div style={{ marginTop: '18px' }}>
        <GuidancePanel
          title="Panduan Evaluasi"
          description="Gunakan panduan ini untuk menutup siklus penilaian UTS dan UAS dengan rapi."
          icon={NotebookTabs}
          items={[
            'Kirim form supervisor jika nilai belum pernah dibuat untuk periode UTS atau UAS.',
            'Status Menunggu berarti form sudah ada tetapi supervisor belum mengisi nilai.',
            'Gunakan reminder laporan mahasiswa jika dokumen UTS/UAS belum masuk.',
            'Export Excel setelah data lengkap agar rekap nilai siap dipakai untuk dokumentasi akademik.',
          ]}
        />
      </div>
    </div>
  );
}

export default EvaluasiTab;
