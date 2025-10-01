const express = require('express');
const { db } = require('../config/db');

const router = express.Router();

router.get('/workers', (req, res) => {
  const query = `
    SELECT w.*, g.name AS gender_name, p.name AS prof_name, pos.name AS position_name, e.name AS education_name
    FROM workers w
    LEFT JOIN gender g ON w.gender_id = g.id
    LEFT JOIN prof p ON w.prof_id = p.id
    LEFT JOIN position pos ON w.position_id = pos.id
    LEFT JOIN education e ON w.education_id = e.id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post('/workers', (req, res) => {
  const newWorker = req.body;
  db.query('INSERT INTO workers SET ?', newWorker, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: results.insertId, ...newWorker });
  });
});

router.put('/workers/:id', (req, res) => {
  const { id } = req.params;
  const updatedWorker = req.body;
  db.query('UPDATE workers SET ? WHERE id = ?', [updatedWorker, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, ...updatedWorker });
  });
});

router.delete('/workers/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM workers WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(204).send();
  });
});

module.exports = router;


