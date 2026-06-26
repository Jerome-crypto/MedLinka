import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../hooks/useSocket';
import { hospitalApi } from '../../api/hospital.api';
import { useToast } from '../../components/common/ToastManager';
import { useTheme } from '../../hooks/useTheme';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import type { EmergencyRequest, HospitalIncomingEvent } from '../../types';
import { sosApi } from '../../api/sos.api';
import { format } from 'date-fns';
import { HospitalIcon, BedIcon, AmbulanceIcon, AlertTriangleIcon, UserIcon, ClockIcon, LogOutIcon, CheckCircleIcon, RefreshIcon } from '../../components/common/Icons';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

const ambMapIcon = L.divIcon({ className: '', html: '<div style="background:#1565C0;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(21,101,192,0.5);border:2px solid #1E88E5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="7" width="16" height="11" rx="1.5"/><path d="M18 12h3l1 4v2h-4"/><circle cx="6.5" cy="19.5" r="1.5"/><circle cx="15.5" cy="19.5" r="1.5"/></svg></div>', iconSize: [28, 28], iconAnchor: [14, 14] });

const MapControls = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  
  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const handleRecenter = () => {
    map.setView([lat, lng], 13, { animate: true });
  };

  return (
    <div style={{ position: 'absolute', right: '8px', bottom: '8px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <button onClick={handleZoomIn} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', color: 'var(--text)', fontWeight: 600, fontSize: '1.1rem' }}>
        ＋
      </button>
      <button onClick={handleZoomOut} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', color: 'var(--text)', fontWeight: 600, fontSize: '1.1rem' }}>
        －
      </button>
      <button onClick={handleRecenter} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', color: 'var(--text)', fontSize: '0.95rem' }} title="Recenter">
        🎯
      </button>
    </div>
  );
};

function getSeverity(req: EmergencyRequest): 'critical' | 'moderate' | 'stable' {
  const eta = req.estimatedEta ? req.estimatedEta / 60 : 999;
  if ((req.status === 'in_progress' || req.status === 'in_transit') && eta < 5) return 'critical';
  if (eta <= 15) return 'moderate';
  return 'stable';
}

function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880; gain.gain.value = 0.3;
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  } catch { /* silently ignore */ }
}

