import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiResponse, apiError } from '@/lib/api-response';
import pool from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';
import type { RowDataPacket } from 'mysql2';
import { Buffer } from 'buffer'; // Import Buffer

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
    const [productsRows] = await pool.query<RowDataPacket[]>
      (`SELECT id, name, price, stock, image_url FROM products WHERE id IN (?) AND is_active = TRUE`,
        [productIds]
      );

    const productsMap = new Map<string, {
      id: string;
      name: string;
      price: number;
      stock: number;
      image_url: string;
    }>();
    productsRows.forEach(row => productsMap.set(row.id, row as any));

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

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 3. Save shipping address into `addresses` table
      const shippingAddressId = uuidv4();
      await connection.query(
        `INSERT INTO addresses (id, user_id, label, recipient_name, phone, street, city, province, postal_code, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          shippingAddressId,
          userId,
          shippingAddress.notes || 'Default Shipping Address',
          shippingAddress.fullName,
          shippingAddress.phone,
          shippingAddress.addressLine1, // Maps to 'street'
          shippingAddress.regencyName, // Maps to 'city' name
          shippingAddress.provinceName, // Maps to 'province' name
          shippingAddress.postalCode,
          false, // is_default
        ]
      );

      // 4. Create new order into `orders` table
      const orderId = uuidv4();
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`; // Simple unique order number

      await connection.query(
        `INSERT INTO orders (
            id, 
            order_number, 
            user_id, 
            status, 
            subtotal, 
            discount, 
            shipping_cost, 
            tax, 
            total, 
            shipping_address_id,
            tracking_number, 
            estimated_delivery_date, 
            payment_status, 
            snap_token, 
            midtrans_order_id, 
            notes,
            created_at, 
            updated_at
          ) 
          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )`,
          [
            orderId,
            orderNumber,
            userId,
            "pending",
            subtotalAmount,
            discountAmount,
            shippingCost,
            taxAmount,
            totalAmount,
            shippingAddressId,
            null, // tracking_number (initially null)
            new Date(Date.now() + (parseInt(selectedShippingMethod.etd?.replace(/[^\d-]/g, '').split('-')[0] || '0') * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10), // estimated_delivery_date
            "pending",
            null, // snap_token
            null, // midtrans_order_id
            shippingAddress.notes || null,
          ]
        );

      // 5. Save order shipping details into `order_shipping` table
      const orderShippingId = uuidv4();
      // const etdFirstDigit = parseInt(selectedShippingMethod.etd?.replace(/[^\d-]/g, '').split('-')[0] || '0');
      // const estimatedDeliveryDate = new Date(Date.now() + (etdFirstDigit * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10); // Simple calc

      await connection.query(
        `INSERT INTO order_shipping (id, order_id, courier_code, courier_service, courier_description, courier_etd, cost, weight, origin_district, destination_district, raw_response, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          orderShippingId,
          orderId,
          selectedShippingMethod.courierCode,
          selectedShippingMethod.service,
          selectedShippingMethod.description,
          selectedShippingMethod.etd,
          selectedShippingMethod.cost,
          selectedShippingMethod.total_weight,
          selectedShippingMethod.origin_district_code,
          selectedShippingMethod.destination_district_code,
          JSON.stringify(selectedShippingMethod), 
        ]
      );

      // 6. Save order items
      const orderItemPromises = orderItemsData.map(item =>
        connection.query(
          `INSERT INTO order_items (id, order_id, product_id, variant_id, name, quantity, price, subtotal, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            uuidv4(),
            orderId,
            item.product_id,
            null,
            item.product_name,
            item.quantity,
            item.price_at_purchase,
            item.quantity * item.price_at_purchase
          ]
        )
      );
      await Promise.all(orderItemPromises);

      // 7. Deduct product stock
      const stockUpdatePromises = cartItems.map(item =>
        connection.query(
          `UPDATE products SET stock = stock - ? WHERE id = ?`,
          [item.quantity, item.product_id]
        )
      );
      await Promise.all(stockUpdatePromises);

      // 8. Clear the user's cart
      await connection.query(
        `DELETE FROM cart_items WHERE user_id = ?`,
        [userId]
      ); // Note: Assuming cart table is named 'cart', not 'cart_items'

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
          'Authorization': `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')}`,
        },
        body: JSON.stringify(midtransTransactionDetails),
      });

      const midtransResult = await midtransResponse.json();

      if (midtransResponse.ok && midtransResult.token && midtransResult.redirect_url) {
        // Update order with Midtrans transaction ID (if available, sometimes only token)
        await connection.query(
          `UPDATE orders SET snap_token = ?, midtrans_order_id = ?, payment_status = ? WHERE id = ?`,
          [midtransResult.token, orderId, "pending", orderId] // Initial status
        );

        await connection.commit();

        return apiResponse({
          orderId,
          orderNumber,
          totalAmount,
          shippingCost,
          midtransSnapToken: midtransResult.token,
          midtransRedirectUrl: midtransResult.redirect_url,
        }, { status: 201 });
      } else {
        await connection.rollback();
        console.error("Midtrans Snap API failed to create transaction:", midtransResult);
        return apiError(midtransResult.snap_token || midtransResult.error_messages?.join(', ') || "Failed to initiate Midtrans transaction", 500);
      }

    } catch (dbError) {
      await connection.rollback();
      console.error("Database transaction error during checkout:", dbError);
      return apiError("Failed to process order. Please try again.", 500);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Checkout API error:", error);
    return apiError(error instanceof Error ? error.message : "An unexpected error occurred during checkout", 500);
  }
}
