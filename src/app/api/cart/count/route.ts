import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { getUserIdFromRequest } from "@/lib/auth-utils";
import { apiResponse, apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(id) as count FROM cart_items WHERE user_id = ?`,
      [userId]
    );

    const cartCount = rows[0]?.count || 0;

    return apiResponse({ count: cartCount });
  } catch (error) {
    console.error("Error fetching cart count:", error);
    return apiError("Failed to fetch cart count", 500);
  }
}
