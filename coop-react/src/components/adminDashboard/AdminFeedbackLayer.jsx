import { useState } from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, Info, KeyRound, X, XCircle } from 'lucide-react';
import { stemRed } from '../../styles/adminstyles';

const toneMap = {
  success: {
    icon: CheckCircle2,
    accent: '#10b981',
    bg: '#ecfdf5',
    border: '#bbf7d0',
  },
  danger: {
    icon: XCircle,
    accent: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
  },
  warning: {
    icon: AlertTriangle,
    accent: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  info: {
    icon: Info,
    accent: '#0ea5e9',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  confirm: {
    icon: HelpCircle,
    accent: stemRed,
    bg: '#fff1f2',
    border: '#fecdd3',
  },
  prompt: {
    icon: KeyRound,
    accent: stemRed,
    bg: '#fff1f2',
    border: '#fecdd3',
  },
};

const getTone = (type = 'info') => toneMap[type] || toneMap.info;

function ToastItem({ toast, onDismiss }) {
  const tone = getTone(toast.type);
  const Icon = tone.icon;

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', width: 'min(360px, calc(100vw - 28px))', padding: '14px 14px', borderRadius: '14px', border: `1px solid ${tone.border}`, backgroundColor: '#ffffff', boxShadow: '0 18px 45px rgba(15, 23, 42, 0.16)' }}>
      <div style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: tone.bg, color: tone.accent, flexShrink: 0 }}>
        <Icon size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && <strong style={{ display: 'block', color: '#0f172a', fontSize: '13px', lineHeight: 1.35 }}>{toast.title}</strong>}
        {toast.message && <p style={{ margin: toast.title ? '4px 0 0' : 0, color: '#64748b', fontSize: '12px', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{toast.message}</p>}
      </div>
      <button type="button" onClick={onDismiss} style={{ border: 'none', backgroundColor: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: '2px', display: 'flex' }}>
        <X size={16} />
      </button>
    </div>
  );
}

function DialogContent({ dialog, isMobile, onSettle }) {
  const [promptValue, setPromptValue] = useState(dialog?.initialValue || '');
  const [promptError, setPromptError] = useState('');
  const tone = getTone(dialog?.type);
  const Icon = tone.icon;
  const isPrompt = dialog?.kind === 'prompt';
  const isConfirm = dialog?.kind === 'confirm';
  const details = dialog?.details || [];

  if (!dialog) return null;

  const handleConfirm = () => {
    if (isPrompt) {
      const errorMessage = dialog.validate?.(promptValue);
      if (errorMessage) {
        setPromptError(errorMessage);
        return;
      }
      onSettle(promptValue);
      return;
    }

    onSettle(true);
  };

  const handleCancel = () => {
    onSettle(isConfirm ? false : null);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3200, backgroundColor: 'rgba(15, 23, 42, 0.62)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '16px' : '24px' }}>
      <div style={{ width: 'min(520px, 100%)', backgroundColor: '#ffffff', borderRadius: '18px', boxShadow: '0 30px 80px rgba(15, 23, 42, 0.28)', border: '1px solid #e8eef7', overflow: 'hidden' }}>
        <div style={{ padding: isMobile ? '20px' : '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: tone.bg, color: tone.accent, border: `1px solid ${tone.border}`, flexShrink: 0 }}>
            <Icon size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: isMobile ? '17px' : '19px', lineHeight: 1.3, fontWeight: '900' }}>{dialog.title}</h3>
            {dialog.message && <p style={{ margin: '9px 0 0', color: '#475569', fontSize: '13px', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{dialog.message}</p>}
            {details.length > 0 && (
              <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e8eef7', display: 'grid', gap: '7px' }}>
                {details.map((detail) => (
                  <div key={detail} style={{ color: '#334155', fontSize: '12px', lineHeight: 1.45, fontWeight: '700' }}>{detail.replace(/^- /, '')}</div>
                ))}
              </div>
            )}
            {isPrompt && (
              <div style={{ marginTop: '18px' }}>
                <label style={{ display: 'block', color: '#334155', fontSize: '12px', fontWeight: '900', marginBottom: '7px' }}>{dialog.inputLabel || 'Input'}</label>
                {dialog.multiline ? (
                  <textarea
                    autoFocus
                    rows={4}
                    value={promptValue}
                    onChange={(event) => {
                      setPromptValue(event.target.value);
                      setPromptError('');
                    }}
                    placeholder={dialog.placeholder || ''}
                    style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${promptError ? '#fecaca' : '#cbd5e1'}`, borderRadius: '11px', padding: '12px 13px', fontFamily: '"Montserrat", sans-serif', fontSize: '13px', lineHeight: 1.55, color: '#0f172a', outline: 'none', backgroundColor: '#f8fafc', resize: 'vertical' }}
                  />
                ) : (
                  <input
                    autoFocus
                    type={dialog.inputType || 'text'}
                    value={promptValue}
                    onChange={(event) => {
                      setPromptValue(event.target.value);
                      setPromptError('');
                    }}
                    placeholder={dialog.placeholder || ''}
                    style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${promptError ? '#fecaca' : '#cbd5e1'}`, borderRadius: '11px', padding: '12px 13px', fontFamily: '"Montserrat", sans-serif', fontSize: '13px', color: '#0f172a', outline: 'none', backgroundColor: '#f8fafc' }}
                  />
                )}
                {promptError && <p style={{ margin: '7px 0 0', color: '#dc2626', fontSize: '12px', fontWeight: '700' }}>{promptError}</p>}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', justifyContent: 'flex-end', gap: '10px', padding: isMobile ? '16px 20px 20px' : '18px 24px 24px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fbfdff' }}>
          {(isConfirm || isPrompt) && (
            <button type="button" onClick={handleCancel} style={{ padding: '11px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontWeight: '900', fontSize: '12px', cursor: 'pointer', fontFamily: '"Montserrat", sans-serif', width: isMobile ? '100%' : 'auto' }}>
              {dialog.cancelLabel}
            </button>
          )}
          <button type="button" onClick={handleConfirm} style={{ padding: '11px 18px', borderRadius: '10px', border: 'none', backgroundColor: dialog.type === 'danger' ? '#dc2626' : tone.accent, color: '#ffffff', fontWeight: '900', fontSize: '12px', cursor: 'pointer', fontFamily: '"Montserrat", sans-serif', boxShadow: `0 10px 18px ${tone.accent}33`, width: isMobile ? '100%' : 'auto' }}>
            {dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminFeedbackLayer({ feedback, isMobile }) {
  return (
    <>
      <div style={{ position: 'fixed', right: isMobile ? '14px' : '22px', top: isMobile ? '14px' : '22px', zIndex: 3400, display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none' }}>
        {feedback.toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={toast} onDismiss={() => feedback.dismissToast(toast.id)} />
          </div>
        ))}
      </div>
      {feedback.dialog && (
        <DialogContent key={feedback.dialog.id} dialog={feedback.dialog} isMobile={isMobile} onSettle={feedback.settleDialog} />
      )}
    </>
  );
}
