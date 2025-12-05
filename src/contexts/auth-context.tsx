"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "@/types/auth";
import { useRouter } from "next/navigation";

type SafeUser = Omit<User, "password_hash">;

interface AuthContextType {
  user: SafeUser | null;
  token: string | null;
  login: (user: SafeUser, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  cartItemCount: number;
  updateCartItemCount: (count: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const router = useRouter();

  const isAuthenticated = !!token;

  // ✅ FETCH USER PROFILE (Bearer)
  const fetchUserProfile = useCallback(async (initialToken: string | null = null) => {
    setIsLoading(true);

    const tokenToUse = initialToken || localStorage.getItem("token");
    if (!tokenToUse) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // ✅ TOKEN VALID → LANJUTKAN SESSION
        setUser(data.data);
        setToken(tokenToUse);
      } else if (res.status === 401) {
        // ✅ BARU HAPUS TOKEN KALAU MEMANG INVALID
        // localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      }
      // ✅ selain 401 (misal network error, 500) → JANGAN hapus token
    } catch (error) {
      console.error("Profile fetch error:", error);
      // ✅ JANGAN HAPUS TOKEN HANYA KARENA NETWORK ERROR
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ FETCH CART COUNT (Bearer)
  const fetchCartCount = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    try {
      const res = await fetch("/api/cart/count", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const result = await res.json();
      if (result.success) {
        setCartItemCount(result.data.count);
      }
    } catch (err) {
      console.error("[AUTH] Failed to fetch cart count:", err);
    }
  }, [isAuthenticated, token]);

  // ✅ INIT
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken); // Pass the stored token directly
    } else {
      setIsLoading(false); // No token, so not loading auth
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchCartCount();
    }
  }, [isLoading, isAuthenticated, fetchCartCount]);

  // ✅ LOGIN
  const login = (newUser: SafeUser, newToken: string) => {
    localStorage.setItem("token", newToken);
    setUser(newUser);
    setToken(newToken);
    fetchCartCount();
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setCartItemCount(0);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isLoading,
        cartItemCount,
        updateCartItemCount: setCartItemCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
