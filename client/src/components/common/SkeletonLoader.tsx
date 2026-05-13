interface SkeletonCardProps { count?: number; }

export function SkeletonCard({ count = 3 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="skeleton skeleton--text" style={{ width: '30%' }} />
            <div className="skeleton skeleton--text" style={{ width: '20%' }} />
          </div>
          <div className="skeleton skeleton--title" style={{ width: '65%' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div className="skeleton skeleton--text" style={{ width: '80%' }} />
            <div className="skeleton skeleton--text" style={{ width: '70%' }} />
          </div>
          <div className="skeleton" style={{ height: '36px', borderRadius: '8px' }} />
        </div>
      ))}
    </>
  );
}

export function SkeletonStatGrid() {
  return (
    <div className="grid-2" style={{ gap: '12px' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="stat-card" style={{ gap: '10px' }}>
          <div className="skeleton skeleton--circle" style={{ width: 40, height: 40 }} />
          <div className="skeleton skeleton--text" style={{ width: '60%' }} />
          <div className="skeleton skeleton--title" style={{ width: '40%' }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonHistoryCard({ count = 4 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="skeleton skeleton--text" style={{ width: '25%' }} />
            <div className="skeleton skeleton--text" style={{ width: '15%' }} />
          </div>
          <div className="skeleton skeleton--title" style={{ width: '55%' }} />
          <div className="skeleton skeleton--text" style={{ width: '75%' }} />
        </div>
      ))}
    </>
  );
}
