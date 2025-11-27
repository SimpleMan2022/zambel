"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import Navbar from "@/components/navbar"
import FooterSection from "@/components/footer-section"
import { RiDeleteBin6Line } from "@remixicon/react"

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Sambal Ijo",
      price: 35000,
      quantity: 2,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      name: "Sambal Cumi",
      price: 35000,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 3,
      name: "Sambal Ikan Cakalang Suir",
      price: 35000,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80",
    },
  ])

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = 0
  const shipping = 10000
  const total = subtotal - discount + shipping

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter((item) => item.id !== id))
    } else {
      setCartItems(
          cartItems.map((item) =>
              item.id === id ? { ...item, quantity: newQuantity } : item
          )
      )
    }
  }

  const handleRemove = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Keranjang Belanja</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              {cartItems.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <p className="text-gray-600 mb-4">Keranjang Anda kosong</p>
                    <Link
                        href="/products"
                        className="inline-block bg-primary-red text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      Lanjutkan Belanja
                    </Link>
                  </div>
              ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg p-6 flex gap-4">
                          <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover"
                          />

                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-1">{item.name}</p>
                            <p className="text-primary-red font-bold">
                              Rp{item.price.toLocaleString("id-ID")}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="border border-gray-300 w-8 h-8 flex items-center justify-center rounded hover:bg-gray-50"
                            >
                              −
                            </button>

                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                    handleQuantityChange(
                                        item.id,
                                        Number.parseInt(e.target.value) || 1
                                    )
                                }
                                className="w-12 text-center border border-gray-300 rounded py-1 outline-none"
                            />

                            <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="border border-gray-300 w-8 h-8 flex items-center justify-center rounded hover:bg-gray-50"
                            >
                              +
                            </button>

                            <button
                                onClick={() => handleRemove(item.id)}
                                className="text-red-500 hover:text-red-700 ml-4"
                            >
                              <RiDeleteBin6Line className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Ringkasan Pesanan</h2>

                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>Rp{subtotal.toLocaleString("id-ID")}</span>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>Diskon</span>
                    <span>Rp{discount.toLocaleString("id-ID")}</span>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>Ongkos Kirim</span>
                    <span>Rp{shipping.toLocaleString("id-ID")}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>Rp{total.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <button className="w-full bg-primary-red text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition">
                  Lanjut Checkout
                </button>

                <Link
                    href="/products"
                    className="block text-center border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition"
                >
                  Lanjutkan Belanja
                </Link>
              </div>
            </div>

          </div>
        </div>

        <FooterSection />
      </main>
  )
}
