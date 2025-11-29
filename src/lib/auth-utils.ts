import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export interface TokenPayload {
  id: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export const verifyToken = (token: string): TokenPayload | null => {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables when verifying token.");
    return null;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error("Error verifying JWT token:", error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = verifyToken(token);
    if (!payload || !payload.exp) return true;
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const getClientToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie =>
      cookie.trim().startsWith('token=')
  );

  return authCookie ? authCookie.split('=')[1] : null;
};

export const apiClient = {
  async request(url: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);

    headers.set('Content-Type', 'application/json');

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'; 
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    return response;
  },

  async get(url: string, options?: RequestInit) {
    return this.request(url, { ...options, method: 'GET' });
  },

  async post<T>(url: string, data?: T, options?: RequestInit) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async put<T>(url: string, data?: T, options?: RequestInit) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(url: string, options?: RequestInit) {
    return this.request(url, { ...options, method: 'DELETE' });
  },
};

export function getUserIdFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get('token')?.value; // Read from httpOnly cookie

  if (!token) {
    return null;
  }

  try {
    const decoded = verifyToken(token);
    return decoded?.id || null; 
  } catch (error) {
    console.error("Error in getUserIdFromRequest:", error);
    return null;
  }
}