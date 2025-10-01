const express = require('express');
const router = express.Router();
const {
    getAllHistory,
    getHistoryById,
    createHistory,
    updateHistory,
    deleteHistory,
    getHistoryCount
} = require('../controllers/historyController');
const { validateId } = require('../middleware/validation');
const { authenticateToken, requireEditor } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Валидация для создания/обновления истории
const validateHistory = [
    body('workers_id')
        .isInt({ min: 1 })
        .withMessage('workers_id должен быть положительным числом'),
    body('actions_id')
        .isInt({ min: 1 })
        .withMessage('actions_id должен быть положительным числом'),
    body('sum')
        .isNumeric()
        .withMessage('sum должен быть числом')
        .isFloat({ min: 0 })
        .withMessage('sum не может быть отрицательным'),
    body('date')
        .optional()
        .isISO8601()
        .withMessage('date должна быть в формате YYYY-MM-DD'),
    handleValidationErrors
];

// Все маршруты требуют аутентификации
router.use(authenticateToken);

// Получение списка истории и количества (доступно всем авторизованным)
router.get('/', getAllHistory);
router.get('/count', getHistoryCount);

// Получение конкретной записи истории
router.get('/:id', validateId, getHistoryById);

// Создание, обновление и удаление - только для редакторов и админов
router.post('/', requireEditor, validateHistory, createHistory);
router.put('/:id', requireEditor, validateId, validateHistory, updateHistory);
router.delete('/:id', requireEditor, validateId, deleteHistory);

module.exports = router;