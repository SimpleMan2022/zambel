import { NextRequest } from "next/server";
import { apiResponse, apiError } from "@/lib/api-response";
import { getUserIdFromRequest } from "@/lib/auth-utils";
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ order_id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return apiError("Unauthorized", 401);

    // 🔥 PARAMS SEKARANG WAJIB DI-AWAIT (Next.js 15)
    const { order_id } = await context.params;

    if (!order_id) return apiError("Order ID is required", 400);

    // ==========================
    // 1. FETCH ORDER + ADDRESS + SHIPPING
    // ==========================
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        user_id,
        status,
        subtotal,
        discount,
        shipping_cost,
        tax,
        total,
        payment_status,
        snap_token,
        midtrans_order_id,
        created_at,
        addresses!shipping_address_id (
          recipient_name,
          phone,
          street,
          city,
          province,
          postal_code,
          label
        ),
        order_shipping (
          courier_service
        )
      `
      )
      .eq("id", order_id)
      .eq("user_id", userId)
      .single();

    if (orderError || !orderData) {
      console.error("Error fetching order:", orderError);
      return apiError("Order not found", 404);
    }

    console.log("Raw orderData:", orderData);
    console.log("Raw orderData.addresses:", orderData.addresses);

    type Address = {
      recipient_name: string;
      phone: string;
      street: string;
      city: string;
      province: string;
      postal_code: string;
      label: string;
    };
    
    const addr = orderData.addresses as unknown as Address | null;
    
    const shipping = orderData.order_shipping?.[0] || null;

    const order = {
      ...orderData,
      order_status: orderData.status,

      ship_recipient_name: addr?.recipient_name || null,
      ship_phone: addr?.phone || null,
      ship_street: addr?.street || null,
      ship_city: addr?.city || null,
      ship_province: addr?.province || null,
      ship_postal_code: addr?.postal_code || null,
      ship_label: addr?.label || null,

      courier_name: shipping?.courier_service || null,
    };


    // Remove nested objects after extraction
    delete (order as any).addresses;
    delete (order as any).order_shipping;

    // ==========================
    // 2. FETCH ORDER ITEMS (JOIN PRODUCTS)
    // ==========================
    const { data: itemRows, error: itemError } = await supabase
      .from("order_items")
      .select(
        `
        id,
        product_id,
        quantity,
        subtotal,
        products (
          name,
          image_url,
          price
        )
      `
      )
      .eq("order_id", order_id);

    if (itemError) {
      console.error("Error fetching order items:", itemError);
      return apiError("Failed to fetch order items", 500);
    }

    const orderItems = itemRows.map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      product_name: item.products.name, // Get name from nested products object
      quantity: item.quantity,
      price_at_purchase: item.products.price, // Get price from nested products object
      subtotal: item.subtotal,
      image_url: item.products.image_url,
    }));

    // ==========================
    // FINAL RESPONSE
    // ==========================
    return apiResponse({
      ...order,
      items: orderItems,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to fetch order details",
      500
    );
  }
}
