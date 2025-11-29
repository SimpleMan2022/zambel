import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, apiError } from '@/lib/api-response';
// import pool from '@/lib/db'; // Potentially needed for fetching default origin address

interface ShippingCostRequest {
  origin_province: string;
  origin_city: string;
  destination_province: string;
  destination_city: string;
  weight: number; // in grams
  courier: string; // e.g., 'jne', 'pos', 'tiki'
}

export async function POST(request: NextRequest) {
  try {
    const body: ShippingCostRequest = await request.json();
    const { origin_province, origin_city, destination_province, destination_city, weight, courier } = body;

    // Basic validation
    if (!origin_province || !origin_city || !destination_province || !destination_city || !weight || !courier) {
      return apiError("Missing required shipping cost parameters", 400);
    }

    // TODO: Integrate with a real 'api ongkir' (e.g., RajaOngkir)
    // For now, return a placeholder static cost
    console.log(`Calculating shipping for: ${origin_city} to ${destination_city} via ${courier} (${weight}g)`);

    let estimatedCost = 0;
    // Simple placeholder logic
    if (destination_province === "DKI Jakarta" && destination_city === "Kota Jakarta Pusat") {
      estimatedCost = 10000; // Example local rate
    } else if (destination_province === origin_province) {
      estimatedCost = 15000; // Example inter-city within same province
    } else {
      estimatedCost = 25000; // Example inter-province rate
    }

    // Adjust based on weight (very basic example)
    if (weight > 1000) { // Over 1kg
      estimatedCost += Math.ceil((weight - 1000) / 500) * 5000; // Add 5k for every 500g over 1kg
    }

    // Simulate different courier services (optional, can be more complex)
    if (courier === 'pos') {
      estimatedCost *= 1.1; // POS might be a bit more
    } else if (courier === 'tiki') {
      estimatedCost *= 0.95; // TIKI might be a bit less
    }

    return apiResponse({ estimatedCost: Math.round(estimatedCost) });
  } catch (error) {
    console.error("Error calculating shipping cost:", error);
    return apiError(error instanceof Error ? error.message : "Failed to calculate shipping cost", 500);
  }
}
