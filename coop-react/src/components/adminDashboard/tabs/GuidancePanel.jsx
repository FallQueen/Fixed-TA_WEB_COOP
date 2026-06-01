import { createElement } from 'react';
import { CheckCircle2, ClipboardList } from 'lucide-react';
import { adminColors, statusTones } from './sharedTabStyles';

const PANEL_STYLE = {
  backgroundColor: adminColors.surface,
  border: `1px solid ${adminColors.border}`,
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
        <div style={{ width: '36px', height: '36px', borderRadius: '12px', backgroundColor: statusTones.primary.tint, color: statusTones.primary.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {createElement(icon, { size: 18 })}
        </div>
        <div>
          <h3 style={{ color: adminColors.text, margin: 0, fontSize: '18px', fontWeight: '900' }}>{title}</h3>
          {description && (
            <p style={{ margin: '6px 0 0', color: adminColors.textSubtle, fontSize: '12px', fontWeight: '600', lineHeight: 1.5 }}>{description}</p>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div style={{ display: 'grid', gap: '10px', marginTop: '16px' }}>
          {items.map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: adminColors.textMuted, fontSize: '12px', fontWeight: '700', lineHeight: 1.5 }}>
              <CheckCircle2 size={14} color={statusTones.success.color} style={{ marginTop: '2px', flexShrink: 0 }} />
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
