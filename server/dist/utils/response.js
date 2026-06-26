"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNoContent = exports.sendCreated = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({ success: true, message, data });
};
exports.sendSuccess = sendSuccess;
const sendCreated = (res, data, message = 'Created') => {
    (0, exports.sendSuccess)(res, data, message, 201);
};
exports.sendCreated = sendCreated;
const sendNoContent = (res) => {
    res.status(204).send();
};
exports.sendNoContent = sendNoContent;
//# sourceMappingURL=response.js.map