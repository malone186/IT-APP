import { NextResponse } from 'next/server';
import prisma from '@/utils/db';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    // 비밀번호 제외한 안전한 사용자 정보 구성
    const { password: _, ...safeUser } = user;

    // 로그인 시 사용자의 온라인 상태를 true로 전환
    await prisma.user.update({
      where: { id: user.id },
      data: { online: true }
    });

    return NextResponse.json({ user: { ...safeUser, online: true } });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
