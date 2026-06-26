"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const reports_service_1 = require("./reports.service");
const response_1 = require("../../utils/response");
exports.ReportsController = {
    async stats(_req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await reports_service_1.ReportsService.stats());
        }
        catch (err) {
            next(err);
        }
    },
    async responseTime(_req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await reports_service_1.ReportsService.avgResponseTime());
        }
        catch (err) {
            next(err);
        }
    },
    async requestsPerDay(_req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await reports_service_1.ReportsService.requestsPerDay());
        }
        catch (err) {
            next(err);
        }
    },
    async requestsPerWeek(_req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await reports_service_1.ReportsService.requestsThisWeek());
        }
        catch (err) {
            next(err);
        }
    },
    async analytics(_req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await reports_service_1.ReportsService.analytics());
        }
        catch (err) {
            next(err);
        }
    },
    async activityFeed(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 20;
            (0, response_1.sendSuccess)(res, await reports_service_1.ReportsService.activityFeed(limit));
        }
        catch (err) {
            next(err);
        }
    },
    async ambulanceUtilisation(_req, res, next) {
        try {
            (0, response_1.sendSuccess)(res, await reports_service_1.ReportsService.ambulanceUtilisation());
        }
        catch (err) {
            next(err);
        }
    },
    async recentRequests(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 100;
            (0, response_1.sendSuccess)(res, await reports_service_1.ReportsService.recentRequests(limit));
        }
        catch (err) {
            next(err);
        }
    },
    async exportCSV(_req, res, next) {
        try {
            const requests = await reports_service_1.ReportsService.recentRequests(1000);
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
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=reports.controller.js.map