const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware для обработки результатов валидации
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Ошибка валидации данных',
            code: 'VALIDATION_ERROR',
            details: errors.array()
        });
    }
    next();
};

/**
 * Валидация для логина
 */
const validateLogin = [
    body('username')
        .notEmpty()
        .withMessage('Имя пользователя обязательно')
        .isLength({ min: 3, max: 50 })
        .withMessage('Имя пользователя должно быть от 3 до 50 символов'),
    body('password')
        .notEmpty()
        .withMessage('Пароль обязателен')
        .isLength({ min: 6 })
        .withMessage('Пароль должен содержать минимум 6 символов'),
    handleValidationErrors
];

/**
 * Валидация для регистрации
 */
const validateRegistration = [
    body('username')
        .notEmpty()
        .withMessage('Имя пользователя обязательно')
        .isLength({ min: 3, max: 50 })
        .withMessage('Имя пользователя должно быть от 3 до 50 символов')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Имя пользователя может содержать только буквы, цифры и подчёркивания'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Пароль должен содержать минимум 8 символов')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру'),
    body('role')
        .isIn(['admin', 'editor', 'user'])
        .withMessage('Недопустимая роль пользователя'),
    handleValidationErrors
];

/**
 * Валидация для работника
 */
const validateWorker = [
    body('name')
        .notEmpty()
        .withMessage('Имя обязательно')
        .isLength({ min: 2, max: 45 })
        .withMessage('Имя должно быть от 2 до 45 символов')
        .matches(/^[а-яА-Я\s-]+$/u)
        .withMessage('Имя может содержать только русские буквы, пробелы и дефисы'),
    body('fam')
        .notEmpty()
        .withMessage('Фамилия обязательна')
        .isLength({ min: 2, max: 45 })
        .withMessage('Фамилия должна быть от 2 до 45 символов')
        .matches(/^[а-яА-Я\s-]+$/u)
        .withMessage('Фамилия может содержать только русские буквы, пробелы и дефисы'),
    body('otch')
        .optional()
        .isLength({ min: 2, max: 45 })
        .withMessage('Отчество должно быть от 2 до 45 символов')
        .matches(/^[а-яА-Я\s-]+$/u)
        .withMessage('Отчество может содержать только русские буквы, пробелы и дефисы'),
    body('salary')
        .isNumeric()
        .withMessage('Зарплата должна быть числом')
        .isFloat({ min: 0 })
        .withMessage('Зарплата не может быть отрицательной'),
    body('date_r')
        .optional()
        .isISO8601()
        .withMessage('Дата рождения должна быть в формате YYYY-MM-DD'),
    body('date_hired')
        .optional()
        .isISO8601()
        .withMessage('Дата найма должна быть в формате YYYY-MM-DD'),
    handleValidationErrors
];

/**
 * Валидация ID параметра
 */
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID должен быть положительным числом'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateLogin,
    validateRegistration,
    validateWorker,
    validateId
};