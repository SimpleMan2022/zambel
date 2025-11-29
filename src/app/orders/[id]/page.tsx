"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { MainLayout } from "@/components/main-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { OrderTrackingTimeline, TimelineItem } from "@/components/order-tracking-timeline"
import { ShippingDetailsCard } from "@/components/shipping-details-card"
import { useAuth } from "@/contexts/auth-context"
import { RiLoader4Line, RiFileListLine, RiCloseLine } from "@remixicon/react"

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
  user_id: string
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
  tracking_number: string | null;
  estimated_delivery_date: string | null;

  // Shipping Address Details
  ship_recipient_name: string
  ship_phone: string
  ship_street: string
  ship_city: string
  ship_province: string
  ship_postal_code: string
  ship_label: string | null

  items: OrderItem[]
  courier_name: string | null; // Added courier_name to the interface
}

export default function OrderTrackingPage() {
  const { id: order_id } = useParams()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrderDetails = useCallback(async () => {
    if (!isAuthenticated || !order_id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${order_id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }
      const result = await response.json();
      if (result.success) {
        setOrderDetails(result.data);
      } else {
        setError(result.message || "Failed to fetch order details");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [order_id, isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchOrderDetails();
      } else {
        router.replace("/login");
      }
    }
  }, [authLoading, isAuthenticated, fetchOrderDetails, router]);

  const formatPrice = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(numValue);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600';
      case 'paid':
      case 'delivered':
        return 'text-green-600';
      case 'processing':
      case 'shipped':
        return 'text-blue-600';
      case 'cancelled':
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Menunggu Pembayaran';
      case 'processing':
        return 'Sedang Diproses';
      case 'shipped':
        return 'Dalam Pengiriman';
      case 'delivered':
        return 'Sudah Diterima';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const generateTimelineItems = (order: OrderDetails): TimelineItem[] => {
    const timeline: TimelineItem[] = [
      {
        id: "order-confirmed",
        title: "Pesanan Dikonfirmasi",
        date: new Date(order.created_at).toLocaleDateString('id-ID'),
        time: new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        isCompleted: true,
        isActive: false,
      },
    ];

    if (order.payment_status === 'paid' || order.payment_status === 'processing') {
      timeline.push({
        id: "payment-received",
        title: "Pembayaran Diterima",
        date: "", // Not available in current JSON
        time: "", // Not available in current JSON
        isCompleted: true,
        isActive: false,
        description: `Status Pembayaran: ${getStatusDisplay(order.payment_status)}`
      });
    }


    if (order.order_status === 'shipped' || order.order_status === 'delivered') {
      let description = `Kurir: ${order.tracking_number ? '' : 'Belum Tersedia'}\nNo Resi: ${order.tracking_number || 'Belum Tersedia'}`;
      if (order.estimated_delivery_date) {
        description += `\nEstimasi tiba: ${new Date(order.estimated_delivery_date).toLocaleDateString('id-ID')}`;
      }
      timeline.push({
        id: "order-shipped",
        title: "Pesanan Dikirim",
        date: "", // Not available in current JSON
        time: "", // Not available in current JSON
        description,
        isCompleted: order.order_status === 'delivered',
        isActive: order.order_status === 'shipped',
      });
    }

    if (order.order_status === 'delivered') {
      timeline.push({
        id: "order-delivered",
        title: "Pesanan Diterima",
        date: "", // Not available in current JSON
        time: "", // Not available in current JSON
        isCompleted: true,
        isActive: true,
      });
    }

    // Sort timeline items by completion status and then by their natural order
    // This ensures completed items appear first, then active, then pending.
    timeline.sort((a, b) => {
      if (a.isCompleted && !b.isCompleted) return -1;
      if (!a.isCompleted && b.isCompleted) return 1;
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return 0;
    });

    return timeline;
  };

  const shippingDetailsCardProps = orderDetails ? {
    deliveryStore: {
      name: "Toko Zambel", // Hardcoded for now
      address: "Jl. Sambel Peleta No. 123, Jakarta", // Hardcoded for now
    },
    receiver: {
      name: orderDetails.ship_recipient_name,
      address: `${orderDetails.ship_street}, ${orderDetails.ship_city}, ${orderDetails.ship_province}, ${orderDetails.ship_postal_code}`,
      phone: orderDetails.ship_phone,
    },
    courier: {
      name: orderDetails.courier_name || 'Belum Tersedia', // Assuming courier_name will be available in OrderDetails
      resi: orderDetails.tracking_number || 'Belum Tersedia',
    },
    orderItems: orderDetails.items.map(item => ({
      name: item.product_name,
      quantity: item.quantity,
      price: parseFloat(item.price_at_purchase),
    })),
    subtotalItems: parseFloat(orderDetails.subtotal),
    shippingCost: parseFloat(orderDetails.shipping_cost),
  } : null;

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                <RiLoader4Line className="animate-spin inline-block mr-2" /> Memuat Detail Pesanan...
              </h1>
            </div>

            {/* Skeleton for Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1 bg-white p-6 rounded-lg border border-gray-200 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-20 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </main>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center">
            <RiCloseLine className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Maaf, Terjadi Masalah</h1>
            <p className="text-gray-700 text-lg mb-6">{error}</p>
            <button onClick={() => router.back()} className="bg-[#E53935] hover:bg-[#d32f2f] text-white font-semibold py-2 px-5 rounded-md transition">
              Kembali
            </button>
          </main>
        </div>
      </MainLayout>
    );
  }

  if (!orderDetails) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center">
            <RiFileListLine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Pesanan Tidak Ditemukan</h1>
            <p className="text-gray-700 text-lg mb-6">Pesanan dengan ID "{order_id}" tidak ditemukan atau Anda tidak memiliki akses.</p>
            <Link href="/my-orders" className="bg-[#E53935] hover:bg-[#d32f2f] text-white font-semibold py-2 px-5 rounded-md transition">
              Lihat Semua Pesanan
            </Link>
          </main>
        </div>
      </MainLayout>
    );
  }

  const timelineItems = generateTimelineItems(orderDetails);

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Pelacakan Pesanan
              </h1>
              <div className="flex flex-col gap-2 text-gray-600">
                <p>
                  Nomor Pesanan:{" "}
                  <span className="font-semibold text-gray-900">#{orderDetails.order_number}</span>
                </p>
                <p>
                  Status:{" "}
                  <span className={`font-semibold ${getStatusColor(orderDetails.order_status)}`}>
                    {getStatusDisplay(orderDetails.order_status)}
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
                {shippingDetailsCardProps && <ShippingDetailsCard {...shippingDetailsCardProps} />}
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

              <Link
                  href="/my-orders"
                  className="flex-1 border border-[#E53935] text-[#E53935] h-12 rounded-md font-semibold hover:bg-red-50 bg-transparent flex items-center justify-center"
              >
                Kembali ke Daftar Pesanan
              </Link>
            </div>
          </main>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
