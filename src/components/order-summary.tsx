"use client"

export function OrderSummary() {
  return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 sticky top-4">
        <h3 className="font-bold text-lg mb-4">Ringkasan Pesanan</h3>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">Rp210000</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-primary-red">Diskon</span>
            <span className="text-primary-red font-semibold">Rp10000</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ongkos Kirim</span>
            <span className="font-semibold">Rp25000</span>
          </div>
        </div>

        <div className="border-t pt-4 border-gray-200">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>Rp225000</span>
          </div>
        </div>
      </div>
  )
}
