import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import ProductsSection from "@/components/products-section"
import TestimonialSection from "@/components/testimonial-section"
import ReviewsSection from "@/components/reviews-section"
import FooterSection from "@/components/footer-section"

export default function Home() {
  return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <HeroSection />
        <ProductsSection />
        <TestimonialSection />
        <ReviewsSection />
        <FooterSection />
      </main>
  )
}
