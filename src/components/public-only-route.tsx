'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from './protected-route';
import { useAuth } from '@/contexts/auth-context';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/'); // Redirect to home page if authenticated
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return null; // Or a loading spinner
  }

  return (
      <ProtectedRoute requiredAuth={false}>
        {children}
      </ProtectedRoute>
  );
};