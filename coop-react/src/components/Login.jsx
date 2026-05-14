import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { buildApiUrl } from '../api/config';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await axios.post(buildApiUrl('/login/'), {
        username: email, 
        password: password
      });
      const token = response.data.token;
      localStorage.setItem('token', token);

      const userRes = await axios.get(buildApiUrl('/users/me/'), {
        headers: { Authorization: `Token ${token}` }
      });

      if (userRes.data.is_staff) {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard'); 
      }
      
    } catch (error) {
      // Cek jika error spesifik karena akun belum di-approve
      if (error.response?.data?.non_field_errors?.[0]?.includes('disabled')) {
        setErrorMsg('Akun Anda belum disetujui oleh Admin. Harap tunggu.');
      } else {
        setErrorMsg('Login Gagal! Pastikan Email dan Password benar.');
      }
    } finally {
      // <--- TAMBAHKAN 3 BARIS INI DI PALING BAWAH
      setLoading(false); 
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <style>
        {`
          .custom-input:focus { border-color: #003366 !important; box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1) !important; outline: none; }
          .custom-btn:hover { background-color: #002244 !important; transform: translateY(-1px); box-shadow: 0 6px 15px rgba(0, 51, 102, 0.3) !important; }
        `}
      </style>

      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Portal Co-op</h2>
          <p style={styles.subtitle}>Universitas Prasetiya Mulya</p>
        </div>

        {errorMsg && <div style={styles.errorBox}>⚠️ {errorMsg}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Outlook / Username</label>
            <input 
              type="text" placeholder="Masukkan email atau username" 
              value={email} onChange={(e) => setEmail(e.target.value)} 
              required className="custom-input" style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" placeholder="••••••••" 
              value={password} onChange={(e) => setPassword(e.target.value)} 
              required className="custom-input" style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} className="custom-btn" style={styles.button}>
            {loading ? 'Memeriksa...' : 'Masuk Dashboard'}
          </button>
        </form>

        <p style={styles.footerText}>
          Belum memiliki akun? <Link to="/register" style={styles.link}>Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}

// === STYLING DENGAN BACKGROUND GAMBAR ===
const styles = {
  pageWrapper: { 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '20px', 
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    // INI KODE UNTUK BACKGROUND GAMBAR + OVERLAY GELAP 60%
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/bg-kampus.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  card: { background: '#ffffff', padding: '40px 35px', borderRadius: '12px', boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)', width: '100%', maxWidth: '420px', borderTop: '6px solid #003366' },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { margin: '0 0 8px 0', color: '#003366', fontSize: '28px', fontWeight: '800' },
  subtitle: { margin: 0, color: '#6c757d', fontSize: '15px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#495057' },
  input: { padding: '12px 16px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '14px', backgroundColor: '#f8f9fa', transition: 'all 0.2s ease-in-out', width: '100%', boxSizing: 'border-box' },
  button: { width: '100%', padding: '14px', backgroundColor: '#003366', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', marginTop: '10px', cursor: 'pointer', transition: 'all 0.3s ease' },
  errorBox: { backgroundColor: '#f8d7da', color: '#721c24', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #f5c6cb', textAlign: 'center' },
  footerText: { textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#6c757d' },
  link: { color: '#003366', fontWeight: '600', textDecoration: 'none' }
};

export default Login;
