import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, apiError } from '@/lib/api-response';
import { getUserIdFromRequest } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

interface CartItem {
  product_id: string;
  quantity: number;
}

interface ShippingAddressData {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string; // Maps to 'street'
  addressLine2?: string;
  provinceCode: string;
  provinceName: string;
  regencyCode: string;
  regencyName: string; // Maps to 'city' name
  districtCode: string;
  districtName: string; // Maps to 'district' name
  postalCode: string;
  notes?: string; // Maps to 'label'
}

interface SelectedShippingMethod {
  courierCode: string;
  service: string; 
  description: string;
  cost: number;
  etd: string; 
  total_weight: number; // New: total weight from cart
  origin_district_code: string; // New: origin district code
  destination_district_code: string; // New: destination district code
}

interface CheckoutRequest {
  cartItems: CartItem[];
  shippingAddress: ShippingAddressData;
  selectedShippingMethod: SelectedShippingMethod;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const body: CheckoutRequest = await request.json();
    const { cartItems, shippingAddress, selectedShippingMethod } = body;

    if (!cartItems || cartItems.length === 0) {
      return apiError("Cart is empty", 400);
    }
    if (!shippingAddress || !selectedShippingMethod) {
      return apiError("Missing shipping address or method details", 400);
    }

    // 1. Validate cart items and fetch product details
    const productIds = cartItems.map(item => item.product_id);
    const { data: productsRows, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, stock, image_url")
      .in("id", productIds)
      .eq("is_active", true);

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return apiError("Failed to fetch product details", 500);
    }

    const productsMap = new Map<string, {
      id: string;
      name: string;
      price: number;
      stock: number;
      image_url: string;
    }>();
    productsRows?.forEach((row: { id: string; name: string; price: number; stock: number; image_url: string; }) => productsMap.set(row.id, row));

    let subtotalAmount = 0;
    const orderItemsData = [];
    const midtransItemDetails: any[] = [];

