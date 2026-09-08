import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

type AnyRow = { [key: string]: any };

export const getEscenarios = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await pool.query('SELECT * FROM escenarios WHERE activo = 1 ORDER BY nombre');
        res.json(rows);
    } catch (err) { next(err); }
};

export const createEscenario = async (req: Request, res: Response, next: NextFunction) => {
    const { nombre, tipo, capacidad_maxima, hora_apertura, hora_cierre, direccion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre es requerido' });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [result]: any = await conn.query(
            `INSERT INTO escenarios (nombre, tipo, capacidad_maxima, hora_apertura, hora_cierre, direccion)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre, tipo || 'cancha', capacidad_maxima || 0, hora_apertura || null, hora_cierre || null, direccion || null]
        );

        // Todo escenario nuevo debe tener al menos un espacio reservable.
        await conn.query(
            'INSERT INTO espacios (escenario_id, nombre) VALUES (?, ?)',
            [result.insertId, 'PRINCIPAL']
        );

        await conn.commit();
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        await conn.rollback();
        next(err);
    } finally {
        conn.release();
    }
};

export const updateEscenario = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { nombre, tipo, capacidad_maxima, hora_apertura, hora_cierre, direccion } = req.body;

    if (!nombre && !tipo && !capacidad_maxima && !hora_apertura && !hora_cierre && !direccion) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [esc]: any = await conn.query('SELECT * FROM escenarios WHERE id = ?', [id]);
        if (esc.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Escenario no encontrado' });
        }

        await conn.query(
            `UPDATE escenarios SET
                nombre = COALESCE(?, nombre),
                tipo = COALESCE(?, tipo),
                capacidad_maxima = COALESCE(?, capacidad_maxima),
                hora_apertura = COALESCE(?, hora_apertura),
                hora_cierre = COALESCE(?, hora_cierre),
                direccion = COALESCE(?, direccion)
             WHERE id = ?`,
            [nombre, tipo, capacidad_maxima, hora_apertura, hora_cierre, direccion, id]
        );

        // Sincronizar nombres desnormalizados ([DEPRECATED] en v1, a eliminar luego).
        if (nombre && nombre !== esc[0].nombre) {
            await conn.query('UPDATE personal_horarios SET escenario = ? WHERE escenario_id = ?', [nombre, id]);
            await conn.query('UPDATE novedades SET escenario_nombre = ? WHERE escenario_id = ?', [nombre, id]);
        }

        await conn.commit();
        res.json({ success: true });
    } catch (err) {
        await conn.rollback();
        next(err);
    } finally {
        conn.release();
    }
};

export const deleteEscenario = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM escenarios WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err: any) {
        // ER_ROW_IS_REFERENCED_2 / ER_ROW_IS_REFERENCED: FK en uso
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
            return res.status(409).json({
                error: 'No se puede eliminar: el escenario tiene reservas, horarios o novedades asociadas.'
            });
        }
        next(err);
    }
};

// ---------------------------------------------------------------------------
// ESPACIOS (canchas / sub-espacios reservables)
// ---------------------------------------------------------------------------

export const getEspacios = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { escenario_id } = req.query;
        let query = 'SELECT * FROM espacios WHERE activo = 1';
        const params: any[] = [];
        if (escenario_id) { query += ' AND escenario_id = ?'; params.push(escenario_id); }
        query += ' ORDER BY nombre';
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) { next(err); }
};

export const createEspacio = async (req: Request, res: Response, next: NextFunction) => {
    const { escenario_id, nombre, tipo, capacidad_maxima, hora_apertura, hora_cierre } = req.body;
    if (!escenario_id || !nombre) {
        return res.status(400).json({ error: 'escenario_id y nombre son requeridos' });
    }
    try {
        const [result]: any = await pool.query(
            `INSERT INTO espacios (escenario_id, nombre, tipo, capacidad_maxima, hora_apertura, hora_cierre)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [escenario_id, nombre, tipo || null, capacidad_maxima || null, hora_apertura || null, hora_cierre || null]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) { next(err); }
};

export const updateEspacio = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { nombre, tipo, capacidad_maxima, hora_apertura, hora_cierre, activo } = req.body;
    try {
        await pool.query(
            `UPDATE espacios SET
                nombre = COALESCE(?, nombre),
                tipo = COALESCE(?, tipo),
                capacidad_maxima = COALESCE(?, capacidad_maxima),
                hora_apertura = COALESCE(?, hora_apertura),
                hora_cierre = COALESCE(?, hora_cierre),
                activo = COALESCE(?, activo)
             WHERE id = ?`,
            [nombre, tipo, capacidad_maxima, hora_apertura, hora_cierre, activo, id]
        );
        res.json({ success: true });
    } catch (err) { next(err); }
};

export const deleteEspacio = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM espacios WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err: any) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
            return res.status(409).json({ error: 'No se puede eliminar: el espacio tiene reservas asociadas.' });
        }
        next(err);
    }
};
