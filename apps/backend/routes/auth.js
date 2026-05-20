const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    // Validasi input
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password tidak cocok' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }
    
    const user = await authService.register(username, email, password);
    res.status(201).json({ 
      message: 'Registrasi berhasil',
      user 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password harus diisi' });
    }
    
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// Update profile
router.put('/profile', async (req, res) => {
  try {
    // Middleware authenticateToken sudah dipastikan ada user di req.user
    const id_user = req.user.id_user;
    const { username, email, password, confirmPassword } = req.body;
    
    if (!username || !email) {
      return res.status(400).json({ error: 'Username dan email harus diisi' });
    }
    
    if (password && password !== confirmPassword) {
      return res.status(400).json({ error: 'Password tidak cocok' });
    }
    
    const user = await authService.updateProfile(id_user, username, email, password);
    res.json({ 
      message: 'Profile berhasil diperbarui',
      user 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
