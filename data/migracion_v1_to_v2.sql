-- ============================================================================
-- PGD - Migracion v1 -> v2  (login_db)
-- ============================================================================
-- Convierte el esquema actual (creado por server/src/config/db.ts) al esquema
-- v2 de data/schema_v2.sql PRESERVANDO los datos existentes.
--
-- Requisitos:
--   * MySQL 8.0.16+ o MariaDB 10.5+
--   * Ejecutar SIEMPRE sobre un backup de la base:
--       mysqldump -u <user> -p login_db > login_db_backup_pre_v2.sql
--
-- Idempotencia: los ALTER de agregar columna/index/FK estan protegidos con
-- helpers; las sentencias DDL que solo deben ejecutarse una vez estan marcadas.
--
-- IMPORTANTE (fase 2, codigo):
--   Despues de migrar, el backend/frontend siguen funcionando con las columnas
--   [DEPRECATED] (reservas.escenario_id, personal_horarios.escenario,
--   novedades.escenario_nombre). El refactor de controladores y UI las
--   eliminara progresivamente.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helpers (procedimientos idempotentes)
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS add_col;
DROP PROCEDURE IF EXISTS add_idx;
DROP PROCEDURE IF EXISTS add_fk;
DROP PROCEDURE IF EXISTS add_check;
DROP PROCEDURE IF EXISTS add_unique;
DROP PROCEDURE IF EXISTS drop_index;

DELIMITER //

CREATE PROCEDURE add_col(IN tbl VARCHAR(64), IN col VARCHAR(64), IN definition TEXT)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND COLUMN_NAME = col
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN ', definition);
        PREPARE s FROM @ddl;
        EXECUTE s;
        DEALLOCATE PREPARE s;
    END IF;
END//

CREATE PROCEDURE add_idx(IN tbl VARCHAR(64), IN idx VARCHAR(64), IN cols VARCHAR(255))
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND INDEX_NAME = idx
    ) THEN
        SET @ddl = CONCAT('CREATE INDEX ', idx, ' ON `', tbl, '` (', cols, ')');
        PREPARE s FROM @ddl;
        EXECUTE s;
        DEALLOCATE PREPARE s;
    END IF;
END//

CREATE PROCEDURE add_fk(IN tbl VARCHAR(64), IN fk VARCHAR(64), IN definition VARCHAR(255))
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND CONSTRAINT_NAME = fk
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', tbl, '` ADD CONSTRAINT ', fk, ' ', definition);
        PREPARE s FROM @ddl;
        EXECUTE s;
        DEALLOCATE PREPARE s;
    END IF;
END//

CREATE PROCEDURE add_check(IN tbl VARCHAR(64), IN chk VARCHAR(64), IN definition VARCHAR(255))
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND CONSTRAINT_NAME = chk
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', tbl, '` ADD CONSTRAINT ', chk, ' ', definition);
        PREPARE s FROM @ddl;
        EXECUTE s;
        DEALLOCATE PREPARE s;
    END IF;
END//

CREATE PROCEDURE add_unique(IN tbl VARCHAR(64), IN idx VARCHAR(64), IN cols VARCHAR(255))
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND INDEX_NAME = idx
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', tbl, '` ADD UNIQUE KEY ', idx, ' (', cols, ')');
        PREPARE s FROM @ddl;
        EXECUTE s;
        DEALLOCATE PREPARE s;
    END IF;
END//

CREATE PROCEDURE drop_index(IN tbl VARCHAR(64), IN idx VARCHAR(64))
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND INDEX_NAME = idx
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', tbl, '` DROP INDEX ', idx);
        PREPARE s FROM @ddl;
        EXECUTE s;
        DEALLOCATE PREPARE s;
    END IF;
END//

DELIMITER ;

-- ============================================================================
-- 1) USERS
-- ============================================================================
-- Garantizar columnas base por si la BD es un backup antiguo (solo email/password)
CALL add_col('users', 'role', 'role ENUM(''admin'',''empleado'') NOT NULL DEFAULT ''empleado'' AFTER password');
CALL add_col('users', 'reset_token', 'reset_token VARCHAR(255) NULL');
CALL add_col('users', 'reset_token_expires', 'reset_token_expires DATETIME NULL');

-- Reasignar roles: 'user' (v1) pasa a 'empleado'.
-- Se amplia el ENUM primero (contiene 'user'), se migran los datos y luego se
-- retira el valor antiguo.
ALTER TABLE users
    MODIFY role ENUM('admin','user','empleado') NOT NULL DEFAULT 'empleado';

UPDATE users SET role = 'empleado' WHERE role NOT IN ('admin','empleado');

-- DDL unica vez: ENUM final sin 'user'
ALTER TABLE users
    MODIFY role ENUM('admin','empleado') NOT NULL DEFAULT 'empleado';

