import { useEffect, useState } from 'react';
import { WifiOffIcon } from './Icons';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline  = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online',  goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online',  goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
      background: 'var(--amber)', color: '#000',
      textAlign: 'center', padding: '8px 16px',
      fontSize: '0.875rem', fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    }}>
      <WifiOffIcon size={16} />
      You are offline — some features may be limited
    </div>
  );
}
