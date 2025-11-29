import { NextRequest, NextResponse } from "next/server"; // Import NextResponse
import { apiResponse, apiError } from "@/lib/api-response";
import pool from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth-utils";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs"; // Assuming bcryptjs is installed

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
    const [userRows] = await pool.query<RowDataPacket[]>(
      `SELECT password_hash FROM users WHERE id = ?`,
      [userId]
    );

    if (userRows.length === 0) {
      return apiError("User not found", 404);
    }

    const storedHash = userRows[0].password_hash;

    // 2. Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, storedHash);
    if (!isCurrentPasswordValid) {
      return apiError("Current password is incorrect", 400);
    }

    // 3. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // 4. Update password in the database
    await pool.query(
      `UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newPasswordHash, userId]
    );

    return apiResponse({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Error changing password:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to change password",
      500
    );
  }
}
