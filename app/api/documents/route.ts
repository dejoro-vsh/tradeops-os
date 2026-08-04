import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobNumber, type, url } = body;

    if (!jobNumber || !type || !url) {
      return NextResponse.json({ error: 'Missing required fields: jobNumber, type, url' }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { jobNumber }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Determine the next version number for this specific document type
    const existingDocs = await prisma.document.findMany({
      where: { jobId: job.id, type },
      orderBy: { version: 'desc' },
      take: 1
    });

    const nextVersion = existingDocs.length > 0 ? existingDocs[0].version + 1 : 1;

    const document = await prisma.document.create({
      data: {
        jobId: job.id,
        type,
        url,
        version: nextVersion,
        status: 'PENDING_APPROVAL'
      }
    });

    return NextResponse.json(document, { status: 200 });
  } catch (error: any) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create document', details: error.message }, { status: 500 });
  }
}
