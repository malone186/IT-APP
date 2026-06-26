import { NextResponse } from 'next/server';
import prisma from '@/utils/db';

// POST: 시스템 로그 기록
export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'text is required.' }, { status: 400 });
    }

    const log = await prisma.log.create({
      data: {
        text
      }
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error('Create log error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
