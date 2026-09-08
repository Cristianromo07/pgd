import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

export const getNovedades = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await pool.query('SELECT * FROM novedades ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) { next(err); }
};

export const createNovedad = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { escenario_id, escenario_nombre, tipo, descripcion } = req.body;
        const archivo_url = req.file ? `/uploads/${req.file.filename}` : null;

        // Resolver FK a escenarios por nombre si solo vino el texto ([DEPRECATED])
        let escenarioFk = escenario_id || null;
        if (!escenarioFk && escenario_nombre) {
            const [rows]: any = await pool.query('SELECT id FROM escenarios WHERE nombre = ?', [escenario_nombre]);
            escenarioFk = rows.length > 0 ? rows[0].id : null;
        }

        await pool.query(
            'INSERT INTO novedades (escenario_id, escenario_nombre, tipo, descripcion, archivo_url, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
            [escenarioFk, escenario_nombre, tipo, descripcion, archivo_url, req.session.userId || null]
        );
        res.json({ success: true });
    } catch (err) { next(err); }
};
