import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSosStore } from '../../store/sosStore';
import { useSocket } from '../../hooks/useSocket';
import type { SosAssignedEvent, LocationUpdateEvent, StatusUpdateEvent } from '../../types';
import CitizenNav from '../../components/layout/CitizenNav';
import { AmbulanceIcon, ArrowLeftIcon, ClockIcon, MapPinIcon, UserIcon, HospitalIcon, AlertTriangleIcon, CheckCircleIcon, PhoneIcon } from '../../components/common/Icons';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

const ambulanceIcon = L.divIcon({ className: '', html: '<div style="background:#1565C0;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.5);border:2px solid #1E88E5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="11" rx="1.5"/><path d="M18 12h3l1 4v2h-4"/><circle cx="6.5" cy="19.5" r="1.5"/><circle cx="15.5" cy="19.5" r="1.5"/><path d="M8 11h3m-1.5-1.5v3" stroke-width="2.5"/></svg></div>', iconSize: [36, 36], iconAnchor: [18, 18] });
const personIcon = L.divIcon({ className: '', html: '<div style="background:#D32F2F;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.5);border:2px solid #EF5350"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>', iconSize: [32, 32], iconAnchor: [16, 32] });

const FlyTo = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], map.getZoom(), { duration: 1.5 }); }, [lat, lng, map]);
  return null;
};

