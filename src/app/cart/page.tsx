"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { RiDeleteBinLine, RiLoader4Line } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { ProtectedRoute } from "@/components/protected-route";
import { MainLayout } from "@/components/main-layout";

interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export default function CartPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCartItems = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) {
        throw new Error("Failed to fetch cart items");
      }
      const result = await response.json();
      if (result.success) {
        setCartItems(result.data);
      } else {
        setError(result.message || "Failed to fetch cart items");
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      fetchCartItems();
    }
  }, [authLoading, fetchCartItems]);

  const updateItemQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) { 
      await removeItemFromCart(productId); 
      return; 
    }
    setIsUpdating(true);
    setError(null);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update cart item quantity");
      }

      const result = await response.json();
      if (result.success) {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
          )
        );
      } else {
        setError(result.message || "Failed to update cart item quantity");
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItemFromCart = async (productId: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      }

      const result = await response.json();
      if (result.success) {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
      } else {
        setError(result.message || "Failed to remove item from cart");
      }
    } catch (err) {
      console.error("Error removing item:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (authLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <Skeleton className="w-20 h-20 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
          <div className="md:col-span-1 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">Keranjang Belanja</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="w-20 h-20 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
              <div className="md:col-span-1 space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl text-gray-600">Keranjang Anda kosong.</p>
              <Link href="/products" className="mt-4 inline-block bg-primary-red text-white px-6 py-2 rounded-full hover:bg-red-700 transition">
                Belanja Sekarang
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg shadow-sm">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.imageUrl || "/placeholder-image.jpg"}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                        className="rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold"><Link href={`/products/${item.id}`} className="hover:text-primary-red transition">{item.name}</Link></h2>
                      <p className="text-gray-600">Rp {item.price.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        disabled={isUpdating}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center border-b pb-1">{item.quantity}</span>
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        disabled={isUpdating}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItemFromCart(item.id)}
                      disabled={isUpdating}
                      className="p-2 text-red-500 hover:text-red-700 transition disabled:opacity-50"
                    >
                      {isUpdating ? <RiLoader4Line className="animate-spin w-5 h-5" /> : <RiDeleteBinLine className="w-5 h-5" />}
                    </button>
                  </div>
                ))}
              </div>

              <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg shadow-sm h-fit">
                <h2 className="text-xl font-bold mb-4">Ringkasan Belanja</h2>
                <div className="flex justify-between items-center mb-4 text-lg">
                  <span>Total:</span>
                  <span className="font-bold">Rp {calculateTotal().toLocaleString("id-ID")}</span>
                </div>
                <Link
                  href="/checkout/address"
                  className="w-full inline-block text-center bg-primary-red text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  Lanjutkan ke Pembayaran
                </Link>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
