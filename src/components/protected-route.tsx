'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredAuth?: boolean;
}

export const ProtectedRoute: React. FC<ProtectedRouteProps> = ({
                                                                 children,
                                                                 redirectTo = '/login',
                                                                 requiredAuth = true,
                                                               }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requiredAuth && !isAuthenticated) {
        router.push(redirectTo);
      } else if (! requiredAuth && isAuthenticated) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, requiredAuth, redirectTo, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
    );
  }

  // Don't render children if auth requirement not met
  if (requiredAuth && !isAuthenticated) {
    return null;
  }

  if (! requiredAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};