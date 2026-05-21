// apps/backend/src/app/api/subtasks/route.js
// [FILE INI KOSONG DI PROYEK ASLI — INI FILE BARU]
// Fitur: Buat subtask baru
// Dipakai di Board.jsx → handleAddSubtask()

import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: Ambil semua subtask (jarang dipakai langsung)
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT * FROM subtasks ORDER BY id_subtask ASC`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Buat subtask baru di bawah sebuah task
// Body: { name: string, id_task: number }
// Dipakai di Board.jsx → handleAddSubtask()
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, id_task } = body;

    if (!name || !id_task) {
      return NextResponse.json(
        { error: "name dan id_task harus diisi" },
        { status: 400 }
      );
    }

    // Cek apakah task yang dimaksud ada
    const taskCheck = await pool.query(
      `SELECT id_task FROM tasks WHERE id_task = $1`,
      [id_task]
    );

    if (taskCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Task tidak ditemukan" },
        { status: 404 }
      );
    }

    // Status default subtask adalah 'doing' sesuai schema (subtask_status_enum)
    const result = await pool.query(
      `INSERT INTO subtasks (name, id_task, status)
       VALUES ($1, $2, 'doing')
       RETURNING *`,
      [name, id_task]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}