    for (const item of cartItems) {
      const product = productsMap.get(item.product_id);
      if (!product) {
        return apiError(`Product with ID ${item.product_id} not found or inactive`, 404);
      }
      if (product.stock < item.quantity) {
        return apiError(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`, 400);
      }

      subtotalAmount += product.price * item.quantity;
      orderItemsData.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        price_at_purchase: product.price,
        image_url: product.image_url,
      });
      midtransItemDetails.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }

    // 2. Get shipping cost from selectedShippingMethod
    const shippingCost = selectedShippingMethod.cost;
    const discountAmount = 0; // Placeholder for discount
    const taxAmount = 0; // Placeholder for tax
    const totalAmount = subtotalAmount + shippingCost - discountAmount + taxAmount; // Total amount for Midtrans and orders table

    // 3. Save shipping address into `addresses` table
    const shippingAddressId = uuidv4();
    const { error: addressInsertError } = await supabase
      .from("addresses")
      .insert({
        id: shippingAddressId,
        user_id: userId,
        label: shippingAddress.notes || 'Default Shipping Address',
        recipient_name: shippingAddress.fullName,
        phone: shippingAddress.phone,
        street: shippingAddress.addressLine1,
        city: shippingAddress.regencyName,
        province: shippingAddress.provinceName,
        postal_code: shippingAddress.postalCode,
        is_default: false,
      });

    if (addressInsertError) {
      console.error("Error inserting address:", addressInsertError);
      return apiError("Failed to save shipping address", 500);
    }

    // 4. Create new order into `orders` table
    const orderId = uuidv4();
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`; // Simple unique order number

    const { error: orderInsertError } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        order_number: orderNumber,
        user_id: userId,
        status: "pending",
        subtotal: subtotalAmount,
        discount: discountAmount,
        shipping_cost: shippingCost,
        tax: taxAmount,
        total: totalAmount,
        shipping_address_id: shippingAddressId,
        tracking_number: null,
        estimated_delivery_date: new Date(Date.now() + (parseInt(selectedShippingMethod.etd?.replace(/[^\d-]/g, '').split('-')[0] || '0') * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10),
        payment_status: "pending",
        snap_token: null,
        midtrans_order_id: null,
        notes: shippingAddress.notes || null,
      });

    if (orderInsertError) {
      console.error("Error inserting order:", orderInsertError);
      return apiError("Failed to create order", 500);
    }

    // 5. Save order shipping details into `order_shipping` table
    const orderShippingId = uuidv4();
    const { error: orderShippingInsertError } = await supabase
      .from("order_shipping")
      .insert({
        id: orderShippingId,
        order_id: orderId,
        courier_code: selectedShippingMethod.courierCode,
        courier_service: selectedShippingMethod.service,
        courier_description: selectedShippingMethod.description,
        courier_etd: selectedShippingMethod.etd,
        cost: selectedShippingMethod.cost,
        weight: selectedShippingMethod.total_weight,
        origin_district: selectedShippingMethod.origin_district_code,
        destination_district: selectedShippingMethod.destination_district_code,
        raw_response: selectedShippingMethod, // Supabase can handle JSONB directly
      });

    if (orderShippingInsertError) {
      console.error("Error inserting order shipping:", orderShippingInsertError);
      return apiError("Failed to save order shipping details", 500);
    }

    // 6. Save order items
    const orderItemsToInsert = orderItemsData.map(item => ({
      id: uuidv4(),
      order_id: orderId,
      product_id: item.product_id,
      variant_id: null, // Assuming no product variants for now
      name: item.product_name,
      quantity: item.quantity,
      price: item.price_at_purchase,
      subtotal: item.quantity * item.price_at_purchase,
    }));

    const { error: orderItemsInsertError } = await supabase.from("order_items").insert(orderItemsToInsert);

    if (orderItemsInsertError) {
      console.error("Error inserting order items:", orderItemsInsertError);
      return apiError("Failed to save order items", 500);
    }

    // 7. Deduct product stock
    const stockUpdatePromises = cartItems.map(async (item) => {
      const { error: stockUpdateError } = await supabase
        .from("products")
        .update({ stock: productsMap.get(item.product_id)!.stock - item.quantity })
        .eq("id", item.product_id);
      if (stockUpdateError) {
        throw new Error(`Failed to update stock for product ${item.product_id}: ${stockUpdateError.message}`);
      }
    });
    await Promise.all(stockUpdatePromises);

    // 8. Clear the user's cart
    const { error: cartClearError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (cartClearError) {
      console.error("Error clearing cart:", cartClearError);
      return apiError("Failed to clear cart", 500);
    }

    // 9. Initiate Midtrans Transaction
    const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
    const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    if (!MIDTRANS_SERVER_KEY || !NEXT_PUBLIC_BASE_URL) {
      throw new Error("Midtrans server key or base URL is not configured.");
    }

    // Midtrans transaction payload for Snap API
    const midtransTransactionDetails = {
      transaction_details: {
        order_id: orderNumber, 
        gross_amount: totalAmount, 
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name: shippingAddress.fullName.split(' ')[0],
        last_name: shippingAddress.fullName.split(' ').slice(1).join(' '),
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        billing_address: {
          first_name: shippingAddress.fullName.split(' ')[0],
          last_name: shippingAddress.fullName.split(' ').slice(1).join(' '),
          address: shippingAddress.addressLine1,
          city: shippingAddress.regencyName,
          postal_code: shippingAddress.postalCode,
          phone: shippingAddress.phone,
          country_code: 'IDN',
        },
        shipping_address: {
          first_name: shippingAddress.fullName.split(' ')[0],
          last_name: shippingAddress.fullName.split(' ').slice(1).join(' '),
          address: shippingAddress.addressLine1,
          city: shippingAddress.regencyName,
          postal_code: shippingAddress.postalCode,
          phone: shippingAddress.phone,
          country_code: 'IDN',
        },
      },
      item_details: midtransItemDetails.concat([{ 
        id: 'shipping_cost',
        name: `Biaya Pengiriman (${selectedShippingMethod.courierCode.toUpperCase()} - ${selectedShippingMethod.service})`,
        price: shippingCost,
        quantity: 1,
      }]),
      callbacks: {
        notification: `${NEXT_PUBLIC_BASE_URL}/api/midtrans/webhook`,
        finish: `${NEXT_PUBLIC_BASE_URL}/order-confirmation/${orderId}`,
        error: `${NEXT_PUBLIC_BASE_URL}/order-confirmation/${orderId}?status=error`,
        pending: `${NEXT_PUBLIC_BASE_URL}/order-confirmation/${orderId}?status=pending`,
      }
    };

    const midtransResponse = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${btoa(MIDTRANS_SERVER_KEY + ':')}`,
      },
      body: JSON.stringify(midtransTransactionDetails),
    });

    const midtransResult = await midtransResponse.json();

    if (midtransResponse.ok && midtransResult.token && midtransResult.redirect_url) {
      // Update order with Midtrans transaction ID (if available, sometimes only token)
      await supabase
        .from("orders")
        .update({ snap_token: midtransResult.token, midtrans_order_id: orderId, payment_status: "pending" })
        .eq("id", orderId);

      return apiResponse({
        orderId,
        orderNumber,
        totalAmount,
        shippingCost,
        midtransSnapToken: midtransResult.token,
        midtransRedirectUrl: midtransResult.redirect_url,
      }, { status: 201 });
    } else {
      console.error("Midtrans Snap API failed to create transaction:", midtransResult);
      return apiError(midtransResult.snap_token || midtransResult.error_messages?.join(', ') || "Failed to initiate Midtrans transaction", 500);
    }
  } catch (error) {
    console.error("Checkout API error:", error);
    return apiError(error instanceof Error ? error.message : "An unexpected error occurred during checkout", 500);
  }
}
