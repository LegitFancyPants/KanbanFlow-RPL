// subtasks/[id]/route.js — edit/hapus subtask (owner/member)
import { NextResponse } from "next/server";
import pool from "@/backend/lib/db";
import { canEdit, canView, forbidden } from "@/backend/lib/roleGuard";

async function getProjectIdFromSubtask(subtaskId) {
  const result = await pool.query(
    `SELECT t.id_project FROM subtasks s
     JOIN tasks t ON s.id_task = t.id_task
     WHERE s.id_subtask = $1`,
    [Number(subtaskId)]
  );
  return result.rows[0]?.id_project ?? null;
}

export async function GET(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const { id } = await params;

    const projectId = await getProjectIdFromSubtask(id);
    if (!projectId) {
      return NextResponse.json({ error: "Subtask tidak ditemukan" }, { status: 404 });
    }

    if (!(await canView(userId, projectId))) {
      return forbidden("Anda tidak memiliki akses ke proyek ini");
    }

    const result = await pool.query(
      `SELECT * FROM subtasks WHERE id_subtask = $1`,
      [Number(id)]
    );
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const { id } = await params;
    const body = await req.json();
    const { status, name } = body;

    const projectId = await getProjectIdFromSubtask(id);
    if (!projectId) {
      return NextResponse.json({ error: "Subtask tidak ditemukan" }, { status: 404 });
    }

    // Hanya owner/member yang boleh update subtask
    if (!(await canEdit(userId, projectId))) {
      return forbidden("Hanya Owner atau Member yang dapat mengubah subtask");
    }

    const result = await pool.query(
      `UPDATE subtasks
       SET status = COALESCE($1, status),
           name   = COALESCE($2, name)
       WHERE id_subtask = $3 RETURNING *`,
      [status, name, Number(id)]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const { id } = await params;

    const projectId = await getProjectIdFromSubtask(id);
    if (!projectId) {
      return NextResponse.json({ error: "Subtask tidak ditemukan" }, { status: 404 });
    }

    // Hanya owner/member yang boleh hapus subtask
    if (!(await canEdit(userId, projectId))) {
      return forbidden("Hanya Owner atau Member yang dapat menghapus subtask");
    }

    await pool.query(`DELETE FROM subtasks WHERE id_subtask = $1`, [Number(id)]);
    return NextResponse.json({ message: "Subtask berhasil dihapus" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}