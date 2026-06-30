export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import bcrypt from 'bcryptjs';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: ?¬ìš©??ë¡œê·¸?? *     description: ?´ë©”?¼ê³¼ ë¹„ë?ë²ˆí˜¸ë¡?ë¡œê·¸?¸í•˜ê³??¸ì…˜???ì„±?©ë‹ˆ??
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: ë¡œê·¸???±ê³µ (ì¿ í‚¤???¸ì…˜ ? í° ë°œê¸‰)
 *       401:
 *         description: ?˜ëª»???´ë©”???ëŠ” ë¹„ë?ë²ˆí˜¸
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: '?´ë©”???ëŠ” ë¹„ë?ë²ˆí˜¸ê°€ ?€?¸ìŠµ?ˆë‹¤.' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: '?´ë©”???ëŠ” ë¹„ë?ë²ˆí˜¸ê°€ ?€?¸ìŠµ?ˆë‹¤.' }, { status: 401 });
    }

    // Generate session token (simple UUID for portfolio)
    const sessionToken = crypto.randomUUID();
    
    // Store in Redis (expires in 24 hours)
    await redis.setex(`session:${sessionToken}`, 60 * 60 * 24, JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
    }));

    const response = NextResponse.json({ message: 'ë¡œê·¸???±ê³µ', name: user.name }, { status: 200 });
    
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Set cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
      domain: isProduction ? '.minstudio.app' : undefined, // ?¤ì„œë²„ì—?œëŠ” ëª¨ë“  ?œë¸Œ?„ë©”??ê³µìœ 
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '?œë²„ ?¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' }, { status: 500 });
  }
}

