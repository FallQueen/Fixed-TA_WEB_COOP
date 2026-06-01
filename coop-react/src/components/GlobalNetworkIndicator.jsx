import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { subscribeToNetworkActivity } from '../utils/networkActivity';

const indicatorStyles = {
  wrapper: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2000,
    pointerEvents: 'none',
  },
  progressTrack: {
    height: '3px',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  },
  progressBar: {
    width: '35%',
    height: '100%',
    background: 'linear-gradient(90deg, #003366 0%, #F2A900 100%)',
    borderRadius: '999px',
    animation: 'coop-loading-slide 1.1s ease-in-out infinite',
    boxShadow: '0 0 12px rgba(0, 51, 102, 0.25)',
  },
  pill: {
    position: 'fixed',
    top: '18px',
    right: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '999px',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 700,
    boxShadow: '0 16px 30px rgba(15, 23, 42, 0.18)',
    backdropFilter: 'blur(10px)',
  },
};

export default function GlobalNetworkIndicator() {
  const [pendingCount, setPendingCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => subscribeToNetworkActivity(setPendingCount), []);

  useEffect(() => {
    const timerId = window.setTimeout(
      () => setVisible(pendingCount > 0),
      pendingCount > 0 ? 120 : 0
    );

    return () => {
      window.clearTimeout(timerId);
    };
  }, [pendingCount]);

  if (!visible) {
    return null;
  }

  return (
    <>
      <style>
        {`
          @keyframes coop-loading-slide {
            0% { transform: translateX(-120%); }
            100% { transform: translateX(420%); }
          }
        `}
      </style>
      <div style={indicatorStyles.wrapper}>
        <div style={indicatorStyles.progressTrack}>
          <div style={indicatorStyles.progressBar} />
        </div>
      </div>
      <div style={indicatorStyles.pill}>
        <Loader2 size={16} className="animate-spin" />
        <span>{pendingCount > 1 ? `Memproses ${pendingCount} permintaan...` : 'Memproses...'}</span>
      </div>
    </>
  );
}
