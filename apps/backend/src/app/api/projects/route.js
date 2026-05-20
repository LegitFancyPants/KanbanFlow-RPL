import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        p.id_project,
        p.name,
        p.created_by,
        u.username
      FROM projects p
      JOIN users u
      ON p.created_by = u.id_user
    `);

    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const { name, created_by } = body;

    const result = await pool.query(
      `
      INSERT INTO projects(name, created_by)
      VALUES($1, $2)
      RETURNING *
      `,
      [name, created_by]
    );

    return NextResponse.json(
      result.rows[0],
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    );
  }
}