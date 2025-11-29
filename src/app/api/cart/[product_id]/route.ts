import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth-utils";
import { apiResponse, apiError } from "@/lib/api-response";

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
      `DELETE FROM cart_items 
       WHERE user_id = ? AND product_id = ?`,
      [userId, cleanProductId]
    );

    return apiResponse({ message: "Product removed from cart" }, { status: 200 });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    return apiError("Failed to remove product from cart", 500);
  }
}
