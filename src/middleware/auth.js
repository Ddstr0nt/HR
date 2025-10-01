const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

/**
 * Middleware для проверки JWT токена
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : authHeader;

    if (!token) {
        return res.status(401).json({ 
            error: 'Токен доступа отсутствует',
            code: 'TOKEN_MISSING' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                error: 'Недействительный или истёкший токен',
                code: 'TOKEN_INVALID' 
            });
        }
        req.user = user;
        next();
    });
};

/**
 * Middleware для проверки ролей пользователя
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Пользователь не аутентифицирован',
                code: 'USER_NOT_AUTHENTICATED' 
            });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ 
                error: 'Недостаточно прав для выполнения этого действия',
                code: 'INSUFFICIENT_PERMISSIONS',
                required: allowedRoles,
                current: userRole
            });
        }
        
        next();
    };
};

/**
 * Middleware только для админов
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware для админов и редакторов
 */
const requireEditor = requireRole(['admin', 'editor']);

module.exports = {
    authenticateToken,
    requireRole,
    requireAdmin,
    requireEditor
};