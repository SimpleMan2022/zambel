export const runtime = "nodejs";

import { NextRequest } from 'next/server';
import { apiResponse, apiError } from '@/lib/api-response';
import { getUserIdFromRequest } from '@/lib/auth-utils';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    let query = supabase
      .from('orders')
      .select(
        `
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
        `
      )
      .eq('user_id', userId);

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: ordersRows, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching user orders:", error);
      return apiError("Failed to fetch orders", 500);
    }

    return apiResponse(ordersRows);

  } catch (error) {
    console.error("Error fetching user orders:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to fetch orders", 
      500
    );
  }
}
