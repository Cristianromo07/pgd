# PGD - Plataforma de Gestión Deportiva

Aplicación web para la administración de escenarios deportivos: reservas de espacios, programación de horarios de personal y reporte de novedades. Construida con React, Express y MySQL, escrita íntegramente en TypeScript.

El proyecto plantea un caso de uso real de gestión institucional del deporte: sedes (canchas, coliseos), espacios reservables dentro de cada sede, turnos semanales de gestores y un flujo de aprobación de reservas con roles diferenciados.

---

## Descripción del proyecto

PGD es un sistema cliente-servidor con una API REST y una SPA (Single Page Application). El backend expone los módulos de autenticación, escenarios, espacios, reservas, horarios de personal y novedades; el frontend consume esa API y agrupa las pantallas por funcionalidad dentro de la carpeta `features`.

Desde el punto de vista de diseño se priorizó:

- **Separación de responsabilidades**: arquitectura por capas en el servidor (`routes` / `controllers` / `middleware` / `config`) y agrupación por dominios en el cliente.
- **Seguridad por defecto**: contraseñas con `bcrypt`, sesiones manejadas con `express-session`, `helmet`, limitador de peticiones y consultas SQL parametrizadas.
- **Integridad de datos**: las operaciones críticas (reservas, horarios) se ejecutan dentro de transacciones con bloqueo de filas para evitar conflictos en escrituras concurrentes.
- **Un solo lenguaje**: TypeScript de extremo a extremo reduce los errores de contrato entre cliente y servidor.

## Funcionalidades

- **Autenticación y control de acceso por roles**: inicio de sesión con sesión de servidor, registro, perfil y recuperación de contraseña mediante token temporal con expiración. Los middleware `isAuthenticated` e `isAdmin` protegen las rutas de la API.
- **Gestión de escenarios y espacios**: CRUD de sedes deportivas y de los espacios reservables de cada sede (cada sede nueva crea un espacio `PRINCIPAL` por defecto). El borrado está restringido por integridad referencial.
- **Reservas**: calendario interactivo (FullCalendar) con creación, edición y cancelación. El backend valida el solapamiento de bloques horarios dentro de una transacción (`SELECT ... FOR UPDATE`) y devuelve `409` ante conflictos. Estados: `PENDIENTE`, `CONFIRMADA`, `RECHAZADA`, `CANCELADA`, `FINALIZADA`. Las reservas creadas por usuarios `empleado` quedan pendientes de aprobación por un `admin`.
- **Horarios de personal**: malla semanal de gestores por escenario (lunes a domingo), navegación entre semanas y vista por escenario o gestor. Incluye importación y exportación de archivos Excel (`.xlsx`) con estilos aplicados a la hoja.
- **Novedades**: registro de reportes o incidentes asociados a un escenario, con adjunto y seguimiento de estado.
- **Panel institucional**: secciones informativas por dependencia (cultura, fomento deportivo, actividad física).

### Roles de acceso

| Rol | Alcance |
| --- | --- |
| `admin` | Acceso total: gestión de escenarios, espacios y horarios, aprobación de reservas y cambio de estado. |
| `empleado` | Consulta de horarios y creación de reservas (quedan pendientes de aprobación), reporte de novedades. |

---

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, React Router, FullCalendar, Axios, TypeScript |
| Backend | Node.js, Express 5, express-session, MySQL2 (pool de conexiones), TypeScript |
| Seguridad y utilidades | Helmet, CORS, express-rate-limit, express-validator, morgan, bcrypt |
| Reportes | Excel: `xlsx-js-style` (exportación) y `xlsx` (importación) |
| Base de datos | MySQL 8.0+ / MariaDB 10.5+ |

---

## Estructura del proyecto

```
pgd/
├── client/                    # SPA React + Vite (TypeScript)
│   └── src/
│       ├── context/           # Estado global de autenticación (AuthContext)
│       ├── features/          # Módulos de la aplicación, agrupados por dominio
│       │   ├── auth/          #   Login, registro, perfil, recuperación de contraseña
│       │   ├── dashboard/     #   Panel y secciones institucionales
│       │   └── escenarios/    #   Reservas, horarios de gestores, novedades
│       ├── shared/            # Layout compartido
│       ├── types/             # Tipos de dominio compartidos (horario.ts)
│       └── utils/             # Exportación a Excel, utilidades de texto
├── server/                    # API Express (TypeScript)
│   └── src/
│       ├── config/            # Pool de conexiones e inicialización de esquema (initDb)
│       ├── controllers/       # Lógica de negocio por recurso
│       ├── middleware/        # auth, errorHandler, rateLimiter, validators
│       ├── routes/            # Definición de endpoints REST
│       └── tests/             # Pruebas de integración (Jest + Supertest)
├── data/                      # Scripts SQL: esquema, migraciones, seeds y respaldos
├── docs/                      # Documentación técnica y de usuario
├── package.json               # Scripts y dependencias del servidor
└── tsconfig.json              # Compilación TypeScript del servidor
```

