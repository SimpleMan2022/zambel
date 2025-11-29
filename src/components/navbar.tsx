"use client"

import Link from "next/link"
import { RiLogoutBoxRLine, RiShoppingCartLine, RiUserFill } from "@remixicon/react"
import { useAuth } from "@/contexts/auth-context"
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image'; // Import Image component

export function Navbar() {
  const { isAuthenticated, user, logout, isLoading, cartItemCount } = useAuth();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false); // New state for scroll detection

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false);
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      const scrollThreshold = 50; // Pixels to scroll before changing navbar style
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll); // Add scroll listener

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll); // Clean up scroll listener
    };
  }, []);

  return (
      <nav className={`fixed w-full z-50 transition-all duration-300 
        ${isScrolled ? 'bg-primary-red shadow-md' : 'bg-white border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              {isScrolled ? (
                <Image 
                  src="/images/logo-putih.png" 
                  alt="Zambel Logo Putih" 
                  width={80} // Set width to 80
                  height={20} // Set height to 20
                  className="h-auto"
                />
              ) : (
                <Image 
                  src="/images/logo-merah.png" 
                  alt="Zambel Logo Merah" 
                  width={80} // Set width to 80
                  height={20} // Set height to 20
                  className="h-auto"
                />
              )}
              <span className={`font-bold text-lg ${isScrolled ? 'text-white' : 'text-gray-900'}`}>Zambel</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link 
                href="/" 
                className={`transition 
                  ${isScrolled ? 'text-white hover:text-gray-200' : 'text-gray-700 hover:text-primary-red'}
                  ${pathname === '/' ? (isScrolled ? 'text-white font-semibold' : 'text-primary-red font-semibold') : ''}
                `}>
                Beranda
              </Link>
              <Link 
                href="/products" 
                className={`transition 
                  ${isScrolled ? 'text-white hover:text-gray-200' : 'text-gray-700 hover:text-primary-red'}
                  ${
                    pathname === '/products' || pathname.startsWith('/products/') 
                      ? (isScrolled ? 'text-white font-semibold' : 'text-primary-red font-semibold') 
                      : ''
                  }`}
              >
                Produk
              </Link>
              <Link 
                href="/tentang" 
                className={`transition 
                  ${isScrolled ? 'text-white hover:text-gray-200' : 'text-gray-700 hover:text-primary-red'}
                  ${pathname === '/tentang' ? (isScrolled ? 'text-white font-semibold' : 'text-primary-red font-semibold') : ''}
                `}>
                Tentang Kami
              </Link>
              <Link 
                href="/testimoni" 
                className={`transition 
                  ${isScrolled ? 'text-white hover:text-gray-200' : 'text-gray-700 hover:text-primary-red'}
                  ${pathname === '/testimoni' ? (isScrolled ? 'text-white font-semibold' : 'text-primary-red font-semibold') : ''}
                `}>
                Testimoni
              </Link>
              <Link 
                href="/kontak" 
                className={`transition 
                  ${isScrolled ? 'text-white hover:text-gray-200' : 'text-gray-700 hover:text-primary-red'}
                  ${pathname === '/kontak' ? (isScrolled ? 'text-white font-semibold' : 'text-primary-red font-semibold') : ''}
                `}>
                Kontak
              </Link>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-4">

              {/* Cart */}
              <Link href="/cart" className={`p-2 rounded-full transition relative 
                ${isScrolled ? 'hover:bg-red-700' : 'hover:bg-gray-100'}`}>
                <RiShoppingCartLine className={`w-5 h-5 ${isScrolled ? 'text-white' : 'text-gray-700'}`} />
                {isAuthenticated && cartItemCount > 0 && (
                  <span className="absolute top-1 right-[-8px] w-5 h-5 bg-white text-primary-red text-xs rounded-full flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* Auth/Guest actions */}
              {isLoading ? (
                  <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-full"></div>
              ) : isAuthenticated ? (
                  <div className="relative" ref={dropdownRef}>
                    <button onClick={toggleDropdown} className={`flex items-center gap-2 p-2 rounded-full transition 
                      ${isScrolled ? 'hover:bg-red-700' : 'hover:bg-gray-100'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold 
                        ${isScrolled ? 'bg-red-700 text-white' : 'bg-gray-200 text-gray-700'}`}>
                        {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <RiUserFill className={`w-5 h-5 ${isScrolled ? 'text-white' : 'text-gray-700'}`} />}
                      </div>
                      <span className={`text-sm hidden md:block ${isScrolled ? 'text-white' : 'text-gray-700'}`}>{user?.full_name}</span>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                        <Link 
                          href="/profile" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Profil Saya
                        </Link>
                        <Link 
                          href="/wishlist" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Wishlist
                        </Link>
                        <Link 
                          href="/my-orders" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Pesanan Saya
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <RiLogoutBoxRLine className="w-4 h-4 inline-block mr-2" /> Logout
                        </button>
                      </div>
                    )}
                  </div>
              ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/login" className="text-gray-700 hover:text-primary-red transition text-sm font-medium">
                      Login
                    </Link>
                    <Link
                        href="/register"
                        className="bg-primary-red text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition"
                    >
                      Register
                    </Link>
                  </div>
              )}

            </div>

          </div>
        </div>
      </nav>
  )
}

export default Navbar