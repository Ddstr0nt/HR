const { promisePool } = require('../config/database');

/**
 * Получение всей истории действий
 */
const getAllHistory = async (req, res) => {
    try {
        const query = `
            SELECT l.*, w.name as worker_name, w.fam as worker_fam, w.otch as worker_otch,
                   a.name as action_name
            FROM list l
            LEFT JOIN workers w ON l.workers_id = w.id
            LEFT JOIN actions a ON l.actions_id = a.id
            ORDER BY l.date DESC, l.id DESC
        `;
        
        const [history] = await promisePool.execute(query);
        
        // Форматируем данные для удобства использования
        const formattedHistory = history.map(item => ({
            ...item,
            worker_full_name: [item.worker_fam, item.worker_name, item.worker_otch]
                .filter(Boolean)
                .join(' ')
        }));
        
        res.json({
            success: true,
            data: formattedHistory,
            count: formattedHistory.length
        });
    } catch (error) {
        console.error('Ошибка при получении истории:', error);
        res.status(500).json({
            error: 'Ошибка при получении истории действий',
            code: 'FETCH_HISTORY_ERROR'
        });
    }
};

/**
 * Получение истории по ID
 */
const getHistoryById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT l.*, w.name as worker_name, w.fam as worker_fam, w.otch as worker_otch,
                   a.name as action_name
            FROM list l
            LEFT JOIN workers w ON l.workers_id = w.id
            LEFT JOIN actions a ON l.actions_id = a.id
            WHERE l.id = ?
        `;
        
        const [history] = await promisePool.execute(query, [id]);
        
        if (history.length === 0) {
            return res.status(404).json({
                error: 'Запись истории не найдена',
                code: 'HISTORY_NOT_FOUND'
            });
        }
        
        const item = history[0];
        const formattedItem = {
            ...item,
            worker_full_name: [item.worker_fam, item.worker_name, item.worker_otch]
                .filter(Boolean)
                .join(' ')
        };
        
        res.json({
            success: true,
            data: formattedItem
        });
    } catch (error) {
        console.error('Ошибка при получении записи истории:', error);
        res.status(500).json({
            error: 'Ошибка при получении записи истории',
            code: 'FETCH_HISTORY_ERROR'
        });
    }
};

/**
 * Создание новой записи истории
 */
const createHistory = async (req, res) => {
    try {
        const { workers_id, actions_id, sum, date } = req.body;
        
        // Проверяем обязательные поля
        if (!workers_id || !actions_id || !sum) {
            return res.status(400).json({
                error: 'Поля workers_id, actions_id и sum обязательны для заполнения',
                code: 'REQUIRED_FIELDS_MISSING'
            });
        }
        
        // Проверяем существование работника
        const [worker] = await promisePool.execute('SELECT id FROM workers WHERE id = ?', [workers_id]);
        if (worker.length === 0) {
            return res.status(404).json({
                error: 'Работник не найден',
                code: 'WORKER_NOT_FOUND'
            });
        }
        
        // Проверяем существование действия
        const [action] = await promisePool.execute('SELECT id FROM actions WHERE id = ?', [actions_id]);
        if (action.length === 0) {
            return res.status(404).json({
                error: 'Тип действия не найден',
                code: 'ACTION_NOT_FOUND'
            });
        }
        
        const [result] = await promisePool.execute(
            'INSERT INTO list (workers_id, actions_id, sum, date) VALUES (?, ?, ?, ?)',
            [workers_id, actions_id, sum, date || new Date().toISOString().split('T')[0]]
        );
        
        // Получаем созданную запись с полной информацией
        const [newHistory] = await promisePool.execute(`
            SELECT l.*, w.name as worker_name, w.fam as worker_fam, w.otch as worker_otch,
                   a.name as action_name
            FROM list l
            LEFT JOIN workers w ON l.workers_id = w.id
            LEFT JOIN actions a ON l.actions_id = a.id
            WHERE l.id = ?
        `, [result.insertId]);
        
        const item = newHistory[0];
        const formattedItem = {
            ...item,
            worker_full_name: [item.worker_fam, item.worker_name, item.worker_otch]
                .filter(Boolean)
                .join(' ')
        };
        
        res.status(201).json({
            success: true,
            message: 'Запись истории успешно создана',
            data: formattedItem
        });
    } catch (error) {
        console.error('Ошибка при создании записи истории:', error);
        res.status(500).json({
            error: 'Ошибка при создании записи истории',
            code: 'CREATE_HISTORY_ERROR'
        });
    }
};

/**
 * Обновление записи истории
 */
const updateHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { workers_id, actions_id, sum, date } = req.body;
        
        // Проверяем существование записи
        const [existing] = await promisePool.execute('SELECT id FROM list WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                error: 'Запись истории не найдена',
                code: 'HISTORY_NOT_FOUND'
            });
        }
        
        // Проверяем обязательные поля
        if (!workers_id || !actions_id || !sum) {
            return res.status(400).json({
                error: 'Поля workers_id, actions_id и sum обязательны для заполнения',
                code: 'REQUIRED_FIELDS_MISSING'
            });
        }
        
        // Проверяем существование работника
        const [worker] = await promisePool.execute('SELECT id FROM workers WHERE id = ?', [workers_id]);
        if (worker.length === 0) {
            return res.status(404).json({
                error: 'Работник не найден',
                code: 'WORKER_NOT_FOUND'
            });
        }
        
        // Проверяем существование действия
        const [action] = await promisePool.execute('SELECT id FROM actions WHERE id = ?', [actions_id]);
        if (action.length === 0) {
            return res.status(404).json({
                error: 'Тип действия не найден',
                code: 'ACTION_NOT_FOUND'
            });
        }
        
        await promisePool.execute(
            'UPDATE list SET workers_id = ?, actions_id = ?, sum = ?, date = ? WHERE id = ?',
            [workers_id, actions_id, sum, date, id]
        );
        
        // Получаем обновленную запись
        const [updatedHistory] = await promisePool.execute(`
            SELECT l.*, w.name as worker_name, w.fam as worker_fam, w.otch as worker_otch,
                   a.name as action_name
            FROM list l
            LEFT JOIN workers w ON l.workers_id = w.id
            LEFT JOIN actions a ON l.actions_id = a.id
            WHERE l.id = ?
        `, [id]);
        
        const item = updatedHistory[0];
        const formattedItem = {
            ...item,
            worker_full_name: [item.worker_fam, item.worker_name, item.worker_otch]
                .filter(Boolean)
                .join(' ')
        };
        
        res.json({
            success: true,
            message: 'Запись истории успешно обновлена',
            data: formattedItem
        });
    } catch (error) {
        console.error('Ошибка при обновлении записи истории:', error);
        res.status(500).json({
            error: 'Ошибка при обновлении записи истории',
            code: 'UPDATE_HISTORY_ERROR'
        });
    }
};

/**
 * Удаление записи истории
 */
const deleteHistory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Проверяем существование записи
        const [existing] = await promisePool.execute('SELECT id FROM list WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                error: 'Запись истории не найдена',
                code: 'HISTORY_NOT_FOUND'
            });
        }
        
        await promisePool.execute('DELETE FROM list WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Запись истории успешно удалена'
        });
    } catch (error) {
        console.error('Ошибка при удалении записи истории:', error);
        res.status(500).json({
            error: 'Ошибка при удалении записи истории',
            code: 'DELETE_HISTORY_ERROR'
        });
    }
};

/**
 * Получение количества записей истории
 */
const getHistoryCount = async (req, res) => {
    try {
        const [result] = await promisePool.execute('SELECT COUNT(*) as count FROM list');
        
        res.json({
            success: true,
            count: result[0].count
        });
    } catch (error) {
        console.error('Ошибка при подсчёте записей истории:', error);
        res.status(500).json({
            error: 'Ошибка при подсчёте записей истории',
            code: 'COUNT_HISTORY_ERROR'
        });
    }
};

module.exports = {
    getAllHistory,
    getHistoryById,
    createHistory,
    updateHistory,
    deleteHistory,
    getHistoryCount
};