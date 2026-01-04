# Plataforma de Gestión Deportiva - PGD Itagüí

Sistema integral de Data Governance y Control Operativo diseñado para el Instituto Municipal de Cultura, Recreación y Deporte de Itagüí. Esta plataforma permite la gestión centralizada de escenarios deportivos, personal operativo, reservas y servicios institucionales, garantizando la transparencia y eficiencia en la toma de decisiones estratégicas.

---

## Características del Sistema

### Gestión de Personal (HorarioGestor)
Es el núcleo operativo del sistema para la administración de la programación semanal de los 23 escenarios oficiales y la Ciclovía.
*   **Visualización Dinámica**: Tabla de alto rendimiento que maneja 24+ escenarios con soporte para múltiples gestores por sede.
*   **UI de Alto Contraste**: Diseñada con colores corporativos (#7AA0E1) y tipografía de 14px en negro sólido para facilitar la lectura.
*   **Arquitectura Sticky Inteligente**: La columna de Escenario permanece fija mientras que el resto de la tabla se desplaza horizontalmente.
*   **Modo Gestión Administrativa**: 
    *   **CRUD**: Alta, baja y modificación de personal directamente desde la UI.
    *   **Quick-Select**: Selectores rápidos para turnos comunes (6:00-1:30, 2:30-10:00, Descanso, etc.).
    *   **Autocompletado**: Generador de datos aleatorios para simulaciones de capacidad operativa.
*   **Indicadores de Alerta**: Detección automática de Escenarios Vacantes con notificaciones visuales en tiempo real.

### Sistema de Reservas de Escenarios
Módulo integral para la gestión de espacios deportivos por parte de la comunidad y clubes.
*   **Calendario dinámico**: Visualización de disponibilidad por escenario y fecha.
*   **Reservas Recurrentes**: Soporte para reservas que se repiten diariamente, semanalmente o en días específicos, con control de fecha de fin o número de repeticiones.
*   **Gestión de Solicitantes**: Registro detallado de nombre, teléfono y descripción de la actividad para cada reserva.
*   **Validación de Conflictos**: Sistema que evita la superposición de horarios en un mismo escenario.

### Panel de Control (Dashboard)
Centro de mando distribuido en 5 grandes áreas operativas:
*   **Subgerencia de Escenarios**: Acceso a reservas y estados de mantenimiento.
*   **Fomento Deportivo**: Gestión de ligas y clubes.
*   **Cultura y Recreación**: Programación de eventos ciudadanos.
*   **Actividad Física**: Control de programas de salud pública.
*   **Administración**: Gestión de usuarios y configuración global.

### Perfil y Autenticación
*   **Seguridad**: Encriptación de contraseñas mediante bcrypt y gestión de sesiones protegidas.
*   **Recuperación de Cuenta**: Sistema de restablecimiento de contraseña mediante tokens temporales enviados por correo electrónico (simulado/configurable).
*   **Perfiles Personalizados**: Los usuarios pueden actualizar su información básica y ver su historial de actividad.

---

## Stack Tecnológico

*   **Frontend**: React.js (Vite), Tailwind CSS, Lucide React (iconografía).
*   **Backend**: Node.js, Express.js.
*   **Base de Datos**: MySQL 8.0+.
*   **Comunicación**: Axios con soporte de withCredentials para manejo de cookies y sesiones.

---

## Organización del Proyecto

```text
pgd/
├── client/                 # Aplicación Frontend
│   ├── src/
│   │   ├── pages/         # Vistas principales (HorarioGestor, Dashboard, Subgerencia)
│   │   ├── components/    # Componentes UI reutilizables
│   │   └── data/          # Archivos de configuración estáticos
├── server/                 # Aplicación Backend
│   ├── index.js           # Servidor principal, API y lógica de BD
├── data/                   # Recursos de Datos y Backups SQL
│   ├── setup_reservas.sql # Esquema base
│   └── login_db_backup.sql# Respaldo completo
└── scripts/                # Herramientas de mantenimiento
```

---

## Instalación y Configuración

### 1. Requisitos Previos
*   Node.js (v18.0 o superior)
*   MySQL Server (v8.0+)

### 2. Configuración de Base de Datos
1.  Crear la base de datos: `CREATE DATABASE login_db;`
2.  Importar el esquema inicial: `mysql -u usuario -p login_db < data/setup_reservas.sql`

### 3. Ejecución en Desarrollo
Instalar dependencias en ambas carpetas:
```bash
npm install
cd client && npm install
```
Iniciar servicios:
*   Backend: `node server/index.js` (Puerto 3000)
*   Frontend: `cd client && npm run dev` (Puerto 5173)

---

## Referencia de la API

| Método | Ruta | Función |
| :--- | :--- | :--- |
| GET | /api/horarios | Lista de personal y turnos. |
| POST | /api/horarios | Guardar/Actualizar programación semanal. |
| GET | /api/reservas | Obtener listado de reservas por escenario. |
| POST | /api/reservas | Crear nueva reserva (simple o recurrente). |
| POST | /api/login | Autenticación de usuario. |

---
*Desarrollado para potenciar la transparencia y eficiencia operativa del deporte en Itagüí.*
