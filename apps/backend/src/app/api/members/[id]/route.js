import { NextResponse } from "next/server";
import pool from "@/backend/lib/db";
import { isOwner, forbidden } from "@/backend/lib/roleGuard";

export async function PUT(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const { id } = await params; // ini id_member
    const body = await req.json();
    const { status } = body;

    if (!["member", "viewer"].includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    // Cek member yang akan diupdate
    const memberRes = await pool.query(`SELECT id_project, status FROM members WHERE id_member = $1`, [id]);
    if (memberRes.rows.length === 0) {
      return NextResponse.json({ error: "Anggota tidak ditemukan" }, { status: 404 });
    }

    const { id_project, status: currentStatus } = memberRes.rows[0];

    // Hanya owner yang boleh mengubah status
    if (!(await isOwner(userId, id_project))) {
      return forbidden("Hanya Owner yang dapat mengubah role anggota");
    }

    if (currentStatus === "owner") {
      return NextResponse.json({ error: "Tidak dapat mengubah role owner" }, { status: 403 });
    }

    const result = await pool.query(
      `UPDATE members SET status = $1 WHERE id_member = $2 RETURNING *`,
      [status, id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    const { id } = await params; // id_member

    // Cek member yang akan dihapus
    const memberRes = await pool.query(`SELECT id_project, status FROM members WHERE id_member = $1`, [id]);
    if (memberRes.rows.length === 0) {
      return NextResponse.json({ error: "Anggota tidak ditemukan" }, { status: 404 });
    }

    const { id_project, status: currentStatus } = memberRes.rows[0];

    // Hanya owner yang boleh menghapus anggota
    if (!(await isOwner(userId, id_project))) {
      return forbidden("Hanya Owner yang dapat menghapus anggota");
    }

    if (currentStatus === "owner") {
      return NextResponse.json({ error: "Tidak dapat menghapus owner" }, { status: 403 });
    }

    await pool.query(`DELETE FROM members WHERE id_member = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
