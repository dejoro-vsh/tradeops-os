'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Document = {
  id: string;
  type: string;
  version: number;
  url: string;
  status: string;
  createdAt: string;
};

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
  podCharge: string | null;
  ofps: string | null;
  note: string | null;
  dynamicData: any;
  emailThreadId: string | null;
  recipientEmail: string | null;
  documents: Document[];
};

const ALL_FIELDS = [
  { key: 'pol', label: 'POL' },
  { key: 'pod', label: 'POD' },
  { key: 'etd', label: 'ETD' },
  { key: 'eta', label: 'ETA' },
  { key: 'readyTime', label: 'Ready Time' },
  { key: 'cutOff', label: 'Cut Off' },
  { key: 'carrier', label: 'Carrier' },
  { key: 'shipperName', label: 'Shipper' },
  { key: 'consigneeName', label: 'Consignee' },
  { key: 'commodity', label: 'Commodity' },
  { key: 'volumeRaw', label: 'Volume' },
  { key: 'weightKgs', label: 'Weight (KGS)' },
  { key: 'volumeCbm', label: 'CBM' },
  { key: 'podCharge', label: 'POD Charge' },
  { key: 'ofps', label: 'O/F+P/S' },
  { key: 'note', label: 'Agent Note' },
];

const renderDynamicValue = (val: any): React.ReactNode => {
  if (val === null || val === undefined || val === '') return '-';
  if (Array.isArray(val)) {
    return (
      <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', color: '#94a3b8' }}>
        {val.map((item, idx) => (
          <li key={idx}>{renderDynamicValue(item)}</li>
        ))}
      </ul>
    );
  }
  if (typeof val === 'object') {
    return (
      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {Object.entries(val).map(([k, v]) => (
          <div key={k} style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.9rem' }}>
            <strong style={{ color: '#cbd5e1', textTransform: 'capitalize', display: 'block', marginBottom: '4px' }}>
              {k.replace(/([A-Z])/g, ' $1').trim()}:
            </strong>
            <span style={{ color: '#94a3b8', display: 'block', wordBreak: 'break-word' }}>
              {renderDynamicValue(v)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return <span style={{ wordBreak: 'break-word', color: '#94a3b8', whiteSpace: 'pre-wrap' }}>{String(val)}</span>;
};

export default function JobDetails({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Job>>({});
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const router = useRouter();

  const fetchJob = () => {
    fetch(`/api/jobs/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setJob(data);
          setEditForm(data);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJob();
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

  const handleSaveEdit = async () => {
    if (!job) return;
    setJob({ ...job, ...editForm } as Job);
    setIsEditing(false);
    await fetch(`/api/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });
  };

  const openEmailModal = () => {
    if (!job) return;
    const nonEmptyFields = ALL_FIELDS
      .filter(f => (job as any)[f.key] !== null && (job as any)[f.key] !== undefined && (job as any)[f.key] !== '')
      .map(f => f.key);
    setSelectedFields(nonEmptyFields);
    setIsEmailModalOpen(true);
  };

  const sendEmail = async () => {
    if (!job) return;
    setIsEmailModalOpen(false);
    
    if (job.status === 'NEW') {
      setJob({ ...job, status: 'PENDING_VESSEL' });
    }
    
    await fetch(`/api/jobs/${job.id}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedFields })
    });
    router.push('/');
  };

  const Field = ({ label, fieldKey, type = 'text' }: { label: string, fieldKey: keyof Job, type?: string }) => {
    let inputValue = (editForm[fieldKey] as any) || '';
    if (type === 'datetime-local' && inputValue) {
      const d = new Date(inputValue);
      if (!isNaN(d.getTime())) {
        const pad = (n: number) => n.toString().padStart(2, '0');
        inputValue = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
    }

    return (
      <div style={{ margin: 0, display: 'flex', alignItems: type === 'textarea' ? 'flex-start' : 'center', gap: '8px' }}>
        <strong style={{ minWidth: '110px', marginTop: type === 'textarea' ? '8px' : '0' }}>{label}:</strong>
        {isEditing ? (
          type === 'textarea' ? (
            <textarea 
              value={inputValue} 
              onChange={(e) => setEditForm({...editForm, [fieldKey]: e.target.value})}
              style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #475569', background: '#1e293b', color: 'white', flex: 1, minWidth: 0, width: '100%', minHeight: '80px', fontFamily: 'inherit' }}
            />
          ) : (
            <input 
              type={type} 
              value={inputValue} 
              onChange={(e) => {
                const val = type === 'number' ? (e.target.value ? Number(e.target.value) : null) : e.target.value;
                setEditForm({...editForm, [fieldKey]: val});
              }}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #475569', background: '#1e293b', color: 'white', flex: 1, colorScheme: 'dark', minWidth: 0, width: '100%' }}
            />
          )
        ) : (
          <span style={{ color: '#94a3b8', whiteSpace: type === 'textarea' ? 'pre-wrap' : 'normal' }}>{job![fieldKey] !== null && job![fieldKey] !== '' ? String(job![fieldKey]) : '-'}</span>
        )}
      </div>
    );
  };

  const approveDocument = async (docId: string) => {
    await fetch(`/api/documents/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED' })
    });
    fetchJob(); // Refresh the list
  };

  if (loading) return <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}><p style={{ color: '#94a3b8' }}>Loading Details...</p></main>;
  if (!job) return <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}><p style={{ color: '#ef4444' }}>Job not found</p></main>;

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '1.2rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
          ← Back
        </Link>
        <h1 style={{ fontSize: '2rem', margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {job.jobNumber}
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} style={{ background: '#475569', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}>✎ Edit</button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSaveEdit} style={{ background: '#10b981', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}>Save</button>
              <button onClick={() => { setIsEditing(false); setEditForm(job); }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}>Cancel</button>
            </div>
          )}
        </h1>

        <span style={{ marginLeft: 'auto', background: job.status === 'NEW' ? '#3b82f6' : job.status === 'PENDING_VESSEL' ? '#f59e0b' : '#10b981', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
          {job.status}
        </span>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <section className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: '#3b82f6' }}>Routing & Dates</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
            <Field label="POL" fieldKey="pol" />
            <Field label="POD" fieldKey="pod" />
            <Field label="ETD" fieldKey="etd" type="datetime-local" />
            <Field label="ETA" fieldKey="eta" type="datetime-local" />
            <Field label="Ready Time" fieldKey="readyTime" type="datetime-local" />
            <Field label="Cut Off" fieldKey="cutOff" type="datetime-local" />
            <Field label="Carrier" fieldKey="carrier" />
          </div>
        </section>

        <section className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: '#3b82f6' }}>Cargo & Parties</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
            <Field label="Shipper" fieldKey="shipperName" />
            <Field label="Consignee" fieldKey="consigneeName" />
            <Field label="Commodity" fieldKey="commodity" />
            <Field label="Volume" fieldKey="volumeRaw" />
            <Field label="Weight (KGS)" fieldKey="weightKgs" type="number" />
            <Field label="CBM" fieldKey="volumeCbm" type="number" />
            <Field label="Agent Email" fieldKey="agentEmail" />
          </div>
        </section>
        
        <section className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
          <h2 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: '#f59e0b' }}>Charges & Costing</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
            <Field label="POD Charge" fieldKey="podCharge" />
            <Field label="O/F+P/S" fieldKey="ofps" />
          </div>
        </section>

        {job.dynamicData && Object.keys(job.dynamicData).length > 0 && (
          <section className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
            <h2 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: '#c084fc' }}>Additional Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
              {Object.entries(job.dynamicData).map(([key, value]) => (
                <div key={key} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '3px solid #c084fc' }}>
                  <strong style={{ color: '#fff', textTransform: 'capitalize', display: 'block', marginBottom: '8px', fontSize: '1.1rem' }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </strong>
                  {renderDynamicValue(value)}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
          <h2 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: '#ec4899' }}>Notes & Remarks</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
            <Field label="Agent Note" fieldKey="note" type="textarea" />
          </div>
        </section>

        <section className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
          <h2 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: '#10b981' }}>Document Center</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {!job.documents || job.documents.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No documents uploaded yet.</p>
            ) : (
              job.documents.map((doc) => (
                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `4px solid ${doc.status === 'APPROVED' ? '#10b981' : '#f59e0b'}` }}>
                  <div>
                    <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{doc.type}</strong>
                    <span style={{ marginLeft: '8px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>v{doc.version}</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                      Status: <span style={{ color: doc.status === 'APPROVED' ? '#10b981' : '#f59e0b' }}>{doc.status}</span> | Uploaded: {new Date(doc.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid #3b82f6', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      📄 View PDF
                    </a>
                    {doc.status === 'PENDING_APPROVAL' && (
                      <button onClick={() => approveDocument(doc.id)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        {job.status === 'NEW' && (
          <button onClick={openEmailModal} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
            Approve Pre-advise & Send Emails
          </button>
        )}
        
        {job.status === 'PENDING_VESSEL' && (
          <button onClick={() => updateStatus('ACKNOWLEDGED')} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
            Acknowledge Vessel Info
          </button>
        )}
      </div>

      {isEmailModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#3b82f6' }}>Select Information to Send</h2>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Check the boxes for the fields you want to include in the confirmation email to the agent. All fields are checked by default.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {ALL_FIELDS.filter(f => (job as any)[f.key] !== null && (job as any)[f.key] !== undefined && (job as any)[f.key] !== '').map(f => (
                <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedFields.includes(f.key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFields([...selectedFields, f.key]);
                      } else {
                        setSelectedFields(selectedFields.filter(k => k !== f.key));
                      }
                    }}
                    style={{ width: '1.2rem', height: '1.2rem', accentColor: '#3b82f6', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{f.label}</strong>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                      {String((job as any)[f.key])}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
              <button onClick={() => setIsEmailModalOpen(false)} style={{ background: '#475569', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}>Cancel</button>
              <button onClick={sendEmail} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>Confirm & Send</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
