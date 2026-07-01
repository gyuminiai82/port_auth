import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (sessionCookie?.value) {
    // Redis에서 세션 삭제
    await redis.del(`session:${sessionCookie.value}`);
  }

  const searchParams = request.nextUrl.searchParams;
  const redirectUrl = searchParams.get('redirect') || '/';

  const response = NextResponse.redirect(redirectUrl.startsWith('http') ? redirectUrl : new URL(redirectUrl, request.url));
  
  // 쿠키 삭제
  const isProduction = process.env.NODE_ENV === 'production';
  response.cookies.delete({
    name: 'session',
    path: '/',
    domain: isProduction ? '.minstudio.app' : undefined,
  });

  return response;
}
