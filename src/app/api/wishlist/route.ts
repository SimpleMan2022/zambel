import { apiResponse, apiError } from "@/lib/api-response";
import { getUserIdFromRequest } from "@/lib/auth-utils"; 
import { NextRequest } from "next/server";
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request); 

    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const { product_id } = await request.json();

    if (!product_id) {
      return apiError("Product ID is required", 400);
    }

    // Check if the product already exists in the wishlist
    const { data: existing, error: existingError } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", product_id)
      .single();

    if (existingError && existingError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Error checking existing wishlist item:", existingError);
      return apiError("Failed to check existing wishlist item", 500);
    }

    if (existing) {
      return apiResponse({ message: "Product already in wishlist" }, { status: 200, success: true });
    }

    // Add to wishlist
    const { error: insertError } = await supabase
      .from("wishlist")
      .insert({ id: uuidv4(), user_id: userId, product_id: product_id });

    if (insertError) {
      console.error("Error adding product to wishlist:", insertError);
      return apiError("Failed to add product to wishlist", 500);
    }

    return apiResponse({ message: "Product added to wishlist" }, { status: 201, success: true });
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    return apiError("Failed to add product to wishlist", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request); 

    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const { data: wishlistItemsData, error } = await supabase
      .from("wishlist")
      .select(
        `
        id,
        products (
          id,
          name,
          price,
          image_url,
          rating,
          review_count,
          description
        )
        `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wishlist:", error);
      return apiError("Failed to fetch wishlist", 500);
    }

    const wishlistItems = wishlistItemsData.map((item: any) => ({
      id: item.products.id,
      name: item.products.name,
      price: item.products.price,
      image_url: item.products.image_url,
      rating: item.products.rating,
      review_count: item.products.review_count,
      description: item.products.description,
    }));

    return apiResponse(wishlistItems);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return apiError("Failed to fetch wishlist", 500);
  }
}
