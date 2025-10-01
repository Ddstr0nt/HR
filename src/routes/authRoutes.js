const express = require('express');
const router = express.Router();
const { login, register, getCurrentUser, verifyToken } = require('../controllers/authController');
const { validateLogin, validateRegistration } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// Публичные маршруты
router.post('/login', validateLogin, login);
router.post('/register', validateRegistration, register);

// Защищённые маршруты
router.get('/me', authenticateToken, getCurrentUser);
router.get('/verify', authenticateToken, verifyToken);

module.exports = router;