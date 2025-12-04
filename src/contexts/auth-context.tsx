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
  console.log("[AUTH_CONTEXT] Semua cookie yang tersedia:", document.cookie); // Log semua cookie
  const match = document.cookie.match(/token=([^;]+)/);
  const token = match ? match[1] : null;
  console.log("[AUTH_CONTEXT] Token dari cookie:", token ? "Ada" : "Tidak ada");
  return token;
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
      console.error("[AUTH_CONTEXT] Gagal mengambil jumlah keranjang:", err);
    }
  }, [isAuthenticated]);

  // Fetch user profile dengan cookie
  const fetchUserProfile = useCallback(async () => {
    console.log("[AUTH_CONTEXT] Memulai fetch user profile.");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        credentials: "include", // WAJIB agar cookie terkirim
      });

      const data = await res.json();
      console.log("[AUTH_CONTEXT] Respon dari /api/auth/profile:", data);

      if (res.ok && data.success) {
        console.log("[AUTH_CONTEXT] Profil user berhasil diambil. Mengatur user dan token.");
        setUser(data.data);
        setToken("session"); // token valid, karena cookie ada & diterima
      } else {
        console.log("[AUTH_CONTEXT] Gagal mengambil profil user atau tidak terautentikasi.");
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error("[AUTH_CONTEXT] Gagal mengambil profil:", err);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
      console.log("[AUTH_CONTEXT] Selesai fetch user profile.");
    }
  }, []);

  // Saat mount: baca cookie dulu, lalu fetch profile
  useEffect(() => {
    console.log("[AUTH_CONTEXT] AuthProvider di-mount. Memeriksa cookie.");
    const cookieToken = getTokenFromCookie();
    if (cookieToken) {
      setToken("session"); // cookie valid → session active
      console.log("[AUTH_CONTEXT] Cookie token ditemukan, mengatur token ke 'session'.");
    } else {
      console.log("[AUTH_CONTEXT] Cookie token tidak ditemukan.");
    }
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Fetch cart count setelah auth selesai
  useEffect(() => {
    if (!isLoading) {
      console.log("[AUTH_CONTEXT] Loading selesai. Memulai fetch cart count.");
      fetchCartCount();
    }
  }, [isLoading, fetchCartCount]);

  const login = (newUser: SafeUser) => {
    console.log("[AUTH_CONTEXT] Fungsi login dipanggil. Mengatur user dan token.", newUser);
    setUser(newUser);
    setToken("session"); // token diverifikasi oleh server
    fetchCartCount();
  };

  const logout = async () => {
    console.log("[AUTH_CONTEXT] Fungsi logout dipanggil. Menghapus cookie di server.");
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // hapus cookie di server
      });

      if (res.ok) {
        console.log("[AUTH_CONTEXT] Logout berhasil. Mereset state.");
        setUser(null);
        setToken(null);
        setCartItemCount(0);
        router.push("/");
      } else {
        console.error("[AUTH_CONTEXT] Logout gagal:", res.statusText);
      }
    } catch (err) {
      console.error("[AUTH_CONTEXT] Error saat logout:", err);
    }
  };

  const updateCartItemCount = (count: number) => {
    console.log("[AUTH_CONTEXT] Memperbarui jumlah item keranjang:", count);
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
