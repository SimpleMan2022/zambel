import { apiResponse, apiError } from "@/lib/api-response";
import { getUserIdFromRequest } from "@/lib/auth-utils";
import { NextRequest } from "next/server";
import { supabase } from '@/lib/supabase';

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

    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", cleanProductId);

    if (error) {
      console.error("Error removing product from wishlist:", error);
      return apiError("Failed to remove product from wishlist", 500);
    }

    return apiResponse(
      { message: "Product removed from wishlist" },
      { status: 200, success: true }
    );
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    return apiError("Failed to remove product from wishlist", 500);
  }
}
