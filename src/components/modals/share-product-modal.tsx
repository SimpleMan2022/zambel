"use client";

import React, { useState } from 'react';
import { RiCloseLine, RiFileCopyLine, RiCheckLine } from '@remixicon/react';

interface ShareProductModalProps {
  onClose: () => void;
}

export default function ShareProductModal({ onClose }: ShareProductModalProps) {
  const [copied, setCopied] = useState(false);
  const productUrl = typeof window !== 'undefined' ? window.location.href : ''; // Get current URL

  const handleCopy = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <RiCloseLine className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center text-center space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Bagikan Produk Ini</h2>
          <p className="text-gray-600">Salin tautan di bawah atau bagikan ke media sosial.</p>

          <div className="w-full flex items-center border border-gray-300 rounded-lg pr-2">
            <input
              type="text"
              readOnly
              value={productUrl}
              className="flex-1 px-3 py-2 text-sm text-gray-800 bg-gray-50 rounded-l-lg outline-none"
            />
            <button
              onClick={handleCopy}
              className="ml-2 p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition flex items-center gap-1"
            >
              {copied ? <RiCheckLine className="w-5 h-5 text-green-600" /> : <RiFileCopyLine className="w-5 h-5" />}
              {copied ? 'Disalin!' : 'Salin'}
            </button>
          </div>

          {/* Social Share Buttons (Optional - can add later) */}
          {/* <div className="flex gap-4 mt-4">
            <button className="p-2 rounded-full bg-blue-500 text-white"><RiFacebookFill /></button>
            <button className="p-2 rounded-full bg-blue-400 text-white"><RiTwitterFill /></button>
          </div> */}

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
