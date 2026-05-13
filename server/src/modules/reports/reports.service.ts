import { prisma } from '../../config/database';

export const ReportsService = {
  /** Overall dashboard stats */
  async stats() {
    const [totalRequests, activeRequests, completedRequests, cancelledRequests,
           totalAmbulances, availableAmbulances, totalHospitals, totalUsers] = await Promise.all([
      prisma.emergencyRequest.count(),
      prisma.emergencyRequest.count({ where: { status: { in: ['pending', 'dispatched', 'in_progress'] } } }),
      prisma.emergencyRequest.count({ where: { status: 'completed' } }),
      prisma.emergencyRequest.count({ where: { status: 'cancelled' } }),
      prisma.ambulance.count(),
      prisma.ambulance.count({ where: { status: 'available' } }),
      prisma.hospital.count(),
      prisma.user.count({ where: { role: 'citizen' } }),
    ]);

    return {
      requests:   { total: totalRequests, active: activeRequests, completed: completedRequests, cancelled: cancelledRequests },
      ambulances: { total: totalAmbulances, available: availableAmbulances, dispatched: totalAmbulances - availableAmbulances },
      hospitals:  totalHospitals,
      citizens:   totalUsers,
    };
  },

  /** Average response time (dispatched_at - requested_at) in seconds */
  async avgResponseTime() {
    const requests = await prisma.emergencyRequest.findMany({
      where:  { dispatchedAt: { not: null } },
      select: { requestedAt: true, dispatchedAt: true },
    });
    if (requests.length === 0) return { avgSeconds: 0, count: 0 };
    const total = requests.reduce((sum, r) => sum + (r.dispatchedAt!.getTime() - r.requestedAt.getTime()) / 1000, 0);
    return { avgSeconds: Math.round(total / requests.length), count: requests.length };
  },

  /** Requests per day (last 30 days) */
  async requestsPerDay() {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const requests = await prisma.emergencyRequest.findMany({
      where:   { requestedAt: { gte: since } },
      select:  { requestedAt: true, status: true },
      orderBy: { requestedAt: 'asc' },
    });
    const grouped: Record<string, { date: string; count: number; completed: number }> = {};
    requests.forEach(r => {
      const date = r.requestedAt.toISOString().split('T')[0];
      if (!grouped[date]) grouped[date] = { date, count: 0, completed: 0 };
      grouped[date].count++;
      if (r.status === 'completed') grouped[date].completed++;
    });
    return Object.values(grouped);
  },

  /** Requests per weekday (last 7 days) — replaces MOCK_BAR */
  async requestsThisWeek() {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const requests = await prisma.emergencyRequest.findMany({
      where:  { requestedAt: { gte: since } },
      select: { requestedAt: true },
    });

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts: Record<string, number> = {};
    DAYS.forEach(d => { counts[d] = 0; });
    requests.forEach(r => {
      const day = DAYS[r.requestedAt.getDay()];
      counts[day]++;
    });

    // Return in Mon→Sun order matching typical chart display
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({ day, vol: counts[day] }));
  },

  /** Peak hour and most common emergency type — replaces hardcoded KPI cards */
  async analytics() {
    const requests = await prisma.emergencyRequest.findMany({
      select: { requestedAt: true, medicalNotes: true },
    });

    // Peak hour (0-23) by frequency
    const hourCounts: number[] = Array(24).fill(0);
    const typeCounts: Record<string, number> = {};

    requests.forEach(r => {
      hourCounts[r.requestedAt.getHours()]++;
      // Extract type prefix e.g. "[ACCIDENT]"
      const typeMatch = r.medicalNotes?.match(/^\[(\w+)\]/);
      if (typeMatch) {
        const t = typeMatch[1];
        typeCounts[t] = (typeCounts[t] ?? 0) + 1;
      }
    });

    const peakHourIndex = hourCounts.indexOf(Math.max(...hourCounts));
    const formatHour = (h: number) => {
      const suffix = h < 12 ? 'am' : 'pm';
      const display = h % 12 === 0 ? 12 : h % 12;
      return `${display}–${display === 12 ? 1 : display + 1}${suffix}`;
    };

    const commonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';

    return {
      peakHour:   requests.length ? formatHour(peakHourIndex) : 'N/A',
      commonType,
      totalCount: requests.length,
    };
  },

  /** Activity feed — last N significant events */
  async activityFeed(limit = 20) {
    const [recentSos, recentUsers] = await Promise.all([
      prisma.emergencyRequest.findMany({
        take:    limit,
        orderBy: { requestedAt: 'desc' },
        select:  { id: true, status: true, patientName: true, medicalNotes: true, requestedAt: true, hospital: { select: { name: true } } },
      }),
      prisma.user.findMany({
        where:   { role: 'citizen' },
        take:    5,
        orderBy: { createdAt: 'desc' },
        select:  { name: true, createdAt: true },
      }),
    ]);

    type FeedItem = { time: Date; text: string; color: string };
    const items: FeedItem[] = [];

    recentSos.forEach(r => {
      const typeMatch = r.medicalNotes?.match(/^\[(\w+)\]/);
      const type = typeMatch?.[1] ?? 'Emergency';
      const name = r.patientName ?? 'Unknown patient';
      if (r.status === 'completed') {
        items.push({ time: r.requestedAt, text: `Request completed — ${name} delivered to ${r.hospital?.name ?? 'hospital'}`, color: 'var(--green-light)' });
      } else if (r.status === 'dispatched' || r.status === 'in_progress') {
        items.push({ time: r.requestedAt, text: `SOS dispatched — ${name} (${type})`, color: 'var(--crimson-light)' });
      } else if (r.status === 'cancelled') {
        items.push({ time: r.requestedAt, text: `Request cancelled — ${name}`, color: 'var(--text-3)' });
      } else {
        items.push({ time: r.requestedAt, text: `New SOS: ${name} — ${type}`, color: 'var(--amber-light)' });
      }
    });

    recentUsers.forEach(u => {
      items.push({ time: u.createdAt, text: `New citizen registered — ${u.name}`, color: 'var(--primary-light)' });
    });

    // Sort by recency, take top `limit`
    items.sort((a, b) => b.time.getTime() - a.time.getTime());
    return items.slice(0, limit).map(item => ({
      text:  item.text,
      color: item.color,
      time:  formatTimeAgo(item.time),
    }));
  },

  /** Ambulance utilisation */
  async ambulanceUtilisation() {
    return prisma.ambulance.findMany({
      select: { id: true, plateNumber: true, status: true, _count: { select: { requests: true } } },
    });
  },

  /** Recent requests for export */
  async recentRequests(limit = 100) {
    return prisma.emergencyRequest.findMany({
      take:    limit,
      orderBy: { requestedAt: 'desc' },
      include: {
        citizen:   { select: { name: true, phone: true } },
        ambulance: { select: { plateNumber: true } },
        hospital:  { select: { name: true } },
      },
    });
  },
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60)   return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
