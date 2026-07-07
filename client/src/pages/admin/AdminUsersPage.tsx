import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { hospitalApi } from '../../api/hospital.api';
import {
  ArrowLeftIcon, UserIcon, AmbulanceIcon, HospitalIcon,
  ShieldCrossIcon, EditIcon, TrashIcon,
} from '../../components/common/Icons';

// ── Mini Icons ────────────────────────────────────────────────────────
function Plus() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ── Role meta ─────────────────────────────────────────────────────────
const ROLE_META = {
  citizen:          { label: 'Citizen',          color: 'var(--green-light)',   bg: 'var(--green-bg)',         icon: <UserIcon size={14} /> },
  driver:           { label: 'Driver',           color: 'var(--primary-light)', bg: 'var(--primary-glow)',     icon: <AmbulanceIcon size={14} /> },
  hospital_admin:   { label: 'Hospital Admin',   color: 'var(--teal-light)',    bg: 'var(--teal-glow)',        icon: <HospitalIcon size={14} /> },
  provider_manager: { label: 'Provider Manager', color: 'var(--amber-light)',   bg: 'rgba(255,179,0,0.12)',    icon: <ShieldCrossIcon size={14} /> },
  admin:            { label: 'Admin',            color: 'var(--crimson-light)', bg: 'rgba(211,47,47,0.12)',    icon: <ShieldCrossIcon size={14} /> },
};

type RoleKey = keyof typeof ROLE_META;

interface UserRecord {
  id: string; name: string; phone?: string; email: string;
  role: RoleKey; isActive: boolean; createdAt: string;
  hospitalId?: string | null; providerId?: string | null;
}

const BLANK = { name: '', phone: '', email: '', password: '', role: 'driver' as RoleKey, hospitalId: '', providerId: '', isActive: true };

