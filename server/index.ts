// server/index.ts - Punto de entrada para la arquitectura en capas refactorizada en TypeScript
import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import path from 'path';
import session from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

import { initDb } from './config/db';
import authRoutes from './routes/authRoutes';
import reservaRoutes from './routes/reservaRoutes';
import horarioRoutes from './routes/horarioRoutes';
import novedadRoutes from './routes/novedadRoutes';
import errorHandler from './middleware/errorHandler';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// --- SEGURIDAD Y LOGGING ---
app.use(helmet({
  contentSecurityPolicy: false, // Desactivar CSP si causa conflictos con scripts inline o externos de React en dev
  crossOriginResourcePolicy: { policy: "cross-origin" } // Permitir carga de recursos cruzados (imágenes, etc.)
}));
app.use(morgan('dev')); // 'dev' para logs coloridos en consola, 'combined' para producción

// --- CONFIGURACIÓN CORS ---
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'client/dist')));

// --- SESIONES ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Cambiar a true si usas HTTPS
}));

// --- RUTAS API ---
app.use('/api', authRoutes);
app.use('/api', reservaRoutes);
app.use('/api', horarioRoutes);
app.use('/api', novedadRoutes);

// --- SPA FALLBACK ---
app.get(/.*/, (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '..', 'client/dist', 'index.html'));
});

// --- MANEJADOR DE ERRORES (Debe ir después de las rutas) ---
app.use(errorHandler);

// --- INICIALIZACIÓN ---
// Solo iniciamos el servidor si NO estamos en modo de prueba (test)
if (process.env.NODE_ENV !== 'test') {
  initDb()
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

export default app;
