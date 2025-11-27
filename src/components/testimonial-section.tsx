"use client"

const testimonials = [
  {
    id: 1,
    name: "Ibu Siti Nurhaliza",
    role: "Chef Profesional",
    image: "/placeholder.svg?height=80&width=80",
    text: "Sambel Zambel membuat masakan saya lebih nikmat dan autentik. Bahan berkualitas terasa jelas!",
  },
  {
    id: 2,
    name: "Bapak Gunawan",
    role: "Pemilik Warung Makan",
    image: "/placeholder.svg?height=80&width=80",
    text: "Pelanggan saya sangat puas dengan rasa. Penjualan meningkat sejak pakai Sambel Zambel.",
  },
  {
    id: 3,
    name: "Nyonya Dewi",
    role: "Ibu Rumah Tangga",
    image: "/placeholder.svg?height=80&width=80",
    text: "Praktis, enak, dan tahan lama. Rekomendasi saya untuk keluarga Indonesia manapun!",
  },
  {
    id: 4,
    name: "Pak Hari",
    role: "Pengusaha Kuliner",
    image: "/placeholder.svg?height=80&width=80",
    text: "Kualitas konsisten dan harga bersaing. Supplier terpercaya untuk bisnis saya.",
  },
]

export default function TestimonialSection() {
  return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Kenapa Memilih <span className="text-primary-red">Zambel</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="flex flex-col items-center text-center">
                  <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover mb-4"
                  />
                  <h3 className="font-semibold text-gray-900 mb-1">{testimonial.name}</h3>
                  <p className="text-sm text-primary-red font-medium mb-3">{testimonial.role}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{testimonial.text}</p>
                </div>
              </div>
          ))}
        </div>
      </section>
  )
}
