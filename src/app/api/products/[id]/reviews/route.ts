import { apiResponse, apiError } from "@/lib/api-response";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const id = rawId?.trim();

    console.log("REVIEWS PRODUCT ID:", id);

    if (!id) {
      return apiError("Invalid product ID", 400);
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        r.id, 
        r.rating, 
        r.comment, 
        r.created_at, 
        u.full_name as user_name, 
        u.avatar_url
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    const reviews = rows.map((row: any) => ({
      id: row.id,
      rating: row.rating,
      comment: row.comment,
      userName: row.user_name,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
    }));

    return apiResponse(reviews);
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return apiError("Failed to fetch product reviews", 500);
  }
}
