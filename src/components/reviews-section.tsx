"use client"

import {
  RiStarFill,
  RiUser3Fill,
  RiStarHalfFill,
  RiStarLine
} from "@remixicon/react"
import Image from "next/image";

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

interface ReviewsSectionProps {
  reviews: Review[];
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {

  // Duplicate reviews untuk infinite scroll effect yang lebih smooth
  const duplicatedReviews = [...reviews, ...reviews, ...reviews, ...reviews];

  return (
      <section className="bg-gray-50 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Apa Kata <span className="text-red-600">Pembeli Kami</span>
            </h2>
            <p className="text-gray-600">
              Kepuasan pelanggan adalah prioritas utama kami
            </p>
          </div>
        </div>

        {/* First row - moving left */}
        <div className="relative mb-8">
          <div className="flex gap-6 animate-scroll-left">
            {duplicatedReviews.map((review, index) => (
                <div
                    key={`row1-${index}`}
                    className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition flex-shrink-0 w-80"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => {
                      const starValue = review.rating || 0;
                      return (
                        <span key={i}>
                          {starValue >= i + 1 ? (
                            <RiStarFill className="w-5 h-5 text-yellow-400"/>
                          ) : starValue >= i + 0.5 ? (
                            <RiStarHalfFill className="w-5 h-5 text-yellow-400"/>
                          ) : (
                            <RiStarLine className="w-5 h-5 text-gray-300"/>
                          )}
                        </span>
                      );
                    })}
                  </div>

                  <p className="text-gray-700 mb-6 leading-relaxed line-clamp-3">
                    {review.comment}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                      {review.avatarUrl ? (
                          <Image src={review.avatarUrl} alt={review.userName} layout="fill" objectFit="cover" />
                      ) : (
                          <RiUser3Fill className="w-6 h-6 text-white"/>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {review.userName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Pembeli Terverifikasi
                      </p>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Second row - moving right */}
        <div className="relative">
          <div className="flex gap-6 animate-scroll-right">
            {duplicatedReviews.map((review, index) => (
                <div
                    key={`row2-${index}`}
                    className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition flex-shrink-0 w-80"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => {
                      const starValue = review.rating || 0;
                      return (
                        <span key={i}>
                          {starValue >= i + 1 ? (
                            <RiStarFill key={i} className="w-5 h-5 text-yellow-400"/>
                          ) : starValue >= i + 0.5 ? (
                            <RiStarHalfFill key={i} className="w-5 h-5 text-yellow-400"/>
                          ) : (
                            <RiStarLine key={i} className="w-5 h-5 text-gray-300"/>
                          )}
                        </span>
                      );
                    })}
                  </div>

                  <p className="text-gray-700 mb-6 leading-relaxed line-clamp-3">
                    {review.comment}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                      {review.avatarUrl ? (
                          <Image src={review.avatarUrl} alt={review.userName} layout="fill" objectFit="cover" />
                      ) : (
                          <RiUser3Fill className="w-6 h-6 text-white"/>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {review.userName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Pembeli Terverifikasi
                      </p>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>

        <style jsx>{`
            @keyframes scroll-left {
                0% {
                    transform: translateX(0);
                }
                100% {
                    transform: translateX(-25%);
                }
            }

            @keyframes scroll-right {
                0% {
                    transform: translateX(-25%);
                }
                100% {
                    transform: translateX(0);
                }
            }

            .animate-scroll-left {
                animation: scroll-left 25s linear infinite;
            }

            .animate-scroll-right {
                animation: scroll-right 25s linear infinite;
            }

            .animate-scroll-left:hover,
            .animate-scroll-right:hover {
                animation-play-state: paused;
            }

            .line-clamp-3 {
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
        `}</style>
      </section>
  )
}