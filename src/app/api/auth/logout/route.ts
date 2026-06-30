import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { cookies } from 'next/headers';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 사용자 로그아웃
 *     description: 현재 로그인된 세션을 만료시키고 쿠키를 삭제합니다.
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (sessionCookie?.value) {
      // Remove from Redis cache
      await redis.del(`session:${sessionCookie.value}`);
    }

    const response = NextResponse.json({ message: '로그아웃 성공' }, { status: 200 });
    
    // Delete cookie
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.delete({
      name: 'session',
      path: '/',
      domain: isProduction ? '.minstudio.app' : undefined,
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
