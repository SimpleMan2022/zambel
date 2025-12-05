"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { MainLayout } from "@/components/main-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { CheckoutStepIndicator } from "@/components/checkout-step-indicator"
import { OrderSummary } from "@/components/order-summary"
import { useAuth } from "@/contexts/auth-context"
import { RiLoader4Line } from "@remixicon/react"
import { useRouter } from "next/navigation";
import { ProvinceSelect } from "@/components/forms/province-select";
import { RegencySelect } from "@/components/forms/regency-select";
import { DistrictSelect } from "@/components/forms/district-select";

interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export default function CheckoutAddressPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter(); // Initialize useRouter
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    provinceCode: "",
    provinceName: "",
    regencyCode: "",
    regencyName: "",
    districtCode: "",
    districtName: "",
    postalCode: "",
    notes: "",
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);

  const [isLoadingRegionalData, setIsLoadingRegionalData] = useState(false);
  const [regionalError, setRegionalError] = useState<string | null>(null);

  const shippingCostPlaceholder = 0; // Will be dynamic with RajaOngkir integration

  // Pre-fill user data if available
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [isAuthenticated, user]);

  const fetchCartItems = useCallback(async () => {
    if (!isAuthenticated) {
      setIsCartLoading(false);
      return;
    }
    setIsCartLoading(true);
    setCartError(null);
    try {
      const response = await fetch("/api/cart");
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

  useEffect(() => {
    if (!authLoading) {
      fetchCartItems();
    }
  }, [authLoading, fetchCartItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = useCallback((code: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      provinceCode: code,
      provinceName: name,
      regencyCode: "", regencyName: "",
      districtCode: "", districtName: "",
    }));
  }, []);

  const handleRegencyChange = useCallback((code: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      regencyCode: code,
      regencyName: name,
      districtCode: "", districtName: "",
    }));
  }, []);

  const handleDistrictChange = useCallback((code: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      districtCode: code,
      districtName: name,
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Address submitted:", formData);
    localStorage.setItem('checkoutAddressFormData', JSON.stringify(formData));
    router.push("/checkout/shipping");
  };

  if (authLoading || isCartLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <CheckoutStepIndicator currentStep={1} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-gray-200 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="lg:col-span-1">
              <OrderSummary cartItems={[]} shippingCost={0} /> {/* Empty cart for skeleton */}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (cartError || regionalError) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-8 text-red-500">Error Memuat Data</h1>
          <p className="text-gray-700">{cartError || regionalError}</p>
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

            <CheckoutStepIndicator currentStep={1} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              {/* Left side - Address Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h2 className="text-xl font-bold mb-6">Alamat Pengiriman</h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                      <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Nama Lengkap Anda"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                          required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="email@example.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                            required
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="e.g., 08123456789"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                            required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
                      <textarea
                          id="addressLine1"
                          name="addressLine1"
                          value={formData.addressLine1}
                          onChange={handleInputChange}
                          placeholder="Jl. Contoh No. 123, RT 01 RW 02"
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                          required
                      ></textarea>
                    </div>

                    <div>
                      <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-2">Detail Tambahan (Opsional)</label>
                      <input
                          type="text"
                          id="addressLine2"
                          name="addressLine2"
                          value={formData.addressLine2}
                          onChange={handleInputChange}
                          placeholder="Contoh: Blok A, Lantai 5, Dekat Minimarket"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="provinceCode" className="block text-sm font-medium text-gray-700 mb-2">Provinsi</label>
                        <ProvinceSelect
                          value={formData.provinceCode}
                          onChange={handleProvinceChange}
                          disabled={authLoading}
                        />
                      </div>
                      <div>
                        <label htmlFor="regencyCode" className="block text-sm font-medium text-gray-700 mb-2">Kota/Kabupaten</label>
                        <RegencySelect
                          provinceCode={formData.provinceCode}
                          value={formData.regencyCode}
                          onChange={handleRegencyChange}
                          disabled={authLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="districtCode" className="block text-sm font-medium text-gray-700 mb-2">Kecamatan</label>
                        <DistrictSelect
                          regencyCode={formData.regencyCode}
                          value={formData.districtCode}
                          onChange={handleDistrictChange}
                          disabled={authLoading}
                        />
                      </div>
                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">Kode Pos</label>
                        <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            placeholder="e.g., 12345"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                            required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Catatan untuk Pengirim (Opsional)</label>
                      <textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder="Contoh: Titip ke satpam, jangan dipencet bel"
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                      ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary-red hover:bg-red-700 text-white font-bold py-3 rounded-md transition-colors"
                        disabled={authLoading}
                    >
                      Lanjutkan ke Pengiriman
                    </button>
                  </form>
                </div>
              </div>

              {/* Right side - Order Summary */}
              <div className="lg:col-span-1">
                <OrderSummary cartItems={cartItems} shippingCost={shippingCostPlaceholder} />
              </div>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
  )
}