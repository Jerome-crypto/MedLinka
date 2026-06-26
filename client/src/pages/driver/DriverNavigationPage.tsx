import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { sosApi } from '../../api/sos.api';
import { ambulanceApi } from '../../api/ambulance.api';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useTheme } from '../../hooks/useTheme';
import type { EmergencyRequest } from '../../types';
import { AmbulanceIcon, ArrowLeftIcon, AlertTriangleIcon, MapPinIcon, NavigationIcon, CheckCircleIcon, ExternalLinkIcon, HospitalIcon, UserIcon, SignalIcon } from '../../components/common/Icons';
import { useSocket } from '../../hooks/useSocket';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

const personIcon = L.divIcon({ className: '', html: '<div style="background:#D32F2F;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(211,47,47,0.5);border:2px solid #EF5350"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>', iconSize: [34, 34], iconAnchor: [17, 34] });
const ambIcon  = L.divIcon({ className: '', html: '<div style="background:#1565C0;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(21,101,192,0.5);border:2px solid #1E88E5"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="11" rx="1.5"/><path d="M18 12h3l1 4v2h-4"/><circle cx="6.5" cy="19.5" r="1.5"/><circle cx="15.5" cy="19.5" r="1.5"/></svg></div>', iconSize: [40, 40], iconAnchor: [20, 20] });

const STEPS = ['En Route', 'At Patient Scene', 'In Transit to Hospital', 'Completed'];

const FitBounds = ({ pLat, pLng, aLat, aLng }: { pLat: number; pLng: number; aLat: number; aLng: number }) => {
  const map = useMap();
  useEffect(() => {
    if (pLat && pLng && aLat && aLng) {
      const bounds = L.latLngBounds([[pLat, pLng], [aLat, aLng]]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true, duration: 1.5 });
    }
  }, [pLat, pLng, aLat, aLng, map]);
  return null;
};

const MapControls = ({ pLat, pLng, aLat, aLng }: { pLat: number; pLng: number; aLat?: number; aLng?: number }) => {
  const map = useMap();
  
  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const handleRecenter = () => {
    if (aLat && aLng) {
      const bounds = L.latLngBounds([[pLat, pLng], [aLat, aLng]]);
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.0 });
    } else {
      map.setView([pLat, pLng], 16, { animate: true });
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
        🎯
      </button>
    </div>
  );
};

