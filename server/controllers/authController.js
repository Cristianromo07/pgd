const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { pool } = require('../config/db');

exports.login = async (req, res, next) => {
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
        next(err);
    }
};

exports.register = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son obligatorios' });

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) return res.status(400).json({ error: 'El usuario ya existe' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

        res.json({ success: true, message: 'Usuario registrado' });
    } catch (err) {
        next(err);
    }
};

exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'El email es obligatorio' });

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (!rows.length) {
            return res.json({ success: true, message: 'Si el correo existe, se enviará un enlace de recuperación' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hora

        await pool.query(
            'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
            [token, expires, email]
        );

        const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

        if (process.env.NODE_ENV !== 'production') {
            console.log('------------------------------------------');
            console.log(`LINK DE RECUPERACIÓN PARA ${email}:`);
            console.log(resetUrl);
            console.log('------------------------------------------');
        }

        res.json({ success: true, message: 'Si el correo existe, se enviará un enlace de recuperación' });
    } catch (err) {
        next(err);
    }
};

exports.resetPassword = async (req, res, next) => {
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
        next(err);
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Error al cerrar sesión' });
        res.json({ success: true });
    });
};

exports.getUserInfo = (req, res) => {
    if (req.session.loggedIn) {
        res.json({ loggedIn: true, role: req.session.role, userId: req.session.userId });
    } else {
        res.json({ loggedIn: false });
    }
};
