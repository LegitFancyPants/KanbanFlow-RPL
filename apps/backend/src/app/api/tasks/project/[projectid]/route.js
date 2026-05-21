// tasks/project/[projectid]/route.js — ambil semua task di project
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { canView, forbidden } from "@/lib/roleGuard";

export async function GET(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const { projectid } = await params;

    if (!projectid) {
      return NextResponse.json({ error: "projectid tidak ditemukan" }, { status: 400 });
    }

    // Viewer+ boleh lihat task list
    if (!(await canView(userId, projectid))) {
      return forbidden("Anda tidak memiliki akses ke proyek ini");
    }

    const result = await pool.query(
      `SELECT
        t.id_task, t.name, t.description, t.status,
        t.created_at, t.deadline, t.id_project, t.id_user,
        COALESCE(u.username, 'Unknown') AS username
      FROM tasks t
      LEFT JOIN users u ON t.id_user = u.id_user
      WHERE t.id_project = $1
      ORDER BY t.created_at DESC`,
      [Number(projectid)]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("[GET tasks/project] error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}