import { useAuthStore } from '../../store/authStore';
import CitizenNav from '../../components/layout/CitizenNav';
import { useTheme } from '../../hooks/useTheme';
import { SettingsIcon, LogOutIcon } from '../../components/common/Icons';
import { useToast } from '../../components/common/ToastManager';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useTheme();
  const toast = useToast();

  return (
    <div className="page">
      <div className="navbar">
        <div className="navbar__logo">
          <div className="navbar__logo-mark"><SettingsIcon size={18} /></div>
          <div className="navbar__logo-text">Set<span>tings</span></div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24, paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Appearance */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 4px' }}>Appearance</div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Dark Mode</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: 2 }}>Switch between dark and light theme</div>
          </div>
          <button id="theme-toggle" onClick={toggle}
            style={{
              width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
              background: theme === 'dark' ? 'var(--primary)' : 'var(--border-2)',
              position: 'relative', transition: 'background 0.3s', flexShrink: 0,
            }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3, transition: 'left 0.3s',
              left: theme === 'dark' ? 27 : 3,
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }} />
          </button>
        </div>

        {/* Notifications */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 4px' }}>Notifications</div>
        {[
          { id: 'notif-sos', label: 'SOS confirmations', sub: 'When your SOS request is accepted' },
          { id: 'notif-eta', label: 'ETA updates',       sub: 'Ambulance arrival time changes' },
          { id: 'notif-status', label: 'Status changes', sub: 'When ambulance arrives or trip ends' },
        ].map(item => (
          <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: 2 }}>{item.sub}</div>
            </div>
            <input id={item.id} type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }} />
          </div>
        ))}

        {/* Account */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 4px' }}>Account</div>
        <div className="card">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{user?.email}</div>
              {user?.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2 }}>{user.phone}</div>}
            </div>
          </div>
        </div>

        {/* PWA / App Installation */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 4px' }}>App Installation</div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>PWA Status</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: 2 }}>
                {window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
                  ? 'Installed (Running as App)'
                  : 'Web Version (Install for offline use)'}
              </div>
            </div>
            <span className={`badge badge--${window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone ? 'success' : 'neutral'}`}>
              {window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone ? 'standalone' : 'browser'}
            </span>
          </div>
          
          {!(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) && (
            <button
              onClick={() => {
                // If iOS, show manual drawer, else trigger standard beforeinstallprompt
                const userAgent = window.navigator.userAgent.toLowerCase();
                const isIOS = /iphone|ipad|ipod/.test(userAgent);
                if (isIOS) {
                  alert("To install MedLinka on iOS:\n1. Tap the Share button (📤) in Safari's bottom bar.\n2. Scroll down and choose 'Add to Home Screen' (➕).\n3. Tap 'Add' in the top-right corner.");
                } else {
                  // Dispatch custom event to notify InstallPrompt.tsx to show up again
                  localStorage.removeItem('pwa-dismissed');
                  window.dispatchEvent(new Event('beforeinstallprompt'));
                  toast.success('Install Prompt Triggered', 'Look for the installation banner at the bottom');
                }
              }}
              className="btn btn--primary btn--sm btn--full"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
            >
              <SettingsIcon size={14} /> Install MedLinka App
            </button>
          )}
        </div>

        <button id="signout-btn" className="btn btn--ghost btn--full" onClick={() => logout()}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--crimson-light)', borderColor: 'rgba(211,47,47,0.3)' }}>
          <LogOutIcon size={16} /> Sign Out
        </button>

        {/* About */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 4px' }}>About</div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'App Version', value: '2.0.0' },
            { label: 'Build', value: 'Production' },
            { label: 'Emergency Hotline', value: '999' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-3)' }}>{row.label}</span>
              <span style={{ fontWeight: 600, color: row.label === 'Emergency Hotline' ? 'var(--crimson-light)' : 'var(--text)' }}>{row.value}</span>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 4 }}>
          MedLinka — Emergency Response Connected
        </p>
      </div>

      <CitizenNav active="settings" />
    </div>
  );
}
