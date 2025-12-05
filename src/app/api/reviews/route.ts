import { apiResponse, apiError } from "@/lib/api-response";
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: reviewData, error } = await supabase
      .from("reviews")
      .select(
        `
        id,
        rating,
        title,
        comment,
        created_at,
        users (
          full_name,
          avatar_url
        ),
        products (
          name
        )
        `
      )
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching reviews:", error);
      return apiError("Failed to fetch reviews", 500);
    }

    const reviews = reviewData.map((row: any) => ({
      id: row.id,
      rating: row.rating,
      title: row.title,
      comment: row.comment,
      createdAt: row.created_at,
      userName: row.users.full_name,
      avatarUrl: row.users.avatar_url,
      productName: row.products.name,
    }));

    return apiResponse(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return apiError("Failed to fetch reviews", 500);
  }
}
