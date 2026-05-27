// subtasks/route.js — buat subtask (owner/member)
import { NextResponse } from "next/server";
import pool from "@/backend/lib/db";
import { canEdit, forbidden } from "@/backend/lib/roleGuard";

export async function POST(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const body = await req.json();
    const { name, id_task } = body;

    if (!name || !id_task) {
      return NextResponse.json(
        { error: "name dan id_task harus diisi" },
        { status: 400 }
      );
    }

    // Ambil id_project dari task
    const taskRes = await pool.query(
      `SELECT id_project FROM tasks WHERE id_task = $1`,
      [Number(id_task)]
    );
    if (taskRes.rows.length === 0) {
      return NextResponse.json({ error: "Task tidak ditemukan" }, { status: 404 });
    }

    // Hanya owner/member yang boleh tambah subtask
    if (!(await canEdit(userId, taskRes.rows[0].id_project))) {
      return forbidden("Hanya Owner atau Member yang dapat menambah subtask");
    }

    const result = await pool.query(
      `INSERT INTO subtasks (name, id_task, status)
       VALUES ($1, $2, 'to do') RETURNING *`,
      [name, Number(id_task)]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
