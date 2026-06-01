import { useCallback, useState } from 'react';

const formatFeedbackText = (options = {}) => {
  const parts = [options.title, options.message, ...(options.details || [])].filter(Boolean);
  return parts.join('\n\n');
};

export const getFeedbackApi = (feedback = {}) => ({
  notify: feedback.notify || ((options) => console.info(formatFeedbackText(options))),
  showAlert: feedback.showAlert || ((options) => {
    console.info(formatFeedbackText(options));
    return Promise.resolve(null);
  }),
  showConfirm: feedback.showConfirm || ((options) => {
    console.info(formatFeedbackText(options));
    return Promise.resolve(false);
  }),
  showPrompt: feedback.showPrompt || ((options) => {
    console.info(formatFeedbackText(options));
    return Promise.resolve(null);
  }),
});

export function useAdminFeedback() {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);

  const dismissToast = useCallback((toastId) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  const notify = useCallback((options) => {
    const id = `${Date.now()}-${Math.random()}`;
    const toast = {
      id,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
    };

    setToasts((current) => [...current, toast].slice(-4));
    window.setTimeout(() => dismissToast(id), options.duration || 4200);
  }, [dismissToast]);

  const settleDialog = useCallback((value) => {
    setDialog((current) => {
      current?.resolve(value);
      return null;
    });
  }, []);

  const showAlert = useCallback((options) => (
    new Promise((resolve) => {
      setDialog({
        ...options,
        id: `${Date.now()}-${Math.random()}`,
        kind: 'alert',
        type: options.type || 'info',
        confirmLabel: options.confirmLabel || 'Mengerti',
        resolve,
      });
    })
  ), []);

  const showConfirm = useCallback((options) => (
    new Promise((resolve) => {
      setDialog({
        ...options,
        id: `${Date.now()}-${Math.random()}`,
        kind: 'confirm',
        type: options.type || 'confirm',
        cancelLabel: options.cancelLabel || 'Batal',
        confirmLabel: options.confirmLabel || 'Lanjutkan',
        resolve,
      });
    })
  ), []);

  const showPrompt = useCallback((options) => (
    new Promise((resolve) => {
      setDialog({
        ...options,
        id: `${Date.now()}-${Math.random()}`,
        kind: 'prompt',
        type: options.type || 'prompt',
        cancelLabel: options.cancelLabel || 'Batal',
        confirmLabel: options.confirmLabel || 'Simpan',
        initialValue: options.initialValue || '',
        resolve,
      });
    })
  ), []);

  return {
    dialog,
    toasts,
    dismissToast,
    notify,
    settleDialog,
    showAlert,
    showConfirm,
    showPrompt,
  };
}
