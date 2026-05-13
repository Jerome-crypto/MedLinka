import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSosStore } from '../../store/sosStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import CitizenNav from '../../components/layout/CitizenNav';
import {
  AmbulanceIcon, LocationPinIcon, AlertTriangleIcon,
  CheckCircleIcon, UserIcon, ClockIcon
} from '../../components/common/Icons';

// ── Emergency type icons ──────────────────────────────────────────
function CarCrashIcon() {
  return <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l3-4h8l3 4h1a2 2 0 012 2v6a2 2 0 01-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/><path d="M12 10v4M10 12h4" strokeWidth={2}/></svg>;
}
function HeartIcon() {
  return <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
}
function BabyIcon() {
  return <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><path d="M12 8v8M8 13c0 3 1.5 5 4 5s4-2 4-5"/><path d="M7 10h10"/></svg>;
}
function FlameIcon() {
  return <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/></svg>;
}
function MoreIcon() {
  return <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>;
}

const EMERGENCY_TYPES = [
  { id: 'accident', label: 'Accident',          icon: <CarCrashIcon />, color: '#EF5350', bg: 'rgba(239,83,80,0.12)' },
  { id: 'medical',  label: 'Medical Emergency', icon: <HeartIcon />,    color: '#EF5350', bg: 'rgba(239,83,80,0.12)' },
  { id: 'maternal', label: 'Maternal',          icon: <BabyIcon />,     color: '#AB47BC', bg: 'rgba(171,71,188,0.12)' },
  { id: 'fire',     label: 'Fire / Burn',       icon: <FlameIcon />,    color: '#FF7043', bg: 'rgba(255,112,67,0.12)' },
  { id: 'other',    label: 'Other',             icon: <MoreIcon />,     color: 'var(--text-3)', bg: 'var(--surface)' },
];

const QUICK_ACTIONS = [
  { id: 'medical',  emoji: '🚑', label: 'Call Ambulance',      sub: 'Medical emergency',    color: '#EF5350', glow: 'rgba(239,83,80,0.2)' },
  { id: 'maternal', emoji: '🤱', label: 'Maternal Emergency',  sub: 'Pregnancy / birth',    color: '#AB47BC', glow: 'rgba(171,71,188,0.2)' },
  { id: 'accident', emoji: '💥', label: 'Accident Report',     sub: 'Road / work accident', color: '#FF7043', glow: 'rgba(255,112,67,0.2)' },
  { id: 'fire',     emoji: '🔥', label: 'Fire / Burn',         sub: 'Fire or burns',        color: '#FF8A65', glow: 'rgba(255,138,101,0.2)' },
];

type Step = 'home' | 'type' | 'details' | 'confirm';

