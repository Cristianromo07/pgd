-- ============================================================================
-- PGD - Esquema v2 (CANONICO / instalacion limpia)
-- ============================================================================
-- Sustituye al esquema v1 que se auto-creaba en server/src/config/db.ts.
-- Objetivos del rediseno:
--   1. users  -> rol normalizado (admin/empleado), perfil minimo, soft disable.
--   2. escenarios -> catalogo completo (tipo, capacidad, horario, ubicacion).
--   3. espacios -> CANCHAS/sub-espacios reservables DENTRO de cada escenario.
--   4. reservas -> apuntan a un ESPACIO, con estados y flujo de aprobacion.
--   5. personal_horarios -> conserva la matriz semanal pero con FK real a
--      escenarios (se elimina la dependencia del nombre en texto).
--   6. novedades -> FK a escenarios (la columna escenario_nombre queda como
--      deposito transitorio, ver migracion).
--
-- Nota: las columnas marcadas [DEPRECATED] se mantienen SOLO para no romper
-- el codigo actual (controladores/frontend) mientras se refactoriza.
-- Eliminarlas es el objetivo de la fase 2.
--
-- MySQL 8.0.16+ (CHECK enforce) / MariaDB 10.5+
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS novedades;
DROP TABLE IF EXISTS personal_horarios;
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS espacios;
DROP TABLE IF EXISTS escenarios;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    nombre              VARCHAR(120) NULL,
    email               VARCHAR(255) NOT NULL,
    password            VARCHAR(255) NOT NULL,
    telefono            VARCHAR(20)  NULL,
    role                ENUM('admin','empleado') NOT NULL DEFAULT 'empleado',
    activo              TINYINT(1) NOT NULL DEFAULT 1,
    reset_token         VARCHAR(255) NULL,
    reset_token_expires DATETIME      NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- ESCENARIOS (sedes deportivas maestras)
