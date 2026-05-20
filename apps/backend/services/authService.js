import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

const authService = {
  async register(username, email, password) {
    const hashedPassword =
      await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users
      (username, email, password)
      VALUES($1, $2, $3)
      RETURNING id_user, username, email
      `,
      [username, email, hashedPassword]
    );

    return result.rows[0];
  },

  async login(email, password) {
    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error(
        "Email atau password salah"
      );
    }

    const user = result.rows[0];

    const valid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!valid) {
      throw new Error(
        "Email atau password salah"
      );
    }

    const token = jwt.sign(
      {
        id_user: user.id_user,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
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
};

export default authService;