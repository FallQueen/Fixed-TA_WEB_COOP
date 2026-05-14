import {
  AlertCircle,
  BadgeCheck,
  CheckCircle,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Save,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import {
  badge,
  compactButton,
  innerPanel,
  tabPageHeader,
  tabSubtitle,
  tabTitle,
} from './sharedTabStyles';
import GuidancePanel from './GuidancePanel';

const iconBox = (backgroundColor, color) => ({
  width: '36px',
  height: '36px',
  borderRadius: '12px',
  backgroundColor,
  color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const sectionTitle = {
  margin: 0,
  color: '#111827',
  fontSize: '16px',
  fontWeight: '900',
};

const helperText = {
  margin: '5px 0 0',
  color: '#94a3b8',
  fontSize: '11px',
  fontWeight: '600',
  lineHeight: 1.5,
};

const cardHeader = (isMobile) => ({
  padding: '18px',
  borderBottom: '1px solid #edf2f7',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: isMobile ? 'flex-start' : 'center',
  gap: '14px',
  flexDirection: isMobile ? 'column' : 'row',
});

const fieldGrid = (isMobile) => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
  gap: '12px',
});

function PengaturanTab({
  styles,
  isMobile,
  handleUpdateProfile,
  profileForm,
  handleProfileFormChange,
  isUpdatingProfile,
  handleAdminPasswordChange,
  passwordForm,
  handlePasswordFormChange,
  isChangingPassword,
}) {
  const passwordMismatch = Boolean(passwordForm.new_password && passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password);
  const passwordMatch = Boolean(passwordForm.new_password && passwordForm.confirm_password && passwordForm.new_password === passwordForm.confirm_password);
  const passwordChecks = [
    { label: 'Minimal 8 karakter', met: passwordForm.new_password.length >= 8 },
    { label: 'Mengandung huruf besar', met: /[A-Z]/.test(passwordForm.new_password) },
    { label: 'Mengandung angka', met: /\d/.test(passwordForm.new_password) },
    { label: 'Mengandung simbol', met: /[^A-Za-z0-9]/.test(passwordForm.new_password) },
  ];
  const strengthScore = passwordChecks.filter((item) => item.met).length;
  const strengthPercent = (strengthScore / passwordChecks.length) * 100;
  const strengthColor = strengthScore >= 4 ? '#10b981' : strengthScore >= 2 ? '#f59e0b' : '#ef4444';
  const strengthLabel = strengthScore >= 4 ? 'Kuat' : strengthScore >= 2 ? 'Cukup' : 'Lemah';
  const hasNewPassword = Boolean(passwordForm.new_password);
  const strengthTextColor = hasNewPassword ? strengthColor : '#94a3b8';

  return (
    <div>
      <div style={tabPageHeader(isMobile)}>
        <div>
          <h2 style={tabTitle(isMobile)}>Pengaturan Keamanan</h2>
          <p style={tabSubtitle}>Kelola identitas administrator, akses login, dan keamanan kata sandi akun.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '0.95fr 1.25fr', gap: '18px', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: '18px' }}>
          <div style={{ ...styles.card, marginBottom: 0, overflow: 'hidden', padding: 0 }}>
            <div style={cardHeader(isMobile)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={iconBox('#fff1f2', '#b31312')}>
                  <UserCog size={19} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={sectionTitle}>Profil Administrator</h3>
                  <p style={helperText}>Identitas ini ditampilkan pada portal admin.</p>
                </div>
              </div>
              <span style={badge('success')}><BadgeCheck size={12} /> Administrator Sistem</span>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ padding: '18px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.labelStyle}>ID Login</label>
                <div style={{ position: 'relative' }}>
                  <Fingerprint size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    name="username"
                    required
                    value={profileForm.username}
                    onChange={handleProfileFormChange}
                    className="input-focus"
                    style={{ ...styles.modernInput, backgroundColor: '#ffffff', fontWeight: '900', paddingLeft: '36px' }}
                    placeholder="Ketik username untuk login"
                  />
                </div>
                <p style={helperText}>Username ini digunakan saat admin masuk ke sistem.</p>
              </div>

              <div style={{ ...fieldGrid(isMobile), marginBottom: '16px' }}>
                <div>
                  <label style={styles.labelStyle}>Nama Depan</label>
                  <input type="text" name="first_name" value={profileForm.first_name} onChange={handleProfileFormChange} className="input-focus" style={{ ...styles.modernInput, backgroundColor: '#ffffff' }} placeholder="Nama Depan" />
                </div>
                <div>
                  <label style={styles.labelStyle}>Nama Belakang</label>
                  <input type="text" name="last_name" value={profileForm.last_name} onChange={handleProfileFormChange} className="input-focus" style={{ ...styles.modernInput, backgroundColor: '#ffffff' }} placeholder="Nama Belakang" />
                </div>
              </div>

              <button type="submit" disabled={isUpdatingProfile} className="btn-hover" style={compactButton(styles, 'primary', { width: '100%', padding: '11px 14px' })}>
                <Save size={15} /> {isUpdatingProfile ? 'Menyimpan...' : 'Simpan ID & Profil'}
              </button>
            </form>
          </div>

          <GuidancePanel
            title="Panduan Keamanan"
            description="Jaga akun admin tetap aman dan mudah diaudit."
            icon={ShieldCheck}
            items={[
              'Username login sebaiknya singkat, jelas, dan tanpa spasi.',
              'Gunakan sandi dengan kombinasi huruf besar, angka, dan simbol.',
              'Jangan berikan akses akun kepada pihak yang tidak berkepentingan.',
            ]}
          />
        </div>

        <div style={{ ...styles.card, marginBottom: 0, overflow: 'hidden', padding: 0 }}>
          <div style={cardHeader(isMobile)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={iconBox('#fff1f2', '#b31312')}>
                <LockKeyhole size={19} />
              </div>
              <div>
                <h3 style={sectionTitle}>Perbarui Kata Sandi</h3>
                <p style={helperText}>Sistem akan otomatis mengeluarkan admin setelah sandi berhasil diganti.</p>
              </div>
            </div>
            <span style={badge(hasNewPassword ? (strengthScore >= 3 ? 'success' : 'warning') : 'neutral')}>
              <KeyRound size={12} /> {hasNewPassword ? strengthLabel : 'Belum Diisi'}
            </span>
          </div>

          <form onSubmit={handleAdminPasswordChange} style={{ padding: '18px' }}>
            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={styles.labelStyle}>Kata Sandi Lama</label>
                <input type="password" name="old_password" required value={passwordForm.old_password} onChange={handlePasswordFormChange} className="input-focus" style={{ ...styles.modernInput, backgroundColor: '#ffffff' }} placeholder="Masukkan sandi saat ini" />
              </div>

              <div style={innerPanel}>
                <div style={fieldGrid(isMobile)}>
                  <div>
                    <label style={styles.labelStyle}>Kata Sandi Baru</label>
                    <input type="password" name="new_password" required value={passwordForm.new_password} onChange={handlePasswordFormChange} className="input-focus" style={{ ...styles.modernInput, backgroundColor: '#ffffff' }} placeholder="Minimal 8 karakter" />
                  </div>
                  <div>
                    <label style={styles.labelStyle}>Ulangi Kata Sandi Baru</label>
                    <input type="password" name="confirm_password" required value={passwordForm.confirm_password} onChange={handlePasswordFormChange} className="input-focus" style={{ ...styles.modernInput, backgroundColor: '#ffffff' }} placeholder="Ketik ulang sandi baru" />
                  </div>
                </div>

                <div style={{ marginTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '900' }}>Kekuatan kata sandi</span>
                    <span style={{ color: strengthTextColor, fontSize: '11px', fontWeight: '900' }}>{hasNewPassword ? strengthLabel : 'Belum dicek'}</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#edf2f7', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${hasNewPassword ? strengthPercent : 0}%`, height: '100%', backgroundColor: hasNewPassword ? strengthColor : '#cbd5e1', borderRadius: '999px', transition: 'width 0.2s ease' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                    {passwordChecks.map((item) => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '7px', color: item.met ? '#166534' : '#94a3b8', fontSize: '11px', fontWeight: '800' }}>
                        <CheckCircle size={13} color={item.met ? '#10b981' : '#cbd5e1'} />
                        {item.label}
                      </div>
                    ))}
                  </div>

                  {passwordMismatch && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '12px', marginTop: '12px', fontWeight: '900' }}>
                      <AlertCircle size={13} /> Kata sandi tidak cocok
                    </span>
                  )}
                  {passwordMatch && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '12px', marginTop: '12px', fontWeight: '900' }}>
                      <CheckCircle size={13} /> Kata sandi cocok
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button
                type="submit"
                disabled={isChangingPassword || passwordMismatch}
                className="btn-hover"
                style={{
                  ...compactButton(styles, 'primary', {
                    width: isMobile ? '100%' : 'auto',
                    fontSize: '12px',
                    padding: '12px 20px',
                  }),
                  opacity: (isChangingPassword || passwordMismatch) ? 0.6 : 1,
                }}
              >
                <KeyRound size={15} /> {isChangingPassword ? 'Memproses...' : 'Simpan Sandi & Keluar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PengaturanTab;
