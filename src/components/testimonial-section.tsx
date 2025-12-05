"use client"

interface Testimonial {
  id: string;
  name: string;
  comment: string;
  avatar_url?: string;
  role?: string;
}

interface TestimonialSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialSection({ testimonials }: TestimonialSectionProps) {
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
                      src={testimonial.avatar_url || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover mb-4"
                  />
                  <h3 className="font-semibold text-gray-900 mb-1">{testimonial.name}</h3>
                  <p className="text-sm text-primary-red font-medium mb-3">{testimonial.role}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{testimonial.comment}</p>
                </div>
              </div>
          ))}
        </div>
      </section>
  )
}
