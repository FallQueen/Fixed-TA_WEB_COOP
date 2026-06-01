import { createElement } from 'react';
import { Activity } from 'lucide-react';
import { adminColors, badge, statusTones } from './sharedTabStyles';

const clampPercent = (value) => Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));

function ProgressStatusPanel({
  isMobile,
  icon = Activity,
  label = 'Progress',
  title,
  description,
  percent,
  tone = 'success',
  color,
  badgeVariant,
  meta,
  percentLabel = 'selesai',
}) {
  const safePercent = clampPercent(percent);
  const selectedTone = statusTones[tone] || statusTones.success;
  const progressColor = color || selectedTone.color;
  const selectedBadgeVariant = badgeVariant || tone;

  return (
    <div style={{
      marginBottom: '22px',
      padding: isMobile ? '14px' : '16px',
      backgroundColor: adminColors.panel,
      border: `1px solid ${adminColors.border}`,
      borderRadius: '14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <span style={badge(selectedBadgeVariant)}>
          {createElement(icon, { size: 12 })} {label}
        </span>
        {meta && (
          <span style={{ color: adminColors.textSubtle, fontSize: '11px', fontWeight: '800' }}>
            {meta}
          </span>
        )}
      </div>

      <h3 style={{ margin: 0, color: adminColors.text, fontSize: isMobile ? '18px' : '21px', fontWeight: '900', lineHeight: 1.25 }}>
        {title}
      </h3>
      {description && (
        <p style={{ margin: '7px 0 14px', color: adminColors.textMuted, fontSize: '12px', fontWeight: '600', lineHeight: 1.55 }}>
          {description}
        </p>
      )}

      <div style={{ height: '10px', borderRadius: '999px', backgroundColor: adminColors.line, overflow: 'hidden' }}>
        <div style={{ width: `${safePercent}%`, height: '100%', borderRadius: '999px', backgroundColor: progressColor, transition: 'width 0.25s ease' }} />
      </div>
      <div style={{ marginTop: '7px', color: progressColor, fontSize: '11px', fontWeight: '900' }}>
        {safePercent}% {percentLabel}
      </div>
    </div>
  );
}

export default ProgressStatusPanel;
