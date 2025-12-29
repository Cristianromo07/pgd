// server.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const app = express();

// Middleware para leer formularios
app.use(express.urlencoded({ extended: true }));

// Middleware para servir archivos estáticos (CSS, JS)
app.use(express.static('public'));

// Configuración de sesiones
app.use(session({
  secret: 'mi-secreto', // cambia esto por algo más seguro
  resave: false,
  saveUninitialized: true
}));

// Configuración de conexión MySQL
const dbConfig = {
  host: 'localhost',
  user: 'login_user',   // usuario nuevo
  password: '1234',     // contraseña que definiste
  database: 'login_db'
};


// Ruta principal: login
app.get('/', (req, res) => {
  if (req.session.loggedIn) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Ruta de login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email y contraseña son obligatorios');
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    await connection.end();

    if (rows.length === 0) {
      return res.status(401).send('Email o contraseña incorrectos ❌');
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      req.session.loggedIn = true;
      req.session.userId = user.id;
      return res.redirect('/dashboard');
    } else {
      return res.status(401).send('Email o contraseña incorrectos ❌');
    }

  } catch (err) {
    console.error(err);
    return res.status(500).send('Error de servidor');
  }
});

// Ruta de registro
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email y contraseña son obligatorios');
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Verificar si el usuario ya existe
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      await connection.end();
      return res.status(400).send('El usuario ya existe ❌');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    await connection.execute('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
    await connection.end();

    res.send('Usuario registrado ✅. <a href="/">Inicia sesión</a>');

  } catch (err) {
    console.error(err);
    res.status(500).send('Error de servidor');
  }
});


// Dashboard protegido
app.get('/dashboard', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
  } else {
    res.redirect('/');
  }
});

// Rutas adicionales protegidas
app.get('/activities', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, 'activities.html'));
  } else {
    res.redirect('/');
  }
});

app.get('/scenarios', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, 'scenarios.html'));
  } else {
    res.redirect('/');
  }
});

app.get('/profile', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, 'profile.html'));
  } else {
    res.redirect('/');
  }
});

app.get('/novedades', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, 'novedades.html'));
  } else {
    res.redirect('/');
  }
});

app.get('/schedule', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, 'schedule.html'));
  } else {
    res.redirect('/');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send('Error al cerrar sesión');
    res.redirect('/');
  });
});

// Iniciar servidor
app.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});
