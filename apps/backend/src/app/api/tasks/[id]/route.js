import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const result = await pool.query(
      `SELECT t.*, COALESCE(u.username, 'Unknown') AS username
       FROM tasks t
       LEFT JOIN users u ON t.id_user = u.id_user
       WHERE t.id_task = $1`,
      [Number(id)]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, status, id_user, deadline } = body;

    const result = await pool.query(
      `UPDATE tasks
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           id_user = COALESCE($4, id_user),
           deadline = COALESCE($5, deadline)
       WHERE id_task = $6
       RETURNING *`,
      [name, description, status, id_user, deadline, Number(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await pool.query("DELETE FROM tasks WHERE id_task = $1", [Number(id)]);
    return NextResponse.json({ message: "Task deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}