import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

export const getEscenarios = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await pool.query('SELECT * FROM escenarios ORDER BY nombre');
        res.json(rows);
    } catch (err) { next(err); }
};

export const createEscenario = async (req: Request, res: Response, next: NextFunction) => {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre es requerido' });
    try {
        await pool.query('INSERT INTO escenarios (nombre) VALUES (?)', [nombre]);
        res.json({ success: true });
    } catch (err) { next(err); }
};

export const updateEscenario = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre es requerido' });
    try {
        await pool.query('UPDATE escenarios SET nombre = ? WHERE id = ?', [nombre, id]);
        res.json({ success: true });
    } catch (err) { next(err); }
};

export const deleteEscenario = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        // En un caso real, deberíamos verificar si hay reservas o gestores asociados
        await pool.query('DELETE FROM escenarios WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) { next(err); }
};
