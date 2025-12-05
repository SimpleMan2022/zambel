export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, generateToken } from '@/lib/auth'; // Import generateToken from auth.ts
import {LoginRequest, AuthResponse, User} from '@/types/auth';
import { cookies } from 'next/headers'; // Import cookies
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log("[LOGIN_ROUTE] Menerima permintaan login.");
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validasi input
    if (!email || !password) {
      console.log("[LOGIN_ROUTE] Validasi gagal: Email atau password tidak ada.");
      return NextResponse.json<AuthResponse>(
          {
            success: false,
            message: 'Email dan password wajib diisi',
            error: 'VALIDATION_ERROR'
          },
          { status: 400 }
      );
    }
    console.log(`[LOGIN_ROUTE] Mencoba login dengan email: ${email}`);

    // Cari user berdasarkan email
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();

    if (error || !user) {
      console.log("[LOGIN_ROUTE] User tidak ditemukan atau error database.", error);
      return NextResponse.json<AuthResponse>(
            {
              success: false,
              message: 'Email atau password salah',
              error: 'INVALID_CREDENTIALS'
            },
            { status: 401 }
        );
    }
    console.log("[LOGIN_ROUTE] User ditemukan.");

    // Verifikasi password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      console.log("[LOGIN_ROUTE] Password tidak valid.");
      return NextResponse.json<AuthResponse>(
            {
              success: false,
              message: 'Email atau password salah',
              error: 'INVALID_CREDENTIALS'
            },
            { status: 401 }
        );
    }
    console.log("[LOGIN_ROUTE] Password valid. Membuat token...");

    // Generate JWT token
    const token = generateToken(user.id, user.email);
    console.log("[LOGIN_ROUTE] Token berhasil dibuat. Mengatur cookie...");

    // Set JWT as httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      data: { user: { ...user, password_hash: undefined } },
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

   
    console.log("[LOGIN_ROUTE] Cookie token:", response.cookies.get('token')?.value);

    console.log("[LOGIN_ROUTE] Cookie token telah diatur. Login berhasil.");

    // Hapus password dari response
   return response
  } catch (error) {
    console.error('[LOGIN_ROUTE] Login error global:', error);
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