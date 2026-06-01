import { stemRed } from '../../../styles/adminstyles';

export const adminColors = {
  primary: stemRed,
  surface: '#ffffff',
  page: '#f3f6fb',
  panel: '#f8fafc',
  border: '#e8eef7',
  borderSoft: '#edf2f7',
  text: '#111827',
  textMuted: '#64748b',
  textSubtle: '#94a3b8',
  inputText: '#334155',
  line: '#e2e8f0',
};

export const statusTones = {
  primary: { tint: '#fff1f2', color: stemRed, foreground: stemRed, borderColor: '#fecaca' },
  info: { tint: '#eef2ff', color: '#4f46e5', foreground: '#3730a3', borderColor: '#c7d2fe' },
  success: { tint: '#ecfdf5', color: '#10b981', foreground: '#047857', borderColor: '#bbf7d0' },
  warning: { tint: '#fff7ed', color: '#f97316', foreground: '#c2410c', borderColor: '#fed7aa' },
  danger: { tint: '#fff1f2', color: '#dc2626', foreground: '#b91c1c', borderColor: '#fecaca' },
  neutral: { tint: '#f8fafc', color: '#64748b', foreground: '#475569', borderColor: '#e2e8f0' },
};

export const metricTone = (variant = 'neutral') => {
  const tone = statusTones[variant] || statusTones.neutral;

  return {
    tint: tone.tint,
    color: tone.color,
  };
};

export const tabPageHeader = (isMobile) => ({
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  justifyContent: 'space-between',
  alignItems: isMobile ? 'flex-start' : 'center',
  gap: '14px',
  marginBottom: '18px',
});

export const tabTitle = (isMobile) => ({
  color: adminColors.text,
  margin: 0,
  fontSize: isMobile ? '20px' : '24px',
  lineHeight: 1.15,
  fontWeight: '900',
  letterSpacing: '0',
});

export const tabSubtitle = {
  margin: '5px 0 0',
  color: adminColors.textSubtle,
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
  backgroundColor: adminColors.panel,
  border: `1px solid ${adminColors.border}`,
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
  color: adminColors.inputText,
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '12px',
  fontWeight: '800',
  padding: '0 0 0 8px',
};

export const tableShell = {
  overflowX: 'auto',
  border: `1px solid ${adminColors.borderSoft}`,
  borderRadius: '14px',
};

export const emptyState = {
  textAlign: 'center',
  padding: '28px',
  color: adminColors.textSubtle,
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

const badgeVariants = Object.fromEntries(
  Object.entries(statusTones).map(([key, tone]) => [
    key,
    {
      backgroundColor: tone.tint,
      color: tone.foreground,
      borderColor: tone.borderColor,
    },
  ])
);

export const badge = (variant = 'neutral') => ({
  ...badgeBase,
  ...badgeVariants[variant],
});

export const compactButton = (styles, variant = 'primary', overrides = {}) => {
  const variants = {
    danger: { backgroundColor: statusTones.danger.color, color: '#ffffff' },
    green: { backgroundColor: statusTones.success.color, color: '#ffffff' },
    info: { backgroundColor: statusTones.info.color, color: '#ffffff' },
    neutral: { backgroundColor: adminColors.panel, color: stemRed, border: `1px solid ${stemRed}` },
    primary: { backgroundColor: stemRed, color: '#ffffff' },
    slate: { backgroundColor: statusTones.neutral.color, color: '#ffffff' },
    success: { backgroundColor: statusTones.success.color, color: '#ffffff' },
    warning: { backgroundColor: statusTones.warning.color, color: '#ffffff' },
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

export const actionCell = {
  width: '116px',
  minWidth: '116px',
  textAlign: 'left',
};

export const actionButtonGroup = (isMobile = false, overrides = {}) => ({
  display: 'inline-flex',
  gap: '6px',
  alignItems: 'center',
  justifyContent: isMobile ? 'flex-start' : 'flex-start',
  padding: '4px',
  border: `1px solid ${adminColors.borderSoft}`,
  borderRadius: '12px',
  backgroundColor: adminColors.panel,
  maxWidth: '100%',
  ...overrides,
});

export const actionIconButton = (variant = 'neutral', disabled = false, overrides = {}) => {
  const tone = statusTones[variant] || statusTones.neutral;

  return {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    border: `1px solid ${tone.borderColor}`,
    backgroundColor: disabled ? adminColors.panel : (variant === 'danger' ? adminColors.surface : tone.tint),
    color: disabled ? '#cbd5e1' : tone.foreground,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: 0,
    flexShrink: 0,
    opacity: disabled ? 0.7 : 1,
    boxShadow: 'none',
    ...overrides,
  };
};

export const metricGrid = (isMobile, columns = 4) => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(220px, 1fr))' : `repeat(${columns}, minmax(0, 1fr))`,
  gap: isMobile ? '10px' : '14px',
  marginBottom: '16px',
});

export const metricCard = {
  backgroundColor: adminColors.surface,
  border: `1px solid ${adminColors.border}`,
  borderRadius: '13px',
  padding: '16px',
  minHeight: '98px',
  boxShadow: '0 12px 28px rgba(15, 23, 42, 0.055)',
};

export const innerPanel = {
  backgroundColor: adminColors.panel,
  border: `1px solid ${adminColors.border}`,
  borderRadius: '13px',
  padding: '16px',
};
