import { apiResponse, apiError } from "@/lib/api-response";
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const id = rawId?.trim();

    console.log("REVIEWS PRODUCT ID:", id);

    if (!id) {
      return apiError("Invalid product ID", 400);
    }

    const { data: reviewData, error } = await supabase
      .from("reviews")
      .select(
        `
        id,
        rating,
        comment,
        created_at,
        users (
          full_name,
          avatar_url
        )
        `
      )
      .eq("product_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching product reviews:", error);
      return apiError("Failed to fetch product reviews", 500);
    }

    const reviews = reviewData.map((row: any) => ({
      id: row.id,
      rating: row.rating,
      comment: row.comment,
      userName: row.users.full_name,
      avatarUrl: row.users.avatar_url,
      createdAt: row.created_at,
    }));

    return apiResponse(reviews);
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return apiError("Failed to fetch product reviews", 500);
  }
}
