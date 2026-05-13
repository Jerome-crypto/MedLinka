import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import type { Role } from './types';

// Global providers & overlays
import { ToastManager } from './components/common/ToastManager';
import SplashScreen from './components/common/SplashScreen';
import InstallPrompt from './components/common/InstallPrompt';
import OfflineBanner from './components/common/OfflineBanner';

// Auth / Onboarding
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OnboardingPage from './pages/auth/OnboardingPage';
import RoleSelectPage from './pages/auth/RoleSelectPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Citizen
import SosPage from './pages/citizen/SosPage';
import TrackingPage from './pages/citizen/TrackingPage';
import HistoryPage from './pages/citizen/HistoryPage';
import MedicalProfilePage from './pages/citizen/MedicalProfilePage';
import SettingsPage from './pages/citizen/SettingsPage';

// Driver
import DriverRequestsPage from './pages/driver/DriverRequestsPage';
import DriverNavigationPage from './pages/driver/DriverNavigationPage';

// Hospital
import HospitalIncomingPage from './pages/hospital/HospitalIncomingPage';
import HospitalPatientPage from './pages/hospital/HospitalPatientPage';

// Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminAmbulancesPage from './pages/admin/AdminAmbulancesPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

// ── Route Guards ─────────────────────────────────────────────────────
const RequireAuth = ({ children, roles }: { children: JSX.Element; roles?: Role[] }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const HomeRedirect = () => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  const redirects: Record<Role, string> = {
    citizen:        '/sos',
    driver:         '/driver/requests',
    hospital_admin: '/hospital/incoming',
    admin:          '/admin/dashboard',
  };
  return <Navigate to={redirects[user.role]} replace />;
};

// ── App ──────────────────────────────────────────────────────────────
export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash on very first load (not on hot-reload / re-navigation)
    return !sessionStorage.getItem('medlinka-splash-shown');
  });

  const handleSplashDone = useCallback(() => {
    sessionStorage.setItem('medlinka-splash-shown', '1');
    setSplashDone(true);
    setShowSplash(false);
  }, []);

  if (showSplash && !splashDone) {
    return <SplashScreen onDone={handleSplashDone} />;
  }

  return (
    <ToastManager>
      <BrowserRouter>
        <OfflineBanner />
        <InstallPrompt />

        <Routes>
          {/* Public / Onboarding */}
          <Route path="/onboarding"      element={<OnboardingPage />} />
          <Route path="/role-select"     element={<RoleSelectPage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Root redirect */}
          <Route path="/" element={<HomeRedirect />} />

          {/* ── Citizen ──────────────────────────────────── */}
          <Route path="/sos"          element={<RequireAuth roles={['citizen']}><SosPage /></RequireAuth>} />
          <Route path="/tracking/:id" element={<RequireAuth roles={['citizen']}><TrackingPage /></RequireAuth>} />
          <Route path="/history"      element={<RequireAuth roles={['citizen']}><HistoryPage /></RequireAuth>} />
          <Route path="/profile"      element={<RequireAuth roles={['citizen']}><MedicalProfilePage /></RequireAuth>} />
          <Route path="/settings"     element={<RequireAuth roles={['citizen']}><SettingsPage /></RequireAuth>} />

          {/* ── Driver ───────────────────────────────────── */}
          <Route path="/driver/requests"       element={<RequireAuth roles={['driver']}><DriverRequestsPage /></RequireAuth>} />
          <Route path="/driver/navigation/:id" element={<RequireAuth roles={['driver']}><DriverNavigationPage /></RequireAuth>} />

          {/* ── Hospital ─────────────────────────────────── */}
          <Route path="/hospital/incoming"    element={<RequireAuth roles={['hospital_admin']}><HospitalIncomingPage /></RequireAuth>} />
          <Route path="/hospital/patient/:id" element={<RequireAuth roles={['hospital_admin']}><HospitalPatientPage /></RequireAuth>} />

          {/* ── Admin ────────────────────────────────────── */}
          <Route path="/admin/dashboard"  element={<RequireAuth roles={['admin']}><AdminDashboardPage /></RequireAuth>} />
          <Route path="/admin/ambulances" element={<RequireAuth roles={['admin']}><AdminAmbulancesPage /></RequireAuth>} />
          <Route path="/admin/reports"    element={<RequireAuth roles={['admin']}><AdminReportsPage /></RequireAuth>} />
          <Route path="/admin/users"      element={<RequireAuth roles={['admin']}><AdminUsersPage /></RequireAuth>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastManager>
  );
}
