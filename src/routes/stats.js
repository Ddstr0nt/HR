const express = require('express');
const { db } = require('../config/db');

const router = express.Router();

router.get('/workers/count', (req, res) => {
  db.query('SELECT COUNT(*) AS count FROM workers', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

router.get('/api/positions/count', (req, res) => {
  db.query('SELECT COUNT(*) AS count FROM `position`', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

router.get('/api/professions/count', (req, res) => {
  db.query('SELECT COUNT(*) AS count FROM prof', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

router.get('/history/count', (req, res) => {
  db.query('SELECT COUNT(*) AS count FROM list', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

module.exports = router;


