import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import {RegisterRequest, AuthResponse, User} from '@/types/auth';
import {RowDataPacket} from "mysql2";

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

    const connection = await pool.getConnection();

    try {
      // Cek apakah email sudah terdaftar
      const [existingUsers] = await connection.query(
          'SELECT id FROM users WHERE email = ?',
          [email]
      );

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
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
      await connection.query(
          `INSERT INTO users (id, email, password_hash, full_name, phone, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [userId, email, passwordHash, full_name, phone || null]
      );

      // Get user data (tanpa password)
      const [rows] = await connection.query<RowDataPacket[]>(
          'SELECT id, email, full_name, phone, avatar_url, created_at, updated_at FROM users WHERE id = ?',
          [userId]
      );

      const user = rows[0] as Omit<User, 'password_hash'>

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
    } finally {
      connection.release();
    }
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