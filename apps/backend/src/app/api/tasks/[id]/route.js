// tasks/[id]/route.js — GET detail | PUT edit | DELETE hapus task
import { NextResponse } from "next/server";
import pool from "@/backend/lib/db";
import { canEdit, canView, isOwner, forbidden } from "@/backend/lib/roleGuard";

export async function GET(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const { id } = await params;

    const result = await pool.query(
      `SELECT t.*, COALESCE(u.username, 'Unknown') AS username
       FROM tasks t LEFT JOIN users u ON t.id_user = u.id_user
       WHERE t.id_task = $1`,
      [Number(id)]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Task tidak ditemukan" }, { status: 404 });
    }

    const task = result.rows[0];

    // Viewer+ boleh lihat
    if (!(await canView(userId, task.id_project))) {
      return forbidden("Anda tidak memiliki akses ke proyek ini");
    }

    return NextResponse.json(task);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const { id } = await params;
    const body = await req.json();
    const { name, description, status, id_user, deadline } = body;

    // Ambil task dulu untuk cek project
    const taskRes = await pool.query(
      `SELECT id_project FROM tasks WHERE id_task = $1`,
      [Number(id)]
    );
    if (taskRes.rows.length === 0) {
      return NextResponse.json({ error: "Task tidak ditemukan" }, { status: 404 });
    }

    // Hanya owner/member yang boleh edit
    if (!(await canEdit(userId, taskRes.rows[0].id_project))) {
      return forbidden("Hanya Owner atau Member yang dapat mengubah tugas");
    }

    const result = await pool.query(
      `UPDATE tasks
       SET name        = COALESCE($1, name),
           description = COALESCE($2, description),
           status      = COALESCE($3, status),
           id_user     = COALESCE($4, id_user),
           deadline    = COALESCE($5, deadline)
       WHERE id_task = $6
       RETURNING *`,
      [name, description, status, id_user, deadline, Number(id)]
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

    // Ambil task dulu untuk cek project
    const taskRes = await pool.query(
      `SELECT id_project FROM tasks WHERE id_task = $1`,
      [Number(id)]
    );
    if (taskRes.rows.length === 0) {
      return NextResponse.json({ error: "Task tidak ditemukan" }, { status: 404 });
    }

    // Hanya owner/member yang boleh hapus
    if (!(await canEdit(userId, taskRes.rows[0].id_project))) {
      return forbidden("Hanya Owner atau Member yang dapat menghapus tugas");
    }

    await pool.query("DELETE FROM tasks WHERE id_task = $1", [Number(id)]);
    return NextResponse.json({ message: "Task berhasil dihapus" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}