"use client"

import { RiStarFill, RiUser3Fill } from "@remixicon/react"

const reviews = [
  {
    id: 1,
    name: "Pelanggan Setia",
    rating: 5,
    text: "Sambel Zambel terbaik! Kualitas premium dengan harga yang terjangkau. Sangat merekomendasikan untuk dibeli dan dicoba.",
  },
  {
    id: 2,
    name: "Penggemar Sambel",
    rating: 5,
    text: "Rasa yang konsisten dan lezat setiap kalinya. Kemasan rapi dan pengiriman cepat. Top notch!",
  },
  {
    id: 3,
    name: "Pembeli Berulang",
    rating: 5,
    text: "Sudah berkali-kali membeli dan selalu puas. Bahan alami, tidak berasa pengawet. Recommended!",
  },
  {
    id: 4,
    name: "Ibu Rumah Tangga",
    rating: 5,
    text: "Anak-anak suka banget dengan sambel ini. Pedasnya pas dan tidak terlalu tajam. Cocok untuk keluarga.",
  },
  {
    id: 5,
    name: "Perantau",
    rating: 5,
    text: "Mengingatkan saya pada sambel buatan ibu. Rasa authentik dan bikin kangen rumah!",
  },
  {
    id: 6,
    name: "Food Blogger",
    rating: 5,
    text: "Sambel dengan cita rasa yang unik. Bumbu terasa fresh dan balance. Worth every penny!",
  },
  {
    id: 7,
    name: "Karyawan Kantoran",
    rating: 5,
    text: "Perfect untuk teman makan siang di kantor. Praktis dan rasanya bikin nagih terus!",
  },
  {
    id: 8,
    name: "Mahasiswa",
    rating: 5,
    text: "Harga affordable untuk mahasiswa tapi rasa seperti sambel premium. The best!",
  },
]

// Duplicate reviews untuk infinite scroll effect yang lebih smooth
const duplicatedReviews = [...reviews, ...reviews, ...reviews, ...reviews]

export default function ReviewsSection() {
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
                    {[...Array(review.rating)].map((_, i) => (
                        <RiStarFill key={i} className="w-5 h-5 text-yellow-400"/>
                    ))}
                  </div>

                  <p className="text-gray-700 mb-6 leading-relaxed line-clamp-3">
                    {review.text}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <RiUser3Fill className="w-6 h-6 text-white"/>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {review.name}
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
                    {[...Array(review.rating)].map((_, i) => (
                        <RiStarFill key={i} className="w-5 h-5 text-yellow-400"/>
                    ))}
                  </div>

                  <p className="text-gray-700 mb-6 leading-relaxed line-clamp-3">
                    {review.text}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <RiUser3Fill className="w-6 h-6 text-white"/>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {review.name}
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