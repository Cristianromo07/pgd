# Plataforma de Gestión Deportiva 🏟️🏃‍♂️

Una solución web integral diseñada para la administración y promoción de actividades deportivas, escenarios y bienestar para los usuarios. Este sistema permite a los usuarios registrarse, explorar ofertas deportivas, consultar horarios y mantenerse informados sobre las últimas novedades del mundo deportivo.

## 🚀 Características Principales

- **Autenticación Segura**: Sistema de Login y Registro de usuarios con encriptación de contraseñas (`bcrypt`).
- **Panel de Control (Dashboard)**: Acceso centralizado a todas las funcionalidades del sistema.
- **Gestión de Escenarios**: Visualización y gestión de escenarios deportivos disponibles para reserva o uso.
- **Oferta de Actividades**: Catálogo de actividades deportivas programadas.
- **Noticias y Novedades**: Sección para mantener a los usuarios actualizados con eventos y comunicados.
- **Perfil de Usuario**: Gestión de información personal del usuario.
- **Diseño Responsivo**: Interfaz moderna adaptable a diferentes dispositivos, estilizada con CSS funcional y dinámico.

## 🛠️ Tecnologías Utilizadas

Este proyecto utiliza un stack tecnológico robusto y moderno:

*   **Backend**: [Node.js](https://nodejs.org/) con [Express.js](https://expressjs.com/).
*   **Base de Datos**: [MySQL](https://www.mysql.com/) (conectado mediante `mysql2`).
*   **Seguridad**: `bcrypt` para hashing de contraseñas y `express-session` para manejo de sesiones.
*   **Frontend**: HTML5, CSS3 y JavaScript (Vanilla) para una experiencia de usuario fluida.

## 📋 Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu sistema:

*   [Node.js](https://nodejs.org/) (v14 o superior)
*   [MySQL Server](https://dev.mysql.com/downloads/mysql/)

## ⚙️ Instalación y Configuración

Sigue estos pasos para poner en marcha el proyecto localmente:

1.  **Clonar el repositorio** (o descargar los archivos):
    ```bash
    git clone <url-del-repositorio>
    cd login-backend
    ```

2.  **Instalar dependencias**:
    Ejecuta el siguiente comando para instalar las librerías necesarias listadas en `package.json`:
    ```bash
    npm install
    ```

3.  **Configurar Base de Datos**:
    *   Crea una base de datos en MySQL llamada `login_db`.
    *   Importa el archivo `login_db_backup.sql` incluido en el proyecto para crear la tabla de usuarios y datos iniciales:
        ```bash
        mysql -u tu_usuario -p login_db < login_db_backup.sql
        ```
    *   *(Opcional)* Si prefieres hacerlo manualmente, asegúrate de tener una tabla `users` con columnas `id`, `email`, y `password`.

4.  **Configurar Credenciales**:
    Abre el archivo `server.js` y actualiza el objeto `dbConfig` con tus credenciales locales de MySQL:
    ```javascript
    const dbConfig = {
      host: 'localhost',
      user: 'tu_usuario_mysql', // Ej: 'root'
      password: 'tu_contraseña',
      database: 'login_db'
    };
    ```

5.  **Ejecutar el Servidor**:
    Inicia la aplicación con:
    ```bash
    node server.js
    ```
    Verás un mensaje indicando que el servidor está escuchando en el puerto 3000.

6.  **Acceder a la Aplicación**:
    Abre tu navegador y ve a:
    `http://localhost:3000`

## 📂 Estructura del Proyecto

*   `server.js`: Punto de entrada del servidor, configuración de rutas y lógica de backend.
*   `public/`: Archivos estáticos como `style.css` y scripts del lado del cliente.
*   `*.html`: Vistas de la aplicación (Login, Registro, Dashboard, Perfil, etc.).
*   `login_db_backup.sql`: Script SQL para inicializar la base de datos.

## 🤝 Contribución

Si deseas contribuir a mejorar, ¡eres bienvenido! Por favor, abre un issue o envía un pull request.

---
*Desarrollado para potenciar el deporte y la salud.* 
