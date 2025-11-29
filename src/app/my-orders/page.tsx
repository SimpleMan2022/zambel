"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/main-layout';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/contexts/auth-context';
import { RiLoader4Line, RiFileListLine, RiCloseLine } from '@remixicon/react';

interface OrderSummary {
  id: string;
  order_number: string;
  status: string;
  subtotal: string;
  discount: string;
  shipping_cost: string;
  tax: string;
  total: string;
  payment_status: string;
  tracking_number: string | null;
  estimated_delivery_date: string | null;
  created_at: string;
}

export default function MyOrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all'); // New state for filtering

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filterStatus && filterStatus !== 'all') {
        queryParams.append('status', filterStatus);
      }
      const response = await fetch(`/api/orders?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const result = await response.json();
      if (result.success) {
        setOrders(result.data);
      } else {
        setError(result.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, filterStatus]); // Add filterStatus to dependencies

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchOrders();
      } else {
        router.replace("/login");
      }
    }
  }, [authLoading, isAuthenticated, fetchOrders, router]);

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

  const orderStatuses = [
    { key: 'all', label: 'Semua Pesanan' },
    { key: 'pending', label: 'Menunggu Pembayaran' },
    { key: 'processing', label: 'Sedang Diproses' },
    { key: 'shipped', label: 'Dalam Pengiriman' },
    { key: 'delivered', label: 'Selesai' },
    { key: 'cancelled', label: 'Dibatalkan' },
  ];

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Filters Skeleton */}
            <div className="mb-6 flex space-x-3 overflow-x-auto pb-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 w-32 bg-gray-200 rounded-full flex-shrink-0"></div>
              ))}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              <RiLoader4Line className="animate-spin inline-block mr-2" /> Memuat Pesanan Anda...
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
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
              Coba Lagi
            </button>
          </main>
        </div>
      </MainLayout>
    );
  }

  if (orders.length === 0 && filterStatus !== 'all') {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center">
            {/* Filters */}
            <div className="mb-6 flex space-x-3 overflow-x-auto pb-2">
              {orderStatuses.map((status) => (
                <button
                  key={status.key}
                  onClick={() => setFilterStatus(status.key)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200
                    ${filterStatus === status.key ? 'bg-primary-red text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {status.label}
                </button>
              ))}
            </div>
            <RiFileListLine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Tidak Ada Pesanan ({getStatusDisplay(filterStatus)})</h1>
            <p className="text-gray-700 text-lg mb-6">Tidak ada pesanan dengan status "{getStatusDisplay(filterStatus)}".</p>
            <button onClick={() => setFilterStatus('all')} className="bg-[#E53935] hover:bg-[#d32f2f] text-white font-semibold py-2 px-5 rounded-md transition">
              Lihat Semua Pesanan
            </button>
          </main>
        </div>
      </MainLayout>
    );
  }

  if (orders.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center">
            {/* Filters */}
            <div className="mb-6 flex space-x-3 overflow-x-auto pb-2">
              {orderStatuses.map((status) => (
                <button
                  key={status.key}
                  onClick={() => setFilterStatus(status.key)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200
                    ${filterStatus === status.key ? 'bg-primary-red text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {status.label}
                </button>
              ))}
            </div>
            <RiFileListLine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Tidak Ada Pesanan</h1>
            <p className="text-gray-700 text-lg mb-6">Anda belum memiliki pesanan. Mari mulai berbelanja!</p>
            <Link href="/products" className="bg-[#E53935] hover:bg-[#d32f2f] text-white font-semibold py-2 px-5 rounded-md transition">
              Mulai Belanja
            </Link>
          </main>
        </div>
      </MainLayout>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Pesanan Saya
              </h1>
              <p className="text-gray-600">
                Total {orders.length} pesanan
              </p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex space-x-3 overflow-x-auto pb-2">
              {orderStatuses.map((status) => (
                <button
                  key={status.key}
                  onClick={() => setFilterStatus(status.key)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200
                    ${filterStatus === status.key ? 'bg-primary-red text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
                  {/* Order Header */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-lg font-bold text-gray-900">
                        Pesanan #{order.order_number}
                      </h2>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-gray-600">
                      <p>
                        Tanggal: <span className="font-medium text-gray-900">
                          {new Date(order.created_at).toLocaleDateString('id-ID', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </p>
                      <p>
                        Status: <span className={`font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusDisplay(order.status)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="mb-4 space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span>Total Pesanan:</span>
                      <span className="font-bold text-[#E53935]">{formatPrice(order.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status Pembayaran:</span>
                      <span className={`font-semibold capitalize ${getStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </div>
                    {order.tracking_number && (
                      <div className="flex justify-between">
                        <span>Nomor Resi:</span>
                        <span className="font-medium">{order.tracking_number}</span>
                      </div>
                    )}
                    {order.estimated_delivery_date && (
                      <div className="flex justify-between">
                        <span>Estimasi Tiba:</span>
                        <span className="font-medium">
                          {new Date(order.estimated_delivery_date).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link 
                    href={`/orders/${order.id}`}
                    className="w-full inline-block text-center bg-[#E53935] hover:bg-[#d32f2f] text-white font-semibold py-2 rounded-md transition"
                  >
                    Lihat Detail Pesanan
                  </Link>
                </div>
              ))}
            </div>
          </main>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
