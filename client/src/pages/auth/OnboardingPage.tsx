import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangleIcon, HospitalIcon, SignalIcon, AmbulanceIcon, ArrowLeftIcon,
} from '../../components/common/Icons';

// Inline SVG icons for onboarding slides
const SosIllustrationIcon = () => (
  <svg width={64} height={64} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" strokeWidth={2.5} />
  </svg>
);

const SLIDES = [
  {
    Icon: SosIllustrationIcon,
    title: 'Request emergency help instantly.',
    sub:   'One tap connects you to the nearest ambulance. Your GPS is shared automatically so help knows exactly where you are.',
    bg:    'rgba(211,47,47,0.1)',
    color: 'var(--crimson)',
  },
  {
    Icon: HospitalIcon,
    title: 'Hospitals prepare before you arrive.',
    sub:   'Real-time coordination means the ER is ready the moment your ambulance pulls in — cutting critical minutes.',
    bg:    'rgba(0,137,123,0.1)',
    color: 'var(--teal)',
  },
  {
    Icon: SignalIcon,
    title: 'Works via App, SMS, and USSD.',
    sub:   'No internet? No problem. MedLinka stays connected through SMS and USSD *112# so no one is ever out of reach.',
    bg:    'rgba(25,118,210,0.1)',
    color: 'var(--primary)',
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const startXRef = useRef<number | null>(null);

  const goTo = (i: number) => setCurrent(Math.max(0, Math.min(SLIDES.length - 1, i)));

  const handleTouchStart = (e: React.TouchEvent) => { startXRef.current = e.touches[0].clientX; };
  const handleTouchEnd   = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    const dx = e.changedTouches[0].clientX - startXRef.current;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
    startXRef.current = null;
  };

  const finish = () => {
    localStorage.setItem('medlinka-onboarding', 'done');
    navigate('/login');
  };
  const skip = () => {
    localStorage.setItem('medlinka-onboarding', 'done');
    navigate('/login');
  };

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  return (
    <div className="onboarding-page">
      {/* Skip button */}
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={skip} className="btn btn--ghost btn--sm">Skip</button>
      </div>

      {/* Slides */}
      <div className="onboarding-slides" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className="onboarding-slide"
            style={{ transform: `translateX(${(i - current) * 100}%)`, position: 'absolute', inset: 0 }}
          >
            {/* Illustration — clean SVG icon in a tinted circle */}
            <div className="onboarding-slide__illustration" style={{
              background: s.bg,
              borderRadius: '50%',
              color: s.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <s.Icon size={72} />
            </div>
            <div style={{ maxWidth: 340 }}>
              <h2 className="onboarding-slide__title" style={{ color: s.color }}>{s.title}</h2>
              <p className="onboarding-slide__sub" style={{ marginTop: 12 }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="onboarding-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`onboarding-dot${i === current ? ' active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="onboarding-footer">
        {isLast ? (
          <button id="onboarding-get-started" onClick={finish} className="btn btn--primary btn--full btn--lg"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <AmbulanceIcon size={20} />
            Get Started
          </button>
        ) : (
          <button onClick={() => goTo(current + 1)} className="btn btn--primary btn--full btn--lg"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Next
            <ArrowLeftIcon size={18} style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}
      </div>
    </div>
  );
}
