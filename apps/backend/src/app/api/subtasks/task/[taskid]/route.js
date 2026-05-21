import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const { taskid } = params;
    const result = await pool.query(
      `SELECT * FROM subtasks WHERE id_task = $1 ORDER BY id_subtask ASC`,
      [taskid]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}