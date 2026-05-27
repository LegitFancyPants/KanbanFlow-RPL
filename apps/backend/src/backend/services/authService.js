import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "@/backend/lib/db";

const authService = {
  // ── Register ────────────────────────────────────────────────────────
  async register(username, email, password) {
    // Cek duplikat email
    const existing = await pool.query(
      "SELECT id_user FROM users WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      throw new Error("Email sudah terdaftar");
    }

    // Cek duplikat username
    const existingUsername = await pool.query(
      "SELECT id_user FROM users WHERE username = $1",
      [username]
    );
    if (existingUsername.rows.length > 0) {
      throw new Error("Username sudah digunakan");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id_user, username, email`,
      [username, email, hashedPassword]
    );

    return result.rows[0];
  },

  // ── Login dengan email ───────────────────────────────────────────────
  async login(email, password) {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error("Email atau password salah");
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Email atau password salah");
    }

    const token = jwt.sign(
      { id_user: user.id_user, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return {
      token,
      user: {
        id_user: user.id_user,
        username: user.username,
        email: user.email,
      },
    };
  },

  // ── Ambil profil user by id ──────────────────────────────────────────
  async getProfile(id_user) {
    const result = await pool.query(
      "SELECT id_user, username, email FROM users WHERE id_user = $1",
      [id_user]
    );

    if (result.rows.length === 0) {
      throw new Error("User tidak ditemukan");
    }

    return result.rows[0];
  },

  // ── Update profil ────────────────────────────────────────────────────
  async updateProfile(id_user, { username, email, password }) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (username) {
      // Cek duplikat username (kecuali milik sendiri)
      const taken = await pool.query(
        "SELECT id_user FROM users WHERE username = $1 AND id_user <> $2",
        [username, id_user]
      );
      if (taken.rows.length > 0) throw new Error("Username sudah digunakan");
      fields.push(`username = $${idx++}`);
      values.push(username);
    }

    if (email) {
      const taken = await pool.query(
        "SELECT id_user FROM users WHERE email = $1 AND id_user <> $2",
        [email, id_user]
      );
      if (taken.rows.length > 0) throw new Error("Email sudah terdaftar");
      fields.push(`email = $${idx++}`);
      values.push(email);
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push(`password = $${idx++}`);
      values.push(hashed);
    }

    if (fields.length === 0) throw new Error("Tidak ada data yang diubah");

    values.push(id_user);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(", ")}
       WHERE id_user = $${idx}
       RETURNING id_user, username, email`,
      values
    );

    return result.rows[0];
  },
};

export default authService;