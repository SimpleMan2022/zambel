import { apiResponse, apiError } from "@/lib/api-response";
import pool from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth-utils";
import { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ product_id: string }> }
) {
  try {
    const { product_id } = await context.params;

    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const cleanProductId = product_id?.trim();

    if (!cleanProductId) {
      return apiError("Product ID is required", 400);
    }

    await pool.query(
      `DELETE FROM wishlist 
       WHERE user_id = ? AND product_id = ?`,
      [userId, cleanProductId]
    );

    return apiResponse(
      { message: "Product removed from wishlist" },
      { status: 200, success: true }
    );
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    return apiError("Failed to remove product from wishlist", 500);
  }
}
