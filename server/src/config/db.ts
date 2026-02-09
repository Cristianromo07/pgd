import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
});

export async function initDb() {
    try {
        const conn = await pool.getConnection();

        // Tablas básicas
        await conn.query(`CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'user') DEFAULT 'user',
            reset_token VARCHAR(255),
            reset_token_expires DATETIME
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS escenarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) UNIQUE NOT NULL
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS reservas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            escenario_id INT NOT NULL,
            usuario_id INT NOT NULL,
            fecha DATE NOT NULL,
            hora_inicio TIME NOT NULL,
            hora_fin TIME NOT NULL,
            color VARCHAR(7) DEFAULT '#3b82f6',
            nombre_solicitante VARCHAR(255),
            telefono_solicitante VARCHAR(20),
            descripcion_actividad TEXT,
            FOREIGN KEY (escenario_id) REFERENCES escenarios(id),
            FOREIGN KEY (usuario_id) REFERENCES users(id)
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS personal_horarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            escenario VARCHAR(255) NOT NULL,
            escenario_id INT,
            fecha_inicio DATE,
            gestor_nombre VARCHAR(255) NOT NULL,
            contacto VARCHAR(255) DEFAULT '',
            lunes VARCHAR(255), martes VARCHAR(255), miercoles VARCHAR(255), jueves VARCHAR(255), viernes VARCHAR(255), sabado VARCHAR(255), domingo VARCHAR(255),
            UNIQUE KEY unique_gestor (escenario, gestor_nombre, fecha_inicio)
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS novedades (
            id INT AUTO_INCREMENT PRIMARY KEY,
            escenario_id INT,
            escenario_nombre VARCHAR(255),
            tipo VARCHAR(255),
            descripcion TEXT,
            archivo_url VARCHAR(255),
            usuario_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Admin por defecto
        const [admin]: any = await conn.query('SELECT * FROM users WHERE email = "admin@test.com"');
        if (admin.length === 0) {
            const hashed = await bcrypt.hash(process.env.ADMIN_PWD || 'admin123', 10);
            await conn.query('INSERT INTO users (email, password, role) VALUES ("admin@test.com", ?, "admin")', [hashed]);
        }

        // Sembrar Escenarios (01-10) si no existen
        const [existingEscenarios]: any = await conn.query('SELECT COUNT(*) as count FROM escenarios');
        if (existingEscenarios[0].count === 0) {
            console.log('Sembrando escenarios iniciales...');
            for (let i = 1; i <= 10; i++) {
                const nombre = `Escenario ${i.toString().padStart(2, '0')}`;
                await conn.query('INSERT IGNORE INTO escenarios (nombre) VALUES (?)', [nombre]);
            }
        }

        // Sembrar 20 Perfiles de Gestores si no existen
        const [existingGestores]: any = await conn.query('SELECT COUNT(*) as count FROM personal_horarios');
        if (existingGestores[0].count === 0) {
            console.log('Sembrando 20 gestores de prueba...');
            const gestoresData = [
                { nombre: 'JUAN PEREZ', contacto: '3131234567', escenario: 'Escenario 01' },
                { nombre: 'MARIA GARCIA', contacto: '3009876543', escenario: 'Escenario 01' },
                { nombre: 'CARLOS LOPEZ', contacto: '3151112233', escenario: 'Escenario 02' },
                { nombre: 'ANA MARTINEZ', contacto: '3104445566', escenario: 'Escenario 02' },
                { nombre: 'LUIS RODRIGUEZ', contacto: '3207778899', escenario: 'Escenario 03' },
                { nombre: 'ELENA GOMEZ', contacto: '3112223344', escenario: 'Escenario 03' },
                { nombre: 'DIEGO SANCHEZ', contacto: '3125556677', escenario: 'Escenario 04' },
                { nombre: 'SOFIA DIAZ', contacto: '3148889900', escenario: 'Escenario 04' },
                { nombre: 'JAVIER TORRES', contacto: '3161234567', escenario: 'Escenario 05' },
                { nombre: 'PAULA RUIZ', contacto: '3179876543', escenario: 'Escenario 05' },
                { nombre: 'ANDRES RAMIREZ', contacto: '3181112233', escenario: 'Escenario 06' },
                { nombre: 'LAURA CASTRO', contacto: '3194445566', escenario: 'Escenario 06' },
                { nombre: 'RICARDO MORALES', contacto: '3217778899', escenario: 'Escenario 07' },
                { nombre: 'CAMILA HERRERA', contacto: '3222223344', escenario: 'Escenario 07' },
                { nombre: 'GABRIEL ORTIZ', contacto: '3235556677', escenario: 'Escenario 08' },
                { nombre: 'VALENTINA VARGAS', contacto: '3248889900', escenario: 'Escenario 08' },
                { nombre: 'FERNANDO SILVA', contacto: '3130001111', escenario: 'Escenario 09' },
                { nombre: 'ISABEL ROJAS', contacto: '3109998888', escenario: 'Escenario 09' },
                { nombre: 'MAURICIO PEÑA', contacto: '3007776666', escenario: 'Escenario 10' },
                { nombre: 'NATALIA BLANCO', contacto: '3152221111', escenario: 'Escenario 10' }
            ];

            for (const g of gestoresData) {
                const [esc]: any = await conn.query('SELECT id FROM escenarios WHERE nombre = ?', [g.escenario]);
                const escenario_id = esc[0]?.id;
                await conn.query(
                    'INSERT IGNORE INTO personal_horarios (escenario, escenario_id, gestor_nombre, contacto, fecha_inicio, lunes, martes, miercoles, jueves, viernes, sabado, domingo) VALUES (?, ?, ?, ?, "2000-01-01", "", "", "", "", "", "", "")',
                    [g.escenario, escenario_id, g.nombre, g.contacto]
                );
            }
        }

        conn.release();
        console.log('DB Lista');
    } catch (e) {
        console.error('Error DB:', e);
        throw e;
    }
}

export { pool };
