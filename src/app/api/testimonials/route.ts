import { NextRequest } from "next/server";
import { apiResponse, apiError } from "@/lib/api-response";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const [testimonialsRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, role, avatar_url, comment, rating FROM testimonials ORDER BY created_at DESC`
    );

    return apiResponse(testimonialsRows);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to fetch testimonials",
      500
    );
  }
}
