const express = require('express');
const { db } = require('../config/db');

const router = express.Router();

router.get('/list', (req, res) => {
  db.query('SELECT * FROM list', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post('/list', (req, res) => {
  const newItem = req.body;
  db.query('INSERT INTO list SET ?', newItem, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: results.insertId, ...newItem });
  });
});

router.put('/list/:id', (req, res) => {
  const { id } = req.params;
  const updatedItem = req.body;
  db.query('UPDATE list SET ? WHERE id = ?', [updatedItem, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, ...updatedItem });
  });
});

router.delete('/list/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM list WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(204).send();
  });
});

module.exports = router;


