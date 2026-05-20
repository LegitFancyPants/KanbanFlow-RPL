import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        t.id_task,
        t.name,
        t.status,
        t.created_at,
        t.id_project,
        u.username
      FROM tasks t
      JOIN users u
      ON t.id_user = u.id_user
      ORDER BY t.created_at DESC
    `);

    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const result = await pool.query(
      `
      INSERT INTO tasks
      (name, id_project, id_user, status)
      VALUES($1, $2, $3, $4)
      RETURNING *
      `,
      [
        body.name,
        body.id_project,
        body.id_user,
        body.status || "to do",
      ]
    );

    return NextResponse.json(
      result.rows[0],
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    );
  }
}