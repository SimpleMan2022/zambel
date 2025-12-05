"use client"

import { useState } from "react"

interface OrdersFilterSidebarProps {
  onFilterChange?: (filters: {
    status?: string
    sortBy?: string
  }) => void
}

export function OrdersFilterSidebar({ onFilterChange }: OrdersFilterSidebarProps) {
  const [status, setStatus] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("newest")

  const handleStatusChange = (value: string) => {
    setStatus(value)
    onFilterChange?.({ status: value, sortBy })
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    onFilterChange?.({ status, sortBy: value })
  }

  return (
      <aside className="bg-white border border-gray-200 rounded-lg p-4 h-fit">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Filter</h3>

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 block mb-2">Status Pesanan</label>
          <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:border-primary-red"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu Konfirmasi</option>
            <option value="confirmed">Dikonfirmasi</option>
            <option value="shipped">Dikirim</option>
            <option value="delivered">Diterima</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Urutkan</label>
          <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:border-primary-red"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="highest">Harga Tertinggi</option>
            <option value="lowest">Harga Terendah</option>
          </select>
        </div>
      </aside>
  )
}
