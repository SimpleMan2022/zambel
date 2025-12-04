"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "@/types/auth";
import { useRouter } from "next/navigation";

type SafeUser = Omit<User, "password_hash">;

interface AuthContextType {
  user: SafeUser | null;
  token: string | null;
  login: (user: SafeUser, token?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  cartItemCount: number;
  updateCartItemCount: (count: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper untuk membaca cookie
function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/token=([^;]+)/);
  return match ? match[1] : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const router = useRouter();

  const isAuthenticated = !!token;

  // Fetch jumlah item cart
  const fetchCartCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const res = await fetch("/api/cart/count", {
        credentials: "include", // penting!!!
      });
      if (!res.ok) return;

      const result = await res.json();
      if (result.success) {
        setCartItemCount(result.data.count);
      }
    } catch (err) {
      console.error("Failed to fetch cart count:", err);
    }
  }, [isAuthenticated]);

  // Fetch user profile dengan cookie
  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        credentials: "include", // WAJIB agar cookie terkirim
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.data);
        setToken("session"); // token valid, karena cookie ada & diterima
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Saat mount: baca cookie dulu, lalu fetch profile
  useEffect(() => {
    const cookieToken = getTokenFromCookie();
    if (cookieToken) setToken("session"); // cookie valid → session active
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Fetch cart count setelah auth selesai
  useEffect(() => {
    if (!isLoading) {
      fetchCartCount();
    }
  }, [isLoading, fetchCartCount]);

  const login = (newUser: SafeUser) => {
    setUser(newUser);
    setToken("session"); // token diverifikasi oleh server
    fetchCartCount();
  };

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // hapus cookie di server
      });

      if (res.ok) {
        setUser(null);
        setToken(null);
        setCartItemCount(0);
        router.push("/");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const updateCartItemCount = (count: number) => {
    setCartItemCount(count);
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
        updateCartItemCount,
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
