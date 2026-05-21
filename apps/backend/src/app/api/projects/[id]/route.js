import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const { id } = await params; // ← tambah await

    const project = await pool.query(
      `SELECT * FROM projects WHERE id_project = $1`,
      [id]
    );

    if (project.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params; // ← tambah await
    const body = await req.json();

    const result = await pool.query(
      `UPDATE projects SET name = $1 WHERE id_project = $2 RETURNING *`,
      [body.name, id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params; // ← tambah await

    await pool.query(`DELETE FROM projects WHERE id_project = $1`, [id]);

    return NextResponse.json({ message: "Project deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}