import { stemRed } from '../../../styles/adminstyles';

export const tabPageHeader = (isMobile) => ({
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  justifyContent: 'space-between',
  alignItems: isMobile ? 'flex-start' : 'center',
  gap: '14px',
  marginBottom: '18px',
});

export const tabTitle = (isMobile) => ({
  color: '#111827',
  margin: 0,
  fontSize: isMobile ? '20px' : '24px',
  lineHeight: 1.15,
  fontWeight: '900',
  letterSpacing: '0',
});

export const tabSubtitle = {
  margin: '5px 0 0',
  color: '#94a3b8',
  fontSize: '11px',
  fontWeight: '600',
  lineHeight: 1.5,
};

export const toolbar = (isMobile) => ({
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  alignItems: isMobile ? 'stretch' : 'center',
  gap: '8px',
  flexWrap: 'wrap',
  width: isMobile ? '100%' : 'auto',
});

export const filterSelectWrap = (isMobile) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#f8fafc',
  border: '1px solid #e8eef7',
  borderRadius: '12px',
  height: '42px',
  padding: '0 12px',
  width: isMobile ? '100%' : 'auto',
  minWidth: isMobile ? '100%' : '210px',
});

export const filterSelect = {
  border: 'none',
  outline: 'none',
  backgroundColor: 'transparent',
  width: '100%',
  color: '#334155',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '12px',
  fontWeight: '800',
  padding: '0 0 0 8px',
};

export const tableShell = {
  overflowX: 'auto',
  border: '1px solid #edf2f7',
  borderRadius: '14px',
};

export const emptyState = {
  textAlign: 'center',
  padding: '28px',
  color: '#94a3b8',
  fontSize: '12px',
  fontWeight: '700',
};

const badgeBase = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 10px',
  borderRadius: '999px',
  fontSize: '10px',
  fontWeight: '900',
  whiteSpace: 'nowrap',
  border: '1px solid transparent',
};

const badgeVariants = {
  danger: { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' },
  info: { backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' },
  neutral: { backgroundColor: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' },
  success: { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' },
  warning: { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' },
};

export const badge = (variant = 'neutral') => ({
  ...badgeBase,
  ...badgeVariants[variant],
});

export const compactButton = (styles, variant = 'primary', overrides = {}) => {
  const variants = {
    danger: { backgroundColor: '#dc2626', color: '#ffffff' },
    green: { backgroundColor: '#10b981', color: '#ffffff' },
    neutral: { backgroundColor: '#f8fafc', color: stemRed, border: `1px solid ${stemRed}` },
    primary: { backgroundColor: stemRed, color: '#ffffff' },
    slate: { backgroundColor: '#94a3b8', color: '#ffffff' },
    warning: { backgroundColor: '#f59e0b', color: '#ffffff' },
  };

  return {
    ...styles.btnPrimary,
    ...variants[variant],
    padding: '9px 12px',
    borderRadius: '10px',
    fontSize: '11px',
    boxShadow: variant === 'primary' ? '0 10px 20px rgba(179, 19, 18, 0.14)' : 'none',
    ...overrides,
  };
};

export const metricGrid = (isMobile, columns = 4) => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : `repeat(${columns}, minmax(0, 1fr))`,
  gap: '14px',
  marginBottom: '16px',
});

export const metricCard = {
  backgroundColor: '#ffffff',
  border: '1px solid #e8eef7',
  borderRadius: '13px',
  padding: '16px',
  minHeight: '98px',
  boxShadow: '0 12px 28px rgba(15, 23, 42, 0.055)',
};

export const innerPanel = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e8eef7',
  borderRadius: '13px',
  padding: '16px',
};
