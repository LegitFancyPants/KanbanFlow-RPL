import { NextResponse } from "next/server";
import authService from "@/services/authService";

export async function POST(req) {
  try {
    const body = await req.json();

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    const result = await authService.login(email, password);

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 401 }
    );
  }
}