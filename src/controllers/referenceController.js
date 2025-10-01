const { promisePool } = require('../config/database');

/**
 * Универсальный контроллер для справочников
 */

// Получение всех записей справочника
const getAll = (tableName) => async (req, res) => {
    try {
        const [rows] = await promisePool.execute(`SELECT * FROM \`${tableName}\` ORDER BY id`);
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error(`Ошибка при получении данных из таблицы ${tableName}:`, error);
        res.status(500).json({
            error: `Ошибка при получении данных из ${tableName}`,
            code: 'FETCH_ERROR'
        });
    }
};

// Получение записи по ID
const getById = (tableName) => async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await promisePool.execute(`SELECT * FROM \`${tableName}\` WHERE id = ?`, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Запись не найдена',
                code: 'RECORD_NOT_FOUND'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error(`Ошибка при получении записи из таблицы ${tableName}:`, error);
        res.status(500).json({
            error: `Ошибка при получении записи из ${tableName}`,
            code: 'FETCH_ERROR'
        });
    }
};

// Создание новой записи
const create = (tableName) => async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name || name.trim() === '') {
            return res.status(400).json({
                error: 'Поле "name" обязательно для заполнения',
                code: 'FIELD_REQUIRED'
            });
        }

        // Проверяем уникальность
        const [existing] = await promisePool.execute(
            `SELECT id FROM \`${tableName}\` WHERE LOWER(name) = LOWER(?)`,
            [name.trim()]
        );
        
        if (existing.length > 0) {
            return res.status(409).json({
                error: 'Запись с таким именем уже существует',
                code: 'DUPLICATE_NAME'
            });
        }
        
        const [result] = await promisePool.execute(
            `INSERT INTO \`${tableName}\` (name) VALUES (?)`,
            [name.trim()]
        );
        
        res.status(201).json({
            success: true,
            message: 'Запись успешно создана',
            data: { id: result.insertId, name: name.trim() }
        });
    } catch (error) {
        console.error(`Ошибка при создании записи в таблице ${tableName}:`, error);
        res.status(500).json({
            error: `Ошибка при создании записи в ${tableName}`,
            code: 'CREATE_ERROR'
        });
    }
};

// Обновление записи
const update = (tableName) => async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        
        if (!name || name.trim() === '') {
            return res.status(400).json({
                error: 'Поле "name" обязательно для заполнения',
                code: 'FIELD_REQUIRED'
            });
        }

        // Проверяем существование записи
        const [existing] = await promisePool.execute(`SELECT id FROM \`${tableName}\` WHERE id = ?`, [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({
                error: 'Запись не найдена',
                code: 'RECORD_NOT_FOUND'
            });
        }

        // Проверяем уникальность имени (исключая текущую запись)
        const [duplicate] = await promisePool.execute(
            `SELECT id FROM \`${tableName}\` WHERE LOWER(name) = LOWER(?) AND id != ?`,
            [name.trim(), id]
        );
        
        if (duplicate.length > 0) {
            return res.status(409).json({
                error: 'Запись с таким именем уже существует',
                code: 'DUPLICATE_NAME'
            });
        }
        
        await promisePool.execute(
            `UPDATE \`${tableName}\` SET name = ? WHERE id = ?`,
            [name.trim(), id]
        );
        
        res.json({
            success: true,
            message: 'Запись успешно обновлена',
            data: { id: parseInt(id), name: name.trim() }
        });
    } catch (error) {
        console.error(`Ошибка при обновлении записи в таблице ${tableName}:`, error);
        res.status(500).json({
            error: `Ошибка при обновлении записи в ${tableName}`,
            code: 'UPDATE_ERROR'
        });
    }
};

// Удаление записи
const remove = (tableName) => async (req, res) => {
    try {
        const { id } = req.params;

        // Проверяем существование записи
        const [existing] = await promisePool.execute(`SELECT id FROM \`${tableName}\` WHERE id = ?`, [id]);
        
        if (existing.length === 0) {
            return res.status(404).json({
                error: 'Запись не найдена',
                code: 'RECORD_NOT_FOUND'
            });
        }

        await promisePool.execute(`DELETE FROM \`${tableName}\` WHERE id = ?`, [id]);
        
        res.json({
            success: true,
            message: 'Запись успешно удалена'
        });
    } catch (error) {
        console.error(`Ошибка при удалении записи из таблицы ${tableName}:`, error);
        
        // Проверяем, не является ли ошибка следствием foreign key constraint
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                error: 'Невозможно удалить запись, так как она используется в других таблицах',
                code: 'FOREIGN_KEY_CONSTRAINT'
            });
        }
        
        res.status(500).json({
            error: `Ошибка при удалении записи из ${tableName}`,
            code: 'DELETE_ERROR'
        });
    }
};

// Получение количества записей
const getCount = (tableName) => async (req, res) => {
    try {
        const [result] = await promisePool.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
        
        res.json({
            success: true,
            count: result[0].count
        });
    } catch (error) {
        console.error(`Ошибка при подсчёте записей в таблице ${tableName}:`, error);
        res.status(500).json({
            error: `Ошибка при подсчёте записей в ${tableName}`,
            code: 'COUNT_ERROR'
        });
    }
};

// Экспорт контроллеров для каждой таблицы
module.exports = {
    // Должности
    positions: {
        getAll: getAll('position'),
        getById: getById('position'),
        create: create('position'),
        update: update('position'),
        remove: remove('position'),
        getCount: getCount('position')
    },
    
    // Профессии
    professions: {
        getAll: getAll('prof'),
        getById: getById('prof'),
        create: create('prof'),
        update: update('prof'),
        remove: remove('prof'),
        getCount: getCount('prof')
    },
    
    // Образование
    education: {
        getAll: getAll('education'),
        getById: getById('education'),
        create: create('education'),
        update: update('education'),
        remove: remove('education'),
        getCount: getCount('education')
    },
    
    // Пол
    genders: {
        getAll: getAll('gender'),
        getById: getById('gender'),
        create: create('gender'),
        update: update('gender'),
        remove: remove('gender'),
        getCount: getCount('gender')
    },
    
    // Действия (премии/штрафы)
    actions: {
        getAll: getAll('actions'),
        getById: getById('actions'),
        create: create('actions'),
        update: update('actions'),
        remove: remove('actions'),
        getCount: getCount('actions')
    }
};