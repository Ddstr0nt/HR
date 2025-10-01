const express = require('express');
const { db } = require('../config/db');

const router = express.Router();

router.get('/education', (req, res) => {
  db.query('SELECT * FROM education', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post('/education', (req, res) => {
  const { name } = req.body;
  db.query('INSERT INTO education (name) VALUES (?)', [name], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, name });
  });
});

router.put('/education/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.query('UPDATE education SET name = ? WHERE id = ?', [name, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, name });
  });
});

router.delete('/education/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM education WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Образование удалено' });
  });
});

module.exports = router;


