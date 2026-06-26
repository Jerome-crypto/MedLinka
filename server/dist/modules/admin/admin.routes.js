"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Apply auth middleware - Admin ONLY
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin'));
// GET /api/admin/users
router.get('/users', admin_controller_1.AdminController.listUsers);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map