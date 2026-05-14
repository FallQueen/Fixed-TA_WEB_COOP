import { Building2, Download, Mail, Phone } from 'lucide-react';
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
import usePagedData from './usePagedData';

function IndustriTab({ styles, isMobile, industries, handleExportIndustries }) {
  const {
    page,
    pageSize,
    pagedItems: pagedIndustries,
    setPage,
    totalItems,
    totalPages,
  } = usePagedData(industries);
  const metrics = [
    { icon: Building2, label: 'Mitra Terdaftar', value: industries.length, tint: '#eef2ff', color: '#4f46e5' },
    { icon: Mail, label: 'Email Tersimpan', value: industries.filter((item) => item.supervisor_email).length, tint: '#ecfdf5', color: '#10b981' },
    { icon: Phone, label: 'Kontak Telepon', value: industries.filter((item) => item.supervisor_phone).length, tint: '#fff7ed', color: '#f97316' },
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
            <h2 style={tabTitle(isMobile)}>Data Mitra Industri</h2>
            <p style={tabSubtitle}>Daftar perusahaan dan supervisor yang muncul dari laporan tempat magang mahasiswa.</p>
          </div>

          <div style={toolbar(isMobile)}>
            <button className="btn-hover" onClick={handleExportIndustries} style={compactButton(styles, 'green', { height: '42px', width: isMobile ? '100%' : 'auto' })}>
              <Download size={15} /> Export Data Mitra
            </button>
          </div>
        </div>

        <div style={tableShell}>
          <table style={{ ...styles.table, marginTop: 0 }}>
            <thead>
              <tr>
                <th style={{ ...styles.th, borderTopLeftRadius: '16px' }}>Nama Perusahaan</th>
                <th style={styles.th}>Nama Supervisor</th>
                <th style={styles.th}>Email Supervisor</th>
                <th style={{ ...styles.th, borderTopRightRadius: '16px' }}>No. HP / Telp</th>
              </tr>
            </thead>
            <tbody>
              {industries.length > 0 ? (
                pagedIndustries.map((item, index) => (
                  <tr key={index} style={styles.tr}>
                    <td style={styles.td}>
                      <strong style={{ color: '#111827', fontSize: '13px' }}>{item.company_name}</strong>
                    </td>
                    <td style={styles.td}>{item.supervisor_name || '-'}</td>
                    <td style={styles.td}>
                      {item.supervisor_email ? (
                        <a href={`mailto:${item.supervisor_email}`} style={{ color: '#1d4ed8', textDecoration: 'none', fontWeight: '800' }}>
                          {item.supervisor_email}
                        </a>
                      ) : '-'}
                    </td>
                    <td style={styles.td}>
                      <span style={badge(item.supervisor_phone ? 'success' : 'neutral')}>{item.supervisor_phone || '-'}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={emptyState}>
                    Belum ada data perusahaan mitra. Data akan muncul saat mahasiswa melaporkan tempat magang.
                  </td>
                </tr>
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
          itemLabel="mitra"
        />
      </div>

      <div style={{ marginTop: '18px' }}>
        <GuidancePanel
          title="Panduan Data Mitra"
          description="Data mitra membantu admin menjaga kontak perusahaan tetap mudah ditelusuri."
          icon={Building2}
          items={[
            'Gunakan search untuk menemukan perusahaan, supervisor, email, atau nomor telepon tertentu.',
            'Periksa email dan nomor telepon supervisor sebelum mengirim komunikasi resmi.',
            'Export data mitra saat membutuhkan rekap kontak untuk koordinasi eksternal.',
          ]}
        />
      </div>
    </div>
  );
}

export default IndustriTab;
