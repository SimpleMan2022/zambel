import { apiResponse, apiError } from "@/lib/api-response";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.id, r.rating, r.title, r.comment, r.created_at, u.full_name as user_name, u.avatar_url, p.name as product_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN products p ON r.product_id = p.id
       ORDER BY r.created_at DESC
       LIMIT 5` // Example: Fetch 5 recent reviews
    );

    const reviews = rows.map(row => ({
      id: row.id,
      rating: row.rating,
      title: row.title,
      comment: row.comment,
      createdAt: row.created_at,
      userName: row.user_name,
      avatarUrl: row.avatar_url,
      productName: row.product_name,
    }));

    return apiResponse(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return apiError("Failed to fetch reviews", 500);
  }
}
