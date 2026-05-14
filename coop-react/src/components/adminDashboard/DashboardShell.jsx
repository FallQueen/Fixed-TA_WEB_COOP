import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Filter, LogOut, Menu, Search, User, X } from 'lucide-react';
import { SIDEBAR_SECTIONS } from './constants';
import { sidebarBg } from '../../styles/adminstyles';

const STEM_LOGO_URL = '/Logo-STEM03.png';
const PRASMUL_MINI_LOGO_URL = '/logo-prasmulmini.png';

function DashboardShell({
  styles,
  stemRed,
  activeTab,
  setActiveTab,
  adminData,
  handleLogout,
  isMobile,
  isSearching,
  isSidebarOpen,
  setIsSidebarOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  badges,
  searchQuery,
  setSearchQuery,
  filterProdi,
  setFilterProdi,
  uniqueProdis,
  children,
}) {
  const [isProdiFilterOpen, setIsProdiFilterOpen] = useState(false);
  const prodiFilterTabs = ['approval', 'overview', 'job_seeker', 'pelamar', 'evaluasi', 'berkas'];
  const hasProdiFilter = prodiFilterTabs.includes(activeTab);
  const hasSearchTools = [...prodiFilterTabs, 'industri', 'lowongan'].includes(activeTab);
  const searchPlaceholder = {
    approval: 'Cari berdasarkan nama atau NIM...',
    overview: 'Cari nama, NIM, prodi, atau perusahaan...',
    job_seeker: 'Cari nama, NIM, atau program studi...',
    pelamar: 'Cari pelamar, posisi, atau perusahaan...',
    evaluasi: 'Cari mahasiswa, perusahaan, atau supervisor...',
    berkas: 'Cari mahasiswa, NIM, prodi, atau perusahaan...',
    industri: 'Cari perusahaan, supervisor, email, atau telepon...',
    lowongan: 'Cari posisi, perusahaan, deskripsi, atau syarat...',
  }[activeTab] || 'Cari data...';
  const prodiFilterActive = Boolean(filterProdi);
  const prodiFilterShellStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: 'auto',
  };
  const prodiTriggerStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    border: `1px solid ${prodiFilterActive ? '#fecaca' : '#e8eef7'}`,
    boxShadow: prodiFilterActive ? '0 10px 22px rgba(179, 19, 18, 0.08)' : '0 7px 18px rgba(15, 23, 42, 0.05)',
    borderRadius: '12px',
    width: '44px',
    height: '44px',
    color: prodiFilterActive ? stemRed : '#64748b',
    cursor: 'pointer',
    flexShrink: 0,
  };
  const prodiDropdownStyle = {
    position: 'absolute',
    top: '52px',
    left: isMobile ? '0' : 'auto',
    right: isMobile ? 'auto' : '0',
    zIndex: 100,
    width: isMobile ? 'min(82vw, 320px)' : '320px',
    maxHeight: '330px',
    overflowY: 'auto',
    backgroundColor: '#ffffff',
    border: '1px solid #e8eef7',
    borderRadius: '14px',
    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.16)',
    padding: '10px',
  };

  const renderSearchTools = (maxWidth = '520px') => (
    <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '10px', width: '100%', maxWidth }}>
      <div style={styles.searchContainer}>
        <Search size={16} color="#94a3b8" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus={false}
          style={styles.searchInput}
        />
      </div>
      {hasProdiFilter && (
        <div style={prodiFilterShellStyle}>
          {!isMobile && <div style={{ height: '44px', width: '1px', backgroundColor: '#e8eef7' }} />}
          <button
            type="button"
            title={filterProdi ? `Filter aktif: ${filterProdi}` : 'Filter program studi'}
            onClick={() => setIsProdiFilterOpen((current) => !current)}
            style={prodiTriggerStyle}
          >
            <Filter size={17} color={prodiFilterActive ? stemRed : '#94a3b8'} />
            {prodiFilterActive && (
              <span style={{ position: 'absolute', top: '8px', right: '8px', width: '7px', height: '7px', backgroundColor: stemRed, borderRadius: '50%', boxShadow: '0 0 0 2px #ffffff' }} />
            )}
          </button>

          {isProdiFilterOpen && (
            <div style={prodiDropdownStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '4px 4px 10px 4px', borderBottom: '1px solid #edf2f7', marginBottom: '8px' }}>
                <div>
                  <div style={{ color: '#111827', fontSize: '12px', fontWeight: '900' }}>Filter Program Studi</div>
                  <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: '700', marginTop: '3px' }}>
                    {filterProdi || 'Semua program studi'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProdiFilterOpen(false)}
                  style={{ width: '30px', height: '30px', borderRadius: '10px', border: '1px solid #edf2f7', backgroundColor: '#f8fafc', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFilterProdi('');
                  setIsProdiFilterOpen(false);
                }}
                style={{ width: '100%', border: 'none', backgroundColor: !filterProdi ? '#fff1f2' : 'transparent', color: !filterProdi ? stemRed : '#334155', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: '900', textAlign: 'left' }}
              >
                Semua Program Studi
                {!filterProdi && <Check size={15} />}
              </button>

              {uniqueProdis.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setFilterProdi(option);
                    setIsProdiFilterOpen(false);
                  }}
                  style={{ width: '100%', border: 'none', backgroundColor: filterProdi === option ? '#fff1f2' : 'transparent', color: filterProdi === option ? stemRed : '#334155', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: filterProdi === option ? '900' : '800', textAlign: 'left', marginTop: '2px' }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option}</span>
                  {filterProdi === option && <Check size={15} />}
                </button>
              ))}

              {uniqueProdis.length === 0 && (
                <div style={{ padding: '14px 12px', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>
                  Belum ada opsi program studi.
                </div>
              )}
            </div>
          )}

          {prodiFilterActive && (
            <button
              type="button"
              onClick={() => {
                setFilterProdi('');
                setIsProdiFilterOpen(false);
              }}
              title="Reset filter program studi"
              style={{ width: '34px', height: '34px', borderRadius: '10px', border: '1px solid #fecaca', backgroundColor: '#ffffff', color: stemRed, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.dashboardContainer}>
      <style>
        {`
          .btn-hover:hover { opacity: 0.9; transform: scale(0.98); }
          .input-focus:focus { border-color: ${stemRed} !important; box-shadow: 0 0 0 3px rgba(179, 19, 18, 0.1) !important; outline: none; }
          .job-card:hover { transform: translateY(-4px); border-color: ${stemRed}; box-shadow: 0 12px 20px rgba(0,0,0,0.08) !important; }
          .custom-checkbox { width: 18px; height: 18px; cursor: pointer; accent-color: ${stemRed}; }
          .edit-icon-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; padding: 4px; border-radius: 4px; transition: 0.2s; }
          .edit-icon-btn:hover { color: ${stemRed}; background: #fef2f2; }
          .sidebar-tooltip { visibility: hidden; width: 120px; background-color: #333; color: #fff; text-align: center; border-radius: 6px; padding: 5px; position: absolute; z-index: 1; left: 105%; margin-left: -5px; opacity: 0; transition: opacity 0.3s; font-size: 12px;}
          .menu-item-hover:hover .sidebar-tooltip { visibility: visible; opacity: 1; }
          .toggle-sidebar-btn { transition: all 0.3s ease; }
          .toggle-sidebar-btn:hover {
            background-color: ${stemRed} !important;
            color: white !important;
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(179, 19, 18, 0.4) !important;
          }
        `}
      </style>

      {isMobile && isSidebarOpen && <div style={styles.sidebarOverlay} onClick={() => setIsSidebarOpen(false)} />}

      <div style={styles.sidebar}>
        {!isMobile && (
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{
              position: 'absolute',
              top: '28px',
              right: '-14px',
              background: sidebarBg,
              border: 'none',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 1001,
              padding: '2px',
              borderRadius: '50%',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isSidebarCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
          </button>
        )}

        <div style={styles.sidebarContent}>
          <div style={styles.logoBox}>
            {!isSidebarCollapsed ? (
              <img
                src={STEM_LOGO_URL}
                alt="Logo STEM"
                style={{ width: '180px', filter: 'brightness(0) invert(1)' }}
                onError={(e) => {
                  e.currentTarget.src = PRASMUL_MINI_LOGO_URL;
                  e.currentTarget.style.width = '40px';
                  e.currentTarget.style.height = '40px';
                  e.currentTarget.style.objectFit = 'contain';
                  e.currentTarget.style.filter = 'none';
                }}
              />
            ) : (
              <img
                src={PRASMUL_MINI_LOGO_URL}
                alt="Logo Prasmul"
                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
              />
            )}
          </div>

          <ul style={styles.menuList}>
            {SIDEBAR_SECTIONS.map((section) => (
              <div key={section.label}>
                {!isSidebarCollapsed ? <div style={styles.categoryLabel}>{section.label}</div> : <div style={styles.collapsedDivider} />}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const badgeValue = item.badgeKey ? badges[item.badgeKey] : 0;

                  return (
                    <li
                      key={item.key}
                      className="menu-item-hover"
                      onClick={() => setActiveTab(item.key)}
                      style={{ ...(activeTab === item.key && !isSearching ? styles.menuItemActive : styles.menuItem), position: 'relative' }}
                    >
                      <div style={styles.menuContent}>
                        <Icon size={20} />
                        {!isSidebarCollapsed && <span>{item.label}</span>}
                      </div>
                      {badgeValue > 0 && <span style={styles.notificationBadge}>{badgeValue}</span>}
                      {isSidebarCollapsed && <span className="sidebar-tooltip">{item.label}</span>}
                    </li>
                  );
                })}
              </div>
            ))}
          </ul>

          <button className="btn-hover" onClick={handleLogout} style={{ ...styles.logoutBtn, position: 'relative' }}>
            <LogOut size={18} />
            {!isSidebarCollapsed && <span>Keluar Sistem</span>}
          </button>
        </div>
      </div>

      <div style={styles.rightWrapper}>
        <header style={styles.topHeader}>
          <div style={{ flex: 1 }}>
            {hasSearchTools ? renderSearchTools() : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>Selamat Datang,</div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', lineHeight: 1.15 }}>
                {adminData?.first_name || 'Admin'} {adminData?.last_name || ''}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #b8c2d0, #8291a5)', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 18px rgba(15,23,42,0.12)' }}>
              <User size={22} color="white" />
            </div>
          </div>
        </header>

        <div style={styles.mainContent}>
          {isMobile && (
            <div style={styles.mobileHeader}>
              <button onClick={() => setIsSidebarOpen(true)} style={styles.hamburgerBtn}>
                <Menu size={20} />
              </button>
              <h3 style={{ margin: 0, color: stemRed, fontSize: '18px', fontWeight: '700' }}>Admin Co-op Prasmul</h3>
            </div>
          )}

          {isMobile && hasSearchTools && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                position: 'sticky',
                top: '-18px',
                zIndex: 50,
                backgroundColor: 'rgba(243, 246, 251, 0.92)',
                backdropFilter: 'blur(10px)',
                paddingTop: '18px',
                paddingBottom: '16px',
                marginBottom: '12px',
                borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
              }}
            >
              {renderSearchTools('100%')}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardShell;
