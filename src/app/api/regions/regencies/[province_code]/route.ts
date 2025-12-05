import { NextResponse } from 'next/server';
import { apiResponse, apiError } from '@/lib/api-response';

const RAJAONGKIR_API_URL = "https://rajaongkir.komerce.id/api/v1/destination/city";

export async function GET(
  request: Request, // Revert to Request
  context: { params: Promise<{ province_code: string }> }
) {
  try {
    const { province_code } = await context.params;

    if (!province_code) {
      return apiError("Province code is required", 400);
    }

    const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY; 
    if (!RAJAONGKIR_API_KEY) {
      console.error("RAJAONGKIR_API_KEY is not set.");
      return apiError("RajaOngkir API key is not configured.", 500);
    }

    const response = await fetch(`${RAJAONGKIR_API_URL}/${province_code}`, {
        headers: {
            'key': RAJAONGKIR_API_KEY,
        }
    });
    console.log("RajaOngkir API response for regencies:", response);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("RajaOngkir API error fetching regencies:", response.status, errorText);
      throw new Error(`RajaOngkir API failed: ${response.statusText}. Details: ${errorText}`);
    }
    const result = await response.json();

    if (result.meta && result.meta.code === 200) {
        const regencies = result.data.map((r: any) => ({
            code: r.id.toString(), 
            name: r.name,
        }));
        return apiResponse(regencies);
    } else {
        console.error("RajaOngkir API returned an error status for regencies:", result);
        return apiError(result.meta.message || "Failed to fetch cities/regencies from RajaOngkir", 500);
    }
  } catch (error) {
    console.error("Error fetching regencies:", error);
    return apiError(error instanceof Error ? error.message : "Failed to fetch cities/regencies", 500);
  }
}
