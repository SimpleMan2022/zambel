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
  weight?: number;
}

interface ShippingOption {
  code: string;
  name: string;
  services: Array<{
    service: string;
    description: string;
    cost: number;
    etd: string;
    note: string;
  }>;
}

interface AddressFormData {
  provinceCode: string;
  regencyCode: string;
  districtCode: string;
}

interface SelectedShippingMethod {
  courierCode: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
  total_weight: number;
  origin_district_code: string;
  destination_district_code: string;
}

const SHOP_ORIGIN_DISTRICT_CODE = "3575";

export default function CheckoutShippingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, token } = useAuth(); // ✅ token ditambahkan

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const [selectedShipping, setSelectedShipping] = useState<SelectedShippingMethod | null>(null);
  const [addressData, setAddressData] = useState<AddressFormData | null>(null);

  // ✅ Ambil alamat dari localStorage
  useEffect(() => {
    const storedAddress = localStorage.getItem('checkoutAddressFormData');
    if (storedAddress) {
      setAddressData(JSON.parse(storedAddress));
    } else {
      router.replace("/checkout/address");
    }
  }, [router]);

  // ✅ FETCH CART — SEKARANG PAKAI AUTH HEADER
  const fetchCartItems = useCallback(async (authToken: string | null) => {
    if (!isAuthenticated || !authToken) {
      setIsCartLoading(false);
      return;
    }

    setIsCartLoading(true);
    setCartError(null);

    try {
      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cart items");
      }

      const result = await response.json();

      if (result.success) {
        setCartItems(result.data);
      } else {
        setCartError(result.message || "Failed to fetch cart items");
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCartError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsCartLoading(false);
    }
  }, [isAuthenticated]);

  // ✅ TOTAL WEIGHT
  const calculateTotalWeight = useCallback(() => {
    return cartItems.reduce(
      (total, item) => total + (item.quantity * (item.weight || 200)),
      0
    );
  }, [cartItems]);

  // ✅ FETCH SHIPPING OPTIONS
  const fetchShippingOptions = useCallback(async () => {
    if (!addressData || !addressData.districtCode || cartItems.length === 0) return;

    setIsLoadingShipping(true);
    setShippingError(null);

    try {
      const totalWeight = calculateTotalWeight();

      const response = await fetch("/api/shipping-options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          origin_district_code: SHOP_ORIGIN_DISTRICT_CODE,
          destination_district_code: addressData.districtCode,
          total_weight: totalWeight,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch shipping options");
      }

      const result = await response.json();

      if (result.success) {
        setShippingOptions(result.data);

        if (result.data.length > 0) {
          const allServices = result.data.flatMap((courier: ShippingOption) =>
            courier.services.map(service => ({
              ...service,
              courierCode: courier.code,
            }))
          );

          if (allServices.length > 0) {
            const lowestCostService = allServices.reduce((prev: any, current: any) =>
              (prev.cost < current.cost) ? prev : current
            );

            setSelectedShipping({
              courierCode: lowestCostService.courierCode,
              service: lowestCostService.service,
              description: lowestCostService.description,
              cost: lowestCostService.cost,
              etd: lowestCostService.etd,
              total_weight: totalWeight,
              origin_district_code: SHOP_ORIGIN_DISTRICT_CODE,
              destination_district_code: addressData.districtCode,
            });
          }
        }
      } else {
        setShippingError(result.message || "Failed to fetch shipping options");
      }
    } catch (err) {
      console.error("Error fetching shipping options:", err);
      setShippingError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoadingShipping(false);
    }
  }, [addressData, cartItems, calculateTotalWeight]);

  // ✅ AUTH FLOW SERAGAM
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && token) {
        fetchCartItems(token);
      } else {
        router.replace("/login");
      }
    }
  }, [authLoading, isAuthenticated, token, fetchCartItems, router]);

  // ✅ FETCH ONGKIR SETELAH CART & ADDRESS READY
  useEffect(() => {
    if (cartItems.length > 0 && addressData?.districtCode && !isCartLoading) {
      fetchShippingOptions();
    }
  }, [cartItems, addressData, fetchShippingOptions, isCartLoading]);

  const handleSelectShipping = (
    courierCode: string,
    serviceName: string,
    description: string,
    cost: number,
    etd: string
  ) => {
    const totalWeight = calculateTotalWeight();

    setSelectedShipping({
      courierCode,
      service: serviceName,
      description,
      cost,
      etd,
      total_weight: totalWeight,
      origin_district_code: SHOP_ORIGIN_DISTRICT_CODE,
      destination_district_code: addressData!.districtCode,
    });
  };

  const handleSubmitToPayment = () => {
    if (selectedShipping) {
      localStorage.setItem('selectedShippingMethod', JSON.stringify(selectedShipping));
    }
    router.push("/checkout/payment");
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
  };

  const currentShippingCost = selectedShipping ? selectedShipping.cost : 0;

  if (authLoading || isCartLoading || !addressData || !addressData.districtCode || isLoadingShipping) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <CheckoutStepIndicator currentStep={2} />
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

  if (cartError || shippingError) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-8 text-red-500">Error Memuat Data</h1>
          <p className="text-gray-700">{cartError || shippingError}</p>
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

  if (shippingOptions.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-8">Tidak Ada Opsi Pengiriman</h1>
          <p className="text-gray-700">Maaf, tidak ada opsi pengiriman yang tersedia untuk alamat ini. Silakan kembali ke halaman alamat untuk mengubahnya.</p>
          <button onClick={() => router.push("/checkout/address")} className="mt-6 bg-gray-200 text-gray-800 font-semibold py-3 px-8 rounded-md hover:bg-gray-300 transition">
            Ubah Alamat
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

          <CheckoutStepIndicator currentStep={2} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Left side - Shipping Options */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-6">Pilih Metode Pengiriman</h2>

                <div className="space-y-6">
                  {shippingOptions.map((courier) => (
                    <div key={courier.code} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 font-semibold text-gray-800 border-b border-gray-200">
                        {courier.name.toUpperCase()}
                      </div>
                      <div className="p-4 space-y-3">
                        {courier.services.map((service) => (
                          <label key={`${courier.code}-${service.service}`} className="flex items-center space-x-3 cursor-pointer p-3 border rounded-md hover:bg-gray-50 transition"
                            onClick={() => handleSelectShipping(courier.code, service.service, service.description, service.cost, service.etd)}
                          >
                            <input
                              type="radio"
                              name="shippingMethod"
                              value={`${courier.code}-${service.service}`}
                              checked={selectedShipping?.courierCode === courier.code && selectedShipping?.service === service.service}
                              onChange={() => handleSelectShipping(courier.code, service.service, service.description, service.cost, service.etd)}
                              className="form-radio h-4 w-4 text-primary-red border-gray-300 focus:ring-primary-red"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{service.service} ({service.description})</p>
                              <p className="text-sm text-gray-600">Estimasi tiba: {service.etd?.replace(/day/g, '').trim()} hari</p>
                            </div>
                            <span className="font-bold text-gray-900">{formatPrice(service.cost)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={handleSubmitToPayment}
                  disabled={!selectedShipping}
                  className="w-full bg-primary-red hover:bg-red-700 text-white font-bold py-3 rounded-md transition-colors mt-8"
                >
                  Lanjutkan ke Pembayaran
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
