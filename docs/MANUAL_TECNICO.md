# Manual Técnico - Sistema PGD

## 1. Requisitos del Sistema

### Hardware Mínimo (Servidor)
- CPU: 2 Cores (2.0 GHz+)
- RAM: 4 GB
- Almacenamiento: 20 GB SSD
- Red: Conexión estable a internet (para instalación de paquetes)

### Software
- Sistema Operativo: Linux (Ubuntu 20.04/22.04 LTS recomendado) o Windows 10/11.
- Node.js: Versión 18.x o superior (LTS).
- Base de Datos: MySQL 8.0+.
- Gestor de Paquetes: npm (incluido con Node.js).

## 2. Guía de Instalación y Despliegue

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/pgd-project.git
cd pgd-project
```

### Paso 2: Configuración de Base de Datos
1. Acceder a MySQL y crear la base de datos:
   ```sql
   CREATE DATABASE login_db;
   CREATE USER 'login_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
   GRANT ALL PRIVILEGES ON login_db.* TO 'login_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
2. Ejecutar scripts de inicialización (si existen) o permitir que el servidor NodeJS cree las tablas automáticamente mediante `initDb()`.

### Paso 3: Configuración de Entorno (Importante)
Copiar el archivo de ejemplo y configurar las credenciales:
```bash
cp server/.env.example server/.env
```
Editar `server/.env`:
```env
DB_HOST=localhost
DB_USER=login_user
DB_PASSWORD=tu_password_seguro
DB_NAME=login_db
SESSION_SECRET=clave_secreta_generada_aleatoriamente
```

### Paso 4: Instalación de Dependencias
```bash
# Servidor
cd server
npm install

# Cliente
cd ../client
npm install
```

### Paso 5: Ejecución
Modo Desarrollo:
Desde la raíz del proyecto:
```bash
npm run dev
```

Modo Producción:
1. Construir el frontend:
   ```bash
   cd client
   npm run build
   ```
2. Iniciar el servidor (que servirá el build de React):
   ```bash
   cd ../server
   NODE_ENV=production node index.js
   ```

## 3. Mantenimiento

### Logs
- El servidor imprime logs en consola (`stdout`). Se recomienda usar `pm2` para gestión de procesos y rotación de logs en producción.

### Respaldo (Backup)
- Realizar dumps periódicos de la base de datos:
  ```bash
  mysqldump -u login_user -p login_db > backup_$(date +%F).sql
  ```

## 4. Estructura de Directorios
- `/client`: Código fuente del Frontend (React).
- `/server`: Código fuente del Backend (Node.js).
- `/docs`: Documentación técnica y diagramas.
