import { Activity, Building2, CheckCircle, Download, Edit2, Key, Mail, Users, History } from 'lucide-react';
import { stemRed } from '../../styles/adminstyles';

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
  
  // [TAMBAHAN BARU]: Logika memisahkan histori magang
  let historyPlacements = [];
  if (placementToApprove && placements) {
    historyPlacements = placements.filter(
      (p) => 
        p.student === placementToApprove.student.id && 
        p.id !== placementToApprove.placement.id // Singkirkan data yang sedang diapprove
    );
  }

  return (
    <>
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
                  <button type="button" onClick={() => handleForceResetPassword(editingStudent.id)} className="btn-hover" style={{ backgroundColor: 'white', color: stemRed, border: `1px solid ${stemRed}`, padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Key size={14} /> Ganti Password
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
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ backgroundColor: '#e0f2fe', padding: '20px', borderRadius: '12px', border: '1px solid #bae6fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h5 style={{ margin: '0 0 5px 0', color: '#0369a1', fontSize: '15px', fontWeight: '700' }}>Curriculum Vitae (CV)</h5>
                      <p style={{ margin: 0, fontSize: '12px', color: '#0284c7' }}>Dokumen Wajib</p>
                    </div>
                    {selectedApplication.student.cv_file ? (
                      <a className="btn-hover" href={selectedApplication.student.cv_file} target="_blank" rel="noreferrer" style={{ ...styles.btnPrimary, padding: '10px 15px', textDecoration: 'none', backgroundColor: '#0284c7' }}><Download size={14} /> Download</a>
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
                      <a className="btn-hover" href={selectedApplication.student.portofolio_file} target="_blank" rel="noreferrer" style={{ ...styles.btnPrimary, backgroundColor: '#64748b', padding: '10px 15px', textDecoration: 'none' }}><Download size={14} /> Download</a>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Tidak Ada Lampiran</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ ...styles.modalFooter, justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                <span style={{ fontSize: '14px', color: '#334155', fontWeight: '700' }}>Tindakan HRD:</span>
                <select
                  value={selectedApplication.app.status}
                  onChange={(e) => handleUpdateAppStatus(selectedApplication.app.id, e.target.value)}
                  className="input-focus"
                  style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', flex: isMobile ? 1 : 'none', fontWeight: '600', color: stemRed }}
                >
                  <option value="pending">Menunggu Review</option>
                  <option value="reviewed">Teruskan ke HRD Perusahaan</option>
                  <option value="accepted">Diterima Perusahaan</option>
                  <option value="rejected">Ditolak Perusahaan</option>
                </select>
              </div>
              <button className="btn-hover" onClick={() => setSelectedApplication(null)} style={{ ...styles.btnPrimary, backgroundColor: '#94a3b8', width: isMobile ? '100%' : 'auto' }}>Tutup Preview</button>
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
                  <p style={{ margin: '15px 0 10px 0', fontSize: '14px' }}><span style={{ color: '#64748b' }}>Nama Supervisor:</span> <br /><strong>{placementToApprove.placement.supervisor_name}</strong></p>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}><span style={{ color: '#64748b' }}>Email Supervisor:</span> <br /><strong>{placementToApprove.placement.supervisor_email}</strong></p>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}><span style={{ color: '#64748b' }}>WhatsApp Sup.:</span> <br /><strong>{placementToApprove.placement.supervisor_phone}</strong></p>
                </div>
              </div>

              {/* TOMBOL LOA */}
              <div style={{ marginTop: '20px', padding: '25px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>Bukti Letter of Acceptance (LoA)</h4>
                <a className="btn-hover" href={placementToApprove.placement.acceptance_letter} target="_blank" rel="noreferrer" style={{ ...styles.btnPrimary, backgroundColor: stemRed, textDecoration: 'none', display: 'inline-flex', padding: '14px 25px' }}>
                  <Download size={18} /> Buka Dokumen Surat Terima Magang
                </a>
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
              <button className="btn-hover" onClick={confirmApprovePlacement} style={{ ...styles.btnSuccess, fontSize: '15px', padding: '14px 25px', width: isMobile ? '100%' : 'auto' }}>
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
                        <a className="btn-hover" href={selectedDetail.student.bukti_konsul_file} target="_blank" rel="noreferrer" style={{ ...styles.linkDoc, display: 'inline-flex' }}>
                          <Download size={12} /> Buka Bukti Konsul
                        </a>
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
                        <a className="btn-hover" href={selectedDetail.student.sptjm_file} target="_blank" rel="noreferrer" style={{ ...styles.linkDoc, display: 'inline-flex' }}>
                          <Download size={12} /> Buka SPTJM
                        </a>
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
                        <a className="btn-hover" href={selectedDetail.mhsUts.report_file} target="_blank" rel="noreferrer" style={{ ...styles.linkDoc, backgroundColor: 'white', borderColor: '#93c5fd', color: '#1d4ed8' }}><Download size={12} /> Unduh PDF</a>
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
                    <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#166534', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16} /> Berkas Tersedia</span>
                      <a className="btn-hover" href={selectedDetail.mhsFinal.report_file} target="_blank" rel="noreferrer" style={{ ...styles.linkDoc, backgroundColor: 'white', borderColor: '#86efac', color: '#166534' }}><Download size={12} /> Unduh PDF</a>
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
                      {selectedDetail.evalUTS?.is_filled ? <span style={{ ...styles.badgeSuccess, fontSize: '14px', padding: '6px 15px' }}>{selectedDetail.evalUTS.score}</span> : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Menunggu</span>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#334155', fontSize: '15px' }}>Nilai UAS:</strong>
                      {selectedDetail.evalUAS?.is_filled ? <span style={{ ...styles.badgeSuccess, fontSize: '14px', padding: '6px 15px' }}>{selectedDetail.evalUAS.score}</span> : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Menunggu</span>}
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
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Pastikan semua syarat akademik terpenuhi sebelum menerbitkan sertifikat.</p>
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', gap: '15px', alignItems: 'center' }}>
                      <input className="input-focus" type="text" placeholder="Masukkan Grade (Contoh: A, A-, B+)" style={{ padding: '14px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', width: isMobile ? '100%' : '300px', fontSize: '15px', textAlign: 'center', fontWeight: 'bold' }} value={gradeInput[selectedDetail.placement.id] || ''} onChange={(e) => setGradeInput({ ...gradeInput, [selectedDetail.placement.id]: e.target.value })} />
                      <button className="btn-hover" onClick={() => handleIssueCertificate(selectedDetail.student.id, selectedDetail.placement.id)} style={{ padding: '14px 25px', backgroundColor: stemRed, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', width: isMobile ? '100%' : 'auto', fontSize: '15px' }}>Terbitkan Sertifikat Sekarang</button>
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
            {/* ... (Kode existing emailModal tidak diubah) ... */}
            <div style={{ ...styles.modalContent, maxWidth: '600px' }}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={20} /> Tulis Pesan Email {emailModal.targetName ? `ke ${emailModal.targetName}` : '(Massal)'}
              </h2>
              <button onClick={() => setEmailModal({ ...emailModal, isOpen: false })} style={styles.closeBtn}>✖</button>
            </div>

            <form onSubmit={handleSendCustomEmail}>
              <div style={{ padding: '25px', backgroundColor: '#f8fafc' }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ ...styles.labelStyle, color: '#475569' }}>Subjek Email</label>
                  <input
                    type="text"
                    required
                    value={emailModal.subject}
                    onChange={(e) => setEmailModal({ ...emailModal, subject: e.target.value })}
                    className="input-focus"
                    style={{ ...styles.modernInput, border: '1px solid #cbd5e1', fontWeight: 'bold' }}
                  />
                </div>
                <div>
                  <label style={{ ...styles.labelStyle, color: '#475569' }}>Isi Pesan (Bisa diedit manual)</label>
                  <textarea
                    required
                    rows="10"
                    value={emailModal.message}
                    onChange={(e) => setEmailModal({ ...emailModal, message: e.target.value })}
                    className="input-focus"
                    style={{ ...styles.modernInput, resize: 'vertical', border: '1px solid #cbd5e1', lineHeight: '1.6' }}
                  />
                </div>
              </div>

              <div style={{ ...styles.modalFooter, backgroundColor: 'white', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" className="btn-hover" onClick={() => setEmailModal({ ...emailModal, isOpen: false })} style={{ ...styles.btnPrimary, backgroundColor: '#94a3b8', padding: '12px 20px', width: isMobile ? '100%' : 'auto' }}>Batal</button>
                <button type="submit" disabled={sendingEmail} className="btn-hover" style={{ ...styles.btnPrimary, backgroundColor: '#10b981', padding: '12px 25px', fontSize: '15px', width: isMobile ? '100%' : 'auto' }}>
                  {sendingEmail ? 'Memproses...' : 'Kirim Sekarang'}
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
