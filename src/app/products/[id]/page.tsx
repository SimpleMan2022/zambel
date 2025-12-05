"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MainLayout } from "@/components/main-layout";
import SavedProductModal from "@/components/modals/saved-product-modal";
import ShareProductModal from "@/components/modals/share-product-modal";
import AddToCartSuccessModal from "@/components/modals/add-to-cart-success-modal"; // Import new modal
import { RiStarFill, RiStarHalfFill, RiStarLine, RiShoppingCartLine, RiAddLine, RiSubtractLine } from "@remixicon/react";
import { Heart, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context"; // Import useAuth to get user authentication status

interface Product {
  id: string;
  category_id?: string; // Made optional as it's not always used directly in UI
  name: string;
  slug?: string; // Made optional
  description?: string; // Made optional
  long_description?: string;
  price: number;
  original_price?: number;
  image_url: string;
  gallery_images?: string[];
  sku?: string;
  stock: number;
  rating?: number;
  review_count: number;
  material?: string;
  size?: string;
  weight?: number;
  color?: string; // Added for product specification
  taste?: string; // Added for product specification
  is_active: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  avatarUrl?: string;
  createdAt: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, updateCartItemCount } = useAuth(); 
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false); // New state for wishlist status
  const [showAddToCartSuccessModal, setShowAddToCartSuccessModal] = useState(false); // New state for add to cart success modal

  useEffect(() => {
    if (id) {
      const fetchProductAndReviews = async () => {
        try {
          setLoading(true);
          const [productRes, reviewsRes] = await Promise.all([
            fetch(`/api/products/${id}`),
            fetch(`/api/products/${id}/reviews`),
          ]);

          const productResult = await productRes.json();
          const reviewsResult = await reviewsRes.json();

          console.log("Product API Result:", productResult);
          console.log("Reviews API Result:", reviewsResult);

          if (productResult.success) {
            const fetchedProduct = productResult.data;
            setProduct(fetchedProduct);
            setMainImage(fetchedProduct.image_url);
            if (fetchedProduct.gallery_images && fetchedProduct.gallery_images.length > 0) {
                setSelectedImageIndex(-1);
            } else {
                setSelectedImageIndex(0);
            }
          } else {
            setError(productResult.message);
          }

          if (reviewsResult.success) {
            setReviews(reviewsResult.data);
          } else {
            if (productResult.success) {
              setError(reviewsResult.message);
            }
          }

        } catch (err) {
          console.error("Error fetching product and reviews:", err);
          setError("Failed to load product details or reviews.");
        } finally {
          setLoading(false);
        }
      };

      const checkWishlistStatus = async () => {
        if (!isAuthenticated || !id) return;
        try {
          const response = await fetch('/api/wishlist');
          const result = await response.json();
          if (result.success && result.data) {
            const wishlistedProductIds = result.data.map((item: { id: string }) => item.id);
            setIsWishlisted(wishlistedProductIds.includes(id));
          }
        } catch (err) {
          console.error("Error checking wishlist status:", err);
        }
      };

      fetchProductAndReviews();
      checkWishlistStatus();
    }
  }, [id, isAuthenticated]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
  };

  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    if (type === 'increment') {
      setQuantity(prev => (product && prev < product.stock ? prev + 1 : prev));
    } else {
      setQuantity(prev => (prev > 1 ? prev - 1 : 1));
    }
  };

  const handleImageClick = (imageSrc: string, index: number) => {
    setMainImage(imageSrc);
    setSelectedImageIndex(index);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated || !product?.id) {
      alert("Please log in to add items to your cart.");
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id: product.id, quantity: quantity }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        updateCartItemCount(result.data?.count || (await fetch('/api/cart/count').then(res => res.json()).then(data => data.data.count))); // Update cart count
        setShowAddToCartSuccessModal(true); // Show success modal
      } else {
        alert(result.message || "Failed to add product to cart.");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("An error occurred while adding to cart.");
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated || !product?.id) {
      // Redirect to login or show a message
      alert("Please log in to manage your wishlist.");
      return;
    }

    try {
      let response;
      if (isWishlisted) {
        // Remove from wishlist
        response = await fetch(`/api/wishlist/${product.id}`, {
          method: 'DELETE',
        });
      } else {
        // Add to wishlist
        response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product_id: product.id }),
        });
      }

      const result = await response.json();
      if (result.success) {
        setIsWishlisted(!isWishlisted);
        if (!isWishlisted) {
          setShowSavedModal(true);
        }
      } else {
        alert(result.message || "Failed to update wishlist.");
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
      alert("An error occurred while updating your wishlist.");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton height={30} width={300} className="mb-8" /> {/* Breadcrumb skeleton */}
          <div className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Gallery Skeleton */}
            <div className="space-y-4">
              <Skeleton height={384} className="w-full rounded-lg" /> {/* Main image */}
              <div className="flex gap-2 justify-center flex-wrap">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} width={96} height={96} className="rounded-lg" /> // Thumbnail images
                ))}
              </div>
            </div>

            {/* Product Info Skeleton */}
            <div className="space-y-4">
              <Skeleton height={36} width="80%" /> {/* Product name */}
              <div className="flex items-center gap-2">
                <Skeleton width={100} height={20} /> {/* Rating stars */}
                <Skeleton width={80} height={20} /> {/* Review count */}
              </div>
              <Skeleton height={30} width="40%" /> {/* Price */}
              <Skeleton height={20} width="30%" /> {/* Stock */}

              <div className="space-y-2">
                <Skeleton height={40} width="100%" /> {/* Quantity selector */}
                <Skeleton height={48} width="100%" /> {/* Add to cart button */}
                <Skeleton height={48} width="100%" /> {/* Buy now button */}
                <div className="flex gap-2">
                  <Skeleton height={40} width="50%" /> {/* Save button */}
                  <Skeleton height={40} width="50%" /> {/* Share button */}
                </div>
              </div>
            </div>
          </div>

          {/* Description, Specs, Reviews Skeletons */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md mt-8 space-y-4">
              <Skeleton height={25} width="40%" />
              <Skeleton height={80} />
              <Skeleton height={80} />
            </div>
          ))}
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

  if (!product) {
    return (
      <MainLayout>
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-lg text-gray-700">Product not found.</p>
        </main>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-8">
          <Link href="/products" className="hover:text-primary-red">
            Produk
          </Link>
          {" > "}
          <span className="text-gray-900">{product.name}</span>
        </div>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center h-96">
              <Image
                src={mainImage || "/placeholder.svg"}
                alt={product.name}
                width={400}
                height={400}
                className="object-contain"
              />
            </div>
            <div className="flex gap-2 md:ml-[95px]">
              <button
                onClick={() => handleImageClick(product.image_url, -1)}
                className={`w-24 h-24 rounded-lg overflow-hidden border-2 ${selectedImageIndex === -1 ? "border-primary-red" : "border-gray-200"}`}
              >
                <Image
                  src={product.image_url || "/placeholder.svg"}
                  alt={`${product.name} Main`}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </button>
              {product.gallery_images?.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => handleImageClick(img, idx)}
                  className={`w-24 h-24 rounded-lg overflow-hidden border-2 ${idx === selectedImageIndex ? "border-primary-red" : "border-gray-200"}`}
                >
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`${product.name} ${idx + 1}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => {
                    const starValue = product.rating || 0;
                    return (
                      <span key={i}>
                        {starValue >= i + 1 ? (
                          <RiStarFill className="w-4 h-4 text-yellow-400" />
                        ) : starValue >= i + 0.5 ? (
                          <RiStarHalfFill className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <RiStarLine className="w-4 h-4 text-gray-300" />
                        )}
                      </span>
                    );
                  })}
                </div>
                <span className="text-gray-600 text-sm">({product.review_count} Ulasan)</span>
              </div>
              <p className="text-3xl font-bold text-primary-red">{formatPrice(product.price)}</p>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Stok</p>
                <p className="font-semibold text-gray-900">{product.stock} tersedia</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Jumlah</p>
                <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                  <button
                    onClick={() => handleQuantityChange('decrement')}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-l-lg"
                  >
                    <RiSubtractLine className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="w-12 text-center border-l border-r border-gray-300 py-2 outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange('increment')}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-r-lg"
                  >
                    <RiAddLine className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 border-2 border-primary-red text-primary-red font-semibold py-3 rounded-lg hover:bg-red-50 transition"
                >
                  Tambah ke Keranjang
                </button>
                <button className="flex-1 bg-primary-red text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition">
                  Beli Sekarang
                </button>
              </div>
              <div className="flex gap-4 justify-center pt-2">
                <button
                  onClick={handleToggleWishlist}
                  className={`flex items-center gap-2 font-semibold py-3 px-6 rounded-lg transition ${isWishlisted ? 'text-primary-red border border-primary-red hover:bg-red-50' : 'text-gray-600 border border-gray-300 hover:bg-gray-100'}`}
                >
                  <Heart size={20} className={isWishlisted ? 'fill-primary-red' : ''} />
                  {isWishlisted ? 'Tersimpan' : 'Simpan'}
                </button>
                <button
                  onClick={() => handleShare()}
                  className="flex items-center gap-2 text-gray-600 border border-gray-300 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition"
                >
                  <Share2 size={20} />
                  Bagikan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description Section */}
        {product.description && (
          <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Deskripsi Produk</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        )}
        {product.long_description && (
            <div className="bg-white p-6 rounded-lg shadow-md mt-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Detail Tambahan</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.long_description}</p>
            </div>
        )}

        {/* Product Specifications Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Spesifikasi Produk</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-gray-700">
            <div>
              <p className="text-sm text-gray-600 mb-1">Material</p>
              <p className="font-semibold text-gray-900">{product.material || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Ukuran</p>
              <p className="font-semibold text-gray-900">{product.size || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Warna</p>
              <p className="font-semibold text-gray-900">{product.color || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Rasa</p>
              <p className="font-semibold text-gray-900">{product.taste || '-'}</p>
            </div>
            {product.weight && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Berat</p>
                <p className="font-semibold text-gray-900">{product.weight} gram</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ulasan Pelanggan ({product.review_count})</h2>
          <div className="grid grid-cols-1 gap-6">
            {reviews.length > 0 ? (reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-900">{review.userName}</h3>
                  <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => {
                    const starValue = review.rating || 0;
                    return (
                      <span key={i}>
                        {starValue >= i + 1 ? (
                          <RiStarFill className="w-4 h-4 text-yellow-400" />
                        ) : starValue >= i + 0.5 ? (
                          <RiStarHalfFill className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <RiStarLine className="w-4 h-4 text-gray-300" />
                        )}
                      </span>
                    );
                  })}
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">{review.comment}</p>
              </div>
            ))) : (
              <p className="text-gray-600">Belum ada ulasan untuk produk ini.</p>
            )}
          </div>
        </div>

      </div>
      {showSavedModal && <SavedProductModal onClose={() => setShowSavedModal(false)} />}
      {showShareModal && <ShareProductModal onClose={() => setShowShareModal(false)} />}
      {showAddToCartSuccessModal && product && (
        <AddToCartSuccessModal
          onClose={() => setShowAddToCartSuccessModal(false)}
          productName={product.name}
        />
      )}
    </MainLayout>
  );
}
