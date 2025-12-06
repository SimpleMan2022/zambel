import { NextRequest } from 'next/server';
import { apiResponse, apiError } from '@/lib/api-response';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json();
    console.log("Midtrans Webhook Received:", notification);

    const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
    if (!MIDTRANS_SERVER_KEY) {
      return apiError("Missing MIDTRANS_SERVER_KEY", 500);
    }

    // ✅ VERIFY SIGNATURE
    const expectedSignature = crypto
      .createHash("sha512")
      .update(
        notification.order_id +
          notification.status_code +
          notification.gross_amount +
          MIDTRANS_SERVER_KEY
      )
      .digest("hex");

    if (expectedSignature !== notification.signature_key) {
      console.error("Invalid Midtrans signature");
      return apiError("Invalid signature", 403);
    }

    const orderNumber = notification.order_id;
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
    } else if (ts === "refund" || ts === "partial_refund" || ts === "chargeback") {
      paymentStatus = "refunded";
      orderStatus = "cancelled";
    }

    // ✅ UPDATE ORDER (ORDER_NUMBER ATAU MIDTRANS_ORDER_ID)
    const { data: updatedOrder, error: updateOrderError } = await supabase
      .from("orders")
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        midtrans_transaction_id: notification.transaction_id,
        midtrans_status_code: notification.status_code,
        midtrans_payment_type: notification.payment_type,
      })
      .eq("order_number", orderNumber)
      .select("id, user_id, total")
      .single();

    if (updateOrderError || !updatedOrder) {
      console.error("Error updating order:", updateOrderError);
      return apiError("Failed to update order status", 500);
    }

    // ✅ ANTI DUPLICATE PAYMENT
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("midtrans_transaction_id", notification.transaction_id)
      .single();

    if (!existingPayment) {
      const { error: insertPaymentError } = await supabase
        .from("payments")
        .insert({
          id: uuidv4(),
          order_id: updatedOrder.id,
          user_id: updatedOrder.user_id,
          midtrans_transaction_id: notification.transaction_id,
          midtrans_order_id: orderNumber,
          amount: updatedOrder.total,
          payment_method: notification.payment_type,
          status: paymentStatus,
        });

      if (insertPaymentError) {
        console.error("Error inserting payment:", insertPaymentError);
      }
    }

    return apiResponse({ message: "Webhook processed successfully" });

  } catch (error) {
    console.error("Webhook Error:", error);
    return apiError("Webhook failed", 500);
  }
}
