// MedLinka Icon Library — inline SVG, no dependencies
interface IconProps { size?: number; className?: string; style?: React.CSSProperties; }
const ico = (path: string, viewBox = '0 0 24 24') =>
  ({ size = 20, className, style }: IconProps) => (
    <svg width={size} height={size} viewBox={viewBox} fill="none"
      stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
      strokeLinejoin="round" className={className} style={style}>
      {typeof path === 'string' ? <path d={path} /> : path}
    </svg>
  );

export const AmbulanceIcon = ({ size = 20, className, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
    strokeLinejoin="round" className={className} style={style}>
    <rect x="2" y="7" width="16" height="11" rx="1.5" />
    <path d="M18 12h3l1 4v2h-4" />
    <circle cx="6.5" cy="19.5" r="1.5" />
    <circle cx="15.5" cy="19.5" r="1.5" />
    <path d="M8 11h3m-1.5-1.5v3" strokeWidth={2} />
    <path d="M2 11h6" />
  </svg>
);

export const HospitalIcon = ({ size = 20, className, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
    strokeLinejoin="round" className={className} style={style}>
    <path d="M3 21V7a2 2 0 012-2h14a2 2 0 012 2v14" />
    <path d="M9 21V13h6v8" />
    <path d="M10 9h4M12 7v4" strokeWidth={2} />
    <path d="M3 21h18" />
  </svg>
);

export const ShieldCrossIcon = ({ size = 20, className, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
    strokeLinejoin="round" className={className} style={style}>
    <path d="M12 2L3.5 6v6c0 4.5 3.5 8.5 8.5 10 5-1.5 8.5-5.5 8.5-10V6L12 2z" />
    <path d="M10 12h4M12 10v4" strokeWidth={2} />
  </svg>
);

export const LocationPinIcon = ico('M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z');
export const AlertTriangleIcon = ico('M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01');
export const ClockIcon = ico('M12 2a10 10 0 100 20A10 10 0 0012 2zm0 5v5l3 3');
export const CheckCircleIcon = ico('M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3');
export const BedIcon = ico('M2 3v11M2 8h18a2 2 0 012 2v4H2M2 19h20M6 8V3M18 14H2');
export const UserIcon = ico('M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z');
export const PhoneIcon = ico('M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.02 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.72 6.72l1.28-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z');
export const ChartLineIcon = ico('M3 3v18h18M18 9l-5 5-4-4-3 3');
export const WifiOffIcon = ico('M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01');
export const ArrowLeftIcon = ico('M19 12H5M12 19l-7-7 7-7');
export const LogOutIcon = ico('M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9');
export const MapPinIcon = ico('M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z');
export const HeartPulseIcon = ({ size = 20, className, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
    strokeLinejoin="round" className={className} style={style}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    <path d="M8 12h2l2-4 2 8 2-4h2" strokeWidth={1.5} />
  </svg>
);
export const NavigationIcon = ico('M3 11l19-9-9 19-2-8-8-2z');
export const BellIcon = ico('M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0');
export const FolderIcon = ico('M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z');
export const RefreshIcon = ico('M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15');
export const FleetIcon = ({ size = 20, className, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
    strokeLinejoin="round" className={className} style={style}>
    <rect x="1" y="8" width="13" height="9" rx="1" />
    <path d="M14 12h4l3 3v3h-7V12zM5.5 17.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM17.5 17.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
  </svg>
);
export const DownloadIcon = ico('M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3');
export const EyeIcon = ico('M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 100-6 3 3 0 000 6z');
export const XCircleIcon = ico('M22 12A10 10 0 112 12a10 10 0 0120 0zM15 9l-6 6M9 9l6 6');
export const StarIcon = ico('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z');
export const SettingsIcon = ico('M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z');
export const ExternalLinkIcon = ico('M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3');
export const PlusIcon = ico('M12 5v14M5 12h14');
export const SignalIcon = ico('M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16');
export const ZapIcon = ico('M13 2L3 14h9l-1 8 10-12h-9l1-8z');
export const ActivityIcon = ico('M22 12h-4l-3 9L9 3l-3 9H2');
export const TruckIcon = ico('M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 18.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM17.5 18.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z');
export const CrosshairIcon = ico('M12 22a10 10 0 100-20 10 10 0 000 20zM22 12h-4M6 12H2M12 6V2M12 22v-4');
export const AlertSirenIcon = ({ size = 20, className, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
    strokeLinejoin="round" className={className} style={style}>
    <path d="M12 2L4 9v4h16V9L12 2z" />
    <path d="M4 13v5a1 1 0 001 1h14a1 1 0 001-1v-5" />
    <path d="M9 18v3M15 18v3" />
    <path d="M12 6v4M12 11h.01" strokeWidth={2} />
  </svg>
);
export const FlameIcon = ico('M12 23c-4.4 0-8-3.6-8-8 0-5.3 5.2-9.5 7-14 1.5 3 3 5 3 8 1.5-1.5 2-3 2-5.5 2 2 3 5 3 7.5 0 4.4-3.6 8-8 8z');
export const CarCrashIcon = ({ size = 20, className, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
    strokeLinejoin="round" className={className} style={style}>
    <path d="M5 17H3v-7l2-3h12l2 3v7h-2M5 17h10M5 17a2 2 0 100 4 2 2 0 000-4zM15 17a2 2 0 100 4 2 2 0 000-4z" />
    <path d="M9 5L7 2M15 5l2-2" strokeWidth={2} />
  </svg>
);
export const BabyIcon = ico('M9 12a3 3 0 100-6 3 3 0 000 6zM17.5 6.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 20a9 9 0 0118 0H5z');
export const SosIcon = ({ size = 20, className, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"
    strokeLinejoin="round" className={className} style={style}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8M12 8v8" strokeWidth={2.5} />
  </svg>
);
export const UserCircleIcon = ico('M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 13a4 4 0 100-8 4 4 0 000 8zM4.5 19.5a8 8 0 0115 0');
export const LinkIcon = ico('M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71');
export const EditIcon = ico('M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z');
export const TrashIcon = ico('M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6');
