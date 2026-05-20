const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Register user baru
async function register(username, email, password) {
  try {
    // Check apakah user sudah ada
    const existingUser = await pool.query(
      'SELECT id_user FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    
    if (existingUser.rows.length > 0) {
      throw new Error('Email atau username sudah terdaftar');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user baru
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id_user, username, email',
      [username, email, hashedPassword]
    );
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
}

// Login user
async function login(email, password) {
  try {
    // Cari user
    const result = await pool.query(
      'SELECT id_user, username, email, password FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Email atau password salah');
    }
    
    const user = result.rows[0];
    
    // Verifikasi password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Email atau password salah');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id_user: user.id_user, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );
    
    return {
      token,
      user: { id_user: user.id_user, username: user.username, email: user.email }
    };
  } catch (err) {
    throw err;
  }
}

// Update user profile
async function updateProfile(id_user, username, email, password = null) {
  try {
    let query = 'UPDATE users SET username = $1, email = $2';
    let params = [username, email, id_user];
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = 'UPDATE users SET username = $1, email = $2, password = $3 WHERE id_user = $4 RETURNING id_user, username, email';
      params = [username, email, hashedPassword, id_user];
    } else {
      query = 'UPDATE users SET username = $1, email = $2 WHERE id_user = $3 RETURNING id_user, username, email';
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      throw new Error('User tidak ditemukan');
    }
    
    return result.rows[0];
  } catch (err) {
    throw err;
  }
}

module.exports = {
  register,
  login,
  updateProfile
};
