import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

type AnyRow = { [key: string]: any };
type Conn = any; // mysql2 connection or pool

const ESTADOS_ACTIVOS = ['PENDIENTE', 'CONFIRMADA'];
const ESTADOS_VALIDOS = ['PENDIENTE', 'CONFIRMADA', 'RECHAZADA', 'CANCELADA', 'FINALIZADA'];

// Resuelve el espacio reservable. Si llega escenario_id (compat v1/frontend)
// toma su espacio por defecto ('PRINCIPAL'); si no hay espacios responde null.
async function resolveEspacio(conn: Conn, escenario_id: any, espacio_id?: any): Promise<AnyRow | null> {
    if (espacio_id) {
        const [rows]: any = await conn.query(
            'SELECT * FROM espacios WHERE id = ? AND activo = 1',
            [espacio_id]
        );
        return rows[0] || null;
    }
    if (escenario_id) {
        const [rows]: any = await conn.query(
            `SELECT * FROM espacios
             WHERE escenario_id = ? AND activo = 1
             ORDER BY (nombre = 'PRINCIPAL') DESC, id ASC LIMIT 1`,
            [escenario_id]
        );
        return rows[0] || null;
    }
    return null;
}

function haySolapamientoSQL(): string {
    return `SELECT id FROM reservas
            WHERE espacio_id = ?
              AND fecha = ?
              AND estado IN (?)
              AND hora_inicio < ?
              AND hora_fin > ?`;
}

export const getReservas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { escenario_id, espacio_id } = req.query;
        let query = `SELECT r.*, u.email as usuario_email, e.nombre as escenario_nombre, es.nombre as espacio_nombre
                     FROM reservas r
                     JOIN users u ON r.usuario_id = u.id
                     JOIN escenarios e ON r.escenario_id = e.id
                     JOIN espacios es ON r.espacio_id = es.id`;
        const params: any[] = [];
        const conditions: string[] = [];

        if (escenario_id) { conditions.push('r.escenario_id = ?'); params.push(escenario_id); }
        if (espacio_id) { conditions.push('r.espacio_id = ?'); params.push(espacio_id); }
        if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');

        query += ' ORDER BY r.fecha ASC, r.hora_inicio ASC';
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) { next(err); }
};

