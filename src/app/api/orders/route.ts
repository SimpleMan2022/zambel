import { NextRequest } from 'next/server';
import { apiResponse, apiError } from '@/lib/api-response';
import pool from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth-utils';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    let query = `
      SELECT 
          id,
          order_number,
          status,
          subtotal,
          discount,
          shipping_cost,
          tax,
          total,
          payment_status,
          tracking_number,
          estimated_delivery_date,
          created_at
        FROM orders
        WHERE user_id = ?
    `;
    const queryParams: (string | number)[] = [userId];

    if (statusFilter && statusFilter !== 'all') {
      query += ` AND status = ?`;
      queryParams.push(statusFilter);
    }

    query += ` ORDER BY created_at DESC`;

    const [ordersRows] = await pool.query<RowDataPacket[]>(
      query,
      queryParams
    );

    return apiResponse(ordersRows);

  } catch (error) {
    console.error("Error fetching user orders:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to fetch orders", 
      500
    );
  }
}