export default function SosPage() {
  const { user } = useAuthStore();
  const { createSos, isCreating, error, clearError } = useSosStore();
  const { lat, lng, loading: geoLoading, error: geoError, getLocation } = useGeolocation(true);
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('home');
  const [emergencyType, setEmergencyType] = useState('');
  const [form, setForm] = useState({ patientName: '', patientAge: '', medicalNotes: '', pickupAddress: '' });
  const [triggered, setTriggered] = useState(false);

  const selectedType = EMERGENCY_TYPES.find(t => t.id === emergencyType);

  const handleSOS = async (e?: FormEvent) => {
    e?.preventDefault();
    clearError();
    if (!lat || !lng) { getLocation(); return; }
    try {
      const req = await createSos({
        pickupLat: lat, pickupLng: lng,
        pickupAddress: form.pickupAddress || undefined,
        patientName: form.patientName || undefined,
        patientAge: form.patientAge ? parseInt(form.patientAge) : undefined,
        medicalNotes: (emergencyType ? `[${emergencyType.toUpperCase()}] ` : '') + (form.medicalNotes || ''),
      });
      setTriggered(true);
      setTimeout(() => navigate(`/tracking/${req.id}`), 1500);
    } catch { /* shown via store */ }
  };

  const startEmergency = (type?: string) => {
    if (type) setEmergencyType(type);
    setStep('type');
  };

  // ── Success state ───────────────────────────────────────────────
  if (triggered) {
    return (
      <div className="page" style={{ background: 'radial-gradient(ellipse at top,#0a1020 0%,var(--bg) 55%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <div className="card card--crimson animate-bounce-in" style={{ textAlign: 'center', padding: '40px 24px', maxWidth: 360, margin: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: 'var(--crimson-light)' }}>
            <AmbulanceIcon size={52} />
          </div>
          <h2 style={{ color: 'var(--crimson-light)', marginBottom: 8 }}>Help is on the way!</h2>
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <ClockIcon size={15} /> Connecting to tracking…
          </p>
        </div>
        <CitizenNav active="sos" />
      </div>
    );
  }

  return (
    <div className="page" style={{ background: 'radial-gradient(ellipse at top,#0a1020 0%,var(--bg) 55%)' }}>
      {/* Navbar */}
      <div className="navbar">
        <div className="navbar__logo">
          <div className="navbar__logo-mark"><AmbulanceIcon size={18} /></div>
          <div className="navbar__logo-text">Med<span>Linka</span></div>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <UserIcon size={14} /> {user?.name}
        </span>
      </div>

      <div className="container" style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Location alerts */}
        {geoLoading && (
          <div className="alert alert--info">
            <span className="spinner" style={{ borderTopColor: '#4FC3F7', flexShrink: 0 }} />
            <span>Acquiring your location…</span>
          </div>
        )}
        {geoError && !geoLoading && (
          <div className="alert alert--error">
            <LocationPinIcon size={18} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600 }}>Location unavailable</div>
              <button onClick={getLocation} className="btn btn--sm btn--ghost" style={{ marginTop: 8 }}>Retry</button>
            </div>
          </div>
        )}
        {lat && lng && !geoLoading && step === 'home' && (
          <div className="alert alert--success">
            <CheckCircleIcon size={18} style={{ flexShrink: 0 }} />
            <span>GPS ready — help can find you</span>
          </div>
        )}

        {/* ── HOME VIEW ──────────────────────────────────────────── */}
        {step === 'home' && (
          <>
            <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
              <h2 style={{ marginBottom: 4 }}>Emergency Help Nearby</h2>
              <p style={{ fontSize: '0.875rem' }}>Tap the SOS button or choose an emergency type below</p>
            </div>

            {/* Big SOS Button */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <button id="sos-btn" className="btn--sos" onClick={() => startEmergency()} aria-label="Send SOS">SOS</button>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', letterSpacing: '0.04em' }}>tap for emergency help</span>
              </div>
            </div>

            {/* Quick action cards */}
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Quick Actions
              </div>
              <div className="quick-action-grid">
                {QUICK_ACTIONS.map(qa => (
                  <button
                    key={qa.id}
                    className="quick-action-card"
                    style={{ '--card-accent': qa.color, '--card-glow': qa.glow } as React.CSSProperties}
                    onClick={() => startEmergency(qa.id)}
                    id={`quick-action-${qa.id}`}
                  >
                    <div className="quick-action-card__icon" style={{ background: qa.glow }}>
                      <span>{qa.emoji}</span>
                    </div>
                    <div className="quick-action-card__label">{qa.label}</div>
                    <div className="quick-action-card__sub">{qa.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── TYPE SELECTION ─────────────────────────────────────── */}
        {step === 'type' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setStep('home')} className="btn btn--ghost btn--sm">← Back</button>
              <h3>What is the emergency?</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {EMERGENCY_TYPES.map(t => (
                <button key={t.id} onClick={() => setEmergencyType(t.id)}
                  style={{
                    padding: '16px 12px', borderRadius: 'var(--r-lg)', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    background: emergencyType === t.id ? t.bg : 'var(--bg-2)',
                    border: `2px solid ${emergencyType === t.id ? t.color : 'var(--border)'}`,
                    color: emergencyType === t.id ? t.color : 'var(--text-2)',
                    transition: 'all 0.2s',
                  }}>
                  {t.icon}
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t.label}</span>
                </button>
              ))}
            </div>
            <button className="btn btn--danger btn--full btn--lg" onClick={() => setStep('details')} disabled={!emergencyType}>
              Continue
            </button>
            <button className="btn btn--ghost btn--full btn--sm" onClick={() => { setEmergencyType('other'); setStep('details'); }}>
              Skip — send SOS immediately
            </button>
          </div>
        )}

        {/* ── PATIENT DETAILS ────────────────────────────────────── */}
        {step === 'details' && (
          <form onSubmit={e => { e.preventDefault(); setStep('confirm'); }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {selectedType && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 'var(--r-lg)', background: selectedType.bg, color: selectedType.color }}>
                {selectedType.icon}
                <span style={{ fontWeight: 600 }}>{selectedType.label}</span>
              </div>
            )}
            <h3>Patient Information <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: '0.85rem' }}>(optional)</span></h3>
            <div className="form-group">
              <label className="form-label">Patient Name</label>
              <div className="input-wrapper">
                <span className="input-icon"><UserIcon size={15} /></span>
                <input className="form-input" placeholder="Full name"
                  value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input className="form-input" type="number" min="0" max="150" placeholder="Patient age"
                value={form.patientAge} onChange={e => setForm({ ...form, patientAge: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Condition / Symptoms</label>
              <textarea className="form-input" placeholder="Describe symptoms…"
                value={form.medicalNotes} onChange={e => setForm({ ...form, medicalNotes: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Address / Landmark</label>
              <div className="input-wrapper">
                <span className="input-icon"><LocationPinIcon size={15} /></span>
                <input className="form-input" placeholder="e.g. Entebbe Road, near Total station"
                  value={form.pickupAddress} onChange={e => setForm({ ...form, pickupAddress: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn--ghost" onClick={() => setStep('type')}>Back</button>
              <button type="submit" className="btn btn--danger flex-1">Next</button>
            </div>
          </form>
        )}

        {/* ── CONFIRM & SEND SOS ─────────────────────────────────── */}
        {step === 'confirm' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            {selectedType && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 'var(--r-full)', background: selectedType.bg, color: selectedType.color, fontWeight: 600 }}>
                {selectedType.icon} {selectedType.label}
              </div>
            )}
            <div className="card w-full" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {form.patientName && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Patient</span><strong>{form.patientName}</strong></div>}
              {form.patientAge && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Age</span><strong>{form.patientAge}</strong></div>}
              {form.pickupAddress && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Location</span><strong style={{ maxWidth: '60%', textAlign: 'right' }}>{form.pickupAddress}</strong></div>}
              {!form.pickupAddress && lat && lng && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Location</span><strong style={{ color: 'var(--green-light)' }}>GPS Acquired</strong></div>}
            </div>
            {error && (
              <div className="alert alert--error w-full">
                <AlertTriangleIcon size={18} style={{ flexShrink: 0 }} /><span>{error}</span>
              </div>
            )}
            <button id="sos-btn-confirm" className="btn--sos" onClick={() => handleSOS()} disabled={isCreating} aria-label="Send SOS">
              {isCreating ? <span className="spinner spinner--lg" style={{ borderTopColor: '#fff' }} /> : 'SOS'}
            </button>
            <button className="btn btn--ghost" onClick={() => setStep('details')}>Edit Details</button>
          </div>
        )}
      </div>

      <CitizenNav active="sos" />
    </div>
  );
}
