import React, { useState, useEffect } from 'react';
import { Network, AlertOctagon, ShieldAlert, Users, Radio, ArrowUpRight } from 'lucide-react';

export default function OracleSyndicate() {
  const [syndicateData, setSyndicateData] = useState(null);

  useEffect(() => {
    fetch('/api/syndicates')
      .then((res) => res.json())
      .then((data) => setSyndicateData(data))
      .catch((err) => console.error('Failed to load syndicates:', err));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(15, 23, 42, 0.8))',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(236, 72, 153, 0.2)',
              color: '#F472B6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Network size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#F8FAFC' }}>
                Oracle Syndicate Intelligence Graph
              </h3>
              <span
                className="status-pill escalated"
                style={{ fontSize: '0.7rem', padding: '2px 8px' }}
              >
                <Radio size={12} className="spin" />
                Active Surveillance
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Autonomous cross-dispute cluster detection isolating freight-forwarder fraud rings and card-testing syndicates.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Threat Level
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--rose-400)' }}>
              CRITICAL
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Intercepted Volume
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald-400)' }}>
              $20,210.00
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.25rem' }}>
        {syndicateData?.identified_clusters?.map((cluster) => (
          <div
            key={cluster.cluster_id}
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--paypal-cyan)',
                  }}
                >
                  {cluster.cluster_id}
                </span>
                <h4 style={{ fontSize: '1.05rem', marginTop: '2px' }}>{cluster.name}</h4>
              </div>
              <span
                className={`status-pill ${cluster.threat_level === 'CRITICAL' ? 'escalated' : 'pending'}`}
              >
                {cluster.threat_level} THREAT
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {cluster.pattern}
            </p>

            <div
              style={{
                background: 'var(--bg-primary)',
                borderRadius: '8px',
                padding: '0.75rem',
                border: '1px solid var(--border-subtle)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                fontSize: '0.75rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cluster.location}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Attack Velocity:</span>
                <div style={{ fontWeight: 600, color: 'var(--rose-400)' }}>
                  {cluster.total_attempts} Attempts
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>AI Confidence:</span>
                <div style={{ fontWeight: 600, color: 'var(--emerald-400)' }}>
                  {cluster.confidence_pct}% Match
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Linked Disputes: <strong>{cluster.disputes_involved.join(', ') || 'Correlated in Network Graph'}</strong>
              </span>
              <span style={{ color: 'var(--paypal-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                Rule Triggered: Auto-Dispute Evidence Packet
                <ArrowUpRight size={14} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
