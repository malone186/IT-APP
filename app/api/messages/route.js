import { NextResponse } from 'next/server';
import prisma from '@/utils/db';

// POST: 메시지 발송 내용 저장
export async function POST(request) {
  try {
    const { senderId, receiverId, text } = await request.json();

    if (!senderId || !receiverId || !text) {
      return NextResponse.json({ error: 'senderId, receiverId, and text are required.' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        text
      }
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
