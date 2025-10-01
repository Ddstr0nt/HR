const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Импорт маршрутов
const authRoutes = require('./src/routes/authRoutes');
const workerRoutes = require('./src/routes/workerRoutes');
const referenceRoutes = require('./src/routes/referenceRoutes');
const historyRoutes = require('./src/routes/historyRoutes');

// Импорт конфигурации базы данных для инициализации соединения
require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка логирования
app.use(morgan('combined'));

// Безопасность
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Ограничение скорости запросов
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 минут
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        error: 'Превышено максимальное количество запросов. Попробуйте позже.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
app.use('/login', limiter);
app.use('/register', limiter);

// Сжатие ответов
app.use(compression());

// CORS
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// API маршруты
app.use('/', authRoutes);
app.use('/workers', workerRoutes);
app.use('/api', referenceRoutes);
app.use('/list', historyRoutes);

// Совместимость со старыми маршрутами (можно удалить после обновления фронтенда)
app.use('/history', historyRoutes);

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Обработка 404 ошибок
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Маршрут не найден',
        code: 'ROUTE_NOT_FOUND',
        path: req.originalUrl
    });
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
    console.error('Глобальная ошибка:', err);
    
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Внутренняя ошибка сервера' 
            : err.message,
        code: 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('💀 Получен сигнал SIGTERM, корректно завершаем работу...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('💀 Получен сигнал SIGINT, корректно завершаем работу...');
    process.exit(0);
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📝 Режим: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Безопасность: Helmet, Rate Limiting, CORS настроены`);
});