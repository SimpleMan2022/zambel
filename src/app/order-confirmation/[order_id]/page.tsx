"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MainLayout } from '@/components/main-layout';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/contexts/auth-context';
import { RiCheckFill, RiLoader4Line } from '@remixicon/react';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
  subtotal: number;
  image_url: string;
}

interface OrderDetails {
  id: string;
  order_number: string;
  user_id: string;
  order_status: string;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  tax: number;
  total: number;
  payment_status: string;
  snap_token: string;
  midtrans_order_id: string;
  created_at: string | null;

  ship_recipient_name: string;
  ship_phone: string;
  ship_street: string;
  ship_city: string;
  ship_province: string;
  ship_postal_code: string;
  ship_label: string;
  courier_name: string;

  items: OrderItem[];
}

export default function OrderConfirmationPage() {
  const { order_id } = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, token } = useAuth(); // ✅ token dipakai

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ FIXED: FETCH ORDER DETAIL WITH AUTH HEADER
  const fetchOrderDetails = useCallback(async () => {
    if (!isAuthenticated || !order_id || !token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${order_id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ FIX UTAMA
        },
      });

      const result = await response.json();
      console.log("result", result);

      if (response.ok && result.success) {
        setOrderDetails(result.data);
      } else {
        setError(result.message || "Gagal memuat detail pesanan");
      }

    } catch (err) {
      console.error("Fetch order error:", err);
      setError("Gagal memuat detail pesanan");
    } finally {
      setIsLoading(false);
    }
  }, [order_id, isAuthenticated, token]);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchOrderDetails();
      } else {
        router.replace("/login");
      }
    }
  }, [authLoading, isAuthenticated, fetchOrderDetails, router]);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-10 text-center">
          <RiLoader4Line className="animate-spin w-10 h-10 mx-auto mb-4" />
          <h1 className="text-xl font-semibold">Memuat Konfirmasi Pesanan...</h1>
        </div>
      </MainLayout>
    );
  }

  if (error || !orderDetails) {
    return (
      <MainLayout>
        <div className="container mx-auto p-10 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Terjadi Kesalahan
          </h1>
          <p className="text-gray-700 mb-6">{error || "Pesanan tidak ditemukan"}</p>
          <Link href="/my-orders" className="bg-primary-red px-5 py-3 rounded-lg text-white font-semibold">
            Kembali ke Pesanan Saya
          </Link>
        </div>
      </MainLayout>
    );
  }

  const subtotalItems = orderDetails.items.reduce((sum, it) => sum + it.subtotal, 0);

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto p-6 py-10">
          <div className="bg-white rounded-xl shadow-lg p-10 max-w-3xl mx-auto text-center">

            <RiCheckFill className="w-20 h-20 text-green-500 mx-auto mb-6" />

            <h1 className="text-4xl font-extrabold mb-4 text-gray-900">
              Pesanan Berhasil!
            </h1>

            <p className="text-gray-600 mb-10">
              Terima kasih! Pesanan Anda telah kami terima dan sedang diproses.
            </p>

            {/* ORDER SUMMARY */}
            <div className="bg-gray-50 p-6 rounded-lg border text-left mb-8">
              <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>
              <p>Nomor Pesanan: <b>{orderDetails.order_number}</b></p>
              <p>
                Tanggal:{" "}
                <b>
                  {orderDetails.created_at
                    ? new Date(orderDetails.created_at).toLocaleString("id-ID")
                    : "-"}
                </b>
              </p>
              <p>Status Pembayaran:
                <b className="ml-2">
                  {orderDetails.payment_status.toUpperCase()}
                </b>
              </p>
              <p>Status Pesanan:
                <b className="ml-2">
                  {orderDetails.order_status.toUpperCase()}
                </b>
              </p>
            </div>

            {/* SHIPPING */}
            <div className="bg-gray-50 p-6 rounded-lg border text-left mb-8">
              <h2 className="text-xl font-bold mb-4">Detail Pengiriman</h2>
              <p><b>{orderDetails.ship_recipient_name}</b></p>
              <p>{orderDetails.ship_phone}</p>
              <p>{orderDetails.ship_street}</p>
              <p>
                {orderDetails.ship_city}, {orderDetails.ship_province}{" "}
                {orderDetails.ship_postal_code}
              </p>
              {orderDetails.ship_label && (
                <p className="text-sm italic mt-2">
                  Catatan: {orderDetails.ship_label}
                </p>
              )}
            </div>

            {/* ITEMS */}
            <div className="bg-gray-50 p-6 rounded-lg border text-left mb-8">
              <h2 className="text-xl font-bold mb-4">Item Pesanan</h2>

              {orderDetails.items.map(item => (
                <div key={item.id} className="flex gap-4 border-b py-3 last:border-b-0">

                  <div className="relative w-20 h-20 rounded overflow-hidden border">
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {formatPrice(item.price_at_purchase)}
                    </p>
                  </div>

                  <p className="font-bold">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>

            {/* PAYMENT SUMMARY */}
            <div className="bg-gray-50 p-6 rounded-lg border text-left mb-8">
              <h2 className="text-xl font-bold mb-4">Rincian Pembayaran</h2>

              <div className="flex justify-between mb-2">
                <span>Subtotal Barang</span>
                <b>{formatPrice(subtotalItems)}</b>
              </div>

              <div className="flex justify-between mb-4">
                <span>Biaya Pengiriman</span>
                <b>{formatPrice(orderDetails.shipping_cost)}</b>
              </div>

              <div className="flex justify-between text-xl font-bold text-primary-red pt-3 border-t">
                <span>Total Pembayaran</span>
                <span>{formatPrice(orderDetails.total)}</span>
              </div>
            </div>

            <Link
              href="/my-orders"
              className="inline-block bg-primary-red text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-700 transition"
            >
              Lihat Pesanan Saya
            </Link>

          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
