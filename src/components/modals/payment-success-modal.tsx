"use client"

import type React from "react"
import { RiCheckLine, RiCloseLine } from "@remixicon/react"

interface PaymentSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  orderNumber: string
  totalAmount: number
  paymentMethod: string
}

export function PaymentSuccessModal({
                                      isOpen,
                                      onClose,
                                      orderNumber,
                                      totalAmount,
                                      paymentMethod,
                                    }: PaymentSuccessModalProps) {
  if (!isOpen) return null

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "credit-card":
        return "Kartu Kredit"
      case "bank-transfer":
        return "Transfer Bank"
      case "ewallet":
        return "E-Wallet"
      default:
        return method
    }
  }

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-8 relative animate-fade-in">
          {/* Close Button */}
          <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <RiCloseLine size={24} />
          </button>

          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <RiCheckLine size={28} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Pembayaran Berhasil!
          </h2>

          {/* Subtitle */}
          <p className="text-center text-gray-600 text-sm mb-6">
            Terima kasih atas pembayaran Anda. Pesanan Anda sedang diproses.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nomor Pesanan</span>
              <span className="text-sm font-semibold text-gray-900">{orderNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Pembayaran</span>
              <span className="text-sm font-semibold text-gray-900">
              Rp{totalAmount.toLocaleString("id-ID")}
            </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Metode Pembayaran</span>
              <span className="text-sm font-semibold text-gray-900">
              {getPaymentMethodLabel(paymentMethod)}
            </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
                onClick={() => {
                  // Navigate to order history or download receipt
                  console.log("Lihat Pesanan Saya")
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Lihat Pesanan Saya
            </button>
            <button
                onClick={onClose}
                className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>

        <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
      </div>
  )
}