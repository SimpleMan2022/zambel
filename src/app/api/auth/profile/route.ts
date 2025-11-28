import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';

async function getProfile(request: NextRequest) {
  try {
    const user = (request as any).user;
    const connection = await pool.getConnection();

    try {
      const [users] = await connection.query(
          'SELECT id, email, full_name, phone, avatar_url, created_at, updated_at FROM users WHERE id = ?',
          [user.userId]
      );

      if (!Array. isArray(users) || users. length === 0) {
        return NextResponse.json(
            {
              success: false,
              message: 'User tidak ditemukan',
              error: 'USER_NOT_FOUND'
            },
            { status: 404 }
        );
      }

      return NextResponse.json(
          {
            success: true,
            message: 'Profile berhasil diambil',
            data: users[0]
          },
          { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
        {
          success: false,
          message: 'Terjadi kesalahan pada server',
          error: 'INTERNAL_SERVER_ERROR'
        },
        { status: 500 }
    );
  }
}

export const GET = authMiddleware(getProfile);