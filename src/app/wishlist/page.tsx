"use client";

import { MainLayout } from "@/components/main-layout";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { RiDeleteBinLine, RiStarFill, RiStarHalfFill, RiStarLine } from "@remixicon/react";
import {apiClient} from "@/lib/auth-utils"

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  rating?: number;
  review_count?: number;
  description?: string;
}

export default function WishlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (!isAuthenticated) {
      setError("Please log in to view your wishlist.");
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/api/wishlist");
        const result = await response.json();

        if (result.success) {
          setWishlistItems(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        setError("Failed to load wishlist.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated, authLoading]);

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!isAuthenticated) return;
    try {
      const response = await apiClient.delete(`/api/wishlist/${productId}`);
      const result = await response.json();

      if (result.success) {
        setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
      } else {
        alert(result.message || "Failed to remove item from wishlist.");
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      alert("An error occurred while removing item from wishlist.");
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
  };

  if (loading) {
    return (
      <MainLayout>
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-lg text-gray-700">Loading wishlist...</p>
        </main>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-lg text-red-500">Error: {error}</p>
        </main>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-lg text-gray-700">Silakan login untuk melihat wishlist Anda.</p>
        </main>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Wishlist Anda</h1>

        {wishlistItems.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg">Wishlist Anda kosong.</p>
            <Link href="/products" className="mt-4 inline-block bg-primary-red text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition">
              Jelajahi Produk
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <Link href={`/products/${item.id}`} className="relative h-48 w-full block overflow-hidden">
                  <Image
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </Link>
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{item.name}</h3>
                  {item.description && <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>}
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => {
                      const starValue = item.rating || 0;
                      return (
                        <span key={i}>
                          {starValue >= i + 1 ? (
                            <RiStarFill className="w-4 h-4 text-yellow-400" />
                          ) : starValue >= i + 0.5 ? (
                            <RiStarHalfFill className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <RiStarLine className="w-4 h-4 text-gray-300" />
                          )}
                        </span>
                      );
                    })}
                    <span className="text-xs text-gray-500">({item.review_count || 0})</span>
                  </div>

                  <p className="text-primary-red font-bold text-lg mb-4">{formatPrice(item.price)}</p>
                  
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="mt-auto w-full bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-300 transition flex items-center justify-center gap-2"
                  >
                    <RiDeleteBinLine className="w-5 h-5" /> Hapus dari Wishlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
