"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "@/types/auth";
import { useRouter } from "next/navigation";

type SafeUser = Omit<User, "password_hash">;

interface AuthContextType {
  user: SafeUser | null;
  login: (user: SafeUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  cartItemCount: number;
  updateCartItemCount: (count: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const router = useRouter();

  const isAuthenticated = !!user;

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
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        credentials: "include", // WAJIB agar cookie terkirim
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Gagal mengambil profil:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Saat mount: baca cookie dulu, lalu fetch profile
  useEffect(() => {
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
