import { useEffect, useRef } from 'react';
import {
  Bell,
  Briefcase,
  Building2,
  CalendarClock,
  Edit,
  ExternalLink,
  FileEdit,
  Link2,
  Mail,
  Phone,
  Send,
  Trash2,
  UserRound,
} from 'lucide-react';
import { ADMIN_COOP_CONTACT } from '../constants';
import {
  actionButtonGroup,
  actionIconButton,
  adminColors,
  badge,
  compactButton,
  emptyState,
  innerPanel,
  metricTone,
  metricCard,
  metricGrid,
  tabPageHeader,
  tabSubtitle,
  tabTitle,
} from './sharedTabStyles';
import GuidancePanel from './GuidancePanel';
import PaginationControls from './PaginationControls';
import usePagedData from './usePagedData';

const DAY_MS = 24 * 60 * 60 * 1000;

const parseDateOnly = (value) => {
  if (!value) return null;
  const [year, month, day] = String(value).split('T')[0].split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (value) => (
  parseDateOnly(value)?.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) || '-'
);

const getVacancyContact = (job) => {
  const hasCustomContact = Boolean(job.supervisor_name || job.supervisor_email || job.supervisor_phone);

  return {
    hasCustomContact,
    name: job.supervisor_name || ADMIN_COOP_CONTACT.name,
    email: job.supervisor_email || ADMIN_COOP_CONTACT.email,
    phone: job.supervisor_phone || ADMIN_COOP_CONTACT.phone,
  };
};

const fieldWrap = {
  display: 'grid',
  gap: '7px',
};

const inputStyle = (styles, backgroundColor = '#ffffff') => ({
  ...styles.modernInput,
  backgroundColor,
  minHeight: '44px',
});

const sectionPanel = {
  backgroundColor: '#ffffff',
  border: `1px solid ${adminColors.border}`,
  borderRadius: '14px',
  padding: '16px',
  boxShadow: '0 12px 26px rgba(15, 23, 42, 0.045)',
};

const sectionHeader = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  paddingBottom: '14px',
  marginBottom: '14px',
  borderBottom: `1px solid ${adminColors.borderSoft}`,
};

