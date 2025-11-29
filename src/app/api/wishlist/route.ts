import { apiResponse, apiError } from "@/lib/api-response";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { getUserIdFromRequest } from "@/lib/auth-utils"; 
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request); 

    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const { product_id } = await request.json();

    if (!product_id) {
      return apiError("Product ID is required", 400);
    }

    // Check if the product already exists in the wishlist
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?`,
      [userId, product_id]
    );

    if (existing.length > 0) {
      return apiResponse({ message: "Product already in wishlist" }, { status: 200, success: true });
    }

    // Add to wishlist
    await pool.query(
      `INSERT INTO wishlist (id, user_id, product_id, created_at) VALUES (UUID(), ?, ?, NOW())`,
      [userId, product_id]
    );

    return apiResponse({ message: "Product added to wishlist" }, { status: 201, success: true });
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    return apiError("Failed to add product to wishlist", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request); 

    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        p.id, p.name, p.price, p.image_url, p.rating, p.review_count, p.description
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );

    const wishlistItems = rows.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      image_url: row.image_url,
      rating: row.rating,
      review_count: row.review_count,
      description: row.description,
    }));

    return apiResponse(wishlistItems);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return apiError("Failed to fetch wishlist", 500);
  }
}
