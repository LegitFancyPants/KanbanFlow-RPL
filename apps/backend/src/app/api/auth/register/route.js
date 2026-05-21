// src/app/api/auth/register/route.js
import { NextResponse } from "next/server";
import authService from "@/services/authService";

// Validasi format email sederhana
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, email, password, confirmPassword } = body;

    // ── Validasi field kosong ─────────────────────────────────────────
    if (!username || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // ── Validasi format email ─────────────────────────────────────────
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // ── Validasi username (hanya huruf, angka, underscore, 3-30 karakter) ──
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return NextResponse.json(
        { error: "Username hanya boleh huruf, angka, underscore, dan 3-30 karakter" },
        { status: 400 }
      );
    }

    // ── Validasi password ─────────────────────────────────────────────
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Password tidak cocok" },
        { status: 400 }
      );
    }

    // ── Daftarkan user (bcrypt hash ada di authService.register) ──────
    const user = await authService.register(username, email, password);

    return NextResponse.json(
      { message: "Registrasi berhasil", user },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    );
  }
}