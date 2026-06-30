'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // 세션 쿠키가 있는지 간단히 API를 찔러서 확인 (에러 나면 비로그인)
    fetch('/api/user/profile')
      .then(res => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-[#0f0c29] to-black flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/next.svg')] bg-center opacity-5 blur-sm pointer-events-none"></div>
      
      <div className="z-10 text-center bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-6 tracking-tight">
          minstudio Auth
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
          통합 인증 서버에 오신 것을 환영합니다.<br/>안전하고 빠른 로그인을 경험하세요.
        </p>
        
        <div className="flex gap-4 justify-center h-14 items-center">
          {isLoggedIn === null ? (
            <div className="text-gray-500">인증 확인 중...</div>
          ) : isLoggedIn ? (
            <Link 
              href="/profile" 
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all transform hover:scale-105"
            >
              내 프로필 바로가기
            </Link>
          ) : (
            <>
              <Link 
                href="/login" 
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all transform hover:scale-105"
              >
                로그인
              </Link>
              <Link 
                href="/register" 
                className="px-8 py-3 bg-white/10 text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-8 text-purple-400/50 text-sm">
        <Link href="/api-doc" className="hover:text-purple-300 transition-colors underline underline-offset-4">
          Swagger API 문서 보기
        </Link>
      </div>
    </div>
  );
}
