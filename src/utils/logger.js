const fs = require('fs');
const path = require('path');

// Создаём директорию для логов если её нет
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Уровни логирования
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

const LOG_LEVEL_NAMES = {
    0: 'ERROR',
    1: 'WARN',
    2: 'INFO',
    3: 'DEBUG'
};

const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL] || LOG_LEVELS.INFO;

/**
 * Форматирование времени
 */
const formatTime = () => {
    return new Date().toISOString();
};

/**
 * Форматирование сообщения лога
 */
const formatMessage = (level, message, meta = {}) => {
    const timestamp = formatTime();
    const levelName = LOG_LEVEL_NAMES[level];
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    
    return `[${timestamp}] ${levelName}: ${message} ${metaStr}\n`;
};

/**
 * Запись в файл
 */
const writeToFile = (filename, message) => {
    const filePath = path.join(logsDir, filename);
    fs.appendFileSync(filePath, message, 'utf8');
};

/**
 * Основная функция логирования
 */
const log = (level, message, meta = {}) => {
    if (level > currentLogLevel) return;
    
    const formattedMessage = formatMessage(level, message, meta);
    
    // В консоль
    console.log(formattedMessage.trim());
    
    // В файлы
    const date = new Date().toISOString().split('T')[0];
    writeToFile(`app-${date}.log`, formattedMessage);
    
    // Ошибки в отдельный файл
    if (level === LOG_LEVELS.ERROR) {
        writeToFile(`error-${date}.log`, formattedMessage);
    }
};

/**
 * Публичный API
 */
const logger = {
    error: (message, meta = {}) => log(LOG_LEVELS.ERROR, message, meta),
    warn: (message, meta = {}) => log(LOG_LEVELS.WARN, message, meta),
    info: (message, meta = {}) => log(LOG_LEVELS.INFO, message, meta),
    debug: (message, meta = {}) => log(LOG_LEVELS.DEBUG, message, meta),
    
    // Логирование HTTP запросов
    http: (req, res, responseTime) => {
        const meta = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            userId: req.user?.id || null,
            userRole: req.user?.role || null
        };
        
        const message = `${req.method} ${req.url} ${res.statusCode} - ${responseTime}ms`;
        
        if (res.statusCode >= 400) {
            logger.error(message, meta);
        } else {
            logger.info(message, meta);
        }
    },
    
    // Логирование аутентификации
    auth: (action, username, success, ip, meta = {}) => {
        const message = `AUTH ${action}: ${username} - ${success ? 'SUCCESS' : 'FAILED'}`;
        const logMeta = {
            action,
            username,
            success,
            ip,
            ...meta
        };
        
        if (success) {
            logger.info(message, logMeta);
        } else {
            logger.warn(message, logMeta);
        }
    },
    
    // Логирование операций с базой данных
    database: (operation, table, success, meta = {}) => {
        const message = `DB ${operation}: ${table} - ${success ? 'SUCCESS' : 'FAILED'}`;
        const logMeta = {
            operation,
            table,
            success,
            ...meta
        };
        
        if (success) {
            logger.debug(message, logMeta);
        } else {
            logger.error(message, logMeta);
        }
    }
};

module.exports = logger;