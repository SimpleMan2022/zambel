import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth-utils";
import { apiResponse, apiError } from "@/lib/api-response";
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const { data: cartItemsData, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        product_id,
        quantity,
        products (
          name,
          price,
          image_url,
          stock
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cart:", error);
      return apiError("Failed to fetch cart", 500);
    }

    const cartItems = cartItemsData.map((item: any) => ({
      id: item.id,
      productId: item.product_id, // Include product_id here
      name: item.products.name,
      price: item.products.price,
      imageUrl: item.products.image_url,
      quantity: item.quantity,
      stock: item.products.stock,
    }));

    return apiResponse(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return apiError("Failed to fetch cart", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const { product_id, cart_item_id, quantity } = await request.json();

    if ((!product_id && !cart_item_id) || typeof quantity !== "number") {
      return apiError("Product ID or Cart Item ID, and quantity are required", 400);
    }

    if (quantity <= 0) {
      return apiError("Quantity must be greater than 0", 400);
    }

    let targetProductId: string | undefined;
    let currentCartItemId: string | undefined;

    if (cart_item_id) {
      // Scenario: Update existing cart item by cart_item_id
      const { data: cartItemToUpdate, error: fetchCartItemError } = await supabase
        .from("cart_items")
        .select("id, product_id, quantity")
        .eq("id", cart_item_id)
        .eq("user_id", userId)
        .single();

      if (fetchCartItemError || !cartItemToUpdate) {
        console.error("Error fetching cart item to update:", fetchCartItemError);
        return apiError("Cart item not found", 404);
      }
      targetProductId = cartItemToUpdate.product_id;
      currentCartItemId = cartItemToUpdate.id;
    } else if (product_id) {
      // Scenario: Add new product or update existing by product_id
      targetProductId = product_id;
      const { data: existingItem, error: existingItemError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", userId)
        .eq("product_id", product_id)
        .single();

      if (existingItemError && existingItemError.code !== 'PGRST116') {
        console.error("Error checking existing item:", existingItemError);
        return apiError("Failed to check existing cart item", 500);
      }
      if (existingItem) {
        currentCartItemId = existingItem.id;
      }
    }

    if (!targetProductId) {
        return apiError("Invalid product or cart item ID", 400);
    }

    // Get product stock (this is always needed for both scenarios)
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("stock")
      .eq("id", targetProductId)
      .single();

    if (productError || !productData) {
      console.error("Error fetching product stock:", productError);
      return apiError("Product not found", 404);
    }

    const productStock = productData.stock;

    if (quantity > productStock) {
      return apiError(`Cannot add more than ${productStock} items.`, 400);
    }

    if (currentCartItemId) {
      // Update existing cart item
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: quantity })
        .eq("id", currentCartItemId)
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating cart item quantity:", updateError);
        return apiError("Failed to update cart item quantity", 500);
      }
      return apiResponse({ message: "Cart item quantity updated" }, { status: 200 });
    } else {
      // Insert new cart item
      const { error: insertError } = await supabase.from("cart_items").insert({
        id: uuidv4(),
        user_id: userId,
        product_id: targetProductId,
        quantity: quantity,
      });

      if (insertError) {
        console.error("Error inserting new cart item:", insertError);
        return apiError("Failed to add product to cart", 500);
      }
      return apiResponse({ message: "Product added to cart" }, { status: 201 });
    }
  } catch (error) {
    console.error("Error adding/updating cart item:", error);
    return apiError("Failed to add/update cart item", 500);
  }
}
