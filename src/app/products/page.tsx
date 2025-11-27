"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/navbar"
import FooterSection from "@/components/footer-section"
import { RiStarFill } from "@remixicon/react"

const products = [
  { id: 1, name: "Sambal Ijo", price: 35000, rating: 4, reviews: 76, image: "/placeholder.svg?height=250&width=250" },
  { id: 2, name: "Sambal Cumi", price: 35000, rating: 4, reviews: 78, image: "/placeholder.svg?height=250&width=250" },
  { id: 3, name: "Sambal Ijo", price: 35000, rating: 4, reviews: 76, image: "/placeholder.svg?height=250&width=250" },
  {
    id: 4,
    name: "Sambal Ikan Cakalang Suir",
    price: 35000,
    rating: 4,
    reviews: 92,
    image: "/placeholder.svg?height=250&width=250",
  },
  { id: 5, name: "Sambal Cumi", price: 35000, rating: 4, reviews: 78, image: "/placeholder.svg?height=250&width=250" },
  { id: 6, name: "Sambal Ijo", price: 35000, rating: 4, reviews: 76, image: "/placeholder.svg?height=250&width=250" },
  {
    id: 7,
    name: "Sambal Ikan Cakalang Suir",
    price: 35000,
    rating: 4,
    reviews: 92,
    image: "/placeholder.svg?height=250&width=250",
  },
  { id: 8, name: "Sambal Cumi", price: 35000, rating: 4, reviews: 78, image: "/placeholder.svg?height=250&width=250" },
  { id: 9, name: "Sambal Ijo", price: 35000, rating: 4, reviews: 76, image: "/placeholder.svg?height=250&width=250" },
]

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState("terbaru")
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })

  const resetFilters = () => {
    setSelectedRating(null)
    setPriceRange({ min: "", max: "" })
  }

  const hasActiveFilters = selectedRating !== null || priceRange.min !== "" || priceRange.max !== ""

  const filteredProducts = products.filter((product) => {
    if (selectedRating && product.rating < selectedRating) return false
    if (priceRange.min && product.price < Number.parseInt(priceRange.min)) return false
    if (priceRange.max && product.price > Number.parseInt(priceRange.max)) return false
    return true
  })

  return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />

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
                {filteredProducts.map((product) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="relative h-48 bg-gray-100">
                        <Image
                            src={product.image || "/placeholder.svg"}
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
                          {[...Array(product.rating)].map((_, i) => (
                              <RiStarFill key={i} className="w-4 h-4 text-yellow-400" />
                          ))}
                          <span className="text-xs text-gray-500">({product.reviews})</span>
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

        <FooterSection />
      </main>
  )
}
