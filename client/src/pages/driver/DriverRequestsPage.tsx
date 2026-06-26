import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../hooks/useSocket';
import { sosApi } from '../../api/sos.api';
import { ambulanceApi } from '../../api/ambulance.api';
import { hospitalApi } from '../../api/hospital.api';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useToast } from '../../components/common/ToastManager';
import { useTheme } from '../../hooks/useTheme';
import BottomSheet from '../../components/common/BottomSheet';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import type { EmergencyRequest } from '../../types';
import { format } from 'date-fns';
import { AmbulanceIcon, BellIcon, MapPinIcon, UserIcon, LogOutIcon, NavigationIcon, CheckCircleIcon, ClockIcon, AlertTriangleIcon, CrosshairIcon, AlertSirenIcon } from '../../components/common/Icons';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

const ambIcon = L.divIcon({ className: '', html: '<div style="background:#1565C0;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(21,101,192,0.5);border:2px solid #1E88E5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="11" rx="1.5"/><path d="M18 12h3l1 4v2h-4"/><circle cx="6.5" cy="19.5" r="1.5"/><circle cx="15.5" cy="19.5" r="1.5"/></svg></div>', iconSize: [36, 36], iconAnchor: [18, 18] });
const sosIcon  = L.divIcon({ className: '', html: '<div style="background:#D32F2F;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(211,47,47,0.6);border:2px solid #EF5350;animation:pulse 1.5s ease-in-out infinite"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>', iconSize: [32, 32], iconAnchor: [16, 32] });

type AvailStatus = 'available' | 'dispatched' | 'offline';
const STATUS_CFG: Record<AvailStatus, { label: string; color: string; bg: string }> = {
  available:  { label: 'Available',  color: 'var(--green-light)', bg: 'var(--green-bg)'  },
  dispatched: { label: 'Dispatched', color: 'var(--amber-light)', bg: 'var(--amber-bg)'  },
  offline:    { label: 'Offline',    color: 'var(--text-3)',      bg: 'var(--surface)'   },
};

const MapControls = ({ lat, lng }: { lat?: number | null; lng?: number | null }) => {
  const map = useMap();
  
  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const handleRecenter = () => {
    if (lat && lng) {
      map.setView([lat, lng], 14, { animate: true });
    } else {
      map.setView([0.3476, 32.5825], 7, { animate: true });
    }
  };

  return (
    <div style={{ position: 'absolute', right: '12px', bottom: '12px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button onClick={handleZoomIn} style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', cursor: 'pointer', color: 'var(--text)', fontWeight: 600, fontSize: '1.2rem' }}>
        ＋
      </button>
      <button onClick={handleZoomOut} style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', cursor: 'pointer', color: 'var(--text)', fontWeight: 600, fontSize: '1.2rem' }}>
        －
      </button>
      <button onClick={handleRecenter} style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', cursor: 'pointer', color: 'var(--text)', fontSize: '1.1rem' }} title="Recenter">
        <CrosshairIcon size={16} />
      </button>
    </div>
  );
};

