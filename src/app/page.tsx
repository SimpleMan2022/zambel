"use client"

import { MainLayout } from "@/components/main-layout";
import HeroSection from "@/components/hero-section"
import ProductsSection from "@/components/products-section"
import ReviewsSection from "@/components/reviews-section"
import WhyChooseZambelSection from "@/components/why-choose-zambel-section"
import AddToCartSuccessModal from "@/components/modals/add-to-cart-success-modal"; // Import AddToCartSuccessModal
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"; // Import useAuth

// Define types for your data (adjust based on your actual API response)
interface Product {
  id: string;
  name: string;
  image_url: string;
  price: number;
  // Add other product fields as needed
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  // Add other category fields as needed
}

interface Testimonial {
  id: string;
  name: string;
  comment: string;
  avatar_url?: string;
  role?: string;
  // Add other testimonial fields as needed
}

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  userName: string;
  avatarUrl?: string;
  productName: string;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // No need for useCartAnimation and related logic anymore
  const { updateCartItemCount } = useAuth(); // Only keep necessary auth context values
  const [showAddToCartSuccessModal, setShowAddToCartSuccessModal] = useState(false); // State for modal visibility
  const [productNameForModal, setProductNameForModal] = useState(""); // State for product name in modal

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featuredRes, newArrivalsRes, categoriesRes, reviewsRes] = await Promise.all([
          fetch("/api/products/featured"),
          fetch("/api/products/new_arrivals"),
          fetch("/api/categories"),
          fetch("/api/reviews"),
        ]);

        const featuredData = await featuredRes.json();
        const newArrivalsData = await newArrivalsRes.json();
        const categoriesData = await categoriesRes.json();
        const reviewsData = await reviewsRes.json();

        if (featuredData.success) {
          setFeaturedProducts(featuredData.data);
        } else {
          setError(featuredData.message);
        }

        if (newArrivalsData.success) {
          setNewArrivals(newArrivalsData.data);
        } else {
          setError(newArrivalsData.message);
        }

        if (categoriesData.success) {
          setCategories(categoriesData.data);
        } else {
          setError(categoriesData.message);
        }

        if (reviewsData.success) {
          setReviews(reviewsData.data);
        } else {
          setError(reviewsData.message);
        }

      } catch (err) {
        console.error("Failed to fetch homepage data:", err);
        setError("Failed to load homepage content.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero Section Skeleton */}
          <Skeleton height={300} className="w-full mb-8" />

          {/* Categories Section Skeleton */}
          <div className="text-center mb-12"><Skeleton width={200} height={30} className="mx-auto mb-4" /></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton width={96} height={96} rounded className="mb-4" />
                <Skeleton width={80} height={20} />
              </div>
            ))}
          </div>

          {/* Products Section Skeleton (Featured) */}
          <div className="text-center mb-12"><Skeleton width={250} height={30} className="mx-auto mb-4" /></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <Skeleton height={192} className="w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton height={20} width="80%" />
                  <Skeleton height={15} width="60%" />
                  <Skeleton height={20} width="40%" />
                </div>
              </div>
            ))}
          </div>

          {/* Why Choose Zambel Section Skeleton */}
          <div className="text-center mb-12"><Skeleton width={250} height={30} className="mx-auto mb-4" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm flex flex-col items-center text-center space-y-4">
                <Skeleton width={96} height={96} rounded />
                <Skeleton width={120} height={20} />
                <Skeleton height={60} width="90%" />
              </div>
            ))}
          </div>

          {/* Reviews Section Skeleton */}
          <div className="text-center mb-12"><Skeleton width={250} height={30} className="mx-auto mb-4" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                <Skeleton height={20} width="50%" />
                <Skeleton height={15} width="30%" />
                <Skeleton height={60} width="100%" />
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-lg text-red-500">Error: {error}</p>
        </main>
      </MainLayout>
    );
  }

  return (
      <MainLayout>
        <HeroSection />
        <ProductsSection 
          title="Produk Kami" 
          products={featuredProducts} 
          onAddToCartSuccess={(productName) => {
            setProductNameForModal(productName);
            setShowAddToCartSuccessModal(true);
          }}
        />
        <WhyChooseZambelSection />
        <ReviewsSection reviews={reviews} />

        {showAddToCartSuccessModal && (
          <AddToCartSuccessModal
            onClose={() => setShowAddToCartSuccessModal(false)}
            productName={productNameForModal}
          />
        )}
      </MainLayout>
  )
}
