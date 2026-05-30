import { NextResponse } from "next/server";
import pool from "@/backend/lib/db";
import { isOwner, forbidden } from "@/backend/lib/roleGuard";

// GET: Fetch pending invitations for the logged-in user
export async function GET(req) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await pool.query(
      `SELECT i.id_invitation, i.role, i.created_at,
              p.name AS project_name, u.username AS inviter_name
       FROM invitations i
       JOIN projects p ON i.id_project = p.id_project
       JOIN users u ON i.invited_by = u.id_user
       WHERE i.id_user = $1 AND i.status = 'pending'
       ORDER BY i.created_at DESC`,
      [userId]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Owner sends an invitation to an email
export async function POST(req) {
  try {
    const ownerId = req.headers.get("x-user-id");
    if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { email, id_project, role } = body;

    if (!email || !id_project || !role) {
      return NextResponse.json({ error: "email, id_project, dan role harus diisi" }, { status: 400 });
    }

    if (!(await isOwner(ownerId, id_project))) {
      return forbidden("Hanya Owner yang dapat mengundang anggota");
    }

    // Cari user berdasarkan email
    const userResult = await pool.query(`SELECT id_user FROM users WHERE email = $1`, [email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "Pengguna dengan email tersebut tidak ditemukan" }, { status: 404 });
    }
    const targetUserId = userResult.rows[0].id_user;

    if (String(targetUserId) === String(ownerId)) {
      return NextResponse.json({ error: "Tidak dapat mengundang diri sendiri" }, { status: 400 });
    }

    // Cek apakah sudah menjadi anggota
    const existingMember = await pool.query(
      `SELECT id_member FROM members WHERE id_user = $1 AND id_project = $2`,
      [targetUserId, id_project]
    );
    if (existingMember.rows.length > 0) {
      return NextResponse.json({ error: "Pengguna sudah menjadi anggota proyek ini" }, { status: 409 });
    }

    // Cek apakah sudah ada invite pending
    const existingInvite = await pool.query(
      `SELECT id_invitation FROM invitations WHERE id_user = $1 AND id_project = $2 AND status = 'pending'`,
      [targetUserId, id_project]
    );
    if (existingInvite.rows.length > 0) {
      return NextResponse.json({ error: "Pengguna sudah memiliki undangan yang belum dijawab" }, { status: 409 });
    }

    // Insert invitation
    const insertResult = await pool.query(
      `INSERT INTO invitations (id_project, id_user, invited_by, role, status)
       VALUES ($1, $2, $3, $4, 'pending')
       ON CONFLICT (id_project, id_user) DO UPDATE 
       SET status = 'pending',
           role = EXCLUDED.role,
           invited_by = EXCLUDED.invited_by,
           created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [id_project, targetUserId, ownerId, role]
    );

    return NextResponse.json(insertResult.rows[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
