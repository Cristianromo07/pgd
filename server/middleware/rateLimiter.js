const rateLimit = require('express-rate-limit');

// Limiter para endpoints de autenticación (Login/Register)
// 15 minutos, máximo 5 intentos por IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Demasiados intentos de inicio de sesión, por favor intente nuevamente después de 15 minutos' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiter general para API (opcional, más relajado)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

module.exports = { authLimiter, apiLimiter };
