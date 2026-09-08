import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

// Devuelve { id, nombre } del escenario maestro. Si no existe (por ejemplo un
// nombre nuevo llegado por importación Excel), lo crea para cumplir la FK.
async function resolveEscenario(conn: any, nombre: string, idHint?: any) {
    if (idHint) {
        const [rows]: any = await conn.query('SELECT id, nombre FROM escenarios WHERE id = ?', [idHint]);
        if (rows.length > 0) return rows[0];
    }
    if (nombre) {
        const [rows]: any = await conn.query('SELECT id, nombre FROM escenarios WHERE nombre = ?', [nombre]);
        if (rows.length > 0) return rows[0];
        const [res]: any = await conn.query(
            'INSERT INTO escenarios (nombre, tipo) VALUES (?, ?)',
            [nombre, 'cancha']
        );
        // Crear su espacio por defecto para que sea reservable
        await conn.query(
            'INSERT IGNORE INTO espacios (escenario_id, nombre) VALUES (?, ?)',
            [res.insertId, 'PRINCIPAL']
        );
        return { id: res.insertId, nombre };
    }
    return null;
}

export const getHorarios = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await pool.query('SELECT * FROM personal_horarios ORDER BY escenario, gestor_nombre');
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

export const saveHorarios = async (req: Request, res: Response, next: NextFunction) => {
    const { entries } = req.body;
    if (!entries || !Array.isArray(entries)) {
        return res.status(400).json({ error: 'Formato de datos inválido' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        for (const entry of entries) {
            const esc = await resolveEscenario(connection, entry.escenario, entry.escenario_id);
            if (!esc) {
                await connection.rollback();
                return res.status(400).json({ error: 'Cada gestor debe tener un escenario asociado' });
            }

            await connection.query(`
                    INSERT INTO personal_horarios
                    (escenario, escenario_id, fecha_inicio, gestor_nombre, contacto, lunes, martes, miercoles, jueves, viernes, sabado, domingo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    escenario = VALUES(escenario),
                    escenario_id = VALUES(escenario_id),
                    contacto = VALUES(contacto),
                    lunes = VALUES(lunes),
                    martes = VALUES(martes),
                    miercoles = VALUES(miercoles),
                    jueves = VALUES(jueves),
                    viernes = VALUES(viernes),
                    sabado = VALUES(sabado),
                    domingo = VALUES(domingo)
                `, [
                esc.nombre,
                esc.id,
                entry.fecha_inicio || '2000-01-01',
                entry.gestor_nombre,
                entry.contacto || '',
                entry.turnos[0] || '',
                entry.turnos[1] || '',
                entry.turnos[2] || '',
                entry.turnos[3] || '',
                entry.turnos[4] || '',
                entry.turnos[5] || '',
                entry.turnos[6] || ''
            ]);
        }

        await connection.commit();
        res.json({ success: true, message: 'Horarios guardados correctamente' });
    } catch (err) {
        await connection.rollback();
        next(err);
    } finally {
        connection.release();
    }
};

export const deleteHorario = async (req: Request, res: Response, next: NextFunction) => {
    const { escenario, nombre } = req.params;
    try {
        // Usa escenario_id cuando sea posible; el nombre queda como respaldo.
        const [esc]: any = await pool.query('SELECT id FROM escenarios WHERE nombre = ?', [escenario]);
        if (esc.length > 0) {
            await pool.query('DELETE FROM personal_horarios WHERE escenario_id = ? AND gestor_nombre = ?', [esc[0].id, nombre]);
        } else {
            await pool.query('DELETE FROM personal_horarios WHERE escenario = ? AND gestor_nombre = ?', [escenario, nombre]);
        }
        res.json({ success: true, message: 'Gestor eliminado del escenario' });
    } catch (err) {
        next(err);
    }
};
