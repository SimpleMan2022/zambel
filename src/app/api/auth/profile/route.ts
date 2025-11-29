import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from "mysql2";
import { getUserIdFromRequest, verifyToken } from '@/lib/auth-utils';
import { User } from '@/types/auth';

interface SafeUser extends Omit<User, "password_hash"> {}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT id, full_name, email, phone, avatar_url, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );

      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'User not found', error: 'USER_NOT_FOUND' },
          { status: 404 }
        );
      }

      const user: SafeUser = rows[0] as SafeUser;

      return NextResponse.json(
        { success: true, message: 'User profile fetched successfully', data: user },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}