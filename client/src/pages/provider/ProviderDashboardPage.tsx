import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { providerApi } from '../../api/provider.api';
import { ambulanceApi } from '../../api/ambulance.api';
import { hospitalApi } from '../../api/hospital.api';
import { useToast } from '../../components/common/ToastManager';
import { AmbulanceIcon, UserIcon, LogOutIcon, RefreshIcon, ShieldCrossIcon, HospitalIcon } from '../../components/common/Icons';

export default function ProviderDashboardPage() {
  const { user, logout } = useAuthStore();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'fleet' | 'drivers'>('fleet');
  const [data, setData] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showAddAmbulance, setShowAddAmbulance] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [assigningAmbulance, setAssigningAmbulance] = useState<any | null>(null);

  // Forms
  const [newAmb, setNewAmb] = useState({
    plateNumber: '',
    assignedHospitalId: '',
    ambulanceType: 'Type B',
    equipmentLevel: 2,
  });

  const [newDriver, setNewDriver] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const fleetRes = await providerApi.getMyFleet();
      if (fleetRes.success) setData(fleetRes.data);

      const driversRes = await providerApi.getMyDrivers();
      if (driversRes.success) setDrivers(driversRes.data);

      const hospRes = await hospitalApi.list();
      if (hospRes.data.success) setHospitals(hospRes.data.data);
    } catch {
      toast.error('Failed to sync provider details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddAmbulance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        ...newAmb,
        assignedHospitalId: newAmb.assignedHospitalId || undefined,
      };
      await ambulanceApi.create(body);
      toast.success('Ambulance added', `Ambulance ${newAmb.plateNumber} is registered`);
      setShowAddAmbulance(false);
      setNewAmb({ plateNumber: '', assignedHospitalId: '', ambulanceType: 'Type B', equipmentLevel: 2 });
      fetchData(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register ambulance');
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await providerApi.createDriver(newDriver);
      toast.success('Driver registered', `${newDriver.name} is added to your personnel`);
      setShowAddDriver(false);
      setNewDriver({ name: '', email: '', phone: '', password: '' });
      fetchData(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register driver');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await ambulanceApi.updateStatus(id, status);
      toast.success('Status updated', `Ambulance is now ${status}`);
      fetchData(true);
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleAssignDriver = async (driverId: string | null) => {
    if (!assigningAmbulance) return;
    try {
      await ambulanceApi.assignDriver(assigningAmbulance.id, driverId);
      toast.success('Assignment updated', 'Driver assigned to ambulance');
      setAssigningAmbulance(null);
      fetchData(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update assignment');
    }
  };

  const handleDeleteAmbulance = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ambulance?')) return;
    try {
      await ambulanceApi.remove(id);
      toast.success('Ambulance removed', 'Ambulance successfully deleted');
      fetchData(true);
    } catch (err: any) {
      toast.error('Failed to delete ambulance');
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <span className="spinner spinner--lg" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="navbar">
        <div className="navbar__logo">
          <div className="navbar__logo-mark"><AmbulanceIcon size={18} /></div>
          <div className="navbar__logo-text">Provider <span>Portal</span></div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => fetchData(true)} className="btn btn--ghost btn--sm btn--icon" disabled={refreshing}>
            <RefreshIcon size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <button onClick={() => logout()} className="btn btn--ghost btn--sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <LogOutIcon size={13} /> Sign out
          </button>
        </div>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Welcome block */}
        <div className="card card--accent-left-primary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0 }}>{user?.name}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Provider Manager</span>
          </div>
          {data?.provider && (
            <span className="badge badge--success" style={{ fontWeight: 700, textTransform: 'capitalize' }}>
              🏥 {data.provider.name}
            </span>
          )}
        </div>

        {/* Stats Grid */}
        {data?.summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <div className="stat-card" style={{ padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--green-light)' }}>{data.summary.available}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Available</div>
            </div>
            <div className="stat-card" style={{ padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-light)' }}>{data.summary.dispatched}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Dispatched</div>
            </div>
            <div className="stat-card" style={{ padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-3)' }}>{data.summary.offline}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Offline</div>
            </div>
            <div className="stat-card" style={{ padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--crimson-light)' }}>{data.summary.maintenance}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Maintenance</div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setActiveTab('fleet')}
            style={{
              padding: '12px 24px', background: 'none', border: 'none',
              borderBottom: activeTab === 'fleet' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'fleet' ? 'var(--text)' : 'var(--text-3)',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}>
            Fleet ({data?.ambulances?.length || 0})
          </button>
          <button onClick={() => setActiveTab('drivers')}
            style={{
              padding: '12px 24px', background: 'none', border: 'none',
              borderBottom: activeTab === 'drivers' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'drivers' ? 'var(--text)' : 'var(--text-3)',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}>
            Drivers ({drivers.length})
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === 'fleet' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0 }}>Ambulance Fleet</h4>
              <button onClick={() => setShowAddAmbulance(true)} className="btn btn--primary btn--sm">+ Register Ambulance</button>
            </div>

            {data?.ambulances?.length === 0 ? (
              <div className="card text-center" style={{ padding: 30 }}>
                <p style={{ color: 'var(--text-3)' }}>No ambulances registered yet.</p>
              </div>
            ) : (
              data.ambulances.map((amb: any) => (
                <div key={amb.id} className="card card--compact" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <AmbulanceIcon size={20} style={{ color: 'var(--primary-light)' }} />
                      <strong style={{ fontSize: '1.05rem' }}>{amb.plateNumber}</strong>
                    </div>
                    <button onClick={() => handleDeleteAmbulance(amb.id)} className="btn btn--ghost btn--xs" style={{ color: 'var(--crimson-light)' }}>
                      Delete
                    </button>
                  </div>

                  <div className="grid-2" style={{ gap: 8, fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-3)' }}>Driver:</span>{' '}
                      <button onClick={() => setAssigningAmbulance(amb)} className="btn btn--ghost btn--xs" style={{ padding: '2px 4px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {amb.driver ? `👤 ${amb.driver.name}` : 'Assign Driver'}
                      </button>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-3)' }}>Hospital:</span>{' '}
                      <strong>{amb.hospital?.name || 'Central dispatch'}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Status:</label>
                    <select className="form-input flex-1" style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                      value={amb.status} onChange={e => handleStatusChange(amb.id, e.target.value)}>
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="offline">Offline</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0 }}>Provider Personnel</h4>
              <button onClick={() => setShowAddDriver(true)} className="btn btn--primary btn--sm">+ Register Driver</button>
            </div>

            {drivers.length === 0 ? (
              <div className="card text-center" style={{ padding: 30 }}>
                <p style={{ color: 'var(--text-3)' }}>No drivers registered yet.</p>
              </div>
            ) : (
              drivers.map((drv: any) => (
                <div key={drv.id} className="card card--compact" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                    <UserIcon size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '0.9rem' }}>{drv.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>✉ {drv.email}</div>
                  </div>
                  {drv.phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{drv.phone}</div>}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* MODAL: Add Ambulance */}
      {showAddAmbulance && (
        <div className="modal-overlay" onClick={() => setShowAddAmbulance(false)}>
          <div className="modal-content animate-scale" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Register Ambulance</h3>
            <form onSubmit={handleAddAmbulance} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Plate Number *</label>
                <input className="form-input" placeholder="e.g. UBA 123A" required
                  value={newAmb.plateNumber} onChange={e => setNewAmb({ ...newAmb, plateNumber: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Ambulance Type</label>
                <input className="form-input" placeholder="e.g. Type B"
                  value={newAmb.ambulanceType} onChange={e => setNewAmb({ ...newAmb, ambulanceType: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Equipment Level</label>
                <select className="form-input" value={newAmb.equipmentLevel}
                  onChange={e => setNewAmb({ ...newAmb, equipmentLevel: parseInt(e.target.value) })}>
                  <option value="1">Basic Life Support (BLS)</option>
                  <option value="2">Advanced Life Support (ALS)</option>
                  <option value="3">Specialist ICU Level</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Hospital Assignment (Optional)</label>
                <select className="form-input" value={newAmb.assignedHospitalId}
                  onChange={e => setNewAmb({ ...newAmb, assignedHospitalId: e.target.value })}>
                  <option value="">Central Dispatch (No specific Hospital)</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowAddAmbulance(false)} className="btn btn--ghost flex-1">Cancel</button>
                <button type="submit" className="btn btn--primary flex-1">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Driver */}
      {showAddDriver && (
        <div className="modal-overlay" onClick={() => setShowAddDriver(false)}>
          <div className="modal-content animate-scale" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Register Driver</h3>
            <form onSubmit={handleAddDriver} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="e.g. Isaac Mugabi" required
                  value={newDriver.name} onChange={e => setNewDriver({ ...newDriver, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" placeholder="isaac@provider.com" required
                  value={newDriver.email} onChange={e => setNewDriver({ ...newDriver, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" placeholder="+256700000000"
                  value={newDriver.phone} onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Temporary Password *</label>
                <input className="form-input" type="password" required minLength={6} placeholder="••••••••"
                  value={newDriver.password} onChange={e => setNewDriver({ ...newDriver, password: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowAddDriver(false)} className="btn btn--ghost flex-1">Cancel</button>
                <button type="submit" className="btn btn--primary flex-1">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Assign Driver */}
      {assigningAmbulance && (
        <div className="modal-overlay" onClick={() => setAssigningAmbulance(null)}>
          <div className="modal-content animate-scale" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <h3 style={{ marginTop: 0, marginBottom: 4 }}>Assign Driver</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 16 }}>
              Select driver for ambulance <strong>{assigningAmbulance.plateNumber}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
              <button onClick={() => handleAssignDriver(null)}
                style={{
                  padding: '10px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)', textAlign: 'left', cursor: 'pointer', fontWeight: 600,
                  color: 'var(--crimson-light)'
                }}>
                ✕ Unassign Driver
              </button>

              {drivers.map(drv => (
                <button key={drv.id} onClick={() => handleAssignDriver(drv.id)}
                  style={{
                    padding: '10px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)', textAlign: 'left', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: 10
                  }}>
                  <UserIcon size={14} style={{ color: 'var(--primary-light)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{drv.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{drv.email}</div>
                  </div>
                </button>
              ))}

              {drivers.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>No drivers registered yet. Register a driver first.</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setAssigningAmbulance(null)} className="btn btn--ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
