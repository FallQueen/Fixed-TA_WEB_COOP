import {
  Activity,
  Award,
  Bell,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileText,
  GraduationCap,
  LogOut,
  Settings,
  User,
} from 'lucide-react';
import {
  COLLAPSED_SECTION_LABEL,
  PRASMUL_LOGO_URL,
} from './styles';

function SidebarSectionTitle({ isMobile, isSidebarCollapsed, label, styles }) {
  return (
    <div style={{ padding: '0 15px', marginTop: '20px', marginBottom: '10px' }}>
      <p
        style={{
          fontSize: '11px',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: 'bold',
          margin: 0,
          ...styles.menuText,
          textAlign: isSidebarCollapsed && !isMobile ? 'center' : 'left',
        }}
      >
        {isSidebarCollapsed && !isMobile ? COLLAPSED_SECTION_LABEL : label}
      </p>
    </div>
  );
}

function SidebarMenuItem({
  activeTab,
  badgeCount = 0,
  handleTabChange,
  icon,
  isMobile,
  isSidebarCollapsed,
  label,
  showBadge = false,
  styles,
  tabKey,
}) {
  const IconComponent = icon;

  return (
    <li
      onClick={() => handleTabChange(tabKey)}
      style={activeTab === tabKey ? styles.menuItemActive : styles.menuItem}
    >
      <IconComponent size={18} style={{ flexShrink: 0 }} />
      <span style={styles.menuText}>{label}</span>
      {badgeCount > 0 && (
        <span
          style={{
            ...styles.newBadge,
            display: isSidebarCollapsed && !isMobile ? 'none' : 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '22px',
            marginLeft: 'auto',
            backgroundColor: '#dc2626',
          }}
        >
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
      {showBadge && (
        <span
          style={{
            ...styles.newBadge,
            display: isSidebarCollapsed && !isMobile ? 'none' : 'inline-block',
          }}
        >
          Baru
        </span>
      )}
    </li>
  );
}

export default function StudentDashboardSidebar({
  activeTab,
  handleLogout,
  handleTabChange,
  hasApprovedPlacement,
  hasSeenUas,
  hasSeenUts,
  isGraduated,
  isMobile,
  isSidebarCollapsed,
  isSidebarOpen,
  isUasTriggered,
  isUtsTriggered,
  notificationCount,
  setIsSidebarCollapsed,
  setIsSidebarOpen,
  styles,
  submittedFinal,
  submittedUts,
}) {
  const primaryMenuItems = isGraduated
    ? [
      { icon: User, label: 'Profil & Dokumen', tabKey: 'profil' },
      { icon: Bell, label: 'Notifikasi', tabKey: 'notifikasi', badgeCount: notificationCount },
    ]
    : [
      { icon: User, label: 'Profil & Dokumen', tabKey: 'profil' },
      { icon: Bell, label: 'Notifikasi', tabKey: 'notifikasi', badgeCount: notificationCount },
      { icon: Briefcase, label: 'Bursa Magang', tabKey: 'lowongan' },
      { icon: Edit3, label: 'Input Lapor Magang', tabKey: 'lapor' },
      !hasApprovedPlacement && {
        icon: Activity,
        label: 'Progress Mingguan',
        tabKey: 'lapor_mingguan',
      },
    ].filter(Boolean);

  const evaluationMenuItems = isGraduated
    ? [
      { icon: Award, label: 'Sertifikat Kelulusan', tabKey: 'sertifikat' },
    ]
    : [
      { icon: Calendar, label: 'Laporan Bulanan', tabKey: 'laporan_bulanan' },
      isUtsTriggered && {
        icon: FileText,
        label: 'Laporan UTS',
        showBadge: !hasSeenUts && !submittedUts,
        tabKey: 'laporan_uts',
      },
      isUasTriggered && {
        icon: GraduationCap,
        label: 'Laporan Akhir',
        showBadge: !hasSeenUas && !submittedFinal,
        tabKey: 'laporan_akhir',
      },
      { icon: Award, label: 'Sertifikat Kelulusan', tabKey: 'sertifikat' },
    ].filter(Boolean);

  return (
    <>
      {isMobile && isSidebarOpen && (
        <div style={styles.sidebarOverlay} onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className="no-print" style={styles.sidebar}>
        {!isMobile && (
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={styles.collapseBtn}
            title={isSidebarCollapsed ? 'Perbesar Sidebar' : 'Perkecil Sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}

        <div style={styles.sidebarContent}>
          <div style={styles.logoBox}>
            {isSidebarCollapsed && !isMobile ? (
              <img
                src={PRASMUL_LOGO_URL}
                alt="Icon Prasmul"
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'cover',
                  objectPosition: 'left',
                  filter: 'brightness(0) invert(1)',
                }}
              />
            ) : (
              <img
                src={PRASMUL_LOGO_URL}
                alt="Logo Prasetiya Mulya"
                style={{
                  width: '100%',
                  maxWidth: '220px',
                  filter: 'brightness(0) invert(1)',
                  transition: '0.3s',
                }}
              />
            )}
          </div>

          <SidebarSectionTitle
            isMobile={isMobile}
            isSidebarCollapsed={isSidebarCollapsed}
            label="Menu Utama"
            styles={styles}
          />

          <ul style={styles.menuList}>
            {primaryMenuItems.map((item) => (
              <SidebarMenuItem
                key={item.tabKey}
                activeTab={activeTab}
                handleTabChange={handleTabChange}
                isMobile={isMobile}
                isSidebarCollapsed={isSidebarCollapsed}
                styles={styles}
                {...item}
              />
            ))}

            {(hasApprovedPlacement || isGraduated) && (
              <>
                <SidebarSectionTitle
                  isMobile={isMobile}
                  isSidebarCollapsed={isSidebarCollapsed}
                  label={isGraduated ? 'Kelulusan' : 'Evaluasi'}
                  styles={styles}
                />

                {evaluationMenuItems.map((item) => (
                  <SidebarMenuItem
                    key={item.tabKey}
                    activeTab={activeTab}
                    handleTabChange={handleTabChange}
                    isMobile={isMobile}
                    isSidebarCollapsed={isSidebarCollapsed}
                    styles={styles}
                    {...item}
                  />
                ))}
              </>
            )}

            <SidebarSectionTitle
              isMobile={isMobile}
              isSidebarCollapsed={isSidebarCollapsed}
              label="Lainnya"
              styles={styles}
            />

            <SidebarMenuItem
              activeTab={activeTab}
              handleTabChange={handleTabChange}
              icon={Settings}
              isMobile={isMobile}
              isSidebarCollapsed={isSidebarCollapsed}
              label="Keamanan Akun"
              styles={styles}
              tabKey="pengaturan"
            />
          </ul>

          <div
            style={{
              padding: isSidebarCollapsed && !isMobile ? '20px 10px' : '20px',
              marginTop: 'auto',
            }}
          >
            <button className="btn-hover" onClick={handleLogout} style={styles.logoutBtn}>
              <LogOut size={16} style={{ flexShrink: 0 }} />
              <span style={styles.menuText}>Keluar Akun</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