export const createReserva = async (req: Request, res: Response, next: NextFunction) => {
    const { escenario_id, espacio_id, fecha, hora_inicio, hora_fin, color, nombre_solicitante, telefono_solicitante, descripcion_actividad } = req.body;
    const usuario_id = req.session.userId;

    if (!fecha || !hora_inicio || !hora_fin) {
        return res.status(400).json({ error: 'fecha, hora_inicio y hora_fin son requeridos' });
    }
    if (hora_fin <= hora_inicio) {
        return res.status(400).json({ error: 'La hora de fin debe ser mayor a la de inicio' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const espacio = await resolveEspacio(conn, escenario_id, espacio_id);
        if (!espacio) {
            await conn.rollback();
            return res.status(400).json({ error: 'El escenario no tiene espacios reservables o el espacio no existe.' });
        }

        // Bloqueo el espacio para serializar reservas concurrentes (anti doble-clic).
        await conn.query('SELECT id FROM espacios WHERE id = ? FOR UPDATE', [espacio.id]);

        const [overlaps]: any = await conn.query(haySolapamientoSQL(), [
            espacio.id, fecha, ESTADOS_ACTIVOS, hora_fin, hora_inicio
        ]);
        if (overlaps.length > 0) {
            await conn.rollback();
            return res.status(409).json({ error: 'Conflicto de horario: ya existe una reserva en ese bloque.' });
        }

        const estado = ESTADOS_VALIDOS.includes(req.body.estado)
            ? req.body.estado
            : (req.session.role === 'admin' ? 'CONFIRMADA' : 'PENDIENTE');

        await conn.query(
            `INSERT INTO reservas (espacio_id, escenario_id, usuario_id, fecha, hora_inicio, hora_fin, estado, color, nombre_solicitante, telefono_solicitante, descripcion_actividad)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [espacio.id, espacio.escenario_id, usuario_id, fecha, hora_inicio, hora_fin, estado,
             color || '#3b82f6', nombre_solicitante || '', telefono_solicitante || null, descripcion_actividad || null]
        );

        await conn.commit();
        res.json({ success: true, message: estado === 'PENDIENTE' ? 'Reserva creada y pendiente de aprobación' : 'Reserva creada con éxito' });
    } catch (err) {
        await conn.rollback();
        next(err);
    } finally {
        conn.release();
    }
};

export const updateReserva = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { escenario_id, espacio_id, fecha, hora_inicio, hora_fin, color, nombre_solicitante, telefono_solicitante, descripcion_actividad } = req.body;

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [existing]: any = await conn.query('SELECT * FROM reservas WHERE id = ? FOR UPDATE', [id]);
        if (existing.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        // Espacio destino (por defecto el de la reserva actual o el escenario indicado)
        const escenarioFinal = escenario_id || existing[0].escenario_id;
        const espacio = await resolveEspacio(conn, escenarioFinal, espacio_id || existing[0].espacio_id);
        if (!espacio) {
            await conn.rollback();
            return res.status(400).json({ error: 'El escenario no tiene espacios reservables o el espacio no existe.' });
        }

        const fechaFinal = fecha || existing[0].fecha;
        const iniFinal = hora_inicio || existing[0].hora_inicio;
        const finFinal = hora_fin || existing[0].hora_fin;

        if (finFinal <= iniFinal) {
            await conn.rollback();
            return res.status(400).json({ error: 'La hora de fin debe ser mayor a la de inicio' });
        }

        const [overlaps]: any = await conn.query(haySolapamientoSQL() + ' AND id != ?', [
            espacio.id, fechaFinal, ESTADOS_ACTIVOS, finFinal, iniFinal, id
        ]);
        if (overlaps.length > 0) {
            await conn.rollback();
            return res.status(409).json({ error: 'Conflicto de horario: ya existe otra reserva en ese bloque.' });
        }

        await conn.query(
            `UPDATE reservas SET
                espacio_id = ?, escenario_id = ?, fecha = ?, hora_inicio = ?, hora_fin = ?,
                color = ?, nombre_solicitante = ?, telefono_solicitante = ?, descripcion_actividad = ?
             WHERE id = ?`,
            [espacio.id, espacio.escenario_id, fechaFinal, iniFinal, finFinal,
             color || existing[0].color, nombre_solicitante !== undefined ? nombre_solicitante : existing[0].nombre_solicitante,
             telefono_solicitante !== undefined ? telefono_solicitante : existing[0].telefono_solicitante,
             descripcion_actividad !== undefined ? descripcion_actividad : existing[0].descripcion_actividad, id]
        );

        await conn.commit();
        res.json({ success: true, message: 'Reserva actualizada' });
    } catch (err) {
        await conn.rollback();
        next(err);
    } finally {
        conn.release();
    }
};

export const deleteReserva = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await pool.query('DELETE FROM reservas WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { next(err); }
};

// Cambio de estado (aprobación/rechazo/cancelación). Ruta protegida con isAdmin.
export const setReservaEstado = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({ error: `Estado inválido. Valores: ${ESTADOS_VALIDOS.join(', ')}` });
    }

    try {
        const [result]: any = await pool.query(
            `UPDATE reservas SET
                estado = ?,
                aprobado_por = ?,
                fecha_aprobacion = IF(? IN ('CONFIRMADA','RECHAZADA'), NOW(), fecha_aprobacion)
             WHERE id = ?`,
            [estado, req.session.userId, estado, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }
        res.json({ success: true, message: 'Estado actualizado' });
    } catch (err) { next(err); }
};
