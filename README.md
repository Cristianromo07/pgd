# Plataforma de Gestión Deportiva

Proyecto web para la administración de escenarios deportivos, reservas y novedades. Permite a los usuarios registrarse, gestionar reservas y a los administradores administrar escenarios y reportes.

## 🚀 Características Principales

- **Autenticación Segura**: Sistema de Login y Registro de usuarios con encriptación de contraseñas (`bcrypt`).
- **Panel de Control (Dashboard)**: Acceso centralizado a todas las funcionalidades del sistema.
- **Gestión de Escenarios**: Visualización y gestión de escenarios deportivos disponibles para reserva o uso.
- **Oferta de Actividades**: Catálogo de actividades deportivas programadas.
- **Noticias y Novedades**: Sección para mantener a los usuarios actualizados con eventos y comunicados.
- **Perfil de Usuario**: Gestión de información personal del usuario.
- **Diseño Responsivo**: Interfaz moderna adaptable a diferentes dispositivos, estilizada con CSS funcional y dinámico.

## Tecnologías

## Requisitos

- Node.js v14+ (recomendado v16+)
- MySQL Server
- npm (o yarn)

Nota: los archivos de datos y backups se han movido a la carpeta `data/`. Los scripts útiles para exportar están en `scripts/`.

## Configuración y ejecución (desarrollo)

1. Clona el repositorio y sitúate en la raíz del proyecto:

```bash
git clone <URL_DEL_REPOSITORIO>
cd plataforma-gestion-deportiva
```

2. Instala dependencias del servidor:

```bash
npm install
```

3. Configura la base de datos MySQL y crea la base `login_db`. Puedes importar el esquema/seed reducido incluido en `data/setup_reservas.sql`, o el backup completo si lo tienes:

```bash
# crea la base (si no existe)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS login_db;"
# importa esquema y datos de ejemplo
mysql -u tu_usuario -p login_db < data/setup_reservas.sql
# (si tienes el backup completo) mysql -u tu_usuario -p login_db < data/login_db_backup.sql
```

4. Ajusta credenciales de la base de datos si es necesario en `server/index.js` (objeto `dbConfig`).

5. (Opcional) Ejecuta el frontend en modo desarrollo (puerta por defecto `5173`):

```bash
cd client
npm install
npm run dev
```

6. Ejecuta el servidor (desde la raíz del proyecto):

```bash
node server/index.js
```

El servidor sirve el frontend estático compilado desde `client/dist`. Para producción, ejecuta `npm run build` dentro de `client` y luego inicia el servidor.

## Credenciales por defecto

Al iniciar, el servidor crea o actualiza un usuario administrador por defecto:

- Email: `admin@test.com`
- Password: `admin123`

## Endpoints relevantes (resumen)

- `POST /api/login` — Iniciar sesión (body: `{ email, password }`).
- `GET /api/user-info` — Información de sesión actual.
- `GET /api/escenarios` — Lista de escenarios (requiere sesión).
- `GET /api/reservas` — Obtener reservas (acepta `escenario_id` como query param).
- `POST /api/reservas` — Crear reservas.
- `PUT /api/reservas/:id` — Actualizar reserva.
- `DELETE /api/reservas/:id` — Eliminar reserva.

## Pruebas rápidas con curl

```bash
# Login y almacenar cookies
curl -c cookies.txt -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{"email":"admin@test.com","password":"admin123"}'
# Usar cookies para solicitar escenarios
curl -b cookies.txt http://localhost:3000/api/escenarios
```

## Despliegue

- Construye el frontend en `client` con `npm run build` y sirve `client/dist` con el servidor Express (ya configurado para servir estáticos).
- Considera usar HTTPS y configurar `cookie.secure = true` en producción.
- Configura variables de entorno para credenciales y secretos (reemplazar el `secret` en `server/index.js`).

## Troubleshooting

- Error de conexión a MySQL: verifica `dbConfig` en `server/index.js` y que MySQL acepte conexiones desde `localhost`.
- Rutas 404 en producción: asegúrate de haber compilado el frontend (`client/dist`) antes de iniciar el servidor.
- Problemas de sesiones: revisa `withCredentials` en llamadas desde el frontend y que el dominio/puerto coincidan.

## Contribuciones

Abre issues para bugs o mejoras y envía pull requests con descripciones claras. Mantén consistencia en estilo y linter (`npm run lint` desde `client`).

---

Si quieres, puedo:

- Añadir badges de CI/coverage.
- Crear un archivo `.env.example` y leer variables desde `process.env`.
- Preparar un script de inicio (`npm run start`) y un `Procfile` para despliegue.



Si deseas contribuir a mejorar, ¡eres bienvenido! Por favor, abre un issue o envía un pull request.

---
*Desarrollado para potenciar el deporte y la salud.* 
