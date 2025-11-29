import { NextRequest } from "next/server";
import { apiResponse, apiError } from "@/lib/api-response";
import pool from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth-utils";
import { RowDataPacket } from "mysql2";

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
    // 1. FETCH ORDER + ADDRESS
    // ==========================
    const [orderRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
          o.id,
          o.order_number,
          o.user_id,
          o.status AS order_status,
          o.subtotal,
          o.discount,
          o.shipping_cost,
          o.tax,
          o.total,
          o.payment_status,
          o.snap_token,
          o.midtrans_order_id,
          o.created_at,

          a.recipient_name AS ship_recipient_name,
          a.phone AS ship_phone,
          a.street AS ship_street,
          a.city AS ship_city,
          a.province AS ship_province,
          a.postal_code AS ship_postal_code,
          a.label AS ship_label

       FROM orders o
       JOIN addresses a ON o.shipping_address_id = a.id
       LEFT JOIN order_shipping os ON o.id = os.order_id
       WHERE o.id = ? AND o.user_id = ?`,
      [order_id, userId]
    );

    if (orderRows.length === 0)
      return apiError("Order not found", 404);

    const order = orderRows[0];

    // ==========================
    // 2. FETCH ORDER ITEMS (JOIN PRODUCTS)
    // ==========================
    const [itemRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
          oi.id,
          oi.product_id,
          oi.name AS product_name,
          oi.quantity,
          oi.price AS price_at_purchase,
          oi.subtotal,

          p.image_url

        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?`,
      [order_id]
    );

    // ==========================
    // FINAL RESPONSE
    // ==========================
    return apiResponse({
      ...order,
      courier_name: (order as any).courier_service || null, // Assuming courier_service from order_shipping is courier name
      items: itemRows,
    });

  } catch (error) {
    console.error("Error fetching order details:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to fetch order details",
      500
    );
  }
}
