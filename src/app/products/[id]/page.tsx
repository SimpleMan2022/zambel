"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/navbar"
import FooterSection from "@/components/footer-section"
import SavedProductModal from "@/components/modals/saved-product-modal"
import ShareProductModal from "@/components/modals/share-product-modal"
import { RiStarFill, RiHeartLine, RiShareLine } from "@remixicon/react"

export default function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1)
  const [showSavedModal, setShowSavedModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const product = {
    id: 1,
    name: "Sambal Ijo",
    price: 35000,
    rating: 4,
    reviewsCount: 76,
    stock: 45,
    description: "Sambal Ijo berkualitas tinggi dengan bahan-bahan pilihan terbaik",
    mainImage: "/placeholder.svg?height=400&width=400",
    images: [
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100",
    ],
    specs: {
      material: "Bahan Alami",
      size: "300ml",
      color: "Hijau",
      taste: "Pedas Sedang",
    },
    reviews: [
      {
        author: "Siti Nurhaliza",
        rating: 4,
        time: "2 hari yang lalu",
        text: "Produk sangat bagus dan sesuai deskripsi! Pengiriman cepat dan packaging rapi.",
      },
      {
        author: "Siti Nurhaliza",
        rating: 4,
        time: "2 hari yang lalu",
        text: "Produk sangat bagus dan sesuai deskripsi! Pengiriman cepat dan packaging rapi.",
      },
      {
        author: "Siti Nurhaliza",
        rating: 4,
        time: "2 hari yang lalu",
        text: "Produk sangat bagus dan sesuai deskripsi! Pengiriman cepat dan packaging rapi.",
      },
    ],
  }

  return (
      <main className="min-h-screen bg-white">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-600 mb-8">
            <Link href="/products" className="hover:text-primary-red">
              Produk
            </Link>
            {" > "}
            <span className="text-gray-900">{product.name}</span>
          </div>

          {/* Main */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center overflow-hidden">
                <Image
                    src={product.images[selectedImageIndex] || product.mainImage}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="object-cover"
                />
              </div>

              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-24 h-24 rounded-lg overflow-hidden border-2 ${
                            idx === selectedImageIndex ? "border-primary-red" : "border-gray-200"
                        }`}
                    >
                      <Image
                          src={img}
                          alt={`${product.name} ${idx + 1}`}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                      />
                    </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

                <div className="flex items-center gap-3 mb-2">
                  <div className="flex gap-1">
                    {[...Array(product.rating)].map((_, i) => (
                        <RiStarFill key={i} className="w-5 h-5 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">
                  {product.reviewsCount} Ulasan
                </span>
                </div>

                <p className="text-3xl font-bold text-primary-red">
                  Rp{product.price.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stok</p>
                  <p className="font-semibold text-gray-900">
                    {product.stock} tersedia
                  </p>
                </div>

                {/* Quantity */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Jumlah</p>
                  <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-50"
                    >
                      −
                    </button>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                            setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="w-12 text-center border-l border-r border-gray-300 py-2 outline-none"
                    />
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                      onClick={() => setShowSavedModal(true)}
                      className="flex-1 border-2 border-primary-red text-primary-red font-semibold py-3 rounded-lg hover:bg-red-50 transition"
                  >
                    Tambah ke Keranjang
                  </button>
                  <button className="flex-1 bg-primary-red text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition">
                    Beli Sekarang
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-center pt-2">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-primary-red transition">
                    <RiHeartLine className="w-5 h-5" />
                    Simpan
                  </button>
                  <button
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center gap-2 text-gray-600 hover:text-primary-red transition"
                  >
                    <RiShareLine className="w-5 h-5" />
                    Bagikan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="bg-gray-50 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Spesifikasi Produk
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm text-gray-600 mb-1 capitalize">{key}</p>
                    <p className="font-semibold text-gray-900">{value}</p>
                  </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Ulasan Pelanggan
            </h2>
            <div className="space-y-4">
              {product.reviews.map((review, idx) => (
                  <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.author}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {[...Array(review.rating)].map((_, i) => (
                              <RiStarFill
                                  key={i}
                                  className="w-4 h-4 text-yellow-400"
                              />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                    {review.time}
                  </span>
                    </div>
                    <p className="text-gray-700">{review.text}</p>
                  </div>
              ))}
            </div>
          </div>
        </div>

        <FooterSection />

        {showSavedModal && <SavedProductModal onClose={() => setShowSavedModal(false)} />}
        {showShareModal && <ShareProductModal onClose={() => setShowShareModal(false)} />}
      </main>
  )
}
