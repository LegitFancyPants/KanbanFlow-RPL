import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, status } = body;

    const result = await pool.query(
      `UPDATE subtasks
       SET name = COALESCE($1, name),
           status = COALESCE($2, status)
       WHERE id_subtask = $3
       RETURNING *`,
      [name, status, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    await pool.query("DELETE FROM subtasks WHERE id_subtask = $1", [id]);
    return NextResponse.json({ message: "Subtask deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}