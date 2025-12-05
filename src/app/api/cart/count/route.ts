import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth-utils";
import { apiResponse, apiError } from "@/lib/api-response";
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const { count, error } = await supabase
      .from("cart_items")
      .select("id", { count: 'exact', head: true })
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching cart count:", error);
      return apiError("Failed to fetch cart count", 500);
    }

    const cartCount = count || 0;

    return apiResponse({ count: cartCount });
  } catch (error) {
    console.error("Error fetching cart count:", error);
    return apiError("Failed to fetch cart count", 500);
  }
}
