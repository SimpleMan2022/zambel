import { apiResponse, apiError } from "@/lib/api-response";
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price, image_url, rating, review_count, description")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      console.error("Error fetching new arrival products:", error);
      return apiError("Failed to fetch new arrival products", 500);
    }

    return apiResponse(products);
  } catch (error) {
    console.error("Error fetching new arrival products:", error);
    return apiError("Failed to fetch new arrival products", 500);
  }
}
