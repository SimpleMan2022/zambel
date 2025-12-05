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
    headers.set("Content-Type", "application/json");
    console.log("url", url);  
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", 
    });

    if (response.status === 401) {
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    return response;
  },

  get(url: string, options?: RequestInit) {
    return this.request(url, { ...options, method: "GET" });
  },
  post<T>(url: string, data?: T, options?: RequestInit) {
    return this.request(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  put<T>(url: string, data?: T, options?: RequestInit) {
    return this.request(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete(url: string, options?: RequestInit) {
    return this.request(url, { ...options, method: "DELETE" });
  },
};


export function getUserIdFromRequest(request: NextRequest): string | null {
  console.log("[AUTH_UTILS] Mencoba mendapatkan user ID dari request.");
  const token = request.cookies.get('token')?.value; // Read from httpOnly cookie
  console.log("[AUTH_UTILS] Token dari request cookies:", token ? "Ada" : "Tidak ada");
  console.log("[AUTH_UTILS] Request cookies object:", request.cookies);

  if (!token) {
    console.log("[AUTH_UTILS] Token tidak ditemukan di request cookies.");
    return null;
  }

  try {
    const decoded = verifyToken(token);
    console.log("[AUTH_UTILS] Token berhasil didekode.", decoded?.id ? `User ID: ${decoded.id}` : "Tidak ada User ID");
    return decoded?.id || null;
  } catch (error) {
    console.error("[AUTH_UTILS] Error di getUserIdFromRequest:", error);
    return null;
  }
}