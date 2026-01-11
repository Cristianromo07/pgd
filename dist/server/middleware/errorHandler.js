"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('❌ SERVER ERROR:', err.message);
    if (err.stack)
        console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        status: err.status || 500
    });
};
exports.errorHandler = errorHandler;
exports.default = exports.errorHandler;
