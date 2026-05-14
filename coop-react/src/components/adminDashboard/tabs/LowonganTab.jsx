import { Building2, CalendarClock, Edit, ExternalLink, FileEdit, Link2, Trash2 } from 'lucide-react';
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
} from './sharedTabStyles';
import GuidancePanel from './GuidancePanel';
import PaginationControls from './PaginationControls';
import usePagedData from './usePagedData';

function LowonganTab({
  styles,
  isMobile,
  editingVacancyId,
  handleVacancySubmit,
  handleVacancyChange,
  vacancyForm,
  handleCancelEdit,
  submittingVacancy,
  vacancies,
  handleEditClick,
  handleDeleteVacancy,
}) {
  const today = new Date();
  const withExternalLink = vacancies.filter((job) => job.external_apply_link).length;
  const expiringSoon = vacancies.filter((job) => {
    if (!job.expires_at) return false;
    const diffDays = Math.ceil((new Date(job.expires_at) - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;
  const {
    page,
    pageSize,
    pagedItems: pagedVacancies,
    setPage,
    totalItems,
    totalPages,
  } = usePagedData(vacancies);

  const metrics = [
    { icon: FileEdit, label: 'Lowongan Aktif', value: vacancies.length, tint: '#eef2ff', color: '#4f46e5' },
    { icon: Link2, label: 'Link Eksternal', value: withExternalLink, tint: '#ecfdf5', color: '#10b981' },
    { icon: CalendarClock, label: 'Akan Berakhir', value: expiringSoon, tint: '#fff7ed', color: '#f97316' },
  ];

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
            <h2 style={tabTitle(isMobile)}>{editingVacancyId ? 'Edit Lowongan' : 'Kelola Lowongan'}</h2>
            <p style={tabSubtitle}>{editingVacancyId ? 'Perbarui informasi lowongan yang sudah dipublikasikan.' : 'Posting peluang magang baru untuk mahasiswa STEM.'}</p>
          </div>
          {editingVacancyId && (
            <button type="button" className="btn-hover" onClick={handleCancelEdit} style={compactButton(styles, 'slate', { width: isMobile ? '100%' : 'auto' })}>
              Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={handleVacancySubmit} style={innerPanel}>
          <div style={styles.grid2Modal}>
            <div style={{ marginBottom: isMobile ? '0' : '15px' }}>
              <label style={styles.labelStyle}>Posisi Pekerjaan</label>
              <input type="text" name="title" required onChange={handleVacancyChange} value={vacancyForm.title} className="input-focus" style={{ ...styles.modernInput, backgroundColor: '#ffffff' }} placeholder="Misal: Data Scientist Intern" />
            </div>
            <div style={{ marginBottom: isMobile ? '0' : '15px' }}>
              <label style={styles.labelStyle}>Nama Perusahaan</label>
              <input type="text" name="company_name" required onChange={handleVacancyChange} value={vacancyForm.company_name} className="input-focus" style={{ ...styles.modernInput, backgroundColor: '#ffffff' }} placeholder="Misal: Tokopedia" />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={styles.labelStyle}>Batas Akhir</label>
            <input type="date" name="expires_at" required onChange={handleVacancyChange} value={vacancyForm.expires_at} className="input-focus" style={{ ...styles.modernInput, backgroundColor: '#ffffff' }} />
            <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Lowongan otomatis kadaluarsa setelah tanggal ini.</p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={styles.labelStyle}>Link Apply Eksternal</label>
            <input type="url" name="external_apply_link" onChange={handleVacancyChange} value={vacancyForm.external_apply_link} className="input-focus" style={{ ...styles.modernInput, backgroundColor: '#ffffff' }} placeholder="Misal: https://jobstreet.co.id/..." />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={styles.labelStyle}>Deskripsi Pekerjaan</label>
            <textarea name="description" rows="3" required onChange={handleVacancyChange} value={vacancyForm.description} className="input-focus" style={{ ...styles.modernInput, backgroundColor: '#ffffff', resize: 'vertical' }} placeholder="Jelaskan lingkup kerja..." />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={styles.labelStyle}>Persyaratan Khusus</label>
            <textarea name="requirements" rows="3" required onChange={handleVacancyChange} value={vacancyForm.requirements} className="input-focus" style={{ ...styles.modernInput, backgroundColor: '#ffffff', resize: 'vertical' }} placeholder="Kualifikasi akademik, skill teknis..." />
          </div>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #e8eef7', paddingTop: '20px' }}>
            <button type="submit" disabled={submittingVacancy} className="btn-hover" style={compactButton(styles, 'primary', { padding: '12px 24px', width: isMobile ? '100%' : 'auto' })}>
              {submittingVacancy ? 'Menyimpan...' : (editingVacancyId ? <><Edit size={15} /> Simpan Perubahan</> : <><FileEdit size={15} /> Posting Lowongan</>)}
            </button>
          </div>
        </form>
      </div>

      <div style={tabPageHeader(isMobile)}>
        <div>
          <h2 style={tabTitle(isMobile)}>Daftar Lowongan Aktif</h2>
          <p style={tabSubtitle}>{vacancies.length} pekerjaan tersedia untuk mahasiswa.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
        {vacancies.length === 0 ? (
          <div style={{ gridColumn: '1/-1', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '14px' }}>
            <div style={emptyState}>Belum ada lowongan aktif yang tersedia saat ini.</div>
          </div>
        ) : pagedVacancies.map((job) => (
          <div key={job.id} className="job-card" style={{ backgroundColor: '#ffffff', border: '1px solid #e8eef7', borderRadius: '14px', boxShadow: '0 14px 34px rgba(15, 23, 42, 0.06)', padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '330px', transition: 'all 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '18px', fontWeight: '900' }}>{job.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#64748b', fontSize: '12px', fontWeight: '800' }}>
                  <Building2 size={15} /> {job.company_name}
                </div>
              </div>
              {job.expires_at && (
                <span style={badge('warning')}>Exp: {new Date(job.expires_at).toLocaleDateString('id-ID')}</span>
              )}
            </div>

            {job.external_apply_link && (
              <a href={job.external_apply_link} target="_blank" rel="noopener noreferrer" className="btn-hover" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '12px', color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '8px 12px', borderRadius: '10px', textDecoration: 'none', fontWeight: '900', width: 'fit-content', border: '1px solid #bfdbfe' }}>
                <ExternalLink size={14} /> Apply via Link Eksternal
              </a>
            )}

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginBottom: '20px', flex: 1, marginTop: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: '900' }}>Deskripsi Pekerjaan</h5>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{job.description}</p>
              </div>
              <div>
                <h5 style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: '900' }}>Persyaratan</h5>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{job.requirements}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
              <button className="btn-hover" onClick={() => handleEditClick(job)} style={compactButton(styles, 'neutral', { flex: 1 })}><Edit size={14} /> Edit</button>
              <button className="btn-hover" onClick={() => handleDeleteVacancy(job.id)} style={compactButton(styles, 'danger', { flex: 1 })}><Trash2 size={14} /> Hapus</button>
            </div>
          </div>
        ))}
      </div>

      {vacancies.length > 0 && (
        <PaginationControls
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          isMobile={isMobile}
          itemLabel="lowongan"
        />
      )}

      <div style={{ marginTop: '18px' }}>
        <GuidancePanel
          title="Panduan Kelola Lowongan"
          description="Pastikan lowongan mudah dipahami mahasiswa sebelum dipublikasikan."
          icon={FileEdit}
          items={[
            'Isi posisi, perusahaan, deskripsi, persyaratan, dan tanggal akhir dengan jelas.',
            'Gunakan link apply eksternal hanya jika mahasiswa memang harus mendaftar di luar sistem.',
            'Edit lowongan saat ada perubahan informasi, dan hapus lowongan yang sudah tidak relevan.',
          ]}
        />
      </div>
    </div>
  );
}

export default LowonganTab;
