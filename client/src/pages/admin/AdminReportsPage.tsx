import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../../api/hospital.api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeftIcon, ChartLineIcon, ShieldCrossIcon, DownloadIcon, ClockIcon, AlertTriangleIcon } from '../../components/common/Icons';

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const [trendData, setTrendData]   = useState<any[]>([]);
  const [weekData, setWeekData]     = useState<any[]>([]);
  const [analytics, setAnalytics]   = useState<any>(null);

  useEffect(() => {
    reportsApi.requestsPerDay().then(res => setTrendData(res.data.data)).catch(console.error);
    reportsApi.requestsPerWeek().then(res => setWeekData(res.data.data)).catch(console.error);
    reportsApi.analytics().then(res => setAnalytics(res.data.data)).catch(console.error);
  }, []);

  const handleExport = async () => {
    try {
      const res = await reportsApi.exportCSV();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'medlinka-requests.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) { console.error('Failed to export CSV', err); }
  };

  return (
    <div className="page">
      <div className="navbar">
        <button onClick={() => navigate('/admin/dashboard')} className="btn btn--ghost btn--sm btn--icon">
          <ArrowLeftIcon size={18} />
        </button>
        <div className="navbar__logo">
          <div className="navbar__logo-mark"><ShieldCrossIcon size={18} /></div>
          <div className="navbar__logo-text">System <span>Reports</span></div>
        </div>
        <div />
      </div>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Analytics</h2>
        <button onClick={handleExport} className="btn btn--primary btn--sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <DownloadIcon size={14} /> Export CSV
        </button>
      </div>

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Live KPI Cards */}
        <div className="grid-2">
          <div className="stat-card">
            <div className="stat-card__icon" style={{ background: 'var(--amber-bg)', color: 'var(--amber-light)' }}><ClockIcon size={18} /></div>
            <div className="stat-card__label">Peak Hour</div>
            <div className="stat-card__value" style={{ fontSize: '1.3rem' }}>
              {analytics ? analytics.peakHour : '—'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon" style={{ background: 'rgba(211,47,47,0.15)', color: 'var(--crimson-light)' }}><AlertTriangleIcon size={18} /></div>
            <div className="stat-card__label">Most Common</div>
            <div className="stat-card__value" style={{ fontSize: '1.1rem' }}>
              {analytics ? analytics.commonType : '—'}
            </div>
          </div>
        </div>

        {/* Daily volume bar chart — live data */}
        <div className="card card--elevated">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ChartLineIcon size={20} style={{ color: 'var(--teal-light)' }} /> Daily Volume (This Week)
          </div>
          {weekData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weekData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-3)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="vol" fill="var(--teal-light)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '0.875rem' }}>
              No data yet
            </div>
          )}
        </div>

        {/* 30-day trend line chart */}
        <div className="card card--elevated">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--teal-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-light)' }}>
              <ChartLineIcon size={16} />
            </div>
            <div>
              <h3 style={{ marginBottom: 0 }}>Request Trend</h3>
              <p style={{ fontSize: '0.8rem', marginTop: 2 }}>Last 30 days</p>
            </div>
          </div>
          <div style={{ height: 240, width: '100%' }}>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-3)" tick={{ fill: 'var(--text-3)', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-3)" tick={{ fill: 'var(--text-3)', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-3)', borderColor: 'var(--border-2)', borderRadius: 10, fontSize: '0.875rem' }} itemStyle={{ color: 'var(--primary-light)' }} labelStyle={{ color: 'var(--text-2)', marginBottom: 4 }} />
                  <Line type="monotone" dataKey="count" stroke="var(--primary-light)" strokeWidth={2.5}
                    dot={{ r: 4, fill: 'var(--bg-2)', stroke: 'var(--primary-light)', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: 'var(--primary-light)' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-3)' }}>
                <ChartLineIcon size={40} />
                <p style={{ fontSize: '0.875rem' }}>Insufficient data for chart</p>
              </div>
            )}
          </div>
        </div>

        <button id="csv-export-btn" onClick={handleExport} className="btn btn--primary btn--full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <DownloadIcon size={16} /> Export All Data as CSV
        </button>
      </div>
    </div>
  );
}
