// server/index.js - improved server bootstrap with DB checks
const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURACIÓN CORS ---
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '..', 'client/dist')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// --- POOL DE MYSQL (config desde env con valores por defecto) ---
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'login_user',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'login_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONN_LIMIT) || 10,
  queueLimit: 0
};

let pool;
async function initDb() {
  try {
    pool = mysql.createPool(dbConfig);
    const conn = await pool.getConnection();
    await conn.ping();

    // Migración: Asegurar que existan las columnas de reset_token
    const [columns] = await conn.query('SHOW COLUMNS FROM users');
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('reset_token')) {
      await conn.query('ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL');
      console.log('Columna reset_token añadida a users');
    }
    if (!columnNames.includes('reset_token_expires')) {
      await conn.query('ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL');
      console.log('Columna reset_token_expires añadida a users');
    }

    // Migración para reservas: nombre, telefono, descripcion
    const [reservaCols] = await conn.query('SHOW COLUMNS FROM reservas');
    const reservaColNames = reservaCols.map(c => c.Field);

    if (!reservaColNames.includes('nombre_solicitante')) {
      await conn.query('ALTER TABLE reservas ADD COLUMN nombre_solicitante VARCHAR(255) NULL');
      console.log('Columna nombre_solicitante añadida a reservas');
    }
    if (!reservaColNames.includes('telefono_solicitante')) {
      await conn.query('ALTER TABLE reservas ADD COLUMN telefono_solicitante VARCHAR(255) NULL');
      console.log('Columna telefono_solicitante añadida a reservas');
    }
    if (!reservaColNames.includes('descripcion_actividad')) {
      await conn.query('ALTER TABLE reservas ADD COLUMN descripcion_actividad TEXT NULL');
      console.log('Columna descripcion_actividad añadida a reservas');
    }

    conn.release();
    console.log('Conectado a la base de datos');
  } catch (e) {
    console.error('Error conectando a la base de datos:', e.message);
    console.error('Verifica las variables de entorno DB_HOST/DB_USER/DB_PASSWORD/DB_NAME o que MySQL esté levantado');
    process.exit(1);
  }
}

// Middleware de autenticación (usado solo en rutas que lo requieran)
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.loggedIn) return next();
  res.status(401).json({ error: 'No autenticado' });
};

const hasRole = (roles) => (req, res, next) => {
  if (req.session.role && roles.includes(req.session.role)) return next();
  res.status(403).json({ error: 'Acceso denegado' });
};

