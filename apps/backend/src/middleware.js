import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token =
    req.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Token tidak ditemukan" },
      { status: 401 }
    );
  }

  try {
    jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    return NextResponse.next();
  } catch {
    return NextResponse.json(
      { error: "Token invalid" },
      { status: 403 }
    );
  }
}

export const config = {
  matcher: ["/api/projects/:path*"],
};