import type { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",  // ← FIX WAJIB
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return fetchAPI<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    return fetchAPI<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },
}