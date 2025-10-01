const express = require('express');
const { db } = require('../config/db');
const { authenticateToken, signToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND password = MD5(?)';
  db.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: 'Неверные учетные данные' });

    const user = results[0];
    const token = signToken({ id: user.id, role: user.role });
    res.json({ token, role: user.role, username: user.username });
  });
});

router.post('/register', (req, res) => {
  const { username, password, role, specialPassword } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Все поля обязательны.' });
  }

  const secretPasswords = { admin: 'adminsecret', editor: 'editorsecret' };

  if (role === 'admin' && specialPassword !== secretPasswords.admin) {
    return res.status(403).json({ error: 'Неверный специальный пароль для роли admin.' });
  }
  if (role === 'editor' && specialPassword !== secretPasswords.editor) {
    return res.status(403).json({ error: 'Неверный специальный пароль для роли editor.' });
  }

  const query = 'INSERT INTO users (username, password, role) VALUES (?, MD5(?), ?)';
  db.query(query, [username, password, role], (err) => {
    if (err) {
      console.error('Ошибка при регистрации пользователя:', err);
      return res.status(500).json({ error: 'Ошибка сервера.' });
    }
    res.status(201).json({ message: 'Пользователь успешно зарегистрирован.' });
  });
});

router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Доступ разрешен', user: req.user });
});

module.exports = router;


