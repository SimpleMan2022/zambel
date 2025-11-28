import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = (handler: Function) => {
  return async (request: NextRequest) => {
    try {
      const authHeader = request.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            {
              success: false,
              message: 'Token tidak ditemukan',
              error: 'UNAUTHORIZED'
            },
            { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (!decoded) {
        return NextResponse.json(
            {
              success: false,
              message: 'Token tidak valid atau sudah expired',
              error: 'INVALID_TOKEN'
            },
            { status: 401 }
        );
      }

      // Attach user info to request
      (request as any).user = decoded;

      return handler(request);
    } catch (error) {
      return NextResponse.json(
          {
            success: false,
            message: 'Autentikasi gagal',
            error: 'AUTHENTICATION_FAILED'
          },
          { status: 401 }
      );
    }
  };
};