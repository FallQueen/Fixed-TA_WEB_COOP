import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { buildApiUrl, buildDirectApiUrl } from '../api/config';
import { PROGRAM_STUDI_OPTIONS } from '../constants/programStudi';

const REQUIRED_DOCUMENTS = [
  { key: 'bukti_konsul_file', label: 'Bukti Konsul' },
  { key: 'sptjm_file', label: 'SPTJM' },
];

const isPdfFile = (file) => (
  file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf')
);

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [microsoftRegistrationToken, setMicrosoftRegistrationToken] = useState('');
  
  // --- STATE BARU UNTUK MENGUBAH TAMPILAN SETELAH SUKSES DAFTAR ---
  const [isRegistered, setIsRegistered] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', password: '', 
    nim: '', program_studi: '', angkatan: '', gender: '', phone_number: ''
  });
  const [files, setFiles] = useState({ bukti_konsul_file: null, sptjm_file: null });
  const isMicrosoftVerified = Boolean(microsoftRegistrationToken);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const microsoftError = params.get('microsoft_error');
    const registrationToken = params.get('microsoft_registration_token');

    if (microsoftError) {
      setErrorMsg(microsoftError);
      window.history.replaceState(null, '', '/register');
      return;
    }

    if (registrationToken) {
      setMicrosoftRegistrationToken(registrationToken);
      setFormData((currentForm) => ({
        ...currentForm,
        email: params.get('email') || currentForm.email,
        first_name: params.get('first_name') || currentForm.first_name,
        last_name: params.get('last_name') || currentForm.last_name,
      }));
      window.history.replaceState(null, '', '/register');
    }
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files?.[0] || null });
  };

  const handleMicrosoftRegister = () => {
    window.location.assign(buildDirectApiUrl('/auth/microsoft/login/?flow=register'));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const missingDocuments = REQUIRED_DOCUMENTS.filter(({ key }) => !files[key]);
    if (missingDocuments.length > 0) {
      setErrorMsg(`Mohon unggah ${missingDocuments.map(({ label }) => label).join(' dan ')} dalam format PDF sebelum daftar.`);
      return;
    }

    const invalidDocuments = REQUIRED_DOCUMENTS.filter(({ key }) => !isPdfFile(files[key]));
    if (invalidDocuments.length > 0) {
      setErrorMsg(`${invalidDocuments.map(({ label }) => label).join(' dan ')} wajib berupa file PDF.`);
      return;
    }

    setLoading(true);

    const submitData = new FormData();
    for (const key in formData) { submitData.append(key, formData[key]); }
    if (microsoftRegistrationToken) {
      submitData.append('microsoft_registration_token', microsoftRegistrationToken);
    }
    REQUIRED_DOCUMENTS.forEach(({ key }) => submitData.append(key, files[key]));

    try {
      await axios.post(buildApiUrl('/register/'), submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsRegistered(true);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || 'Gagal melakukan registrasi. Cek kembali data Anda.');
    } finally {
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
        
        {/* LOGIKA TAMPILAN: Jika sudah terdaftar, tampilkan pesan sukses. Jika belum, tampilkan form. */}
        {isRegistered ? (
          
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ fontSize: '60px', marginBottom: '15px' }}>🎉</div>
            <h2 style={{ color: '#003366', margin: '0 0 15px 0', fontSize: '28px', fontWeight: '800' }}>
              Terima Kasih Telah Mendaftar!
            </h2>
            <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px', padding: '0 20px' }}>
              Data pendaftaran Anda telah berhasil dikirim. Akun Anda saat ini berstatus <strong>"Menunggu Persetujuan"</strong>. 
              Admin akan segera melakukan verifikasi terhadap berkas yang telah Anda unggah. 
              <br/><br/>
              Silakan periksa kembali secara berkala dengan melakukan login.
            </p>
            <button 
              onClick={() => navigate('/login')} 
              style={{ ...styles.button, backgroundColor: '#003366', maxWidth: '300px', margin: '0 auto', display: 'block' }}
              className="custom-btn"
            >
              Kembali ke Halaman Login
            </button>
          </div>

        ) : (
          
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Pendaftaran Co-op</h2>
              <p style={styles.subtitle}>Buat akun mahasiswa baru</p>
            </div>

            {errorMsg && <div style={styles.errorBox}>! {errorMsg}</div>}

            {isMicrosoftVerified ? (
              <div style={styles.verifiedBox}>
                Email Outlook terverifikasi: <strong>{formData.email}</strong>
              </div>
            ) : (
              <>
                <button type="button" onClick={handleMicrosoftRegister} style={styles.microsoftButton}>
                  <span style={styles.microsoftLogo} aria-hidden="true">
                    <span style={{ ...styles.microsoftLogoSquare, backgroundColor: '#f25022' }} />
                    <span style={{ ...styles.microsoftLogoSquare, backgroundColor: '#7fba00' }} />
                    <span style={{ ...styles.microsoftLogoSquare, backgroundColor: '#00a4ef' }} />
                    <span style={{ ...styles.microsoftLogoSquare, backgroundColor: '#ffb900' }} />
                  </span>
                  <span>Daftar dengan Microsoft</span>
                </button>

                <div style={styles.divider}>
                  <span style={styles.dividerLine} />
                  <span style={styles.dividerText}>atau daftar manual</span>
                  <span style={styles.dividerLine} />
                </div>
              </>
            )}

            <form onSubmit={handleRegister} style={styles.form}>
              
              <div style={styles.grid2}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nama Depan</label>
                  <input type="text" name="first_name" value={formData.first_name} required onChange={handleChange} className="custom-input" style={styles.input} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nama Belakang</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="custom-input" style={styles.input} />
                </div>
              </div>

              <div style={styles.grid2}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Outlook</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    required
                    disabled={isMicrosoftVerified}
                    onChange={handleChange}
                    className="custom-input"
                    style={{ ...styles.input, ...(isMicrosoftVerified ? styles.lockedInput : {}) }}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>NIM</label>
                  <input type="text" name="nim" value={formData.nim} required onChange={handleChange} className="custom-input" style={styles.input} />
                </div>
              </div>

              <div style={styles.grid2}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Program Studi</label>
                  <select 
                    name="program_studi" 
                    value={formData.program_studi} 
                    onChange={handleChange} 
                    className="custom-input"
                    style={styles.input} 
                    required
                  >
                    <option value="">-- Pilih Program Studi --</option>
                    {PROGRAM_STUDI_OPTIONS.map((programStudi) => (
                      <option key={programStudi} value={programStudi}>
                        {programStudi}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Angkatan (Thn)</label>
                  <input type="text" name="angkatan" value={formData.angkatan} required onChange={handleChange} className="custom-input" style={styles.input} />
                </div>
              </div>

              <div style={styles.grid2}>
                 <div style={styles.inputGroup}>
                  <label style={styles.label}>No. Handphone / WA</label>
                  <input type="text" name="phone_number" value={formData.phone_number} required onChange={handleChange} className="custom-input" style={styles.input} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Jenis Kelamin</label>
                  <select 
                    name="gender" 
                    value={formData.gender}
                    onChange={handleChange} 
                    className="custom-input" 
                    style={styles.input}
                    required
                  >
                    <option value="">-- Pilih Jenis Kelamin --</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password Akun</label>
                <input type="password" name="password" value={formData.password} required onChange={handleChange} className="custom-input" style={styles.input} />
              </div>

              <hr style={{ borderTop: '1px solid #eee', margin: '10px 0' }}/>

              <div style={styles.grid2}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Bukti Konsul (PDF) <span style={styles.requiredText}>Wajib</span></label>
                  <input type="file" accept=".pdf,application/pdf" name="bukti_konsul_file" required onChange={handleFileChange} style={styles.fileInput} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>SPTJM (PDF) <span style={styles.requiredText}>Wajib</span></label>
                  <input type="file" accept=".pdf,application/pdf" name="sptjm_file" required onChange={handleFileChange} style={styles.fileInput} />
                </div>
              </div>

              <p style={styles.helperText}>
                Lengkapi kedua dokumen ini saat pendaftaran agar admin bisa langsung memverifikasi tanpa meminta ulang berkas.
              </p>

              <button type="submit" disabled={loading} className="custom-btn" style={styles.button}>
                {loading ? 'Memproses Pendaftaran...' : 'Daftar Sekarang'}
              </button>
            </form>

            <p style={styles.footerText}>
              Sudah memiliki akun? <Link to="/login" style={styles.link}>Masuk di sini</Link>
            </p>
          </>
        )}

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
    padding: '40px 20px',
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/bg-kampus.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed'
  },
  card: { background: '#ffffff', padding: '35px', borderRadius: '12px', boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)', width: '100%', maxWidth: '600px', borderTop: '6px solid #003366' },
  header: { textAlign: 'center', marginBottom: '25px' },
  title: { margin: '0 0 8px 0', color: '#003366', fontSize: '26px', fontWeight: '800' },
  subtitle: { margin: 0, color: '#6c757d', fontSize: '15px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#495057' },
  requiredText: { color: '#b31312', fontSize: '11px', fontWeight: '800', marginLeft: '4px' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '14px', backgroundColor: '#f8f9fa', transition: 'all 0.2s ease-in-out', width: '100%', boxSizing: 'border-box' },
  lockedInput: { backgroundColor: '#eaf4ff', color: '#003366', cursor: 'not-allowed', fontWeight: '700' },
  fileInput: { padding: '8px', borderRadius: '8px', border: '1px dashed #ced4da', fontSize: '12px', backgroundColor: '#f8f9fa', width: '100%', boxSizing: 'border-box' },
  helperText: { margin: '-4px 0 0', color: '#64748b', fontSize: '12px', lineHeight: '1.5' },
  button: { width: '100%', padding: '14px', backgroundColor: '#003366', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', marginTop: '10px', cursor: 'pointer', transition: 'all 0.3s ease' },
  microsoftButton: { width: '100%', padding: '13px', backgroundColor: '#ffffff', color: '#1f2937', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.06)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '18px' },
  microsoftLogo: { display: 'grid', gridTemplateColumns: 'repeat(2, 8px)', gap: '2px', width: '18px', height: '18px', flexShrink: 0 },
  microsoftLogoSquare: { width: '8px', height: '8px', display: 'block' },
  divider: { display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 20px' },
  dividerLine: { flex: 1, height: '1px', backgroundColor: '#e2e8f0' },
  dividerText: { color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' },
  verifiedBox: { backgroundColor: '#e8f5e9', color: '#1b5e20', padding: '12px 16px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', border: '1px solid #b7dfba', textAlign: 'center' },
  errorBox: { backgroundColor: '#f8d7da', color: '#721c24', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #f5c6cb', textAlign: 'center' },
  footerText: { textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#6c757d' },
  link: { color: '#003366', fontWeight: '600', textDecoration: 'none' }
};

export default Register;
