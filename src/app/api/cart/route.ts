import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { getUserIdFromRequest } from "@/lib/auth-utils";
import { apiResponse, apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        c.product_id as id, p.name, p.price, p.image_url, c.quantity, p.stock
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [userId]
    );

    const cartItems = rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: row.price,
      imageUrl: row.image_url,
      quantity: row.quantity,
      stock: row.stock,
    }));

    return apiResponse(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return apiError("Failed to fetch cart", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const { product_id, quantity } = await request.json();

    if (!product_id || typeof quantity !== "number") {
      return apiError("Product ID and quantity are required", 400);
    }

    if (quantity <= 0) {
      return apiError("Quantity must be greater than 0", 400);
    }

    const [existingItem] = await pool.query<RowDataPacket[]>(
      `SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?`,
      [userId, product_id]
    );

    if (existingItem.length > 0) {
      // Dapatkan stok produk
      const [productRows] = await pool.query<RowDataPacket[]>(
        `SELECT stock FROM products WHERE id = ?`,
        [product_id]
      );

      if (productRows.length === 0) {
        return apiError("Product not found", 404);
      }

      const productStock = productRows[0].stock;

      if (quantity > productStock) {
        return apiError(`Cannot add more than ${productStock} items.`, 400);
      }

      // Update quantity (overwrite dengan quantity baru)
      await pool.query(
        `UPDATE cart_items 
         SET quantity = ?, updated_at = NOW() 
         WHERE user_id = ? AND product_id = ?`,
        [quantity, userId, product_id]
      );

      return apiResponse({ message: "Cart item quantity updated" }, { status: 200 });
    } else {
      // Dapatkan stok produk untuk item baru
      const [productRows] = await pool.query<RowDataPacket[]>(
        `SELECT stock FROM products WHERE id = ?`,
        [product_id]
      );

      if (productRows.length === 0) {
        return apiError("Product not found", 404);
      }

      const productStock = productRows[0].stock;

      if (quantity > productStock) {
        return apiError(`Cannot add more than ${productStock} items.`, 400);
      }

      // Insert baru
      await pool.query(
        `INSERT INTO cart_items 
         (id, user_id, product_id, quantity, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, NOW(), NOW())`,
        [userId, product_id, quantity]
      );

      return apiResponse({ message: "Product added to cart" }, { status: 201 });
    }
  } catch (error) {
    console.error("Error adding/updating cart item:", error);
    return apiError("Failed to add/update cart item", 500);
  }
}
