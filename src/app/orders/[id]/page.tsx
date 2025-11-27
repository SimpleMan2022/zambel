"use client"

import { Navbar } from "@/components/navbar"
import { FooterSection } from "@/components/footer-section"
import { OrderTrackingTimeline } from "@/components/order-tracking-timeline"
import { ShippingDetailsCard } from "@/components/shipping-details-card"
import {useParams} from "next/navigation";


export default function OrderTrackingPage() {
  const params = useParams()
  const orderId = params.id as string

  const timelineItems = [
    {
      id: "1",
      title: "Pesanan Dikonfirmasi",
      date: "21 Oktober 2025",
      time: "16:30",
      isCompleted: true,
      isActive: false,
    },
    {
      id: "2",
      title: "Pesanan Diterima",
      date: "21 Oktober 2025",
      time: "14:45",
      isCompleted: true,
      isActive: false,
    },
    {
      id: "3",
      title: "Pesanan Dikemas",
      date: "21 Oktober 2025",
      time: "16:00",
      isCompleted: true,
      isActive: false,
    },
    {
      id: "4",
      title: "Pesanan Dikirim",
      date: "22 Oktober 2025",
      time: "12:30",
      description: "Kurir: JNE Express\nNo Resi: 1234567890",
      isCompleted: true,
      isActive: false,
    },
    {
      id: "5",
      title: "Dalam Pengiriman",
      date: "24 Oktober 2025",
      description: "Estimasi tiba: 24 Oktober 2025\nUkuran bakalah: 5 hari di jalan",
      isCompleted: false,
      isActive: true,
    },
    {
      id: "6",
      title: "Pesanan Diterima",
      date: "24 Oktober 2025",
      time: "13:32",
      isCompleted: false,
      isActive: false,
    },
  ]

  const shippingDetails = {
    deliveryStore: {
      name: "Toko Zambel",
      address: "Jl. Sambel Peleta No. 123, Jakarta",
    },
    receiver: {
      name: "Rosyad Aditya Nugroho",
      address: "Jl. Binjai, Sumatera Utara",
      phone: "081234567890",
    },
    courier: {
      name: "JNE Express",
      resi: "1234567890",
    },
    products: [
      { name: "Sambal Ijo", quantity: 1, price: 35000 },
      { name: "Sambal Cumi", quantity: 1, price: 35000 },
      { name: "Sambal Ikan Cakalang", quantity: 1, price: 35000 },
    ],
  }

  return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pelacakan Pesanan
            </h1>
            <div className="flex flex-col gap-2 text-gray-600">
              <p>
                Nomor Pesanan:{" "}
                <span className="font-semibold text-gray-900">#{orderId}</span>
              </p>
              <p>
                Status:{" "}
                <span className="font-semibold text-[#E53935]">
                Dalam Pengiriman
              </span>
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <OrderTrackingTimeline items={timelineItems} />
            </div>

            <div className="lg:col-span-1">
              <ShippingDetailsCard {...shippingDetails} />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
                type="button"
                className="flex-1 bg-[#E53935] hover:bg-[#d32f2f] text-white h-12 rounded-md font-semibold"
            >
              Hubungi Customer Service
            </button>

            <button
                type="button"
                className="flex-1 border border-[#E53935] text-[#E53935] h-12 rounded-md font-semibold hover:bg-red-50 bg-transparent"
            >
              Kembali ke Beranda
            </button>
          </div>
        </main>

        <FooterSection />
      </div>
  )
}
