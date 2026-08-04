'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Job = {
  id: string;
  jobNumber: string;
  agentEmail: string;
  status: string;
  pol: string | null;
  pod: string | null;
  eta: string | null;
  etd: string | null;
  readyTime: string | null;
  cutOff: string | null;
  shipperName: string | null;
  consigneeName: string | null;
  commodity: string | null;
  carrier: string | null;
  volumeRaw: string | null;
  weightKgs: number | null;
  volumeCbm: number | null;
  podCharge: string | null;
  ofps: string | null;
  attachmentUrl: string | null;
};

export default function JobDetails({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/jobs/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setJob(data);
        }
        setLoading(false);
      });
  }, [params.id]);

  const updateStatus = async (newStatus: string) => {
    if (!job) return;
    setJob({ ...job, status: newStatus });
    await fetch(`/api/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    router.push('/');
  };

  if (loading) return <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}><p style={{ color: '#94a3b8' }}>Loading Details...</p></main>;
  if (!job) return <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}><p style={{ color: '#ef4444' }}>Job not found</p></main>;

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '1.2rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
          ← Back
        </Link>
        <h1 style={{ fontSize: '2rem', margin: 0, color: '#f8fafc' }}>
          {job.jobNumber}
        </h1>
        
        {job.attachmentUrl && (
          <a href={job.attachmentUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid #3b82f6', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📄 View Original PDF
          </a>
        )}

        <span style={{ marginLeft: 'auto', background: job.status === 'NEW' ? '#3b82f6' : job.status === 'PENDING_VESSEL' ? '#f59e0b' : '#10b981', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
          {job.status}
        </span>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <section className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: '#3b82f6' }}>Routing & Dates</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
            <p style={{ margin: 0 }}><strong>POL:</strong> <span style={{ color: '#94a3b8' }}>{job.pol || '-'}</span></p>
            <p style={{ margin: 0 }}><strong>POD:</strong> <span style={{ color: '#94a3b8' }}>{job.pod || '-'}</span></p>
            <p style={{ margin: 0 }}><strong>ETD:</strong> <span style={{ color: '#94a3b8' }}>{job.etd || '-'}</span></p>
            <p style={{ margin: 0 }}><strong>ETA:</strong> <span style={{ color: '#94a3b8' }}>{job.eta || '-'}</span></p>
            <p style={{ margin: 0 }}><strong>Ready Time:</strong> <span style={{ color: '#94a3b8' }}>{job.readyTime || '-'}</span></p>
            <p style={{ margin: 0 }}><strong>Cut Off:</strong> <span style={{ color: '#94a3b8' }}>{job.cutOff || '-'}</span></p>
            <p style={{ margin: 0 }}><strong>Carrier:</strong> <span style={{ color: '#94a3b8' }}>{job.carrier || '-'}</span></p>
          </div>
        </section>

        <section className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: '#3b82f6' }}>Cargo & Parties</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
            <p style={{ margin: 0 }}><strong>Shipper:</strong> <span style={{ color: '#94a3b8' }}>{job.shipperName || '-'}</span></p>
            <p style={{ margin: 0 }}><strong>Consignee:</strong> <span style={{ color: '#94a3b8' }}>{job.consigneeName || '-'}</span></p>
            <p style={{ margin: 0 }}><strong>Commodity:</strong> <span style={{ color: '#94a3b8' }}>{job.commodity || '-'}</span></p>
            <p style={{ margin: 0 }}><strong>Volume:</strong> <span style={{ color: '#94a3b8' }}>{job.volumeRaw || '-'}</span></p>
            <p style={{ margin: 0 }}><strong>Weight:</strong> <span style={{ color: '#94a3b8' }}>{job.weightKgs ? `${job.weightKgs} KGS` : '-'}</span></p>
            <p style={{ margin: 0 }}><strong>CBM:</strong> <span style={{ color: '#94a3b8' }}>{job.volumeCbm || '-'}</span></p>
            <p style={{ margin: 0 }}><strong>Agent Email:</strong> <span style={{ color: '#94a3b8' }}>{job.agentEmail}</span></p>
          </div>
        </section>
        
        <section className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
          <h2 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: '#f59e0b' }}>Charges & Costing</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
            <p style={{ margin: 0 }}><strong>POD Charge:</strong> <span style={{ color: '#94a3b8' }}>{job.podCharge || '-'}</span></p>
            <p style={{ margin: 0 }}><strong>O/F+P/S:</strong> <span style={{ color: '#94a3b8' }}>{job.ofps || '-'}</span></p>
          </div>
        </section>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        {job.status === 'NEW' && (
          <button onClick={() => updateStatus('PENDING_VESSEL')} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
            Approve Pre-advise & Send Emails
          </button>
        )}
        
        {job.status === 'PENDING_VESSEL' && (
          <button onClick={() => updateStatus('ACKNOWLEDGED')} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
            Acknowledge Vessel Info
          </button>
        )}
      </div>
    </main>
  );
}