export default function HospitalIncomingPage() {
  const { user, logout } = useAuthStore();
  const { on, emit } = useSocket();
  const toast = useToast();
  const { isDark } = useTheme();
  const [patients, setPatients] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});
  const isFirstLoad = useRef(true);

  // Fleet management states
  const [activeTab, setActiveTab] = useState<'incoming' | 'fleet'>('incoming');
  const [drivers, setDrivers] = useState<any[]>([]);
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [fleetLoading, setFleetLoading] = useState(false);
  const [showAddAmbulance, setShowAddAmbulance] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [assigningAmbulance, setAssigningAmbulance] = useState<any | null>(null);

  const [newAmb, setNewAmb] = useState({ plateNumber: '', ambulanceType: 'Type B', equipmentLevel: 2 });
  const [newDriver, setNewDriver] = useState({ name: '', email: '', phone: '', password: '' });
  
  const fetchIncoming = async (hId: string) => {
    try { const res = await hospitalApi.incoming(hId); setPatients(res.data.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchFleet = async () => {
    setFleetLoading(true);
    try {
      const ambRes = await hospitalApi.getMyAmbulances();
      if (ambRes.data.success) setAmbulances(ambRes.data.data);

      const drvRes = await hospitalApi.getMyDrivers();
      if (drvRes.data.success) setDrivers(drvRes.data.data);
    } catch {
      toast.error('Failed to sync hospital fleet details');
    } finally {
      setFleetLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'fleet') {
      fetchFleet();
    }
  }, [activeTab]);

  useEffect(() => {
    let currentHospitalId: string | null = null;
    hospitalApi.mine().then(res => {
      currentHospitalId = res.data.data.id;
      fetchIncoming(currentHospitalId);
      emit('hospital:join', currentHospitalId);
    }).catch(() => setLoading(false));

    const offIncoming = on('hospital:incoming', (data: HospitalIncomingEvent) => {
      if (currentHospitalId) fetchIncoming(currentHospitalId);
      if (!isFirstLoad.current) {
        beep();
        toast.warning('New Incoming Patient', data?.patient?.name ? `Patient: ${data.patient.name}` : 'Incoming emergency patient');
      }
      isFirstLoad.current = false;
    });
    const offStatus = on('sos:statusUpdate', () => {
      if (currentHospitalId) fetchIncoming(currentHospitalId);
    });
    return () => { offIncoming(); offStatus(); };
  }, [emit, on, toast]);

  const handleAcknowledge = async (reqId: string) => {
    try {
      await sosApi.acknowledge(reqId);
      setAcknowledged(prev => ({ ...prev, [reqId]: true }));
      toast.success('Hospital preparation acknowledged');
    } catch (err) { console.error(err); }
  };

  const handleAddAmbulance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await hospitalApi.createAmbulance(newAmb);
      toast.success('Ambulance registered successfully');
      setShowAddAmbulance(false);
      setNewAmb({ plateNumber: '', ambulanceType: 'Type B', equipmentLevel: 2 });
      fetchFleet();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register ambulance');
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await hospitalApi.createDriver(newDriver);
      toast.success('Driver registered successfully');
      setShowAddDriver(false);
      setNewDriver({ name: '', email: '', phone: '', password: '' });
      fetchFleet();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register driver');
    }
  };

  const handleAssignDriver = async (driverId: string | null) => {
    if (!assigningAmbulance) return;
    try {
      await hospitalApi.assignDriver(assigningAmbulance.id, driverId);
      toast.success('Driver assignment updated');
      setAssigningAmbulance(null);
      fetchFleet();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update assignment');
    }
  };

  const critical = patients.filter(p => getSeverity(p) === 'critical').length;
  const moderate  = patients.filter(p => getSeverity(p) === 'moderate').length;
  const stable    = patients.filter(p => getSeverity(p) === 'stable').length;

  const ambPositions = patients
    .filter(p => p.ambulance?.lat && p.ambulance?.lng)
    .map(p => ({ id: p.id, lat: p.ambulance!.lat!, lng: p.ambulance!.lng!, plate: p.ambulance?.plateNumber || '' }));

  const [fleetTab, setFleetTab] = useState<'ambulances' | 'drivers'>('ambulances');

  return (
    <div className="page">
      <div className="navbar">
        <div className="navbar__logo">
          <div className="navbar__logo-mark"><HospitalIcon size={18} /></div>
          <div className="navbar__logo-text">Hospital <span>ER</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <UserIcon size={13} /> {user?.name}
          </span>
          <button onClick={() => logout()} className="btn btn--ghost btn--sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <LogOutIcon size={13} /> Sign out
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', padding: '0 16px' }}>
        <button onClick={() => setActiveTab('incoming')}
          style={{
            padding: '14px 20px', background: 'none', border: 'none',
            borderBottom: activeTab === 'incoming' ? '3px solid var(--primary)' : 'none',
            color: activeTab === 'incoming' ? 'var(--primary-light)' : 'var(--text-3)',
            fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem'
          }}>
          🚨 Incoming Patients ({patients.length})
        </button>
        <button onClick={() => setActiveTab('fleet')}
          style={{
            padding: '14px 20px', background: 'none', border: 'none',
            borderBottom: activeTab === 'fleet' ? '3px solid var(--primary)' : 'none',
            color: activeTab === 'fleet' ? 'var(--primary-light)' : 'var(--text-3)',
            fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem'
          }}>
          🚑 Fleet & Personnel
        </button>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {activeTab === 'incoming' ? (
          <>
            {/* KPI strip */}
            <div className="kpi-strip">
              <div className="kpi-card">
                <div className="kpi-card__value" style={{ color: 'var(--primary-light)' }}>{patients.length}</div>
                <div className="kpi-card__label">Incoming</div>
              </div>
              <div className="kpi-card kpi-card--critical">
                <div className="kpi-card__value">{critical}</div>
                <div className="kpi-card__label">Critical</div>
              </div>
              <div className="kpi-card kpi-card--moderate">
                <div className="kpi-card__value">{moderate}</div>
                <div className="kpi-card__label">Moderate</div>
              </div>
              <div className="kpi-card kpi-card--stable">
                <div className="kpi-card__value">{stable}</div>
                <div className="kpi-card__label">Stable</div>
              </div>
            </div>

            {/* Live ambulance map */}
            {ambPositions.length > 0 && (
              <div>
                <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--text-2)' }}>
                  <AmbulanceIcon size={16} /> Live Ambulance Map ({ambPositions.length})
                </div>
                <div className="map-container" style={{ height: 260, position: 'relative' }}>
                  <MapContainer center={[ambPositions[0].lat, ambPositions[0].lng]} zoom={13} style={{ height: '100%' }} zoomControl={false}>
                    <TileLayer
                      url={isDark
                        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'}
                      attribution="© CartoDB"
                    />
                    {ambPositions.map(a => (
                      <Marker key={a.id} position={[a.lat, a.lng]} icon={ambMapIcon}>
                        <Popup>{a.plate}</Popup>
                      </Marker>
                    ))}
                    <MapControls lat={ambPositions[0].lat} lng={ambPositions[0].lng} />
                  </MapContainer>
                </div>
              </div>
            )}

            {/* Patient list */}
            <h3 style={{ marginBottom: 0 }}>Incoming Patients</h3>
            {loading ? <SkeletonCard count={3} /> : patients.length === 0 ? (
              <div className="card text-center" style={{ padding: '48px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: 'var(--green-light)' }}>
                  <BedIcon size={48} />
                </div>
                <h3 style={{ color: 'var(--text-2)', marginBottom: 8 }}>All Clear</h3>
                <p style={{ fontSize: '0.875rem' }}>No incoming patients at this time.</p>
              </div>
            ) : (
              patients.map(req => {
                const typeMatch = req.medicalNotes?.match(/^\[(\w+)\]/);
                const emergType = typeMatch?.[1] || null;
                const isAck = acknowledged[req.id];
                const severity = getSeverity(req);

                return (
                  <div key={req.id}
                    className={`card card--severity-${severity}`}
                    style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Link to={`/hospital/patient/${req.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span className={`badge badge--${req.status}`}>{req.status.replace('_', ' ')}</span>
                          {emergType && <span className="badge" style={{ color: 'var(--crimson-light)', background: 'rgba(211,47,47,0.12)' }}>{emergType}</span>}
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-full)', background: severity === 'critical' ? 'rgba(211,47,47,0.15)' : severity === 'moderate' ? 'rgba(245,124,0,0.15)' : 'rgba(56,142,60,0.15)', color: severity === 'critical' ? 'var(--crimson-light)' : severity === 'moderate' ? 'var(--amber-light)' : 'var(--green-light)', textTransform: 'uppercase' }}>{severity}</span>
                        </div>
                        <span style={{ fontSize: '0.875rem', color: severity === 'critical' ? 'var(--crimson-light)' : 'var(--amber-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }} className={severity === 'critical' ? 'animate-pulse' : ''}>
                          <ClockIcon size={13} />
                          ETA: {req.estimatedEta ? Math.round(req.estimatedEta / 60) + ' min' : 'Unknown'}
                        </span>
                      </div>
                      <div className="grid-2">
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}><UserIcon size={12} /> Patient</div>
                          <div style={{ fontWeight: 600 }}>{req.patientName || 'Unknown'} {req.patientAge ? `(${req.patientAge}y)` : ''}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}><AmbulanceIcon size={12} /> Ambulance</div>
                          <div style={{ fontWeight: 500 }}>{req.ambulance?.plateNumber || '—'}</div>
                        </div>
                      </div>
                      {req.medicalNotes && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', background: 'var(--amber-bg)', borderRadius: 'var(--r-md)', color: 'var(--amber-light)', fontSize: '0.875rem' }}>
                          <AlertTriangleIcon size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                          <span className="truncate">{req.medicalNotes}</span>
                        </div>
                      )}
                    </Link>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button onClick={() => !isAck && handleAcknowledge(req.id)}
                        className={`btn btn--sm flex-1 ${isAck ? 'btn--success' : 'btn--primary'}`}
                        disabled={isAck}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <BedIcon size={15} /> {isAck ? '✓ Bed Ready' : 'Mark Bed Ready'}
                      </button>
                      <button onClick={() => !isAck && handleAcknowledge(req.id)}
                        className={`btn btn--sm flex-1 ${isAck ? 'btn--success' : 'btn--ghost'}`}
                        disabled={isAck}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <CheckCircleIcon size={15} /> {isAck ? '✓ ER Prepared' : 'Mark ER Prepared'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Sub Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
              <button onClick={() => setFleetTab('ambulances')}
                style={{
                  padding: '12px 24px', background: 'none', border: 'none',
                  borderBottom: fleetTab === 'ambulances' ? '2px solid var(--primary)' : 'none',
                  color: fleetTab === 'ambulances' ? 'var(--text)' : 'var(--text-3)',
                  fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}>
                Fleet ({ambulances.length})
              </button>
              <button onClick={() => setFleetTab('drivers')}
                style={{
                  padding: '12px 24px', background: 'none', border: 'none',
                  borderBottom: fleetTab === 'drivers' ? '2px solid var(--primary)' : 'none',
                  color: fleetTab === 'drivers' ? 'var(--text)' : 'var(--text-3)',
                  fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}>
                Drivers ({drivers.length})
              </button>
            </div>

            {fleetTab === 'ambulances' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0 }}>Ambulance Fleet</h4>
                  <button onClick={() => setShowAddAmbulance(true)} className="btn btn--primary btn--sm">+ Register Ambulance</button>
                </div>

                {fleetLoading ? (
                  <div style={{ textAlign: 'center', padding: '30px' }}><span className="spinner" /></div>
                ) : ambulances.length === 0 ? (
                  <div className="card text-center" style={{ padding: 30 }}>
                    <p style={{ color: 'var(--text-3)' }}>No ambulances registered yet.</p>
                  </div>
                ) : (
                  ambulances.map((amb: any) => (
                    <div key={amb.id} className="card card--compact" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <AmbulanceIcon size={20} style={{ color: 'var(--primary-light)' }} />
                          <strong style={{ fontSize: '1.05rem' }}>{amb.plateNumber}</strong>
                        </div>
                      </div>

                      <div className="grid-2" style={{ gap: 8, fontSize: '0.8rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-3)' }}>Driver:</span>{' '}
                          <button onClick={() => setAssigningAmbulance(amb)} className="btn btn--ghost btn--xs" style={{ padding: '2px 4px', fontSize: '0.8rem', fontWeight: 600 }}>
                            {amb.driver ? `👤 ${amb.driver.name}` : 'Assign Driver'}
                          </button>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-3)' }}>Status:</span>{' '}
                          <span className={`badge badge--${amb.status}`} style={{ textTransform: 'capitalize' }}>{amb.status}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0 }}>Hospital Drivers</h4>
                  <button onClick={() => setShowAddDriver(true)} className="btn btn--primary btn--sm">+ Register Driver</button>
                </div>

                {fleetLoading ? (
                  <div style={{ textAlign: 'center', padding: '30px' }}><span className="spinner" /></div>
                ) : drivers.length === 0 ? (
                  <div className="card text-center" style={{ padding: 30 }}>
                    <p style={{ color: 'var(--text-3)' }}>No drivers registered yet.</p>
                  </div>
                ) : (
                  drivers.map((drv: any) => (
                    <div key={drv.id} className="card card--compact" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        )}
      </div>

      {/* MODAL: Add Ambulance */}
      {showAddAmbulance && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowAddAmbulance(false)}>
          <div className="card card--elevated animate-fade" style={{ width: '100%', maxWidth: '450px', borderRadius: 'var(--r-xl) var(--r-xl) 0 0', padding: '28px 24px 40px', display: 'flex', flexDirection: 'column', gap: '14px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: 0 }}>Register Ambulance</h3>
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowAddDriver(false)}>
          <div className="card card--elevated animate-fade" style={{ width: '100%', maxWidth: '450px', borderRadius: 'var(--r-xl) var(--r-xl) 0 0', padding: '28px 24px 40px', display: 'flex', flexDirection: 'column', gap: '14px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: 0 }}>Register Driver</h3>
            <form onSubmit={handleAddDriver} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="e.g. Isaac Mugabi" required
                  value={newDriver.name} onChange={e => setNewDriver({ ...newDriver, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" placeholder="isaac@hospital.com" required
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setAssigningAmbulance(null)}>
          <div className="card card--elevated animate-fade" style={{ width: '100%', maxWidth: '450px', borderRadius: 'var(--r-xl) var(--r-xl) 0 0', padding: '28px 24px 40px', display: 'flex', flexDirection: 'column', gap: '14px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: 0 }}>Assign Driver</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', margin: 0 }}>
              Select driver for ambulance <strong>{assigningAmbulance.plateNumber}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 250, overflowY: 'auto' }}>
              <button onClick={() => handleAssignDriver(null)}
                style={{ padding: '10px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', textAlign: 'left', cursor: 'pointer', fontWeight: 600, color: 'var(--crimson-light)' }}>
                ✕ Unassign Driver
              </button>
              {drivers.map(drv => (
                <button key={drv.id} onClick={() => handleAssignDriver(drv.id)}
                  style={{ padding: '10px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button onClick={() => setAssigningAmbulance(null)} className="btn btn--ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
