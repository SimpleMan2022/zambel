"use client"
import { useRef } from "react";
import {
  RiShoppingCartFill,
  RiStarFill,
  RiStarHalfFill,
  RiStarLine
} from "@remixicon/react";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link"; // Import Link
import { useRouter } from "next/navigation"; // Import useRouter

interface Product {
  id: string;
  name: string;
  image_url: string;
  price: number;
  rating?: number;
  review_count?: number;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCartSuccess?: (productName: string) => void; // Add this prop
}

export default function ProductCard({ product, onAddToCartSuccess }: ProductCardProps) {
  const { id, name, price, image_url, rating, review_count, description } = product;
  const { isAuthenticated, updateCartItemCount, token } = useAuth();
  const router = useRouter(); // Initialize useRouter

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
  };

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
  
    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }
  
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ INI YANG HILANG
        },
        body: JSON.stringify({
          product_id: id,
          quantity: 1,
        }),
      });
  
      const result = await response.json();
  
      if (response.ok && result.success) {
        // ✅ Update cart count (lebih aman)
        const countRes = await fetch("/api/cart/count", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const countData = await countRes.json();
  
        updateCartItemCount(countData.data?.count || 0);
  
        onAddToCartSuccess?.(name);
      } else {
        alert(result.message || "Gagal menambahkan ke keranjang.");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Terjadi kesalahan saat menambahkan ke keranjang.");
    }
  };

  return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">

        {/* Product Image */}
        <Link href={`/products/${id}`} className="relative bg-gray-100 h-48 w-full block overflow-hidden">
          <img
              src={image_url || "/placeholder.svg"}
              alt={name}
              className="w-full h-full object-cover"
          />
        </Link>

        {/* Product Info */}
        <div className="p-6 space-y-4">
          <Link href={`/products/${id}`}><h3 className="font-semibold text-gray-900 hover:text-primary-red transition">{name}</h3></Link>
          {description && <p className="text-gray-600 text-sm line-clamp-2">{description}</p>}

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => {
                const starValue = rating || 0;
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
            </div>
            <span className="text-sm text-gray-600 ml-1">({review_count || 0})</span>
          </div>

          {/* Price & Button */}
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-900">{formatPrice(price)}</span>
            <button
              onClick={handleAddToCart}
              className="bg-primary-red text-white p-2 rounded-lg hover:bg-red-700 transition"
            >
              <RiShoppingCartFill className="w-[18px] h-[18px]" />
            </button>
          </div>

        </div>
      </div>
  )
}
