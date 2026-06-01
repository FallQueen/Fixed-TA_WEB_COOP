import { createElement, useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Hash,
  Loader2,
  MessageSquareText,
  Send,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { buildApiUrl } from '../api/config';

const SCORE_PRESETS = [70, 80, 85, 90, 95];

const getEvaluationLabel = (evalType) => (
  evalType === 'UAS' ? 'Evaluasi Akhir (UAS)' : 'Evaluasi Kemajuan (UTS)'
);

const getScoreMeta = (scoreValue) => {
  const score = Number(scoreValue);

  if (!scoreValue && scoreValue !== 0) {
    return { label: 'Belum dinilai', color: '#64748b', tint: '#f8fafc', border: '#e2e8f0' };
  }
  if (score >= 90) {
    return { label: 'Sangat Baik', color: '#047857', tint: '#ecfdf5', border: '#a7f3d0' };
  }
  if (score >= 80) {
    return { label: 'Baik', color: '#1d4ed8', tint: '#eff6ff', border: '#bfdbfe' };
  }
  if (score >= 70) {
    return { label: 'Cukup', color: '#b45309', tint: '#fffbeb', border: '#fde68a' };
  }
  return { label: 'Perlu Evaluasi', color: '#b91c1c', tint: '#fef2f2', border: '#fecaca' };
};

function StatusScreen({ icon, tone = 'info', title, message, loading = false }) {
  const tones = {
    danger: { color: '#b91c1c', tint: '#fef2f2', border: '#fecaca' },
    info: { color: '#1d4ed8', tint: '#eff6ff', border: '#bfdbfe' },
    success: { color: '#047857', tint: '#ecfdf5', border: '#a7f3d0' },
  };
  const selectedTone = tones[tone] || tones.info;

  return (
    <div style={styles.statusPage}>
      <div style={styles.statusCard}>
        <img src="/logo-prasmul.png" alt="Prasetiya Mulya" style={styles.statusLogo} />
        <div style={{ ...styles.statusIcon, color: selectedTone.color, backgroundColor: selectedTone.tint, borderColor: selectedTone.border }}>
          {loading ? <Loader2 size={26} className="supervisor-spin" /> : createElement(icon, { size: 26 })}
        </div>
        <h1 style={styles.statusTitle}>{title}</h1>
        <p style={styles.statusMessage}>{message}</p>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div style={styles.detailItem}>
      <div style={styles.detailIcon}>{createElement(icon, { size: 16 })}</div>
      <div style={{ minWidth: 0 }}>
        <span style={styles.detailLabel}>{label}</span>
        <strong style={styles.detailValue}>{value || '-'}</strong>
      </div>
    </div>
  );
}

function SupervisorForm() {
  const { id } = useParams();
  const [evalData, setEvalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ score: '', feedback: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const response = await axios.get(buildApiUrl(`/evaluations/${id}/`));
        setEvalData(response.data);
      } catch {
        setPageError('Data evaluasi tidak ditemukan. Pastikan tautan yang dibuka sesuai dengan email resmi dari Unit Co-op.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    const numericScore = Number(formData.score);
    if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) {
      setSubmitError('Nilai kinerja wajib berada pada rentang 0 sampai 100.');
      return;
    }

    setSubmitting(true);

    try {
      await axios.patch(buildApiUrl(`/evaluations/${id}/`), {
        is_filled: true,
        score: numericScore,
        feedback: formData.feedback.trim(),
      });
      setSubmitted(true);
    } catch {
      setSubmitError('Penilaian belum berhasil dikirim. Silakan periksa koneksi dan coba kembali.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <StatusScreen
        icon={ClipboardCheck}
        loading
        title="Memuat Form Evaluasi"
        message="Mohon tunggu sebentar. Sistem sedang menyiapkan data penilaian mahasiswa."
      />
    );
  }

  if (pageError || !evalData) {
    return (
      <StatusScreen
        icon={AlertCircle}
        tone="danger"
        title="Tautan Tidak Valid"
        message={pageError || 'Data evaluasi tidak ditemukan.'}
      />
    );
  }

  if (submitted || evalData.is_filled) {
    return (
      <StatusScreen
        icon={CheckCircle2}
        tone="success"
        title={submitted ? 'Penilaian Berhasil Dikirim' : 'Evaluasi Sudah Diisi'}
        message={submitted
          ? 'Terima kasih. Penilaian Anda telah tersimpan dan diteruskan kepada Unit Co-op Prasetiya Mulya.'
          : 'Form evaluasi ini sudah pernah dikirim sebelumnya. Tidak ada tindakan tambahan yang perlu dilakukan.'}
      />
    );
  }

  const placement = evalData.placement;
  const student = placement?.student || {};
  const studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Mahasiswa Co-op';
  const scoreMeta = getScoreMeta(formData.score);

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @keyframes supervisor-spin { to { transform: rotate(360deg); } }
        .supervisor-spin { animation: supervisor-spin 0.9s linear infinite; }
        .supervisor-input:focus {
          border-color: #003366 !important;
          box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.12) !important;
        }
        .supervisor-button:hover:not(:disabled) { background-color: #00264d !important; }
        .supervisor-preset:hover { border-color: #93c5fd !important; background-color: #eff6ff !important; }
        @media (max-width: 760px) {
          .supervisor-shell { grid-template-columns: 1fr !important; }
          .supervisor-summary { border-right: none !important; border-bottom: 1px solid #e2e8f0 !important; }
          .supervisor-form-body { padding: 22px 18px !important; }
          .supervisor-header { padding: 18px !important; }
          .supervisor-header-meta { align-items: flex-start !important; }
        }
      `}</style>

      <main style={styles.mainContent}>
        <header className="supervisor-header" style={styles.topHeader}>
          <div style={styles.brandBlock}>
            <img src="/logo-prasmul.png" alt="Prasetiya Mulya" style={styles.logo} />
            <div>
              <p style={styles.brandEyebrow}>Unit Co-op Prasetiya Mulya</p>
              <h1 style={styles.title}>Form Evaluasi Mahasiswa</h1>
            </div>
          </div>
          <div className="supervisor-header-meta" style={styles.headerMeta}>
            <span style={styles.secureBadge}><ShieldCheck size={14} /> Form Resmi</span>
            <span style={styles.periodBadge}>{getEvaluationLabel(evalData.eval_type)}</span>
          </div>
        </header>

        <div className="supervisor-shell" style={styles.contentGrid}>
          <aside className="supervisor-summary" style={styles.summaryPanel}>
            <div>
              <span style={styles.sectionEyebrow}>Data Mahasiswa</span>
              <h2 style={styles.studentName}>{studentName}</h2>
              <p style={styles.studentSubtext}>Peserta Program Co-op</p>
            </div>

            <div style={styles.detailsList}>
              <DetailItem icon={Hash} label="NIM" value={student.nim} />
              <DetailItem icon={GraduationCap} label="Program Studi" value={student.program_studi} />
              <DetailItem icon={Building2} label="Perusahaan" value={placement.company_name} />
              <DetailItem icon={BriefcaseBusiness} label="Posisi Magang" value={placement.position} />
              <DetailItem
                icon={CalendarDays}
                label="Periode Magang"
                value={`${placement.start_date || '-'} s/d ${placement.end_date || '-'}`}
              />
            </div>

            <div style={styles.summaryNote}>
              <ClipboardCheck size={17} style={{ flexShrink: 0 }} />
              <p style={{ margin: 0 }}>Berikan penilaian berdasarkan kinerja mahasiswa selama periode evaluasi berjalan.</p>
            </div>
          </aside>

          <section className="supervisor-form-body" style={styles.formPanel}>
            <div style={styles.formIntro}>
              <span style={styles.sectionEyebrow}>Penilaian Kinerja</span>
              <h2 style={styles.formTitle}>Masukkan hasil evaluasi</h2>
              <p style={styles.formSubtitle}>Nilai akan menjadi bagian dari rekap akademik mahasiswa.</p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <div style={styles.labelRow}>
                  <label htmlFor="supervisor-score" style={styles.label}>Nilai Kinerja</label>
                  <span style={styles.requiredLabel}>Wajib diisi</span>
                </div>
                <div style={styles.scoreRow}>
                  <div style={styles.scoreInputShell}>
                    <input
                      id="supervisor-score"
                      type="number"
                      min="0"
                      max="100"
                      inputMode="numeric"
                      value={formData.score}
                      onChange={(event) => setFormData({ ...formData, score: event.target.value })}
                      required
                      className="supervisor-input"
                      style={styles.scoreInput}
                      placeholder="85"
                    />
                    <span style={styles.scoreSuffix}>/ 100</span>
                  </div>
                  <div style={{ ...styles.scoreIndicator, color: scoreMeta.color, backgroundColor: scoreMeta.tint, borderColor: scoreMeta.border }}>
                    {scoreMeta.label}
                  </div>
                </div>
                <div style={styles.presetRow}>
                  {SCORE_PRESETS.map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setFormData({ ...formData, score: String(score) })}
                      className="supervisor-preset"
                      style={{
                        ...styles.presetButton,
                        borderColor: String(score) === String(formData.score) ? '#003366' : '#e2e8f0',
                        backgroundColor: String(score) === String(formData.score) ? '#e6f0fa' : '#ffffff',
                        color: String(score) === String(formData.score) ? '#003366' : '#64748b',
                      }}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.labelRow}>
                  <label htmlFor="supervisor-feedback" style={styles.label}>Komentar atau Feedback</label>
                  <span style={styles.optionalLabel}>Opsional</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <MessageSquareText size={17} style={styles.textareaIcon} />
                  <textarea
                    id="supervisor-feedback"
                    rows="6"
                    maxLength="1000"
                    value={formData.feedback}
                    onChange={(event) => setFormData({ ...formData, feedback: event.target.value })}
                    className="supervisor-input"
                    style={styles.textarea}
                    placeholder="Tuliskan apresiasi, catatan perkembangan, atau area yang masih perlu ditingkatkan."
                  />
                </div>
                <span style={styles.characterCount}>{formData.feedback.length}/1000 karakter</span>
              </div>

              {submitError && (
                <div style={styles.errorBox}>
                  <AlertCircle size={17} style={{ flexShrink: 0 }} />
                  <span>{submitError}</span>
                </div>
              )}

              <button type="submit" disabled={submitting} className="supervisor-button" style={{ ...styles.submitButton, opacity: submitting ? 0.72 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                {submitting ? <Loader2 size={18} className="supervisor-spin" /> : <Send size={18} />}
                {submitting ? 'Mengirim Penilaian...' : 'Kirim Penilaian'}
              </button>
            </form>
          </section>
        </div>

        <footer style={styles.footer}>
          Tautan ini bersifat pribadi. Mohon tidak meneruskannya kepada pihak lain.
        </footer>
      </main>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#f3f6fa',
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    padding: '28px 18px',
    boxSizing: 'border-box',
    color: '#0f172a',
  },
  mainContent: {
    width: '100%',
    maxWidth: '980px',
    margin: '0 auto',
  },
  topHeader: {
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px 10px 0 0',
    borderTop: '4px solid #b31312',
  },
  brandBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  logo: {
    width: '48px',
    height: '48px',
    objectFit: 'contain',
  },
  brandEyebrow: {
    margin: 0,
    color: '#b31312',
    fontSize: '11px',
    lineHeight: 1.3,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    margin: '4px 0 0',
    color: '#0f172a',
    fontSize: '21px',
    lineHeight: 1.25,
    fontWeight: '800',
  },
  headerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  secureBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '7px 9px',
    borderRadius: '999px',
    color: '#047857',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    fontSize: '10px',
    fontWeight: '800',
  },
  periodBadge: {
    display: 'inline-flex',
    padding: '7px 9px',
    borderRadius: '999px',
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    fontSize: '10px',
    fontWeight: '800',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '320px minmax(0, 1fr)',
    backgroundColor: '#ffffff',
    borderLeft: '1px solid #e2e8f0',
    borderRight: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0',
    borderRadius: '0 0 10px 10px',
    overflow: 'hidden',
    boxShadow: '0 18px 42px rgba(15, 23, 42, 0.08)',
  },
  summaryPanel: {
    padding: '28px 24px',
    backgroundColor: '#fbfdff',
    borderRight: '1px solid #e2e8f0',
  },
  sectionEyebrow: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '10px',
    lineHeight: 1.3,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  studentName: {
    margin: '7px 0 0',
    color: '#0f172a',
    fontSize: '20px',
    lineHeight: 1.35,
    fontWeight: '800',
  },
  studentSubtext: {
    margin: '4px 0 0',
    color: '#64748b',
    fontSize: '12px',
  },
  detailsList: {
    display: 'grid',
    gap: '15px',
    marginTop: '26px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  detailIcon: {
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: '8px',
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
  },
  detailLabel: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '10px',
    lineHeight: 1.4,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailValue: {
    display: 'block',
    marginTop: '3px',
    color: '#334155',
    fontSize: '12px',
    lineHeight: 1.5,
    fontWeight: '700',
    overflowWrap: 'anywhere',
  },
  summaryNote: {
    display: 'flex',
    gap: '9px',
    marginTop: '27px',
    padding: '12px',
    color: '#92400e',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    fontSize: '11px',
    lineHeight: 1.6,
    fontWeight: '600',
  },
  formPanel: {
    padding: '30px',
  },
  formIntro: {
    paddingBottom: '20px',
    borderBottom: '1px solid #e2e8f0',
  },
  formTitle: {
    margin: '7px 0 0',
    color: '#0f172a',
    fontSize: '20px',
    lineHeight: 1.35,
    fontWeight: '800',
  },
  formSubtitle: {
    margin: '5px 0 0',
    color: '#64748b',
    fontSize: '12px',
    lineHeight: 1.6,
  },
  form: {
    display: 'grid',
    gap: '24px',
    marginTop: '22px',
  },
  inputGroup: {
    display: 'grid',
    gap: '9px',
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  label: {
    color: '#334155',
    fontSize: '13px',
    lineHeight: 1.4,
    fontWeight: '800',
  },
  requiredLabel: {
    color: '#b91c1c',
    fontSize: '10px',
    fontWeight: '800',
  },
  optionalLabel: {
    color: '#94a3b8',
    fontSize: '10px',
    fontWeight: '800',
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '9px',
    flexWrap: 'wrap',
  },
  scoreInputShell: {
    display: 'flex',
    alignItems: 'center',
    minWidth: '180px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  scoreInput: {
    width: '96px',
    padding: '12px 13px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    border: 'none',
    outline: 'none',
    fontSize: '22px',
    lineHeight: 1,
    fontWeight: '800',
    boxSizing: 'border-box',
  },
  scoreSuffix: {
    paddingRight: '12px',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: '700',
  },
  scoreIndicator: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 13px',
    border: '1px solid',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '800',
  },
  presetRow: {
    display: 'flex',
    gap: '7px',
    flexWrap: 'wrap',
  },
  presetButton: {
    minWidth: '44px',
    padding: '8px 10px',
    border: '1px solid',
    borderRadius: '7px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '12px',
    fontWeight: '800',
    transition: 'all 0.18s ease',
  },
  textareaIcon: {
    position: 'absolute',
    top: '13px',
    left: '13px',
    color: '#94a3b8',
    pointerEvents: 'none',
  },
  textarea: {
    width: '100%',
    padding: '12px 13px 12px 40px',
    color: '#334155',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    fontSize: '13px',
    lineHeight: 1.65,
  },
  characterCount: {
    color: '#94a3b8',
    fontSize: '10px',
    fontWeight: '700',
    textAlign: 'right',
  },
  errorBox: {
    display: 'flex',
    gap: '8px',
    padding: '11px 12px',
    color: '#b91c1c',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '12px',
    lineHeight: 1.55,
    fontWeight: '700',
  },
  submitButton: {
    width: '100%',
    minHeight: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: '#ffffff',
    backgroundColor: '#003366',
    border: 'none',
    borderRadius: '8px',
    fontFamily: 'inherit',
    fontSize: '14px',
    fontWeight: '800',
    transition: 'background-color 0.18s ease',
  },
  footer: {
    padding: '16px 10px 0',
    color: '#94a3b8',
    fontSize: '11px',
    lineHeight: 1.5,
    textAlign: 'center',
  },
  statusPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    backgroundColor: '#f3f6fa',
    fontFamily: '"Inter", "Segoe UI", sans-serif',
  },
  statusCard: {
    width: '100%',
    maxWidth: '440px',
    padding: '34px 28px',
    boxSizing: 'border-box',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    boxShadow: '0 18px 42px rgba(15, 23, 42, 0.08)',
    textAlign: 'center',
  },
  statusLogo: {
    width: '54px',
    height: '54px',
    objectFit: 'contain',
    marginBottom: '19px',
  },
  statusIcon: {
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    border: '1px solid',
    borderRadius: '50%',
  },
  statusTitle: {
    margin: '18px 0 0',
    color: '#0f172a',
    fontSize: '20px',
    lineHeight: 1.35,
    fontWeight: '800',
  },
  statusMessage: {
    margin: '8px 0 0',
    color: '#64748b',
    fontSize: '13px',
    lineHeight: 1.7,
  },
};

export default SupervisorForm;
