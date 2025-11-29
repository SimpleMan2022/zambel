"use client"

import Link from "next/link"
import ProductCard from "@/components/product-card"

interface Product {
  id: string;
  name: string;
  image_url: string;
  price: number;
  rating?: number;
  review_count?: number;
  description?: string;
}

interface ProductsSectionProps {
  title: string;
  products: Product[];
  onAddToCartSuccess?: (productName: string) => void; // Add this prop
}

export default function ProductsSection({ title, products, onAddToCartSuccess }: ProductsSectionProps) {
  const renderTitle = () => {
    if (title === "Produk Kami") {
      return (
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Produk <span className="text-primary-red">Kami</span>
        </h2>
      );
    }
    return <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>;
  };

  return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          {renderTitle()}
          <p className="text-gray-600">Temukan kelezatan sambal khas Indonesia dalam jar praktis yang dibuat dengan bahan segar pilihan dan diracik dengan penuh cinta.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCartSuccess={onAddToCartSuccess} />
          ))}
        </div>

        <div className="text-center">
          <Link
              href="/products"
              className="inline-block bg-primary-red text-white font-semibold px-8 py-3 rounded-lg hover:bg-red-700 transition"
          >
            Lihat Semua Produk
          </Link>
        </div>
      </section>
  )
}
