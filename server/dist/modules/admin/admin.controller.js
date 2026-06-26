"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const database_1 = require("../../config/database");
const response_1 = require("../../utils/response");
exports.AdminController = {
    async listUsers(req, res, next) {
        try {
            const users = await database_1.prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            (0, response_1.sendSuccess)(res, { users });
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=admin.controller.js.map