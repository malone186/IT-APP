import { NextResponse } from 'next/server';
import prisma from '@/utils/db';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
    const milestones = await prisma.milestone.findMany({
      orderBy: { startDate: 'asc' }
    });
    const tasks = await prisma.task.findMany({
      include: { assignee: true },
      orderBy: { id: 'asc' }
    });
    const logs = await prisma.log.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    const messages = await prisma.message.findMany({
      orderBy: { timestamp: 'asc' }
    });

    return NextResponse.json({
      users,
      milestones,
      tasks,
      logs,
      messages
    });
  } catch (error) {
    console.error('Failed to load data:', error);
    return NextResponse.json({ error: 'Failed to load system data.' }, { status: 500 });
  }
}
