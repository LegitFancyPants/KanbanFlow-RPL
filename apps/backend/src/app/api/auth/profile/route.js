// src/app/api/auth/profile/route.js
import { NextResponse } from "next/server";
import authService from "@/services/authService";
import jwt from "jsonwebtoken";

// Helper ambil user dari token
function getUserFromRequest(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) throw new Error("Token tidak ditemukan");

  const token = authHeader.split(" ")[1];
  if (!token) throw new Error("Format token salah");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
}

// GET /api/auth/profile → ambil data profil user yang sedang login
export async function GET(req) {
  try {
    const decoded = getUserFromRequest(req);
    const user = await authService.getProfile(decoded.id_user);
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    const status = err.name === "JsonWebTokenError" ? 401 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}

// PUT /api/auth/profile → update username / email / password
export async function PUT(req) {
  try {
    const decoded = getUserFromRequest(req);
    const body = await req.json();

    const updated = await authService.updateProfile(decoded.id_user, body);
    return NextResponse.json(
      { message: "Profil berhasil diperbarui", user: updated },
      { status: 200 }
    );
  } catch (err) {
    const status = err.name === "JsonWebTokenError" ? 401 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}