import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const { projectid } = params;

    const result = await pool.query(
      `SELECT
        t.id_task,
        t.name,
        t.description,
        t.status,
        t.created_at,
        t.deadline,
        t.id_project,
        t.id_user,
        u.username
      FROM tasks t
      JOIN users u ON t.id_user = u.id_user
      WHERE t.id_project = $1
      ORDER BY t.created_at DESC`,
      [projectid]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}