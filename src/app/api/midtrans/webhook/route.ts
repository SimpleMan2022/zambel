import { NextRequest } from 'next/server';
import { apiResponse, apiError } from '@/lib/api-response';
import pool from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json();
    console.log("Midtrans Webhook Received:", notification);

    const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
    if (!MIDTRANS_SERVER_KEY) {
      return apiError("Missing MIDTRANS_SERVER_KEY", 500);
    }

    // Verify signature
    const expectedSignature = crypto.createHash("sha512")
      .update(
        notification.order_id +
        notification.status_code +
        notification.gross_amount +
        MIDTRANS_SERVER_KEY
      )
      .digest("hex");

    if (expectedSignature !== notification.signature_key) {
      return apiError("Invalid signature", 403);
    }

    const orderNumber = notification.order_id; // we use order_number for Midtrans
    const ts = notification.transaction_status;
    const fs = notification.fraud_status;

    let paymentStatus = "pending";
    let orderStatus = "pending";

    if (ts === "capture") {
      if (fs === "accept") {
        paymentStatus = "paid";
        orderStatus = "processing";
      }
    } else if (ts === "settlement") {
      paymentStatus = "paid";
      orderStatus = "processing";
    } else if (ts === "cancel" || ts === "expire" || ts === "deny") {
      paymentStatus = "failed";
      orderStatus = "cancelled";
    }

    // --- UPDATE ORDERS TABLE ---
    await pool.query(
        `UPDATE orders 
         SET 
           status = ?, 
           payment_status = ?, 
           midtrans_transaction_id = ?, 
           midtrans_status_code = ?, 
           midtrans_payment_type = ?
         WHERE order_number = ?`,
        [
          orderStatus,
          paymentStatus,
          notification.transaction_id,
          notification.status_code,
          notification.payment_type,
          orderNumber,
        ]
      );

    // --- OPTIONAL: SAVE TO PAYMENTS TABLE ---
    await pool.query(
      `INSERT INTO payments (
          id, order_id, user_id, 
          midtrans_transaction_id, midtrans_order_id, 
          amount, payment_method, status,
          created_at, updated_at
       )
       SELECT UUID(), o.id, o.user_id,
              ?, ?, o.total, ?, ?,
              CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
       FROM orders o
       WHERE o.order_number = ?`,
      [
        notification.transaction_id,
        orderNumber,
        notification.payment_type,
        paymentStatus,
        orderNumber,
      ]
    );

    return apiResponse({ message: "Webhook processed successfully" });

  } catch (error) {
    console.error("Webhook Error:", error);
    return apiError("Webhook failed", 500);
  }
}
