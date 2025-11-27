"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import {
  RiFacebookFill,
  RiGoogleFill,
  RiLinkedinBoxFill,
  RiUser3Fill,
  RiLockFill
} from "@remixicon/react"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login:", formData)
  }

  return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl">

            {/* Left Side - Brand */}
            <div className="bg-primary-red text-white p-8 md:p-12 md:w-1/2 flex flex-col justify-center space-y-6">
              <h1 className="text-5xl font-bold">Zambel</h1>
              <p className="text-lg font-semibold opacity-90">Selamat Datang</p>
              <p className="text-base opacity-80 leading-relaxed">
                Kami hadir untuk menghadirkan sambal berkualitas tinggi, dibuat dari bahan pilihan dengan cita rasa autentik Indonesia.
              </p>

              {/* Social Icons */}
              <div className="flex gap-4 pt-4">
                <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
                  <RiLinkedinBoxFill className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
                  <RiFacebookFill className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="bg-white p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
              <h2 className="text-primary-red text-2xl font-bold mb-2">Login</h2>
              <p className="text-gray-600 text-sm mb-8">Masuk ke akun anda</p>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Username */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Username
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3">
                    <RiUser3Fill className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="flex-1 ml-3 outline-none bg-transparent"
                        placeholder="Masukkan username"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3">
                    <RiLockFill className="w-5 h-5 text-gray-400" />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="flex-1 ml-3 outline-none bg-transparent"
                        placeholder="Masukkan password"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-primary-red text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition mt-6"
                >
                  Masuk
                </button>
              </form>

              {/* Register + Social Login */}
              <div className="text-center space-y-2 mt-6">
                <p className="text-gray-600 text-sm">
                  Belum punya akun?{" "}
                  <Link href="/register" className="text-primary-red font-semibold hover:underline">
                    Daftar disini
                  </Link>
                </p>

                <p className="text-gray-600 text-sm">atau login dengan</p>

                <div className="flex justify-center gap-4 pt-3">
                  <a href="#" className="w-8 h-8 text-gray-400 hover:text-gray-600 flex items-center justify-center">
                    <RiFacebookFill className="w-6 h-6" />
                  </a>
                  <a href="#" className="w-8 h-8 text-gray-400 hover:text-gray-600 flex items-center justify-center">
                    <RiGoogleFill className="w-6 h-6" />
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
  )
}
