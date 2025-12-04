import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, generateToken } from '@/lib/auth'; // Import generateToken from auth.ts
import {LoginRequest, AuthResponse, User} from '@/types/auth';
import {RowDataPacket} from "mysql2";
import { cookies } from 'next/headers'; // Import cookies
import { supabase } from '@/lib/supabase';

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

    // Cari user berdasarkan email
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();

    if (error || !user) {
      return NextResponse.json<AuthResponse>(
            {
              success: false,
              message: 'Email atau password salah',
              error: 'INVALID_CREDENTIALS'
            },
            { status: 401 }
        );
    }

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

    // Set JWT as httpOnly cookie
    (await cookies()).set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",  // Vercel = true
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

    // Hapus password dari response
    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json<AuthResponse>(
          {
            success: true,
            message: 'Login berhasil',
            data: {
              user: userWithoutPassword,
            }
          },
          { status: 200 }
      );
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