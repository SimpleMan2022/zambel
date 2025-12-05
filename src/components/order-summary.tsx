"use client"

import React from "react"

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  shippingCost: number;
  discount?: number; // Optional discount
}

export function OrderSummary({ cartItems, shippingCost, discount = 0 }: OrderSummaryProps) {
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + shippingCost - discount;
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
  };

  return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 sticky top-4">
        <h3 className="font-bold text-lg mb-4">Ringkasan Pesanan</h3>

        <div className="space-y-2 mb-4 border-b pb-4 border-gray-200">
          {cartItems.length === 0 ? (
            <p className="text-gray-600">Keranjang kosong</p>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name} ({item.quantity}x)</span>
                <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal Barang</span>
            <span className="font-semibold">{formatPrice(calculateSubtotal())}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-primary-red">Diskon</span>
              <span className="text-primary-red font-semibold">-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ongkos Kirim</span>
            <span className="font-semibold">{formatPrice(shippingCost)}</span>
          </div>
        </div>

        <div className="border-t pt-4 border-gray-200">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatPrice(calculateTotal())}</span>
          </div>
        </div>
      </div>
  )
}
