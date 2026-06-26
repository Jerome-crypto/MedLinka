"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reports_controller_1 = require("./reports.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'hospital_admin'));
router.get('/stats', reports_controller_1.ReportsController.stats);
router.get('/response-time', reports_controller_1.ReportsController.responseTime);
router.get('/requests-per-day', reports_controller_1.ReportsController.requestsPerDay);
router.get('/requests-per-week', reports_controller_1.ReportsController.requestsPerWeek);
router.get('/analytics', reports_controller_1.ReportsController.analytics);
router.get('/activity-feed', reports_controller_1.ReportsController.activityFeed);
router.get('/ambulance-utilisation', reports_controller_1.ReportsController.ambulanceUtilisation);
router.get('/recent-requests', reports_controller_1.ReportsController.recentRequests);
router.get('/export', reports_controller_1.ReportsController.exportCSV);
exports.default = router;
//# sourceMappingURL=reports.routes.js.map