"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  stock: number; // Add stock property
}

function formatRupiah(value: number): string {
  if (isNaN(value)) return "Rp0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

// Debounce utility function
function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeout: NodeJS.Timeout;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
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

  // Using a ref to hold the latest quantity for debounced updates
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
      if (!response.ok) {
        throw new Error("Failed to fetch cart items");
      }
      const result = await response.json();
      if (result.success) {
        setCartItems(result.data);
        // Initialize ref with current cart quantities
        itemQuantities.current = new Map(result.data.map((item: CartItem) => [item.id, item.quantity]));
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
    // Ensure quantity is not less than 1 if it's not meant for removal
    const quantityToSend = Math.max(0, newQuantity);

    if (quantityToSend === 0) {
      await removeItemFromCart(productId);
      return;
    }

    const itemToUpdate = cartItems.find(item => item.id === productId);
    if (!itemToUpdate) return; // Should not happen

    if (quantityToSend > itemToUpdate.stock) {
      setError(`Cannot add more than ${itemToUpdate.stock} items for ${itemToUpdate.name}.`);
      // Revert local state for this item if stock is exceeded
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity: itemQuantities.current.get(productId) || 1 } : item
        )
      );
      itemQuantities.current.set(productId, itemQuantities.current.get(productId) || 1); // Update ref too
      return;
    }

    setIsUpdating(true);
    setError(null);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity: quantityToSend }),
      });

      if (!response.ok) {
        throw new Error("Failed to update cart item quantity");
      }

      const result = await response.json();
      if (result.success) {
        // Refetch cart items to get the latest state from the backend including stock checks
        fetchCartItems(); 
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

  // Debounced version that calls updateItemQuantity
  const debouncedUpdateItemQuantity = useCallback(
    debounce((productId: string) => {
      const quantity = itemQuantities.current.get(productId);
      if (quantity !== undefined) {
        updateItemQuantity(productId, quantity);
      }
    }, 1000), // Debounce for 1000ms (1 second)
    [updateItemQuantity]
  );

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const item = cartItems.find((i) => i.id === productId);
    if (!item) return;

    const clampedQuantity = Math.min(Math.max(1, newQuantity), item.stock);

    setCartItems((prevItems) =>
      prevItems.map((i) => (i.id === productId ? { ...i, quantity: clampedQuantity } : i))
    );
    itemQuantities.current.set(productId, clampedQuantity);
    debouncedUpdateItemQuantity(productId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    const value = e.target.value;
    const newQuantity = value === "" ? 0 : parseInt(value, 10);

    if (isNaN(newQuantity)) {
      // Optionally, set error or prevent non-numeric input
      return;
    }

    handleQuantityChange(productId, newQuantity);
  };

  const handleBlur = (productId: string, currentQuantity: number) => {
    // If the input is empty or invalid after blur, revert to 1 or last valid quantity
    if (currentQuantity === 0) {
      handleQuantityChange(productId, 1);
    } else {
      // Ensure the debounced update is triggered immediately on blur if there were pending changes
      const quantity = itemQuantities.current.get(productId);
      if (quantity !== undefined) {
        updateItemQuantity(productId, quantity);
      }
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
        itemQuantities.current.delete(productId); // Remove from ref
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

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <RiLoader4Line className="animate-spin h-10 w-10 text-primary-red" />
          <span className="ml-3 text-lg text-gray-700">Memuat keranjang Anda...</span>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 shadow-md text-center border border-gray-200">
            <RiDeleteBinLine className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Terjadi Kesalahan</h1>
            <p className="text-gray-700 text-lg mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-primary-red text-white font-semibold py-2 px-5 rounded-md hover:bg-red-700 transition">
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
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 shadow-md text-center border border-gray-200">
            <RiDeleteBinLine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Keranjang Belanja Kosong</h1>
            <p className="text-gray-700 text-lg mb-6">Sepertinya Anda belum menambahkan apa pun ke keranjang.</p>
            <Link href="/products" className="bg-primary-red text-white font-semibold py-2 px-5 rounded-md hover:bg-red-700 transition">
              Mulai Belanja
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8 md:py-12 min-h-screen">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Keranjang Belanja Anda</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-4 border-b last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden border border-gray-100">
                      <Image
                        src={item.imageUrl || "/images/placeholder.jpg"}
                        alt={item.name}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div>
                      <Link href={`/products/${item.id}`} className="text-lg font-semibold text-gray-800 hover:text-primary-red transition">
                        {item.name}
                      </Link>
                      <p className="text-gray-600">{formatRupiah(item.price)}</p>
                      {item.stock <= 5 && item.stock > 0 && (
                        <p className="text-sm text-red-500 mt-1">Stok terbatas: {item.stock}</p>
                      )}
                      {item.stock === 0 && (
                        <p className="text-sm text-red-500 mt-1">Stok habis</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center rounded-md border border-gray-300">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-700 bg-gray-100 rounded-l-md hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Decrease quantity"
                        disabled={item.quantity <= 1 || isUpdating}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleInputChange(e, item.id)}
                        onBlur={() => handleBlur(item.id, item.quantity)}
                        className="w-12 text-center py-1 outline-none focus:ring-2 focus:ring-primary-red"
                        min="1"
                        max={item.stock}
                        disabled={isUpdating || item.stock === 0}
                      />
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-700 bg-gray-100 rounded-r-md hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                        disabled={item.quantity >= item.stock || isUpdating}
                      >
                        +
                      </button>
                    </div>

                    <p className="text-lg font-semibold text-gray-900 w-24 text-right">
                      {formatRupiah(item.price * item.quantity)}
                    </p>

                    <button
                      onClick={() => removeItemFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Remove item"
                      disabled={isUpdating}
                    >
                      <RiDeleteBinLine className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 h-fit flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Ringkasan Belanja</h2>

                <div className="flex justify-between text-gray-700 mb-3">
                  <span>Subtotal</span>
                  <span>{formatRupiah(calculateTotal())}</span>
                </div>

                <div className="flex justify-between text-lg font-semibold text-gray-900 border-t pt-4 mt-4">
                  <span>Total</span>
                  <span>{formatRupiah(calculateTotal())}</span>
                </div>

                <Link
                  href="/checkout/address"
                  className={`mt-6 block w-full bg-primary-red text-white font-bold py-3 px-6 rounded-md text-lg text-center transition-colors ${
                    isUpdating ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
                  }`}
                  aria-disabled={isUpdating}
                >
                  Lanjutkan ke Pembayaran
                </Link>
              </div>
            </div>

          </div>
        </div>
      </ProtectedRoute>
    </MainLayout>
  );
}
