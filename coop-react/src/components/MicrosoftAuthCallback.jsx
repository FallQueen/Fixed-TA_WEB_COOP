import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../api/config';

function MicrosoftAuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Menyelesaikan login Microsoft...');

  useEffect(() => {
    const completeLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const error = params.get('error');

      if (error) {
        navigate(`/login?microsoft_error=${encodeURIComponent(error)}`, { replace: true });
        return;
      }

      if (!token) {
        navigate('/login?microsoft_error=Token%20Microsoft%20SSO%20tidak%20ditemukan.', { replace: true });
        return;
      }

      localStorage.setItem('token', token);
      window.history.replaceState(null, '', '/auth/microsoft/callback');

      try {
        const userRes = await axios.get(buildApiUrl('/users/me/'), {
          headers: { Authorization: `Token ${token}` },
        });

        navigate(userRes.data.is_staff ? '/admin-dashboard' : '/dashboard', { replace: true });
      } catch {
        localStorage.removeItem('token');
        navigate('/login?microsoft_error=Login%20Microsoft%20berhasil,%20tapi%20gagal%20mengambil%20profil%20user.', { replace: true });
      }
    };

    completeLogin();
  }, [navigate]);

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Portal Co-op</h2>
        <p style={styles.subtitle}>{message}</p>
        <button
          type="button"
          onClick={() => setMessage('Mohon tunggu, sistem sedang memverifikasi sesi...')}
          style={styles.button}
        >
          Memproses
        </button>
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
    padding: '20px',
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    backgroundColor: '#f3f6f9',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '32px',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    boxShadow: '0 15px 35px rgba(15, 23, 42, 0.12)',
    textAlign: 'center',
    borderTop: '6px solid #003366',
  },
  title: { margin: '0 0 8px 0', color: '#003366', fontSize: '26px', fontWeight: '800' },
  subtitle: { margin: 0, color: '#475569', fontSize: '14px', lineHeight: 1.6 },
  button: {
    marginTop: '22px',
    padding: '12px 18px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#e2e8f0',
    color: '#334155',
    fontWeight: '700',
    cursor: 'default',
  },
};

export default MicrosoftAuthCallback;
