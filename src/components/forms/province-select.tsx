import React, { useState, useEffect, useCallback } from 'react';
import { RiLoader4Line } from '@remixicon/react';

interface RegionData {
  code: string;
  name: string;
}

interface ProvinceSelectProps {
  value: string;
  onChange: (code: string, name: string) => void;
  disabled?: boolean;
}

export function ProvinceSelect({ value, onChange, disabled }: ProvinceSelectProps) {
  const [provinces, setProvinces] = useState<RegionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProvinces = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/regions/provinces");
      const result = await response.json();
      if (result.success) {
        setProvinces(result.data);
      } else {
        setError(result.message || "Failed to load provinces.");
      }
    } catch (err) {
      console.error("Error fetching provinces:", err);
      setError("Failed to load provinces.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const selectedProvince = provinces.find(p => p.code === selectedCode);
    onChange(selectedCode, selectedProvince ? selectedProvince.name : "");
  };

  if (isLoading) {
    return (
      <div className="relative">
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-400"
          disabled
        >
          <option>Memuat Provinsi...</option>
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
      id="provinceCode"
      name="provinceCode"
      value={value}
      onChange={handleChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-red bg-white"
      required
      disabled={disabled}
    >
      <option value="">Pilih Provinsi</option>
      {provinces.map((province) => (
        <option key={province.code} value={province.code}>
          {province.name}
        </option>
      ))}
    </select>
  );
}
