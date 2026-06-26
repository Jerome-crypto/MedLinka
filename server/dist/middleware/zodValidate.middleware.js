"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodValidate = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../utils/AppError");
/**
 * Zod request body validator — use instead of express-validator where schemas are complex.
 * Usage: router.post('/', zodValidate(MySchema), controller)
 */
const zodValidate = (schema) => (req, _res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
            next(new AppError_1.AppError(messages, 422));
        }
        else {
            next(err);
        }
    }
};
exports.zodValidate = zodValidate;
//# sourceMappingURL=zodValidate.middleware.js.map