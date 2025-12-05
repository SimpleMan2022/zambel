import { apiResponse, apiError } from "@/lib/api-response";
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: testimonials, error } = await supabase
      .from("testimonials")
      .select("id, user_id, name, role, avatar_url, comment, rating, is_featured, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching testimonials:", error);
      return apiError("Failed to fetch testimonials", 500);
    }

    return apiResponse(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return apiError("Failed to fetch testimonials", 500);
  }
}
