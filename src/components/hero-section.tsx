"use client"

import Link from "next/link"
import {
  RiFacebookFill,
  RiLinkedinBoxFill,
  RiYoutubeFill
} from "@remixicon/react"
import Image from "next/image"; // Import Image component

export default function HeroSection() {
  return (
      <section className="bg-primary-red text-white rounded-b-3xl overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight animate-fade-in-left">Zambel</h1>
              <p className="text-lg font-semibold opacity-90 animate-fade-in-left animation-delay-200">Selamat Datang</p>
              <p className="text-base opacity-80 leading-relaxed animate-fade-in-left animation-delay-400">
                Kami hadir untuk menghadirkan sambal berkualitas tinggi, dibuat dari bahan pilihan dengan rasa autentik Indonesia.
              </p>

              <Link
                  href="/products"
                  className="inline-block bg-white text-primary-red font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition animate-fade-in-left animation-delay-600"
              >
                Belanja Sekarang
              </Link>

              {/* Social Icons */}
              <div className="flex gap-4 pt-4 animate-fade-in-left animation-delay-800">
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
            <div className="flex justify-center md:justify-end animate-fade-in-right animation-delay-1000">
              <div className="relative w-full max-w-sm h-auto">
                <Image 
                  src="/images/all-sambal.png" 
                  alt="All Sambal Products"
                  width={500} // Increased width for better display
                  height={500} // Increased height for better display
                  priority={true} // Load eagerly as it's a hero image
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>

          </div>
        </div>
      </section>
  )
}
