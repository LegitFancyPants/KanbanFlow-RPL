// src/middleware.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Token tidak ditemukan" },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Teruskan request dengan info user di header
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", String(decoded.id_user));
    requestHeaders.set("x-user-email", decoded.email);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    return NextResponse.json(
      { error: "Token tidak valid atau sudah kadaluarsa" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    "/api/projects/:path*",
    "/api/tasks/:path*",
    "/api/subtasks/:path*",
  ],
};