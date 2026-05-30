// lib/roleGuard.js
// Helper terpusat untuk pengecekan role/hak akses di semua route
import pool from "@/backend/lib/db";

/**
 * Ambil role user di sebuah project.
 * Return: 'owner' | 'member' | 'viewer' | null (tidak terdaftar)
 */
export async function getUserRole(id_user, id_project) {
  const result = await pool.query(
    `SELECT status FROM members WHERE id_user = $1 AND id_project = $2`,
    [id_user, id_project]
  );
  return result.rows[0]?.status ?? null;
}

/**
 * Cek apakah user adalah owner project.
 */
export async function isOwner(id_user, id_project) {
  const role = await getUserRole(id_user, id_project);
  return role === "owner";
}

/**
 * Cek apakah user bisa mengedit (owner atau member).
 */
export async function canEdit(id_user, id_project) {
  const role = await getUserRole(id_user, id_project);
  return role === "owner" || role === "member";
}

/**
 * Cek apakah user bisa melihat (owner, member, atau viewer).
 */
export async function canView(id_user, id_project) {
  const role = await getUserRole(id_user, id_project);
  return role !== null;
}

/**
 * Response standar 403 Forbidden.
 */
export function forbidden(message = "Akses ditolak") {
  return Response.json({ error: message }, { status: 403 });
}