CALL add_col('users', 'nombre',   'nombre VARCHAR(120) NULL AFTER id');
CALL add_col('users', 'telefono', 'telefono VARCHAR(20) NULL AFTER password');
CALL add_col('users', 'activo',   'activo TINYINT(1) NOT NULL DEFAULT 1 AFTER role');
CALL add_col('users', 'created_at', 'created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
CALL add_col('users', 'updated_at', 'updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

-- ============================================================================
-- 2) ESCENARIOS  (ampliar el catalogo)
-- ============================================================================
-- NOTA: si ya aplicaste data/setup_reservas.sql estas columnas existen y los
-- helpers las omiten sin romper nada.
CALL add_col('escenarios', 'tipo',             'tipo VARCHAR(50) NOT NULL DEFAULT ''cancha'' AFTER nombre');
CALL add_col('escenarios', 'capacidad_maxima', 'capacidad_maxima INT NOT NULL DEFAULT 0 AFTER tipo');
CALL add_col('escenarios', 'hora_apertura',    'hora_apertura TIME NULL AFTER capacidad_maxima');
CALL add_col('escenarios', 'hora_cierre',      'hora_cierre TIME NULL AFTER hora_apertura');
CALL add_col('escenarios', 'direccion',        'direccion VARCHAR(255) NULL AFTER hora_cierre');
CALL add_col('escenarios', 'activo',           'activo TINYINT(1) NOT NULL DEFAULT 1 AFTER direccion');
CALL add_col('escenarios', 'created_at',       'created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
CALL add_col('escenarios', 'updated_at',       'updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

-- ============================================================================
-- 3) ESPACIOS  (tabla nueva: canchas/sub-espacios reservables)
-- ============================================================================
CREATE TABLE IF NOT EXISTS espacios (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    escenario_id     INT NOT NULL,
    nombre           VARCHAR(120) NOT NULL,
    tipo             VARCHAR(50)  NULL,
    capacidad_maxima INT          NULL,
    hora_apertura    TIME         NULL,
    hora_cierre      TIME         NULL,
    activo           TINYINT(1)   NOT NULL DEFAULT 1,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_espacios_escenario_nombre (escenario_id, nombre),
    KEY idx_espacios_escenario (escenario_id),
    CONSTRAINT fk_espacios_escenario FOREIGN KEY (escenario_id)
        REFERENCES escenarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Un espacio por defecto ('PRINCIPAL') por cada escenario existente.
INSERT INTO espacios (escenario_id, nombre, activo)
SELECT e.id, 'PRINCIPAL', 1 FROM escenarios e
ON DUPLICATE KEY UPDATE activo = 1;

-- ============================================================================
-- 4) RESERVAS  (estado + espacio + aprobacion)
-- ============================================================================
CALL add_col('reservas', 'espacio_id', 'espacio_id INT NULL AFTER id');
CALL add_col('reservas', 'estado', 'estado ENUM(''PENDIENTE'',''CONFIRMADA'',''RECHAZADA'',''CANCELADA'',''FINALIZADA'') NOT NULL DEFAULT ''CONFIRMADA'' AFTER hora_fin');
CALL add_col('reservas', 'aprobado_por',     'aprobado_por INT NULL AFTER descripcion_actividad');
CALL add_col('reservas', 'fecha_aprobacion', 'fecha_aprobacion DATETIME NULL AFTER aprobado_por');
CALL add_col('reservas', 'created_at',       'created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
CALL add_col('reservas', 'updated_at',       'updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

-- Asignar a cada reserva el espacio PRINCIPAL de su escenario
UPDATE reservas r
JOIN espacios es ON es.escenario_id = r.escenario_id AND es.nombre = 'PRINCIPAL'
SET r.espacio_id = es.id
WHERE r.espacio_id IS NULL;

-- DDL unica vez: espacio obligatorio (todas las reservas ya tienen uno)
ALTER TABLE reservas MODIFY espacio_id INT NOT NULL;

-- Ancho de etiqueta de color (el frontend usa nombres tipo 'amarillo', 8 chars)
ALTER TABLE reservas MODIFY color VARCHAR(12) DEFAULT '#3b82f6';

CALL add_idx('reservas', 'idx_reservas_espacio_fecha',   'espacio_id, fecha, hora_inicio');
CALL add_idx('reservas', 'idx_reservas_escenario_fecha', 'escenario_id, fecha');
CALL add_fk('reservas', 'fk_reservas_espacio',   'FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE RESTRICT');
CALL add_fk('reservas', 'fk_reservas_aprobador', 'FOREIGN KEY (aprobado_por) REFERENCES users(id) ON DELETE SET NULL');

-- Chequeo opcional: si existen reservas con hora_fin <= hora_inicio la migracion
-- fallara aqui. En tal caso limpiar antes o comentar el siguiente CALL.
CALL add_check('reservas', 'chk_reservas_horario', 'CHECK (hora_fin > hora_inicio)');

-- ============================================================================
-- 5) PERSONAL_HORARIOS  (FK real a escenarios)
-- ============================================================================
-- 5a. Materializar escenarios "fantasma" que solo existan como texto.
--     (se incluye tipo por si la tabla ya exige la columna sin default)
INSERT INTO escenarios (nombre, tipo)
SELECT DISTINCT ph.escenario, 'cancha'
FROM personal_horarios ph
LEFT JOIN escenarios e ON e.nombre = ph.escenario
WHERE ph.escenario IS NOT NULL AND e.id IS NULL;

-- 5b. Completar escenario_id por nombre y sincronizar el texto con el canonico.
UPDATE personal_horarios ph
JOIN escenarios e ON e.nombre = ph.escenario
SET ph.escenario_id = e.id
WHERE ph.escenario_id IS NULL OR ph.escenario_id <> e.id;

UPDATE personal_horarios ph
JOIN escenarios e ON e.id = ph.escenario_id
SET ph.escenario = e.nombre
WHERE ph.escenario <> e.nombre;

-- 5c. Limpiar filas sin escenario resoluble (datos corruptos) y fijar FK.
DELETE FROM personal_horarios WHERE escenario_id IS NULL;

-- DDL unica vez: escenario obligatorio
ALTER TABLE personal_horarios MODIFY escenario_id INT NOT NULL;

CALL add_col('personal_horarios', 'activo',     'activo TINYINT(1) NOT NULL DEFAULT 1 AFTER domingo');
CALL add_col('personal_horarios', 'updated_at', 'updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

CALL add_idx('personal_horarios', 'idx_personal_escenario_id', 'escenario_id');
CALL add_idx('personal_horarios', 'idx_personal_gestor', 'gestor_nombre');
CALL add_fk('personal_horarios', 'fk_personal_escenario', 'FOREIGN KEY (escenario_id) REFERENCES escenarios(id) ON DELETE RESTRICT');

-- 5d. Sustituir el UNIQUE por texto por uno basado en FK. Se deduplican antes
--     filas repetidas que podrian quedar al unificar variantes del mismo nombre.
DELETE p1 FROM personal_horarios p1
JOIN personal_horarios p2
  ON p1.escenario_id = p2.escenario_id
 AND p1.gestor_nombre = p2.gestor_nombre
 AND p1.fecha_inicio  = p2.fecha_inicio
 AND p1.id > p2.id;

-- Protegido: permite re-ejecutar la migracion sin errores.
CALL drop_index('personal_horarios', 'unique_gestor');
CALL add_unique('personal_horarios', 'uq_personal_escenario_id', 'escenario_id, gestor_nombre, fecha_inicio');

-- ============================================================================
-- 6) NOVEDADES  (estado + FK)
-- ============================================================================
CALL add_col('novedades', 'estado', 'estado ENUM(''PENDIENTE'',''EN_PROCESO'',''RESUELTA'') NOT NULL DEFAULT ''PENDIENTE'' AFTER tipo');

UPDATE novedades n
JOIN escenarios e ON e.nombre = n.escenario_nombre
SET n.escenario_id = e.id
WHERE n.escenario_id IS NULL;

CALL add_idx('novedades', 'idx_novedades_escenario', 'escenario_id');
CALL add_idx('novedades', 'idx_novedades_usuario', 'usuario_id');
CALL add_fk('novedades', 'fk_novedades_escenario', 'FOREIGN KEY (escenario_id) REFERENCES escenarios(id) ON DELETE SET NULL');
CALL add_fk('novedades', 'fk_novedades_usuario', 'FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE SET NULL');

-- ============================================================================
-- Limpieza de helpers
-- ============================================================================
DROP PROCEDURE IF EXISTS add_col;
DROP PROCEDURE IF EXISTS add_idx;
DROP PROCEDURE IF EXISTS add_fk;
DROP PROCEDURE IF EXISTS add_check;
DROP PROCEDURE IF EXISTS add_unique;
DROP PROCEDURE IF EXISTS drop_index;

-- ============================================================================
-- Resumen esperado al finalizar:
--   users              -> role {admin, empleado}; + nombre, telefono, activo
--   escenarios         -> catalogo completo (tipo, capacidad, horario)
--   espacios           -> 1 fila 'PRINCIPAL' por cada escenario
--   reservas           -> todas con espacio_id, estado 'CONFIRMADA'
--   personal_horarios  -> escenario_id NOT NULL + FK; unique por id
--   novedades          -> estado 'PENDIENTE'; FK escenario/usuario
-- ============================================================================
