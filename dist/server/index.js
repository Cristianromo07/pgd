"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/index.ts - Entry point for the refactored layered architecture in TypeScript
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const reservaRoutes_1 = __importDefault(require("./routes/reservaRoutes"));
const horarioRoutes_1 = __importDefault(require("./routes/horarioRoutes"));
const novedadRoutes_1 = __importDefault(require("./routes/novedadRoutes"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// --- SEGURIDAD Y LOGGING ---
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Desactivar CSP si causa conflictos con scripts inline o externos de React en dev
    crossOriginResourcePolicy: { policy: "cross-origin" } // Permitir carga de recursos cruzados (imágenes, etc.)
}));
app.use((0, morgan_1.default)('dev')); // 'dev' para logs coloridos en consola, 'combined' para producción
// --- CONFIGURACIÓN CORS ---
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static('public'));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'client/dist')));
// --- SESIONES ---
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Cambiar a true si usas HTTPS
}));
// --- RUTAS API ---
app.use('/api', authRoutes_1.default);
app.use('/api', reservaRoutes_1.default);
app.use('/api', horarioRoutes_1.default);
app.use('/api', novedadRoutes_1.default);
// --- SPA FALLBACK ---
app.get(/.*/, (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '..', 'client/dist', 'index.html'));
});
// --- MANEJADOR DE ERRORES (Debe ir después de las rutas) ---
app.use(errorHandler_1.default);
// --- INICIALIZACIÓN ---
// Solo iniciamos el servidor si NO estamos en modo de prueba (test)
if (process.env.NODE_ENV !== 'test') {
    (0, db_1.initDb)()
        .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
        });
    })
        .catch(err => {
        console.error('No se pudo inicializar la base de datos, saliendo.');
        process.exit(1);
    });
}
exports.default = app;
