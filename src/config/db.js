const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'mysql' : 'localhost'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ok',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
});

// Safe log of DB config (no password)
console.log('DB config:', {
  host: db.config.host,
  port: db.config.port,
  user: db.config.user,
  database: db.config.database
});

db.connect(err => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
    return;
  }
  console.log('Подключение к базе данных успешно!');
});

module.exports = { db };


