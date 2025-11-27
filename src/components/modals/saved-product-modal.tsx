"use client"

import { Heart, X } from "lucide-react"

interface SavedProductModalProps {
  onClose: () => void
}

export default function SavedProductModal({ onClose }: SavedProductModalProps) {
  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center space-y-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500">
            <X size={24} />
          </button>

          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <Heart size={32} className="text-primary-red fill-primary-red" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Produk Tersimpan</h3>
            <p className="text-gray-600 text-sm">
              Anda bisa lihat produk favorit Anda di halaman wishlist. Anda dapat dengan mudah menemukan dan membeli lagi!
            </p>
          </div>

          <div className="flex gap-3">
            <button
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition"
            >
              Yaa
            </button>
            <button className="flex-1 bg-primary-red text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition">
              Lanjut Belanja
            </button>
          </div>
        </div>
      </div>
  )
}
