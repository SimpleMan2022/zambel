"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { OrderCard } from "@/components/order-card"
import { OrdersFilterSidebar } from "@/components/orders-filter-sidebar"

// Mock data - ganti dengan data real dari API/database
const MOCK_ORDERS = [
  {
    id: "1",
    orderNumber: "#ORD-2024-001234",
    date: new Date("2024-10-21"),
    status: "delivered" as const,
    items: [
      { id: "1", name: "Sambal Ijo", quantity: 2, price: 35000 },
      { id: "2", name: "Sambal Cumi", quantity: 1, price: 35000 },
    ],
    totalPrice: 105000,
  },
  {
    id: "2",
    orderNumber: "#ORD-2024-001233",
    date: new Date("2024-10-20"),
    status: "shipped" as const,
    items: [{ id: "1", name: "Sambal Ikan Cakalang Suir", quantity: 1, price: 35000 }],
    totalPrice: 35000,
  },
  {
    id: "3",
    orderNumber: "#ORD-2024-001232",
    date: new Date("2024-10-19"),
    status: "confirmed" as const,
    items: [
      { id: "1", name: "Sambal Ijo", quantity: 3, price: 35000 },
      { id: "2", name: "Sambal Cumi", quantity: 2, price: 35000 },
      { id: "3", name: "Sambal Ikan Cakalang Suir", quantity: 1, price: 35000 },
    ],
    totalPrice: 175000,
  },
  {
    id: "4",
    orderNumber: "#ORD-2024-001231",
    date: new Date("2024-10-18"),
    status: "pending" as const,
    items: [{ id: "1", name: "Sambal Cumi", quantity: 1, price: 35000 }],
    totalPrice: 35000,
  },
  {
    id: "5",
    orderNumber: "#ORD-2024-001230",
    date: new Date("2024-10-17"),
    status: "delivered" as const,
    items: [
      { id: "1", name: "Sambal Ijo", quantity: 1, price: 35000 },
      { id: "2", name: "Sambal Ikan Cakalang Suir", quantity: 1, price: 35000 },
    ],
    totalPrice: 70000,
  },
]

export default function OrdersPage() {
  const [filteredOrders, setFilteredOrders] = useState(MOCK_ORDERS)

  const handleFilterChange = (filters: { status?: string; sortBy?: string }) => {
    let orders = [...MOCK_ORDERS]

    // Filter by status
    if (filters.status) {
      orders = orders.filter((order) => order.status === filters.status)
    }

    // Sort
    if (filters.sortBy === "newest") {
      orders.sort((a, b) => b.date.getTime() - a.date.getTime())
    } else if (filters.sortBy === "oldest") {
      orders.sort((a, b) => a.date.getTime() - b.date.getTime())
    } else if (filters.sortBy === "highest") {
      orders.sort((a, b) => b.totalPrice - a.totalPrice)
    } else if (filters.sortBy === "lowest") {
      orders.sort((a, b) => a.totalPrice - b.totalPrice)
    }

    setFilteredOrders(orders)
  }

  return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pesanan Saya</h1>
            <p className="text-gray-600">Lihat dan kelola semua pesanan Anda</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Filter */}
            <div>
              <OrdersFilterSidebar onFilterChange={handleFilterChange} />
            </div>

            {/* Orders Grid */}
            <div className="lg:col-span-3">
              {filteredOrders.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredOrders.map((order) => (
                        <OrderCard key={order.id} {...order} />
                    ))}
                  </div>
              ) : (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <p className="text-gray-600 mb-2">Tidak ada pesanan yang sesuai</p>
                    <p className="text-sm text-gray-500">Coba ubah filter atau mulai berbelanja</p>
                  </div>
              )}
            </div>
          </div>
        </div>

        <FooterSection />
      </main>
  )
}
