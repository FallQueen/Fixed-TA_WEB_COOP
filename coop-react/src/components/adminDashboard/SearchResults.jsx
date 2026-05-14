import { Edit, Eye, Search } from 'lucide-react';
import { stemRed, stemRedDark } from '../../styles/adminstyles';

function SearchResults({
  styles,
  isMobile,
  searchQuery,
  totalResults,
  searchResults,
  students,
  setSearchQuery,
  setActiveTab,
  handleEditClick,
  openDetailModal,
}) {
  return (
    <div>
      <div style={styles.headerCard}>
        <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', color: stemRed, fontWeight: '700' }}>Hasil Pencarian: "{searchQuery}"</h1>
        <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Ditemukan {totalResults} hasil pencarian dari seluruh modul.</p>
      </div>

      {totalResults === 0 && (
        <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
          <Search size={40} color="#cbd5e1" style={{ marginBottom: '10px' }} />
          <h3 style={{ color: '#64748b' }}>Tidak ada data yang cocok dengan pencarianmu.</h3>
        </div>
      )}

      {searchResults.pending.length > 0 && (
        <div style={{ ...styles.card, marginBottom: '20px', borderLeft: `4px solid ${stemRed}` }}>
          <h3 style={{ color: stemRed, marginTop: 0 }}>Pendaftar Menunggu Persetujuan</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {searchResults.pending.map((user) => (
              <li key={user.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: isMobile ? '10px' : '0' }}>
                <span><strong style={{ color: '#334155' }}>{user.first_name} {user.last_name}</strong> ({user.nim}) - {user.program_studi}</span>
                <button className="btn-hover" onClick={() => { setSearchQuery(''); setActiveTab('approval'); }} style={styles.btnAction}><Eye size={14} /> Lihat di Approval</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchResults.activeStudents.length > 0 && (
        <div style={{ ...styles.card, marginBottom: '20px', borderLeft: '4px solid #0ea5e9' }}>
          <h3 style={{ color: '#0ea5e9', marginTop: 0 }}>Status Mahasiswa Aktif</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {searchResults.activeStudents.map((student) => (
              <li key={student.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <strong style={{ color: '#334155' }}>{student.first_name} {student.last_name}</strong> ({student.nim}) - {student.program_studi}
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchResults.jobs.length > 0 && (
        <div style={{ ...styles.card, marginBottom: '20px', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ color: '#10b981', marginTop: 0 }}>Lowongan Magang</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {searchResults.jobs.map((job) => (
              <li key={job.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: isMobile ? '10px' : '0' }}>
                <span><strong style={{ color: '#334155' }}>{job.title}</strong> di {job.company_name}</span>
                <button className="btn-hover" onClick={() => { setSearchQuery(''); setActiveTab('lowongan'); handleEditClick(job); }} style={{ ...styles.btnAction, backgroundColor: stemRedDark }}><Edit size={14} /> Edit Info</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchResults.placements.length > 0 && (
        <div style={{ ...styles.card, marginBottom: '20px', borderLeft: `4px solid ${stemRed}` }}>
          <h3 style={{ color: stemRed, marginTop: 0 }}>Data Magang & Berkas</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {searchResults.placements.map((placement) => {
              const student = students.find((item) => item.id === placement.student);
              return (
                <li key={placement.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '10px' : '0' }}>
                  <span><strong style={{ color: '#334155' }}>{student?.first_name} {student?.last_name}</strong> - Magang di {placement.company_name}</span>
                  <button className="btn-hover" onClick={() => openDetailModal(placement, student)} style={{ ...styles.btnPrimary, padding: '8px 16px' }}><Eye size={14} /> Buka Berkas</button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchResults;
