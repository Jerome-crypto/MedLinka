import { useState, useEffect } from 'react';
import { AmbulanceIcon, DownloadIcon, XCircleIcon } from './Icons';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect if running on iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    setIsIOS(ios);

    // Standard installer trigger
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!localStorage.getItem('pwa-dismissed') && !isStandalone) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If iOS and not running standalone and not dismissed
    if (ios && !isStandalone && !localStorage.getItem('pwa-dismissed')) {
      setShowBanner(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowInstructions(true);
      return;
    }

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
    <>
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
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>
            {isIOS ? 'Add to Home Screen for quick Safari access' : 'Add to home screen for quick emergency access'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button onClick={handleInstall} className="btn btn--primary btn--sm"
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <DownloadIcon size={13} /> {isIOS ? 'Steps' : 'Install'}
          </button>
          <button onClick={handleDismiss} className="btn btn--ghost btn--sm"
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <XCircleIcon size={13} /> Later
          </button>
        </div>
      </div>

      {/* iOS Manual Instructions Modal */}
      {showInstructions && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }} onClick={() => setShowInstructions(false)}>
          <div className="card card--elevated animate-fade" style={{
            width: '100%', maxWidth: '450px', borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
            padding: '24px 20px 40px', display: 'flex', flexDirection: 'column', gap: '18px',
            color: 'var(--text)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Install on iOS Safari</h3>
              <button onClick={() => setShowInstructions(false)} className="btn btn--ghost btn--sm btn--icon">✕</button>
            </div>
            
            <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--text-2)' }}>
              Follow these simple steps to install MedLinka on your iPhone/iPad:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>1</div>
                <div style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>
                  Tap the <strong>Share</strong> button in Safari's bottom bar (represented by a square icon with an upward arrow <span style={{ fontSize: '1.1rem' }}>📤</span>).
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>2</div>
                <div style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>
                  Scroll down the share menu list and select <strong>Add to Home Screen</strong> (represented by a plus <span style={{ fontSize: '1.1rem' }}>➕</span> icon).
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>3</div>
                <div style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>
                  Tap <strong>Add</strong> in the top-right corner of your screen to confirm the installation.
                </div>
              </div>
            </div>

            <button onClick={() => { setShowInstructions(false); setShowBanner(false); localStorage.setItem('pwa-dismissed', '1'); }} className="btn btn--primary btn--full" style={{ marginTop: 10 }}>
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
