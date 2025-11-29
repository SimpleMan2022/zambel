"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/main-layout';
import { ProtectedRoute } from '@/components/protected-route';
import { CheckoutStepIndicator } from '@/components/checkout-step-indicator';
import { OrderSummary } from '@/components/order-summary';
import { useAuth } from '@/contexts/auth-context';
import { RiLoader4Line } from '@remixicon/react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface ShippingAddressData {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  provinceCode: string;
  provinceName: string;
  regencyCode: string;
  regencyName: string;
  districtCode: string;
  districtName: string;
  postalCode: string;
  notes?: string;
}

interface SelectedShippingMethod {
  courierCode: string;
  service: string;
  cost: number;
  etd: string;
}

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, updateCartItemCount } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressData | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<SelectedShippingMethod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch cart items
      const cartResponse = await fetch("/api/cart");
      const cartResult = await cartResponse.json();
      if (cartResponse.ok && cartResult.success) {
        setCartItems(cartResult.data);
      } else {
        throw new Error(cartResult.message || "Failed to fetch cart items");
      }

      // 2. Retrieve address data from localStorage
      const storedAddress = localStorage.getItem('checkoutAddressFormData');
      if (storedAddress) {
        setShippingAddress(JSON.parse(storedAddress));
      } else {
        throw new Error("Shipping address not found. Please go back to address step.");
      }

      // 3. Retrieve shipping method from localStorage
      const storedShipping = localStorage.getItem('selectedShippingMethod');
      if (storedShipping) {
        setSelectedShippingMethod(JSON.parse(storedShipping));
      } else {
        throw new Error("Shipping method not selected. Please go back to shipping step.");
      }

    } catch (err) {
      console.error("Error fetching initial data for payment page:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred while loading payment data.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading) {
      fetchInitialData();
    }
  }, [authLoading, fetchInitialData]);

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    setError(null);

    if (!isAuthenticated) {
      setError("You must be logged in to complete payment.");
      setIsProcessingPayment(false);
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty. Please add items before checking out.");
      setIsProcessingPayment(false);
      return;
    }

    if (!shippingAddress || !selectedShippingMethod) {
      setError("Missing address or shipping method. Please go back to previous steps.");
      setIsProcessingPayment(false);
      return;
    }

    try {
      const response = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),
          shippingAddress,
          selectedShippingMethod,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success && result.data.midtransRedirectUrl) {
        // Clear local storage items after successful order initiation
        localStorage.removeItem('checkoutAddressFormData');
        localStorage.removeItem('selectedShippingMethod');
        updateCartItemCount(0); // Reset cart count in AuthContext
        
        // Redirect to Midtrans payment page
        window.location.href = result.data.midtransRedirectUrl; 
        // Using window.location.href here as it's an external redirect to Midtrans
      } else {
        setError(result.message || "Failed to initiate payment. Please try again.");
      }
    } catch (err) {
      console.error("Error initiating payment:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const totalOrderAmount = calculateSubtotal();
  const currentShippingCost = selectedShippingMethod ? selectedShippingMethod.cost : 0;
  const finalTotal = totalOrderAmount + currentShippingCost;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
  };

  if (authLoading || isLoading || !shippingAddress || !selectedShippingMethod) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <CheckoutStepIndicator currentStep={3} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-gray-200 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
            <div className="lg:col-span-1">
              <OrderSummary cartItems={[]} shippingCost={0} />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-8 text-red-500">Error Memuat Data</h1>
          <p className="text-gray-700">{error}</p>
          <button onClick={() => router.back()} className="mt-6 bg-gray-200 text-gray-800 font-semibold py-3 px-8 rounded-md hover:bg-gray-300 transition">
            Kembali
          </button>
        </div>
      </MainLayout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-8">Keranjang Anda Kosong</h1>
          <p className="text-gray-700">Silakan tambahkan produk ke keranjang Anda sebelum melanjutkan ke checkout.</p>
          <button onClick={() => router.push("/products")} className="mt-6 bg-primary-red text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition">
            Mulai Belanja
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <CheckoutStepIndicator currentStep={3} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Left side - Payment Details & Final Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-6">Konfirmasi Pesanan & Pembayaran</h2>

                <div className="space-y-4 mb-8">
                  <div>
                    <h3 className="font-semibold text-gray-800">Alamat Pengiriman:</h3>
                    <p className="text-gray-700">{shippingAddress.fullName}</p>
                    <p className="text-gray-700">{shippingAddress.phone}</p>
                    <p className="text-gray-700">{shippingAddress.addressLine1}, {shippingAddress.addressLine2}</p>
                    <p className="text-gray-700">{shippingAddress.districtName}, {shippingAddress.regencyName}, {shippingAddress.provinceName}, {shippingAddress.postalCode}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Metode Pengiriman:</h3>
                    <p className="text-gray-700">{selectedShippingMethod.courierCode.toUpperCase()} - {selectedShippingMethod.service} (Estimasi: {selectedShippingMethod.etd} hari)</p>
                    <p className="font-bold text-gray-900">Ongkos Kirim: {formatPrice(selectedShippingMethod.cost)}</p>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessingPayment}
                  className="w-full bg-primary-red hover:bg-red-700 text-white font-bold py-3 rounded-md transition-colors flex items-center justify-center"
                >
                  {isProcessingPayment ? <RiLoader4Line className="animate-spin mr-2" /> : null}
                  Bayar Sekarang
                </button>
              </div>
            </div>

            {/* Right side - Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary cartItems={cartItems} shippingCost={currentShippingCost} />
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}