const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONN_LIMIT) || 10,
    queueLimit: 0
};

// Validación crítica de seguridad
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error('❌ ERROR CRÍTICO: Variables de entorno de base de datos faltantes.');
    console.error('Por favor configure el archivo .env basado en .env.example');
    process.exit(1);
}

// Crear el pool inmediatamente
const pool = mysql.createPool(dbConfig);

async function initDb() {
    try {
        const conn = await pool.getConnection();
        await conn.ping();

        // Migración: Asegurar que existan las columnas de reset_token
        const [columns] = await conn.query('SHOW COLUMNS FROM users');
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('reset_token')) {
            await conn.query('ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL');
            console.log('Columna reset_token añadida a users');
        }
        if (!columnNames.includes('reset_token_expires')) {
            await conn.query('ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL');
            console.log('Columna reset_token_expires añadida a users');
        }

        // Migración para reservas: nombre, telefono, descripcion
        const [reservaCols] = await conn.query('SHOW COLUMNS FROM reservas');
        const reservaColNames = reservaCols.map(c => c.Field);

        if (!reservaColNames.includes('nombre_solicitante')) {
            await conn.query('ALTER TABLE reservas ADD COLUMN nombre_solicitante VARCHAR(255) NULL');
            console.log('Columna nombre_solicitante añadida a reservas');
        }
        if (!reservaColNames.includes('telefono_solicitante')) {
            await conn.query('ALTER TABLE reservas ADD COLUMN telefono_solicitante VARCHAR(255) NULL');
            console.log('Columna telefono_solicitante añadida a reservas');
        }
        if (!reservaColNames.includes('descripcion_actividad')) {
            await conn.query('ALTER TABLE reservas ADD COLUMN descripcion_actividad TEXT NULL');
            console.log('Columna descripcion_actividad añadida a reservas');
        }

        // Tabla para persistencia de horarios de personal
        await conn.query(`
      CREATE TABLE IF NOT EXISTS personal_horarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        escenario VARCHAR(255) NOT NULL,
        gestor_nombre VARCHAR(255) NOT NULL,
        contacto VARCHAR(255) DEFAULT '',
        lunes VARCHAR(255),
        martes VARCHAR(255),
        miercoles VARCHAR(255),
        jueves VARCHAR(255),
        viernes VARCHAR(255),
        sabado VARCHAR(255),
        domingo VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_gestor_escenario (escenario, gestor_nombre)
      )
    `);

        // Migración para añadir contacto si la tabla ya existía
        const [horarioCols] = await conn.query('SHOW COLUMNS FROM personal_horarios');
        if (!horarioCols.map(c => c.Field).includes('contacto')) {
            await conn.query('ALTER TABLE personal_horarios ADD COLUMN contacto VARCHAR(255) DEFAULT "" AFTER gestor_nombre');
            console.log('Columna contacto añadida a personal_horarios');
        }

        // Sembrado inicial si la tabla está vacía
        const [countRows] = await conn.query('SELECT COUNT(*) as cnt FROM personal_horarios');
        if (countRows[0].cnt === 0) {
            console.log('Sembrando tabla personal_horarios desde JSON...');
            try {
                const jsonPath = path.join(__dirname, '..', '..', 'client/src/data/horarioGestoresFull.json');
                if (fs.existsSync(jsonPath)) {
                    const raw = fs.readFileSync(jsonPath, 'utf8');
                    const jsonData = JSON.parse(raw);
                    const insertSql = `
            INSERT INTO personal_horarios 
            (escenario, gestor_nombre, contacto, lunes, martes, miercoles, jueves, viernes, sabado, domingo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            contacto = VALUES(contacto),
            lunes = VALUES(lunes),
            martes = VALUES(martes),
            miercoles = VALUES(miercoles),
            jueves = VALUES(jueves),
            viernes = VALUES(viernes),
            sabado = VALUES(sabado),
            domingo = VALUES(domingo)
          `;

                    for (const esc of jsonData) {
                        if (esc.gestores) {
                            for (const g of esc.gestores) {
                                if (g.nombre === 'CONTACTO') continue;
                                await conn.query(insertSql, [
                                    esc.escenario, g.nombre, g.contacto || '',
                                    g.turnos[0] || '', g.turnos[1] || '', g.turnos[2] || '', g.turnos[3] || '', g.turnos[4] || '', g.turnos[5] || '', g.turnos[6] || ''
                                ]);
                            }
                        }
                    }
                    console.log('Sembrado completado con éxito');
                }
            } catch (seedErr) {
                console.error('Error sembrando datos:', seedErr.message);
            }
        }

        // Seed admin user
        const adminEmail = 'admin@test.com';
        const [adminRows] = await conn.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
        const hashed = await bcrypt.hash(process.env.ADMIN_PWD || 'admin123_temp_insecure', 10);
        if (!process.env.ADMIN_PWD) console.warn('⚠️ ADVERTENCIA: Usando contraseña de admin por defecto insegura. Configure ADMIN_PWD en .env');
        if (adminRows.length === 0) {
            await conn.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [adminEmail, hashed, 'admin']);
            console.log('Default admin user created');
        } else {
            await conn.query('UPDATE users SET password = ?, role = ? WHERE email = ?', [hashed, 'admin', adminEmail]);
            console.log('Admin user password reset');
        }

        conn.release();
        console.log('Conectado a la base de datos');
    } catch (e) {
        console.error('Error inicializando la base de datos:', e.message);
        throw e;
    }
}

module.exports = {
    pool,
    initDb
};
