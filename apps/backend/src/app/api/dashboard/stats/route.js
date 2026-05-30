import { NextResponse } from "next/server";
import pool from "@/backend/lib/db";

export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      // 1. Proyek Aktif (Count of projects user is a member of)
      const projRes = await client.query(
        `SELECT COUNT(*) FROM members WHERE id_user = $1`,
        [userId]
      );
      const activeProjects = parseInt(projRes.rows[0].count, 10);

      // 2. Tugas Selesai (Count of tasks assigned to user with status 'done')
      const doneRes = await client.query(
        `SELECT COUNT(*) FROM tasks WHERE id_user = $1 AND status = 'done'`,
        [userId]
      );
      const completedTasks = parseInt(doneRes.rows[0].count, 10);

      // 3. Tugas Terlewat (Overdue tasks assigned to user, not done, and deadline passed)
      // Since deadline is DATE type, we can compare with CURRENT_DATE
      const overdueRes = await client.query(
        `SELECT COUNT(*) FROM tasks WHERE id_user = $1 AND status != 'done' AND deadline < CURRENT_DATE`,
        [userId]
      );
      const overdueTasks = parseInt(overdueRes.rows[0].count, 10);

      return NextResponse.json({
        activeProjects,
        completedTasks,
        overdueTasks
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[GET /api/dashboard/stats] error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
