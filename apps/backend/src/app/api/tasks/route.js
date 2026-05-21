import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        t.id_task,
        t.name,
        t.description,
        t.status,
        t.created_at,
        t.deadline,
        t.id_project,
        t.id_user,
        COALESCE(u.username, 'Unknown') AS username
      FROM tasks t
      LEFT JOIN users u ON t.id_user = u.id_user
      ORDER BY t.created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, description, id_project, id_user, status, deadline } = body;

    if (!name || !id_project || !id_user) {
      return NextResponse.json(
        { error: "name, id_project, id_user harus diisi" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO tasks (name, description, id_project, id_user, status, deadline)
       VALUES($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        name,
        description || null,
        Number(id_project),
        Number(id_user),
        (status || "to do").trim().toLowerCase(),
        deadline || null,
      ]
    );

    const task = result.rows[0];

    // Ambil username untuk response yang lengkap
    try {
      const userRes = await pool.query(
        `SELECT username FROM users WHERE id_user = $1`,
        [Number(id_user)]
      );
      task.username = userRes.rows[0]?.username || 'Unknown';
    } catch {
      task.username = 'Unknown';
    }

    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error('[POST /api/tasks] error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}