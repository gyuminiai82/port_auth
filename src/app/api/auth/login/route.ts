export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 사용자 로그인
 *     description: 이메일과 비밀번호로 로그인하고 세션을 생성합니다.
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
 *         description: 로그인 성공 (쿠키에 세션 토큰 발급)
 *       401:
 *         description: 잘못된 이메일 또는 비밀번호
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 틀렸습니다.' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 틀렸습니다.' }, { status: 401 });
    }

    // Generate session token (simple UUID for portfolio)
    const sessionToken = crypto.randomUUID();
    
    // Store in Redis (expires in 24 hours)
    await redis.setex(`session:${sessionToken}`, 60 * 60 * 24, JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
    }));

    const response = NextResponse.json({ message: '로그인 성공', name: user.name, token: sessionToken }, { status: 200 });
    
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Set cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
      domain: isProduction ? '.minstudio.app' : undefined, // 실서버에서는 모든 서브도메인 공유
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
