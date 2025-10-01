const logger = require('../utils/logger');

/**
 * Middleware для логирования HTTP запросов
 */
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    
    // Перехватываем завершение ответа
    const originalEnd = res.end;
    res.end = function(...args) {
        const responseTime = Date.now() - startTime;
        
        // Логируем запрос
        logger.http(req, res, responseTime);
        
        // Вызываем оригинальный метод
        originalEnd.apply(this, args);
    };
    
    next();
};

module.exports = requestLogger;