-- ---------------------------------------------------------------------------
CREATE TABLE escenarios (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(255) NOT NULL,
    tipo            VARCHAR(50)  NOT NULL DEFAULT 'cancha',  -- cancha/placa/pista/coliseo/estadio/complejo/skatepark/administrativo
    capacidad_maxima INT         NOT NULL DEFAULT 0,
    hora_apertura   TIME         NULL,                        -- NULL = 24h / hereda nada
    hora_cierre     TIME         NULL,
    direccion       VARCHAR(255) NULL,
    activo          TINYINT(1)   NOT NULL DEFAULT 1,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_escenarios_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- ESPACIOS (canchas / sub-espacios reservables de cada escenario)
-- ---------------------------------------------------------------------------
CREATE TABLE espacios (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    escenario_id     INT NOT NULL,
    nombre           VARCHAR(120) NOT NULL,   -- 'PRINCIPAL', 'CANCHA 1', ...
    tipo             VARCHAR(50)  NULL,       -- hereda de escenario si NULL
    capacidad_maxima INT          NULL,       -- NULL = hereda de escenario
    hora_apertura    TIME         NULL,       -- NULL = hereda de escenario
    hora_cierre      TIME         NULL,
    activo           TINYINT(1)   NOT NULL DEFAULT 1,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_espacios_escenario_nombre (escenario_id, nombre),
    CONSTRAINT fk_espacios_escenario FOREIGN KEY (escenario_id)
        REFERENCES escenarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- RESERVAS (por espacio, con estado y aprobacion)
-- ---------------------------------------------------------------------------
CREATE TABLE reservas (
    id                     INT AUTO_INCREMENT PRIMARY KEY,
    espacio_id             INT NOT NULL,
    -- [DEPRECATED] snapshot de escenario para compatibilidad v1. Eliminar en fase 2.
    escenario_id           INT NOT NULL,
    usuario_id             INT NOT NULL,          -- empleado/admin que registra
    fecha                  DATE NOT NULL,
    hora_inicio            TIME NOT NULL,
    hora_fin               TIME NOT NULL,
    estado                 ENUM('PENDIENTE','CONFIRMADA','RECHAZADA','CANCELADA','FINALIZADA')
                           NOT NULL DEFAULT 'CONFIRMADA',
    color                  VARCHAR(12) DEFAULT '#3b82f6',
    nombre_solicitante     VARCHAR(255) NOT NULL DEFAULT '',
    telefono_solicitante   VARCHAR(20)  NULL,
    descripcion_actividad  TEXT NULL,
    aprobado_por           INT NULL,              -- quien confirma/rechaza
    fecha_aprobacion       DATETIME NULL,
    created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_reservas_horario CHECK (hora_fin > hora_inicio),
    KEY idx_reservas_espacio_fecha (espacio_id, fecha, hora_inicio),
    KEY idx_reservas_escenario_fecha (escenario_id, fecha),
    CONSTRAINT fk_reservas_espacio FOREIGN KEY (espacio_id)
        REFERENCES espacios(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reservas_usuario FOREIGN KEY (usuario_id)
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reservas_aprobador FOREIGN KEY (aprobado_por)
        REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- PERSONAL_HORARIOS (turnos semanales de gestores)
-- ---------------------------------------------------------------------------
CREATE TABLE personal_horarios (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    escenario_id   INT NOT NULL,
    -- [DEPRECATED] nombre en texto sincronizado con escenarios.nombre.
    -- El frontend (HorarioGestor) todavia lo consume; eliminar en fase 2.
    escenario      VARCHAR(255) NOT NULL,
    fecha_inicio   DATE NOT NULL DEFAULT '2000-01-01',
    gestor_nombre  VARCHAR(255) NOT NULL,
    contacto       VARCHAR(255) NOT NULL DEFAULT '',
    lunes          VARCHAR(255) NOT NULL DEFAULT '',
    martes         VARCHAR(255) NOT NULL DEFAULT '',
    miercoles      VARCHAR(255) NOT NULL DEFAULT '',
    jueves         VARCHAR(255) NOT NULL DEFAULT '',
    viernes        VARCHAR(255) NOT NULL DEFAULT '',
    sabado         VARCHAR(255) NOT NULL DEFAULT '',
    domingo        VARCHAR(255) NOT NULL DEFAULT '',
    activo         TINYINT(1) NOT NULL DEFAULT 1,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_personal_escenario_id (escenario_id),
    KEY idx_personal_gestor (gestor_nombre),
    UNIQUE KEY uq_personal_escenario_id (escenario_id, gestor_nombre, fecha_inicio),
    -- El UNIQUE (escenario, gestor_nombre, fecha_inicio) de v1 queda sustituido
    -- por el de escenario_id; la columna texto se eliminara junto al refactor.
    CONSTRAINT fk_personal_escenario FOREIGN KEY (escenario_id)
        REFERENCES escenarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- NOVEDADES (reportes/incidencias de escenarios)
-- ---------------------------------------------------------------------------
CREATE TABLE novedades (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    escenario_id     INT NULL,
    -- [DEPRECATED] texto duplicado; conservar solo hasta migrar el controlador.
    escenario_nombre VARCHAR(255) NULL,
    tipo             VARCHAR(50)  NULL,   -- Mantenimiento / Dano / Otro
    descripcion      TEXT NULL,
    archivo_url      VARCHAR(255) NULL,
    usuario_id       INT NULL,
    estado           ENUM('PENDIENTE','EN_PROCESO','RESUELTA') NOT NULL DEFAULT 'PENDIENTE',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_novedades_escenario (escenario_id),
    CONSTRAINT fk_novedades_escenario FOREIGN KEY (escenario_id)
        REFERENCES escenarios(id) ON DELETE SET NULL,
    CONSTRAINT fk_novedades_usuario FOREIGN KEY (usuario_id)
        REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Seed opcional: solo referencia (los nombres reales estan en setup_reservas.sql)
--   INSERT INTO escenarios (nombre, tipo) VALUES ('SAN FERNANDO','cancha'), ...;
--   INSERT INTO espacios (escenario_id, nombre)
--   SELECT id, 'PRINCIPAL' FROM escenarios; -- un espacio por defecto por sede
-- ============================================================================
