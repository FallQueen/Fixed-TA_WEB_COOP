import { useState } from 'react';
import { Activity, Building2, CheckCircle, ChevronDown, Download, Edit2, Eye, FileText, History, Key, Link2, Mail, Send, Trash2, UserRound, Users, X } from 'lucide-react';
import { stemRed } from '../../styles/adminstyles';
import { MIN_INTERNSHIP_WORKING_DAYS, calculateWorkingDays } from '../constants';
import { CERTIFICATE_GRADE_OPTIONS } from './constants';
import { getPlacementHistoryForStudent } from './helpers';

const reportSections = [
  { key: 'company_profile', label: 'Profil Perusahaan' },
  { key: 'job_description', label: 'Highlight Pekerjaan' },
  { key: 'work_environment', label: 'Lingkungan & Budaya Kerja' },
  { key: 'useful_courses', label: 'Materi Kuliah yang Berguna' },
  { key: 'new_skills', label: 'Skill Baru yang Dipelajari' },
];

const renderMonthlyReportDetails = (report) => {
  const availableSections = reportSections.filter((section) => report[section.key]);

  if (availableSections.length === 0) {
    return (
      <p style={{ margin: '12px 0 0 0', color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>
        Isi laporan tidak tersedia.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
      {availableSections.map((section) => (
        <div key={section.key} style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#003366', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            {section.label}
          </span>
          <p style={{ margin: 0, fontSize: '13px', color: '#475569', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
            {report[section.key]}
          </p>
        </div>
      ))}
    </div>
  );
};

const getDocumentName = (url) => {
  if (!url) return '';
  const segments = String(url).split('/');
  return segments[segments.length - 1];
};

function DashboardModals({
  styles,
  isMobile,
  uniqueProdis,
  editingStudent,
  setEditingStudent,
  handleEditStudentSubmit,
  handleForceResetPassword,
  selectedApplication,
  setSelectedApplication,
  handleUpdateAppStatus,
  handleArchiveApplication,
  placementToApprove,
  setPlacementToApprove,
  confirmApprovePlacement,
  selectedStudentReports,
  setSelectedStudentReports,
  selectedDetail,
  setSelectedDetail,
  gradeInput,
  setGradeInput,
  handleIssueCertificate,
  emailModal,
  setEmailModal,
  handleSendCustomEmail,
  sendingEmail,
  // [TAMBAHAN BARU]: Kita butuh array placements untuk melihat histori
  placements, 
}) {
  const [adminPreviewDoc, setAdminPreviewDoc] = useState(null);
  
  // [TAMBAHAN BARU]: Logika memisahkan histori magang
  let historyPlacements = [];
  if (placementToApprove && placements) {
    historyPlacements = getPlacementHistoryForStudent(
      placements,
      placementToApprove.student.id,
      placementToApprove.placement.id
    );
  }
  const selectedDetailMissingFields = selectedDetail?.certificateMissingFields || [];
  const selectedMonthlySummary = selectedDetail?.monthlyReportSummary;
  const canIssueSelectedCertificate = selectedDetail && selectedDetailMissingFields.length === 0;
  const isSupervisorEvaluationEmail = emailModal.actionType.includes('send_eval');
  const getSelectedSourceText = (sourcePlacement) => {
    if (!selectedDetail || !sourcePlacement || String(sourcePlacement.id) === String(selectedDetail.placement.id)) {
      return '';
    }

    return `Dari histori ${sourcePlacement.company_name}`;
  };
  const utsSourceText = getSelectedSourceText(selectedDetail?.mhsUtsPlacement);
  const finalSourceText = getSelectedSourceText(selectedDetail?.mhsFinalPlacement);
  const evalUtsSourceText = getSelectedSourceText(selectedDetail?.evalUTSPlacement);
  const evalUasSourceText = getSelectedSourceText(selectedDetail?.evalUASPlacement);
  const placementApprovalWorkingDays = placementToApprove
    ? calculateWorkingDays(placementToApprove.placement.start_date, placementToApprove.placement.end_date)
    : 0;
  const transferSourcePlacement = placementToApprove?.placement?.previous_placement_end_date
    ? historyPlacements.find((placement) => placement.status === 'verified' && placement.is_approved)
    : null;
  const previousPlacementWorkingDays = transferSourcePlacement
    ? calculateWorkingDays(
      transferSourcePlacement.start_date,
      placementToApprove.placement.previous_placement_end_date
    )
    : 0;
  const placementApprovalTotalWorkingDays = transferSourcePlacement
    ? previousPlacementWorkingDays + placementApprovalWorkingDays
    : placementApprovalWorkingDays;
  const canApprovePlacement = !placementToApprove
    || placementApprovalTotalWorkingDays >= MIN_INTERNSHIP_WORKING_DAYS;
  const renderDocumentActions = (url, {
    previewLabel = 'Preview',
    downloadLabel = 'Unduh',
    accent = stemRed,
  } = {}) => {
    if (!url) return null;

    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: isMobile ? 'stretch' : 'flex-end', width: isMobile ? '100%' : 'auto' }}>
        <button
          type="button"
          className="btn-hover"
          onClick={() => setAdminPreviewDoc({ url, name: getDocumentName(url) || 'Dokumen mahasiswa' })}
          style={{ ...styles.linkDoc, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#334155', width: isMobile ? '100%' : 'auto' }}
        >
          <Eye size={12} /> {previewLabel}
        </button>
        <a
          className="btn-hover"
          href={url}
          target="_blank"
          rel="noreferrer"
          download
          style={{ ...styles.linkDoc, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: accent, borderColor: accent, color: '#ffffff', textDecoration: 'none', width: isMobile ? '100%' : 'auto' }}
        >
          <Download size={12} /> {downloadLabel}
        </a>
      </div>
    );
  };

  return (
    <>
      {adminPreviewDoc && (
        <div style={{ ...styles.modalOverlay, zIndex: 1200 }}>
          <div style={{ ...styles.modalContent, maxWidth: '980px', width: isMobile ? '94vw' : '86vw', height: isMobile ? '86vh' : '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={styles.modalHeader}>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ margin: 0, color: stemRed, fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye size={19} /> Preview Dokumen
                </h2>
                <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '12px', fontWeight: '700', overflowWrap: 'anywhere' }}>
                  {adminPreviewDoc.name}
                </p>
              </div>
              <button type="button" onClick={() => setAdminPreviewDoc(null)} style={styles.closeBtn} aria-label="Tutup preview dokumen">
                <X size={22} />
              </button>
            </div>
            <div style={{ flex: 1, minHeight: 0, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
              <iframe src={adminPreviewDoc.url} title="Preview dokumen mahasiswa" style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#ffffff' }} />
            </div>
            <div style={{ ...styles.modalFooter, justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '12px', lineHeight: 1.5, maxWidth: '560px' }}>
                Jika dokumen Word tidak tampil di preview browser, gunakan tombol Unduh.
              </p>
              <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
                <button type="button" className="btn-hover" onClick={() => setAdminPreviewDoc(null)} style={{ ...styles.btnPrimary, backgroundColor: '#94a3b8', width: isMobile ? '100%' : 'auto' }}>Tutup</button>
                <a className="btn-hover" href={adminPreviewDoc.url} target="_blank" rel="noreferrer" download style={{ ...styles.btnPrimary, backgroundColor: stemRed, textDecoration: 'none', width: isMobile ? '100%' : 'auto' }}>
                  <Download size={15} /> Unduh Dokumen
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ... MODAL EDIT STUDENT TETAP SAMA ... */}
      {editingStudent && (
        <div style={styles.modalOverlay}>
           {/* ... (Kode existing editingStudent tidak diubah) ... */}
           <div style={{ ...styles.modalContent, maxWidth: '500px' }}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: stemRed, fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={20} /> Edit Data Mahasiswa
              </h2>
              <button onClick={() => setEditingStudent(null)} style={styles.closeBtn}>✖</button>
            </div>

            <form onSubmit={handleEditStudentSubmit}>
              <div style={{ padding: '25px', overflowY: 'auto', maxHeight: '70vh' }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={styles.labelStyle}>Nama Depan</label>
                  <input type="text" required value={editingStudent.first_name} onChange={(e) => setEditingStudent({ ...editingStudent, first_name: e.target.value })} className="input-focus" style={styles.modernInput} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={styles.labelStyle}>Nama Belakang</label>
                  <input type="text" required value={editingStudent.last_name} onChange={(e) => setEditingStudent({ ...editingStudent, last_name: e.target.value })} className="input-focus" style={styles.modernInput} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={styles.labelStyle}>Nomor Induk Mahasiswa (NIM)</label>
                  <input type="text" required value={editingStudent.nim} onChange={(e) => setEditingStudent({ ...editingStudent, nim: e.target.value })} className="input-focus" style={styles.modernInput} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={styles.labelStyle}>Email Kampus</label>
                  <input type="email" required value={editingStudent.email} onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })} className="input-focus" style={styles.modernInput} />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={styles.labelStyle}>Program Studi</label>
                  <select required value={editingStudent.program_studi} onChange={(e) => setEditingStudent({ ...editingStudent, program_studi: e.target.value })} className="input-focus" style={styles.modernInput}>
                    {uniqueProdis.map((program) => <option key={program} value={program}>{program}</option>)}
                  </select>
                </div>

                <div style={{ padding: '15px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h5 style={{ margin: '0 0 4px 0', color: stemRed, fontSize: '13px' }}>Keamanan Akun</h5>
                    <p style={{ margin: 0, fontSize: '12px', color: '#991b1b' }}>Mahasiswa lupa password login?</p>
                  </div>
                  <button type="button" onClick={() => handleForceResetPassword(editingStudent)} className="btn-hover" style={{ backgroundColor: 'white', color: stemRed, border: `1px solid ${stemRed}`, padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Key size={14} /> Kirim Link Reset
                  </button>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" className="btn-hover" onClick={() => setEditingStudent(null)} style={{ ...styles.btnPrimary, backgroundColor: '#94a3b8', width: isMobile ? '100%' : 'auto' }}>Batal</button>
                <button type="submit" className="btn-hover" style={{ ...styles.btnPrimary, width: isMobile ? '100%' : 'auto' }}>Simpan Perubahan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ... MODAL SELECTED APPLICATION TETAP SAMA ... */}
      {selectedApplication && (
        <div style={styles.modalOverlay}>
           {/* ... (Kode existing selectedApplication tidak diubah) ... */}
           <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: stemRed, fontSize: '20px', fontWeight: '700' }}>Detail Lamaran Mahasiswa</h2>
              <button onClick={() => setSelectedApplication(null)} style={styles.closeBtn}>✖</button>
            </div>

            <div style={{ padding: '30px', overflowY: 'auto', maxHeight: '70vh' }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-start', marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', gap: isMobile ? '15px' : '0' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} /> {selectedApplication.student.first_name} {selectedApplication.student.last_name}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '600' }}>{selectedApplication.student.program_studi} (NIM: {selectedApplication.student.nim})</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {selectedApplication.student.email}</p>
                </div>
                <div style={{ textAlign: isMobile ? 'left' : 'right', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Melamar Posisi:</span>
                  <h4 style={{ margin: '4px 0 5px 0', color: stemRed, fontSize: '16px', fontWeight: '700' }}>{selectedApplication.vacancy.title}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', fontWeight: '500' }}>di {selectedApplication.vacancy.company_name}</p>
                </div>
              </div>

              <div style={styles.grid2Modal}>
                <div style={{ backgroundColor: '#f8fafc', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '15px', fontWeight: '700' }}>Pesan / Cover Letter:</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                    {selectedApplication.app.cover_letter || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Tidak ada pesan tambahan.</span>}
                  </p>
                  {selectedApplication.app.status === 'withdrawn' && (
                    <div style={{ marginTop: '18px', padding: '14px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px' }}>
                      <h5 style={{ margin: '0 0 6px 0', color: '#9a3412', fontSize: '13px', fontWeight: '800' }}>Alasan Ditarik Mahasiswa</h5>
                      <p style={{ margin: 0, color: '#9a3412', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                        {selectedApplication.app.withdrawal_reason || 'Tidak ada alasan yang dicatat.'}
                      </p>
                      {selectedApplication.app.withdrawn_at && (
                        <p style={{ margin: '8px 0 0', color: '#c2410c', fontSize: '11px', fontWeight: '700' }}>
                          Ditarik pada {new Date(selectedApplication.app.withdrawn_at).toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                    <h5 style={{ margin: '0 0 12px 0', color: '#1d4ed8', fontSize: '15px', fontWeight: '900' }}>Periode Magang Diajukan</h5>
                    <div style={{ display: 'grid', gap: '9px' }}>
                      <div>
                        <span style={{ display: 'block', color: '#64748b', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Tanggal Mulai - Selesai</span>
                        <strong style={{ display: 'block', marginTop: '4px', color: '#0f172a', fontSize: '13px' }}>
                          {selectedApplication.app.internship_start_date || '-'} - {selectedApplication.app.internship_end_date || '-'}
                        </strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', color: '#64748b', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Durasi Hari Kerja</span>
                        <strong style={{ display: 'block', marginTop: '4px', color: '#003366', fontSize: '13px' }}>
                          {selectedApplication.app.internship_start_date && selectedApplication.app.internship_end_date
                            ? `${calculateWorkingDays(selectedApplication.app.internship_start_date, selectedApplication.app.internship_end_date)} hari kerja`
                            : 'Belum ada data periode'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#e0f2fe', padding: '20px', borderRadius: '12px', border: '1px solid #bae6fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h5 style={{ margin: '0 0 5px 0', color: '#0369a1', fontSize: '15px', fontWeight: '700' }}>Curriculum Vitae (CV)</h5>
                      <p style={{ margin: 0, fontSize: '12px', color: '#0284c7' }}>Dokumen Wajib</p>
                    </div>
                    {selectedApplication.student.cv_file ? (
                      renderDocumentActions(selectedApplication.student.cv_file, {
                        previewLabel: 'Preview',
                        downloadLabel: 'Unduh',
                        accent: '#0284c7',
                      })
                    ) : (
                      <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: 'bold' }}>Kosong</span>
                    )}
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h5 style={{ margin: '0 0 5px 0', color: '#334155', fontSize: '15px', fontWeight: '700' }}>Portofolio Tambahan</h5>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Dokumen Opsional</p>
                    </div>
                    {selectedApplication.student.portofolio_file ? (
                      renderDocumentActions(selectedApplication.student.portofolio_file, {
                        previewLabel: 'Preview',
                        downloadLabel: 'Unduh',
                        accent: '#64748b',
                      })
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Tidak Ada Lampiran</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ ...styles.modalFooter, justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                <span style={{ fontSize: '14px', color: '#334155', fontWeight: '700' }}>Status Lamaran:</span>
                <select
                  value={selectedApplication.app.status === 'reviewed' ? 'pending' : selectedApplication.app.status}
                  onChange={(e) => handleUpdateAppStatus(selectedApplication.app.id, e.target.value)}
                  className="input-focus"
                  style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', flex: isMobile ? 1 : 'none', fontWeight: '600', color: stemRed }}
                >
                  <option value="pending">Menunggu Tindakan</option>
                  <option value="accepted">Diterima Perusahaan</option>
                  <option value="rejected">Ditolak Perusahaan</option>
                  <option value="withdrawn">Ditarik Mahasiswa</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
                <button
                  className="btn-hover"
                  onClick={() => handleArchiveApplication(selectedApplication.app)}
                  style={{ ...styles.btnDanger, width: isMobile ? '100%' : 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Trash2 size={14} /> Arsipkan dari Daftar
                </button>
                <button className="btn-hover" onClick={() => setSelectedApplication(null)} style={{ ...styles.btnPrimary, backgroundColor: '#94a3b8', width: isMobile ? '100%' : 'auto' }}>Tutup Preview</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL APPROVE PLACEMENT (DENGAN HISTORI) --- */}
      {placementToApprove && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '800px' }}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: stemRed, fontSize: '20px', fontWeight: '700' }}>Verifikasi Tempat Magang Baru</h2>
              <button onClick={() => setPlacementToApprove(null)} style={styles.closeBtn}>✖</button>
            </div>

            <div style={{ padding: '30px', overflowY: 'auto', maxHeight: '75vh' }}>
              
              {/* HEADER MAHASISWA */}
              <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', borderLeft: `6px solid ${stemRed}`, marginBottom: '25px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} /> {placementToApprove.student.first_name} {placementToApprove.student.last_name}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569', fontWeight: '600' }}>{placementToApprove.student.program_studi} (NIM: {placementToApprove.student.nim})</p>
              </div>

              {/* GRID INFO PENGAJUAN SAAT INI */}
              <h4 style={{ color: '#0f172a', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' }}>Pengajuan Magang Saat Ini</h4>
              <div style={styles.grid2Modal}>
                <div style={{ backgroundColor: 'white', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <h4 style={{ color: '#0f172a', borderBottom: '1px dashed #e2e8f0', paddingBottom: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><Building2 size={18} /> Info Perusahaan</h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}><span style={{ color: '#64748b' }}>Perusahaan:</span> <br /><strong>{placementToApprove.placement.company_name}</strong></p>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}><span style={{ color: '#64748b' }}>Sektor Bisnis:</span> <br /><strong>{placementToApprove.placement.business_sector}</strong></p>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}><span style={{ color: '#64748b' }}>Posisi Magang:</span> <br /><strong>{placementToApprove.placement.position}</strong></p>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}><span style={{ color: '#64748b' }}>Alamat Lengkap:</span> <br /><strong>{placementToApprove.placement.company_address}</strong></p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <h4 style={{ color: '#0f172a', borderBottom: '1px dashed #e2e8f0', paddingBottom: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} /> Detail Periode & Supervisor</h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}><span style={{ color: '#64748b' }}>Mulai s/d Selesai:</span> <br /><strong>{placementToApprove.placement.start_date} - {placementToApprove.placement.end_date}</strong></p>
                  {placementToApprove.placement.previous_placement_end_date && (
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                      <span style={{ color: '#64748b' }}>Tanggal Terakhir di Tempat Lama:</span><br />
                      <strong>{placementToApprove.placement.previous_placement_end_date}</strong>
                    </p>
                  )}
                  {placementToApprove.placement.transfer_reason && (
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', lineHeight: '1.55' }}>
                      <span style={{ color: '#64748b' }}>Alasan Pindah:</span><br />
                      <strong>{placementToApprove.placement.transfer_reason}</strong>
                    </p>
                  )}
                  {transferSourcePlacement && (
                    <div style={{ margin: '12px 0', padding: '12px', backgroundColor: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: '10px', color: '#047857', fontSize: '13px', lineHeight: '1.55', fontWeight: '700' }}>
                      Akumulasi durasi: {placementApprovalTotalWorkingDays} hari kerja ({previousPlacementWorkingDays} lama + {placementApprovalWorkingDays} baru).
                    </div>
                  )}
                  <p style={{ margin: '15px 0 10px 0', fontSize: '14px' }}><span style={{ color: '#64748b' }}>Nama Supervisor:</span> <br /><strong>{placementToApprove.placement.supervisor_name}</strong></p>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}><span style={{ color: '#64748b' }}>Email Supervisor:</span> <br /><strong>{placementToApprove.placement.supervisor_email}</strong></p>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}><span style={{ color: '#64748b' }}>WhatsApp Sup.:</span> <br /><strong>{placementToApprove.placement.supervisor_phone}</strong></p>
                </div>
              </div>

              {!canApprovePlacement && (
                <div style={{ marginTop: '18px', padding: '14px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#991b1b', fontSize: '13px', lineHeight: '1.55', fontWeight: '700' }}>
                  Durasi magang belum memenuhi minimal {MIN_INTERNSHIP_WORKING_DAYS} hari kerja. {transferSourcePlacement ? `Akumulasi saat ini baru ${placementApprovalTotalWorkingDays} hari kerja (${previousPlacementWorkingDays} hari kerja tempat lama + ${placementApprovalWorkingDays} hari kerja tempat baru).` : `Durasi data ini baru ${placementApprovalWorkingDays} hari kerja.`} Minta mahasiswa memperbaiki tanggal mulai/selesai atau edit data penempatan terlebih dahulu.
                </div>
              )}

              {/* TOMBOL LOA */}
              <div style={{ marginTop: '20px', padding: '25px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>Bukti Letter of Acceptance (LoA)</h4>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  {renderDocumentActions(placementToApprove.placement.acceptance_letter, {
                    previewLabel: 'Preview LoA',
                    downloadLabel: 'Unduh LoA',
                    accent: stemRed,
                  })}
                </div>
              </div>

              {/* [TAMBAHAN BARU]: BAGIAN HISTORI MAGANG */}
              {historyPlacements.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                  <h4 style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
                    <History size={18} color={stemRed} /> Riwayat Penempatan Sebelumnya
                  </h4>
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <tr>
                            <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Perusahaan</th>
                            <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Posisi</th>
                            <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Tanggal</th>
                            <th style={{ padding: '12px 15px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Status Akhir</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyPlacements.map((history, idx) => (
                            <tr key={history.id} style={{ borderBottom: idx !== historyPlacements.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                              <td style={{ padding: '12px 15px', color: '#0f172a', fontWeight: '500' }}>{history.company_name}</td>
                              <td style={{ padding: '12px 15px', color: '#64748b' }}>{history.position}</td>
                              <td style={{ padding: '12px 15px', color: '#64748b', fontSize: '13px' }}>{history.start_date} s/d {history.end_date}</td>
                              <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                                <span style={{ 
                                  padding: '4px 10px', 
                                  borderRadius: '20px', 
                                  fontSize: '12px', 
                                  fontWeight: 'bold',
                                  backgroundColor: history.status === 'resigned' ? '#fef2f2' : '#f8fafc',
                                  color: history.status === 'resigned' ? '#ef4444' : '#64748b',
                                  border: `1px solid ${history.status === 'resigned' ? '#fecaca' : '#e2e8f0'}`
                                }}>
                                  {history.status === 'resigned' ? 'Pindah / Resign' : history.status === 'rejected' ? 'Ditolak' : history.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>

            <div style={styles.modalFooter}>
              <button className="btn-hover" onClick={() => setPlacementToApprove(null)} style={{ ...styles.btnPrimary, backgroundColor: '#94a3b8', width: isMobile ? '100%' : 'auto' }}>Tutup</button>
              <button disabled={!canApprovePlacement} className="btn-hover" onClick={confirmApprovePlacement} style={{ ...styles.btnSuccess, backgroundColor: canApprovePlacement ? '#10b981' : '#94a3b8', cursor: canApprovePlacement ? 'pointer' : 'not-allowed', boxShadow: canApprovePlacement ? undefined : 'none', fontSize: '15px', padding: '14px 25px', width: isMobile ? '100%' : 'auto' }}>
                <CheckCircle size={18} /> Verifikasi & Setujui Tempat Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ... MODAL REPORTS, DETAILS, & EMAIL TETAP SAMA ... */}
      {selectedStudentReports && (
         <div style={styles.modalOverlay}>
            {/* ... (Kode existing selectedStudentReports tidak diubah) ... */}
            <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: stemRed, fontSize: '20px', fontWeight: '700' }}>Riwayat Pencarian Magang</h2>
              <button onClick={() => setSelectedStudentReports(null)} style={styles.closeBtn}>✖</button>
            </div>

            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> {selectedStudentReports.student.first_name} {selectedStudentReports.student.last_name}</h3>
              <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>NIM: {selectedStudentReports.student.nim}</p>
            </div>

            <div style={{ padding: '30px', overflowY: 'auto', maxHeight: '60vh' }}>
              {selectedStudentReports.reports.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                  Mahasiswa ini belum mengirimkan satupun laporan progress mingguan.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {selectedStudentReports.reports.map((report) => (
                    <div key={report.id} style={{ padding: '20px', borderLeft: `4px solid ${stemRed}`, backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0, color: '#0f172a', fontSize: '16px' }}>{report.week_number}</h4>
                        <span style={{ fontSize: '12px', color: '#64748b', backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>{new Date(report.submitted_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Perusahaan yang di-Apply:</span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#334155', fontWeight: '600' }}>{report.companies_applied}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: '#ef4444', textTransform: 'uppercase', fontWeight: '700' }}>Kendala Dihadapi:</span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#334155' }}>{report.challenges}</p>
                        </div>
                        <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', marginTop: '5px' }}>
                          <span style={{ fontSize: '11px', color: stemRed, textTransform: 'uppercase', fontWeight: '700' }}>Action Plan Selanjutnya:</span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#475569', fontStyle: 'italic' }}>"{report.next_plan}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
         </div>
      )}

      {selectedDetail && (
         <div style={styles.modalOverlay}>
            {/* ... (Kode existing selectedDetail tidak diubah) ... */}
            <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: stemRed, fontSize: '20px', fontWeight: '700' }}>Rekap Akademik Magang</h2>
              <button onClick={() => setSelectedDetail(null)} style={styles.closeBtn}>✖</button>
            </div>

            <div style={{ padding: '30px', overflowY: 'auto', maxHeight: '70vh' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '25px', borderLeft: `6px solid ${stemRed}` }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={22} /> {selectedDetail.student.first_name} {selectedDetail.student.last_name}</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                  NIM: {selectedDetail.student.nim} | Program Studi: {selectedDetail.student.program_studi}
                </p>
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}><span style={{ color: '#64748b' }}>Penempatan:</span> <strong>{selectedDetail.placement.company_name}</strong></p>
                  <p style={{ margin: 0, fontSize: '14px' }}><span style={{ color: '#64748b' }}>Pembimbing Lapangan:</span> <strong>{selectedDetail.placement.supervisor_name}</strong> ({selectedDetail.placement.supervisor_email})</p>
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: stemRed, marginTop: 0, borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', fontSize: '16px' }}>
                  Dokumen Akademik Awal
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '15px', marginTop: '15px' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Bukti Konsul
                    </span>
                    {selectedDetail.student.bukti_konsul_file ? (
                      <>
                        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#334155', fontWeight: '600', wordBreak: 'break-word' }}>
                          {getDocumentName(selectedDetail.student.bukti_konsul_file)}
                        </p>
                        {renderDocumentActions(selectedDetail.student.bukti_konsul_file, {
                          previewLabel: 'Preview',
                          downloadLabel: 'Unduh',
                          accent: stemRed,
                        })}
                      </>
                    ) : (
                      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>Dokumen belum tersedia.</p>
                    )}
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                      SPTJM
                    </span>
                    {selectedDetail.student.sptjm_file ? (
                      <>
                        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#334155', fontWeight: '600', wordBreak: 'break-word' }}>
                          {getDocumentName(selectedDetail.student.sptjm_file)}
                        </p>
                        {renderDocumentActions(selectedDetail.student.sptjm_file, {
                          previewLabel: 'Preview',
                          downloadLabel: 'Unduh',
                          accent: stemRed,
                        })}
                      </>
                    ) : (
                      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>Dokumen belum tersedia.</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedDetail.historyPlacements?.length > 0 && (
                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
                    <History size={18} color={stemRed} /> Riwayat Perusahaan Sebelumnya
                  </h4>
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <tr>
                            <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Perusahaan</th>
                            <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Posisi</th>
                            <th style={{ padding: '12px 15px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Periode</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDetail.historyPlacements.map((history, index) => (
                            <tr key={history.id} style={{ borderBottom: index !== selectedDetail.historyPlacements.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                              <td style={{ padding: '12px 15px', color: '#0f172a', fontWeight: '500' }}>{history.company_name}</td>
                              <td style={{ padding: '12px 15px', color: '#64748b' }}>{history.position}</td>
                              <td style={{ padding: '12px 15px', color: '#64748b', fontSize: '13px' }}>{history.start_date} s/d {history.end_date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {selectedDetail.historyPlacementDetails?.length > 0 && (
                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ color: stemRed, marginTop: 0, borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', fontSize: '16px' }}>
                    Histori Laporan Bulanan Perusahaan Sebelumnya
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                    {selectedDetail.historyPlacementDetails.map((historyPlacement) => (
                      <div key={historyPlacement.id} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px' }}>
                        <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #cbd5e1' }}>
                          <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>{historyPlacement.company_name}</strong>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>
                            {historyPlacement.position} | {historyPlacement.start_date} s/d {historyPlacement.end_date}
                          </span>
                        </div>

                        {historyPlacement.monthlyReports.length === 0 ? (
                          <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>Belum ada laporan bulanan untuk perusahaan ini.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {historyPlacement.monthlyReports.map((report, index) => (
                              <div key={report.id} style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                                  <div>
                                    <span style={{ fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '4px' }}>{report.report_month}</span>
                                    <span style={{ fontSize: '11px', color: '#64748b' }}>Bulan ke-{index + 1}</span>
                                  </div>
                                  <details style={{ width: isMobile ? '100%' : 'auto' }}>
                                    <summary style={{ cursor: 'pointer', color: '#0284c7', fontSize: '13px', fontWeight: '700' }}>
                                      Baca Isi Laporan
                                    </summary>
                                    {renderMonthlyReportDetails(report)}
                                  </details>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={styles.grid2Modal}>
                <div>
                  <h4 style={{ color: stemRed, marginTop: 0, borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', fontSize: '16px' }}>Histori Laporan Bulanan</h4>
                  {selectedMonthlySummary && (
                    <div style={{ margin: '0 0 15px 0', padding: '12px 14px', borderRadius: '8px', border: `1px solid ${selectedMonthlySummary.isComplete ? '#bbf7d0' : '#fecaca'}`, backgroundColor: selectedMonthlySummary.isComplete ? '#f0fdf4' : '#fef2f2', color: selectedMonthlySummary.isComplete ? '#166534' : '#991b1b', fontSize: '13px', fontWeight: '700', lineHeight: '1.5' }}>
                      <div>
                        Laporan terkumpul: {selectedMonthlySummary.submittedCount}/{selectedMonthlySummary.requiredCount || '-'} sesuai total durasi magang{selectedMonthlySummary.placementSummaries?.length > 1 ? ' termasuk riwayat pindah perusahaan' : ''}.
                      </div>
                      {selectedMonthlySummary.placementSummaries?.length > 1 && (
                        <div style={{ marginTop: '8px', display: 'grid', gap: '4px', fontSize: '12px', fontWeight: '600' }}>
                          {selectedMonthlySummary.placementSummaries.map((summary) => (
                            <span key={summary.placement.id}>
                              {summary.placement.company_name}: {summary.submittedCount}/{summary.requiredCount || '-'} laporan{summary.usesTransferEndDate ? ` (dihitung s/d ${summary.periodEndDate})` : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {selectedDetail.mhsMonthly.length === 0 ? (
                    <div style={{ padding: '20px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px' }}>
                      <p style={{ color: '#b45309', fontSize: '14px', margin: 0, fontWeight: '600' }}>Belum ada laporan bulanan.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                      {selectedDetail.mhsMonthly.map((report, index) => (
                        <div key={report.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                            <div>
                              <span style={{ fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '4px' }}>{report.report_month}</span>
                              <span style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>Bulan ke-{index + 1}</span>
                            </div>
                            <details style={{ width: isMobile ? '100%' : 'auto' }}>
                              <summary style={{ cursor: 'pointer', color: '#0284c7', fontSize: '13px', fontWeight: '700' }}>
                                Baca Isi Laporan
                              </summary>
                              {renderMonthlyReportDetails(report)}
                            </details>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <h4 style={{ color: stemRed, marginTop: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', fontSize: '16px' }}>Laporan Tengah Semester (UTS)</h4>
                  {selectedDetail.mhsUts ? (
                    <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                        <span style={{ color: '#1d4ed8', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle size={16} /> Berkas Tersedia
                        </span>
                        {utsSourceText && <span style={{ fontSize: '12px', color: '#475569', fontWeight: '700' }}>{utsSourceText}</span>}
                        {renderDocumentActions(selectedDetail.mhsUts.report_file, {
                          previewLabel: 'Preview',
                          downloadLabel: 'Unduh',
                          accent: '#1d4ed8',
                        })}
                      </div>
                      {selectedDetail.mhsUts.description && (
                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #bfdbfe' }}>
                          <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#1e3a8a', textTransform: 'uppercase', marginBottom: '6px' }}>
                            Keterangan Tambahan
                          </span>
                          <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                            {selectedDetail.mhsUts.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                      <p style={{ color: '#991b1b', fontSize: '14px', margin: 0, fontWeight: '700' }}>Belum Ada Berkas UTS</p>
                    </div>
                  )}

                  <h4 style={{ color: stemRed, marginTop: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', fontSize: '16px' }}>Laporan Tugas Akhir (UAS)</h4>
                  {selectedDetail.mhsFinal ? (
                    <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                      <span style={{ color: '#166534', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16} /> Berkas Tersedia</span>
                      {finalSourceText && <span style={{ fontSize: '12px', color: '#475569', fontWeight: '700' }}>{finalSourceText}</span>}
                      {renderDocumentActions(selectedDetail.mhsFinal.report_file, {
                        previewLabel: 'Preview',
                        downloadLabel: 'Unduh',
                        accent: '#166534',
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                      <p style={{ color: '#991b1b', fontSize: '14px', margin: 0, fontWeight: '700' }}>Belum Ada Berkas UAS</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 style={{ color: stemRed, marginTop: 0, borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', fontSize: '16px' }}>Rekap Nilai Supervisor</h4>
                  <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px dashed #cbd5e1' }}>
                      <strong style={{ color: '#334155', fontSize: '15px' }}>Nilai UTS:</strong>
                      {selectedDetail.evalUTS?.is_filled ? <span style={{ ...styles.badgeSuccess, fontSize: '14px', padding: '6px 15px' }}>{selectedDetail.evalUTS.score}{evalUtsSourceText ? ` - ${evalUtsSourceText}` : ''}</span> : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Menunggu</span>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#334155', fontSize: '15px' }}>Nilai UAS:</strong>
                      {selectedDetail.evalUAS?.is_filled ? <span style={{ ...styles.badgeSuccess, fontSize: '14px', padding: '6px 15px' }}>{selectedDetail.evalUAS.score}{evalUasSourceText ? ` - ${evalUasSourceText}` : ''}</span> : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Menunggu</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '40px', padding: '30px', backgroundColor: 'white', borderRadius: '12px', border: `2px solid ${stemRed}`, textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '20px' }}>Terbitkan Sertifikat Kelulusan Co-op</h4>
                {selectedDetail.mhsCert ? (
                  <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '8px', display: 'inline-block' }}>
                    <span style={{ color: '#166534', fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} /> Mahasiswa Lulus (Grade Terkonversi: {selectedDetail.mhsCert.grade})</span>
                  </div>
                ) : (
                  <div>
                    {selectedDetailMissingFields.length > 0 ? (
                      <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', textAlign: 'left' }}>
                        <strong style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Sertifikat belum bisa diterbitkan karena data berikut belum lengkap:</strong>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', lineHeight: '1.6' }}>
                          {selectedDetailMissingFields.map((field) => (
                            <li key={field}>{field.replace(/^- /, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Semua syarat akademik sudah lengkap. Pilih nilai akhir untuk menerbitkan sertifikat.</p>
                    )}
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', gap: '15px', alignItems: isMobile ? 'stretch' : 'flex-end' }}>
                      <div style={{ width: isMobile ? '100%' : '300px', textAlign: 'left' }}>
                        <label style={{ display: 'block', color: '#334155', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '7px' }}>Grade Sertifikat</label>
                        <div style={{ position: 'relative' }}>
                          <select className="input-focus" style={{ appearance: 'none', WebkitAppearance: 'none', width: '100%', padding: '14px 44px 14px 16px', borderRadius: '12px', border: `1px solid ${canIssueSelectedCertificate ? '#fecaca' : '#cbd5e1'}`, fontSize: '16px', fontWeight: '900', letterSpacing: '0', color: gradeInput[selectedDetail.placement.id] ? stemRed : '#64748b', backgroundColor: canIssueSelectedCertificate ? '#fff7f7' : '#f8fafc', boxShadow: canIssueSelectedCertificate ? '0 10px 22px rgba(179, 19, 18, 0.08)' : 'none', outline: 'none', cursor: 'pointer', fontFamily: '"Montserrat", sans-serif' }} value={gradeInput[selectedDetail.placement.id] || ''} onChange={(e) => setGradeInput({ ...gradeInput, [selectedDetail.placement.id]: e.target.value })}>
                            <option value="">Pilih Grade</option>
                            {CERTIFICATE_GRADE_OPTIONS.map((grade) => (
                              <option key={grade} value={grade}>{grade}</option>
                            ))}
                          </select>
                          <div style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', width: '28px', height: '28px', borderRadius: '9px', backgroundColor: canIssueSelectedCertificate ? '#fee2e2' : '#e2e8f0', color: canIssueSelectedCertificate ? stemRed : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                            <ChevronDown size={16} />
                          </div>
                        </div>
                      </div>
                      <button disabled={!canIssueSelectedCertificate} className="btn-hover" onClick={() => handleIssueCertificate(selectedDetail.student.id, selectedDetail.placement.id)} style={{ padding: '14px 25px', backgroundColor: canIssueSelectedCertificate ? stemRed : '#94a3b8', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: canIssueSelectedCertificate ? 'pointer' : 'not-allowed', width: isMobile ? '100%' : 'auto', fontSize: '15px' }}>Terbitkan Sertifikat Sekarang</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
         </div>
      )}

      {emailModal.isOpen && (
         <div style={styles.modalOverlay}>
            <div style={{ ...styles.modalContent, maxWidth: '680px', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: isMobile ? '18px' : '20px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '13px', minWidth: 0 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff1f2', color: stemRed, border: '1px solid #fecaca', flexShrink: 0 }}>
                  <Mail size={20} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: isMobile ? '17px' : '19px', fontWeight: '900', lineHeight: 1.3 }}>
                    {isSupervisorEvaluationEmail ? 'Preview Email Supervisor' : 'Tulis Pesan Email'}
                  </h2>
                  <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '11px', fontWeight: '700' }}>
                    {isSupervisorEvaluationEmail ? 'Permohonan evaluasi kinerja mahasiswa' : (emailModal.targetName ? 'Pesan individual' : 'Pesan massal')}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setEmailModal({ ...emailModal, isOpen: false })} aria-label="Tutup preview email" style={{ width: '34px', height: '34px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#64748b', cursor: 'pointer', flexShrink: 0 }}>
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSendCustomEmail}>
              <div style={{ padding: isMobile ? '18px' : '22px 24px', backgroundColor: '#f8fafc' }}>
                <div style={{ marginBottom: '16px', padding: '13px 14px', borderRadius: '11px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef2ff', color: '#4f46e5', flexShrink: 0 }}>
                    <UserRound size={17} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: 'block', color: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '3px' }}>Kepada</span>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '13px', lineHeight: 1.4 }}>{emailModal.targetName || 'Penerima sesuai filter'}</strong>
                    {emailModal.targetEmail && (
                      <span style={{ display: 'block', marginTop: '2px', color: '#64748b', fontSize: '12px', fontWeight: '700', overflowWrap: 'anywhere' }}>{emailModal.targetEmail}</span>
                    )}
                  </div>
                  <span style={{ padding: '5px 8px', borderRadius: '999px', backgroundColor: isSupervisorEvaluationEmail ? '#ecfdf5' : '#eef2ff', color: isSupervisorEvaluationEmail ? '#047857' : '#4338ca', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {isSupervisorEvaluationEmail ? 'Supervisor' : (emailModal.targetName ? 'Individual' : 'Massal')}
                  </span>
                </div>
                {isSupervisorEvaluationEmail && (
                  <div style={{ marginBottom: '17px', padding: '11px 13px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '9px', fontSize: '11px', fontWeight: '800', lineHeight: 1.5 }}>
                    <Link2 size={15} style={{ flexShrink: 0 }} />
                    Tombol form evaluasi akan ditambahkan otomatis saat email dikirim.
                  </div>
                )}
                <div style={{ marginBottom: '17px' }}>
                  <label style={{ ...styles.labelStyle, color: '#475569', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '7px' }}>
                    <FileText size={14} /> Subjek Email
                  </label>
                  <input
                    type="text"
                    required
                    value={emailModal.subject}
                    onChange={(e) => setEmailModal({ ...emailModal, subject: e.target.value })}
                    className="input-focus"
                    style={{ ...styles.modernInput, border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontWeight: '800' }}
                  />
                </div>
                <div>
                  <label style={{ ...styles.labelStyle, color: '#475569', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '7px' }}>
                    <Mail size={14} /> Isi Pesan
                  </label>
                  <textarea
                    required
                    rows="11"
                    value={emailModal.message}
                    onChange={(e) => setEmailModal({ ...emailModal, message: e.target.value })}
                    className="input-focus"
                    style={{ ...styles.modernInput, resize: 'vertical', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', lineHeight: '1.65', minHeight: '210px' }}
                  />
                </div>
              </div>

              <div style={{ ...styles.modalFooter, backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', gap: '10px' }}>
                <button type="button" className="btn-hover" onClick={() => setEmailModal({ ...emailModal, isOpen: false })} style={{ padding: '12px 18px', borderRadius: '9px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: '900', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>Batal</button>
                <button type="submit" disabled={sendingEmail} className="btn-hover" style={{ ...styles.btnPrimary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#10b981', padding: '12px 20px', borderRadius: '9px', fontSize: '13px', width: isMobile ? '100%' : 'auto', opacity: sendingEmail ? 0.7 : 1 }}>
                  <Send size={15} /> {sendingEmail ? 'Mengirim...' : 'Kirim Email'}
                </button>
              </div>
            </form>
          </div>
         </div>
      )}
    </>
  );
}

export default DashboardModals;
