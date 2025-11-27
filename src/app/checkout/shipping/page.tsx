"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { CheckoutStepIndicator } from "@/components/checkout-step-indicator"
import { OrderSummary } from "@/components/order-summary"
import { RiCheckboxBlankCircleLine, RiCheckboxCircleFill } from "@remixicon/react"

export default function CheckoutShippingPage() {
  const [shippingMethod, setShippingMethod] = useState("jne")

  const shippingOptions = [
    {
      id: "jne",
      name: "JNE Express",
      description: "1-2 hari",
      price: "Rp29000",
    },
    {
      id: "timi",
      name: "TIMI Regular",
      description: "2-3 hari",
      price: "Rp15000",
    },
    {
      id: "pos",
      name: "POS Indonesia",
      description: "3-5 hari",
      price: "Rp10000",
    },
  ]

  const handleSubmit = () => {
    console.log("Shipping method selected:", shippingMethod)
    // navigation to /checkout/payment
    window.location.href = "/checkout/payment"
  }

  return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <CheckoutStepIndicator currentStep={2} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side - Shipping Methods */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-6">Metode Pengiriman</h2>

                <div className="space-y-3">
                  {shippingOptions.map((option) => (
                      <div
                          key={option.id}
                          onClick={() => setShippingMethod(option.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              shippingMethod === option.id
                                  ? "border-primary-red bg-red-50"
                                  : "border-gray-300 hover:border-gray-400"
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {shippingMethod === option.id ? (
                                <RiCheckboxCircleFill className="text-primary-red" size={20} />
                            ) : (
                                <RiCheckboxBlankCircleLine className="text-gray-400" size={20} />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{option.name}</h3>
                                <p className="text-sm text-gray-600">{option.description}</p>
                              </div>
                              <span className="font-bold text-primary-red">{option.price}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-8">
                  <button className="flex-1 border-2 border-primary-red text-primary-red font-bold py-3 rounded-md hover:bg-red-50 transition-colors">
                    Kembali
                  </button>
                  <button className="flex-1 bg-primary-red hover:bg-red-700 text-white font-bold py-3 rounded-md transition-colors" onClick={handleSubmit}>
                    Lanjut ke Pembayaran
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary />
            </div>
          </div>
        </div>

        <FooterSection />
      </div>
  )
}
