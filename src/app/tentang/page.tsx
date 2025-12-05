"use client"

import { MainLayout } from "@/components/main-layout"
import { RiLeafLine, RiSparkling2Line, RiHeartFill, RiHandHeartLine } from "@remixicon/react"
import Link from "next/link"

export default function TentangKamiPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-red-800 to-gray-900 text-white py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-red-800 to-gray-900 opacity-20"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 animate-fade-in-up">
              Cerita di Balik Kelezatan Zambel
            </h1>
            <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Menyajikan cita rasa sambal asli Indonesia dengan kualitas terbaik dan penuh cinta.
            </p>
          </div>
        </section>

        {/* Our Mission & Vision */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in-left">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Misi Kami</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  Membawa kehangatan dan kelezatan sambal tradisional Indonesia ke setiap meja makan, menghadirkan pengalaman kuliner yang autentik dan tak terlupakan.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Kami berkomitmen untuk menggunakan bahan-bahan segar pilihan dan resep turun-temurun, menjaga kualitas dan keaslian rasa di setiap sajian.
                </p>
              </div>
              <div className="animate-fade-in-right">
                <div className="w-full h-96 bg-gradient-to-r from-red-800 to-gray-900 rounded-lg shadow-xl"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-16 md:mt-24">
              <div className="md:order-2 animate-fade-in-right">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Visi Kami</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  Menjadi merek sambal terkemuka yang dicintai di seluruh Indonesia dan diakui secara internasional, melalui inovasi produk yang berkelanjutan dan dedikasi pada kepuasan pelanggan.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Kami bercita-cita untuk melestarikan warisan kuliner Indonesia sambil menjelajahi pasar global.
                </p>
              </div>
              <div className="md:order-1 animate-fade-in-left">
                <div className="w-full h-96 bg-gradient-to-r from-red-800 to-gray-900 rounded-lg shadow-xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Zambel */}
        <section className="py-16 md:py-24 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 animate-fade-in-up">Mengapa Memilih Zambel?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-fade-in-up animation-delay-200">
                <RiLeafLine className="w-16 h-16 text-green-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Bahan Segar Pilihan</h3>
                <p className="text-gray-700 leading-relaxed">Kami hanya menggunakan cabai, rempah, dan bahan-bahan segar terbaik dari petani lokal, menjamin kualitas dan rasa autentik.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-fade-in-up animation-delay-400">
                <RiSparkling2Line className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Resep Autentik</h3>
                <p className="text-gray-700 leading-relaxed">Setiap jar sambal diracik dengan resep turun-temurun, menghadirkan cita rasa rumahan yang kaya dan pedasnya pas.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 animate-fade-in-up animation-delay-600">
                <RiHandHeartLine className="w-16 h-16 text-red-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Dibuat Penuh Cinta</h3>
                <p className="text-gray-700 leading-relaxed">Dari pemilihan bahan hingga proses pengemasan, setiap langkah dilakukan dengan dedikasi dan cinta untuk Anda.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-red-800 to-gray-900 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Rasakan Bedanya Zambel!</h2>
            <p className="text-xl mb-8">Jelajahi berbagai varian sambal kami dan temukan favorit baru Anda hari ini.</p>
            <Link 
              href="/products" 
              className="bg-white text-primary-red font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            >
              Lihat Produk Kami
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
