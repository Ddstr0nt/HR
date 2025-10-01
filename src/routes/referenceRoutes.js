const express = require('express');
const router = express.Router();
const { positions, professions, education, genders, actions } = require('../controllers/referenceController');
const { validateId } = require('../middleware/validation');
const { authenticateToken, requireEditor, requireAdmin } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Валидация для создания/обновления справочников
const validateReferenceName = [
    body('name')
        .notEmpty()
        .withMessage('Поле name обязательно')
        .isLength({ min: 2, max: 45 })
        .withMessage('Длина поля name должна быть от 2 до 45 символов')
        .trim(),
    handleValidationErrors
];

// Все маршруты требуют аутентификации
router.use(authenticateToken);

// === ДОЛЖНОСТИ ===
router.get('/positions', positions.getAll);
router.get('/positions/count', positions.getCount);
router.get('/positions/:id', validateId, positions.getById);
router.post('/positions', requireEditor, validateReferenceName, positions.create);
router.put('/positions/:id', requireEditor, validateId, validateReferenceName, positions.update);
router.delete('/positions/:id', requireAdmin, validateId, positions.remove);

// === ПРОФЕССИИ ===
router.get('/professions', professions.getAll);
router.get('/professions/count', professions.getCount);
router.get('/professions/:id', validateId, professions.getById);
router.post('/professions', requireEditor, validateReferenceName, professions.create);
router.put('/professions/:id', requireEditor, validateId, validateReferenceName, professions.update);
router.delete('/professions/:id', requireAdmin, validateId, professions.remove);

// === ОБРАЗОВАНИЕ ===
router.get('/education', education.getAll);
router.get('/education/count', education.getCount);
router.get('/education/:id', validateId, education.getById);
router.post('/education', requireEditor, validateReferenceName, education.create);
router.put('/education/:id', requireEditor, validateId, validateReferenceName, education.update);
router.delete('/education/:id', requireAdmin, validateId, education.remove);

// === ПОЛ ===
router.get('/genders', genders.getAll);
router.get('/genders/count', genders.getCount);
router.get('/genders/:id', validateId, genders.getById);
router.post('/genders', requireAdmin, validateReferenceName, genders.create);
router.put('/genders/:id', requireAdmin, validateId, validateReferenceName, genders.update);
router.delete('/genders/:id', requireAdmin, validateId, genders.remove);

// === ДЕЙСТВИЯ (премии/штрафы) ===
router.get('/actions', actions.getAll);
router.get('/actions/count', actions.getCount);
router.get('/actions/:id', validateId, actions.getById);
router.post('/actions', requireEditor, validateReferenceName, actions.create);
router.put('/actions/:id', requireEditor, validateId, validateReferenceName, actions.update);
router.delete('/actions/:id', requireAdmin, validateId, actions.remove);

module.exports = router;