export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          TradeOps OS
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Intelligent Freight Management System</p>
      </header>

      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>Active Jobs (Pre-advise)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          {/* Mock Job Item */}
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '4px solid #3b82f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '1.1rem' }}>JOB-2026-001</strong>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Agent: WAH HOO SHIPPING</span>
            </div>
            <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Approve
            </button>
          </div>
          
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '4px solid #f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '1.1rem' }}>JOB-2026-002</strong>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Waiting for Vessel Info</span>
            </div>
            <button style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Acknowledge
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