// ── Page ──────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const navigate = useNavigate();

  const [users,     setUsers]     = useState<UserRecord[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState<RoleKey | 'all'>('all');

  // Create / Edit modal
  const [showModal,   setShowModal]   = useState(false);
  const [editId,      setEditId]      = useState<string | null>(null);
  const [form,        setForm]        = useState(BLANK);
  const [saving,      setSaving]      = useState(false);
  const [formError,   setFormError]   = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  // ── Data fetching ───────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/admin/users');
      setUsers(res.data.data.users);
    } catch { } finally { setLoading(false); }
  };

  const fetchHospitals = async () => {
    try { const res = await hospitalApi.list(); setHospitals(res.data.data); } catch { }
  };

  const fetchProviders = async () => {
    try { const res = await apiClient.get('/providers'); setProviders(res.data.data); } catch { }
  };

  useEffect(() => { fetchUsers(); fetchHospitals(); fetchProviders(); }, []);

  // ── Open create modal ───────────────────────────────────────────────
  const openCreate = () => {
    setEditId(null);
    setForm(BLANK);
    setFormError('');
    setShowModal(true);
  };

  // ── Open edit modal ─────────────────────────────────────────────────
  const openEdit = (u: UserRecord) => {
    setEditId(u.id);
    setForm({
      name:       u.name,
      email:      u.email,
      phone:      u.phone || '',
      password:   '',
      role:       u.role,
      hospitalId: u.hospitalId || '',
      providerId: u.providerId || '',
      isActive:   u.isActive,
    });
    setFormError('');
    setShowModal(true);
  };

  // ── Save (create or update) ─────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      if (editId) {
        // UPDATE
        const body: Record<string, unknown> = {
          name:       form.name,
          email:      form.email,
          phone:      form.phone || null,
          role:       form.role,
          isActive:   form.isActive,
          hospitalId: form.hospitalId || null,
          providerId: form.providerId || null,
        };
        if (form.password) body.password = form.password;
        await apiClient.patch(`/admin/users/${editId}`, body);
      } else {
        // CREATE — same logic as before, routed through the new admin endpoint
        if (form.role === 'hospital_admin') {
          if (!form.hospitalId) { setFormError('Please select a hospital for this administrator'); setSaving(false); return; }
          const { providerId, hospitalId, ...body } = form;
          await hospitalApi.createAdmin(hospitalId, body);
        } else if (form.role === 'provider_manager') {
          if (!form.providerId) { setFormError('Please select a provider for this manager'); setSaving(false); return; }
          const { providerId, name, email, password, phone } = form;
          await apiClient.post(`/providers/${providerId}/managers`, { name, email, password, phone });
        } else {
          await apiClient.post('/admin/users', {
            name:       form.name,
            email:      form.email,
            password:   form.password,
            phone:      form.phone || undefined,
            role:       form.role,
            hospitalId: form.hospitalId || undefined,
            providerId: form.providerId || undefined,
          });
        }
      }
      setShowModal(false);
      setForm(BLANK);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Operation failed');
    } finally { setSaving(false); }
  };

  // ── Delete ─────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/admin/users/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally { setDeleting(false); }
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="page">
      {/* Navbar */}
      <div className="navbar">
        <button onClick={() => navigate('/admin/dashboard')} className="btn btn--ghost btn--sm btn--icon">
          <ArrowLeftIcon size={18} />
        </button>
        <div className="navbar__logo">
          <div className="navbar__logo-mark"><UserIcon size={18} /></div>
          <div className="navbar__logo-text">User <span>Management</span></div>
        </div>
        <button onClick={openCreate} className="btn btn--primary btn--sm"
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

      {/* User list */}
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
        ) : filtered.map(u => {
          const meta = ROLE_META[u.role] || ROLE_META.citizen;
          return (
            <div key={u.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Avatar */}
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: meta.color, fontFamily: 'var(--font-display)', fontWeight: 700,
                opacity: u.isActive ? 1 : 0.45,
              }}>
                {u.name.slice(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <strong className="truncate" style={{ opacity: u.isActive ? 1 : 0.55 }}>{u.name}</strong>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '2px 8px', borderRadius: 'var(--r-full)',
                    background: meta.bg, color: meta.color, fontSize: '0.7rem', fontWeight: 700,
                  }}>
                    {meta.icon} {meta.label}
                  </span>
                  {!u.isActive && (
                    <span style={{
                      padding: '2px 8px', borderRadius: 'var(--r-full)',
                      background: 'rgba(150,150,150,0.12)', color: 'var(--text-3)',
                      fontSize: '0.7rem', fontWeight: 700,
                    }}>Inactive</span>
                  )}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginTop: '3px' }}>{u.email}</div>
                {u.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{u.phone}</div>}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => openEdit(u)}
                  className="btn btn--ghost btn--sm btn--icon"
                  title="Edit user"
                  style={{ color: 'var(--teal-light)' }}
                >
                  <EditIcon size={16} />
                </button>
                <button
                  onClick={() => setDeleteTarget(u)}
                  className="btn btn--ghost btn--sm btn--icon"
                  title="Delete user"
                  style={{ color: 'var(--crimson-light)' }}
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Create / Edit Modal ───────────────────────────────────────── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="card card--elevated animate-fade" style={{
            width: '100%', maxWidth: '480px', borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
            padding: '28px 24px 40px', display: 'flex', flexDirection: 'column', gap: '14px',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <h3>{editId ? 'Edit User Account' : 'Create Staff Account'}</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '-8px', color: 'var(--text-2)' }}>
              {editId
                ? 'Update name, contact, role or status. Leave password blank to keep existing.'
                : 'Create driver, hospital admin, or provider manager accounts.'}
            </p>

            {formError && (
              <div className="alert alert--error"><span>{formError}</span></div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Role — only shown when creating */}
              {!editId && (
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-input" value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as RoleKey, hospitalId: '', providerId: '' })}>
                    <option value="driver">Driver</option>
                    <option value="hospital_admin">Hospital Admin</option>
                    <option value="provider_manager">Provider Manager</option>
                    <option value="admin">Admin</option>
                    <option value="citizen">Citizen</option>
                  </select>
                </div>
              )}

              {/* Hospital association */}
              {(form.role === 'hospital_admin' || form.role === 'driver') && (
                <div className="form-group animate-fade">
                  <label className="form-label">
                    Associate Hospital {form.role === 'hospital_admin' ? '*' : '(Optional)'}
                  </label>
                  <select className="form-input" required={form.role === 'hospital_admin' && !editId}
                    value={form.hospitalId} onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}>
                    <option value="">Select Hospital</option>
                    {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
              )}

              {/* Provider association */}
              {(form.role === 'provider_manager' || form.role === 'driver') && (
                <div className="form-group animate-fade">
                  <label className="form-label">
                    Associate Provider {form.role === 'provider_manager' ? '*' : '(Optional)'}
                  </label>
                  <select className="form-input" required={form.role === 'provider_manager' && !editId}
                    value={form.providerId} onChange={(e) => setForm({ ...form, providerId: e.target.value })}>
                    <option value="">Select Provider</option>
                    {providers.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
                  </select>
                </div>
              )}

              {/* Core fields */}
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
                <label className="form-label">
                  Phone Number <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input className="form-input" type="tel" placeholder="+256700000000"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">
                  {editId ? 'New Password' : 'Temporary Password *'}
                  {editId && <span style={{ color: 'var(--text-3)', fontWeight: 400 }}> (leave blank to keep)</span>}
                </label>
                <input className="form-input" type="password" minLength={6}
                  required={!editId} placeholder="Min. 6 characters"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>

              {/* Active status toggle — only shown when editing */}
              {editId && (
                <div className="form-group animate-fade">
                  <label className="form-label">Account Status</label>
                  <select className="form-input" value={form.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive (suspended)</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="button" className="btn btn--ghost flex-1"
                  onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary flex-1" disabled={saving}>
                  {saving
                    ? <span className="spinner" style={{ borderTopColor: '#fff' }} />
                    : editId ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────── */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }} onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="card card--elevated animate-fade" style={{
            width: '100%', maxWidth: '380px', borderRadius: 'var(--r-xl)',
            padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            {/* Icon */}
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'rgba(211,47,47,0.12)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--crimson-light)', margin: '0 auto',
            }}>
              <TrashIcon size={24} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '6px' }}>Delete User</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>
                Are you sure you want to permanently delete{' '}
                <strong>{deleteTarget.name}</strong>? This will also remove all their
                associated records. This action cannot be undone.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn--ghost flex-1" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                className="btn flex-1"
                style={{ background: 'var(--crimson)', color: '#fff' }}
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting
                  ? <span className="spinner" style={{ borderTopColor: '#fff' }} />
                  : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
