const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function exportUsers() {
  try {
    // 1️⃣ Conectar a MySQL
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'login_user',      // tu usuario MySQL
      password: '1234',        // tu contraseña
      database: 'login_db'     // tu base de datos
    });

    // 2️⃣ Obtener los datos de la tabla users
    const [rows] = await connection.execute('SELECT id, email, password FROM users');

    // 3️⃣ Cerrar la conexión
    await connection.end();

    // 4️⃣ Crear cabecera CSV
    const header = 'id,email,password';

    // 5️⃣ Convertir filas a CSV
    const csvRows = rows.map(r => `${r.id},"${r.email}","${r.password}"`);

    // 6️⃣ Combinar cabecera + filas
    const csv = [header, ...csvRows].join('\n');

    // 7️⃣ Guardar en archivo (usar ruta absoluta relativa al repo)
    const dataDir = path.join(__dirname, '..', 'data');
    fs.mkdirSync(dataDir, { recursive: true });
    const filename = path.join(dataDir, 'users.csv');
    fs.writeFileSync(filename, csv);

    console.log(`✅ Exportación completada: ${filename}`);

  } catch (err) {
    console.error('❌ Error al exportar:', err);
  }
}

exportUsers();
