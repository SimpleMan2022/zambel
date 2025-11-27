"use client"

import Link from "next/link"
import {
  RiFacebookFill,
  RiLinkedinBoxFill,
  RiYoutubeFill
} from "@remixicon/react"

export default function HeroSection() {
  return (
      <section className="bg-primary-red text-white rounded-b-3xl overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">Zambel</h1>
              <p className="text-lg font-semibold opacity-90">Selamat Datang</p>
              <p className="text-base opacity-80 leading-relaxed">
                Kami hadir untuk menghadirkan sambal berkualitas tinggi, dibuat dari bahan pilihan dengan rasa autentik Indonesia.
              </p>

              <Link
                  href="/products"
                  className="inline-block bg-white text-primary-red font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
              >
                Belanja Sekarang
              </Link>

              {/* Social Icons */}
              <div className="flex gap-4 pt-4">
                <a
                    href="#"
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
                >
                  <RiLinkedinBoxFill className="w-5 h-5" />
                </a>

                <a
                    href="#"
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
                >
                  <RiFacebookFill className="w-5 h-5" />
                </a>

                <a
                    href="#"
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
                >
                  <RiYoutubeFill className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex justify-center md:justify-end">
              <div className="relative w-64 h-64 bg-white/10 rounded-2xl overflow-hidden flex items-center justify-center">
                <div className="text-center text-white/50 p-8">
                  <p className="text-lg font-semibold mb-2">Produk Sambel</p>
                  <p className="text-sm">Ukuran: 264x264px</p>
                  <p className="text-sm mt-4">Ganti gambar nanti</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
  )
}
