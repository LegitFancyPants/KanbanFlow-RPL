// apps/backend/src/app/api/members/route.js
// [FILE INI KOSONG DI PROYEK ASLI — INI FILE BARU]
// Fitur: Undang anggota ke proyek berdasarkan email (sesuai frontend Board.jsx handleInvite)

import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET: Ambil semua members (jarang dipakai langsung, tapi tersedia)
export async function GET(req) {
  try {
    const result = await pool.query(
      `SELECT m.id_member, m.status, m.id_user, m.id_project,
              u.username, u.email
       FROM members m
       JOIN users u ON m.id_user = u.id_user
       ORDER BY m.id_member DESC`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Undang anggota baru ke proyek berdasarkan email
// Body: { email: string, id_project: number, status?: 'member' | 'viewer' }
// Dipakai di Board.jsx → handleInvite()
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, id_project, status } = body;

    if (!email || !id_project) {
      return NextResponse.json(
        { error: "email dan id_project harus diisi" },
        { status: 400 }
      );
    }

    // Cari user berdasarkan email
    const userResult = await pool.query(
      `SELECT id_user, username, email FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Pengguna dengan email tersebut tidak ditemukan" },
        { status: 404 }
      );
    }

    const targetUser = userResult.rows[0];

    // Cek apakah user sudah menjadi anggota proyek ini
    const existing = await pool.query(
      `SELECT id_member FROM members WHERE id_user = $1 AND id_project = $2`,
      [targetUser.id_user, id_project]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Pengguna sudah menjadi anggota proyek ini" },
        { status: 409 }
      );
    }

    // Tambahkan sebagai member (default: 'member')
    const memberStatus = status === "viewer" ? "viewer" : "member";

    const result = await pool.query(
      `INSERT INTO members (id_user, id_project, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [targetUser.id_user, id_project, memberStatus]
    );

    return NextResponse.json(
      {
        ...result.rows[0],
        username: targetUser.username,
        email: targetUser.email,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}