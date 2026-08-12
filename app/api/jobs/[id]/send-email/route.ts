import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FIELD_LABELS: Record<string, string> = {
  pol: 'POL',
  pod: 'POD',
  etd: 'ETD',
  eta: 'ETA',
  readyTime: 'Ready Time',
  cutOff: 'Cut Off',
  carrier: 'Carrier',
  shipperName: 'Shipper',
  consigneeName: 'Consignee',
  commodity: 'Commodity',
  volumeRaw: 'Volume',
  weightKgs: 'Weight (KGS)',
  volumeCbm: 'CBM',
  podCharge: 'POD Charge',
  ofps: 'O/F+P/S',
  note: 'Agent Note',
};

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { selectedFields } = body;

    const job = await prisma.job.findUnique({
      where: { id: params.id }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Build the message body based on selected fields (Plain Text format)
    let messageBody = "Please review the confirmed details for this shipment:\n\n";
    
    for (const field of selectedFields) {
      let label = FIELD_LABELS[field];
      if (!label) {
        // Fallback for dynamic fields: convert camelCase to Title Case
        label = field.replace(/([A-Z])/g, ' $1').trim();
        label = label.charAt(0).toUpperCase() + label.slice(1);
      }
      
      let value = (job as any)[field];
      // Check in dynamicData if not a standard field or if standard field is empty (null)
      if ((value === null || value === undefined) && job.dynamicData && typeof job.dynamicData === 'object') {
        value = (job.dynamicData as any)[field];
      }
      
      if (value !== null && value !== undefined && value !== '') {
        // If the value is an object/array, stringify it cleanly
        if (typeof value === 'object') {
          messageBody += `• ${label}:\n  ${JSON.stringify(value, null, 2).replace(/\n/g, '\n  ')}\n`;
        } else {
          messageBody += `• ${label}: ${value}\n`;
        }
      }
    }

    // Update job status to PENDING_VESSEL if it was NEW
    if (job.status === 'NEW') {
      await prisma.job.update({
        where: { id: params.id },
        data: { status: 'PENDING_VESSEL' }
      });
    }

    // Call n8n Webhook
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobNumber: job.jobNumber,
            agentEmail: job.agentEmail,
            recipientEmail: job.recipientEmail,
            emailThreadId: job.emailThreadId,
            messageBody: messageBody
          })
        });
        console.log('Successfully called n8n webhook for job:', job.jobNumber);
      } catch (webhookError) {
        console.error('Error calling n8n webhook:', webhookError);
        // We don't fail the request here, just log the error
      }
    } else {
      console.warn('N8N_WEBHOOK_URL is not set. Email will not be sent via n8n.');
    }

    return NextResponse.json({ success: true, message: 'Email sent and status updated' });
  } catch (error: any) {
    console.error('Error in send-email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
