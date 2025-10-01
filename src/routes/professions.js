const express = require('express');
const { db } = require('../config/db');

const router = express.Router();

router.get('/professions', (req, res) => {
  db.query('SELECT * FROM prof', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post('/professions', (req, res) => {
  const { name } = req.body;
  db.query('INSERT INTO prof (name) VALUES (?)', [name], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, name });
  });
});

router.put('/professions/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.query('UPDATE prof SET name = ? WHERE id = ?', [name, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, name });
  });
});

router.delete('/professions/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM prof WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(204).send();
  });
});

module.exports = router;


