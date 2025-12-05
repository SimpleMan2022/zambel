"use client";

import React from 'react';
import { RiCheckLine, RiCloseLine } from '@remixicon/react';

interface SavedProductModalProps {
  onClose: () => void;
}

export default function SavedProductModal({ onClose }: SavedProductModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <RiCloseLine className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <RiCheckLine className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Produk Disimpan!</h2>
          <p className="text-gray-600">Produk telah berhasil ditambahkan ke daftar simpanan Anda.</p>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-primary-red text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