function formatEta(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.round(seconds / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: JSX.Element }> = {
  pending:     { label: 'Finding nearest ambulance…', color: 'var(--amber)',         icon: <ClockIcon size={32} /> },
  dispatched:  { label: 'Ambulance dispatched!',      color: 'var(--blue-info)',     icon: <AmbulanceIcon size={32} /> },
  in_progress: { label: 'Ambulance en route',          color: 'var(--primary-light)', icon: <AmbulanceIcon size={32} /> },
  arrived:     { label: 'Ambulance arrived!',          color: 'var(--green-light)',   icon: <CheckCircleIcon size={32} /> },
  completed:   { label: 'Request completed',           color: 'var(--green-light)',   icon: <CheckCircleIcon size={32} /> },
  cancelled:   { label: 'Request cancelled',           color: 'var(--text-3)',        icon: <AlertTriangleIcon size={32} /> },
};

const TRACKING_STEPS = [
  { id: 'pending', label: 'Searching' },
  { id: 'dispatched', label: 'Assigned' },
  { id: 'in_progress', label: 'En Route' },
  { id: 'arrived', label: 'Arrived' },
  { id: 'completed', label: 'Complete' },
];

export default function TrackingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeRequest, fetchActive, ambulanceLat, ambulanceLng, updateFromSocket, updateAmbulanceLocation, cancelRequest } = useSosStore();
  const { on, emit } = useSocket();
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);

  useEffect(() => { if (id) fetchActive(id); }, [id, fetchActive]);

  useEffect(() => {
    if (!id) return;
    emit('citizen:trackRequest', id);
    const offAssigned = on('sos:assigned', (data: SosAssignedEvent) => {
      if (data.requestId === id) { setEtaSeconds(data.etaSeconds); fetchActive(id); }
    });
    const offStatus = on('sos:statusUpdate', (data: StatusUpdateEvent) => { updateFromSocket(data); });
    const offLocation = on('ambulance:locationUpdate', (data: LocationUpdateEvent) => { updateAmbulanceLocation(data); });
    return () => { offAssigned(); offStatus(); offLocation(); };
  }, [id]);

  useEffect(() => {
    if (!etaSeconds || etaSeconds <= 0) return;
    const t = setInterval(() => setEtaSeconds((s) => (s && s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [etaSeconds]);

  const request = activeRequest;
  const status = request?.status || 'pending';
  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.pending;
  const pickupLat = request?.pickupLat ?? 0.0613;
  const pickupLng = request?.pickupLng ?? 32.4625;
  const ambLat = ambulanceLat ?? request?.ambulance?.lat;
  const ambLng = ambulanceLng ?? request?.ambulance?.lng;

  const handleCancel = async () => {
    if (!id) return;
    if (confirm('Cancel this emergency request?')) { await cancelRequest(id); navigate('/sos'); }
  };

  return (
    <div className="page">
      <div className="navbar">
        <button onClick={() => navigate('/sos')} className="btn btn--ghost btn--sm btn--icon">
          <ArrowLeftIcon size={18} />
        </button>
        <div className="navbar__logo">
          <div className="navbar__logo-mark"><AmbulanceIcon size={18} /></div>
          <div className="navbar__logo-text">Med<span>Linka</span></div>
        </div>
        <div />
      </div>

      <MapContainer center={[pickupLat, pickupLng]} zoom={15}
        style={{ height: '45dvh', width: '100%' }} zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
        <Marker position={[pickupLat, pickupLng]} icon={personIcon}><Popup>Your location</Popup></Marker>
        {ambLat && ambLng && (
          <>
            <Marker position={[ambLat, ambLng]} icon={ambulanceIcon}><Popup>Ambulance {request?.ambulance?.plateNumber}</Popup></Marker>
            <Polyline positions={[[ambLat, ambLng], [pickupLat, pickupLng]]} color="var(--primary-light)" weight={3} dashArray="8,8" />
            <FlyTo lat={ambLat} lng={ambLng} />
          </>
        )}
      </MapContainer>

      <div className="container" style={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Status Card & Progress */}
        <div className="card" style={{ borderColor: statusInfo.color + '44', textAlign: 'center', padding: '24px 16px' }}>
          <div style={{ color: statusInfo.color, display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            {statusInfo.icon}
          </div>
          <h3 style={{ color: statusInfo.color, marginBottom: '20px' }}>{statusInfo.label}</h3>

          {/* Progress Bar */}
          {status !== 'cancelled' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '10px', left: '10%', right: '10%', height: '2px', background: 'var(--border)', zIndex: 0 }} />
              <div style={{
                position: 'absolute', top: '10px', left: '10%', height: '2px', background: statusInfo.color, zIndex: 0,
                width: `${Math.max(0, (TRACKING_STEPS.findIndex(s => s.id === status) / (TRACKING_STEPS.length - 1)) * 80)}%`,
                transition: 'width 0.5s ease-in-out'
              }} />
              {TRACKING_STEPS.map((step, idx) => {
                const stepIdx = TRACKING_STEPS.findIndex(s => s.id === status);
                const isPassed = idx <= stepIdx;
                const isCurrent = idx === stepIdx;
                return (
                  <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 1 }}>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: isCurrent ? statusInfo.color : isPassed ? statusInfo.color : 'var(--bg-3)',
                      border: isPassed ? 'none' : '2px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isPassed && !isCurrent && <CheckCircleIcon size={12} style={{ color: '#fff' }} />}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: isCurrent ? 'var(--text)' : 'var(--text-3)', fontWeight: isCurrent ? 700 : 400 }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ETA */}
        {etaSeconds !== null && etaSeconds > 0 && (
          <div className="eta-display">
            <ClockIcon size={28} style={{ color: 'var(--primary-light)' }} />
            <div>
              <div className="eta-display__time">{formatEta(etaSeconds)}</div>
              <div className="eta-display__label">Estimated Arrival</div>
            </div>
          </div>
        )}

        {/* Ambulance Info */}
        {request?.ambulance && (
          <div className="card card--accent-left-primary">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <AmbulanceIcon size={18} style={{ color: 'var(--primary-light)' }} />
              <h4>Your Ambulance</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-3)', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <MapPinIcon size={13} /> Plate
                </span>
                <strong>{request.ambulance.plateNumber}</strong>
              </div>
              {request.ambulance.driver && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-3)', display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <UserIcon size={13} /> Driver
                    </span>
                    <strong>{request.ambulance.driver.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-3)', display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <PhoneIcon size={13} /> Phone
                    </span>
                    <a href={`tel:${request.ambulance.driver.phone}`} className="btn btn--sm btn--ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--green-light)', borderColor: 'var(--green-light)' }}>
                      <PhoneIcon size={12} /> Call Driver
                    </a>
                  </div>
                </>
              )}
              {request.hospital && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-3)', display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <HospitalIcon size={13} /> Hospital
                  </span>
                  <strong>{request.hospital.name}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancel */}
        {['pending', 'dispatched'].includes(status) && (
          <button onClick={handleCancel} className="btn btn--ghost btn--full">Cancel Request</button>
        )}
      </div>

      <CitizenNav active="sos" />
    </div>
  );
}