export default function DriverRequestsPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { on } = useSocket();
  const toast = useToast();
  const { isDark } = useTheme();
  const { lat, lng, getLocation } = useGeolocation(true);

  const [requests, setRequests]       = useState<EmergencyRequest[]>([]);
  const [loading, setLoading]         = useState(true);
  const [availability, setAvail]      = useState<AvailStatus>('available');
  const [updatingStatus, setUpdating] = useState(false);
  const [sheetRequest, setSheetReq]   = useState<EmergencyRequest | null>(null);
  const [sheetOpen, setSheetOpen]     = useState(false);

  // Direct transport states
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [showDirectTransport, setShowDirectTransport] = useState(false);
  const [submittingDirect, setSubmittingDirect] = useState(false);
  const [directForm, setDirectForm] = useState({
    hospitalId: '',
    patientName: '',
    patientAge: '',
    medicalNotes: '',
  });

  const fetchRequests = async () => {
    try { const res = await sosApi.list(); setRequests(res.data.data.requests); }
    catch { } finally { setLoading(false); }
  };

  const fetchHospitals = async () => {
    try {
      const res = await hospitalApi.list();
      setHospitals(res.data.data);
    } catch {}
  };

  useEffect(() => {
    fetchRequests();
    fetchHospitals();
    getLocation();
    const interval = setInterval(getLocation, 10000);
    const off = on('driver:newRequest', (data: any) => {
      fetchRequests();
      toast.info('New emergency request nearby!', data?.patientName ? `Patient: ${data.patientName}` : undefined);
      if (data?.requestId) {
        sosApi.getById(data.requestId).then(res => {
          setSheetReq(res.data.data);
          setSheetOpen(true);
        }).catch(() => {});
      }
    });
    return () => { off(); clearInterval(interval); };
  }, []);

  const handleDirectTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directForm.hospitalId) {
      toast.error('Please select a target hospital');
      return;
    }
    if (!lat || !lng) {
      toast.error('GPS coordinates unavailable. Make sure location access is allowed.');
      return;
    }
    setSubmittingDirect(true);
    try {
      const body = {
        hospitalId: directForm.hospitalId,
        pickupLat: lat,
        pickupLng: lng,
        patientName: directForm.patientName || undefined,
        patientAge: directForm.patientAge ? parseInt(directForm.patientAge) : undefined,
        medicalNotes: directForm.medicalNotes || undefined,
      };
      const res = await sosApi.createDirectTransport(body);
      if (res.data.success) {
        toast.success('Direct transport initiated successfully');
        setShowDirectTransport(false);
        navigate(`/driver/navigation/${res.data.data.id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initiate direct transport');
    } finally {
      setSubmittingDirect(false);
    }
  };

  const handleAvailability = async (status: AvailStatus) => {
    setUpdating(true);
    try {
      // Single targeted API call — no need to fetch all ambulances
      const ambStatus = status === 'available' ? 'available' : status === 'dispatched' ? 'dispatched' : 'offline';
      await ambulanceApi.updateMyStatus(ambStatus);
      setAvail(status);
    } catch (err: any) {
      toast.error('Failed to update status', err?.response?.data?.message || 'Please try again');
    } finally { setUpdating(false); }
  };

  const handleAction = async (id: string, action: 'accept' | 'decline') => {
    try {
      if (action === 'accept') { await sosApi.updateStatus(id, 'in_progress'); navigate(`/driver/navigation/${id}`); }
      else { await sosApi.updateStatus(id, 'cancelled'); fetchRequests(); }
    } catch (err) { console.error(err); }
    setSheetOpen(false);
  };

  const cfg = STATUS_CFG[availability];
  const pendingReq = requests.find(r => r.status === 'dispatched');

  return (
    <div className="page" style={{ paddingBottom: 0 }}>
      <div className="navbar">
        <div className="navbar__logo">
          <div className="navbar__logo-mark"><AmbulanceIcon size={18} /></div>
          <div className="navbar__logo-text">Driver <span>Portal</span></div>
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

      {/* Full-screen map */}
      <div style={{ position: 'relative', height: '52dvh' }}>
        <MapContainer center={lat && lng ? [lat, lng] : [0.3476, 32.5825]} zoom={lat && lng ? 14 : 7}
          style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            url={isDark
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'}
            attribution="© CartoDB"
          />
          {lat && lng && <Marker position={[lat, lng]} icon={ambIcon}><Popup>Your position</Popup></Marker>}
          {requests.filter(r => ['pending','dispatched'].includes(r.status)).map(r => (
            <Marker key={r.id} position={[r.pickupLat, r.pickupLng]} icon={sosIcon}>
              <Popup>{r.patientName || 'Emergency'}<br />{r.pickupAddress || ''}</Popup>
            </Marker>
          ))}
          <MapControls lat={lat} lng={lng} />
        </MapContainer>

        {/* Availability toggle overlay */}
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 1000 }}>
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-2)', borderRadius: 'var(--r-full)', padding: '6px 10px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, display: 'inline-block', marginTop: 5, flexShrink: 0 }} />
            {(['available', 'busy', 'offline'] as AvailStatus[]).map(s => (
              <button key={s} onClick={() => handleAvailability(s)} disabled={updatingStatus || availability === s}
                style={{ padding: '4px 10px', borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, background: availability === s ? STATUS_CFG[s].bg : 'transparent', color: availability === s ? STATUS_CFG[s].color : 'var(--text-3)', transition: 'all 0.2s', textTransform: 'capitalize' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Pending request badge */}
        {pendingReq && !sheetOpen && (
          <button onClick={() => { setSheetReq(pendingReq); setSheetOpen(true); }}
            style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--crimson)', color: '#fff', border: 'none', borderRadius: 'var(--r-full)', padding: '10px 20px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(211,47,47,0.5)', animation: 'pulse 1.5s ease-in-out infinite' }}>
            <BellIcon size={16} /> New Request — Tap to view
          </button>
        )}
      </div>

      {/* Assignment list */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
        <button onClick={() => setShowDirectTransport(true)} className="btn btn--danger btn--lg btn--full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 800 }}>
          <AlertSirenIcon size={18} /> Initiate Direct Transport
        </button>

        <h3 style={{ marginBottom: 0, marginTop: 8 }}>My Assignments</h3>

        {availability === 'offline' && (
          <div className="alert alert--warning">
            <AlertTriangleIcon size={18} style={{ flexShrink: 0 }} />
            <span>You are offline. Set status to <strong>Available</strong> to receive requests.</span>
          </div>
        )}

        {loading ? <SkeletonCard count={2} /> : requests.length === 0 ? (
          <div className="card text-center" style={{ padding: '32px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: 'var(--primary-light)' }}><BellIcon size={40} /></div>
            <h3 style={{ color: 'var(--text-2)', marginBottom: 6 }}>Standing By</h3>
            <p style={{ fontSize: '0.875rem' }}>No active assignments. Waiting for dispatch…</p>
          </div>
        ) : (
          requests.map(req => {
            const typeMatch = req.medicalNotes?.match(/^\[(\w+)\]/);
            const emergType = typeMatch?.[1] || null;
            return (
              <div key={req.id} className={`card ${req.status === 'dispatched' ? 'card--crimson' : 'card--accent-left-primary'}`} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className={`badge badge--${req.status}`}>{req.status.replace('_', ' ')}</span>
                    {emergType && <span className="badge" style={{ color: 'var(--crimson-light)', background: 'rgba(211,47,47,0.12)' }}>{emergType}</span>}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <ClockIcon size={12} /> {format(new Date(req.requestedAt), 'h:mm a')}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}><MapPinIcon size={12} /> Location</div>
                  <div className="truncate" style={{ fontWeight: 600 }}>{req.pickupAddress || `${req.pickupLat.toFixed(4)}, ${req.pickupLng.toFixed(4)}`}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Patient</div>
                    <div style={{ fontWeight: 500 }}>{req.patientName || 'Unknown'}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Phone</div>
                    <div style={{ fontWeight: 500 }}>{req.citizen?.phone || '—'}</div>
                  </div>
                </div>
                {req.status === 'dispatched' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleAction(req.id, 'decline')} className="btn btn--ghost" style={{ flex: 1 }}>Decline</button>
                    <button onClick={() => handleAction(req.id, 'accept')} className="btn btn--danger" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <NavigationIcon size={15} /> Accept & Navigate
                    </button>
                  </div>
                )}
                {req.status === 'in_progress' && (
                  <Link to={`/driver/navigation/${req.id}`} className="btn btn--primary btn--full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <NavigationIcon size={16} /> Continue Navigation
                  </Link>
                )}
                {req.status === 'arrived' && (
                  <button onClick={async () => { await sosApi.updateStatus(req.id, 'completed'); fetchRequests(); }} className="btn btn--success btn--full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <CheckCircleIcon size={16} /> Mark Completed
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Incoming Request BottomSheet */}
      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="Alert: Incoming Emergency Request">
        {sheetRequest && (() => {
          const typeMatch = sheetRequest.medicalNotes?.match(/^\[(\w+)\]/);
          const emergType = typeMatch?.[1] || null;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className={`badge badge--${sheetRequest.status}`}>{sheetRequest.status.replace('_', ' ')}</span>
                {emergType && <span className="badge" style={{ color: 'var(--crimson-light)', background: 'rgba(211,47,47,0.12)' }}>{emergType}</span>}
              </div>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Patient</span>
                  <strong>{sheetRequest.patientName || 'Unknown'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Location</span>
                  <strong style={{ maxWidth: '60%', textAlign: 'right', fontSize: '0.875rem' }}>
                    {sheetRequest.pickupAddress || `${sheetRequest.pickupLat.toFixed(4)}, ${sheetRequest.pickupLng.toFixed(4)}`}
                  </strong>
                </div>
                {sheetRequest.estimatedEta && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>ETA</span>
                    <strong style={{ color: 'var(--amber-light)' }}>{Math.round(sheetRequest.estimatedEta / 60)} min</strong>
                  </div>
                )}
              </div>
              {sheetRequest.medicalNotes && (
                <div className="alert alert--warning">
                  <AlertTriangleIcon size={16} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem' }}>{sheetRequest.medicalNotes}</span>
                </div>
              )}
              <button onClick={() => handleAction(sheetRequest.id, 'accept')} className="btn btn--danger btn--full btn--lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <NavigationIcon size={18} /> ACCEPT & NAVIGATE
              </button>
              <button onClick={() => handleAction(sheetRequest.id, 'decline')} className="btn btn--ghost btn--full">
                Decline
              </button>
            </div>
          );
        })()}
      </BottomSheet>

      {/* MODAL: Direct Transport */}
      {showDirectTransport && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowDirectTransport(false)}>
          <div className="card card--elevated animate-fade" style={{ width: '100%', maxWidth: '450px', borderRadius: 'var(--r-xl) var(--r-xl) 0 0', padding: '28px 24px 40px', display: 'flex', flexDirection: 'column', gap: '14px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><AlertSirenIcon size={18} style={{ color: 'var(--crimson-light)' }} /> Initiate Direct Transport</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', margin: 0 }}>
              Use this if you are actively carrying a patient and need to notify the target hospital.
            </p>
            <form onSubmit={handleDirectTransport} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Target Hospital *</label>
                <select className="form-input" required value={directForm.hospitalId}
                  onChange={e => setDirectForm({ ...directForm, hospitalId: e.target.value })}>
                  <option value="">Select Hospital</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Patient Name (Optional)</label>
                <input className="form-input" placeholder="e.g. John Doe"
                  value={directForm.patientName} onChange={e => setDirectForm({ ...directForm, patientName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Patient Age (Optional)</label>
                <input className="form-input" type="number" placeholder="e.g. 45"
                  value={directForm.patientAge} onChange={e => setDirectForm({ ...directForm, patientAge: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Medical Notes / Emergency Type</label>
                <textarea className="form-input" placeholder="e.g. [Trauma] Severe bleeding from arm"
                  value={directForm.medicalNotes} onChange={e => setDirectForm({ ...directForm, medicalNotes: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowDirectTransport(false)} className="btn btn--ghost flex-1">Cancel</button>
                <button type="submit" className="btn btn--danger flex-1" disabled={submittingDirect}>
                  {submittingDirect ? <span className="spinner" style={{ borderTopColor: '#fff' }} /> : 'Start Transport'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
