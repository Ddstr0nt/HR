const express = require('express');
const { db } = require('../config/db');

const router = express.Router();

router.get('/actions', (req, res) => {
  db.query('SELECT * FROM actions', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;


