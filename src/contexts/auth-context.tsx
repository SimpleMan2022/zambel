"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { User } from "@/types/auth"
import { useRouter } from 'next/navigation'; // Import useRouter

type SafeUser = Omit<User, "password_hash">

interface AuthContextType {
  user: SafeUser | null;
  token: string | null;
  login: (user: SafeUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  cartItemCount: number; // Add cart item count
  updateCartItemCount: (count: number) => void; // Add function to update cart count
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0); 
  const isAuthenticated = !!token;
  const router = useRouter(); // Initialize useRouter

  const fetchCartCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await fetch('/api/cart/count');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCartItemCount(result.data.count);
        }
      }
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    }
  }, [isAuthenticated]);

  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/profile');
      const result = await response.json();

      if (response.ok && result.success) {
        setUser(result.data);
        setToken('exists');
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Fetch cart count when authentication status changes
  useEffect(() => {
    if (!isLoading) { // Only fetch if authLoading is done
      fetchCartCount();
    }
  }, [isLoading, fetchCartCount]);

  const login = (newUser: SafeUser) => {
    setUser(newUser);
    setToken('exists');
    fetchCartCount(); // Fetch cart count after login
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        setToken(null);
        setUser(null);
        setCartItemCount(0); // Reset cart count on logout
        router.push('/'); // Redirect to home page using router.push
      } else {
        console.error("Logout failed on server.");
      }
    } catch (error) {
      console.error("Error during logout API call:", error);
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
        isAuthenticated: !!token,
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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}