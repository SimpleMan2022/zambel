"use client"

import type React from "react"

interface OrderItem {
  name: string
  quantity: number
  price: number
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
  orderItems: OrderItem[] // Renamed from 'products'
  subtotalItems: number // New prop for sum of product prices
  shippingCost: number // New prop for shipping cost
}

export function ShippingDetailsCard({ deliveryStore, receiver, courier, orderItems, subtotalItems, shippingCost }: ShippingDetailsCardProps) {

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
  };

  const finalTotal = subtotalItems + shippingCost;

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
            {orderItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-700">{item.name}</p>
                    <p className="text-sm text-gray-600">x{item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatPrice(item.price)}</p>
                </div>
            ))}
          </div>
        </div>

        {/* Total Summary */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal Barang:</span>
            <span className="font-semibold">{formatPrice(subtotalItems)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Biaya Pengiriman:</span>
            <span className="font-semibold">{formatPrice(shippingCost)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2">
            <span className="text-gray-900">Total:</span>
            <span className="text-[#E53935]">{formatPrice(finalTotal)}</span>
          </div>
        </div>
      </div>
  )
}
