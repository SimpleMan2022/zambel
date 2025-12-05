export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth-utils";
import type { User } from "@/types/auth";
import { supabase } from '@/lib/supabase';

interface SafeUser extends Omit<User, "password_hash"> {}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const { data: user, error } = await supabase.from('users')
        .select('id, full_name, email, phone, avatar_url, created_at, updated_at')
        .eq('id', userId)
        .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: "User not found", error: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const safeUser: SafeUser = user;

    return NextResponse.json(
      { success: true, message: "User profile fetched successfully", data: safeUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
