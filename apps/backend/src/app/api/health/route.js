import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT NOW()");

    return NextResponse.json({
      message: "Database connected!",
      timestamp: result.rows[0],
      status: "ok",
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err.message,
        status: "error",
      },
      { status: 500 }
    );
  }
}