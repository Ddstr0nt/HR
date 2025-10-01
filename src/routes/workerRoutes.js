const express = require('express');
const router = express.Router();
const {
    getAllWorkers,
    getWorkerById,
    createWorker,
    updateWorker,
    deleteWorker,
    getWorkersCount
} = require('../controllers/workerController');
const { validateWorker, validateId } = require('../middleware/validation');
const { authenticateToken, requireEditor } = require('../middleware/auth');

// Все маршруты требуют аутентификации
router.use(authenticateToken);

// Получение списка работников (доступно всем авторизованным)
router.get('/', getAllWorkers);
router.get('/count', getWorkersCount);

// Получение конкретного работника
router.get('/:id', validateId, getWorkerById);

// Создание, обновление и удаление - только для редакторов и админов
router.post('/', requireEditor, validateWorker, createWorker);
router.put('/:id', requireEditor, validateId, validateWorker, updateWorker);
router.delete('/:id', requireEditor, validateId, deleteWorker);

module.exports = router;