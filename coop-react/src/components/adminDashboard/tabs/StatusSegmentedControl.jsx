import { stemRed } from '../../../styles/adminstyles';

const wrapStyle = (isMobile) => ({
  display: 'flex',
  alignItems: isMobile ? 'flex-start' : 'center',
  flexDirection: isMobile ? 'column' : 'row',
  gap: '10px',
  width: isMobile ? '100%' : 'auto',
});

const labelStyle = {
  color: '#94a3b8',
  fontSize: '10px',
  fontWeight: '900',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
};

const trackStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: '#f5f7fb',
  border: '1px solid #edf2f7',
  borderRadius: '999px',
  padding: '3px',
  gap: '2px',
  flexWrap: 'wrap',
};

const buttonStyle = (active) => ({
  border: 'none',
  borderRadius: '999px',
  padding: '8px 14px',
  minWidth: '82px',
  backgroundColor: active ? '#ffffff' : 'transparent',
  color: active ? stemRed : '#64748b',
  boxShadow: active ? '0 7px 18px rgba(15, 23, 42, 0.07)' : 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '11px',
  fontWeight: '900',
  transition: '0.2s',
});

function StatusSegmentedControl({
  value,
  onChange,
  options,
  isMobile,
  label = 'Status',
}) {
  return (
    <div style={wrapStyle(isMobile)}>
      <span style={labelStyle}>{label}</span>
      <div style={trackStyle}>
        {options.map((option) => {
          const active = option.value === '' ? !value : value === option.value;

          return (
            <button
              key={option.value || 'all'}
              type="button"
              onClick={() => onChange(option.value)}
              style={buttonStyle(active)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default StatusSegmentedControl;
