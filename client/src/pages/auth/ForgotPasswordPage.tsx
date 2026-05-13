import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { AmbulanceIcon, PhoneIcon } from '../../components/common/Icons';

function LockIcon() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
}

type FPStep = 'phone' | 'otp' | 'newpw' | 'done';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep]       = useState<FPStep>('phone');
  const [phone, setPhone]     = useState('');
  const [otp, setOtp]         = useState('');
  const [pw, setPw]           = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone) { setError('Please enter your phone number'); return; }
    setLoading(true); setError('');
    try {
      await authApi.forgotPassword(phone);
      setStep('otp');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send code. Try again.');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setError('Enter a 6-digit code'); return; }
    setLoading(true); setError('');
    try {
      await authApi.verifyOtp(phone, otp);
      setStep('newpw');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Incorrect or expired code.');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    if (pw.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (pw !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      await authApi.resetPassword(phone, otp, pw);
      setStep('done');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Reset failed. Please restart the process.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="auth-logo__mark"><AmbulanceIcon size={32} /></div>
        <div>
          <div className="auth-logo__title">Med<span>Linka</span></div>
          <div className="auth-logo__sub">Account Recovery</div>
        </div>
      </div>

      <div className="auth-card animate-scale">
        {step === 'phone' && (
          <>
            <h2 style={{ marginBottom: 4 }}>Forgot Password</h2>
            <p style={{ marginBottom: 24, fontSize: '0.875rem' }}>Enter your registered phone number to receive a reset code.</p>
            <div className="form-group">
              <label className="form-label" htmlFor="fp-phone">Phone Number</label>
              <div className="input-wrapper">
                <span className="input-icon"><PhoneIcon size={16} /></span>
                <input id="fp-phone" className="form-input" type="tel" placeholder="+256700000000"
                  value={phone} onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendOtp()} />
              </div>
            </div>
            {error && <p style={{ color: 'var(--crimson-light)', fontSize: '0.85rem', marginTop: 8 }}>{error}</p>}
            <button className="btn btn--primary btn--full btn--lg" style={{ marginTop: 16 }}
              onClick={handleSendOtp} disabled={!phone || loading}>
              {loading ? <span className="spinner" /> : 'Send Reset Code'}
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <h2 style={{ marginBottom: 4 }}>Enter OTP</h2>
            <p style={{ marginBottom: 24, fontSize: '0.875rem' }}>
              A 6-digit code was sent to <strong style={{ color: 'var(--primary-light)' }}>{phone}</strong>.
              <br /><span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>Check your SMS messages.</span>
            </p>
            <div className="form-group">
              <label className="form-label" htmlFor="fp-otp">6-Digit Code</label>
              <input id="fp-otp" className="form-input" type="number" placeholder="000000"
                value={otp} onChange={e => setOtp(e.target.value.slice(0, 6))}
                style={{ fontSize: '1.5rem', letterSpacing: '0.3em', textAlign: 'center' }}
                onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()} />
            </div>
            {error && <p style={{ color: 'var(--crimson-light)', fontSize: '0.85rem', marginTop: 8 }}>{error}</p>}
            <button className="btn btn--primary btn--full btn--lg" style={{ marginTop: 16 }}
              onClick={handleVerifyOtp} disabled={otp.length !== 6 || loading}>
              {loading ? <span className="spinner" /> : 'Verify Code'}
            </button>
            <button className="btn btn--ghost btn--full btn--sm" style={{ marginTop: 8 }}
              onClick={() => { setStep('phone'); setOtp(''); setError(''); }}>Back</button>
          </>
        )}

        {step === 'newpw' && (
          <>
            <h2 style={{ marginBottom: 4 }}>New Password</h2>
            <p style={{ marginBottom: 24, fontSize: '0.875rem' }}>Choose a strong password for your account.</p>
            <div className="form-group">
              <label className="form-label" htmlFor="fp-pw">New Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><LockIcon /></span>
                <input id="fp-pw" className="form-input" type="password" placeholder="Min. 6 characters"
                  value={pw} onChange={e => setPw(e.target.value)} minLength={6} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label" htmlFor="fp-confirm">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><LockIcon /></span>
                <input id="fp-confirm" className="form-input" type="password" placeholder="Repeat password"
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleResetPassword()} />
              </div>
            </div>
            {error && <p style={{ color: 'var(--crimson-light)', fontSize: '0.85rem', marginTop: 8 }}>{error}</p>}
            <button className="btn btn--primary btn--full btn--lg" style={{ marginTop: 16 }}
              onClick={handleResetPassword} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Reset Password'}
            </button>
          </>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: '4rem' }}>✅</div>
            <h2 style={{ color: 'var(--green-light)' }}>Password Reset!</h2>
            <p style={{ fontSize: '0.9rem' }}>Your password has been successfully updated. You can now sign in.</p>
            <button onClick={() => navigate('/login')} className="btn btn--primary btn--full btn--lg" style={{ marginTop: 8 }}>
              Go to Login
            </button>
          </div>
        )}
      </div>

      <p style={{ marginTop: 16, fontSize: '0.875rem', color: 'var(--text-3)' }}>
        Remember your password? <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  );
}
