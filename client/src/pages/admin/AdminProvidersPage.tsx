import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { providerApi } from '../../api/provider.api';
import { useToast } from '../../components/common/ToastManager';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import { AmbulanceIcon, ArrowLeftIcon, UserIcon, RefreshIcon } from '../../components/common/Icons';

interface Provider {
  id: string;
  name: string;
  type: 'hospital' | 'private' | 'ngo' | 'government';
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  operatingStatus: boolean;
  createdAt: string;
  _count?: {
    ambulances: number;
    users: number;
  };
}

export default function AdminProvidersPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modals
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [showAddManager, setShowAddManager] = useState(false);

  // Form states
  const [newProvider, setNewProvider] = useState({
    name: '',
    type: 'private' as 'hospital' | 'private' | 'ngo' | 'government',
    contactEmail: '',
    contactPhone: '',
    address: '',
  });

  const [newManager, setNewManager] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const fetchProviders = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await providerApi.list();
      setProviders(res.data);
    } catch {
      toast.error('Failed to load ambulance providers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadProviderDetails = async (id: string) => {
    try {
      const res = await providerApi.getById(id);
      setSelectedProvider(res.data);
    } catch {
      toast.error('Failed to load provider details');
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await providerApi.create(newProvider);
      toast.success('Provider registered', `${newProvider.name} has been added`);
      setShowAddProvider(false);
      setNewProvider({ name: '', type: 'private', contactEmail: '', contactPhone: '', address: '' });
      fetchProviders(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create provider');
    }
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;
    try {
      await providerApi.createManager(selectedProvider.id, newManager);
      toast.success('Manager created', 'Provider Manager account registered');
      setShowAddManager(false);
      setNewManager({ name: '', email: '', password: '', phone: '' });
      // Refresh details
      loadProviderDetails(selectedProvider.id);
      fetchProviders(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create manager account');
    }
  };

  return (
    <div className="page">
      <div className="navbar">
        <button onClick={() => navigate('/admin/dashboard')} className="btn btn--ghost btn--sm btn--icon">
          <ArrowLeftIcon size={18} />
        </button>
        <div className="navbar__logo">
          <div className="navbar__logo-mark"><AmbulanceIcon size={18} /></div>
          <div className="navbar__logo-text">Ambulance <span>Providers</span></div>
        </div>
        <button onClick={() => fetchProviders(true)} className="btn btn--ghost btn--sm btn--icon" disabled={refreshing}>
          <RefreshIcon size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Partner Lists</h3>
          <button onClick={() => setShowAddProvider(true)} className="btn btn--primary btn--sm">
            + Add Provider
          </button>
        </div>

        {loading ? (
          <SkeletonCard count={3} />
        ) : providers.length === 0 ? (
          <div className="card text-center" style={{ padding: '40px 20px' }}>
            <p style={{ color: 'var(--text-3)' }}>No ambulance providers registered yet.</p>
          </div>
        ) : (
          providers.map(prov => (
            <div key={prov.id} className="card card--accent-left-primary" style={{ cursor: 'pointer' }}
              onClick={() => loadProviderDetails(prov.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{prov.name}</h4>
                  <span style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: 'var(--primary-light)', fontWeight: 600 }}>
                    {prov.type} Provider
                  </span>
                </div>
                <span className={`badge badge--${prov.operatingStatus ? 'success' : 'neutral'}`}>
                  {prov.operatingStatus ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {prov.address && <div>📍 {prov.address}</div>}
                {prov.contactEmail && <div>✉ {prov.contactEmail}</div>}
              </div>

              <div className="divider" style={{ margin: '12px 0' }} />
              
              <div style={{ display: 'flex', gap: 20, fontSize: '0.8rem' }}>
                <div><strong>{prov._count?.ambulances || 0}</strong> Ambulances</div>
                <div><strong>{prov._count?.users || 0}</strong> Personnel / Managers</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: Add Provider */}
      {showAddProvider && (
        <div className="modal-overlay" onClick={() => setShowAddProvider(false)}>
          <div className="modal-content animate-scale" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Register New Provider</h3>
            <form onSubmit={handleCreateProvider} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Provider Name *</label>
                <input className="form-input" placeholder="e.g. Red Cross Uganda" required
                  value={newProvider.name} onChange={e => setNewProvider({ ...newProvider, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select className="form-input" value={newProvider.type}
                  onChange={e => setNewProvider({ ...newProvider, type: e.target.value as any })}>
                  <option value="private">Private</option>
                  <option value="ngo">NGO (Non-Government)</option>
                  <option value="government">Government</option>
                  <option value="hospital">Hospital Operated</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input className="form-input" type="email" placeholder="contact@domain.com"
                  value={newProvider.contactEmail} onChange={e => setNewProvider({ ...newProvider, contactEmail: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input className="form-input" placeholder="+256700000000"
                  value={newProvider.contactPhone} onChange={e => setNewProvider({ ...newProvider, contactPhone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Office Address</label>
                <input className="form-input" placeholder="Kampala Road, Central Division"
                  value={newProvider.address} onChange={e => setNewProvider({ ...newProvider, address: e.target.value })} />
              </div>
              
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowAddProvider(false)} className="btn btn--ghost flex-1">Cancel</button>
                <button type="submit" className="btn btn--primary flex-1">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Provider Details */}
      {selectedProvider && (
        <div className="modal-overlay" onClick={() => setSelectedProvider(null)}>
          <div className="modal-content animate-scale" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: 4 }}>{selectedProvider.name}</h3>
            <span style={{ fontSize: '0.8rem', textTransform: 'capitalize', color: 'var(--primary-light)', fontWeight: 600 }}>
              {selectedProvider.type} Provider
            </span>

            <div className="divider" style={{ margin: '16px 0' }} />

            {/* Managers Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0 }}>Managers</h4>
              <button onClick={() => setShowAddManager(true)} className="btn btn--primary btn--xs">+ Add Manager</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {selectedProvider.users?.filter((u: any) => u.role === 'provider_manager').length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', margin: 0 }}>No managers assigned.</p>
              ) : (
                selectedProvider.users?.filter((u: any) => u.role === 'provider_manager').map((u: any) => (
                  <div key={u.id} className="card card--compact" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-3)' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserIcon size={14} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{u.phone || 'No phone'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Ambulances Section */}
            <h4 style={{ margin: '0 0 12px 0' }}>Fleet ({selectedProvider.ambulances?.length || 0})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedProvider.ambulances?.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', margin: 0 }}>No ambulances assigned.</p>
              ) : (
                selectedProvider.ambulances?.map((a: any) => (
                  <div key={a.id} className="card card--compact" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AmbulanceIcon size={16} style={{ color: 'var(--primary-light)' }} />
                      <strong style={{ fontSize: '0.85rem' }}>{a.plateNumber}</strong>
                    </div>
                    <span className="badge badge--success" style={{ fontSize: '0.7rem' }}>{a.status}</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button onClick={() => setSelectedProvider(null)} className="btn btn--ghost">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL: Add Manager */}
      {showAddManager && (
        <div className="modal-overlay" style={{ zIndex: 1001 }} onClick={() => setShowAddManager(false)}>
          <div className="modal-content animate-scale" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Add Provider Manager</h3>
            <form onSubmit={handleCreateManager} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="e.g. John Okello" required
                  value={newManager.name} onChange={e => setNewManager({ ...newManager, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" placeholder="john.o@provider.com" required
                  value={newManager.email} onChange={e => setNewManager({ ...newManager, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" placeholder="+256700000000"
                  value={newManager.phone} onChange={e => setNewManager({ ...newManager, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" placeholder="••••••••" required minLength={6}
                  value={newManager.password} onChange={e => setNewManager({ ...newManager, password: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowAddManager(false)} className="btn btn--ghost flex-1">Cancel</button>
                <button type="submit" className="btn btn--primary flex-1">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
