import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, apiError } from '@/lib/api-response';
import { getUserIdFromRequest } from '@/lib/auth-utils';

interface ShippingOptionsRequest {
  origin_district_code: string;
  destination_district_code: string; 
  total_weight: number; // in grams
}

// Placeholder for the shop's origin details (now directly used from request body)
// const SHOP_ORIGIN_REGENCY_CODE = "3575"; // Removed as origin is now in request body
const RAJAONGKIR_API_URL = "https://rajaongkir.komerce.id/api/v1/calculate/district/domestic-cost"; // Corrected API URL

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const body: ShippingOptionsRequest = await request.json();
    const { origin_district_code, destination_district_code, total_weight } = body;

    if (!origin_district_code || !destination_district_code || !total_weight) {
      return apiError("Missing required shipping parameters (origin, destination, and weight)", 400);
    }

    const effectiveWeight = Math.max(total_weight, 100); 

    const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY; 
    if (!RAJAONGKIR_API_KEY) {
      console.error("RAJAONGKIR_API_KEY is not set.");
      return apiError("RajaOngkir API key is not configured.", 500);
    }
    const couriers = "jne:jnt:sicepat:anteraja:pos:tiki"; // Example couriers

    const formData = new URLSearchParams();
    formData.append('origin', origin_district_code);
    formData.append('destination', destination_district_code);
    formData.append('weight', effectiveWeight.toString());
    formData.append('courier', couriers);
    formData.append('price', 'lowest'); 

    const rajaOngkirResponse = await fetch(RAJAONGKIR_API_URL, {
      method: 'POST',
      headers: {
        'key': RAJAONGKIR_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!rajaOngkirResponse.ok) {
      const errorText = await rajaOngkirResponse.text();
      console.error("RajaOngkir API error:", rajaOngkirResponse.status, errorText);
      throw new Error(`RajaOngkir API failed: ${rajaOngkirResponse.statusText}. Details: ${errorText}`);
    }

    const rajaOngkirResult = await rajaOngkirResponse.json();
    console.log("RajaOngkir Shipping Cost API Response:", rajaOngkirResult);

    if (rajaOngkirResult.meta && rajaOngkirResult.meta.code === 200) {
      const groupedServices = rajaOngkirResult.data.reduce((acc: any, serviceResult: any) => {
        const courierCode = serviceResult.code;
        if (!acc[courierCode]) {
          acc[courierCode] = {
            code: courierCode,
            name: serviceResult.name, 
            services: [],
          };
        }
        acc[courierCode].services.push({
          service: serviceResult.service,
          description: serviceResult.description,
          cost: serviceResult.cost,
          etd: serviceResult.etd,
          note: serviceResult.note || "", 
        });
        return acc;
      }, {});

      const availableServices = Object.values(groupedServices);
      return apiResponse(availableServices);
    } else {
      console.error("RajaOngkir API returned an error status:", rajaOngkirResult);
      return apiError(rajaOngkirResult.meta.message || "Failed to fetch shipping options from RajaOngkir", 500);
    }
  } catch (error) {
    console.error("Error fetching shipping options:", error);
    return apiError(error instanceof Error ? error.message : "An unexpected error occurred while fetching shipping options", 500);
  }
}
