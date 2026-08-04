import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { status } = body;
    
    const job = await prisma.job.update({
      where: { id: params.id },
      data: { status }
    });
    
    // TODO: Later we will call the n8n webhook URL here to trigger the outgoing email!
    
    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}
