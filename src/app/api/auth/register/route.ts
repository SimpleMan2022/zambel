import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from '@/lib/auth';
import { RegisterRequest, AuthResponse, User } from '@/types/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, full_name, phone } = body;

    // Validasi input
    if (!email || !password || !full_name) {
      return NextResponse.json<AuthResponse>(
          {
            success: false,
            message: 'Email, password, dan nama lengkap wajib diisi',
            error: 'VALIDATION_ERROR'
          },
          { status: 400 }
      );
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse. json<AuthResponse>(
          {
            success: false,
            message: 'Format email tidak valid',
            error: 'INVALID_EMAIL'
          },
          { status: 400 }
      );
    }

    // Validasi panjang password
    if (password.length < 6) {
      return NextResponse. json<AuthResponse>(
          {
            success: false,
            message: 'Password minimal 6 karakter',
            error: 'WEAK_PASSWORD'
          },
          { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar
    const { data: existingUser, error: existingUserError } = await supabase.from('users').select('id').eq('email', email).single();

    if (existingUser) {
      return NextResponse.json<AuthResponse>(
            {
              success: false,
              message: 'Email sudah terdaftar',
              error: 'EMAIL_EXISTS'
            },
            { status: 409 }
        );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate UUID
    const userId = uuidv4();

    // Insert user baru
    const { error: insertError } = await supabase.from('users').insert({
      id: userId,
      email,
      password_hash: passwordHash,
      full_name,
      phone: phone || null,
    });

    if (insertError) {
      console.error('Error inserting user:', insertError);
      return NextResponse.json<AuthResponse>(
          {
            success: false,
            message: 'Gagal mendaftar user',
            error: 'DATABASE_ERROR'
          },
          { status: 500 }
      );
    }

    // Get user data (tanpa password)
    const { data: newUser, error: fetchError } = await supabase.from('users')
        .select('id, email, full_name, phone, avatar_url, created_at, updated_at')
        .eq('id', userId)
        .single();

    if (fetchError || !newUser) {
      console.error('Error fetching new user:', fetchError);
      return NextResponse.json<AuthResponse>(
          {
            success: false,
            message: 'Gagal mengambil data user setelah registrasi',
            error: 'DATABASE_ERROR'
          },
          { status: 500 }
      );
    }

    const user = newUser;

    return NextResponse.json<AuthResponse>(
          {
            success: true,
            message: 'Registrasi berhasil',
            data: {
              user
            }
          },
          { status: 201 }
      );
  } catch (error) {
    console.error('Register error:', error);
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