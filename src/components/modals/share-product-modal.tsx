"use client"

import { X, Facebook, MessageCircle, Instagram } from "lucide-react"

interface ShareProductModalProps {
  onClose: () => void
}

export default function ShareProductModal({ onClose }: ShareProductModalProps) {
  const productUrl = "https://example.com/product/1"

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl)
  }

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Bagikan Produk</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-semibold">
              <Facebook size={20} />
              Bagikan ke Facebook
            </button>

            <button className="w-full flex items-center gap-3 p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-semibold">
              <MessageCircle size={20} />
              Bagikan ke Whatsapp
            </button>

            <button className="w-full flex items-center gap-3 p-4 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition font-semibold">
              <Instagram size={20} />
              Bagikan ke Instagram
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3">Atau copy link ini:</p>
            <div className="flex gap-2">
              <input
                  type="text"
                  value={productUrl}
                  readOnly
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <button
                  onClick={handleCopyLink}
                  className="bg-primary-red text-white px-4 py-2 rounded font-semibold hover:bg-red-600 transition"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
  )
}
