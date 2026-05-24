'use client';

import { useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AppRouterProps {
  children: ReactNode;
}

export function AppRouter({ children }: AppRouterProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Public routes
  const publicRoutes = ['/auth/login', '/auth/register', '/'];

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    if (!isAuthenticated && !isPublicRoute) {
      // Not authenticated and trying to access protected route
      router.push('/auth/login');
    } else if (isAuthenticated && isPublicRoute && pathname === '/') {
      // Authenticated and on landing page
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, pathname, router]);

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid-slate mask-radial-fade opacity-60" />
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl animate-blob [animation-delay:4s]" />

        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-brand-500/30 blur-xl animate-pulse" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-xl shadow-brand-600/30">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.3s]" />
            <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.15s]" />
            <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500" />
            <span className="ml-2 text-muted-foreground">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
