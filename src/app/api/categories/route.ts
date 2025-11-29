import { apiResponse, apiError } from "@/lib/api-response";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, slug, image_url FROM categories ORDER BY name ASC`
    );

    // You might need to adjust the mapping if your database column names differ from your Category interface
    const categories = rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      image_url: row.image_url,
    }));

    return apiResponse(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return apiError("Failed to fetch categories", 500);
  }
}
