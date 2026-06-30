export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { cookies } from 'next/headers';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: ?¬ìš©??ë¡œê·¸?„ì›ƒ
 *     description: ?„ì¬ ë¡œê·¸?¸ëœ ?¸ì…˜??ë§Œë£Œ?œí‚¤ê³?ì¿ í‚¤ë¥??? œ?©ë‹ˆ??
 *     responses:
 *       200:
 *         description: ë¡œê·¸?„ì›ƒ ?±ê³µ
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (sessionCookie?.value) {
      // Remove from Redis cache
      await redis.del(`session:${sessionCookie.value}`);
    }

    const response = NextResponse.json({ message: 'ë¡œê·¸?„ì›ƒ ?±ê³µ' }, { status: 200 });
    
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
    return NextResponse.json({ error: '?œë²„ ?¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' }, { status: 500 });
  }
}

