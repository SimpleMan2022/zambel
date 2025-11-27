"use client"

import type React from "react"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { CheckoutStepIndicator } from "@/components/checkout-step-indicator"
import { OrderSummary } from "@/components/order-summary"
import { PaymentSuccessModal } from "@/components/modals/payment-success-modal"
import { RiCheckboxBlankCircleLine, RiCheckboxCircleFill } from "@remixicon/react"

export default function CheckoutPaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [cardData, setCardData] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePayment = () => {
    // Simulate payment processing
    // In real app, this would call payment API
    setShowSuccessModal(true)
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    // Optionally redirect to home or orders page
    // router.push('/')
  }

  // Generate random order number for demo
  const orderNumber= 'ORD-123'
  const totalAmount = 225000 // This should come from cart total

  return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <CheckoutStepIndicator currentStep={3} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side - Payment Methods */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-6">Metode Pembayaran</h2>

                <div className="space-y-4">
                  {/* Credit Card Option */}
                  <div
                      onClick={() => setPaymentMethod("credit-card")}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          paymentMethod === "credit-card"
                              ? "border-red-600 bg-red-50"
                              : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {paymentMethod === "credit-card" ? (
                            <RiCheckboxCircleFill className="text-red-600" size={20} />
                        ) : (
                            <RiCheckboxBlankCircleLine className="text-gray-400" size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">Kartu Kredit / Debit</h3>
                        <p className="text-sm text-gray-600">Via Midtrans Xendit Express</p>
                      </div>
                    </div>

                    {paymentMethod === "credit-card" && (
                        <div className="mt-4 space-y-4 ml-8">
                          <input
                              type="text"
                              name="cardName"
                              placeholder="Nama Pemegang Kartu"
                              value={cardData.cardName}
                              onChange={handleCardChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                          />
                          <input
                              type="text"
                              name="cardNumber"
                              placeholder="Nomor Kartu"
                              value={cardData.cardNumber}
                              onChange={handleCardChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="expiryDate"
                                placeholder="MM/YY"
                                value={cardData.expiryDate}
                                onChange={handleCardChange}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                            <input
                                type="text"
                                name="cvv"
                                placeholder="CVV"
                                value={cardData.cvv}
                                onChange={handleCardChange}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </div>
                        </div>
                    )}
                  </div>

                  {/* Bank Transfer Option */}
                  <div
                      onClick={() => setPaymentMethod("bank-transfer")}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          paymentMethod === "bank-transfer"
                              ? "border-red-600 bg-red-50"
                              : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {paymentMethod === "bank-transfer" ? (
                            <RiCheckboxCircleFill className="text-red-600" size={20} />
                        ) : (
                            <RiCheckboxBlankCircleLine className="text-gray-400" size={20} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">Transfer Bank</h3>
                        <p className="text-sm text-gray-600">BCA, Mandiri, BNI, CIMB</p>
                      </div>
                    </div>
                  </div>

                  {/* E-Wallet Option */}
                  <div
                      onClick={() => setPaymentMethod("ewallet")}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          paymentMethod === "ewallet"
                              ? "border-red-600 bg-red-50"
                              : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {paymentMethod === "ewallet" ? (
                            <RiCheckboxCircleFill className="text-red-600" size={20} />
                        ) : (
                            <RiCheckboxBlankCircleLine className="text-gray-400" size={20} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">E-Wallet</h3>
                        <p className="text-sm text-gray-600">GCash, Gopay, OVO</p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-8">
                    <button className="flex-1 border-2 border-red-600 text-red-600 font-bold py-3 rounded-md hover:bg-red-50 transition-colors">
                      Kembali
                    </button>
                    <button
                        onClick={handlePayment}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md transition-colors"
                    >
                      Bayar Sekarang
                    </button>
                  </div>
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

        {/* Payment Success Modal */}
        <PaymentSuccessModal
            isOpen={showSuccessModal}
            onClose={handleCloseModal}
            orderNumber={orderNumber}
            totalAmount={totalAmount}
            paymentMethod={paymentMethod}
        />
      </div>
  )
}