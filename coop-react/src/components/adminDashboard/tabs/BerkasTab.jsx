import { Activity, CheckCircle, Eye, FileCheck2, FileEdit, Upload } from 'lucide-react';
import {
  badge,
  compactButton,
  emptyState,
  innerPanel,
  metricCard,
  metricGrid,
  tabPageHeader,
  tabSubtitle,
  tabTitle,
  tableShell,
} from './sharedTabStyles';
import GuidancePanel from './GuidancePanel';
import PaginationControls from './PaginationControls';
import StatusSegmentedControl from './StatusSegmentedControl';
import usePagedData from './usePagedData';

function BerkasTab({
  styles,
  isMobile,
  handleTemplateSubmit,
  currentTemplates,
  getFileName,
  handleTemplateChange,
  uploadingTemplate,
  filterStatusBerkas,
  setFilterStatusBerkas,
  berkasFiltered,
  students,
  certificates,
  openDetailModal,
}) {
  const certifiedCount = berkasFiltered.filter((placement) => (
    certificates.some((certificate) => (certificate.placement?.id || certificate.placement) === placement.id)
  )).length;
  const waitingCount = berkasFiltered.length - certifiedCount;
  const {
    page,
    pageSize,
    pagedItems: pagedBerkas,
    setPage,
    totalItems,
    totalPages,
  } = usePagedData(berkasFiltered);

  const metrics = [
    { icon: FileEdit, label: 'Template Aktif', value: [currentTemplates?.uts_template, currentTemplates?.uas_template].filter(Boolean).length, tint: '#eef2ff', color: '#4f46e5' },
    { icon: FileCheck2, label: 'Siap Direview', value: berkasFiltered.length, tint: '#fff7ed', color: '#f97316' },
    { icon: CheckCircle, label: 'Sertifikat Terbit', value: certifiedCount, tint: '#ecfdf5', color: '#10b981' },
    { icon: Activity, label: 'Menunggu Evaluasi', value: waitingCount, tint: '#fff1f2', color: '#f43f5e' },
  ];

  const renderTemplateForm = (type, currentFile) => (
    <form onSubmit={(e) => handleTemplateSubmit(e, type)} style={innerPanel}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#111827', fontSize: '16px', fontWeight: '900' }}>Template {type.toUpperCase()}</h3>
          <p style={{ margin: '5px 0 0', color: '#94a3b8', fontSize: '11px', fontWeight: '600' }}>Dokumen panduan laporan mahasiswa.</p>
        </div>
        <div style={{ width: '36px', height: '36px', borderRadius: '12px', backgroundColor: '#fff1f2', color: '#b31312', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileEdit size={17} />
        </div>
      </div>

      {currentFile && (
        <div style={{ padding: '14px', backgroundColor: '#ffffff', borderRadius: '12px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e8eef7' }}>
          <FileCheck2 size={22} color="#10b981" />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase' }}>File Aktif</p>
            <a href={currentFile} target="_blank" rel="noreferrer" title={getFileName(currentFile)} style={{ fontSize: '12px', color: '#1d4ed8', textDecoration: 'none', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', display: 'block', fontWeight: '900' }}>
              {getFileName(currentFile)}
            </a>
          </div>
        </div>
      )}

      <label style={styles.labelStyle}>Ganti Template Baru</label>
      <input type="file" name={`${type}_template`} accept=".doc,.docx,.pdf" onChange={handleTemplateChange} style={{ ...styles.inputStyle, backgroundColor: '#ffffff' }} />
      <button type="submit" disabled={uploadingTemplate === type} className="btn-hover" style={compactButton(styles, 'primary', { marginTop: '16px', width: '100%' })}>
        {uploadingTemplate === type ? 'Mengupload...' : <><Upload size={15} /> Simpan Perubahan</>}
      </button>
    </form>
  );

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
            <h2 style={tabTitle(isMobile)}>Berkas & Sertifikasi</h2>
            <p style={tabSubtitle}>Kelola template laporan dan lakukan review akhir sebelum sertifikat diterbitkan.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '18px' }}>
          {renderTemplateForm('uts', currentTemplates?.uts_template)}
          {renderTemplateForm('uas', currentTemplates?.uas_template)}
        </div>
      </div>

      <div style={styles.card}>
        <div style={tabPageHeader(isMobile)}>
          <div>
            <h2 style={tabTitle(isMobile)}>Penerbitan Sertifikat</h2>
            <p style={tabSubtitle}>Review rekap tugas akhir mahasiswa sebelum status kelulusan disahkan.</p>
          </div>

        </div>

        <div style={{ marginBottom: '22px' }}>
          <StatusSegmentedControl
            value={filterStatusBerkas}
            onChange={setFilterStatusBerkas}
            isMobile={isMobile}
            options={[
              { value: '', label: 'Semua' },
              { value: 'menunggu', label: 'Menunggu' },
              { value: 'lulus', label: 'Lulus' },
            ]}
          />
        </div>

        <div style={tableShell}>
          <table style={{ ...styles.table, marginTop: 0 }}>
            <thead>
              <tr>
                <th style={{ ...styles.th, borderTopLeftRadius: '16px' }}>Mahasiswa</th>
                <th style={styles.th}>Perusahaan</th>
                <th style={styles.th}>Status Akhir</th>
                <th style={{ ...styles.th, borderTopRightRadius: '16px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagedBerkas.map((placement) => {
                const student = students.find((item) => item.id === placement.student);
                if (!student) return null;
                const mhsCert = certificates.find((certificate) => (certificate.placement?.id || certificate.placement) === placement.id);
                return (
                  <tr key={placement.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong style={{ color: '#111827', fontSize: '13px', textTransform: 'capitalize' }}>{student.first_name} {student.last_name}</strong><br />
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{student.nim} | <span style={{ textTransform: 'capitalize' }}>{student.program_studi}</span></span>
                    </td>
                    <td style={styles.td}>{placement.company_name}</td>
                    <td style={styles.td}>
                      {mhsCert ? (
                        <span style={badge('success')}><CheckCircle size={13} /> Lulus (Grade: <span style={{ textTransform: 'uppercase' }}>{mhsCert.grade}</span>)</span>
                      ) : (
                        <span style={badge('neutral')}><Activity size={13} /> Menunggu Evaluasi</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button className="btn-hover" onClick={() => openDetailModal(placement, student)} style={compactButton(styles, 'primary', { width: isMobile ? '100%' : 'auto' })}>
                        <Eye size={14} /> Review & Luluskan
                      </button>
                    </td>
                  </tr>
                );
              })}
              {berkasFiltered.length === 0 && (
                <tr><td colSpan="4" style={emptyState}>Tidak ada data mahasiswa yang sesuai filter.</td></tr>
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
          itemLabel="berkas"
        />
      </div>

      <div style={{ marginTop: '18px' }}>
        <GuidancePanel
          title="Panduan Berkas & Sertifikasi"
          description="Pastikan template dan proses kelulusan berjalan konsisten dari UTS sampai UAS."
          icon={FileCheck2}
          items={[
            'Unggah template UTS dan UAS terbaru sebelum periode laporan dimulai.',
            'Gunakan Review & Luluskan hanya setelah dokumen akhir dan evaluasi supervisor siap dicek.',
            'Sertifikat diterbitkan setelah admin menentukan hasil akhir dan grade mahasiswa.',
          ]}
        />
      </div>
    </div>
  );
}

export default BerkasTab;
