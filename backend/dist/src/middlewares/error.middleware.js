"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const AppError_1 = require("../shared/errors/AppError");
function errorHandler(err, req, res, next) {
    if (err instanceof AppError_1.AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details ?? [],
            },
        });
        return;
    }
    console.error('[ERROR]', err);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor',
            details: [],
        },
    });
}
//# sourceMappingURL=error.middleware.js.map