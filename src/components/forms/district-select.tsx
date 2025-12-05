import React, { useState, useEffect, useCallback } from 'react';
import { RiLoader4Line } from '@remixicon/react';

interface RegionData {
  code: string;
  name: string;
}

interface DistrictSelectProps {
  regencyCode: string;
  value: string;
  onChange: (code: string, name: string) => void;
  disabled?: boolean;
}

export function DistrictSelect({ regencyCode, value, onChange, disabled }: DistrictSelectProps) {
  const [districts, setDistricts] = useState<RegionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDistricts = useCallback(async (code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/regions/districts/${code}`);
      const result = await response.json();
      if (result.success) {
        setDistricts(result.data);
      } else {
        setError(result.message || "Failed to load districts.");
      }
    } catch (err) {
      console.error("Error fetching districts:", err);
      setError("Failed to load districts.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (regencyCode) {
      fetchDistricts(regencyCode);
    } else {
      setDistricts([]);
      onChange("", ""); // Clear selected district if regency is cleared
    }
  }, [regencyCode, fetchDistricts, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const selectedDistrict = districts.find(d => d.code === selectedCode);
    onChange(selectedCode, selectedDistrict ? selectedDistrict.name : "");
  };

  if (isLoading) {
    return (
      <div className="relative">
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-400"
          disabled
        >
          <option>Memuat Kecamatan...</option>
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
      id="districtCode"
      name="districtCode"
      value={value}
      onChange={handleChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-red bg-white"
      required
      disabled={disabled || !regencyCode || districts.length === 0}
    >
      <option value="">Pilih Kecamatan</option>
      {districts.map((district) => (
        <option key={district.code} value={district.code}>
          {district.name}
        </option>
      ))}
    </select>
  );
}
