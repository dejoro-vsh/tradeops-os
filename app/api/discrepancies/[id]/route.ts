import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { action } = body; // 'ACCEPT' or 'REJECT'

    const discrepancy = await prisma.discrepancy.findUnique({
      where: { id: params.id }
    });

    if (!discrepancy) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (action === 'ACCEPT') {
      // 1. Update the Job with the new value
      const job = await prisma.job.findUnique({ where: { id: discrepancy.jobId } });
      if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

      const field = discrepancy.field;
      const newValue = discrepancy.newValue;
      
      let isStandardField = field in job;
      const jobUpdateData: any = {};
      const dynamicDataUpdate: any = typeof job.dynamicData === 'object' && job.dynamicData !== null ? { ...job.dynamicData } : {};

      if (isStandardField) {
        if (field === 'weightKgs' || field === 'volumeCbm') {
           jobUpdateData[field] = newValue ? parseFloat(newValue) : null;
        } else {
           jobUpdateData[field] = newValue;
        }
      } else {
        dynamicDataUpdate[field] = newValue;
        jobUpdateData.dynamicData = dynamicDataUpdate;
      }

      await prisma.job.update({
        where: { id: job.id },
        data: jobUpdateData
      });

      // 2. Mark discrepancy as ACCEPTED
      const updatedDiscrepancy = await prisma.discrepancy.update({
        where: { id: params.id },
        data: { status: 'ACCEPTED' }
      });

      return NextResponse.json(updatedDiscrepancy);
    } else if (action === 'REJECT') {
      // Just mark as REJECTED
      const updatedDiscrepancy = await prisma.discrepancy.update({
        where: { id: params.id },
        data: { status: 'REJECTED' }
      });
      return NextResponse.json(updatedDiscrepancy);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error updating discrepancy:", error);
    return NextResponse.json({ error: 'Failed to update discrepancy', details: error.message }, { status: 500 });
  }
}
