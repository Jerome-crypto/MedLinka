import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSosStore } from '../../store/sosStore';
import CitizenNav from '../../components/layout/CitizenNav';
import { SkeletonHistoryCard } from '../../components/common/SkeletonLoader';
import { format, formatDistanceStrict } from 'date-fns';
import { FolderIcon, MapPinIcon, HospitalIcon, ClockIcon } from '../../components/common/Icons';

const TYPE_EMOJI: Record<string, string> = {
  ACCIDENT: '💥', MEDICAL: '🚑', MATERNAL: '🤱', FIRE: '🔥', OTHER: '🆘',
};

function getDuration(req: any): string {
  const end = req.completedAt || req.arrivedAt;
  if (!end) return '';
  try {
    return formatDistanceStrict(new Date(end), new Date(req.requestedAt));
  } catch { return ''; }
}

export default function HistoryPage() {
  const { requests, fetchList, isLoading } = useSosStore();
  useEffect(() => { fetchList(); }, [fetchList]);

  return (
    <div className="page">
      <div className="navbar">
        <div className="navbar__logo">
          <div className="navbar__logo-mark"><ClockIcon size={18} /></div>
          <div className="navbar__logo-text">Request <span>History</span></div>
        </div>
      </div>

      <div className="page-header"><h2>My Requests</h2></div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {isLoading ? (
          <SkeletonHistoryCard count={4} />
        ) : requests.length === 0 ? (
          <div className="card text-center" style={{ padding: '48px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--text-3)' }}>
              <FolderIcon size={48} />
            </div>
            <h3 style={{ color: 'var(--text-2)', marginBottom: '8px' }}>No requests yet</h3>
            <p style={{ fontSize: '0.875rem' }}>Your emergency request history will appear here.</p>
          </div>
        ) : (
          requests.map((req) => {
            const typeMatch = req.medicalNotes?.match(/^\[(\w+)\]/);
            const emergType = typeMatch?.[1] || null;
            const duration = getDuration(req);
            const isActive = ['pending', 'dispatched', 'in_progress', 'arrived'].includes(req.status);

            return (
              <Link
                to={`/tracking/${req.id}`}
                key={req.id}
                className={`card ${isActive ? 'card--crimson' : 'card--accent-left'}`}
                style={{ display: 'flex', flexDirection: 'column', gap: '10px', textDecoration: 'none', transition: 'border-color 0.2s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className={`badge badge--${req.status}`}>{req.status.replace('_', ' ')}</span>
                    {emergType && (
                      <span style={{ fontSize: '0.9rem' }}>{TYPE_EMOJI[emergType] || '🆘'}</span>
                    )}
                    {emergType && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-2)' }}>{emergType}</span>
                    )}
                    {isActive && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--crimson-light)', background: 'rgba(211,47,47,0.12)', padding: '2px 8px', borderRadius: 'var(--r-full)' }} className="animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <ClockIcon size={12} />
                    {format(new Date(req.requestedAt), 'MMM d, h:mm a')}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <MapPinIcon size={12} /> Pickup Location
                  </div>
                  <div className="truncate" style={{ fontWeight: 500 }}>
                    {req.pickupAddress || `${req.pickupLat.toFixed(4)}, ${req.pickupLng.toFixed(4)}`}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {req.hospital ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <HospitalIcon size={12} />
                      <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{req.hospital.name}</span>
                    </div>
                  ) : <div />}
                  {duration && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      ⏱ {duration}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>

      <CitizenNav active="history" />
    </div>
  );
}
