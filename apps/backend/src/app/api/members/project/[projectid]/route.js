// members/project/[projectid]/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { canView, isOwner, forbidden } from "@/lib/roleGuard";

export async function GET(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const { projectid } = await params;

    // Viewer+ boleh lihat daftar anggota
    if (!(await canView(userId, projectid))) {
      return forbidden("Anda tidak memiliki akses ke proyek ini");
    }

    const result = await pool.query(
      `SELECT m.id_member, m.status, m.id_user, m.id_project,
              u.username, u.email
       FROM members m
       JOIN users u ON m.id_user = u.id_user
       WHERE m.id_project = $1
       ORDER BY
         CASE m.status WHEN 'owner' THEN 1 WHEN 'member' THEN 2 WHEN 'viewer' THEN 3 END,
         m.id_member ASC`,
      [projectid]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const { projectid } = await params;

    // Hanya owner yang boleh hapus anggota
    if (!(await isOwner(userId, projectid))) {
      return forbidden("Hanya Owner yang dapat menghapus anggota");
    }

    const body = await req.json();
    const { id_member } = body;

    if (!id_member) {
      return NextResponse.json({ error: "id_member harus diisi" }, { status: 400 });
    }

    const check = await pool.query(
      `SELECT status FROM members WHERE id_member = $1 AND id_project = $2`,
      [id_member, projectid]
    );

    if (check.rows.length === 0) {
      return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });
    }

    if (check.rows[0].status === "owner") {
      return NextResponse.json(
        { error: "Owner proyek tidak bisa dihapus dari anggota" },
        { status: 403 }
      );
    }

    await pool.query(
      `DELETE FROM members WHERE id_member = $1 AND id_project = $2`,
      [id_member, projectid]
    );

    return NextResponse.json({ message: "Anggota berhasil dihapus" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}