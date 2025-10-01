const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || '111';

function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Токен отсутствует' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Недействительный токен' });
    req.user = user;
    next();
  });
}

function signToken(payload, options = { expiresIn: '1h' }) {
  return jwt.sign(payload, SECRET_KEY, options);
}

module.exports = { authenticateToken, signToken };


