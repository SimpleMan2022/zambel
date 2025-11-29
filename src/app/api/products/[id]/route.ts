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

    console.log("API PRODUCT ID:", id);

    if (!id) {
      return apiError("Invalid product ID", 400);
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        id, category_id, name, slug, description, long_description,
        price, original_price, image_url, gallery_images, sku,
        stock, rating, review_count, material, size, weight, is_active
       FROM products
       WHERE id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return apiError("Product not found", 404);
    }

    const product: any = rows[0];

    if (product.gallery_images && typeof product.gallery_images === "string") {
      try {
        product.gallery_images = JSON.parse(product.gallery_images);
      } catch {
        product.gallery_images = [];
      }
    }

    return apiResponse(product);
  } catch (error) {
    console.error("API ERROR:", error);
    return apiError("Failed to fetch product", 500);
  }
}