export default function DriverNavigationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [subStatus, setSubStatus] = useState<'arrived' | 'picked' | 'hospital'>('arrived');
  const { lat, lng, error: geoError, getLocation } = useGeolocation();
  const { emit } = useSocket();
  const { isDark } = useTheme();
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);

  useEffect(() => {
    getLocation();
    const interval = setInterval(getLocation, 5000);
    return () => clearInterval(interval);
  }, [getLocation]);

  useEffect(() => {
    if (id) {
      sosApi.getById(id).then(res => setRequest(res.data.data)).catch(console.error);
      emit('driver:joinRequest', id);
    }
  }, [id, emit]);

  useEffect(() => {
    if (lat && lng && request?.ambulanceId) {
      ambulanceApi.updateLocation(request.ambulanceId, lat, lng, id).catch(console.error);
      emit('driver:location', { ambulanceId: request.ambulanceId, lat, lng, requestId: id });
    }
  }, [lat, lng, request?.ambulanceId, id, emit]);

  // OSRM street route builder with polyline fallback
  useEffect(() => {
    if (lat && lng && request) {
      fetch(`https://router.project-osrm.org/route/v1/driving/${lng},${lat};${request.pickupLng},${request.pickupLat}?overview=full&geometries=geojson`)
        .then(r => r.json())
        .then(data => {
          if (data.routes && data.routes[0]) {
            const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]] as [number, number]);
            setRoutePoints(coords);
          } else {
            setRoutePoints([[lat, lng], [request.pickupLat, request.pickupLng]]);
          }
        })
        .catch(() => {
          setRoutePoints([[lat, lng], [request.pickupLat, request.pickupLng]]);
        });
    } else {
      setRoutePoints([]);
    }
  }, [lat, lng, request]);

  const handleUpdateStatus = async (status: string) => {
    if (!id) return;
    try {
      await sosApi.updateStatus(id, status);
      if (status === 'completed') navigate('/driver/requests');
      else setRequest(r => r ? { ...r, status: status as any } : r);
    } catch (err) { console.error(err); }
  };

  if (!request) return (
    <div className="page flex justify-center items-center">
      <span className="spinner spinner--lg" />
    </div>
  );

  const pickupLat = request.pickupLat;
  const pickupLng = request.pickupLng;

  const typeMatch = request.medicalNotes?.match(/^\[(\w+)\]/);
  const emergType = typeMatch?.[1] || null;

  const stepIndex = request.status === 'in_progress' ? 0
    : request.status === 'arrived' ? 1
    : request.status === 'in_transit' ? 2
    : request.status === 'completed' ? 3
    : -1;

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <div className="page" style={{ paddingBottom: 0, display: 'flex', flexDirection: 'column' }}>
      <div className="navbar">
        <button onClick={() => navigate('/driver/requests')} className="btn btn--ghost btn--sm btn--icon">
          <ArrowLeftIcon size={18} />
        </button>
        <div className="navbar__logo">
          <div className="navbar__logo-mark"><NavigationIcon size={16} /></div>
          <div className="navbar__logo-text">Live <span>Navigation</span></div>
        </div>
        {lat && lng && (
          <span style={{ fontSize: '0.7rem', color: 'var(--green-light)', fontWeight: 700, background: 'var(--green-bg)', padding: '3px 8px', borderRadius: 'var(--r-full)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <SignalIcon size={12} /> GPS Active
          </span>
        )}
      </div>

      {geoError && (
        <div className="alert alert--error" style={{ margin: '12px 16px' }}>
          <AlertTriangleIcon size={18} style={{ flexShrink: 0 }} />
          <span>GPS unavailable: {geoError}</span>
        </div>
      )}

      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={[pickupLat, pickupLng]} zoom={16}
          style={{ height: '65dvh', width: '100%' }} zoomControl={false}>
          <TileLayer url={tileUrl} attribution="© CartoDB" />
          <Marker position={[pickupLat, pickupLng]} icon={personIcon}>
            <Popup>Pickup Location</Popup>
          </Marker>
          {lat && lng && (
            <>
              <Marker position={[lat, lng]} icon={ambIcon}><Popup>Your position</Popup></Marker>
              <Polyline positions={routePoints.length > 0 ? routePoints : [[lat, lng], [pickupLat, pickupLng]]} color="#1E88E5" weight={4} dashArray="8 4" />
              <FitBounds pLat={pickupLat} pLng={pickupLng} aLat={lat} aLng={lng} />
            </>
          )}
          <MapControls pLat={pickupLat} pLng={pickupLng} aLat={lat ?? undefined} aLng={lng ?? undefined} />
        </MapContainer>

        {/* Floating glass panel */}
        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, zIndex: 1000 }}>
          <div className="card card--glass" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Patient strip */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px', background: 'rgba(21,101,192,0.15)', borderRadius: 'var(--r-md)' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserIcon size={18} style={{ color: '#fff' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{request.patientName || 'Patient'}</div>
                {emergType && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--crimson-light)', background: 'rgba(211,47,47,0.15)', padding: '2px 8px', borderRadius: 'var(--r-full)' }}>{emergType}</span>}
              </div>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${pickupLat},${pickupLng}`}
                target="_blank" rel="noreferrer"
                className="btn btn--ghost btn--sm"
                style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                <ExternalLinkIcon size={13} /> Maps
              </a>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <MapPinIcon size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)' }}>
                {request.pickupAddress || 'Emergency Location'}
              </div>
            </div>

            {/* Step label */}
            {stepIndex >= 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', textAlign: 'center', letterSpacing: '0.05em' }}>
                Step {stepIndex + 1} of {STEPS.length}: <strong style={{ color: 'var(--text-2)' }}>{STEPS[stepIndex]}</strong>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              {request.status === 'in_progress' && (
                <button onClick={() => handleUpdateStatus('arrived')} className="btn btn--primary btn--full btn--lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <MapPinIcon size={18} /> Mark Arrived at Scene
                </button>
              )}
              {request.status === 'arrived' && (
                <button onClick={() => handleUpdateStatus('in_transit')} className="btn btn--teal btn--full btn--lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <CheckCircleIcon size={18} /> Patient Picked Up (Start Transport)
                </button>
              )}
              {request.status === 'in_transit' && (
                <button onClick={() => handleUpdateStatus('completed')} className="btn btn--success btn--full btn--lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <HospitalIcon size={18} /> Arrived at Hospital (Complete Trip)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
