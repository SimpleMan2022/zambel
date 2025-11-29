import { apiResponse, apiError } from "@/lib/api-response";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, price, image_url, rating, review_count, description FROM products WHERE is_active = TRUE ORDER BY rating DESC, created_at DESC LIMIT 8`
    );

    // You might need to adjust the mapping if your database column names differ from your Product interface
    const products = rows.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      image_url: row.image_url,
      rating: row.rating,
      review_count: row.review_count,
      description: row.description,
    }));

    return apiResponse(products);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return apiError("Failed to fetch featured products", 500);
  }
}
