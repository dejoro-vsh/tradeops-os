'use client';

import { useEffect, useState } from 'react';

type Job = {
  id: string;
  jobNumber: string;
  agentEmail: string;
  status: string;
  vesselName: string | null;
  shipperName: string | null;
};

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setJobs(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    // Optimistic UI update
    setJobs(jobs.map(job => job.id === id ? { ...job, status: newStatus } : job));
    
    await fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          TradeOps OS
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Intelligent Freight Management System</p>
      </header>

      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>Active Jobs</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          {loading ? (
            <p style={{ color: '#94a3b8' }}>Loading jobs from Neon Database...</p>
          ) : jobs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
              <p style={{ color: '#94a3b8', margin: 0 }}>No active jobs found in the database.</p>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>Waiting for n8n to send Pre-advise emails...</p>
            </div>
          ) : jobs.map(job => (
            <div key={job.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `4px solid ${job.status === 'NEW' ? '#3b82f6' : job.status === 'PENDING_VESSEL' ? '#f59e0b' : '#10b981'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>{job.jobNumber}</strong>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Agent: {job.agentEmail} | Status: <span style={{ color: '#fff' }}>{job.status}</span></span>
                {job.vesselName && <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>Vessel: {job.vesselName}</span>}
              </div>
              
              {job.status === 'NEW' && (
                <button onClick={() => updateStatus(job.id, 'PENDING_VESSEL')} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Approve (Send Emails)
                </button>
              )}
              
              {job.status === 'PENDING_VESSEL' && (
                <button onClick={() => updateStatus(job.id, 'ACKNOWLEDGED')} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Acknowledge Vessel
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
