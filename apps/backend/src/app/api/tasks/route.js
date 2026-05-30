// tasks/route.js — GET semua task (admin) | POST buat task baru (owner/member)
import { NextResponse } from "next/server";
import pool from "@/backend/lib/db";
import { canEdit, canView, forbidden } from "@/backend/lib/roleGuard";

export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("id_project");

    // Jika ada filter project, cek viewer+
    if (projectId) {
      if (!(await canView(userId, projectId))) {
        return forbidden("Anda tidak memiliki akses ke proyek ini");
      }
    }

    const result = await pool.query(`
      SELECT
        t.id_task, t.name, t.description, t.status,
        t.created_at, t.deadline, t.id_project, t.id_user,
        COALESCE(u.username, 'Unassigned') AS username
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
    const userId = req.headers.get("x-user-id");
    const body = await req.json();
    const { name, description, id_project, id_user, status, deadline } = body;

    if (!name || !id_project || !id_user) {
      return NextResponse.json(
        { error: "name, id_project, id_user harus diisi" },
        { status: 400 }
      );
    }

    // Hanya owner dan member yang boleh membuat task
    if (!(await canEdit(userId, id_project))) {
      return forbidden("Hanya Owner atau Member yang dapat membuat tugas");
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

    try {
      const userRes = await pool.query(
        `SELECT username FROM users WHERE id_user = $1`,
        [Number(id_user)]
      );
      task.username = userRes.rows[0]?.username || "Unassigned";
    } catch {
      task.username = "Unassigned";
    }

    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error("[POST /api/tasks] error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
