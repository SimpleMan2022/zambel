import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';
import {LoginRequest, AuthResponse, User} from '@/types/auth';
import {RowDataPacket} from "mysql2";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validasi input
    if (!email || !password) {
      return NextResponse.json<AuthResponse>(
          {
            success: false,
            message: 'Email dan password wajib diisi',
            error: 'VALIDATION_ERROR'
          },
          { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Cari user berdasarkan email
      const [rows] = await connection.query<RowDataPacket[]>(
          'SELECT * FROM users WHERE email = ?',
          [email]
      );

      if (!rows.length) {
        return NextResponse.json<AuthResponse>(
            {
              success: false,
              message: 'Email atau password salah',
              error: 'INVALID_CREDENTIALS'
            },
            { status: 401 }
        );
      }

      const user = rows[0] as User;

      // Verifikasi password
      const isPasswordValid = await comparePassword(password, user.password_hash);

      if (!isPasswordValid) {
        return NextResponse.json<AuthResponse>(
            {
              success: false,
              message: 'Email atau password salah',
              error: 'INVALID_CREDENTIALS'
            },
            { status: 401 }
        );
      }

      // Generate JWT token
      const token = generateToken(user.id, user.email);

      // Hapus password dari response
      const { password_hash, ...userWithoutPassword } = user;

      return NextResponse.json<AuthResponse>(
          {
            success: true,
            message: 'Login berhasil',
            data: {
              user: userWithoutPassword,
              token
            }
          },
          { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Terjadi kesalahan pada server',
          error: 'INTERNAL_SERVER_ERROR'
        },
        { status: 500 }
    );
  }
}