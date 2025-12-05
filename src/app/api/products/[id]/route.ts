import { apiResponse, apiError } from "@/lib/api-response";
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const id = rawId?.trim();

    console.log("API PRODUCT ID:", id);

    if (!id) {
      return apiError("Invalid product ID", 400);
    }

    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        id, category_id, name, slug, description, long_description,
        price, original_price, image_url, gallery_images, sku,
        stock, rating, review_count, material, size, weight, is_active
        `
      )
      .eq("id", id)
      .single();

    if (error || !product) {
      console.error("Error fetching product:", error);
      return apiError("Product not found", 404);
    }

    return apiResponse(product);
  } catch (error) {
    console.error("API ERROR:", error);
    return apiError("Failed to fetch product", 500);
  }
}
