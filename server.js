const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Создание подключения к базе данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Замените на ваше имя пользователя
    password: 'root', // Замените на ваш пароль
    database: 'ok' // Замените на имя вашей базы данных
});

// Проверка подключения
db.connect(err => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        return;
    }
    console.log('Подключение к базе данных успешно!');
});

// Получение всех работников
app.get('/workers', (req, res) => {
    const query = `
        SELECT w.*, g.name AS gender_name, p.name AS prof_name, pos.name AS position_name, e.name AS education_name
        FROM workers w
        LEFT JOIN gender g ON w.gender_id = g.id
        LEFT JOIN prof p ON w.prof_id = p.id
        LEFT JOIN position pos ON w.position_id = pos.id
        LEFT JOIN education e ON w.education_id = e.id
    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.get('/api/actions', (req, res) => {
    db.query('SELECT * FROM actions', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Получение всех полов
app.get('/api/genders', (req, res) => {
    db.query('SELECT * FROM gender', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Маршруты для образования
app.get('/api/education', (req, res) => {
    db.query('SELECT * FROM education', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/education', (req, res) => {
    const { name } = req.body;
    db.query('INSERT INTO education (name) VALUES (?)', [name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, name });
    });
});

app.put('/api/education/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    db.query('UPDATE education SET name = ? WHERE id = ?', [name, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, name });
    });
});

app.delete('/api/education/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM education WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Образование удалено' });
    });
});

// Добавление нового работника
app.post('/workers', (req, res) => {
    const newWorker = req.body;
    db.query('INSERT INTO workers SET ?', newWorker, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: results.insertId, ...newWorker });
    });
});

// Обновление работника
app.put('/workers/:id', (req, res) => {
    const { id } = req.params;
    const updatedWorker = req.body;
    db.query('UPDATE workers SET ? WHERE id = ?', [updatedWorker, id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id, ...updatedWorker });
    });
});

// Удаление работника
app.delete('/workers/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM workers WHERE id = ?', [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(204).send();
    });
});

// Получение всех элементов списка
app.get('/list', (req, res) => {
    db.query('SELECT * FROM list', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Добавление нового элемента в список
app.post('/list', (req, res) => {
    const newItem = req.body;
    console.log('Полученные данные для добавления:', newItem); // Логируем полученные данные
    db.query('INSERT INTO list SET ?', newItem, (err, results) => {
        if (err) {
            console.error('Ошибка при добавлении элемента:', err); // Логируем ошибку
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: results.insertId, ...newItem });
    });
});

// Обновление элемента списка
app.put('/list/:id', (req, res) => {
    const { id } = req.params;
    const updatedItem = req.body;
    db.query('UPDATE list SET ? WHERE id = ?', [updatedItem, id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id, ...updatedItem });
    });
});

// Удаление элемента списка
app.delete('/list/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM list WHERE id = ?', [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(204).send();
    });
});

// Получение всех должностей
app.get('/api/positions', (req, res) => {
    db.query('SELECT * FROM position', (err, results) => {
        if (err) {
            console.error('Ошибка при получении должностей:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Добавление новой должности
app.post('/api/positions', (req, res) => {
    const newPosition = req.body;
    db.query('INSERT INTO position SET ?', newPosition, (err, results) => {
        if (err) {
            console.error('Ошибка при добавлении должности:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: results.insertId, ...newPosition });
    });
});

// Обновление должности
app.put('/api/positions/:id', (req, res) => {
    const positionId = req.params.id;
    const updatedPosition = req.body;
    db.query('UPDATE position SET ? WHERE id = ?', [updatedPosition, positionId], (err) => {
        if (err) {
            console.error('Ошибка при обновлении должности:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: positionId, ...updatedPosition });
    });
});

// Удаление должности
app.delete('/api/positions/:id', (req, res) => {
    const positionId = req.params.id;
    db.query('DELETE FROM position WHERE id = ?', positionId, (err) => {
        if (err) {
            console.error('Ошибка при удалении должности:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(204).send();
    });
});

// Create a new profession
app.post('/api/professions', (req, res) => {
    const { name } = req.body;
    db.query('INSERT INTO prof (name) VALUES (?)', [name], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: result.insertId, name });
    });
});

// Read all professions
app.get('/api/professions', (req, res) => {
    db.query('SELECT * FROM prof', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Update a profession
app.put('/api/professions/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    db.query('UPDATE prof SET name = ? WHERE id = ?', [name, id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id, name });
    });
});

// Delete a profession
app.delete('/api/professions/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM prof WHERE id = ?', [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(204).send();
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});