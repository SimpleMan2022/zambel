import { NextRequest } from 'next/server';
import { apiResponse, apiError } from '@/lib/api-response';
import { getUserIdFromRequest } from '@/lib/auth-utils';

interface ShippingOptionsRequest {
  origin_district_code: string;
  destination_district_code: string;
  total_weight: number; // grams
}

const RAJAONGKIR_API_URL =
  "https://rajaongkir.komerce.id/api/v1/calculate/district/domestic-cost";

export async function POST(request: NextRequest) {
  try {
    // ==========================
    // ✅ AUTH CHECK
    // ==========================
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    // ==========================
    // ✅ VALIDATE BODY
    // ==========================
    const body: ShippingOptionsRequest = await request.json();
    const {
      origin_district_code,
      destination_district_code,
      total_weight,
    } = body;

    if (
      !origin_district_code ||
      !destination_district_code ||
      typeof total_weight !== "number"
    ) {
      return apiError(
        "Missing required shipping parameters (origin, destination, and weight)",
        400
      );
    }

    // ✅ RajaOngkir minimal 100 gram
    const effectiveWeight = Math.max(total_weight, 100);

    // ==========================
    // ✅ API KEY CHECK
    // ==========================
    const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;
    if (!RAJAONGKIR_API_KEY) {
      console.error("RAJAONGKIR_API_KEY is not set.");
      return apiError("RajaOngkir API key is not configured.", 500);
    }

    const couriers = "jne:jnt:sicepat:anteraja:pos:tiki";

    // ==========================
    // ✅ BUILD FORM DATA
    // ==========================
    const formData = new URLSearchParams();
    formData.append("origin", origin_district_code);
    formData.append("destination", destination_district_code);
    formData.append("weight", effectiveWeight.toString());
    formData.append("courier", couriers);
    formData.append("price", "lowest");

    // ==========================
    // ✅ CALL RAJAONGKIR
    // ==========================
    const rajaOngkirResponse = await fetch(RAJAONGKIR_API_URL, {
      method: "POST",
      headers: {
        key: RAJAONGKIR_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!rajaOngkirResponse.ok) {
      const errorText = await rajaOngkirResponse.text();
      console.error("RajaOngkir API error:", errorText);
      return apiError("Failed to fetch shipping options from RajaOngkir", 500);
    }

    const rajaOngkirResult = await rajaOngkirResponse.json();

    // ==========================
    // ✅ VALIDATE RESPONSE
    // ==========================
    if (!rajaOngkirResult?.meta || rajaOngkirResult.meta.code !== 200) {
      console.error("Invalid RajaOngkir response:", rajaOngkirResult);
      return apiError(
        rajaOngkirResult?.meta?.message ||
          "Failed to fetch shipping options from RajaOngkir",
        500
      );
    }

    // ==========================
    // ✅ GROUP BY COURIER (FORMAT SESUAI FRONTEND)
    // ==========================
    const groupedServices = rajaOngkirResult.data.reduce((acc: any, item: any) => {
      const courierCode = item.code;

      if (!acc[courierCode]) {
        acc[courierCode] = {
          code: courierCode,
          name: item.name,
          services: [],
        };
      }

      acc[courierCode].services.push({
        service: item.service,
        description: item.description,
        cost: item.cost,
        etd: item.etd,
        note: item.note || "",
      });

      return acc;
    }, {});

    const availableServices = Object.values(groupedServices);

    // ==========================
    // ✅ FINAL RESPONSE
    // ==========================
    return apiResponse(availableServices);

  } catch (error) {
    console.error("Error fetching shipping options:", error);
    return apiError(
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while fetching shipping options",
      500
    );
  }
}
