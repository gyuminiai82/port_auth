export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: ?¬ìš©???Œì›ê°€?? *     description: ?´ë©”?? ë¹„ë?ë²ˆí˜¸, ?´ë¦„??ë°›ì•„ ?ˆë¡œ???¬ìš©?ë? ?ì„±?©ë‹ˆ??
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
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: ?Œì›ê°€???±ê³µ
 *       400:
 *         description: ?´ë? ì¡´ì¬?˜ëŠ” ?´ë©”?? */
export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: '?´ë? ì¡´ì¬?˜ëŠ” ?´ë©”?¼ì…?ˆë‹¤.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return NextResponse.json({ message: '?Œì›ê°€???±ê³µ', userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: '?œë²„ ?¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.' }, { status: 500 });
  }
}

