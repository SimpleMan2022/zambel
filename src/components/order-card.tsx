"use client"

import Link from "next/link"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"


interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface OrderCardProps {
  id: string
  orderNumber: string
  date: Date
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  items: OrderItem[]
  totalPrice: number
}

const statusConfig = {
  pending: {
    label: "Menunggu Konfirmasi",
    color: "bg-yellow-100 text-yellow-800",
  },
  confirmed: {
    label: "Dikonfirmasi",
    color: "bg-blue-100 text-blue-800",
  },
  shipped: {
    label: "Dikirim",
    color: "bg-purple-100 text-purple-800",
  },
  delivered: {
    label: "Diterima",
    color: "bg-green-100 text-green-800",
  },
  cancelled: {
    label: "Dibatalkan",
    color: "bg-red-100 text-red-800",
  },
}

export function OrderCard({ id, orderNumber, date, status, items, totalPrice }: OrderCardProps) {
  const statusInfo = statusConfig[status]

  return (
    <Link href={`/orders/${id}`}>
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm text-gray-600">Nomor Pesanan</p>
            <p className="font-semibold text-gray-900">{orderNumber}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
        </div>

        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm text-gray-600">Tanggal Pesanan</p>
            <p className="text-sm text-gray-900">{format(date, "dd MMMM yyyy, HH:mm", { locale: localeID })}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total</p>
            <p className="font-semibold text-primary-red text-lg">Rp{totalPrice.toLocaleString("id-ID")}</p>
          </div>
        </div>

        <div className="border-t pt-3">
          <p className="text-xs text-gray-600 mb-2">
            {items.length} produk{items.length > 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {items.slice(0, 3).map((item) => (
              <span key={item.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {item.name} x{item.quantity}
              </span>
            ))}
            {items.length > 3 && (
              <span className="text-xs text-gray-600 px-2 py-1">+{items.length - 3} produk lainnya</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
