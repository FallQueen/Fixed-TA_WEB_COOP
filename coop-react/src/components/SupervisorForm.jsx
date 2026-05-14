import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../api/config';

function SupervisorForm() {
  const { id } = useParams(); // Mengambil ID dari URL
  const navigate = useNavigate();
  
  const [evalData, setEvalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ score: '', feedback: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Tarik data evaluasi berdasarkan ID di URL
    const fetchEval = async () => {
      try {
        const response = await axios.get(buildApiUrl(`/evaluations/${id}/`));
        setEvalData(response.data);
      } catch {
        alert('Data evaluasi tidak ditemukan atau link tidak valid.');
      } finally {
        setLoading(false);
      }
    };
    fetchEval();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await axios.patch(buildApiUrl(`/evaluations/${id}/`), {
        is_filled: true,
        score: formData.score,
        feedback: formData.feedback
      });
      alert('Terima kasih! Evaluasi berhasil dikirim ke Unit Co-op Prasetiya Mulya. ✅');
      navigate('/login'); // Arahkan keluar setelah selesai
    } catch {
      alert('Gagal mengirim evaluasi. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Memuat form evaluasi...</div>;
  if (!evalData) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Link evaluasi tidak valid.</div>;
  if (evalData.is_filled) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'green', fontWeight: 'bold' }}>Evaluasi ini sudah Anda isi sebelumnya. Terima kasih!</div>;

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Form Evaluasi Mahasiswa (Co-op)</h2>
          <p style={styles.subtitle}>Prasetiya Mulya University</p>
        </div>

        {/* --- INI BAGIAN INFO BOX YANG DIPERBARUI --- */}
        <div style={styles.infoBox}>
          <p style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
            <strong>Nama Mahasiswa: {evalData.placement.student.first_name} {evalData.placement.student.last_name}</strong> <br/>
            <span style={{ fontSize: '13px', color: '#666' }}>NIM: {evalData.placement.student.nim} | Prodi: {evalData.placement.student.program_studi}</span>
          </p>
          <hr style={{ borderTop: '1px dashed #ccc', margin: '10px 0' }} />
          <p style={{ margin: '0 0 5px 0' }}><strong>Perusahaan:</strong> {evalData.placement.company_name}</p>
          <p style={{ margin: '0 0 10px 0' }}><strong>Jenis Evaluasi:</strong> Laporan {evalData.eval_type}</p>
          
          <p style={{ margin: 0, color: '#800000', fontWeight: 'bold' }}>
            Mohon berikan penilaian objektif terkait kinerja mahasiswa selama magang.
          </p>
        </div>
        {/* ------------------------------------------- */}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nilai Kinerja (0 - 100)</label>
            <input 
              type="number" 
              min="0" max="100" 
              value={formData.score} 
              onChange={(e) => setFormData({...formData, score: e.target.value})} 
              required 
              style={styles.input}
              placeholder="Contoh: 85"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Komentar / Feedback (Opsional)</label>
            <textarea 
              rows="4"
              value={formData.feedback} 
              onChange={(e) => setFormData({...formData, feedback: e.target.value})} 
              style={styles.input}
              placeholder="Berikan masukan untuk mahasiswa..."
            />
          </div>

          <button type="submit" disabled={submitting} style={styles.button}>
            {submitting ? 'Mengirim Data...' : 'Kirim Penilaian'}
          </button>
        </form>
      </div>
    </div>
  );
}

// === STYLING ===
const styles = {
  pageWrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F6F9', fontFamily: '"Inter", sans-serif', padding: '20px' },
  card: { background: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '500px', borderTop: '6px solid #800000' },
  header: { textAlign: 'center', marginBottom: '20px' },
  title: { margin: '0 0 8px 0', color: '#800000', fontSize: '24px', fontWeight: 'bold' },
  subtitle: { margin: 0, color: '#6c757d', fontSize: '14px' },
  infoBox: { backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '25px', fontSize: '14px', color: '#444', borderLeft: '4px solid #003366' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#333' },
  input: { padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  button: { padding: '15px', backgroundColor: '#800000', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }
};

export default SupervisorForm;
