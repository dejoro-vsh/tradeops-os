import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');

    if (!threadId) {
      return NextResponse.json({ error: 'threadId is required' }, { status: 400 });
    }

    const job = await prisma.job.findFirst({
      where: { emailThreadId: threadId },
      select: { id: true, jobNumber: true, status: true }
    });

    if (job) {
      return NextResponse.json({ exists: true, job }, { status: 200 });
    } else {
      return NextResponse.json({ exists: false }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Error checking thread ID:", error);
    return NextResponse.json({ error: 'Failed to check thread ID', details: error.message }, { status: 500 });
  }
}
