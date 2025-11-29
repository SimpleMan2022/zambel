import React, { useState, useEffect, useCallback } from 'react';
import { RiLoader4Line } from '@remixicon/react';

interface RegionData {
  code: string;
  name: string;
}

interface RegencySelectProps {
  provinceCode: string;
  value: string;
  onChange: (code: string, name: string) => void;
  disabled?: boolean;
}

export function RegencySelect({ provinceCode, value, onChange, disabled }: RegencySelectProps) {
  const [regencies, setRegencies] = useState<RegionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRegencies = useCallback(async (code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/regions/regencies/${code}`);
      const result = await response.json();
      if (result.success) {
        setRegencies(result.data);
      } else {
        setError(result.message || "Failed to load cities/regencies.");
      }
    } catch (err) {
      console.error("Error fetching regencies:", err);
      setError("Failed to load cities/regencies.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (provinceCode) {
      fetchRegencies(provinceCode);
    } else {
      setRegencies([]);
      onChange("", ""); // Clear selected regency if province is cleared
    }
  }, [provinceCode, fetchRegencies, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const selectedRegency = regencies.find(r => r.code === selectedCode);
    onChange(selectedCode, selectedRegency ? selectedRegency.name : "");
  };

  if (isLoading) {
    return (
      <div className="relative">
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-400"
          disabled
        >
          <option>Memuat Kota/Kabupaten...</option>
        </select>
        <RiLoader4Line className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <select
        className="w-full px-4 py-2 border border-red-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-red-500"
        disabled
      >
        <option>Error: {error}</option>
      </select>
    );
  }

  return (
    <select
      id="regencyCode"
      name="regencyCode"
      value={value}
      onChange={handleChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-red bg-white"
      required
      disabled={disabled || !provinceCode || regencies.length === 0}
    >
      <option value="">Pilih Kota/Kabupaten</option>
      {regencies.map((regency) => (
        <option key={regency.code} value={regency.code}>
          {regency.name}
        </option>
      ))}
    </select>
  );
}
