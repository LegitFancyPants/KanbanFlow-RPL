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
        u.username
      FROM tasks t
      JOIN users u ON t.id_user = u.id_user
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
      return NextResponse.json({ error: "name, id_project, id_user harus diisi" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO tasks (name, description, id_project, id_user, status, deadline)
       VALUES($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description || null, id_project, id_user, status || "to do", deadline || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}