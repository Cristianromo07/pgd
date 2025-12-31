-- Crear tabla de escenarios
CREATE TABLE IF NOT EXISTS escenarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    capacidad_maxima INT DEFAULT 0,
    hora_apertura TIME DEFAULT '06:00:00',
    hora_cierre TIME DEFAULT '22:00:00'
);

-- Crear tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    escenario_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    color ENUM('rojo', 'azul', 'amarillo', 'naranja', 'violeta') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (escenario_id) REFERENCES escenarios(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insertar escenarios iniciales
INSERT IGNORE INTO escenarios (nombre, tipo) VALUES
('Cancha Santa Ana', 'cancha'),
('Cancha Samaria', 'cancha'),
('Placa Samaria', 'placa'),
('Cancha San Fernando', 'cancha'),
('Placa Viviendas del Sur', 'placa'),
('Cancha Viviendas del Sur', 'cancha'),
('Cancha Providencia', 'cancha'),
('Cancha Yarumito', 'cancha'),
('Cancha San José', 'cancha'),
('Cancha EVE (Enrique Vélez Escobar)', 'cancha'),
('Cancha María Bernal', 'cancha'),
('Cancha Parque del Artista', 'cancha'),
('Cancha Intermunicipal', 'cancha'),
('Placa 19 de Abril', 'placa'),
('Placa Cubierta La Aldea', 'placa'),
('Placa Deportiva La Hortensia', 'placa'),
('Cancha Arenilla Hortensia', 'cancha'),
('Skatepark', 'skatepark'),
('Cerro de las Luces', 'pista'),
('Pista BMX', 'pista'),
('Pista de Atletismo', 'pista'),
('Coliseo Ditaires', 'coliseo'),
('Canchas de Tenis de Campo', 'cancha');
