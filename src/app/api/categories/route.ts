import { apiResponse, apiError } from "@/lib/api-response";
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, name, slug, image_url")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return apiError("Failed to fetch categories", 500);
    }

    return apiResponse(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return apiError("Failed to fetch categories", 500);
  }
}
