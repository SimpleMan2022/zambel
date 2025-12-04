import { NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth-utils";
import { apiResponse, apiError } from "@/lib/api-response";
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
      .from("cart_items")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", cleanProductId);

    if (error) {
      console.error("Error removing product from cart:", error);
      return apiError("Failed to remove product from cart", 500);
    }

    return apiResponse({ message: "Product removed from cart" }, { status: 200 });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    return apiError("Failed to remove product from cart", 500);
  }
}
