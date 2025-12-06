"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MainLayout } from "@/components/main-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { OrderTrackingTimeline, TimelineItem } from "@/components/order-tracking-timeline"
import { ShippingDetailsCard } from "@/components/shipping-details-card"
import { useAuth } from "@/contexts/auth-context"
import { RiLoader4Line, RiFileListLine, RiCloseLine, RiTruckLine } from "@remixicon/react"

interface OrderItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  price_at_purchase: string
  subtotal: string
  image_url: string
}

interface OrderDetails {
  id: string
  order_number: string
  order_status: string
  subtotal: string
  discount: string
  shipping_cost: string
  tax: string
  total: string
  payment_status: string
  snap_token: string | null
  midtrans_order_id: string | null
  created_at: string
  tracking_number: string | null
  estimated_delivery_date: string | null

  ship_recipient_name: string
  ship_phone: string
  ship_street: string
  ship_city: string
  ship_province: string
  ship_postal_code: string
  ship_label: string | null

  courier_code: string | null
  courier_name: string | null
  items: OrderItem[]
}

export default function OrderTrackingPage() {
  const params = useParams()
  const order_id = params?.id as string

  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, token } = useAuth()

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ==========================
  // ✅ FETCH ORDER DETAIL
  // ==========================
  const fetchOrderDetails = useCallback(async (authToken: string | null) => {
    if (!isAuthenticated || !order_id || !authToken) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${order_id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch order details")
      }

      const result = await response.json()

      if (result.success) {
        setOrderDetails(result.data)
      } else {
        setError(result.message || "Failed to fetch order details")
      }
    } catch (err) {
      console.error("Error fetching order details:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, order_id])

  // ==========================
  // ✅ AUTH FLOW
  // ==========================
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && token) {
        fetchOrderDetails(token)
      } else {
        router.replace("/login")
      }
    }
  }, [authLoading, isAuthenticated, token, fetchOrderDetails, router])

  // ==========================
  // ✅ HELPERS
  // ==========================
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-600"
      case "paid":
      case "delivered":
        return "text-green-600"
      case "processing":
      case "shipped":
        return "text-blue-600"
      case "cancelled":
      case "failed":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Menunggu Pembayaran"
      case "processing":
        return "Sedang Diproses"
      case "shipped":
        return "Dalam Pengiriman"
      case "delivered":
        return "Sudah Diterima"
      case "cancelled":
        return "Dibatalkan"
      default:
        return status
    }
  }

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // ==========================
  // ✅ TIMELINE BUILDER
  // ==========================
  const generateTimelineItems = (order: OrderDetails): TimelineItem[] => {
    const timeline: TimelineItem[] = [
      {
        id: "order-created",
        title: "Pesanan Dibuat",
        date: new Date(order.created_at).toLocaleDateString("id-ID"),
        time: new Date(order.created_at).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isCompleted: true,
        isActive: false,
      },
    ]

    if (order.payment_status === "paid" || order.payment_status === "processing") {
      timeline.push({
        id: "payment-received",
        title: "Pembayaran Diterima",
        date: new Date(order.created_at).toLocaleDateString("id-ID"),
        time: new Date(order.created_at).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isCompleted: true,
        isActive: false,
      })
    }

    if (order.order_status === "shipped" || order.order_status === "delivered") {
      timeline.push({
        id: "order-shipped",
        title: "Pesanan Dikirim",
        date: "",
        time: "",
        description: `No Resi: ${order.tracking_number || "Belum tersedia"}`,
        isCompleted: order.order_status === "delivered",
        isActive: order.order_status === "shipped",
      })
    }

    if (order.order_status === "delivered") {
      timeline.push({
        id: "order-delivered",
        title: "Pesanan Selesai",
        date: "",
        time: "",
        isCompleted: true,
        isActive: true,
      })
    }

    return timeline
  }

  // ==========================
  // ✅ SHIPPING CARD PROPS
  // ==========================
  const shippingDetailsCardProps = orderDetails
    ? {
        deliveryStore: {
          name: "Toko Zambel",
          address: "Jl. Sambel Peleta No. 123, Jakarta",
        },
        receiver: {
          name: orderDetails.ship_recipient_name,
          address: `${orderDetails.ship_street}, ${orderDetails.ship_city}, ${orderDetails.ship_province}, ${orderDetails.ship_postal_code}`,
          phone: orderDetails.ship_phone,
        },
        courier: {
          code: orderDetails.courier_code || "Belum Tersedia",
          name: orderDetails.courier_name || "Belum Tersedia",
          resi: orderDetails.tracking_number || "Belum Tersedia",
        },
        orderItems: orderDetails.items.map((item) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: parseFloat(item.price_at_purchase),
        })),
        subtotalItems: parseFloat(orderDetails.subtotal),
        shippingCost: parseFloat(orderDetails.shipping_cost),
      }
    : null

  // ==========================
  // ✅ LOADING STATE
  // ==========================
  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <RiLoader4Line className="animate-spin text-3xl text-gray-600" />
        </div>
      </MainLayout>
    )
  }

  // ==========================
  // ✅ ERROR STATE
  // ==========================
  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
          <div>
            <RiCloseLine className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h1>
            <p className="mb-4">{error}</p>
            <button onClick={() => router.back()} className="bg-[#E53935] text-white px-6 py-2 rounded-md">
              Kembali
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  // ==========================
  // ✅ NOT FOUND
  // ==========================
  if (!orderDetails) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
          <div>
            <RiFileListLine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Pesanan Tidak Ditemukan</h1>
            <Link href="/my-orders" className="bg-[#E53935] text-white px-6 py-2 rounded-md inline-block">
              Kembali
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  // ==========================
  // ✅ MAIN VIEW
  // ==========================
  const timelineItems = generateTimelineItems(orderDetails)

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <main className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Pelacakan Pesanan</h1>
              <p className="mt-2 text-gray-600">
                Pesanan <b>#{orderDetails.order_number}</b> —{" "}
                <span className={`font-semibold ${getStatusColor(orderDetails.order_status)}`}>
                  {getStatusDisplay(orderDetails.order_status)}
                </span>
              </p>
            </div>

            {/* Estimated Delivery */}
            {orderDetails.estimated_delivery_date && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                <RiTruckLine className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">Estimasi Tiba</p>
                  <p className="text-red-700">{formatDate(orderDetails.estimated_delivery_date)}</p>
                </div>
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Timeline & Products */}
              <div className="lg:col-span-2 space-y-6">
                {/* Timeline */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">Status Pengiriman</h2>
                  <OrderTrackingTimeline items={timelineItems} />
                </div>

                {/* Products */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">Produk yang Dipesan</h2>
                  <div className="space-y-4">
                    {orderDetails.items.map((item) => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                        <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image_url}
                            alt={item.product_name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{item.product_name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatCurrency(parseFloat(item.price_at_purchase))} × {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            Subtotal: {formatCurrency(parseFloat(item.subtotal))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* Right Column - Shipping Details */}
              <div className="lg:col-span-1">
                {shippingDetailsCardProps && <ShippingDetailsCard {...shippingDetailsCardProps} />}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/my-orders"
                className="flex-1 border border-[#E53935] text-[#E53935] h-12 rounded-md font-semibold hover:bg-red-50 flex items-center justify-center transition-colors"
              >
                Kembali ke Daftar Pesanan
              </Link>
            </div>
          </main>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}