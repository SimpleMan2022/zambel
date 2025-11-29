"use client"

import Image from "next/image";

export default function WhyChooseZambelSection() {
  const reasons = [
    {
      id: 1,
      title: "Bahan Segar Pilihan",
      description: "Dibuat dari cabai dan rempah lokal berkualitas tinggi tanpa bahan pengawet buatan, menjaga rasa alami setiap varian.",
      image: "/images/vectors/ilustrasi-1.png", // Placeholder image
    },
    {
      id: 2,
      title: "Rasa Pedas Seimbang",
      description: "Setiap varian Zambel diracik dengan komposisi pas antara cabai, bumbu, dan minyak, menciptakan sensasi pedas yang nikmat tanpa berlebihan.",
      image: "/images/vectors/ilustrasi-2.png", // Placeholder image
    },
    {
      id: 3,
      title: "Tanpa Pengawet & Pewarna Buatan",
      description: "Zambel mengutamakan bahan alami agar aman dikonsumsi setiap hari.",
      image: "/images/vectors/ilustrasi-3.png", // Placeholder image
    },
    {
      id: 4,
      title: "Dibuat Secara Higienis dan Konsisten",
      description: "Diproduksi dengan standar kebersihan tinggi dan proses yang terkontrol, memastikan setiap toples Zambel memiliki kualitas dan rasa yang sama nikmatnya.",
      image: "/images/vectors/ilustrasi-4.png", // Placeholder image
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Kenapa Memilih <span className="text-primary-red">Zambel</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {reasons.map((reason) => (
          <div
            key={reason.id}
            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
          >
            <div className="relative w-24 h-24 mb-6">
              <Image src={reason.image} alt={reason.title} layout="fill" objectFit="contain" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-3">{reason.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{reason.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
