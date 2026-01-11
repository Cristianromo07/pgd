"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNovedad = exports.getNovedades = void 0;
const db_1 = require("../config/db");
const getNovedades = async (req, res, next) => {
    try {
        const [rows] = await db_1.pool.query('SELECT * FROM novedades ORDER BY created_at DESC');
        res.json(rows);
    }
    catch (err) {
        next(err);
    }
};
exports.getNovedades = getNovedades;
const createNovedad = async (req, res, next) => {
    const { escenario_id, escenario_nombre, tipo, descripcion } = req.body;
    const usuario_id = req.session.userId;
    const archivo_url = req.file ? `/uploads/${req.file.filename}` : null;
    try {
        await db_1.pool.query('INSERT INTO novedades (escenario_id, escenario_nombre, tipo, descripcion, archivo_url, usuario_id) VALUES (?, ?, ?, ?, ?, ?)', [escenario_id || null, escenario_nombre, tipo, descripcion, archivo_url, usuario_id || null]);
        res.json({ success: true, message: 'Novedad registrada' });
    }
    catch (err) {
        next(err);
    }
};
exports.createNovedad = createNovedad;
