import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET projects for the logged-in user (via x-user-id from middleware)
export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");

    const result = await pool.query(
      `SELECT
        p.id_project,
        p.name,
        p.description,
        p.created_by,
        u.username,
        m.status as user_role
      FROM projects p
      JOIN users u ON p.created_by = u.id_user
      JOIN members m ON m.id_project = p.id_project AND m.id_user = $1
      ORDER BY p.id_project DESC`,
      [userId]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, description, created_by } = body;

    if (!name || !created_by) {
      return NextResponse.json({ error: "name dan created_by harus diisi" }, { status: 400 });
    }

    // Begin transaction: create project + add owner to members
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const projectResult = await client.query(
        `INSERT INTO projects(name, description, created_by)
         VALUES($1, $2, $3)
         RETURNING *`,
        [name, description || null, created_by]
      );

      const project = projectResult.rows[0];

      // Auto-add creator as 'owner' in members
      await client.query(
        `INSERT INTO members (id_user, id_project, status) VALUES ($1, $2, 'owner')`,
        [created_by, project.id_project]
      );

      await client.query("COMMIT");
      return NextResponse.json(project, { status: 201 });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}