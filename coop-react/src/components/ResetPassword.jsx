import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { buildApiUrl, buildLocalDirectApiUrl } from '../api/config';

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

const getResetErrorMessage = (error) => {
  const data = error.response?.data || {};
  const serverMessage = data.detail
    || data.error
    || data.new_password?.[0]
    || data.confirm_password?.[0];

  if (serverMessage) {
    return serverMessage;
  }

  if (error.message) {
    return error.message;
  }

  return 'Password belum berhasil diperbarui. Silakan coba lagi.';
};

function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!uid || !token) {
      setErrorMsg('Link reset password tidak lengkap.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('Password baru minimal 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password baru belum cocok.');
      return;
    }

    setLoading(true);

    try {
      const response = await postWithLocalApiFallback('/auth/password-reset/confirm/', {
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setNewPassword('');
      setConfirmPassword('');
      setSuccessMsg(response.data?.detail || 'Password berhasil diperbarui.');
    } catch (error) {
      setErrorMsg(getResetErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <style>
        {`
          .reset-input:focus { border-color: #003366 !important; box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1) !important; outline: none; }
          .reset-btn:hover { background-color: #002244 !important; transform: translateY(-1px); box-shadow: 0 6px 15px rgba(0, 51, 102, 0.3) !important; }
        `}
      </style>

      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Buat Password Baru</h2>
          <p style={styles.subtitle}>Portal Co-op Prasetiya Mulya</p>
        </div>

        {errorMsg && <div style={styles.errorBox}>! {errorMsg}</div>}
        {successMsg && (
          <div style={styles.successBox}>
            {successMsg}
            <button type="button" onClick={() => navigate('/login')} style={styles.successButton}>
              Ke Halaman Login
            </button>
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password Baru</label>
              <input
                type="password"
                placeholder="Minimal 8 karakter"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                className="reset-input"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Konfirmasi Password Baru</label>
              <input
                type="password"
                placeholder="Ketik ulang password baru"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="reset-input"
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} className="reset-btn" style={{ ...styles.button, opacity: loading ? 0.75 : 1 }}>
              {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        )}

        <p style={styles.footerText}>
          Sudah ingat password? <Link to="/login" style={styles.link}>Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'clamp(16px, 5vw, 20px)',
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.58), rgba(0, 0, 0, 0.58)), url('/bg-kampus.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  card: {
    background: '#ffffff',
    padding: 'clamp(24px, 6vw, 40px) clamp(18px, 5vw, 35px)',
    borderRadius: '12px',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: '430px',
    borderTop: '6px solid #003366',
  },
  header: { textAlign: 'center', marginBottom: '28px' },
  title: { margin: '0 0 8px 0', color: '#003366', fontSize: 'clamp(23px, 7vw, 27px)', lineHeight: 1.2, fontWeight: '800' },
  subtitle: { margin: 0, color: '#6c757d', fontSize: '15px' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#495057' },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #ced4da',
    fontSize: '16px',
    backgroundColor: '#f8f9fa',
    transition: 'all 0.2s ease-in-out',
    width: '100%',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#003366',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '800',
    marginTop: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '18px',
    fontSize: '14px',
    border: '1px solid #f5c6cb',
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '14px 16px',
    borderRadius: '8px',
    marginBottom: '18px',
    fontSize: '14px',
    border: '1px solid #bbf7d0',
    lineHeight: 1.5,
  },
  successButton: {
    width: '100%',
    marginTop: '14px',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#166534',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
  },
  footerText: { textAlign: 'center', margin: '24px 0 0', fontSize: '14px', color: '#6c757d' },
  link: { color: '#003366', fontWeight: '700', textDecoration: 'none' },
};

export default ResetPassword;
