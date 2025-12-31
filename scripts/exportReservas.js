const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// --- Leer argumentos de línea de comandos ---
const args = process.argv.slice(2);
const filters = {};
args.forEach(arg => {
    const [key, value] = arg.split('=');
    if (key && value) {
        filters[key.replace('--', '')] = value;
    }
});

async function exportReservas(filters) {
    try {
        // 1️⃣ Conectar a MySQL
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'login_user',
            password: '1234',
            database: 'login_db'
        });

        // 2️⃣ Construir query dinámico según filtros
        let query = `
      SELECT r.id, r.escenario_id, e.nombre AS escenario_nombre, 
             r.usuario_id, u.email AS usuario_email, 
             r.fecha, r.hora_inicio, r.hora_fin, r.color
      FROM reservas r
      JOIN escenarios e ON r.escenario_id = e.id
      JOIN users u ON r.usuario_id = u.id
      WHERE 1=1
    `;
        const params = [];

        if (filters.start && filters.end) {
            query += ' AND r.fecha BETWEEN ? AND ?';
            params.push(filters.start, filters.end);
        }

        if (filters.escenario) {
            query += ' AND r.escenario_id = ?';
            params.push(filters.escenario);
        }

        if (filters.usuario) {
            query += ' AND r.usuario_id = ?';
            params.push(filters.usuario);
        }

        query += ' ORDER BY r.fecha ASC, r.hora_inicio ASC';

        // 3️⃣ Ejecutar consulta
        const [rows] = await connection.execute(query, params);
        await connection.end();

        if (rows.length === 0) {
            console.log('⚠️ No hay reservas con los filtros indicados.');
            return;
        }

        // 4️⃣ Cabecera CSV
        const header = 'id,escenario_id,escenario_nombre,usuario_id,usuario_email,fecha,horario,color';

        // 5️⃣ Convertir filas a CSV, combinando horas
        const csvRows = rows.map(r => {
            const horario = `${r.hora_inicio} - ${r.hora_fin}`;
            return `${r.id},${r.escenario_id},"${r.escenario_nombre}",${r.usuario_id},"${r.usuario_email}",${r.fecha},"${horario}",${r.color}`;
        });

        // 6️⃣ Combinar cabecera + filas
        const csv = [header, ...csvRows].join('\n');

        // 7️⃣ Generar nombre de archivo según filtros (usar ruta absoluta relativa al repo)
        const dataDir = path.join(__dirname, '..', 'data');
        // asegurar que exista la carpeta data/
        fs.mkdirSync(dataDir, { recursive: true });

        let filename = path.join(dataDir, 'reservas');
        if (filters.start && filters.end) filename += `_${filters.start}_a_${filters.end}`;
        if (filters.escenario) filename += `_escenario${filters.escenario}`;
        if (filters.usuario) filename += `_usuario${filters.usuario}`;
        filename += '.csv';

        // 8️⃣ Guardar archivo
        fs.writeFileSync(filename, csv);
        console.log(`✅ Exportación completada: ${filename}`);

    } catch (err) {
        console.error('❌ Error al exportar reservas:', err);
    }
}

// Ejecutar función
exportReservas(filters);
