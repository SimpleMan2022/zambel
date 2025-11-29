"use client"

import { MainLayout } from "@/components/main-layout";
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  RiStarFill,
  RiStarHalfFill,
  RiStarLine
} from "@remixicon/react"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  review_count: number;
  image_url: string;
  description?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("terbaru")
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })

  const resetFilters = () => {
    setSelectedRating(null)
    setPriceRange({ min: "", max: "" })
  }

  const hasActiveFilters = selectedRating !== null || priceRange.min !== "" || priceRange.max !== ""

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products");
        const result = await response.json();

        if (result.success) {
          setProducts(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    if (selectedRating && product.rating < selectedRating) return false
    if (priceRange.min && product.price < Number.parseInt(priceRange.min)) return false
    if (priceRange.max && product.price > Number.parseInt(priceRange.max)) return false
    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "terbaru") {
      // Assuming `createdAt` or similar field exists for sorting by newest
      // For now, let's just use the default order from the API
      return 0;
    } else if (sortBy === "harga-terendah") {
      return a.price - b.price;
    } else if (sortBy === "harga-tertinggi") {
      return b.price - a.price;
    } else if (sortBy === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton height={30} width={200} className="mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar Skeleton */}
            <div className="md:col-span-1 bg-white rounded-lg p-6 space-y-6">
              <Skeleton height={25} width="60%" />
              <Skeleton height={150} />
              <Skeleton height={100} />
              <Skeleton height={40} width="100%" />
            </div>

            {/* Products Grid Skeleton */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                  <Skeleton height={192} className="w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton height={20} width="80%" />
                    <Skeleton height={15} width="40%" />
                    <Skeleton height={20} width="60%" />
                    <Skeleton height={40} width="100%" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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

  return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Semua Produk</h1>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Urutkan:</label>
              <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
              >
                <option value="terbaru">Terbaru</option>
                <option value="harga-terendah">Harga Terendah</option>
                <option value="harga-tertinggi">Harga Tertinggi</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg p-6 space-y-6">
                <h3 className="font-bold text-gray-900">Filter</h3>

                {/* Rating */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Rating</h4>
                  <div className="space-y-2">
                    {[5, 4, 3].map((rating) => (
                        <label key={rating} className="flex items-center cursor-pointer">
                          <input
                              type="radio"
                              name="rating"
                              value={rating}
                              checked={selectedRating === rating}
                              onChange={() => setSelectedRating(rating)}
                              className="mr-3"
                          />
                          <span className="text-sm text-gray-700">Bintang {rating}</span>
                        </label>
                    ))}
                  </div>
                </div>

                {/* Harga */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Harga</h4>
                  <div className="space-y-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {hasActiveFilters && (
                    <button
                        onClick={resetFilters}
                        className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition"
                    >
                      Reset Semua Filter
                    </button>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="relative h-48 bg-gray-100">
                        <Image
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>

                        {/* Rating pakai Remix Icon */}
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => {
                            const starValue = product.rating || 0;
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
                          <span className="text-xs text-gray-500">({product.review_count})</span>
                        </div>

                        <p className="text-red-600 font-bold mb-3">
                          Rp{product.price.toLocaleString("id-ID")}
                        </p>

                        <button className="w-full bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition">
                          Lihat Detail
                        </button>
                      </div>
                    </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
  )
}
