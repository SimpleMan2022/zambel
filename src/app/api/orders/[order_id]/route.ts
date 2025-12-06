import { NextRequest } from "next/server";
import { apiResponse, apiError } from "@/lib/api-response";
import { getUserIdFromRequest } from "@/lib/auth-utils";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ order_id: string }> }
) {
  try {
    // ==========================
    // 1. AUTH CHECK
    // ==========================
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const { order_id } = await context.params;
    if (!order_id) {
      return apiError("Order ID is required", 400);
    }

    // ==========================
    // 2. FETCH ORDER + ADDRESS + SHIPPING
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
          tracking_number,
          estimated_delivery_date,
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
            courier_code,
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

    // ==========================
    // 3. FLATTEN ADDRESS & SHIPPING
    // ==========================
    type Address = {
      recipient_name: string;
      phone: string;
      street: string;
      city: string;
      province: string;
      postal_code: string;
      label: string;
    };

    const address = orderData.addresses as unknown as Address | null;
    const shipping = orderData.order_shipping?.[0] || null;

    const order = {
      id: orderData.id,
      order_number: orderData.order_number,
      status: orderData.status,
      order_status: orderData.status,

      subtotal: orderData.subtotal,
      discount: orderData.discount,
      shipping_cost: orderData.shipping_cost,
      tax: orderData.tax,
      total: orderData.total,

      payment_status: orderData.payment_status,
      snap_token: orderData.snap_token,
      midtrans_order_id: orderData.midtrans_order_id,

      tracking_number: orderData.tracking_number,
      estimated_delivery_date: orderData.estimated_delivery_date,
      created_at: orderData.created_at,

      ship_recipient_name: address?.recipient_name || null,
      ship_phone: address?.phone || null,
      ship_street: address?.street || null,
      ship_city: address?.city || null,
      ship_province: address?.province || null,
      ship_postal_code: address?.postal_code || null,
      ship_label: address?.label || null,

      courier_code: shipping?.courier_code || null,
      courier_name: shipping?.courier_service || null,
    };

    // ==========================
    // 4. FETCH ORDER ITEMS + PRODUCTS
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

    const orderItems =
      itemRows?.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.products?.name || null,
        quantity: item.quantity,
        price_at_purchase: item.products?.price || null,
        subtotal: item.subtotal,
        image_url: item.products?.image_url || null,
      })) || [];

    // ==========================
    // 5. FINAL RESPONSE (STYLE SAMA DENGAN LIST ORDER API)
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
