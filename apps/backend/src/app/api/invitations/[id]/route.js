import { NextResponse } from "next/server";
import pool from "@/backend/lib/db";

// PUT: Accept or Reject an invitation
export async function PUT(req, { params }) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const invitationId = params.id;
    const body = await req.json();
    const { action } = body; // 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Verify the invitation belongs to this user and is pending
      const invRes = await client.query(
        `SELECT id_project, role, status FROM invitations WHERE id_invitation = $1 AND id_user = $2 FOR UPDATE`,
        [invitationId, userId]
      );

      if (invRes.rows.length === 0) {
        throw new Error("Undangan tidak ditemukan atau Anda tidak memiliki akses");
      }

      const inv = invRes.rows[0];
      if (inv.status !== 'pending') {
        throw new Error("Undangan ini sudah direspon");
      }

      const newStatus = action === 'accept' ? 'accepted' : 'rejected';

      // Update the invitation status
      await client.query(
        `UPDATE invitations SET status = $1 WHERE id_invitation = $2`,
        [newStatus, invitationId]
      );

      // If accepted, add the user to the members table
      if (action === 'accept') {
        // Cek apakah sudah jadi member (in case of race condition)
        const existing = await client.query(
          `SELECT id_member FROM members WHERE id_user = $1 AND id_project = $2`,
          [userId, inv.id_project]
        );
        if (existing.rows.length === 0) {
          await client.query(
            `INSERT INTO members (id_user, id_project, status) VALUES ($1, $2, $3)`,
            [userId, inv.id_project, inv.role]
          );
        }
      }

      await client.query("COMMIT");
      return NextResponse.json({ success: true, message: `Undangan ${action === 'accept' ? 'diterima' : 'ditolak'}` });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
