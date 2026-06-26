import { NextResponse } from 'next/server';
import prisma from '@/utils/db';

// POST: 로그아웃 처리 및 사용자 오프라인 전환
export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { online: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
