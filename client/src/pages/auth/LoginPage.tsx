import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AmbulanceIcon, AlertTriangleIcon, UserIcon, ShieldCrossIcon, HospitalIcon, AlertSirenIcon, UserCircleIcon } from '../../components/common/Icons';

function LockIcon() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
}
function MailIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
function EyeIcon({ off }: { off?: boolean }) {
  return off
    ? <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
    : <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  citizen:        { label: 'Citizen / Patient',  color: 'var(--green-light)'  },
  driver:         { label: 'Ambulance Driver',   color: 'var(--primary-light)'},
  hospital_admin: { label: 'Hospital Staff',     color: 'var(--teal-light)'   },
  provider_manager: { label: 'Provider Manager',  color: 'var(--teal-light)'   },
  admin:          { label: 'Administrator',      color: 'var(--amber-light)'  },
};

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const roleParam = params.get('role') || '';
  const roleInfo = ROLE_LABELS[roleParam];
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showCreds, setShowCreds] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); clearError();
    try { await login(form.email, form.password); navigate('/'); }
    catch { /* shown via store */ }
  };

  const fillCreds = (email: string, password: string) => { setForm({ email, password }); setShowCreds(false); };

  return (
    <div className="auth-page">
      <div style={{ width: '100%', maxWidth: 400, padding: '10px 16px', background: 'rgba(211,47,47,0.12)', border: '1px solid rgba(211,47,47,0.3)', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: -8 }}>
        <span style={{ color: 'var(--crimson-light)', flexShrink: 0 }}><AlertSirenIcon size={16} /></span>
        <span style={{ fontSize: '0.8rem', color: 'var(--crimson-light)', fontWeight: 600 }}>In a life-threatening emergency, call <strong>999</strong> immediately.</span>
      </div>
      <div className="auth-logo">
        <div className="auth-logo__mark"><AmbulanceIcon size={32} /></div>
        <div>
          <div className="auth-logo__title">Med<span>Linka</span></div>
          <div className="auth-logo__sub">Emergency Medical Response</div>
        </div>
      </div>
      {roleInfo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 'var(--r-full)', background: 'var(--surface)', border: '1px solid var(--border-2)', color: roleInfo.color, fontSize: '0.8rem', fontWeight: 600, marginBottom: -12 }}>
          <UserCircleIcon size={14} /> Signing in as {roleInfo.label}
        </div>
      )}
      <div className="auth-card animate-scale">
        <h2 style={{ marginBottom: '4px' }}>Welcome back</h2>
        <p style={{ marginBottom: '28px', fontSize: '0.875rem' }}>Sign in with your MedLinka account</p>
        {error && (
          <div className="alert alert--error" style={{ marginBottom: '20px' }}>
            <AlertTriangleIcon size={18} style={{ flexShrink: 0 }} /><span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon"><MailIcon /></span>
              <input id="login-email" className="form-input" type="email" placeholder="name@domain.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 600 }}>Forgot password?</Link>
            </div>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <span className="input-icon"><LockIcon /></span>
              <input id="login-password" className="form-input" type={showPassword ? 'text' : 'password'}
                placeholder="••••••••" style={{ paddingRight: 44 }}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              <button type="button" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4 }}>
                <EyeIcon off={showPassword} />
              </button>
            </div>
          </div>
          <button id="login-submit" type="submit" className="btn btn--primary btn--full btn--lg" style={{ marginTop: '8px' }} disabled={isLoading}>
            {isLoading ? <span className="spinner" style={{ borderTopColor: '#fff' }} /> : 'Sign In'}
          </button>
        </form>
        <div className="divider" style={{ margin: '20px 0' }} />
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-3)' }}>
          New patient?{' '}<Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Create account</Link>
        </p>
      </div>
      <div style={{ marginTop: '20px', width: '100%', maxWidth: '400px' }}>
        <button onClick={() => setShowCreds(!showCreds)} className="btn btn--ghost btn--full btn--sm"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <UserIcon size={14} /> {showCreds ? 'Hide' : 'Show'} Staff Test Accounts
        </button>
        {showCreds && (
          <div className="card animate-fade" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '4px', fontWeight: 600 }}>Click any to auto-fill:</p>
            {[
              { label: 'System Admin',         email: 'admin@medlinka.com', pwd: 'Admin@1234',    icon: <ShieldCrossIcon size={14} />, color: 'var(--crimson-light)' },
              { label: 'Hospital Admin',       email: 'hospital@medlinka.com', pwd: 'Hospital@1234', icon: <HospitalIcon size={14} />,    color: 'var(--teal-light)'   },
              { label: 'Driver — John Mukasa', email: 'driver1@medlinka.com', pwd: 'Driver@1234',   icon: <AmbulanceIcon size={14} />,   color: 'var(--primary-light)'},
              { label: 'Driver — Sarah Nalugo',email: 'driver2@medlinka.com', pwd: 'Driver@1234',   icon: <AmbulanceIcon size={14} />,   color: 'var(--primary-light)'},
              { label: 'Citizen — Alice',      email: 'alice@medlinka.com', pwd: 'Citizen@1234',  icon: <UserIcon size={14} />,        color: 'var(--green-light)'  },
            ].map(({ label, email, pwd, icon, color }) => (
              <button key={email} onClick={() => fillCreds(email, pwd)}
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', width: '100%', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                <span style={{ color, flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)' }}>{label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{email} / {pwd}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
