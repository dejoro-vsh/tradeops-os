import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id; // Could be UUID or jobNumber depending on how n8n calls it.
    const body = await req.json();
    const { documents, extractedData, sourceDocType } = body;

    // Find the job either by UUID, jobNumber, or emailThreadId
    const job = await prisma.job.findFirst({
      where: {
        OR: [
          { id: jobId },
          { jobNumber: jobId },
          { emailThreadId: jobId }
        ]
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // 1. Save Documents
    if (documents && Array.isArray(documents)) {
      for (const doc of documents) {
        await prisma.document.create({
          data: {
            jobId: job.id,
            type: doc.type || 'Unknown',
            url: doc.url,
            status: 'PENDING_APPROVAL'
          }
        });
      }
    }

    // 2. Check Discrepancies and Update Job
    if (extractedData && typeof extractedData === 'object') {
      const jobUpdateData: any = {};
      const discrepanciesToCreate: any[] = [];
      const dynamicDataUpdate: any = typeof job.dynamicData === 'object' && job.dynamicData !== null ? { ...job.dynamicData } : {};

      for (const [key, newValue] of Object.entries(extractedData)) {
        if (newValue === null || newValue === undefined || newValue === '') continue;

        let oldValue: any = undefined;
        let isStandardField = false;

        // Check if it's a standard field on the Job model
        if (key in job) {
          oldValue = (job as any)[key];
          isStandardField = true;
        } else if (job.dynamicData && typeof job.dynamicData === 'object') {
          // Check in dynamicData
          oldValue = (job.dynamicData as any)[key];
        }

        // Convert values to string for easy comparison
        const oldStr = oldValue !== null && oldValue !== undefined ? String(oldValue).trim() : '';
        const newStr = String(newValue).trim();

        if (oldStr === '') {
          // If empty in DB, auto-fill it
          if (isStandardField) {
            // Need to handle type conversion for standard fields if necessary (e.g. weightKgs -> float)
            if (key === 'weightKgs' || key === 'volumeCbm') {
               jobUpdateData[key] = parseFloat(newStr);
            } else {
               jobUpdateData[key] = newStr;
            }
          } else {
            dynamicDataUpdate[key] = newStr;
          }
        } else if (oldStr !== newStr) {
          // If different, create a discrepancy alert
          discrepanciesToCreate.push({
            jobId: job.id,
            field: key,
            oldValue: oldStr,
            newValue: newStr,
            sourceDocType: sourceDocType || 'AI Extraction',
            status: 'UNRESOLVED'
          });
        }
      }

      // Perform updates
      const updatePayload: any = { ...jobUpdateData };
      if (Object.keys(dynamicDataUpdate).length > 0) {
         updatePayload.dynamicData = dynamicDataUpdate;
      }
      
      // Update status to DOCUMENTS_RECEIVED if not completed
      if (job.status !== 'DOCUMENTS_COMPLETED' && job.status !== 'CLOSED') {
         updatePayload.status = 'DOCUMENTS_RECEIVED';
      }

      if (Object.keys(updatePayload).length > 0) {
        await prisma.job.update({
          where: { id: job.id },
          data: updatePayload
        });
      }

      // Create discrepancies
      if (discrepanciesToCreate.length > 0) {
        await prisma.discrepancy.createMany({
          data: discrepanciesToCreate
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Documents and data processed successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error("Error processing documents:", error);
    return NextResponse.json({ error: 'Failed to process documents', details: error.message }, { status: 500 });
  }
}
