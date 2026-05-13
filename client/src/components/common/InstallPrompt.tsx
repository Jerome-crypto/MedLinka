import { useState, useEffect } from 'react';
import { AmbulanceIcon, DownloadIcon, XCircleIcon } from './Icons';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!localStorage.getItem('pwa-dismissed')) setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-dismissed', '1');
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '90px', left: '16px', right: '16px', zIndex: 9999,
      background: 'var(--bg-3)', border: '1px solid var(--border-2)',
      borderRadius: 'var(--r-lg)', padding: '16px',
      display: 'flex', alignItems: 'center', gap: '12px',
      boxShadow: 'var(--shadow-lg)', animation: 'slideUp 0.35s var(--ease) both',
    }}>
      <div style={{ width: '44px', height: '44px', borderRadius: 'var(--r-md)', flexShrink: 0,
        background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <AmbulanceIcon size={22} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: '2px' }}>Install MedLinka</div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>Add to home screen for quick emergency access</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button onClick={handleInstall} className="btn btn--primary btn--sm"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <DownloadIcon size={13} /> Install
        </button>
        <button onClick={handleDismiss} className="btn btn--ghost btn--sm"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <XCircleIcon size={13} /> Later
        </button>
      </div>
    </div>
  );
}
