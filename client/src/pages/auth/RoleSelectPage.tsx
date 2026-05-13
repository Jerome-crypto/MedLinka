import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ROLES = [
  { id: 'citizen',        emoji: '🧑', name: 'Citizen / Patient', desc: 'Request emergency ambulance help', color: 'var(--green-light)',   bg: 'rgba(56,142,60,0.15)'    },
  { id: 'driver',         emoji: '🚑', name: 'Ambulance Driver',  desc: 'Respond to emergency dispatches', color: 'var(--primary-light)', bg: 'rgba(21,101,192,0.15)'   },
  { id: 'hospital_admin', emoji: '🏥', name: 'Hospital Staff',    desc: 'Manage incoming patients & ER',   color: 'var(--teal-light)',    bg: 'rgba(0,137,123,0.15)'    },
  { id: 'admin',          emoji: '🛡️', name: 'Administrator',     desc: 'System-wide oversight & reports', color: 'var(--amber-light)',   bg: 'rgba(245,124,0,0.15)'    },
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
          >
            <div className="role-card__icon" style={{ background: r.bg }}>
              <span>{r.emoji}</span>
            </div>
            <div className="role-card__name">{r.name}</div>
            <div className="role-card__desc">{r.desc}</div>
            {selected === r.id && (
              <div style={{
                position: 'absolute', top: 10, right: 10,
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', color: '#fff', fontWeight: 800
              }}>✓</div>
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
