export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { cookies } from 'next/headers';

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: ???„ë¡œ??ì¡°íšŒ
 *     description: ?„ì¬ ë¡œê·¸?¸ëœ ?¸ì…˜???´ë‹¹?˜ëŠ” ? ì???ìµœì‹  ?•ë³´ë¥?ë°˜í™˜?©ë‹ˆ??
 *     responses:
 *       200:
 *         description: ?„ë¡œ??ì¡°íšŒ ?±ê³µ
 *       401:
 *         description: ?¸ì¦?˜ì? ?Šì? ?¬ìš©??(?¸ì…˜ ?†ìŒ)
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: '?¸ì¦???„ìš”?©ë‹ˆ??' }, { status: 401 });
    }

    // Get session from Redis
    const sessionData = await redis.get(`session:${sessionCookie.value}`);
    if (!sessionData) {
      return NextResponse.json({ error: '?¸ì…˜??ë§Œë£Œ?˜ì—ˆ?µë‹ˆ??' }, { status: 401 });
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
      return NextResponse.json({ error: '? ì?ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: '?œë²„ ?¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: ???„ë¡œ???˜ì •
 *     description: ? ì????´ë¦„(name)???˜ì •?©ë‹ˆ??
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
 *         description: ?„ë¡œ???˜ì • ?±ê³µ
 *       401:
 *         description: ?¸ì¦?˜ì? ?Šì? ?¬ìš©??(?¸ì…˜ ?†ìŒ)
 */
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: '?¸ì¦???„ìš”?©ë‹ˆ??' }, { status: 401 });
    }

    const sessionData = await redis.get(`session:${sessionCookie.value}`);
    if (!sessionData) {
      return NextResponse.json({ error: '?¸ì…˜??ë§Œë£Œ?˜ì—ˆ?µë‹ˆ??' }, { status: 401 });
    }

    const session = JSON.parse(sessionData);
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'ë³€ê²½í•  ?´ë¦„???„ìš”?©ë‹ˆ??' }, { status: 400 });
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

    return NextResponse.json({ message: '?„ë¡œ?„ì´ ?±ê³µ?ìœ¼ë¡??…ë°?´íŠ¸ ?˜ì—ˆ?µë‹ˆ??', user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: '?œë²„ ?¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' }, { status: 500 });
  }
}

