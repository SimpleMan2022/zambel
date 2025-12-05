"use client"

import {RiFacebookFill, RiInstagramFill, RiMailFill, RiMapPin2Fill, RiPhoneFill} from "@remixicon/react";

export function FooterSection() {
  return (
      <footer className="bg-primary-red text-white rounded-t-3xl mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Hubungi Kami</h3>

              <form className="space-y-4">
                <div>
                  <input
                      type="text"
                      placeholder="Nama"
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white transition"
                  />
                </div>
                <div>
                  <input
                      type="email"
                      placeholder="Email"
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white transition"
                  />
                </div>
                <div>
                <textarea
                    placeholder="Pesan"
                    rows={4}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white transition resize-none"
                ></textarea>
                </div>
                <button
                    type="submit"
                    className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition"
                >
                  Kirim
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-6">Informasi Kontak</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <RiMapPin2Fill className="w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Alamat</h4>
                    <p className="text-white/80">Jl. Raya Jakarta, No. 123 Bandung, Indonesia 40123</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <RiPhoneFill className="w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Telepon</h4>
                    <p className="text-white/80">+62 812-3456-7890</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <RiMailFill className="w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-white/80">info@zambel.com</p>
                  </div>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex gap-4 pt-6">
                <a
                    href="#"
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
                >
                  <RiFacebookFill size={20} />
                </a>
                <a
                    href="#"
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
                >
                  <RiInstagramFill size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/20 mt-12 pt-8 text-center text-white/70">
            <p>&copy; 2025 Sambel Zambel. All rights reserved.</p>
          </div>
        </div>
      </footer>
  )
}

export default FooterSection
