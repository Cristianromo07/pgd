import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
});

// Esquema v2 (ver data/schema_v2.sql). Si la base ya fue migrada con
// data/migracion_v1_to_v2.sql, CREATE TABLE IF NOT EXISTS es un no-op.
export async function initDb() {
    try {
        const conn = await pool.getConnection();

        await conn.query(`CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(120) NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            telefono VARCHAR(20) NULL,
            role ENUM('admin', 'empleado') NOT NULL DEFAULT 'empleado',
            activo TINYINT(1) NOT NULL DEFAULT 1,
            reset_token VARCHAR(255),
            reset_token_expires DATETIME,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS escenarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) UNIQUE NOT NULL,
            tipo VARCHAR(50) NOT NULL DEFAULT 'cancha',
            capacidad_maxima INT NOT NULL DEFAULT 0,
            hora_apertura TIME NULL,
            hora_cierre TIME NULL,
            direccion VARCHAR(255) NULL,
            activo TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS espacios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            escenario_id INT NOT NULL,
            nombre VARCHAR(120) NOT NULL,
            tipo VARCHAR(50) NULL,
            capacidad_maxima INT NULL,
            hora_apertura TIME NULL,
            hora_cierre TIME NULL,
            activo TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_espacios_escenario_nombre (escenario_id, nombre),
            CONSTRAINT fk_espacios_escenario FOREIGN KEY (escenario_id)
                REFERENCES escenarios(id) ON DELETE CASCADE
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS reservas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            espacio_id INT NOT NULL,
            escenario_id INT NOT NULL,
            usuario_id INT NOT NULL,
            fecha DATE NOT NULL,
            hora_inicio TIME NOT NULL,
            hora_fin TIME NOT NULL,
            estado ENUM('PENDIENTE','CONFIRMADA','RECHAZADA','CANCELADA','FINALIZADA') NOT NULL DEFAULT 'CONFIRMADA',
            color VARCHAR(12) DEFAULT '#3b82f6',
            nombre_solicitante VARCHAR(255) NOT NULL DEFAULT '',
            telefono_solicitante VARCHAR(20),
            descripcion_actividad TEXT,
            aprobado_por INT NULL,
            fecha_aprobacion DATETIME NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT chk_reservas_horario CHECK (hora_fin > hora_inicio),
            INDEX idx_reservas_espacio_fecha (espacio_id, fecha, hora_inicio),
            INDEX idx_reservas_escenario_fecha (escenario_id, fecha),
            CONSTRAINT fk_reservas_espacio FOREIGN KEY (espacio_id)
                REFERENCES espacios(id) ON DELETE RESTRICT,
            CONSTRAINT fk_reservas_escenario FOREIGN KEY (escenario_id)
                REFERENCES escenarios(id) ON DELETE RESTRICT,
            CONSTRAINT fk_reservas_usuario FOREIGN KEY (usuario_id)
                REFERENCES users(id) ON DELETE RESTRICT,
            CONSTRAINT fk_reservas_aprobador FOREIGN KEY (aprobado_por)
                REFERENCES users(id) ON DELETE SET NULL
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS personal_horarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            escenario_id INT NOT NULL,
            escenario VARCHAR(255) NOT NULL,
            fecha_inicio DATE NOT NULL DEFAULT '2000-01-01',
            gestor_nombre VARCHAR(255) NOT NULL,
            contacto VARCHAR(255) NOT NULL DEFAULT '',
            lunes VARCHAR(255) NOT NULL DEFAULT '',
            martes VARCHAR(255) NOT NULL DEFAULT '',
            miercoles VARCHAR(255) NOT NULL DEFAULT '',
            jueves VARCHAR(255) NOT NULL DEFAULT '',
            viernes VARCHAR(255) NOT NULL DEFAULT '',
            sabado VARCHAR(255) NOT NULL DEFAULT '',
            domingo VARCHAR(255) NOT NULL DEFAULT '',
            activo TINYINT(1) NOT NULL DEFAULT 1,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_personal_escenario_id (escenario_id),
            INDEX idx_personal_gestor (gestor_nombre),
            UNIQUE KEY uq_personal_escenario_id (escenario_id, gestor_nombre, fecha_inicio),
            CONSTRAINT fk_personal_escenario FOREIGN KEY (escenario_id)
                REFERENCES escenarios(id) ON DELETE RESTRICT
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS novedades (
            id INT AUTO_INCREMENT PRIMARY KEY,
            escenario_id INT NULL,
            escenario_nombre VARCHAR(255) NULL,
            tipo VARCHAR(50) NULL,
            estado ENUM('PENDIENTE','EN_PROCESO','RESUELTA') NOT NULL DEFAULT 'PENDIENTE',
            descripcion TEXT,
            archivo_url VARCHAR(255),
            usuario_id INT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_novedades_escenario (escenario_id),
            INDEX idx_novedades_usuario (usuario_id),
            CONSTRAINT fk_novedades_escenario FOREIGN KEY (escenario_id)
                REFERENCES escenarios(id) ON DELETE SET NULL,
            CONSTRAINT fk_novedades_usuario FOREIGN KEY (usuario_id)
                REFERENCES users(id) ON DELETE SET NULL
        )`);

        // Admin por defecto
        const [admin]: any = await conn.query('SELECT * FROM users WHERE email = "admin@test.com"');
        if (admin.length === 0) {
            const hashed = await bcrypt.hash(process.env.ADMIN_PWD || 'admin123', 10);
            await conn.query('INSERT INTO users (email, password, role, nombre) VALUES ("admin@test.com", ?, "admin", "Administrador")', [hashed]);
        }

        // NOTA: los seeds de escenarios/gestores de prueba fueron eliminados
        // (creaban "Escenario 01..10" y 20 gestores falsos). La lista real de
        // sedes se carga con data/setup_reservas.sql.

        conn.release();
        console.log('DB Lista');
    } catch (e) {
        console.error('Error DB:', e);
        throw e;
    }
}

export { pool };
