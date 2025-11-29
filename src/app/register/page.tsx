"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  RiFacebookFill,
  RiLinkedinBoxFill,
  RiUser3Fill,
  RiMailFill,
  RiLockFill,
  RiPhoneFill,
} from "@remixicon/react"
import { useAuth } from "@/contexts/auth-context"
import { authAPI } from "@/lib/api"
import { Alert } from "@/components/Alert"
import { PublicOnlyRoute } from "@/components/public-only-route"

export default function RegisterPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState<{
    show: boolean
    type: "success" | "error"
    message: string
  } | null>(null)

  // Redirect jika sudah login
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAlert(null) // Reset alert

    try {
      const response = await authAPI.register(formData)

      if (response.success && response.data) {
        login(response.data.user)

        // Tampilkan alert sukses
        setAlert({
          show: true,
          type: "success",
          message: `Registrasi berhasil! Selamat datang, ${response.data.user.full_name}`,
        })

        // Redirect setelah 2 detik
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        // Tampilkan alert error
        setAlert({
          show: true,
          type: "error",
          message: response.message || "Terjadi kesalahan saat registrasi",
        })
      }
    } catch (error) {
      // Tampilkan alert error
      setAlert({
        show: true,
        type: "error",
        message:
            error instanceof Error
                ? error.message
                : "Terjadi kesalahan saat registrasi",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Jika sudah login, tampilkan loading
  if (isAuthenticated) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <p>Redirecting... </p>
        </div>
    )
  }

  return (
    <PublicOnlyRoute>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl">
            {/* Left Side - Brand */}
            <div className="bg-primary-red text-white p-8 md:p-12 md:w-1/2 flex flex-col justify-center space-y-6">
              <h1 className="text-5xl font-bold">Zambel</h1>
              <p className="text-lg font-semibold opacity-90">Selamat Datang</p>
              <p className="text-base opacity-80 leading-relaxed">
                Kami hadir untuk menghadirkan sambal berkualitas tinggi, dibuat
                dari bahan pilihan dengan cita rasa autentik Indonesia.
              </p>

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
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="bg-white p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
              <h2 className="text-primary-red text-2xl font-bold mb-2">Daftar</h2>
              <p className="text-gray-600 text-sm mb-8">Daftarkan akun anda</p>

              {/* Alert Banner */}
              {alert?.show && (
                  <Alert
                      type={alert.type}
                      message={alert.message}
                      onClose={() => setAlert(null)}
                  />
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Nama Lengkap
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3">
                    <RiUser3Fill className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="flex-1 ml-3 outline-none bg-transparent"
                        placeholder="Masukkan nama lengkap"
                        required
                        disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3">
                    <RiMailFill className="w-5 h-5 text-gray-400" />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="flex-1 ml-3 outline-none bg-transparent"
                        placeholder="Masukkan email"
                        required
                        disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Nomor Telepon
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3">
                    <RiPhoneFill className="w-5 h-5 text-gray-400" />
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="flex-1 ml-3 outline-none bg-transparent"
                        placeholder="Masukkan nomor telepon"
                        required
                        disabled={isLoading}
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
                        required
                        minLength={6}
                        disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-red text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Memproses..." : "Daftar"}
                </button>
              </form>

              {/* Login Link */}
              <div className="text-center mt-6">
                <p className="text-gray-600 text-sm">
                  Sudah punya akun?{" "}
                  <Link
                      href="/login"
                      className="text-primary-red font-semibold hover:underline"
                  >
                    Masuk
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicOnlyRoute>
  )
}