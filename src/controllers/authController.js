const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { promisePool } = require('../config/database');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Вход пользователя
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Поиск пользователя в базе данных
        const [rows] = await promisePool.execute(
            'SELECT id, username, password, role FROM users WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                error: 'Неверное имя пользователя или пароль',
                code: 'INVALID_CREDENTIALS'
            });
        }

        const user = rows[0];

        // Проверяем пароль (поддерживаем и старые MD5 хэши, и новые bcrypt)
        let isValidPassword = false;
        
        if (user.password.length === 32) {
            // Старый MD5 хэш
            const crypto = require('crypto');
            const md5Hash = crypto.createHash('md5').update(password).digest('hex');
            isValidPassword = user.password === md5Hash;
            
            // Если пароль правильный, обновляем его на bcrypt
            if (isValidPassword) {
                const saltRounds = 12;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                await promisePool.execute(
                    'UPDATE users SET password = ? WHERE id = ?',
                    [hashedPassword, user.id]
                );
            }
        } else {
            // Новый bcrypt хэш
            isValidPassword = await bcrypt.compare(password, user.password);
        }

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Неверное имя пользователя или пароль',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Создание JWT токена
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Ошибка при входе:', error);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            code: 'INTERNAL_ERROR'
        });
    }
};

/**
 * Регистрация нового пользователя
 */
const register = async (req, res) => {
    try {
        const { username, password, role, specialPassword } = req.body;

        // Проверяем специальные пароли для ролей
        const secretPasswords = {
            admin: process.env.ADMIN_SECRET || 'adminsecret',
            editor: process.env.EDITOR_SECRET || 'editorsecret'
        };

        if (role === 'admin' && specialPassword !== secretPasswords.admin) {
            return res.status(403).json({
                error: 'Неверный специальный пароль для роли admin',
                code: 'INVALID_SPECIAL_PASSWORD'
            });
        }
        
        if (role === 'editor' && specialPassword !== secretPasswords.editor) {
            return res.status(403).json({
                error: 'Неверный специальный пароль для роли editor',
                code: 'INVALID_SPECIAL_PASSWORD'
            });
        }

        // Проверяем, не существует ли пользователь с таким именем
        const [existingUsers] = await promisePool.execute(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                error: 'Пользователь с таким именем уже существует',
                code: 'USER_ALREADY_EXISTS'
            });
        }

        // Хэшируем пароль с помощью bcrypt
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Добавляем пользователя в базу данных
        const [result] = await promisePool.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]
        );

        res.status(201).json({
            success: true,
            message: 'Пользователь успешно зарегистрирован',
            user: {
                id: result.insertId,
                username,
                role
            }
        });
    } catch (error) {
        console.error('Ошибка при регистрации пользователя:', error);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            code: 'INTERNAL_ERROR'
        });
    }
};

/**
 * Получение информации о текущем пользователе
 */
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [rows] = await promisePool.execute(
            'SELECT id, username, role FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Пользователь не найден',
                code: 'USER_NOT_FOUND'
            });
        }

        res.json({
            success: true,
            user: rows[0]
        });
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            code: 'INTERNAL_ERROR'
        });
    }
};

/**
 * Проверка токена
 */
const verifyToken = (req, res) => {
    res.json({
        success: true,
        message: 'Токен действителен',
        user: req.user
    });
};

module.exports = {
    login,
    register,
    getCurrentUser,
    verifyToken
};