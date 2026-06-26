import { NextResponse } from 'next/server';
import prisma from '@/utils/db';

export async function POST(request) {
  try {
    const { name, role, username, password, avatarUrl } = await request.json();

    if (!name || !role || !username || !password) {
      return NextResponse.json({ error: 'All fields (name, role, username, password) are required.' }, { status: 400 });
    }

    // 아이디 중복 가입 체크
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists.' }, { status: 409 });
    }

    // 기본 아바타 설정
    const finalAvatarUrl = avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80`;

    const newUser = await prisma.user.create({
      data: {
        name,
        role,
        username,
        password,
        avatarUrl: finalAvatarUrl,
        online: true
      }
    });

    const { password: _, ...safeUser } = newUser;

    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
