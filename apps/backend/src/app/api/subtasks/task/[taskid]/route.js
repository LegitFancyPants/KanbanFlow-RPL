// subtasks/task/[taskid]/route.js — ambil subtask milik task (viewer+)
import { NextResponse } from "next/server";
import pool from "@/backend/lib/db";
import { canView, forbidden } from "@/backend/lib/roleGuard";

export async function GET(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const { taskid } = await params;

    // Ambil id_project dari task
    const taskRes = await pool.query(
      `SELECT id_project FROM tasks WHERE id_task = $1`,
      [Number(taskid)]
    );
    if (taskRes.rows.length === 0) {
      return NextResponse.json({ error: "Task tidak ditemukan" }, { status: 404 });
    }

    // Viewer+ boleh lihat subtask
    if (!(await canView(userId, taskRes.rows[0].id_project))) {
      return forbidden("Anda tidak memiliki akses ke proyek ini");
    }

    const result = await pool.query(
      `SELECT * FROM subtasks WHERE id_task = $1 ORDER BY id_subtask ASC`,
      [Number(taskid)]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}