const sectionIcon = (tone = 'primary') => {
  const tones = {
    primary: { bg: '#fff1f2', color: '#b31312', border: '#fecaca' },
    info: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    success: { bg: '#ecfdf5', color: '#047857', border: '#bbf7d0' },
  };
  const selectedTone = tones[tone] || tones.primary;

  return {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    backgroundColor: selectedTone.bg,
    color: selectedTone.color,
    border: `1px solid ${selectedTone.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };
};

const helperText = {
  margin: '6px 0 0',
  fontSize: '11px',
  color: adminColors.textSubtle,
  fontWeight: '700',
  lineHeight: 1.5,
};

const twoColumnGrid = (isMobile) => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
  gap: '14px',
});

const formLayout = (isMobile) => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.3fr) minmax(320px, 0.75fr)',
  gap: '16px',
  alignItems: 'start',
});

const infoLine = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: 0,
  color: adminColors.textMuted,
  fontSize: '11px',
  fontWeight: '800',
  lineHeight: 1.45,
};

const contactInlineAction = {
  width: '28px',
  height: '28px',
  borderRadius: '9px',
  border: '1px solid #e8eef7',
  backgroundColor: '#ffffff',
  color: '#64748b',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  textDecoration: 'none',
};

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
  const formSectionRef = useRef(null);
  const listSectionRef = useRef(null);
  const today = parseDateOnly(formatDateInput(new Date()));
  const todayInput = formatDateInput(today);
  const withExternalLink = vacancies.filter((job) => job.external_apply_link).length;
  const withSupervisorContact = vacancies.filter((job) => (
    job.supervisor_name || job.supervisor_email || job.supervisor_phone
  )).length;
  const expiringSoon = vacancies.filter((job) => {
    const expiryDate = parseDateOnly(job.expires_at);
    if (!expiryDate) return false;
    const diffDays = Math.round((expiryDate - today) / DAY_MS);
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
    { icon: Briefcase, label: 'Lowongan Aktif', value: vacancies.length, ...metricTone('info') },
    { icon: Link2, label: 'Link Eksternal', value: withExternalLink, ...metricTone('success') },
    { icon: UserRound, label: 'Kontak Terisi', value: withSupervisorContact, ...metricTone('success') },
    { icon: CalendarClock, label: 'Akan Berakhir', value: expiringSoon, ...metricTone('warning') },
  ];

  useEffect(() => {
    if (!editingVacancyId) return;

    window.requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [editingVacancyId]);

  useEffect(() => {
    const scrollToVacancyList = () => {
      window.setTimeout(() => {
        listSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    };

    window.addEventListener('admin-vacancy-saved', scrollToVacancyList);
    return () => window.removeEventListener('admin-vacancy-saved', scrollToVacancyList);
  }, []);

  return (
    <div>
      <div style={metricGrid(isMobile, 4)}>
        {metrics.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} style={{ ...metricCard, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                  {item.label}
                </div>
                <div style={{ width: '34px', height: '34px', borderRadius: '12px', backgroundColor: item.tint, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} />
                </div>
              </div>
              <div style={{ marginTop: '18px', color: '#111827', fontSize: '30px', lineHeight: 1, fontWeight: '900' }}>{item.value}</div>
            </div>
          );
        })}
      </div>

      <div ref={formSectionRef} style={styles.card}>
        <div style={tabPageHeader(isMobile)}>
          <div>
            <h2 style={tabTitle(isMobile)}>{editingVacancyId ? 'Edit Lowongan' : 'Kelola Lowongan'}</h2>
            <p style={tabSubtitle}>
              {editingVacancyId ? 'Perbarui informasi lowongan yang sudah dipublikasikan.' : 'Posting peluang magang baru dengan informasi kontak yang jelas untuk mahasiswa.'}
            </p>
          </div>
          {editingVacancyId && (
            <button type="button" className="btn-hover" onClick={handleCancelEdit} style={compactButton(styles, 'slate', { width: isMobile ? '100%' : 'auto' })}>
              Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={handleVacancySubmit} style={{ ...innerPanel, padding: isMobile ? '14px' : '18px' }}>
          <div style={formLayout(isMobile)}>
            <div style={sectionPanel}>
              <div style={sectionHeader}>
                <div style={sectionIcon('primary')}>
                  <FileEdit size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: adminColors.text, fontSize: '15px', fontWeight: '900' }}>Informasi Lowongan</h3>
                  <p style={{ ...tabSubtitle, marginTop: '4px' }}>Isi detail yang akan dibaca mahasiswa sebelum apply.</p>
                </div>
              </div>

              <div style={twoColumnGrid(isMobile)}>
                <div style={fieldWrap}>
                  <label style={styles.labelStyle}>Posisi Pekerjaan</label>
                  <input type="text" name="title" required onChange={handleVacancyChange} value={vacancyForm.title} className="input-focus" style={inputStyle(styles)} placeholder="Misal: Data Scientist Intern" />
                </div>
                <div style={fieldWrap}>
                  <label style={styles.labelStyle}>Nama Perusahaan</label>
                  <input type="text" name="company_name" required onChange={handleVacancyChange} value={vacancyForm.company_name} className="input-focus" style={inputStyle(styles)} placeholder="Misal: Tokopedia" />
                </div>
              </div>

              <div style={{ ...twoColumnGrid(isMobile), marginTop: '14px' }}>
                <div style={fieldWrap}>
                  <label style={styles.labelStyle}>Batas Akhir Opsional</label>
                  <input type="date" name="expires_at" min={todayInput} onChange={handleVacancyChange} value={vacancyForm.expires_at} className="input-focus" style={inputStyle(styles)} />
                  <p style={helperText}>Kosongkan jika lowongan ingin tetap aktif sampai admin menghapusnya.</p>
                </div>
                <div style={fieldWrap}>
                  <label style={styles.labelStyle}>Link Apply Eksternal</label>
                  <input type="url" name="external_apply_link" onChange={handleVacancyChange} value={vacancyForm.external_apply_link} className="input-focus" style={inputStyle(styles)} placeholder="Misal: https://jobstreet.co.id/..." />
                  <p style={helperText}>Kosongkan jika mahasiswa apply langsung dari sistem Co-op.</p>
                </div>
              </div>

              <div style={{ ...fieldWrap, marginTop: '14px' }}>
                <label style={styles.labelStyle}>Deskripsi Pekerjaan</label>
                <textarea name="description" rows="4" required onChange={handleVacancyChange} value={vacancyForm.description} className="input-focus" style={{ ...inputStyle(styles), resize: 'vertical', lineHeight: 1.55 }} placeholder="Jelaskan lingkup kerja, output, dan aktivitas utama..." />
              </div>

              <div style={{ ...fieldWrap, marginTop: '14px' }}>
                <label style={styles.labelStyle}>Persyaratan Khusus</label>
                <textarea name="requirements" rows="4" required onChange={handleVacancyChange} value={vacancyForm.requirements} className="input-focus" style={{ ...inputStyle(styles), resize: 'vertical', lineHeight: 1.55 }} placeholder="Kualifikasi akademik, skill teknis, dokumen, atau ketentuan lain..." />
              </div>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div style={sectionPanel}>
                <div style={sectionHeader}>
                  <div style={sectionIcon('info')}>
                    <UserRound size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: adminColors.text, fontSize: '15px', fontWeight: '900' }}>Kontak Supervisor / HRD</h3>
                    <p style={{ ...tabSubtitle, marginTop: '4px' }}>Kontak ini tampil ke mahasiswa pada detail lowongan.</p>
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc', border: `1px solid ${adminColors.borderSoft}`, marginBottom: '14px' }}>
                  <div style={{ color: adminColors.text, fontSize: '12px', fontWeight: '900' }}>Fallback Admin Co-op</div>
                  <div style={{ ...infoLine, marginTop: '7px', overflowWrap: 'anywhere' }}>
                    <Mail size={13} /> {ADMIN_COOP_CONTACT.email}
                  </div>
                  <div style={{ ...infoLine, marginTop: '5px' }}>
                    <Phone size={13} /> {ADMIN_COOP_CONTACT.phone}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={fieldWrap}>
                    <label style={styles.labelStyle}>Nama Supervisor / HRD</label>
                    <input type="text" name="supervisor_name" onChange={handleVacancyChange} value={vacancyForm.supervisor_name} className="input-focus" style={inputStyle(styles, '#f8fafc')} placeholder={ADMIN_COOP_CONTACT.name} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={styles.labelStyle}>Email Supervisor / HRD</label>
                    <input type="email" name="supervisor_email" onChange={handleVacancyChange} value={vacancyForm.supervisor_email} className="input-focus" style={inputStyle(styles, '#f8fafc')} placeholder={ADMIN_COOP_CONTACT.email} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={styles.labelStyle}>No. WhatsApp / Kontak</label>
                    <input type="text" name="supervisor_phone" onChange={handleVacancyChange} value={vacancyForm.supervisor_phone} className="input-focus" style={inputStyle(styles, '#f8fafc')} placeholder={ADMIN_COOP_CONTACT.phone} />
                  </div>
                </div>
              </div>

              {!editingVacancyId && (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '15px',
                    backgroundColor: vacancyForm.notify_job_seekers ? '#fff1f2' : '#ffffff',
                    border: `1px solid ${vacancyForm.notify_job_seekers ? '#fecaca' : adminColors.border}`,
                    borderRadius: '14px',
                    cursor: 'pointer',
                    boxShadow: vacancyForm.notify_job_seekers ? '0 12px 24px rgba(179, 19, 18, 0.08)' : '0 10px 22px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <input
                    type="checkbox"
                    name="notify_job_seekers"
                    checked={Boolean(vacancyForm.notify_job_seekers)}
                    onChange={handleVacancyChange}
                    className="custom-checkbox"
                    style={{ flexShrink: 0, marginTop: '9px' }}
                  />
                  <div style={{ width: '36px', height: '36px', borderRadius: '12px', backgroundColor: '#ffffff', color: '#b31312', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fecaca', flexShrink: 0 }}>
                    <Bell size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: adminColors.text, fontSize: '12px', fontWeight: '900' }}>Kirim notifikasi Outlook</div>
                    <div style={{ marginTop: '4px', color: adminColors.textMuted, fontSize: '11px', fontWeight: '700', lineHeight: 1.5 }}>
                      Email dikirim ke mahasiswa aktif yang belum punya tempat magang terverifikasi.
                    </div>
                  </div>
                </label>
              )}

              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={submittingVacancy} className="btn-hover" style={compactButton(styles, 'primary', { padding: '12px 24px', width: isMobile ? '100%' : 'auto', minHeight: '44px' })}>
                  {submittingVacancy ? (
                    'Menyimpan...'
                  ) : editingVacancyId ? (
                    <>
                      <Edit size={15} /> Simpan Perubahan
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Posting Lowongan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div ref={listSectionRef} style={tabPageHeader(isMobile)}>
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
        ) : pagedVacancies.map((job) => {
          const contact = getVacancyContact(job);

          return (
            <div key={job.id} className="job-card" style={{ backgroundColor: '#ffffff', border: '1px solid #e8eef7', borderRadius: '14px', boxShadow: '0 14px 34px rgba(15, 23, 42, 0.06)', padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '330px', transition: 'all 0.2s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '18px', fontWeight: '900' }}>{job.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#64748b', fontSize: '12px', fontWeight: '800' }}>
                    <Building2 size={15} /> {job.company_name}
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: 0, maxWidth: '100%', color: '#475569', fontSize: '11px', fontWeight: '900', lineHeight: 1.35 }}>
                      <UserRound size={13} style={{ flexShrink: 0, color: '#94a3b8' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {contact.name}
                      </span>
                    </span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#cbd5e1', flexShrink: 0 }} />
                    <span style={{ color: contact.hasCustomContact ? '#047857' : '#64748b', backgroundColor: contact.hasCustomContact ? '#ecfdf5' : '#f8fafc', border: `1px solid ${contact.hasCustomContact ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: '999px', padding: '4px 8px', fontSize: '10px', fontWeight: '900', lineHeight: 1 }}>
                      {contact.hasCustomContact ? 'Kontak Perusahaan' : 'Kontak Admin'}
                    </span>
                  </div>
                </div>
                {job.expires_at && (
                  <span style={badge('warning')}>Exp: {formatDisplayDate(job.expires_at)}</span>
                )}
              </div>

              {job.external_apply_link && (
                <a href={job.external_apply_link} target="_blank" rel="noopener noreferrer" className="btn-hover" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '12px', color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '8px 12px', borderRadius: '10px', textDecoration: 'none', fontWeight: '900', width: 'fit-content', border: '1px solid #bfdbfe' }}>
                  <ExternalLink size={14} /> Apply via Link Eksternal
                </a>
              )}

              <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 10px', borderRadius: '11px', backgroundColor: '#f8fafc', border: '1px solid #eef2f7', minWidth: 0 }}>
                <Mail size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
                <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>
                  {contact.email}
                </span>
                <a href={`mailto:${contact.email}`} className="btn-hover" title="Kirim email" aria-label={`Kirim email ke ${contact.email}`} style={contactInlineAction}>
                  <Mail size={13} />
                </a>
                <a href={`tel:${contact.phone}`} className="btn-hover" title="Hubungi nomor" aria-label={`Hubungi ${contact.phone}`} style={contactInlineAction}>
                  <Phone size={13} />
                </a>
              </div>

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

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                <div style={actionButtonGroup(isMobile)}>
                  <button
                    className="btn-hover"
                    onClick={() => handleEditClick(job)}
                    style={actionIconButton('neutral')}
                    title="Edit lowongan"
                    aria-label={`Edit lowongan ${job.title}`}
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    className="btn-hover"
                    onClick={() => handleDeleteVacancy(job.id)}
                    style={actionIconButton('danger')}
                    title="Hapus lowongan"
                    aria-label={`Hapus lowongan ${job.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
            'Lengkapi kontak supervisor atau HRD agar mahasiswa tahu tujuan komunikasi saat apply.',
          ]}
        />
      </div>
    </div>
  );
}

export default LowonganTab;
