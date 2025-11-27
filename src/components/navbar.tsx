"use client"

import Link from "next/link"
import {
  RiLogoutBoxRLine,
   RiShoppingCartLine, RiShoppingCart2Fill, RiShoppingCart2Line
} from "@remixicon/react"

export function Navbar() {
  return (
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-red rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="font-bold text-lg text-gray-900">Zambel</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-primary-red transition">
                Beranda
              </Link>
              <Link href="/produk" className="text-gray-700 hover:text-primary-red transition">
                Produk
              </Link>
              <Link href="/tentang" className="text-gray-700 hover:text-primary-red transition">
                Tentang Kami
              </Link>
              <Link href="/testimoni" className="text-gray-700 hover:text-primary-red transition">
                Testimoni
              </Link>
              <Link href="/kontak" className="text-gray-700 hover:text-primary-red transition">
                Kontak
              </Link>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-4">

              {/* Cart */}
              <button className="p-2 hover:bg-gray-100 rounded-full transition relative">
                <RiShoppingCartLine className="w-5 h-5 text-gray-700" />
                <span className="absolute top-1 right-[-8px] w-5 h-5 bg-primary-red text-white text-xs rounded-full flex items-center justify-center">
                0
              </span>
              </button>

              {/* Logout */}
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <RiLogoutBoxRLine className="w-5 h-5 text-gray-700" />
              </button>

            </div>

          </div>
        </div>
      </nav>
  )
}

export default Navbar