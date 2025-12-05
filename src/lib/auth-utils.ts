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
    console.log("Decoded Token Payload:", decoded); // Log decoded payload
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

export const apiClient = {
  async request(url: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");

    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    console.log("Client Request URL:", url);
    console.log("Client Request Authorization Header:", headers.get("Authorization")); // Log client authorization header
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // localStorage.removeItem("token");
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
  const authHeader = request.headers.get("authorization");
  console.log("Incoming Request Authorization Header:", authHeader); // Log incoming authorization header
  if (!authHeader?.startsWith("Bearer ")) {
    console.log("No Bearer token found in Authorization header.");
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  console.log("Extracted Token:", token); // Log extracted token
  const decoded = verifyToken(token);
  return decoded?.id || null;
}
