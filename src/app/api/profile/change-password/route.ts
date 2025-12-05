import { NextRequest, NextResponse } from "next/server"; // Import NextResponse
import { apiResponse, apiError } from "@/lib/api-response";
import { getUserIdFromRequest } from "@/lib/auth-utils";
import bcrypt from "bcryptjs"; // Assuming bcryptjs is installed
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return apiError("Unauthorized", 401);
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return apiError("Current password and new password are required", 400);
    }

    if (newPassword.length < 8) {
      return apiError("New password must be at least 8 characters long", 400);
    }

    // 1. Fetch user's current password hash
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("password_hash")
      .eq("id", userId)
      .single();

    if (fetchError || !userData) {
      console.error("Error fetching user for password change:", fetchError);
      return apiError("User not found", 404);
    }

    const storedHash = userData.password_hash;

    // 2. Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, storedHash);
    if (!isCurrentPasswordValid) {
      return apiError("Current password is incorrect", 400);
    }

    // 3. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // 4. Update password in the database
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: newPasswordHash })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating password:", updateError);
      return apiError("Failed to update password", 500);
    }

    return apiResponse({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Error changing password:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to change password",
      500
    );
  }
}