---

## Requisitos previos

| Componente | Versión | Verificación |
| --- | --- | --- |
| Node.js | 18.x LTS o superior | `node --version` |
| npm | 9.x o superior | `npm --version` |
| MySQL o MariaDB | 8.0+ / 10.5+ | `mysql --version` |

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd pgd
```

### 2. Configurar variables de entorno

Los scripts se ejecutan desde la raíz del proyecto y `dotenv` lee el archivo `.env` de ese directorio. El archivo `.env` no se versiona (ver `.gitignore`).

```bash
cp server/.env.example .env
```

Edite `.env` con los datos de su entorno:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=login_user
DB_PASSWORD=<contraseña_mysql>
DB_NAME=login_db
DB_CONN_LIMIT=10

# Servidor
PORT=3000
SESSION_SECRET=<clave_aleatoria_de_al_menos_32_caracteres>
ADMIN_PWD=<contraseña_del_admin_inicial>
```

> El valor de `SESSION_SECRET` debe ser una cadena aleatoria. Puede generarla con `openssl rand -hex 32`.
> `ADMIN_PWD` define la contraseña del usuario administrador que se crea en el primer arranque (ver paso 4).

### 3. Crear la base de datos

Solo es necesario crear la base de datos y el usuario. Las tablas se crean automáticamente en el primer arranque del servidor (`initDb`).

```sql
CREATE DATABASE login_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'login_user'@'localhost' IDENTIFIED BY '<su_contraseña>';
GRANT ALL PRIVILEGES ON login_db.* TO 'login_user'@'localhost';
FLUSH PRIVILEGES;
```

Si parte de una base existente, la carpeta `data/` contiene el esquema v2 (`schema_v2.sql`), la migración desde v1 (`migracion_v1_to_v2.sql`), los datos de referencia (`setup_reservas.sql`) y un respaldo (`login_db_backup.sql`).

### 4. Instalar dependencias

```bash
# Dependencias del servidor (raíz del proyecto)
npm install

# Dependencias del cliente
npm install --prefix client
```

### 5. Iniciar en modo desarrollo

```bash
npm run dev
```

Este comando levanta ambos procesos de forma concurrente:

- Servidor API en `http://localhost:3000` (recarga automática con `nodemon`).
- Cliente en `http://localhost:5173` (Vite dev server, con proxy de `/api` hacia el backend).

En el primer arranque se crean las tablas y el usuario administrador inicial:

- Correo: `admin@test.com`
- Contraseña: la definida en `ADMIN_PWD`

---

## Ejecutar por componentes

Solo servidor:

```bash
npm run server
```

Solo cliente:

```bash
npm run client
```

## Modo producción

1. Compilar el servidor (TypeScript a `dist/`):

```bash
npm run build
```

2. Compilar el frontend:

```bash
npm run build --prefix client
```

3. Iniciar el servidor. En producción Express sirve además el build estático del cliente y las subidas de archivos:

```bash
npm start
```

La aplicación quedará disponible en `http://localhost:3000`.

---

## Scripts disponibles

| Script | Comando | Descripción |
| --- | --- | --- |
| `dev` | `npm run dev` | Inicia servidor y cliente en modo desarrollo (concurrentemente). |
| `server` | `npm run server` | Inicia solo el servidor con recarga automática. |
| `client` | `npm run client` | Inicia solo el cliente (Vite). |
| `build` | `npm run build` | Compila el servidor TypeScript a `dist/`. |
| `start` | `npm start` | Ejecuta el servidor compilado en modo producción. |
| `lint` | `npm run lint --prefix client` | Verifica el estilo del código del cliente con ESLint. |

---

## Documentación

La carpeta `docs/` contiene documentación detallada:

- `ARCHITECTURE.md` - Arquitectura de alto nivel y diagrama de componentes.
- `DATABASE.md` - Diagrama entidad-relación y diccionario de datos.
- `USE_CASES.md` - Casos de uso por rol.
- `SEQUENCE.md` - Diagramas de secuencia de los flujos principales.
- `MANUAL_TECNICO.md` - Manual de instalación y despliegue en servidor.
- `MANUAL_USUARIO.md` - Manual de uso del sistema.
- `MANUAL_ESCENARIOS.md` - Cómo administrar escenarios y su visibilidad en horarios.
- `INFORME_REDUNDANCIAS.md` - Notas sobre el modelo de datos.

---

## Licencia

Este proyecto se distribuye bajo la licencia ISC.
