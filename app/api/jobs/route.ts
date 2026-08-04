import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobNumber, agentEmail, status, emailThreadId, shipperName, consigneeName, commodity, transportMode, loadType, weightKgs, volumeCbm, vesselName } = body;

    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { jobNumber }
    });

    let job;
    if (existingJob) {
      job = await prisma.job.update({
        where: { jobNumber },
        data: {
          status: status || existingJob.status,
          shipperName: shipperName || existingJob.shipperName,
          consigneeName: consigneeName || existingJob.consigneeName,
          commodity: commodity || existingJob.commodity,
          transportMode: transportMode || existingJob.transportMode,
          loadType: loadType || existingJob.loadType,
          weightKgs: weightKgs || existingJob.weightKgs,
          volumeCbm: volumeCbm || existingJob.volumeCbm,
          vesselName: vesselName || existingJob.vesselName,
        }
      });
    } else {
      job = await prisma.job.create({
        data: {
          jobNumber,
          agentEmail,
          status: status || 'NEW',
          emailThreadId,
          shipperName,
          consigneeName,
          commodity,
          transportMode,
          loadType,
          weightKgs,
          volumeCbm,
          vesselName
        }
      });
    }

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    console.error("Error saving job:", error);
    return NextResponse.json({ error: 'Failed to save job' }, { status: 500 });
  }
}
