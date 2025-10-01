const { promisePool } = require('../config/database');

/**
 * Получение всех работников с детальной информацией
 */
const getAllWorkers = async (req, res) => {
    try {
        const query = `
            SELECT w.*, g.name AS gender_name, p.name AS prof_name, 
                   pos.name AS position_name, e.name AS education_name
            FROM workers w
            LEFT JOIN gender g ON w.gender_id = g.id
            LEFT JOIN prof p ON w.prof_id = p.id
            LEFT JOIN position pos ON w.position_id = pos.id
            LEFT JOIN education e ON w.education_id = e.id
            ORDER BY w.id DESC
        `;
        
        const [workers] = await promisePool.execute(query);
        
        res.json({
            success: true,
            data: workers,
            count: workers.length
        });
    } catch (error) {
        console.error('Ошибка при получении работников:', error);
        res.status(500).json({
            error: 'Ошибка при получении списка работников',
            code: 'FETCH_WORKERS_ERROR'
        });
    }
};

/**
 * Получение конкретного работника по ID
 */
const getWorkerById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT w.*, g.name AS gender_name, p.name AS prof_name, 
                   pos.name AS position_name, e.name AS education_name
            FROM workers w
            LEFT JOIN gender g ON w.gender_id = g.id
            LEFT JOIN prof p ON w.prof_id = p.id
            LEFT JOIN position pos ON w.position_id = pos.id
            LEFT JOIN education e ON w.education_id = e.id
            WHERE w.id = ?
        `;
        
        const [workers] = await promisePool.execute(query, [id]);
        
        if (workers.length === 0) {
            return res.status(404).json({
                error: 'Работник не найден',
                code: 'WORKER_NOT_FOUND'
            });
        }
        
        res.json({
            success: true,
            data: workers[0]
        });
    } catch (error) {
        console.error('Ошибка при получении работника:', error);
        res.status(500).json({
            error: 'Ошибка при получении данных работника',
            code: 'FETCH_WORKER_ERROR'
        });
    }
};

/**
 * Создание нового работника
 */
const createWorker = async (req, res) => {
    try {
        const workerData = req.body;
        
        // Проверяем обязательные поля
        const requiredFields = ['name', 'fam', 'gender_id', 'prof_id', 'position_id', 'salary', 'education_id'];
        const missingFields = requiredFields.filter(field => !workerData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Отсутствуют обязательные поля',
                code: 'MISSING_FIELDS',
                missingFields
            });
        }

        const [result] = await promisePool.execute(
            `INSERT INTO workers (name, fam, otch, gender_id, prof_id, position_id, salary, education_id, date_r, date_hired, date_fired) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                workerData.name,
                workerData.fam,
                workerData.otch || null,
                workerData.gender_id,
                workerData.prof_id,
                workerData.position_id,
                workerData.salary,
                workerData.education_id,
                workerData.date_r || null,
                workerData.date_hired || null,
                workerData.date_fired || null
            ]
        );

        // Получаем созданного работника с полной информацией
        const [newWorker] = await promisePool.execute(`
            SELECT w.*, g.name AS gender_name, p.name AS prof_name, 
                   pos.name AS position_name, e.name AS education_name
            FROM workers w
            LEFT JOIN gender g ON w.gender_id = g.id
            LEFT JOIN prof p ON w.prof_id = p.id
            LEFT JOIN position pos ON w.position_id = pos.id
            LEFT JOIN education e ON w.education_id = e.id
            WHERE w.id = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Работник успешно создан',
            data: newWorker[0]
        });
    } catch (error) {
        console.error('Ошибка при создании работника:', error);
        res.status(500).json({
            error: 'Ошибка при создании работника',
            code: 'CREATE_WORKER_ERROR'
        });
    }
};

/**
 * Обновление данных работника
 */
const updateWorker = async (req, res) => {
    try {
        const { id } = req.params;
        const workerData = req.body;

        // Проверяем существование работника
        const [existingWorker] = await promisePool.execute('SELECT id FROM workers WHERE id = ?', [id]);
        
        if (existingWorker.length === 0) {
            return res.status(404).json({
                error: 'Работник не найден',
                code: 'WORKER_NOT_FOUND'
            });
        }

        // Обновляем данные
        await promisePool.execute(
            `UPDATE workers SET name = ?, fam = ?, otch = ?, gender_id = ?, prof_id = ?, 
             position_id = ?, salary = ?, education_id = ?, date_r = ?, date_hired = ?, date_fired = ? 
             WHERE id = ?`,
            [
                workerData.name,
                workerData.fam,
                workerData.otch || null,
                workerData.gender_id,
                workerData.prof_id,
                workerData.position_id,
                workerData.salary,
                workerData.education_id,
                workerData.date_r || null,
                workerData.date_hired || null,
                workerData.date_fired || null,
                id
            ]
        );

        // Получаем обновленного работника
        const [updatedWorker] = await promisePool.execute(`
            SELECT w.*, g.name AS gender_name, p.name AS prof_name, 
                   pos.name AS position_name, e.name AS education_name
            FROM workers w
            LEFT JOIN gender g ON w.gender_id = g.id
            LEFT JOIN prof p ON w.prof_id = p.id
            LEFT JOIN position pos ON w.position_id = pos.id
            LEFT JOIN education e ON w.education_id = e.id
            WHERE w.id = ?
        `, [id]);

        res.json({
            success: true,
            message: 'Данные работника успешно обновлены',
            data: updatedWorker[0]
        });
    } catch (error) {
        console.error('Ошибка при обновлении работника:', error);
        res.status(500).json({
            error: 'Ошибка при обновлении данных работника',
            code: 'UPDATE_WORKER_ERROR'
        });
    }
};

/**
 * Удаление работника
 */
const deleteWorker = async (req, res) => {
    try {
        const { id } = req.params;

        // Проверяем существование работника
        const [existingWorker] = await promisePool.execute('SELECT id FROM workers WHERE id = ?', [id]);
        
        if (existingWorker.length === 0) {
            return res.status(404).json({
                error: 'Работник не найден',
                code: 'WORKER_NOT_FOUND'
            });
        }

        await promisePool.execute('DELETE FROM workers WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Работник успешно удалён'
        });
    } catch (error) {
        console.error('Ошибка при удалении работника:', error);
        res.status(500).json({
            error: 'Ошибка при удалении работника',
            code: 'DELETE_WORKER_ERROR'
        });
    }
};

/**
 * Получение количества работников
 */
const getWorkersCount = async (req, res) => {
    try {
        const [result] = await promisePool.execute('SELECT COUNT(*) as count FROM workers');
        
        res.json({
            success: true,
            count: result[0].count
        });
    } catch (error) {
        console.error('Ошибка при подсчёте работников:', error);
        res.status(500).json({
            error: 'Ошибка при подсчёте работников',
            code: 'COUNT_WORKERS_ERROR'
        });
    }
};

module.exports = {
    getAllWorkers,
    getWorkerById,
    createWorker,
    updateWorker,
    deleteWorker,
    getWorkersCount
};