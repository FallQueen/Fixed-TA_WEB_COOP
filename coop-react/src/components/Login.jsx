import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { buildApiUrl, buildDirectApiUrl, buildLocalDirectApiUrl } from '../api/config';

const DIRECT_RETRY_STATUSES = new Set([404, 405, 502, 503, 504]);

const shouldRetryWithLocalApi = (error, fallbackUrl) => {
  const primaryUrl = error.config?.url || '';
  const status = error.response?.status;

  return primaryUrl !== fallbackUrl && (!error.response || DIRECT_RETRY_STATUSES.has(status));
};

const postWithLocalApiFallback = async (path, payload) => {
  const fallbackUrl = buildLocalDirectApiUrl(path);

  try {
    return await axios.post(buildApiUrl(path), payload);
  } catch (error) {
    if (!shouldRetryWithLocalApi(error, fallbackUrl)) {
      throw error;
    }

    return axios.post(fallbackUrl, payload);
  }
};

const getWithLocalApiFallback = async (path, config) => {
  const fallbackUrl = buildLocalDirectApiUrl(path);

  try {
    return await axios.get(buildApiUrl(path), config);
  } catch (error) {
    if (!shouldRetryWithLocalApi(error, fallbackUrl)) {
      throw error;
    }

    return axios.get(fallbackUrl, config);
  }
};

const getLoginErrorMessage = (error) => {
  const serverMessage = error.response?.data?.non_field_errors?.[0]
    || error.response?.data?.detail
    || error.response?.data?.error;

  if (serverMessage?.includes('disabled')) {
    return 'Akun Anda belum disetujui oleh Admin. Harap tunggu.';
  }

  if (serverMessage) {
    return `Login gagal: ${serverMessage}`;
  }

  if (error.message) {
    return `Login gagal: ${error.message}`;
  }

  return 'Login gagal. Pastikan backend berjalan dan email/password benar.';
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const microsoftError = params.get('microsoft_error');

    if (microsoftError) {
      setErrorMsg(microsoftError);
      window.history.replaceState(null, '', '/login');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let response = await postWithLocalApiFallback('/login/', {
        username: email.trim(),
        password: password
      });

      let token = response.data?.token;

      if (!token && buildApiUrl('/login/') !== buildLocalDirectApiUrl('/login/')) {
        response = await axios.post(buildLocalDirectApiUrl('/login/'), {
          username: email.trim(),
          password: password
        });
        token = response.data?.token;
      }

      if (!token) {
        throw new Error('Token login tidak ditemukan dari server.');
      }

      localStorage.setItem('token', token);

      const userRes = await getWithLocalApiFallback('/users/me/', {
        headers: { Authorization: `Token ${token}` }
      });

      if (userRes.data.is_staff) {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard'); 
      }
      
    } catch (error) {
      setErrorMsg(getLoginErrorMessage(error));
    } finally {
      setLoading(false); 
    }
  };

  const handleMicrosoftLogin = () => {
    window.location.assign(buildDirectApiUrl('/auth/microsoft/login/'));
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

        {errorMsg && <div style={styles.errorBox}>! {errorMsg}</div>}

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
            {loading ? 'Memeriksa...' : 'Login'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>atau</span>
          <span style={styles.dividerLine} />
        </div>

        <button type="button" onClick={handleMicrosoftLogin} style={styles.microsoftButton}>
          <span style={styles.microsoftLogo} aria-hidden="true">
            <span style={{ ...styles.microsoftLogoSquare, backgroundColor: '#f25022' }} />
            <span style={{ ...styles.microsoftLogoSquare, backgroundColor: '#7fba00' }} />
            <span style={{ ...styles.microsoftLogoSquare, backgroundColor: '#00a4ef' }} />
            <span style={{ ...styles.microsoftLogoSquare, backgroundColor: '#ffb900' }} />
          </span>
          <span>Sign in with Microsoft</span>
        </button>

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
  divider: { display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0' },
  dividerLine: { flex: 1, height: '1px', backgroundColor: '#e2e8f0' },
  dividerText: { color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' },
  microsoftButton: { width: '100%', padding: '13px', backgroundColor: '#ffffff', color: '#1f2937', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.06)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  microsoftLogo: { display: 'grid', gridTemplateColumns: 'repeat(2, 8px)', gap: '2px', width: '18px', height: '18px', flexShrink: 0 },
  microsoftLogoSquare: { width: '8px', height: '8px', display: 'block' },
  errorBox: { backgroundColor: '#f8d7da', color: '#721c24', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #f5c6cb', textAlign: 'center' },
  footerText: { textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#6c757d' },
  link: { color: '#003366', fontWeight: '600', textDecoration: 'none' }
};

export default Login;
