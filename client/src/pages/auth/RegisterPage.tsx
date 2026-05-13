import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AmbulanceIcon, PhoneIcon, UserIcon, AlertTriangleIcon, LocationPinIcon } from '../../components/common/Icons';
import { useGeolocation } from '../../hooks/useGeolocation';

function LockIcon() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
}
function MailIcon() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}

type WizardStep = 1 | 2 | 3 | 4;

function getPwdStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'var(--crimson-light)' };
  if (score <= 3) return { score, label: 'Fair', color: 'var(--amber-light)' };
  return { score, label: 'Strong', color: 'var(--green-light)' };
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const STEPS = ['Basic Info', 'Emergency Info', 'Location', 'Verify'];

export default function RegisterPage() {
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const { lat, lng, loading: geoLoading, getLocation } = useGeolocation(false);

  const [step, setStep] = useState<WizardStep>(1);
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirm: '' });
  const [medical, setMedical] = useState({ bloodGroup: '', allergies: '', conditions: '', emergencyContact: '', preferredHospital: '' });
  const [address, setAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState('');
  const [registered, setRegistered] = useState(false);

  const displayError = localError || error;
  const strength = getPwdStrength(form.password);

  const nextStep = () => {
    setLocalError('');
    if (step === 1) {
      if (!form.name || !form.phone || !form.password) { setLocalError('Please fill all required fields.'); return; }
      if (form.password !== form.confirm) { setLocalError('Passwords do not match.'); return; }
      if (form.password.length < 6) { setLocalError('Password must be at least 6 characters.'); return; }
    }
    setStep(s => (s + 1) as WizardStep);
  };

  const handleSubmit = async () => {
    clearError(); setLocalError('');
    if (otp.length !== 6) { setLocalError('Please enter the 6-digit verification code.'); return; }
    try {
      await register({ name: form.name, phone: form.phone, email: form.email || undefined, password: form.password, role: 'citizen' });
      setRegistered(true);
      setTimeout(() => navigate('/'), 2000);
    } catch { /* shown via store */ }
  };

  return (
    <div className="auth-page" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <div className="auth-logo" style={{ marginBottom: 24 }}>
        <div className="auth-logo__mark"><AmbulanceIcon size={28} /></div>
        <div>
          <div className="auth-logo__title">Med<span>Linka</span></div>
          <div className="auth-logo__sub">Create Your Account</div>
        </div>
      </div>

      {/* Step progress */}
      <div className="step-progress" style={{ width: '100%', maxWidth: 400 }}>
        {STEPS.map((label, i) => {
          const n = i + 1;
          const state = n < step ? 'done' : n === step ? 'active' : 'pending';
          return (
            <div key={label} className="step-progress__item">
              <div className={`step-progress__circle ${state}`}>{n < step ? '✓' : n}</div>
              <div className={`step-progress__label ${state === 'active' ? 'active' : ''}`}>{label}</div>
              {i < STEPS.length - 1 && <div className={`step-progress__line${n < step ? ' done' : ''}`} style={{ position: 'absolute', width: '100%' }} />}
            </div>
          );
        })}
      </div>

      <div className="auth-card animate-scale" style={{ width: '100%', maxWidth: 400 }}>
        {registered ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: '4rem' }}>🎉</div>
            <h2 style={{ color: 'var(--green-light)' }}>Account Created!</h2>
            <p>Redirecting to your dashboard…</p>
          </div>
        ) : (
          <>
            {displayError && (
              <div className="alert alert--error" style={{ marginBottom: 20 }}>
                <AlertTriangleIcon size={18} style={{ flexShrink: 0 }} /><span>{displayError}</span>
              </div>
            )}

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h2 style={{ marginBottom: 0 }}>Basic Information</h2>
                <p style={{ fontSize: '0.875rem', marginBottom: 4 }}>Fill in your personal details.</p>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-name">Full Name *</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><UserIcon size={16} /></span>
                    <input id="reg-name" className="form-input" placeholder="Alice Nakato"
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-phone">Phone Number *</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><PhoneIcon size={16} /></span>
                    <input id="reg-phone" className="form-input" type="tel" placeholder="+256700000000"
                      value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-email">Email <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
                  <div className="input-wrapper">
                    <span className="input-icon"><MailIcon /></span>
                    <input id="reg-email" className="form-input" type="email" placeholder="alice@example.com"
                      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-password">Password *</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><LockIcon /></span>
                    <input id="reg-password" className="form-input" type="password" placeholder="Min. 6 characters"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} minLength={6} required />
                  </div>
                  {form.password && (
                    <div>
                      <div className="pwd-strength">
                        <div className="pwd-strength__bar" style={{ width: `${(strength.score / 5) * 100}%`, background: strength.color }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: strength.color, marginTop: 4, display: 'block' }}>Strength: {strength.label}</span>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-confirm">Confirm Password *</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><LockIcon /></span>
                    <input id="reg-confirm" className="form-input" type="password" placeholder="Repeat password"
                      value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
                  </div>
                </div>
                <button className="btn btn--primary btn--full btn--lg" onClick={nextStep} style={{ marginTop: 8 }}>Next →</button>
              </div>
            )}

            {/* Step 2: Emergency Info */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h2 style={{ marginBottom: 4 }}>Emergency Info</h2>
                  <p style={{ fontSize: '0.875rem' }}>Optional — helps first responders prepare. <span style={{ color: 'var(--text-3)' }}>You can skip this.</span></p>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-blood">Blood Group</label>
                  <select id="reg-blood" className="form-input" value={medical.bloodGroup} onChange={e => setMedical({ ...medical, bloodGroup: e.target.value })}>
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-allergies">Allergies</label>
                  <input id="reg-allergies" className="form-input" placeholder="e.g. Penicillin, Peanuts"
                    value={medical.allergies} onChange={e => setMedical({ ...medical, allergies: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-conditions">Medical Conditions</label>
                  <textarea id="reg-conditions" className="form-input" placeholder="e.g. Hypertension, Diabetes…"
                    value={medical.conditions} onChange={e => setMedical({ ...medical, conditions: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-ec">Emergency Contact (Name & Phone)</label>
                  <input id="reg-ec" className="form-input" placeholder="e.g. John Doe +256700000099"
                    value={medical.emergencyContact} onChange={e => setMedical({ ...medical, emergencyContact: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn--ghost" onClick={() => setStep(1)}>Back</button>
                  <button className="btn btn--primary flex-1" onClick={nextStep}>Next →</button>
                </div>
                <button className="btn btn--ghost btn--sm" onClick={nextStep} style={{ color: 'var(--text-3)' }}>Skip this step</button>
              </div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h2 style={{ marginBottom: 4 }}>Location Setup</h2>
                <p style={{ fontSize: '0.875rem' }}>Help us find you faster in an emergency.</p>
                <button className="btn btn--primary btn--full" onClick={getLocation} disabled={geoLoading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {geoLoading ? <span className="spinner" style={{ borderTopColor: '#fff' }} /> : <LocationPinIcon size={16} />}
                  {lat && lng ? '✓ Location Acquired' : 'Detect My Location (GPS)'}
                </button>
                {lat && lng && (
                  <div className="alert alert--success" style={{ fontSize: '0.8rem' }}>
                    📍 GPS: {lat.toFixed(4)}, {lng.toFixed(4)}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-addr">Or enter address manually</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><LocationPinIcon size={16} /></span>
                    <input id="reg-addr" className="form-input" placeholder="e.g. Entebbe Road, Kampala"
                      value={address} onChange={e => setAddress(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button className="btn btn--ghost" onClick={() => setStep(2)}>Back</button>
                  <button className="btn btn--primary flex-1" onClick={nextStep}>Next →</button>
                </div>
                <button className="btn btn--ghost btn--sm" onClick={nextStep} style={{ color: 'var(--text-3)' }}>Skip</button>
              </div>
            )}

            {/* Step 4: Verify */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ marginBottom: 4 }}>Verify & Complete</h2>
                <p style={{ fontSize: '0.875rem' }}>A 6-digit code was sent to <strong style={{ color: 'var(--primary-light)' }}>{form.phone}</strong>.
                  <br /><span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>(Demo: enter any 6 digits)</span>
                </p>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-otp">Verification Code</label>
                  <input id="reg-otp" className="form-input" type="number" placeholder="000000"
                    value={otp} onChange={e => setOtp(e.target.value.slice(0, 6))}
                    style={{ fontSize: '1.5rem', letterSpacing: '0.3em', textAlign: 'center' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn--ghost" onClick={() => setStep(3)}>Back</button>
                  <button id="reg-submit" className="btn btn--primary flex-1" onClick={handleSubmit}
                    disabled={isLoading || otp.length !== 6}>
                    {isLoading ? <span className="spinner" style={{ borderTopColor: '#fff' }} /> : '🎉 Create Account'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <p style={{ marginTop: 20, fontSize: '0.875rem', color: 'var(--text-3)', textAlign: 'center' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  );
}
