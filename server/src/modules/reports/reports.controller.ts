import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { ReportsService } from './reports.service';
import { sendSuccess } from '../../utils/response';

export const ReportsController = {
  async stats(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await ReportsService.stats()); }
    catch (err) { next(err); }
  },

  async responseTime(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await ReportsService.avgResponseTime()); }
    catch (err) { next(err); }
  },

  async requestsPerDay(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await ReportsService.requestsPerDay()); }
    catch (err) { next(err); }
  },

  async requestsPerWeek(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await ReportsService.requestsThisWeek()); }
    catch (err) { next(err); }
  },

  async analytics(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await ReportsService.analytics()); }
    catch (err) { next(err); }
  },

  async activityFeed(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      sendSuccess(res, await ReportsService.activityFeed(limit));
    }
    catch (err) { next(err); }
  },

  async ambulanceUtilisation(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await ReportsService.ambulanceUtilisation()); }
    catch (err) { next(err); }
  },

  async recentRequests(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      sendSuccess(res, await ReportsService.recentRequests(limit));
    }
    catch (err) { next(err); }
  },

  async exportCSV(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const requests = await ReportsService.recentRequests(1000);
      const headers = ['ID', 'Status', 'Citizen Name', 'Citizen Phone', 'Ambulance', 'Hospital', 'Requested At', 'Dispatched At', 'Completed At'];
      const rows = requests.map(r => [
        r.id, r.status,
        `"${r.citizen?.name || ''}"`, `"${r.citizen?.phone || ''}"`,
        `"${r.ambulance?.plateNumber || ''}"`, `"${r.hospital?.name || ''}"`,
        r.requestedAt?.toISOString() ?? '',
        r.dispatchedAt?.toISOString() ?? '',
        r.completedAt?.toISOString() ?? '',
      ]);
      const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=medlinka-requests.csv');
      res.status(200).send(csv);
    }
    catch (err) { next(err); }
  },
};
