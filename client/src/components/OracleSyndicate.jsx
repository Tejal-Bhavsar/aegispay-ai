import React, { useState, useEffect } from 'react';
import { Network, AlertOctagon, ShieldAlert, Users, Radio, ArrowUpRight, Cpu, Globe, MapPin, Eye } from 'lucide-react';

export default function OracleSyndicate() {
  const [syndicateData, setSyndicateData] = useState(null);
  const [selectedNode, setSelectedNode] = useState('hub');

  useEffect(() => {
    fetch('/api/syndicates')
      .then((res) => res.json())
      .then((data) => setSyndicateData(data))
      .catch((err) => console.error('Failed to load syndicates:', err));
  }, []);

  const nodeDetails = {
    hub: {
      title: 'Delaware Commercial Re-Shipper Hub',
      type: 'FREIGHT_FORWARDER_HOTSPOT',
      address: '3500 Silverside Rd, Suite 105, Wilmington DE 19810',
      description: 'High-risk commercial drop location used by international syndicates to export fraudulently purchased consumer tech.',
      threat: 'CRITICAL',
    },
    proxy: {
      title: 'Frankfurt Datacenter Tor Exit Node',
      type: 'ANONYMIZING_PROXY',
      ip: '185.220.101.5 (M247 Ltd)',
      description: 'Datacenter IP proxy used to mask buyer physical origin. Located 6,420 km away from Delaware delivery destination.',
      threat: 'SEVERE',
    },
    buyer1: {
      title: 'Synthetic Identity: Alexei P.',
      type: 'BOT_BUYER_IDENTITY',
      email: 'user_x9401@tempmail-box.cc',
      description: 'Account registered 2 days ago. 4 dispute chargebacks filed across 3 merchant storefronts within 48 hours.',
      threat: 'HIGH',
    },
    order1: {
      title: 'Disputed Transaction: PP-D-88210',
      type: 'MERCHANT_ORDER',
      item: 'NVIDIA RTX 4080 Super GPU ($899.00)',
      description: 'Autonomous multi-agent swarm intercepted dispute, verified delivery to re-shipper, and protected merchant funds.',
      threat: 'DEFENDED',
    },
  };

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

      {/* Interactive Fraud Ring Network Topology Graph */}
      <div
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Interactive Cluster Topology // Syndicate SYN-DE-19810
            </span>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              Click any node to inspect relationship telemetry
            </span>
          </div>

          {/* SVG Visual Graph */}
          <div
            style={{
              background: '#060A13',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              height: '320px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 600 320">
              <defs>
                <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EC4899" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Connecting Lines */}
              <line x1="300" y1="160" x2="120" y2="80" stroke="#F43F5E" strokeWidth="2" strokeDasharray="4" />
              <line x1="300" y1="160" x2="120" y2="240" stroke="#EC4899" strokeWidth="2" />
              <line x1="300" y1="160" x2="480" y2="90" stroke="#00CFDE" strokeWidth="2" />
              <line x1="300" y1="160" x2="480" y2="230" stroke="#10B981" strokeWidth="2" />

              {/* Central Hub Node (Delaware Re-Shipper) */}
              <g onClick={() => setSelectedNode('hub')} style={{ cursor: 'pointer' }}>
                <circle cx="300" cy="160" r="32" fill="#F43F5E" fillOpacity="0.25" stroke="#F43F5E" strokeWidth="2.5" />
                <circle cx="300" cy="160" r="22" fill="#F43F5E" />
                <text x="300" y="164" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">HUB DE</text>
                <text x="300" y="205" fill="#FDA4AF" fontSize="11" fontWeight="600" textAnchor="middle">Re-Shipper Drop</text>
              </g>

              {/* Node: Proxy (Frankfurt) */}
              <g onClick={() => setSelectedNode('proxy')} style={{ cursor: 'pointer' }}>
                <circle cx="120" cy="80" r="22" fill="#EC4899" fillOpacity="0.2" stroke="#EC4899" strokeWidth="2" />
                <circle cx="120" cy="80" r="14" fill="#EC4899" />
                <text x="120" y="84" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">PROXY</text>
                <text x="120" y="115" fill="#F472B6" fontSize="11" textAnchor="middle">Tor Exit Node</text>
              </g>

              {/* Node: Synthetic Buyer 1 */}
              <g onClick={() => setSelectedNode('buyer1')} style={{ cursor: 'pointer' }}>
                <circle cx="120" cy="240" r="22" fill="#8B5CF6" fillOpacity="0.2" stroke="#8B5CF6" strokeWidth="2" />
                <circle cx="120" cy="240" r="14" fill="#8B5CF6" />
                <text x="120" y="244" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">BOT</text>
                <text x="120" y="275" fill="#C4B5FD" fontSize="11" textAnchor="middle">Alexei P. (TempMail)</text>
              </g>

              {/* Node: Disputed Order 1 */}
              <g onClick={() => setSelectedNode('order1')} style={{ cursor: 'pointer' }}>
                <circle cx="480" cy="90" r="22" fill="#00CFDE" fillOpacity="0.2" stroke="#00CFDE" strokeWidth="2" />
                <circle cx="480" cy="90" r="14" fill="#00CFDE" />
                <text x="480" y="94" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">GPU</text>
                <text x="480" y="125" fill="#67E8F9" fontSize="11" textAnchor="middle">PP-D-88210 ($899)</text>
              </g>

              {/* Node: Disputed Order 2 */}
              <g onClick={() => setSelectedNode('order1')} style={{ cursor: 'pointer' }}>
                <circle cx="480" cy="230" r="22" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2" />
                <circle cx="480" cy="230" r="14" fill="#10B981" />
                <text x="480" y="234" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">CAM</text>
                <text x="480" y="265" fill="#6EE7B7" fontSize="11" textAnchor="middle">Sony A7 IV ($2.4k)</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Selected Node Telemetry Drawer */}
        <div
          style={{
            background: 'var(--bg-primary)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Selected Graph Node
              </span>
              <span className="status-pill defended" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                {nodeDetails[selectedNode].threat}
              </span>
            </div>

            <h4 style={{ fontSize: '1rem', marginTop: '6px', color: '#FFFFFF' }}>
              {nodeDetails[selectedNode].title}
            </h4>

            <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
              {nodeDetails[selectedNode].description}
            </p>

            <div style={{ background: '#070C18', padding: '0.75rem', borderRadius: '8px', marginTop: '1rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><strong>Type:</strong> <code>{nodeDetails[selectedNode].type}</code></div>
              {nodeDetails[selectedNode].address && <div><strong>Address:</strong> {nodeDetails[selectedNode].address}</div>}
              {nodeDetails[selectedNode].ip && <div><strong>IP Host:</strong> {nodeDetails[selectedNode].ip}</div>}
              {nodeDetails[selectedNode].email && <div><strong>Email:</strong> {nodeDetails[selectedNode].email}</div>}
              {nodeDetails[selectedNode].item && <div><strong>Claim Item:</strong> {nodeDetails[selectedNode].item}</div>}
            </div>
          </div>

          <div style={{ fontSize: '0.725rem', color: 'var(--paypal-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={13} />
            <span>Under Continuous Autonomous Tracking</span>
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
