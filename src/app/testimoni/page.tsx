"use client"

import { MainLayout } from "@/components/main-layout"
import Image from "next/image"
import { RiStarFill, RiDoubleQuotesL, RiDoubleQuotesR, RiUserSmileLine, RiLoader2Line, RiErrorWarningLine } from "@remixicon/react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"

interface Testimonial {
  id: string
  name: string
  role: string
  avatar_url: string
  comment: string
  rating: number
}

export default function TestimoniPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTestimonials = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/testimonials")
      if (!response.ok) {
        throw new Error("Failed to fetch testimonials")
      }
      const result = await response.json()
      if (result.success) {
        setTestimonials(result.data)
      } else {
        setError(result.message || "Failed to fetch testimonials")
      }
    } catch (err) {
      console.error("Error fetching testimonials:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <RiStarFill
          key={i}
          className={`w-5 h-5 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
        />
      )
    }
    return <div className="flex">{stars}</div>
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <RiLoader2Line className="animate-spin h-10 w-10 text-gray-500" />
          <span className="ml-3 text-gray-700">Memuat Testimoni...</span>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center p-4">
          <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200">
            <RiErrorWarningLine className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Maaf, Terjadi Masalah</h1>
            <p className="text-gray-700 text-lg mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-primary-red text-white font-semibold py-2 px-5 rounded-md hover:bg-red-700 transition">
              Coba Lagi
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (testimonials.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center p-4">
          <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200">
            <RiUserSmileLine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Belum Ada Testimoni</h1>
            <p className="text-gray-700 text-lg mb-6">Jadilah yang pertama memberikan testimoni untuk Zambel!</p>
            <Link href="/kontak" className="bg-primary-red text-white font-semibold py-2 px-5 rounded-md hover:bg-red-700 transition">
              Berikan Testimoni Anda
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-red-800 to-gray-900 text-white py-20 md:py-32 overflow-hidden text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 animate-fade-in-up">
              Apa Kata Mereka Tentang Zambel?
            </h1>
            <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Dengarkan langsung pengalaman pelanggan setia kami yang telah merasakan kelezatan dan kualitas produk Zambel.
            </p>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="bg-gray-50 p-8 rounded-lg shadow-md border border-gray-200 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300 relative"
                >
                  <RiDoubleQuotesL className="w-12 h-12 text-gray-300 absolute top-4 left-4 opacity-50" />
                  <RiDoubleQuotesR className="w-12 h-12 text-gray-300 absolute bottom-4 right-4 opacity-50" />
                  
                  <div className="relative w-24 h-24 rounded-full overflow-hidden mb-6 border-4 border-primary-red shadow-lg">
                    <Image 
                      src={testimonial.avatar_url || "/images/placeholder-avatar.png"} 
                      alt={testimonial.name}
                      fill 
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  
                  <div className="mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  
                  <p className="text-gray-800 text-lg italic mb-6 relative z-10 leading-relaxed">
                    "{testimonial.comment}"
                  </p>
                  
                  <div className="mt-auto">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{testimonial.name}</h3>
                    <p className="text-primary-red text-md">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-red-800 to-gray-900 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Bagikan Pengalaman Anda!</h2>
            <p className="text-xl mb-8">Apakah Anda menyukai produk Zambel? Berikan testimoni Anda dan bantu kami menyebarkan kelezatan.</p>
            <Link 
              href="/kontak" 
              className="bg-white text-primary-red font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            >
              Tulis Testimoni
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
