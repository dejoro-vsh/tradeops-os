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
    const { 
      jobNumber, agentEmail, status, emailThreadId, 
      shipperName, consigneeName, pol, pod, 
      readyTime, cutOff, etd, eta, 
      commodity, carrier, volumeRaw, 
      weightKgs, volumeCbm, podCharge, ofps,
      dynamicData
    } = body;

    if (!jobNumber) {
      return NextResponse.json({ error: 'jobNumber is required' }, { status: 400 });
    }

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
          agentEmail: agentEmail || existingJob.agentEmail,
          shipperName: shipperName || existingJob.shipperName,
          consigneeName: consigneeName || existingJob.consigneeName,
          pol: pol || existingJob.pol,
          pod: pod || existingJob.pod,
          readyTime: readyTime || existingJob.readyTime,
          cutOff: cutOff || existingJob.cutOff,
          etd: etd || existingJob.etd,
          eta: eta || existingJob.eta,
          commodity: commodity || existingJob.commodity,
          carrier: carrier || existingJob.carrier,
          volumeRaw: volumeRaw || existingJob.volumeRaw,
          weightKgs: weightKgs !== undefined ? (typeof weightKgs === 'string' ? parseFloat(weightKgs) : weightKgs) : existingJob.weightKgs,
          volumeCbm: volumeCbm !== undefined ? (typeof volumeCbm === 'string' ? parseFloat(volumeCbm) : volumeCbm) : existingJob.volumeCbm,
          podCharge: podCharge || existingJob.podCharge,
          ofps: ofps || existingJob.ofps,
          dynamicData: dynamicData !== undefined ? dynamicData : existingJob.dynamicData,
        }
      });
    } else {
      job = await prisma.job.create({
        data: {
          jobNumber,
          agentEmail: agentEmail || '',
          status: status || 'NEW',
          emailThreadId,
          shipperName,
          consigneeName,
          pol,
          pod,
          readyTime,
          cutOff,
          etd,
          eta,
          commodity,
          carrier,
          volumeRaw,
          weightKgs: weightKgs !== undefined && weightKgs !== null ? (typeof weightKgs === 'string' ? parseFloat(weightKgs) : weightKgs) : null,
          volumeCbm: volumeCbm !== undefined && volumeCbm !== null ? (typeof volumeCbm === 'string' ? parseFloat(volumeCbm) : volumeCbm) : null,
          podCharge,
          ofps,
          dynamicData
        }
      });
    }

    return NextResponse.json(job, { status: 200 });
  } catch (error: any) {
    console.error("Error saving job:", error);
    return NextResponse.json({ error: 'Failed to save job', details: error.message }, { status: 500 });
  }
}
