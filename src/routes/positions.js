const express = require('express');
const { db } = require('../config/db');

const router = express.Router();

router.get('/positions', (req, res) => {
  db.query('SELECT * FROM `position`', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post('/positions', (req, res) => {
  const newPosition = req.body;
  db.query('INSERT INTO `position` SET ?', newPosition, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: results.insertId, ...newPosition });
  });
});

router.put('/positions/:id', (req, res) => {
  const positionId = req.params.id;
  const updatedPosition = req.body;
  db.query('UPDATE `position` SET ? WHERE id = ?', [updatedPosition, positionId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: positionId, ...updatedPosition });
  });
});

router.delete('/positions/:id', (req, res) => {
  const positionId = req.params.id;
  db.query('DELETE FROM `position` WHERE id = ?', positionId, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(204).send();
  });
});

module.exports = router;


