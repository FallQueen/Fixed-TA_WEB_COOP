import { Briefcase, Check, CheckCircle, Download, GraduationCap, Mail, NotebookTabs, RefreshCw, X } from 'lucide-react';
import {
  actionButtonGroup,
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
import usePagedData from './usePagedData';
import PlacementCompanyCell from './PlacementCompanyCell';
import {
  getEvaluationPairForPlacement,
  getPlacementId,
  isPlacementEvaluationComplete,
  isSameStudent,
} from '../helpers';

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
  utsReports = [],
  finalReports = [],
  handleApproveSupervisorChange,
  handleRejectSupervisorChange,
}) {
  const completeCount = evaluasiFiltered.filter((placement) => isPlacementEvaluationComplete(evaluations, placement)).length;
  const waitingCount = evaluasiFiltered.length - completeCount;
  const supervisorChangeCount = evaluasiFiltered.filter((placement) => placement.supervisor_change_status === 'pending').length;
  const evaluationProgressPercent = evaluasiFiltered.length > 0
    ? Math.round((completeCount / evaluasiFiltered.length) * 100)
    : 100;

  const metrics = [
    { icon: NotebookTabs, label: 'Total Evaluasi', value: evaluasiFiltered.length, ...metricTone('info') },
    { icon: CheckCircle, label: 'Lengkap Dinilai', value: completeCount, ...metricTone('success') },
    { icon: Mail, label: 'Perlu Reminder', value: waitingCount, ...metricTone('warning') },
    { icon: RefreshCw, label: 'Perubahan Supervisor', value: supervisorChangeCount, ...metricTone(supervisorChangeCount > 0 ? 'danger' : 'neutral') },
  ];
  const {
    page,
    pageSize,
    pagedItems: pagedEvaluasi,
    setPage,
    totalItems,
    totalPages,
  } = usePagedData(evaluasiFiltered);

  const hasStudentReport = (placement, type) => {
    const records = type === 'UTS' ? utsReports : finalReports;
    const placementIds = [placement.id, ...(placement.historyPlacements || []).map((item) => item.id)].map(String);

    return records.some((report) => placementIds.includes(String(getPlacementId(report))));
  };

  const renderEvalBlock = ({ type, evaluation, placement, student }) => {
    const studentReportComplete = hasStudentReport(placement, type);

    return (
      <div style={{ minWidth: '250px', border: '1px solid #edf2f7', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '10px 12px', backgroundColor: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Briefcase size={14} color="#64748b" />
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase' }}>Nilai Supervisor</span>
          </div>
          {!evaluation ? (
            <div style={actionButtonGroup(isMobile, { padding: '3px' })}>
              <button
                className="btn-hover"
                onClick={() => openEmailModal(
                  `send_eval_${type.toLowerCase()}`,
                  null,
                  placement.supervisor_name || 'Supervisor',
                  placement.id,
                  placement.supervisor_email || ''
                )}
                style={actionIconButton('primary', false, { width: '30px', height: '30px' })}
                title={`Preview email form evaluasi ${type}`}
                aria-label={`Preview email form evaluasi ${type} ke supervisor`}
              >
                <Mail size={14} />
              </button>
            </div>
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
          {studentReportComplete ? (
            <span style={badge('success')}><CheckCircle size={12} /> Lengkap</span>
          ) : (
            <div style={actionButtonGroup(isMobile, { padding: '3px' })}>
              <button
                className="btn-hover"
                onClick={() => openEmailModal(`student_report_${type.toLowerCase()}`, student.id, student.first_name)}
                style={actionIconButton('neutral', false, { width: '30px', height: '30px' })}
                title={`Ingatkan laporan ${type}`}
                aria-label={`Kirim reminder laporan ${type} ke ${student.first_name || student.email || 'mahasiswa'}`}
              >
                <Mail size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSupervisorContact = (placement) => {
    const hasPendingChange = placement.supervisor_change_status === 'pending';

    return (
      <div style={{ minWidth: '235px' }}>
        <strong style={{ display: 'block', color: '#111827', fontSize: '12px', lineHeight: 1.45 }}>{placement.supervisor_name || '-'}</strong>
        <span style={{ display: 'block', marginTop: '3px', color: '#64748b', fontSize: '11px', overflowWrap: 'anywhere' }}>{placement.supervisor_email || '-'}</span>
        {hasPendingChange && (
          <div style={{ marginTop: '9px', padding: '9px', borderRadius: '8px', border: '1px solid #fde68a', backgroundColor: '#fffbeb' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#b45309', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}><RefreshCw size={12} /> Menunggu Review</span>
            <strong style={{ display: 'block', marginTop: '6px', color: '#78350f', fontSize: '11px', lineHeight: 1.4 }}>{placement.pending_supervisor_name}</strong>
            <span style={{ display: 'block', marginTop: '2px', color: '#92400e', fontSize: '10px', overflowWrap: 'anywhere' }}>{placement.pending_supervisor_email}</span>
            <p style={{ margin: '6px 0 0', color: '#92400e', fontSize: '10px', lineHeight: 1.5 }}>{placement.supervisor_change_reason}</p>
            <div style={{ ...actionButtonGroup(isMobile, { padding: '3px', marginTop: '7px', backgroundColor: '#ffffff' }) }}>
              <button type="button" onClick={() => handleApproveSupervisorChange(placement)} title="Setujui perubahan supervisor" aria-label="Setujui perubahan supervisor" className="btn-hover" style={actionIconButton('success', false, { width: '29px', height: '29px' })}><Check size={14} /></button>
              <button type="button" onClick={() => handleRejectSupervisorChange(placement)} title="Tolak perubahan supervisor" aria-label="Tolak perubahan supervisor" className="btn-hover" style={actionIconButton('danger', false, { width: '29px', height: '29px' })}><X size={14} /></button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={metricGrid(isMobile, 4)}>
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

        <ProgressStatusPanel
          isMobile={isMobile}
          icon={NotebookTabs}
          label="Progress Evaluasi"
          title={waitingCount > 0 ? `${waitingCount} evaluasi masih perlu dituntaskan` : 'Semua evaluasi pada filter ini sudah lengkap'}
          description="Progress dihitung dari mahasiswa yang nilai supervisor UTS dan UAS-nya sudah terisi lengkap."
          percent={evaluationProgressPercent}
          tone={waitingCount > 0 ? 'warning' : 'success'}
          meta={`${completeCount}/${evaluasiFiltered.length} lengkap dinilai`}
          percentLabel="lengkap"
        />

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
                <th style={styles.th}>Kontak Supervisor</th>
                <th style={styles.th}>Progress UTS</th>
                <th style={{ ...styles.th, borderTopRightRadius: '16px' }}>Progress UAS</th>
              </tr>
            </thead>
            <tbody>
              {pagedEvaluasi.map((placement) => {
                const student = students.find((item) => isSameStudent(placement.student, item.id));
                if (!student) return null;
                const { evalUTS, evalUAS } = getEvaluationPairForPlacement(evaluations, placement);

                return (
                  <tr key={placement.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong style={{ color: '#111827', fontSize: '13px', textTransform: 'capitalize' }}>{student.first_name} {student.last_name}</strong><br />
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>{student.program_studi}</span>
                    </td>
                    <td style={styles.td}><PlacementCompanyCell placement={placement} /></td>
                    <td style={styles.td}>{renderSupervisorContact(placement)}</td>
                    <td style={styles.td}>{renderEvalBlock({ type: 'UTS', evaluation: evalUTS, placement, student })}</td>
                    <td style={styles.td}>{renderEvalBlock({ type: 'UAS', evaluation: evalUAS, placement, student })}</td>
                  </tr>
                );
              })}
              {evaluasiFiltered.length === 0 && (
                <tr><td colSpan="5" style={emptyState}>Tidak ada mahasiswa yang sesuai filter.</td></tr>
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
            'Review perubahan kontak supervisor sebelum mengirim form evaluasi berikutnya.',
            'Export Excel setelah data lengkap agar rekap nilai siap dipakai untuk dokumentasi akademik.',
          ]}
        />
      </div>
    </div>
  );
}

export default EvaluasiTab;
