import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { reportsApi } from '../../api/hospital.api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCrossIcon, AmbulanceIcon, HospitalIcon, ClockIcon, ChartLineIcon, FleetIcon, SettingsIcon, LogOutIcon, AlertTriangleIcon, UserIcon, ZapIcon } from '../../components/common/Icons';
import { SkeletonStatGrid } from '../../components/common/SkeletonLoader';

const PIE_COLORS = ['#66BB6A', '#FFB300', '#8FA3C0'];

export default function AdminDashboardPage() {
  const { logout } = useAuthStore();
  const [stats, setStats]             = useState<any>(null);
  const [respTime, setRespTime]       = useState<any>(null);
  const [weekData, setWeekData]       = useState<any[]>([]);
  const [feed, setFeed]               = useState<any[]>([]);
  const [analytics, setAnalytics]     = useState<any>(null);

  useEffect(() => {
    reportsApi.stats().then(res => setStats(res.data.data)).catch(console.error);
    reportsApi.responseTime().then(res => setRespTime(res.data.data)).catch(console.error);
    reportsApi.requestsPerWeek().then(res => setWeekData(res.data.data)).catch(console.error);
    reportsApi.activityFeed(10).then(res => setFeed(res.data.data)).catch(console.error);
    reportsApi.analytics().then(res => setAnalytics(res.data.data)).catch(console.error);
  }, []);

  const pieData = stats ? [
    { name: 'Available',  value: stats.ambulances.available },
    { name: 'Dispatched', value: stats.ambulances.dispatched },
    { name: 'Offline',    value: 0 },
  ] : [];

  return (
    <div className="page">
      <div className="navbar">
        <div className="navbar__logo">
          <div className="navbar__logo-mark"><ShieldCrossIcon size={18} /></div>
          <div className="navbar__logo-text">Admin <span>Center</span></div>
        </div>
        <button onClick={() => logout()} className="btn btn--ghost btn--sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <LogOutIcon size={13} /> Sign out
        </button>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { to: '/admin/ambulances', icon: <FleetIcon size={22} />,    label: 'Fleet',      color: 'var(--primary-light)' },
            { to: '/admin/providers',  icon: <AmbulanceIcon size={22} />, label: 'Providers',  color: 'var(--amber-light)'   },
            { to: '/admin/users',      icon: <UserIcon size={22} />,     label: 'Users',      color: 'var(--teal-light)'    },
            { to: '/admin/reports',    icon: <ChartLineIcon size={22} />, label: 'Reports',    color: 'var(--green-light)'   },
          ].map(item => (
            <Link key={item.to} to={item.to} className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, cursor: 'pointer', textDecoration: 'none' }}>
              <div style={{ color: item.color }}>{item.icon}</div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* KPI Stats */}
        {!stats ? <SkeletonStatGrid /> : (
          <div className="grid-2">
            {[
              { icon: <AlertTriangleIcon size={20} />, label: 'Active Requests',     value: stats.requests.active,       iconBg: 'rgba(211,47,47,0.15)', iconColor: 'var(--crimson-light)' },
              { icon: <AmbulanceIcon size={20} />,     label: 'Available Ambulances', value: `${stats.ambulances.available}/${stats.ambulances.total}`, iconBg: 'var(--green-bg)', iconColor: 'var(--green-light)' },
              { icon: <HospitalIcon size={20} />,      label: 'Hospitals',            value: stats.hospitals,             iconBg: 'var(--blue-info-bg)', iconColor: 'var(--blue-info)' },
              { icon: <ClockIcon size={20} />,         label: 'Avg Response',         value: respTime ? `${Math.round(respTime.avgSeconds / 60)}m` : '—', iconBg: 'var(--amber-bg)', iconColor: 'var(--amber-light)' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-card__icon" style={{ background: s.iconBg, color: s.iconColor }}>{s.icon}</div>
                <div className="stat-card__label">{s.label}</div>
                <div className="stat-card__value">{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics KPIs */}
        {analytics && (
          <div className="grid-2">
            <div className="stat-card">
              <div className="stat-card__icon" style={{ background: 'var(--amber-bg)', color: 'var(--amber-light)' }}><ClockIcon size={18} /></div>
              <div className="stat-card__label">Peak Hour</div>
              <div className="stat-card__value" style={{ fontSize: '1.2rem' }}>{analytics.peakHour}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon" style={{ background: 'rgba(211,47,47,0.15)', color: 'var(--crimson-light)' }}><AlertTriangleIcon size={18} /></div>
              <div className="stat-card__label">Most Common</div>
              <div className="stat-card__value" style={{ fontSize: '1.1rem' }}>{analytics.commonType}</div>
            </div>
          </div>
        )}

        {/* Emergency Trends Chart */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ChartLineIcon size={20} style={{ color: 'var(--primary-light)' }} /> Emergency Trends (Last 7 Days)
          </div>
          {weekData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weekData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-3)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                <Bar dataKey="vol" fill="var(--primary-light)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '0.875rem' }}>
              No data yet
            </div>
          )}
        </div>

        {/* Ambulance Utilization Pie */}
        {stats && (
          <div className="card">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FleetIcon size={20} style={{ color: 'var(--teal-light)' }} /> Fleet Utilization
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width="50%" height={140}>
                <PieChart>
                  <Pie data={pieData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pieData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i], flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-2)' }}>{d.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text)', marginLeft: 'auto' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity Feed */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ZapIcon size={20} style={{ color: 'var(--amber-light)' }} /> Live Activity Feed
          </div>
          {feed.length > 0 ? (
            <div className="activity-feed">
              {feed.map((item: any, i: number) => (
                <div key={i} className="activity-item">
                  <div className="activity-item__dot" style={{ background: item.color }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="activity-item__text">{item.text}</div>
                    <div className="activity-item__time">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
