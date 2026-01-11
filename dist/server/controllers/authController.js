"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.register = exports.forgotPassword = exports.checkSession = exports.logout = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../config/db");
const login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }
    try {
        console.log(`[LOGIN] Intento de inicio de sesión para: ${email}`);
        const [rows] = await db_1.pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            console.warn(`[LOGIN] Usuario no encontrado: ${email}`);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const user = rows[0];
        const match = await bcrypt_1.default.compare(password, user.password);
        if (!match) {
            console.warn(`[LOGIN] Contraseña incorrecta para: ${email}`);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        // Configurar la sesión
        req.session.userId = user.id;
        req.session.role = user.role;
        req.session.email = user.email;
        console.log(`[LOGIN] Éxito: ${email} (ID: ${user.id}, ROL: ${user.role})`);
        // Devolvemos el usuario directamente para que el front lo asigne
        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (err) {
        console.error(`[LOGIN] Error crítico:`, err);
        next(err);
    }
};
exports.login = login;
const logout = (req, res) => {
    const email = req.session.email;
    req.session.destroy((err) => {
        if (err) {
            console.error(`[LOGOUT] Error cerrando sesión para ${email}:`, err);
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        console.log(`[LOGOUT] Sesión cerrada para: ${email}`);
        res.clearCookie('connect.sid'); // Limpiar la cookie explícitamente
        res.json({ success: true, message: 'Sesión cerrada' });
    });
};
exports.logout = logout;
const checkSession = (req, res) => {
    if (req.session && req.session.userId) {
        res.json({
            loggedIn: true,
            user: {
                id: req.session.userId,
                email: req.session.email,
                role: req.session.role
            }
        });
    }
    else {
        res.status(200).json({ loggedIn: false }); // No error 401 para evitar ruido en consola del front
    }
};
exports.checkSession = checkSession;
const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const token = crypto_1.default.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hora
        const [result] = await db_1.pool.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?', [token, expires, email]);
        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Correo no registrado' });
        console.log(`[SIMULACIÓN] Enviando correo de recuperación a ${email}: /reset-password/${token}`);
        res.json({ success: true, message: 'Se han enviado instrucciones a su correo' });
    }
    catch (err) {
        next(err);
    }
};
exports.forgotPassword = forgotPassword;
const register = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const [exists] = await db_1.pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (exists.length > 0)
            return res.status(400).json({ error: 'El correo ya está registrado' });
        const hashed = await bcrypt_1.default.hash(password, 10);
        await db_1.pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashed]);
        res.json({ success: true, message: 'Usuario registrado correctamente' });
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
const resetPassword = async (req, res, next) => {
    const { token, newPassword } = req.body;
    try {
        const [rows] = await db_1.pool.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?', [token, new Date()]);
        if (rows.length === 0)
            return res.status(400).json({ error: 'Token inválido o expirado' });
        const hashed = await bcrypt_1.default.hash(newPassword, 10);
        await db_1.pool.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hashed, rows[0].id]);
        res.json({ success: true, message: 'Contraseña actualizada' });
    }
    catch (err) {
        next(err);
    }
};
exports.resetPassword = resetPassword;
