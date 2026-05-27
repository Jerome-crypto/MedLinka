import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserIcon, AmbulanceIcon, HospitalIcon, ShieldCrossIcon, CheckCircleIcon,
} from '../../components/common/Icons';

const ROLES = [
  {
    id: 'citizen',
    Icon: UserIcon,
    name: 'Citizen / Patient',
    desc: 'Request emergency ambulance help',
    color: 'var(--green)',
    bg: 'rgba(67,160,71,0.1)',
  },
  {
    id: 'driver',
    Icon: AmbulanceIcon,
    name: 'Ambulance Driver',
    desc: 'Respond to emergency dispatches',
    color: 'var(--primary)',
    bg: 'rgba(25,118,210,0.1)',
  },
  {
    id: 'hospital_admin',
    Icon: HospitalIcon,
    name: 'Hospital Staff',
    desc: 'Manage incoming patients & ER',
    color: 'var(--teal)',
    bg: 'rgba(0,137,123,0.1)',
  },
  {
    id: 'provider_manager',
    Icon: ShieldCrossIcon, // Or a Fleet icon
    name: 'Provider Manager',
    desc: 'Manage ambulance fleet & drivers',
    color: 'var(--blue)',
    bg: 'rgba(33,150,243,0.1)',
  },
  {
    id: 'admin',
    Icon: ShieldCrossIcon,
    name: 'Administrator',
    desc: 'System-wide oversight & reports',
    color: 'var(--amber)',
    bg: 'rgba(251,140,0,0.1)',
  },
];

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('citizen');

  const proceed = () => navigate(`/login?role=${selected}`);

  return (
    <div className="auth-page" style={{ gap: '28px' }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Who are you?</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
          Select your role to personalise your MedLinka experience.
        </p>
      </div>

      <div className="role-grid" style={{ width: '100%', maxWidth: 360 }}>
        {ROLES.map(r => (
          <button
            key={r.id}
            id={`role-${r.id}`}
            className={`role-card${selected === r.id ? ' role-card--selected' : ''}`}
            onClick={() => setSelected(r.id)}
            style={{ position: 'relative' }}
          >
            <div
              className="role-card__icon"
              style={{
                background: selected === r.id ? r.color : r.bg,
                color: selected === r.id ? '#fff' : r.color,
              }}
            >
              <r.Icon size={28} />
            </div>
            <div className="role-card__name">{r.name}</div>
            <div className="role-card__desc">{r.desc}</div>
            {selected === r.id && (
              <div style={{
                position: 'absolute', top: 8, right: 8,
                color: 'var(--primary)',
              }}>
                <CheckCircleIcon size={18} />
              </div>
            )}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button id="role-continue" onClick={proceed} className="btn btn--primary btn--full btn--lg">
          Continue as {ROLES.find(r => r.id === selected)?.name}
        </button>
        <button onClick={() => navigate('/login')} className="btn btn--ghost btn--full btn--sm">
          Skip — go to login
        </button>
      </div>
    </div>
  );
}
