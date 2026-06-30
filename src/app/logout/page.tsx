'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LogoutHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  useEffect(() => {
    const doLogout = async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        if (redirectUrl.startsWith('http')) {
          // Cross-domain SSO logout - also remove local token by appending a param or just redirecting
          const url = new URL(redirectUrl);
          url.searchParams.set('action', 'logout');
          window.location.href = url.toString();
        } else {
          router.push(redirectUrl);
        }
      }
    };

    doLogout();
  }, [router, redirectUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-[#0f0c29] to-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/globe.svg')] bg-center opacity-10 blur-sm pointer-events-none"></div>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-white">안전하게 로그아웃 중입니다...</h2>
        <p className="text-gray-400 mt-2">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}

export default function LogoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <LogoutHandler />
    </Suspense>
  );
}
