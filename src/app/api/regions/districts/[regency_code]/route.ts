import { NextResponse } from 'next/server';
import { apiResponse, apiError } from '@/lib/api-response';

const RAJAONGKIR_API_URL = "https://rajaongkir.komerce.id/api/v1/destination/district";

export async function GET(
  request: Request, // Revert to Request
  context: { params: Promise<{ regency_code: string }> }
) {
  try {
    const { regency_code } = await context.params;

    if (!regency_code) {
      return apiError("Regency code is required", 400);
    }

    const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY; 
    if (!RAJAONGKIR_API_KEY) {
      console.error("RAJAONGKIR_API_KEY is not set.");
      return apiError("RajaOngkir API key is not configured.", 500);
    }

    const response = await fetch(`${RAJAONGKIR_API_URL}/${regency_code}`, {
        headers: {
            'key': RAJAONGKIR_API_KEY,
        }
    });
    console.log("RajaOngkir API response for districts:", response);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("RajaOngkir API error fetching districts:", response.status, errorText);
      throw new Error(`RajaOngkir API failed: ${response.statusText}. Details: ${errorText}`);
    }
    const result = await response.json();

    if (result.meta && result.meta.code === 200) {
        const districts = result.data.map((d: any) => ({
            code: d.id.toString(), 
            name: d.name,
        }));
        return apiResponse(districts);
    } else {
        console.error("RajaOngkir API returned an error status for districts:", result);
        return apiError(result.meta.message || "Failed to fetch districts from RajaOngkir", 500);
    }
  } catch (error) {
    console.error("Error fetching districts:", error);
    return apiError(error instanceof Error ? error.message : "Failed to fetch districts", 500);
  }
}
