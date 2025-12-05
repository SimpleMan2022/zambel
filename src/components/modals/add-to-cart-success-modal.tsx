import React, { useEffect } from 'react';
import { RiCheckFill } from '@remixicon/react';

interface AddToCartSuccessModalProps {
  onClose: () => void;
  productName: string;
}

export default function AddToCartSuccessModal({ onClose, productName }: AddToCartSuccessModalProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Modal disappears after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center transform transition-all duration-300 scale-100 opacity-100">
        <RiCheckFill className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Berhasil Ditambahkan!</h2>
        <p className="text-gray-700 text-lg">'{productName}' telah ditambahkan ke keranjang Anda.</p>
        <button
          onClick={onClose}
          className="mt-6 bg-primary-red text-white font-semibold py-2 px-5 rounded-lg hover:bg-red-700 transition"
        >
          Lanjutkan Belanja
        </button>
      </div>
    </div>
  );
}
