"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { RiDeleteBinLine, RiLoader4Line } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { MainLayout } from "@/components/main-layout";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
}

function formatRupiah(value: number): string {
  if (isNaN(value)) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeout: NodeJS.Timeout;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

export default function CartPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemQuantities = useRef(new Map<string, number>());

  const fetchCartItems = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cart");
      const result = await response.json();

      if (result.success) {
        const mapped = result.data.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
          stock: item.stock,
        }));

        setCartItems(mapped);
        itemQuantities.current = new Map(mapped.map((item: any) => [item.id, item.quantity]));
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Gagal memuat keranjang");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) fetchCartItems();
  }, [authLoading, fetchCartItems]);

  // ==============================
  // UPDATE QUANTITY (NO REFRESH)
  // ==============================
  const updateItemQuantity = async (cartItemId: string, newQuantity: number) => {
    const quantityToSend = Math.max(1, newQuantity);

    const item = cartItems.find((i) => i.id === cartItemId);
    if (!item) return;

    if (quantityToSend > item.stock) {
      setError(`Maksimal beli ${item.stock} untuk ${item.name}`);
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_item_id: cartItemId, quantity: quantityToSend }),
      });

      const result = await response.json();

      if (result.success) {
        // 🔥 HANYA UPDATE 1 ITEM DI STATE
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === cartItemId ? { ...item, quantity: quantityToSend } : item
          )
        );

        itemQuantities.current.set(cartItemId, quantityToSend);
      } else {
        setError(result.message || "Gagal memperbarui jumlah");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setIsUpdating(false);
    }
  };

  // Debounce
  const debouncedUpdateItemQuantity = useCallback(
    debounce((cartItemId: string) => {
      const quantity = itemQuantities.current.get(cartItemId);
      if (quantity !== undefined) updateItemQuantity(cartItemId, quantity);
    }, 600),
    [updateItemQuantity]
  );

  const handleQuantityChange = (cartItemId: string, newQuantity: number) => {
    const item = cartItems.find((i) => i.id === cartItemId);
    if (!item) return;

    const clamped = Math.min(Math.max(1, newQuantity), item.stock);

    setCartItems((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, quantity: clamped } : i))
    );

    itemQuantities.current.set(cartItemId, clamped);
    debouncedUpdateItemQuantity(cartItemId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const val = e.target.value;
    const parsed = val === "" ? 0 : parseInt(val, 10);
    if (!isNaN(parsed)) handleQuantityChange(id, parsed);
  };

  const handleBlur = (id: string, quantity: number) => {
    if (quantity === 0) {
      handleQuantityChange(id, 1);
    } else {
      updateItemQuantity(id, quantity);
    }
  };

  // ==============================
  // DELETE ITEM
  // ==============================
  const removeItemFromCart = async (cartItemId: string) => {
    setIsUpdating(true);

    try {
      const item = cartItems.find((i) => i.id === cartItemId);
      if (!item) return;

      const response = await fetch(`/api/cart/${item.productId}`, { method: "DELETE" });
      const result = await response.json();

      if (result.success) {
        setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
      }
    } catch (err) {
      setError("Gagal menghapus item");
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // ==============================
  // LOADING & ERROR STATES
  // ==============================

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <RiLoader4Line className="animate-spin h-10 w-10 text-primary-red" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl shadow border text-center">
            <RiDeleteBinLine className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Terjadi Kesalahan</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-red text-white py-2 px-4 rounded-lg"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen text-center p-6">
          <div className="bg-white p-10 rounded-xl shadow border">
            <RiDeleteBinLine className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold mb-4">Keranjang Kosong</h1>
            <p className="text-gray-600 mb-6">Belum ada barang di keranjang Anda.</p>
            <Link
              href="/products"
              className="bg-primary-red text-white px-5 py-2 rounded-lg"
            >
              Mulai Belanja
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ==============================
  // MAIN UI
  // ==============================

  return (
    <MainLayout>
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-10 max-w-6xl">

          <h1 className="text-4xl font-bold text-gray-900 mb-10 mt-10">
            Keranjang Belanja Anda
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* LEFT ITEMS */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow border">

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-6 border-b last:border-b-0"
                >
                  {/* Product */}
                  <div className="flex items-center gap-5">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    </div>

                    <div>
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-semibold text-lg text-gray-900 hover:text-primary-red"
                      >
                        {item.name}
                      </Link>

                      <p className="text-gray-600">{formatRupiah(item.price)}</p>

                      {item.stock <= 5 && item.stock > 0 && (
                        <p className="text-sm text-red-500">Stok terbatas: {item.stock}</p>
                      )}

                      {item.stock === 0 && (
                        <p className="text-sm text-red-500">Stok habis</p>
                      )}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-6">

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating}
                        className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-40"
                      >
                        –
                      </button>

                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleInputChange(e, item.id)}
                        onBlur={() => handleBlur(item.id, item.quantity)}
                        className="w-16 text-center border rounded py-2"
                        min={1}
                        max={item.stock}
                      />

                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock || isUpdating}
                        className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-xl font-bold w-28 text-right">
                      {formatRupiah(item.price * item.quantity)}
                    </p>

                    <button
                      onClick={() => removeItemFromCart(item.id)}
                      disabled={isUpdating}
                      className="text-red-500 hover:text-red-700"
                    >
                      <RiDeleteBinLine className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* SUMMARY */}
            <div className="bg-white p-6 rounded-xl shadow border h-fit sticky top-20">

              <h2 className="text-2xl font-bold mb-6">Ringkasan Belanja</h2>

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRupiah(calculateTotal())}</span>
              </div>

              <div className="flex justify-between border-t pt-4 mt-4 text-xl font-bold">
                <span>Total</span>
                <span>{formatRupiah(calculateTotal())}</span>
              </div>

              <Link
                href="/checkout/address"
                className={`mt-8 w-full block text-center bg-primary-red text-white py-3 rounded-lg font-semibold ${
                  isUpdating ? "opacity-50 pointer-events-none" : "hover:bg-red-700"
                }`}
              >
                Lanjutkan ke Pembayaran
              </Link>
            </div>

          </div>
        </div>
      </ProtectedRoute>
    </MainLayout>
  );
}
