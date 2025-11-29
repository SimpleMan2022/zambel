import { apiResponse, apiError } from "@/lib/api-response";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, price, image_url, rating, review_count, description FROM products WHERE is_active = TRUE ORDER BY created_at DESC`
    );

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
    console.error("Error fetching all products:", error);
    return apiError("Failed to fetch products", 500);
  }
}
