import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sosApi } from '../../api/sos.api';
import type { EmergencyRequest } from '../../types';
import { format } from 'date-fns';
import { ArrowLeftIcon, UserIcon, AmbulanceIcon, PhoneIcon, AlertTriangleIcon, ClockIcon, HospitalIcon, CheckCircleIcon } from '../../components/common/Icons';

function getInitials(name?: string | null) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function HospitalPatientPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [patientReceived, setPatientReceived] = useState(false);

  useEffect(() => {
    if (id) sosApi.getById(id).then(res => setRequest(res.data.data)).catch(console.error);
  }, [id]);

  if (!request) return (
    <div className="page flex justify-center items-center">
      <span className="spinner spinner--lg" />
    </div>
  );

  return (
    <div className="page">
      <div className="navbar">
        <button onClick={() => navigate('/hospital/incoming')} className="btn btn--ghost btn--sm btn--icon">
          <ArrowLeftIcon size={18} />
        </button>
        <div className="navbar__logo">
          <div className="navbar__logo-mark"><HospitalIcon size={18} /></div>
          <div className="navbar__logo-text">Patient <span>Details</span></div>
        </div>
        <div />
      </div>

      <div className="page-content mt-6" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Patient header */}
        <div className="card card--elevated" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: '#fff'
          }}>
            {getInitials(request.patientName)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <h3>{request.patientName || 'Unknown Patient'}</h3>
              <span className={`badge badge--${request.status}`}>{request.status.replace('_', ' ')}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', flexWrap: 'wrap' }}>
              {request.patientAge && (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <UserIcon size={13} /> Age {request.patientAge}
                </span>
              )}
              <span style={{ fontSize: '0.875rem', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ClockIcon size={13} /> {format(new Date(request.requestedAt), 'h:mm a, MMM d')}
              </span>
            </div>
          </div>
        </div>

        {/* Medical notes */}
        {request.medicalNotes && (
          <div style={{
            display: 'flex', gap: '12px', alignItems: 'flex-start',
            padding: '16px', background: 'var(--amber-bg)',
            border: '1px solid rgba(245,124,0,0.3)', borderRadius: 'var(--r-lg)',
            color: 'var(--amber-light)'
          }}>
            <AlertTriangleIcon size={20} style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: 700 }}>
                Medical Notes
              </div>
              <div style={{ fontSize: '0.9375rem' }}>{request.medicalNotes}</div>
            </div>
          </div>
        )}

        {/* Ambulance details */}
        <div className="card card--accent-left-primary">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AmbulanceIcon size={18} style={{ color: 'var(--primary-light)' }} />
            <h4>Ambulance Details</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>Plate Number</span>
              <strong>{request.ambulance?.plateNumber || '—'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserIcon size={13} /> Driver
              </span>
              <strong>{request.ambulance?.driver?.name || '—'}</strong>
            </div>
            {request.ambulance?.driver?.phone && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <PhoneIcon size={13} /> Driver Phone
                </span>
                <strong>{request.ambulance.driver.phone}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="card">
          <h4 style={{ marginBottom: '16px' }}>Emergency Timeline</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '11px', width: '2px', background: 'var(--border)' }} />
            
            <div style={{ display: 'flex', gap: '12px', zIndex: 1 }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircleIcon size={14} style={{ color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>SOS Requested</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{format(new Date(request.requestedAt), 'h:mm a')}</div>
              </div>
            </div>

            {request.dispatchedAt && (
              <div style={{ display: 'flex', gap: '12px', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleIcon size={14} style={{ color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Ambulance Dispatched</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{format(new Date(request.dispatchedAt), 'h:mm a')}</div>
                </div>
              </div>
            )}

            {request.arrivedAt && (
              <div style={{ display: 'flex', gap: '12px', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleIcon size={14} style={{ color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Arrived at Scene</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{format(new Date(request.arrivedAt), 'h:mm a')}</div>
                </div>
              </div>
            )}

            {request.completedAt && (
              <div style={{ display: 'flex', gap: '12px', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleIcon size={14} style={{ color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Emergency Completed</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{format(new Date(request.completedAt), 'h:mm a')}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {['in_progress', 'arrived', 'completed'].includes(request.status) && (
          <button onClick={() => setPatientReceived(true)} disabled={patientReceived}
            className={`btn btn--lg btn--full ${patientReceived ? 'btn--success' : 'btn--primary'}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <CheckCircleIcon size={18} /> {patientReceived ? 'Patient Handover Complete' : 'Confirm Patient Received'}
          </button>
        )}
      </div>
    </div>
  );
}
