import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../hooks/useSocket';
import { hospitalApi } from '../../api/hospital.api';
import { useToast } from '../../components/common/ToastManager';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import type { EmergencyRequest, HospitalIncomingEvent } from '../../types';
import { format } from 'date-fns';
import { HospitalIcon, BedIcon, AmbulanceIcon, AlertTriangleIcon, UserIcon, ClockIcon, LogOutIcon, CheckCircleIcon } from '../../components/common/Icons';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

const ambMapIcon = L.divIcon({ className: '', html: '<div style="background:#1565C0;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(21,101,192,0.5);border:2px solid #1E88E5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="7" width="16" height="11" rx="1.5"/><path d="M18 12h3l1 4v2h-4"/><circle cx="6.5" cy="19.5" r="1.5"/><circle cx="15.5" cy="19.5" r="1.5"/></svg></div>', iconSize: [28, 28], iconAnchor: [14, 14] });

function getSeverity(req: EmergencyRequest): 'critical' | 'moderate' | 'stable' {
  const eta = req.estimatedEta ? req.estimatedEta / 60 : 999;
  if (req.status === 'in_progress' && eta < 5) return 'critical';
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
  const [patients, setPatients] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});
  const [showMap, setShowMap] = useState(false);
  const hospitalId = 'h-001';
  const isFirstLoad = useRef(true);

  const fetchIncoming = async () => {
    try { const res = await hospitalApi.incoming(hospitalId); setPatients(res.data.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchIncoming();
    emit('hospital:join', hospitalId);
    const offIncoming = on('hospital:incoming', (data: HospitalIncomingEvent) => {
      fetchIncoming();
      if (!isFirstLoad.current) {
        beep();
        toast.warning('🚑 New Incoming Patient', data?.patient?.name ? `Patient: ${data.patient.name}` : 'Incoming emergency patient');
      }
      isFirstLoad.current = false;
    });
    const offStatus = on('sos:statusUpdate', () => fetchIncoming());
    return () => { offIncoming(); offStatus(); };
  }, []);

  const critical = patients.filter(p => getSeverity(p) === 'critical').length;
  const moderate  = patients.filter(p => getSeverity(p) === 'moderate').length;
  const stable    = patients.filter(p => getSeverity(p) === 'stable').length;

  const ambPositions = patients
    .filter(p => p.ambulance?.lat && p.ambulance?.lng)
    .map(p => ({ id: p.id, lat: p.ambulance!.lat!, lng: p.ambulance!.lng!, plate: p.ambulance?.plateNumber || '' }));

  return (
    <div className="page" style={{ background: 'radial-gradient(ellipse at top,#0a1030 0%,var(--bg) 55%)' }}>
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

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

        {/* Live ambulance map (collapsible) */}
        {ambPositions.length > 0 && (
          <div>
            <button onClick={() => setShowMap(v => !v)} className="btn btn--ghost btn--sm" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AmbulanceIcon size={15} /> {showMap ? 'Hide' : 'Show'} Live Ambulance Map ({ambPositions.length})
            </button>
            {showMap && (
              <div className="map-container" style={{ height: 220 }}>
                <MapContainer center={[ambPositions[0].lat, ambPositions[0].lng]} zoom={13} style={{ height: '100%' }} zoomControl={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {ambPositions.map(a => (
                    <Marker key={a.id} position={[a.lat, a.lng]} icon={ambMapIcon}>
                      <Popup>{a.plate}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}
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
                  <button onClick={() => setAcknowledged(prev => ({ ...prev, [req.id]: !isAck }))}
                    className={`btn btn--sm flex-1 ${isAck ? 'btn--success' : 'btn--primary'}`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <BedIcon size={15} /> {isAck ? '✓ Bed Ready' : 'Mark Bed Ready'}
                  </button>
                  <button onClick={() => setAcknowledged(prev => ({ ...prev, [req.id]: !isAck }))}
                    className={`btn btn--sm flex-1 ${isAck ? 'btn--success' : 'btn--ghost'}`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <CheckCircleIcon size={15} /> {isAck ? '✓ ER Prepared' : 'Mark ER Prepared'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
