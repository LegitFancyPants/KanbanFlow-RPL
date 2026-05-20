const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware untuk verifikasi JWT token
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token tidak valid atau sudah expired' });
      }
      
      req.user = user;
      next();
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  authenticateToken
};
