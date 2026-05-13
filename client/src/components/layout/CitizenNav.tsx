import { Link } from 'react-router-dom';
import { HeartPulseIcon, ClockIcon, UserIcon, SettingsIcon } from '../common/Icons';

type CitizenTab = 'sos' | 'history' | 'profile' | 'settings';

interface CitizenNavProps { active: CitizenTab; }

export default function CitizenNav({ active }: CitizenNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Citizen navigation">
      <Link to="/sos"      className={`bottom-nav__item ${active === 'sos'      ? 'active' : ''}`} id="nav-sos">
        <HeartPulseIcon size={22} />
        Home
      </Link>
      <Link to="/history"  className={`bottom-nav__item ${active === 'history'  ? 'active' : ''}`} id="nav-history">
        <ClockIcon size={22} />
        History
      </Link>
      <Link to="/profile"  className={`bottom-nav__item ${active === 'profile'  ? 'active' : ''}`} id="nav-profile">
        <UserIcon size={22} />
        Profile
      </Link>
      <Link to="/settings" className={`bottom-nav__item ${active === 'settings' ? 'active' : ''}`} id="nav-settings">
        <SettingsIcon size={22} />
        Settings
      </Link>
    </nav>
  );
}
