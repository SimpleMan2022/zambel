"use client"

import Link from "next/link"
import ProductCard from "@/components/product-card"

const products = [
  {
    id: 1,
    name: "Sambel Original",
    price: "Rp 35.000",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.8,
    reviews: 124,
  },
  {
    id: 2,
    name: "Sambel Pedas",
    price: "Rp 35.000",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.9,
    reviews: 89,
  },
  {
    id: 3,
    name: "Sambel Matah",
    price: "Rp 40.000",
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.7,
    reviews: 156,
  },
]

export default function ProductsSection() {
  return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Produk Kami</h2>
          <p className="text-gray-600">Tersedia berbagai varian sambel pilihan dengan kualitas terbaik</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {products.map((product) => (
              <ProductCard key={product.id} {...product} />
          ))}
        </div>

        <div className="text-center">
          <Link
              href="/produk"
              className="inline-block bg-primary-red text-white font-semibold px-8 py-3 rounded-lg hover:bg-red-700 transition"
          >
            Lihat Semua Produk
          </Link>
        </div>
      </section>
  )
}