// --- RUTAS API ---
app.get('/api/reservas', async (req, res) => {
  const { escenario_id } = req.query;
  try {
    let query = `
      SELECT r.*, u.email as usuario_email, e.nombre as escenario_nombre 
      FROM reservas r
      JOIN users u ON r.usuario_id = u.id
      JOIN escenarios e ON r.escenario_id = e.id
    `;
    const params = [];
    if (escenario_id) {
      query += ' WHERE r.escenario_id = ?';
      params.push(escenario_id);
    }
    query += ' ORDER BY r.fecha ASC, r.hora_inicio ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// Función auxiliar para fechas recurrentes (copiada del bootstrap anterior)
function generateDates(data) {
  const dates = [];
  const start = new Date(data.fecha + 'T00:00:00');

  if (!data.repite || data.repite === 'nunca') return [data.fecha];

  let current = new Date(start);
  const interval = parseInt(data.intervalo) || 1;
  const maxRep = data.fin_tipo === 'repeticiones' ? parseInt(data.fin_repeticiones) : 1000;
  const endDate = data.fin_tipo === 'fecha' && data.fin_fecha ? new Date(data.fin_fecha + 'T23:59:59') : null;

  if (data.repite === 'diario') {
    while (dates.length < maxRep && (!endDate || current <= endDate)) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + interval);
    }
  } else if (data.repite === 'semanal' || data.repite === 'custom') {
    let weekCounter = 0;
    const selectedDays = Array.isArray(data.dias_semana) ? data.dias_semana : [];
    if (selectedDays.length === 0) return [data.fecha];

    while (dates.length < maxRep && (!endDate || current <= endDate)) {
      if (weekCounter % interval === 0) {
        if (selectedDays.includes(current.getDay())) {
          dates.push(current.toISOString().split('T')[0]);
        }
      }
      const prevDay = current.getDay();
      current.setDate(current.getDate() + 1);
      if (prevDay === 0 && current.getDay() === 1) weekCounter++;
      if (current > new Date(start.getTime() + 730 * 24 * 60 * 60 * 1000)) break;
    }
  } else if (data.repite === 'mensual') {
    while (dates.length < maxRep && (!endDate || current <= endDate)) {
      dates.push(current.toISOString().split('T')[0]);
      current.setMonth(current.getMonth() + interval);
    }
  }
  return dates.length > 0 ? dates : [data.fecha];
}

// Crear reserva (requiere autenticación)
app.post('/api/reservas', isAuthenticated, async (req, res) => {
  const {
    escenario_id, fecha, hora_inicio, hora_fin, color,
    repite, intervalo, dias_semana, fin_tipo, fin_fecha, fin_repeticiones,
    nombre_solicitante, telefono_solicitante, descripcion_actividad
  } = req.body;
  const usuario_id = req.session.userId;

  if (!escenario_id || !fecha || !hora_inicio || !hora_fin || !color) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const dates = generateDates({ fecha, repite, intervalo, dias_semana, fin_tipo, fin_fecha, fin_repeticiones });

    for (const d of dates) {
      const [overlaps] = await connection.query(`
        SELECT * FROM reservas 
        WHERE escenario_id = ? 
        AND fecha = ? 
        AND (hora_inicio < ? AND hora_fin > ?)
      `, [escenario_id, d, hora_fin, hora_inicio]);

      if (overlaps.length > 0) {
        await connection.rollback();
        return res.status(409).json({ error: `Conflicto de horario en la fecha: ${d}` });
      }

      await connection.query(`
        INSERT INTO reservas (
          escenario_id, usuario_id, fecha, hora_inicio, hora_fin, color, 
          nombre_solicitante, telefono_solicitante, descripcion_actividad
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        escenario_id, usuario_id, d, hora_inicio, hora_fin, color,
        nombre_solicitante, telefono_solicitante, descripcion_actividad
      ]);
    }

    await connection.commit();
    res.json({ success: true, message: `Se crearon ${dates.length} reserva(s) exitosamente` });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
});

// Actualizar reserva
app.put('/api/reservas/:id', isAuthenticated, async (req, res) => {
  const reservaId = req.params.id;
  const {
    escenario_id, fecha, hora_inicio, hora_fin, color,
    nombre_solicitante, telefono_solicitante, descripcion_actividad
  } = req.body;
  const userId = req.session.userId;
  const userRole = req.session.role;

  try {
    const [rows] = await pool.query('SELECT * FROM reservas WHERE id = ?', [reservaId]);
    if (!rows.length) return res.status(404).json({ error: 'Reserva no encontrada' });

    const reserva = rows[0];
    if (userRole !== 'admin' && reserva.usuario_id !== userId) {
      return res.status(403).json({ error: 'No tienes permiso' });
    }

    const [overlaps] = await pool.query(`
      SELECT * FROM reservas 
      WHERE escenario_id = ? AND fecha = ? AND (hora_inicio < ? AND hora_fin > ?) AND id != ?
    `, [escenario_id, fecha, hora_fin, hora_inicio, reservaId]);

    if (overlaps.length > 0) return res.status(409).json({ error: 'Solapamiento con otra reserva' });

    await pool.query(`
      UPDATE reservas 
      SET escenario_id=?, fecha=?, hora_inicio=?, hora_fin=?, color=?, 
          nombre_solicitante=?, telefono_solicitante=?, descripcion_actividad=? 
      WHERE id=?
    `, [
      escenario_id, fecha, hora_inicio, hora_fin, color,
      nombre_solicitante, telefono_solicitante, descripcion_actividad,
      reservaId
    ]);

    res.json({ success: true, message: 'Reserva actualizada' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Eliminar reserva
app.delete('/api/reservas/:id', isAuthenticated, async (req, res) => {
  const reservaId = req.params.id;
  const userId = req.session.userId;
  const userRole = req.session.role;

  try {
    const [rows] = await pool.query('SELECT * FROM reservas WHERE id = ?', [reservaId]);
    if (!rows.length) return res.status(404).json({ error: 'Reserva no encontrada' });

    const reserva = rows[0];
    if (userRole !== 'admin' && reserva.usuario_id !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta reserva' });
    }

    await pool.query('DELETE FROM reservas WHERE id = ?', [reservaId]);
    res.json({ success: true, message: 'Reserva eliminada' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Escenarios: listar todos (público para facilitar visualización del calendario)
app.get('/api/escenarios', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM escenarios ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener escenarios', err);
    res.status(500).json({ error: 'Error al obtener escenarios' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son obligatorios' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Email o contraseña incorrectos' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Email o contraseña incorrectos' });

    req.session.loggedIn = true;
    req.session.userId = user.id;
    req.session.role = user.role;

    res.json({ success: true, user: { email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error de servidor' });
  }
});

// Registro
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son obligatorios' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) return res.status(400).json({ error: 'El usuario ya existe' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

    res.json({ success: true, message: 'Usuario registrado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error de servidor' });
  }
});

// Olvidé mi contraseña (Generar token)
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'El email es obligatorio' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      // Por seguridad, no revelamos si el email existe o no
      return res.json({ success: true, message: 'Si el correo existe, se enviará un enlace de recuperación' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
      [token, expires, email]
    );

    // Simular el envío del correo imprimiendo en consola
    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
    console.log('------------------------------------------');
    console.log(`LINK DE RECUPERACIÓN PARA ${email}:`);
    console.log(resetUrl);
    console.log('------------------------------------------');

    res.json({ success: true, message: 'Si el correo existe, se enviará un enlace de recuperación' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error de servidor' });
  }
});

// Restablecer contraseña (Usar token)
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?',
      [token, new Date()]
    );

    if (!rows.length) {
      return res.status(400).json({ error: 'El token es inválido o ha expirado' });
    }

    const user = rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error de servidor' });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Error al cerrar sesión' });
    res.json({ success: true });
  });
});

// Información del usuario actual
app.get('/api/user-info', (req, res) => {
  if (req.session.loggedIn) {
    res.json({ loggedIn: true, role: req.session.role, userId: req.session.userId });
  } else {
    res.json({ loggedIn: false });
  }
});

// SPA fallback
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client/dist', 'index.html'));
});

// Iniciar
initDb().then(() => {
  // seed admin user after DB is ready
  (async () => {
    try {
      const adminEmail = 'admin@test.com';
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
      const hashed = await bcrypt.hash(process.env.ADMIN_PWD || 'admin123', 10);
      if (rows.length === 0) {
        await pool.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [adminEmail, hashed, 'admin']);
        console.log('Default admin user created');
      } else {
        await pool.query('UPDATE users SET password = ?, role = ? WHERE email = ?', [hashed, 'admin', adminEmail]);
        console.log('Admin user password reset');
      }
    } catch (e) {
      console.error('Error creating/updating default admin user', e);
    }
  })();

  app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
}).catch(err => {
  console.error('No se pudo inicializar la base de datos, saliendo.');
  process.exit(1);
});
