import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const result = await pool.query(
      `SELECT * FROM projects WHERE id_project = $1`,
      [Number(id)]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description } = body;
    const result = await pool.query(
      `UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description)
       WHERE id_project = $3 RETURNING *`,
      [name, description, Number(id)]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await pool.query(`DELETE FROM projects WHERE id_project = $1`, [Number(id)]);
    return NextResponse.json({ message: "Project deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}