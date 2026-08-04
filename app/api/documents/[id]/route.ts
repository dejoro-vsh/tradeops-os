import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { status } = body;
    
    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }

    const document = await prisma.document.update({
      where: { id: params.id },
      data: { status }
    });
    
    return NextResponse.json(document);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.document.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
