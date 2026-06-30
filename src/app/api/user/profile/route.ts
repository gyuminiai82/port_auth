import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { cookies } from 'next/headers';

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: 내 프로필 조회
 *     description: 현재 로그인된 세션에 해당하는 유저의 최신 정보를 반환합니다.
 *     responses:
 *       200:
 *         description: 프로필 조회 성공
 *       401:
 *         description: 인증되지 않은 사용자 (세션 없음)
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // Get session from Redis
    const sessionData = await redis.get(`session:${sessionCookie.value}`);
    if (!sessionData) {
      return NextResponse.json({ error: '세션이 만료되었습니다.' }, { status: 401 });
    }

    const session = JSON.parse(sessionData);

    // Get latest user info from DB
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '유저를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: 내 프로필 수정
 *     description: 유저의 이름(name)을 수정합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: 프로필 수정 성공
 *       401:
 *         description: 인증되지 않은 사용자 (세션 없음)
 */
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const sessionData = await redis.get(`session:${sessionCookie.value}`);
    if (!sessionData) {
      return NextResponse.json({ error: '세션이 만료되었습니다.' }, { status: 401 });
    }

    const session = JSON.parse(sessionData);
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: '변경할 이름이 필요합니다.' }, { status: 400 });
    }

    // Update DB
    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: { name },
    });

    // Update Redis Cache
    await redis.setex(`session:${sessionCookie.value}`, 60 * 60 * 24, JSON.stringify({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
    }));

    return NextResponse.json({ message: '프로필이 성공적으로 업데이트 되었습니다.', user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
