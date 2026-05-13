import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ambulanceApi } from '../../api/ambulance.api';
import { useToast } from '../../components/common/ToastManager';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import type { Ambulance } from '../../types';
import { AmbulanceIcon, ArrowLeftIcon, UserIcon, HospitalIcon, LocationPinIcon, RefreshIcon } from '../../components/common/Icons';

const STATUS_CFG: Record<string, { color: string; bg: string }> = {
  available:   { color: 'var(--green-light)',   bg: 'rgba(56,142,60,0.12)'  },
  dispatched:  { color: 'var(--amber-light)',   bg: 'rgba(245,124,0,0.12)'  },
  offline:     { color: 'var(--text-3)',        bg: 'var(--surface)'        },
  maintenance: { color: 'var(--crimson-light)', bg: 'rgba(211,47,47,0.12)' },
};

export default function AdminAmbulancesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'dispatched' | 'offline'>('all');

  const fetchAmbulances = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await ambulanceApi.list();
      setAmbulances(res.data.data.ambulances);
    } catch { toast.error('Failed to load fleet'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchAmbulances(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await ambulanceApi.updateStatus(id, status);
      toast.success('Status updated', `Ambulance set to ${status}`);
      fetchAmbulances(true);
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = filter === 'all' ? ambulances : ambulances.filter(a => a.status === filter);
  const counts = {
    available:  ambulances.filter(a => a.status === 'available').length,
    dispatched: ambulances.filter(a => a.status === 'dispatched').length,
    offline:    ambulances.filter(a => a.status === 'offline' || a.status === 'maintenance').length,
  };

  return (
    <div className="page" style={{ background: 'radial-gradient(ellipse at top,#061228 0%,var(--bg) 55%)' }}>
      <div className="navbar">
        <button onClick={() => navigate('/admin/dashboard')} className="btn btn--ghost btn--sm btn--icon">
          <ArrowLeftIcon size={18} />
        </button>
        <div className="navbar__logo">
          <div className="navbar__logo-mark"><AmbulanceIcon size={18} /></div>
          <div className="navbar__logo-text">Fleet <span>Manager</span></div>
        </div>
        <button onClick={() => fetchAmbulances(true)} className="btn btn--ghost btn--sm btn--icon" disabled={refreshing}>
          <RefreshIcon size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Fleet KPI strip */}
        <div className="kpi-strip">
          <div className="kpi-card">
            <div className="kpi-card__value" style={{ color: 'var(--primary-light)' }}>{ambulances.length}</div>
            <div className="kpi-card__label">Total</div>
          </div>
          <div className="kpi-card" style={{ borderColor: 'rgba(56,142,60,0.3)' }}>
            <div className="kpi-card__value" style={{ color: 'var(--green-light)' }}>{counts.available}</div>
            <div className="kpi-card__label">Available</div>
          </div>
          <div className="kpi-card" style={{ borderColor: 'rgba(245,124,0,0.3)' }}>
            <div className="kpi-card__value" style={{ color: 'var(--amber-light)' }}>{counts.dispatched}</div>
            <div className="kpi-card__label">Dispatched</div>
          </div>
          <div className="kpi-card" style={{ borderColor: 'var(--border)' }}>
            <div className="kpi-card__value" style={{ color: 'var(--text-3)' }}>{counts.offline}</div>
            <div className="kpi-card__label">Offline</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {(['all', 'available', 'dispatched', 'offline'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px', borderRadius: 'var(--r-full)', border: `1px solid ${filter === f ? 'var(--border-2)' : 'var(--border)'}`,
                background: filter === f ? 'var(--bg-2)' : 'transparent', color: filter === f ? 'var(--text)' : 'var(--text-3)',
                fontSize: '0.8rem', fontWeight: filter === f ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}>
              {f === 'all' ? `All (${ambulances.length})` : `${f} (${f === 'offline' ? counts.offline : f === 'available' ? counts.available : counts.dispatched})`}
            </button>
          ))}
        </div>

        {/* Ambulance cards */}
        {loading ? <SkeletonCard count={3} /> : filtered.length === 0 ? (
          <div className="card text-center" style={{ padding: '40px 20px' }}>
            <div style={{ color: 'var(--text-3)', marginBottom: 12 }}><AmbulanceIcon size={40} /></div>
            <p style={{ color: 'var(--text-3)' }}>No ambulances match the selected filter.</p>
          </div>
        ) : (
          filtered.map(amb => {
            const cfg = STATUS_CFG[amb.status] || STATUS_CFG.offline;
            return (
              <div key={amb.id} className="card card--accent-left-primary" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
                      <AmbulanceIcon size={22} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700 }}>{amb.plateNumber}</div>
                      {amb.lat && amb.lng && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <LocationPinIcon size={10} /> {amb.lat.toFixed(4)}, {amb.lng.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: 'var(--r-full)', background: cfg.bg, color: cfg.color, fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>
                    {amb.status}
                  </span>
                </div>

                <div className="grid-2">
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                      <UserIcon size={12} /> Driver
                    </div>
                    <div style={{ fontWeight: 500 }}>{amb.driver?.name || 'Unassigned'}</div>
                    {amb.driver?.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{amb.driver.phone}</div>}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                      <HospitalIcon size={12} /> Hospital
                    </div>
                    <div style={{ fontWeight: 500 }}>{amb.hospital?.name || 'Unknown'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>Set Status:</label>
                  <select className="form-input flex-1" value={amb.status}
                    onChange={e => handleStatusChange(amb.id, e.target.value)}>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
