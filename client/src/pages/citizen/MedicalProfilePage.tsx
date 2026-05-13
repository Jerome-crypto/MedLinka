import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import CitizenNav from '../../components/layout/CitizenNav';
import { UserIcon, AlertTriangleIcon, CheckCircleIcon } from '../../components/common/Icons';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STORAGE_KEY = 'medlinka-medical-profile';

interface MedProfile {
  bloodGroup: string;
  allergies: string[];
  conditions: string;
  emergencyContact: string;
  emergencyPhone: string;
  preferredHospital: string;
}

const DEFAULT: MedProfile = { bloodGroup: '', allergies: [], conditions: '', emergencyContact: '', emergencyPhone: '', preferredHospital: '' };

export default function MedicalProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<MedProfile>(DEFAULT);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<MedProfile>(DEFAULT);
  const [tagInput, setTagInput] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) { const p = JSON.parse(stored); setProfile(p); setDraft(p); }
  }, []);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setProfile(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !draft.allergies.includes(t)) {
      setDraft(d => ({ ...d, allergies: [...d.allergies, t] }));
    }
    setTagInput('');
  };
  const removeTag = (tag: string) => setDraft(d => ({ ...d, allergies: d.allergies.filter(a => a !== tag) }));

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="page" style={{ background: 'radial-gradient(ellipse at top,#071020 0%,var(--bg) 55%)' }}>
      <div className="navbar">
        <div className="navbar__logo">
          <div className="navbar__logo-mark"><UserIcon size={18} /></div>
          <div className="navbar__logo-text">Medical <span>Profile</span></div>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={() => editing ? setEditing(false) : setEditing(true)}>
          {editing ? 'Cancel' : '✏️ Edit'}
        </button>
      </div>

      <div className="container" style={{ paddingTop: 24, paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {saved && (
          <div className="alert alert--success animate-fade">
            <CheckCircleIcon size={18} style={{ flexShrink: 0 }} />
            <span>Medical profile saved successfully!</span>
          </div>
        )}

        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', background: 'var(--bg-2)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-2)' }}>
          <div className="profile-avatar">{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>{user?.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginTop: 2 }}>{user?.phone}</div>
            {profile.bloodGroup && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="blood-group-badge">{profile.bloodGroup}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Blood Type</span>
              </div>
            )}
          </div>
        </div>

        {/* Blood Group */}
        <div className="profile-card">
          <div className="profile-section__title">🩸 Blood Group</div>
          {editing ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {BLOOD_GROUPS.map(g => (
                <button key={g} onClick={() => setDraft(d => ({ ...d, bloodGroup: g }))}
                  style={{ padding: '8px 16px', borderRadius: 'var(--r-full)', border: `2px solid ${draft.bloodGroup === g ? 'var(--crimson-light)' : 'var(--border)'}`, background: draft.bloodGroup === g ? 'rgba(211,47,47,0.15)' : 'var(--bg-3)', color: draft.bloodGroup === g ? 'var(--crimson-light)' : 'var(--text-2)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                  {g}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: profile.bloodGroup ? 'var(--crimson-light)' : 'var(--text-3)' }}>
              {profile.bloodGroup || 'Not set'}
            </div>
          )}
        </div>

        {/* Allergies */}
        <div className="profile-card">
          <div className="profile-section__title">⚠️ Allergies</div>
          <div className="medical-tags">
            {(editing ? draft.allergies : profile.allergies).map(tag => (
              <div key={tag} className="medical-tag">
                {tag}
                {editing && (
                  <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '0 0 0 4px', lineHeight: 1 }}>✕</button>
                )}
              </div>
            ))}
            {!editing && profile.allergies.length === 0 && <span style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>None listed</span>}
          </div>
          {editing && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input className="form-input" placeholder="Add allergy…" value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
              <button className="btn btn--primary btn--sm" onClick={addTag}>Add</button>
            </div>
          )}
        </div>

        {/* Medical Conditions */}
        <div className="profile-card">
          <div className="profile-section__title">🏥 Medical Conditions</div>
          {editing ? (
            <textarea className="form-input" placeholder="e.g. Hypertension, Diabetes…"
              value={draft.conditions} onChange={e => setDraft(d => ({ ...d, conditions: e.target.value }))} />
          ) : (
            <div style={{ color: profile.conditions ? 'var(--text)' : 'var(--text-3)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {profile.conditions || 'None listed'}
            </div>
          )}
        </div>

        {/* Emergency Contact */}
        <div className="profile-card">
          <div className="profile-section__title">📞 Emergency Contact</div>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="form-input" placeholder="Contact name"
                value={draft.emergencyContact} onChange={e => setDraft(d => ({ ...d, emergencyContact: e.target.value }))} />
              <input className="form-input" type="tel" placeholder="Phone number"
                value={draft.emergencyPhone} onChange={e => setDraft(d => ({ ...d, emergencyPhone: e.target.value }))} />
            </div>
          ) : (
            profile.emergencyContact
              ? <div><div style={{ fontWeight: 600 }}>{profile.emergencyContact}</div><div style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>{profile.emergencyPhone}</div></div>
              : <div style={{ color: 'var(--text-3)' }}>Not set</div>
          )}
        </div>

        {/* Preferred Hospital */}
        <div className="profile-card">
          <div className="profile-section__title">🏥 Preferred Hospital</div>
          {editing ? (
            <input className="form-input" placeholder="Hospital name"
              value={draft.preferredHospital} onChange={e => setDraft(d => ({ ...d, preferredHospital: e.target.value }))} />
          ) : (
            <div style={{ color: profile.preferredHospital ? 'var(--text)' : 'var(--text-3)' }}>
              {profile.preferredHospital || 'Not set'}
            </div>
          )}
        </div>

        {editing && (
          <button className="btn btn--primary btn--full btn--lg" onClick={save}>💾 Save Medical Profile</button>
        )}

        {!editing && !profile.bloodGroup && (
          <div className="alert alert--warning">
            <AlertTriangleIcon size={18} style={{ flexShrink: 0 }} />
            <span>Complete your medical profile — it helps first responders prepare before they arrive.</span>
          </div>
        )}
      </div>

      <CitizenNav active="profile" />
    </div>
  );
}
