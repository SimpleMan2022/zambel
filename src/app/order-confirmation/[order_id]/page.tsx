"use client"

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MainLayout } from '@/components/main-layout';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/contexts/auth-context';
import { RiCheckFill, RiCloseFill, RiLoader4Line } from '@remixicon/react';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price_at_purchase: string; // Changed to string to match JSON
  subtotal: string; // Changed to string to match JSON
  image_url: string;
}

interface OrderDetails {
  id: string;
  order_number: string; // Added
  user_id: string;
  order_status: string; // Changed from order_status to order_status
  subtotal: string; // Changed to string to match JSON
  discount: string; // Changed to string to match JSON
  shipping_cost: string; // Changed to string to match JSON
  tax: string; // Changed to string to match JSON
  total: string; // Changed to string to match JSON
  payment_status: string; // Changed to string to match JSON
  snap_token: string;
  midtrans_order_id: string; // Added
  created_at: string;
  ship_recipient_name: string; // Changed from shipping_full_name
  ship_phone: string; // Changed from shipping_phone_number
  ship_street: string; // Changed from shipping_address_line_1
  ship_city: string; // Changed from shipping_city
  ship_province: string; // Changed from shipping_province
  ship_postal_code: string; // Changed from shipping_postal_code
  ship_label: string; // Changed from shipping_notes (using label for this)
  items: OrderItem[];
}

export default function OrderConfirmationPage() {
  const { order_id } = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        // Midtrans sometimes has null for midtrans_order_id before settlement
        // Ensure it's treated as string to avoid type issues
        setOrderDetails({
          ...result.data,
          midtrans_order_id: result.data.midtrans_order_id || "",
          snap_token: result.data.snap_token || "",
          // Convert price and subtotal in items to numbers for calculation if needed, but keep as string for display
          items: result.data.items.map((item: any) => ({
            ...item,
            price_at_purchase: parseFloat(item.price_at_purchase), // Convert to number for calculations
            subtotal: parseFloat(item.subtotal), // Convert to number for calculations
          }))
        });
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
        router.replace("/login"); // Redirect to login if not authenticated
      }
    }
  }, [authLoading, isAuthenticated, fetchOrderDetails, router]);

  const formatPrice = (value: number | string) => {
    // Ensure value is a number before formatting
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(numValue);
  };

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 py-8">
          <h1 className="text-3xl font-bold mb-6"><RiLoader4Line className="animate-spin inline-block mr-2" /> Memuat Konfirmasi Pesanan...</h1>
          {/* Basic skeleton for order confirmation page */}
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <div className="h-10 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="h-20 w-20 bg-gray-200 rounded-md"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 py-8 text-center">
          {/* <RiCloseFill className="w-16 h-16 text-red-500 mx-auto mb-4" /> */}
          <h1 className="text-3xl font-bold text-red-700 mb-4">Maaf, Terjadi Masalah</h1>
          <p className="text-gray-700 text-lg mb-6">Mohon maaf, kami mengalami kendala saat memuat detail pesanan Anda. Silakan coba lagi nanti atau hubungi customer service kami jika masalah berlanjut.</p>
          <Link href="/cart" className="bg-primary-red text-white font-semibold py-2 px-5 rounded-lg hover:bg-red-700 transition">
            Kembali ke Keranjang
          </Link>
        </div>
      </MainLayout>
    );
  }

  if (!orderDetails) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 py-8 text-center">
          {/* <RiCloseFill className="w-16 h-16 text-red-500 mx-auto mb-4" /> */}
          <h1 className="text-3xl font-bold text-red-700 mb-4">Pesanan Tidak Ditemukan</h1>
          <p className="text-gray-700 text-lg mb-6">Kami tidak dapat menemukan pesanan yang Anda cari. Pastikan Anda memiliki URL yang benar atau coba periksa daftar pesanan Anda.</p>
          <Link href="/my-orders" className="bg-primary-red text-white font-semibold py-2 px-5 rounded-lg hover:bg-red-700 transition">
            Lihat Pesanan Saya
          </Link>
        </div>
      </MainLayout>
    );
  }

  const subtotalItems = orderDetails.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto p-4 py-8">
          <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-2xl mx-auto">
            <RiCheckFill className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Pesanan Berhasil</h1>
            <p className="text-lg text-gray-700 mb-8 max-w-md mx-auto">Terima kasih atas pesanan Anda. Detail pesanan Anda telah dikonfirmasi dan akan segera kami proses.</p>

            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Ringkasan Pesanan</h2>
              <div className="space-y-2">
                <p className="text-md text-gray-700">Nomor Pesanan: <span className="font-bold text-gray-900">{orderDetails.order_number}</span></p>
                <p className="text-md text-gray-700">Tanggal Pesanan: <span className="font-bold text-gray-900">{new Date(orderDetails.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></p>
                <p className="text-md text-gray-700">Status Pembayaran: <span className={`font-bold ${orderDetails.payment_status === 'paid' ? 'text-green-600' : orderDetails.payment_status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>{orderDetails.payment_status.toUpperCase()}</span></p>
                <p className="text-md text-gray-700">Status Pesanan: <span className="font-bold text-gray-900">{orderDetails.order_status.toUpperCase()}</span></p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Detail Pengiriman</h2>
              <div className="space-y-1 text-gray-700">
                <p><strong>{orderDetails.ship_recipient_name}</strong></p>
                <p>{orderDetails.ship_phone}</p>
                <p>{orderDetails.ship_street}</p>
                <p>{orderDetails.ship_city}, {orderDetails.ship_province}, {orderDetails.ship_postal_code}</p>
                {orderDetails.ship_label && <p className="text-sm italic mt-2">Catatan: {orderDetails.ship_label}</p>}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Item Pesanan</h2>
              <div className="space-y-4">
                {orderDetails.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 py-2 border-b border-gray-200 last:border-b-0">
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                      <Image
                        src={item.image_url || "/placeholder-image.jpg"}
                        alt={item.product_name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-lg mb-1">{item.product_name}</p>
                      <p className="text-gray-600 text-sm">{item.quantity} x {formatPrice(item.price_at_purchase)}</p>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">{formatPrice(item.quantity * parseFloat(item.price_at_purchase))}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg text-left border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Rincian Pembayaran</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-md text-gray-700">
                  <span>Subtotal Barang:</span>
                  <span className="font-semibold">{formatPrice(subtotalItems)}</span>
                </div>
                <div className="flex justify-between items-center text-md text-gray-700">
                  <span>Biaya Pengiriman:</span>
                  <span className="font-semibold">{formatPrice(parseFloat(orderDetails.shipping_cost))}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-bold text-primary-red pt-4 border-t border-gray-200 mt-4">
                  <span>Total Pesanan:</span>
                  <span>{formatPrice(parseFloat(orderDetails.total))}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/my-orders" className="w-full inline-block bg-primary-red text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-700 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-md hover:shadow-lg">
                Lihat Pesanan Saya
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
