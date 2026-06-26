import { NextResponse } from 'next/server';
import prisma from '@/utils/db';

// POST: 마일스톤 생성
export async function POST(request) {
  try {
    const { title, startDate, endDate } = await request.json();

    if (!title || !startDate || !endDate) {
      return NextResponse.json({ error: 'title, startDate, and endDate are required.' }, { status: 400 });
    }

    const milestone = await prisma.milestone.create({
      data: {
        title,
        startDate,
        endDate
      }
    });

    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error) {
    console.error('Create milestone error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// DELETE: 마일스톤 삭제
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id parameter is required.' }, { status: 400 });
    }

    await prisma.milestone.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete milestone error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
