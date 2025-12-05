export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = await verifyToken(token);

    if (!decoded?.id) {
      return NextResponse.json(
        { success: false, message: "Invalid token", error: "INVALID_TOKEN" },
        { status: 401 }
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, full_name, email, phone, avatar_url, created_at, updated_at")
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: "User not found", error: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "User profile fetched successfully", data: user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
