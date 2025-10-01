const mysql = require('mysql2');
require('dotenv').config();

// Создание пула соединений для лучшей производительности
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ok',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
});

// Проверка подключения
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Ошибка подключения к базе данных:', err.message);
        return;
    }
    console.log('✅ Подключение к базе данных успешно установлено!');
    connection.release();
});

// Промисифицированная версия для async/await
const promisePool = pool.promise();

module.exports = {
    pool,
    promisePool
};