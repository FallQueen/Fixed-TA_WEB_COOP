import { createElement } from 'react';
import { CheckCircle2, ClipboardList } from 'lucide-react';
import { stemRed } from '../../../styles/adminstyles';

const PANEL_STYLE = {
  backgroundColor: '#ffffff',
  border: '1px solid #e8eef7',
  borderRadius: '14px',
  padding: '20px',
  boxShadow: '0 14px 34px rgba(15, 23, 42, 0.06)',
};

function GuidancePanel({
  title,
  description,
  items = [],
  icon = ClipboardList,
  children,
}) {
  return (
    <div style={PANEL_STYLE}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '12px', backgroundColor: '#fff1f2', color: stemRed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {createElement(icon, { size: 18 })}
        </div>
        <div>
          <h3 style={{ color: '#111827', margin: 0, fontSize: '18px', fontWeight: '900' }}>{title}</h3>
          {description && (
            <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '12px', fontWeight: '600', lineHeight: 1.5 }}>{description}</p>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div style={{ display: 'grid', gap: '10px', marginTop: '16px' }}>
          {items.map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '12px', fontWeight: '700', lineHeight: 1.5 }}>
              <CheckCircle2 size={14} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      {children && (
        <div style={{ marginTop: '16px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default GuidancePanel;
