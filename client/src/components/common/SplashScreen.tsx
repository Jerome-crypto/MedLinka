import { useState, useEffect } from 'react';
import { AmbulanceIcon } from '../common/Icons';

interface SplashScreenProps {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1600);
    const t2 = setTimeout(() => onDone(), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`splash-screen${fading ? ' fadeout' : ''}`} role="status" aria-label="Loading MedLinka">
      <div className="splash-pulse">
        <div className="splash-pulse__ring" />
        <div className="splash-pulse__ring" />
        <div className="splash-pulse__ring" />
        <div className="splash-pulse__logo">
          <AmbulanceIcon size={44} />
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800,
          color: 'var(--text)', letterSpacing: '-0.03em'
        }}>
          Med<span style={{ color: 'var(--primary-light)' }}>Linka</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginTop: '6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Emergency Response Connected
        </div>
      </div>
    </div>
  );
}
