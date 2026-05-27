import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { hospitalApi } from '../../api/hospital.api';
import { ArrowLeftIcon, UserIcon, AmbulanceIcon, HospitalIcon, ShieldCrossIcon } from '../../components/common/Icons';

function Plus() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

const ROLE_META = {
  citizen:        { label: 'Citizen',       color: 'var(--green-light)',   bg: 'var(--green-bg)',     icon: <UserIcon size={14} /> },
  driver:         { label: 'Driver',        color: 'var(--primary-light)', bg: 'var(--primary-glow)', icon: <AmbulanceIcon size={14} /> },
  hospital_admin: { label: 'Hospital Admin',color: 'var(--teal-light)',    bg: 'var(--teal-glow)',    icon: <HospitalIcon size={14} /> },
  provider_manager: { label: 'Provider Manager',color: 'var(--amber-light)',bg: 'rgba(255,179,0,0.12)',icon: <ShieldCrossIcon size={14} /> },
  admin:          { label: 'Admin',         color: 'var(--crimson-light)', bg: 'rgba(211,47,47,0.12)',icon: <ShieldCrossIcon size={14} /> },
};

type RoleKey = keyof typeof ROLE_META;

interface UserRecord { id: string; name: string; phone?: string; email: string; role: RoleKey; createdAt: string; }

const BLANK = { name: '', phone: '', email: '', password: '', role: 'driver' as RoleKey, hospitalId: '' };

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RoleKey | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/admin/users');
      setUsers(res.data.data.users);
    } catch { } finally { setLoading(false); }
  };

  const fetchHospitals = async () => {
    try {
      const res = await hospitalApi.list();
      setHospitals(res.data.data);
    } catch { }
  };

  useEffect(() => {
    fetchUsers();
    fetchHospitals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      if (form.role === 'hospital_admin') {
        if (!form.hospitalId) {
          setFormError('Please select a hospital for this administrator');
          setSaving(false);
          return;
        }
        const { hospitalId, ...body } = form;
        await hospitalApi.createAdmin(hospitalId, body);
      } else {
        const { hospitalId, ...body } = form;
        await apiClient.post('/auth/register', body);
      }
      setShowModal(false);
      setForm(BLANK);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create account');
    } finally { setSaving(false); }
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  return (
    <div className="page">
      <div className="navbar">
        <button onClick={() => navigate('/admin/dashboard')} className="btn btn--ghost btn--sm btn--icon">
          <ArrowLeftIcon size={18} />
        </button>
        <div className="navbar__logo">
          <div className="navbar__logo-mark"><UserIcon size={18} /></div>
          <div className="navbar__logo-text">User <span>Management</span></div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn--primary btn--sm"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Plus /> New User
        </button>
      </div>

      {/* Role filter tabs */}
      <div style={{ padding: '12px 16px 0', display: 'flex', gap: '6px', overflowX: 'auto' }}>
        {(['all', 'citizen', 'driver', 'hospital_admin', 'provider_manager', 'admin'] as const).map(r => (
          <button key={r} onClick={() => setFilter(r)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer',
              fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap',
              background: filter === r ? 'var(--primary)' : 'var(--bg-3)',
              color: filter === r ? '#fff' : 'var(--text-3)',
              transition: 'all 0.2s',
            }}>
            {r === 'all' ? 'All Users' : ROLE_META[r].label}
          </button>
        ))}
      </div>

      <div className="page-content mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <span className="spinner spinner--lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center" style={{ padding: '40px 20px' }}>
            <UserIcon size={40} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
            <p>No {filter === 'all' ? '' : ROLE_META[filter as RoleKey].label + ' '}users found.</p>
          </div>
        ) : (
          filtered.map(u => {
            const meta = ROLE_META[u.role] || ROLE_META.citizen;
            return (
              <div key={u.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                  background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: meta.color, fontFamily: 'var(--font-display)', fontWeight: 700,
                }}>
                  {u.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <strong className="truncate">{u.name}</strong>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: 'var(--r-full)', background: meta.bg, color: meta.color, fontSize: '0.7rem', fontWeight: 700 }}>
                      {meta.icon} {meta.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginTop: '3px' }}>{u.email}</div>
                  {u.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{u.phone}</div>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="card card--elevated animate-fade" style={{
            width: '100%', maxWidth: '480px', borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
            padding: '28px 24px 40px', display: 'flex', flexDirection: 'column', gap: '14px',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3>Create Staff Account</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '-8px' }}>Create driver or hospital admin accounts.</p>

            {formError && (
              <div className="alert alert--error">
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as RoleKey })}>
                  <option value="driver">Driver</option>
                  <option value="hospital_admin">Hospital Admin</option>
                </select>
              </div>

              {form.role === 'hospital_admin' && (
                <div className="form-group animate-fade">
                  <label className="form-label">Associate Hospital *</label>
                  <select className="form-input" required value={form.hospitalId}
                    onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}>
                    <option value="">Select Hospital</option>
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" required placeholder="John Mukasa"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" required type="email" placeholder="staff@medlinka.ug"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
                <input className="form-input" type="tel" placeholder="+256700000000"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Temporary Password *</label>
                <input className="form-input" required type="password" minLength={6} placeholder="Min. 6 characters"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="button" className="btn btn--ghost flex-1" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary flex-1" disabled={saving}>
                  {saving ? <span className="spinner" style={{ borderTopColor: '#fff' }} /> : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
