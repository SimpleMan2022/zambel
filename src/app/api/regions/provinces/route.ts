import { NextResponse } from 'next/server';
import { apiResponse, apiError } from '@/lib/api-response';

const RAJAONGKIR_API_URL = "https://rajaongkir.komerce.id/api/v1/destination/province";

export async function GET() {
  try {
    const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY; 
    if (!RAJAONGKIR_API_KEY) {
      console.error("RAJAONGKIR_API_KEY is not set.");
      return apiError("RajaOngkir API key is not configured.", 500);
    }

    const response = await fetch(RAJAONGKIR_API_URL, {
        headers: {
            'key': RAJAONGKIR_API_KEY,
        }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("RajaOngkir API error fetching provinces:", response.status, errorText);
      throw new Error(`RajaOngkir API failed: ${response.statusText}. Details: ${errorText}`);
    }
    const result = await response.json();

    if (result.meta && result.meta.code === 200) {
        // RajaOngkir returns data for provinces directly
        const provinces = result.data.map((p: any) => ({
            code: p.id.toString(), // Ensure code is string for consistency
            name: p.name,
        }));
        return apiResponse(provinces);
    } else {
        console.error("RajaOngkir API returned an error status for provinces:", result);
        return apiError(result.meta.message || "Failed to fetch provinces from RajaOngkir", 500);
    }
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return apiError(error instanceof Error ? error.message : "Failed to fetch provinces", 500);
  }
}
