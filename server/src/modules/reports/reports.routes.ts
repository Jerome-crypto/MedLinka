import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate, authorize('admin', 'hospital_admin'));

router.get('/stats',                 ReportsController.stats);
router.get('/response-time',         ReportsController.responseTime);
router.get('/requests-per-day',      ReportsController.requestsPerDay);
router.get('/requests-per-week',     ReportsController.requestsPerWeek);
router.get('/analytics',             ReportsController.analytics);
router.get('/activity-feed',         ReportsController.activityFeed);
router.get('/ambulance-utilisation', ReportsController.ambulanceUtilisation);
router.get('/recent-requests',       ReportsController.recentRequests);
router.get('/export',                ReportsController.exportCSV);

export default router;
