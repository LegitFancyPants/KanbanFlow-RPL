// projects/[id]/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { isOwner, canView, forbidden } from "@/lib/roleGuard";

export async function GET(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const { id } = await params;

    // Viewer+ boleh lihat detail project
    if (!(await canView(userId, id))) {
      return forbidden("Anda tidak memiliki akses ke proyek ini");
    }

    const result = await pool.query(
      `SELECT * FROM projects WHERE id_project = $1`,
      [Number(id)]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Project tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const { id } = await params;

    // Hanya owner yang boleh edit project
    if (!(await isOwner(userId, id))) {
      return forbidden("Hanya Owner yang dapat mengubah proyek");
    }

    const body = await req.json();
    const { name, description } = body;

    const result = await pool.query(
      `UPDATE projects
       SET name = COALESCE($1, name), description = COALESCE($2, description)
       WHERE id_project = $3 RETURNING *`,
      [name, description, Number(id)]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Project tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const { id } = await params;

    // Hanya owner yang boleh hapus project
    if (!(await isOwner(userId, id))) {
      return forbidden("Hanya Owner yang dapat menghapus proyek");
    }

    await pool.query(`DELETE FROM projects WHERE id_project = $1`, [Number(id)]);
    return NextResponse.json({ message: "Project berhasil dihapus" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}