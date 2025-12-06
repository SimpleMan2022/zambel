"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { RiMailLine, RiPhoneLine, RiMapPinLine, RiSendPlaneLine, RiLoader4Line, RiCheckLine, RiErrorWarningLine, RiFacebookCircleFill, RiInstagramFill, RiTwitterFill } from "@remixicon/react"
import Link from "next/link"
import Image from "next/image"

export default function KontakPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
  const [responseMessage, setResponseMessage] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)
    setResponseMessage(null)

    try {
      // This is a placeholder for your actual contact form API endpoint
      // You would typically send this data to your backend API
      // For now, it will just simulate a success/error response
      const response = await new Promise<any>((resolve) => {
        setTimeout(() => {
          if (formData.name && formData.email && formData.subject && formData.message) {
            resolve({ success: true, message: "Pesan Anda berhasil terkirim!" })
          } else {
            resolve({ success: false, message: "Mohon lengkapi semua kolom." })
          }
        }, 1500)
      })

      if (response.success) {
        setSubmitStatus('success')
        setResponseMessage(response.message)
        setFormData({ name: "", email: "", subject: "", message: "" })
      } else {
        setSubmitStatus('error')
        setResponseMessage(response.message)
      }
    } catch (err) {
      console.error("Error submitting contact form:", err)
      setSubmitStatus('error')
      setResponseMessage("Terjadi kesalahan saat mengirim pesan.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-red-800 to-gray-900 text-white py-20 md:py-32 overflow-hidden text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 animate-fade-in-up">
              Hubungi Kami
            </h1>
            <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Kami siap membantu Anda. Jangan ragu untuk menghubungi kami melalui formulir atau informasi kontak di bawah.
            </p>
          </div>
        </section>

        {/* Contact Details & Form */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="animate-fade-in-left">
                <h2 className="text-4xl font-bold text-gray-900 mb-8">Informasi Kontak</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <RiMailLine className="w-8 h-8 text-primary-red" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-700">info@zambel.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <RiPhoneLine className="w-8 h-8 text-primary-red" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Telepon</h3>
                      <p className="text-gray-700">+62 812-3456-7890</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <RiMapPinLine className="w-8 h-8 text-primary-red flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Alamat</h3>
                      <p className="text-gray-700">Jl. Zambel Raya No. 10, Jakarta Selatan, Indonesia</p>
                    </div>
                  </div>
                </div>

                {/* Social Media (Optional) */}
                <div className="mt-12">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Ikuti Kami</h3>
                  <div className="flex gap-4">
                    <Link href="#" className="text-gray-700 hover:text-primary-red transition">
                      <RiFacebookCircleFill className="w-8 h-8" />
                    </Link>
                    <Link href="#" className="text-gray-700 hover:text-primary-red transition">
                      <RiInstagramFill className="w-8 h-8" />
                    </Link>
                    <Link href="#" className="text-gray-700 hover:text-primary-red transition">
                      <RiTwitterFill className="w-8 h-8" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="animate-fade-in-right bg-gray-50 p-8 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-4xl font-bold text-gray-900 mb-8">Kirim Pesan</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nama Anda</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Anda</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subjek</label>
                    <input 
                      type="text" 
                      id="subject" 
                      name="subject" 
                      value={formData.subject} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Pesan Anda</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      value={formData.message} 
                      onChange={handleInputChange} 
                      rows={5} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                      required
                    ></textarea>
                  </div>
                  
                  {submitStatus && responseMessage && (
                    <div 
                      className={`p-4 rounded-md flex items-center gap-3 
                        ${submitStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      role="alert"
                    >
                      {submitStatus === 'success' ? 
                        <RiCheckLine className="w-5 h-5" /> : 
                        <RiErrorWarningLine className="w-5 h-5" />
                      }
                      <p className="text-sm font-medium">{responseMessage}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-primary-red hover:bg-red-700 text-white font-bold py-3 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <RiLoader4Line className="animate-spin w-5 h-5" />
                    ) : (
                      <RiSendPlaneLine className="w-5 h-5" />
                    )}
                    {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Google Map (Optional - Placeholder) */}
        <section className="py-16 md:py-24 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Lokasi Kami</h2>
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden shadow-xl">
              {/* Placeholder for Google Maps iframe or component */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2815.521811171597!2d98.51212576610354!3d3.6445948588426234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30312a473a03136b%3A0x83d69fa76beffd98!2sGg.%20Abadi%20I%2C%20Jati%20Karya%2C%20Kec.%20Binjai%20Utara%2C%20Kota%20Binjai%2C%20Sumatera%20Utara%2020374!5e0!3m2!1sid!2sid!4v1765003997903!5m2!1sid!2sid"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
