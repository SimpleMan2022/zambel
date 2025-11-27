"use client"

interface ShippingDetail {
  label: string
  value: string
}

interface ShippingDetailsCardProps {
  deliveryStore: {
    name: string
    address: string
  }
  receiver: {
    name: string
    address: string
    phone: string
  }
  courier: {
    name: string
    resi: string
  }
  products: Array<{
    name: string
    quantity: number
    price: number
  }>
}

export function ShippingDetailsCard({ deliveryStore, receiver, courier, products }: ShippingDetailsCardProps) {
  const totalPrice = products.reduce((sum, product) => sum + product.price * product.quantity, 0)

  return (
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold mb-6">Detail Pengiriman</h2>

        {/* Pengiriman */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Pengiriman</h3>
          <p className="text-gray-700">{deliveryStore.name}</p>
          <p className="text-sm text-gray-600">{deliveryStore.address}</p>
        </div>

        {/* Penerima */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Penerima</h3>
          <p className="text-gray-700">{receiver.name}</p>
          <p className="text-sm text-gray-600">{receiver.address}</p>
          <p className="text-sm text-gray-600">Telp: {receiver.phone}</p>
        </div>

        {/* Kurir */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Kurir</h3>
          <p className="text-gray-700">{courier.name}</p>
          <p className="text-sm text-gray-600">Resi: {courier.resi}</p>
        </div>

        {/* Produk dalam Pesanan */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Produk dalam Pesanan</h3>
          <div className="space-y-3">
            {products.map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-700">{product.name}</p>
                    <p className="text-sm text-gray-600">x{product.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">Rp{product.price.toLocaleString("id-ID")}</p>
                </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center font-semibold text-lg mb-6">
          <span className="text-gray-900">Total</span>
          <span className="text-[#E53935]">Rp{totalPrice.toLocaleString("id-ID")}</span>
        </div>
      </div>
  )
}
