"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Detectar si estamos en Producción o Desarrollo
// Si NODE_ENV no está definido, asumimos desarrollo.
const isDev = process.env.NODE_ENV !== 'production';
// Configuración adaptativa
const authConfigs = {
    // Desarrollo: 60 intentos en 1 minuto
    // Producción: 5 intentos en 15 minutos
    windowMs: isDev ? 1 * 60 * 1000 : 15 * 60 * 1000,
    max: isDev ? 60 : 5
};
console.log(` Rate Limiter configurado en modo: ${isDev ? 'DESARROLLO (Relajado)' : 'PRODUCCIÓN (Estricto)'}`);
// Limiter para endpoints de autenticación (Login/Register)
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: authConfigs.windowMs,
    max: authConfigs.max,
    message: {
        error: 'Demasiados intentos de inicio de sesión.',
        info: isDev ? 'Modo Dev: Bloqueo de 1 min.' : 'Intente nuevamente en 15 min.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Limiter general para API
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 1000 : 100, // API más permisiva en desarrollo
    message: { error: 'Límite de peticiones API excedido' }
});
