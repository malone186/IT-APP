import { NextResponse } from 'next/server';
import prisma from '@/utils/db';

// POST: 태스크 신규 생성
export async function POST(request) {
  try {
    const { id, title, description, status, priority, assigneeId, milestoneId } = await request.json();

    if (!id || !title || !assigneeId) {
      return NextResponse.json({ error: 'id, title, and assigneeId are required.' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        id,
        title,
        description: description || '',
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        assigneeId,
        milestoneId: milestoneId || null,
        completedAt: status === 'DONE' ? new Date().toISOString().split('T')[0] : null
      },
      include: {
        assignee: true
      }
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// PUT: 태스크 속성/상태 업데이트
export async function PUT(request) {
  try {
    const { id, title, description, status, priority, assigneeId, milestoneId } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const existingTask = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'DONE') {
        updateData.completedAt = new Date().toISOString().split('T')[0];
      } else {
        updateData.completedAt = null;
      }
    }
    if (priority !== undefined) updateData.priority = priority;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (milestoneId !== undefined) updateData.milestoneId = milestoneId || null;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: true
      }
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// DELETE: 태스크 삭제
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id parameter is required.' }, { status: 400 });
    }

    await prisma.task.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
