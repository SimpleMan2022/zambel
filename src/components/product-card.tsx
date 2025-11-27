"use client"
import {
  RiShoppingCartFill,
  RiStarFill,
  RiStarLine
} from "@remixicon/react"

interface ProductCardProps {
  id: number
  name: string
  price: string
  image: string
  rating: number
  reviews: number
}

export default function ProductCard({ id, name, price, image, rating, reviews }: ProductCardProps) {
  return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">

        {/* Product Image */}
        <div className="relative bg-gray-100 h-48 w-full overflow-hidden">
          <img
              src={image || "/placeholder.svg"}
              alt={name}
              className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">{name}</h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                  <span key={i}>
                {i < Math.floor(rating) ? (
                    <RiStarFill className="w-4 h-4 text-yellow-400" />
                ) : (
                    <RiStarLine className="w-4 h-4 text-gray-300" />
                )}
              </span>
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-1">({reviews})</span>
          </div>

          {/* Price & Button */}
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-900">{price}</span>
            <button className="bg-primary-red text-white p-2 rounded-lg hover:bg-red-700 transition">
              <RiShoppingCartFill className="w-[18px] h-[18px]" />
            </button>
          </div>

        </div>
      </div>
  )
}
