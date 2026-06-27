'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/useAuth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-[#2563EB]/25 border-t-[#2563EB] rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#64748B] animate-pulse">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Evita parpadeos mientras redirige
  }

  return <>{children}</>;
}
