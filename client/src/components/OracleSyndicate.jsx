import React, { useState, useEffect } from 'react';
import { ShieldAlert, Network, MapPin, AlertTriangle, CheckCircle2, ArrowUpRight, RefreshCw } from 'lucide-react';

const GRAPH_NODES = {
  hub: {
    id: 'hub',
    short: 'HUB-DE',
    label: 'Wilmington Forwarder Suite 105',
    subtitle: '2500 Matchett Rd, Wilmington, DE 19810',
    category: 'Freight forwarder',
    risk: 'High risk',
    badgeClass: 'danger',
    accent: '#C93B3B',
    bg: '#FEF2F2',
    x: 240,
    y: 145,
    description:
      'Commercial export warehouse shared across multiple high-value electronics orders. PayPal Seller Protection is typically voided when an order is re-shipped offshore from a freight forwarder.',
    fields: [
      { label: 'Classification', value: 'Freight forwarder hub' },
      { label: 'Street address', value: '2500 Matchett Rd, Suite 105, Wilmington, DE' },
      { label: 'Linked disputes', value: '12 orders ($14,890.00)' },
      { label: 'Recommended action', value: 'Hold shipment & require signature' },
    ],
  },
  proxy: {
    id: 'proxy',
    short: 'NET-TOR',
    label: 'Anonymized Checkout IP',
    subtitle: '185.220.101.47 (Exit Node)',
    category: 'Network signal',
    risk: 'Elevated',
    badgeClass: 'warning',
    accent: '#B76800',
    bg: '#FFFBEB',
    x: 85,
    y: 72,
    description:
      'Checkout session originated from a known public anonymizing proxy rather than a residential ISP near the billing address.',
    fields: [
      { label: 'Network type', value: 'Tor / commercial VPN exit' },
      { label: 'Distance to billing', value: '4,180 km (Mismatch)' },
      { label: 'Device fingerprint', value: 'Headless / randomized canvas' },
      { label: 'CE 3.0 eligibility', value: 'Not satisfied' },
    ],
  },
  buyer1: {
    id: 'buyer1',
    short: 'ACCT-01',
    label: 'Alexei P. (Disposable Email)',
    subtitle: 'Account created 48h prior',
    category: 'Buyer profile',
    risk: 'High risk',
    badgeClass: 'danger',
    accent: '#C93B3B',
    bg: '#FEF2F2',
    x: 85,
    y: 220,
    description:
      'Recently created buyer profile using a disposable domain and prepaid virtual card funded shortly before checkout.',
    fields: [
      { label: 'Account tenure', value: '2 days' },
      { label: 'Email domain', value: 'TempMail disposable provider' },
      { label: 'Shared phone / device', value: 'Matches 3 closed accounts' },
      { label: 'Recommended action', value: 'Auto-decline future reorders' },
    ],
  },
  order1: {
    id: 'order1',
    short: 'PP-D-88210',
    label: 'NVIDIA RTX 4070 Super ($899.00)',
    subtitle: 'Active queue dispute · INR',
    category: 'Linked dispute',
    risk: 'Active claim',
    badgeClass: 'info',
    accent: '#0B5FD6',
    bg: '#EFF6FF',
    x: 405,
    y: 76,
    description:
      'Active Item Not Received claim tied to the Wilmington freight forwarder. Carrier records confirm handoff to the commercial receiving dock.',
    fields: [
      { label: 'Dispute ID', value: 'PP-D-88210' },
      { label: 'Amount at risk', value: '$899.00 USD' },
      { label: 'Carrier status', value: 'Signed at receiving dock' },
      { label: 'Rebuttal strategy', value: 'Freight-forwarder exclusion' },
    ],
  },
  order2: {
    id: 'order2',
    short: 'INV-44912',
    label: 'Sony A7 IV Camera Kit ($2,410.00)',
    subtitle: 'Flagged pre-fulfillment hold',
    category: 'Prevented loss',
    risk: 'Held',
    badgeClass: 'success',
    accent: '#157F4D',
    bg: '#ECFDF5',
    x: 405,
    y: 214,
    description:
      'Subsequent order placed to the identical suite number caught before dispatch using shared address and device matching.',
    fields: [
      { label: 'Order ID', value: 'INV-44912' },
      { label: 'Order value', value: '$2,410.00 USD' },
      { label: 'Resolution', value: 'Shipment held prior to handoff' },
      { label: 'Loss avoided', value: '$2,425.00 (incl. dispute fee)' },
    ],
  },
};

const GRAPH_EDGES = [
  { from: 'proxy', to: 'hub', dashed: true, stroke: '#94A3B8' },
  { from: 'buyer1', to: 'hub', dashed: false, stroke: '#DC2626' },
  { from: 'hub', to: 'order1', dashed: false, stroke: '#0B5FD6' },
  { from: 'hub', to: 'order2', dashed: false, stroke: '#157F4D' },
];

export default function OracleSyndicate() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState('hub');

  const fetchSyndicates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/syndicates');
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || 'Unable to load cluster relationships.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyndicates();
  }, []);

  const clusters = data?.identified_clusters || [];
  const selectedNode = GRAPH_NODES[selectedNodeId] || GRAPH_NODES.hub;

  const totalBlockedVolume = clusters.reduce(
    (sum, cluster) => sum + parseFloat(String(cluster.blocked_volume_usd || '0').replace(/,/g, '')),
    0
  );
  const totalAttempts = clusters.reduce((sum, cluster) => sum + (cluster.total_attempts || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary Strip */}
      <div className="stat-strip" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <div className="stat">
          <div className="stat-label">Overall risk posture</div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px', marginBottom: '2px' }}>
            <span className="badge danger">{data?.active_threat_level || 'HIGH'} RISK</span>
          </div>
          <div className="stat-note">Cross-dispute address &amp; device match</div>
        </div>
        <div className="stat">
          <div className="stat-label">Active clusters</div>
          <div className="stat-value num">{clusters.length}</div>
          <div className="stat-note">Flagged buyer or hub networks</div>
        </div>
        <div className="stat">
          <div className="stat-label">Linked volume flagged</div>
          <div className="stat-value num">
            ${totalBlockedVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-note">Across {totalAttempts} linked order attempts</div>
        </div>
        <div className="stat">
          <div className="stat-label">Highest match confidence</div>
          <div className="stat-value num">
            {clusters.length ? `${Math.max(...clusters.map((c) => c.confidence_pct || 0))}%` : '—'}
          </div>
          <div className="stat-note">Commercial forwarder address match</div>
        </div>
      </div>

      {error && (
        <div className="error-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={fetchSyndicates}>
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      )}

      {/* Relationship Graph + Inspector */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Cluster relationship map</h3>
            <p className="stat-meta" style={{ marginTop: '2px' }}>
              Select any entity node to inspect shared addresses, network signals, and linked PayPal claims.
            </p>
          </div>
          <span className="badge info">
            <Network size={12} />
            5 linked entities
          </span>
        </div>

        <div className="panel-body">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.35fr) minmax(290px, 1fr)',
              gap: '20px',
              alignItems: 'stretch',
            }}
          >
            {/* Light SVG Relationship Graph */}
            <div
              style={{
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '320px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Primary cluster: SYN-DE-19810</span>
                <span>Click a node to inspect</span>
              </div>

              <svg
                viewBox="0 0 490 286"
                style={{ width: '100%', height: '245px', display: 'block' }}
                role="img"
                aria-label="Entity relationship graph showing proxy, buyer account, freight forwarder hub, and linked orders"
              >
                <defs>
                  <pattern id="light-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#E4E7EC" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="490" height="286" rx="8" fill="#FFFFFF" stroke="#E4E7EC" />
                <rect width="490" height="286" rx="8" fill="url(#light-grid)" />

                {/* Edges */}
                {GRAPH_EDGES.map((edge) => {
                  const fromNode = GRAPH_NODES[edge.from];
                  const toNode = GRAPH_NODES[edge.to];
                  const isActive = selectedNodeId === edge.from || selectedNodeId === edge.to;
                  return (
                    <line
                      key={`${edge.from}-${edge.to}`}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={isActive ? edge.stroke : '#CBD5E1'}
                      strokeWidth={isActive ? 2.4 : 1.6}
                      strokeDasharray={edge.dashed ? '5 4' : undefined}
                    />
                  );
                })}

                {/* Nodes */}
                {Object.values(GRAPH_NODES).map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const r = node.id === 'hub' ? 28 : 22;
                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      style={{ cursor: 'pointer' }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Inspect ${node.label}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedNodeId(node.id);
                        }
                      }}
                    >
                      {isSelected && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={r + 7}
                          fill="none"
                          stroke={node.accent}
                          strokeWidth="2"
                          strokeOpacity="0.35"
                        />
                      )}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={r}
                        fill={isSelected ? node.bg : '#FFFFFF'}
                        stroke={node.accent}
                        strokeWidth={isSelected ? 2.6 : 1.8}
                      />
                      <text
                        x={node.x}
                        y={node.y + 4}
                        textAnchor="middle"
                        fill="#0E1726"
                        fontSize={node.id === 'hub' ? '10.5' : '9.5'}
                        fontWeight="700"
                        fontFamily="Geist Mono, ui-monospace, monospace"
                      >
                        {node.short}
                      </text>
                      <text
                        x={node.x}
                        y={node.y + r + 15}
                        textAnchor="middle"
                        fill="#1E293B"
                        fontSize="10.5"
                        fontWeight={isSelected ? '600' : '500'}
                      >
                        {node.id === 'hub'
                          ? 'Wilmington Suite 105'
                          : node.id === 'proxy'
                          ? 'Tor Exit Node'
                          : node.id === 'buyer1'
                          ? 'Alexei P. (TempMail)'
                          : node.id === 'order1'
                          ? 'RTX 4070 ($899)'
                          : 'Sony A7 IV ($2.4k)'}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '14px',
                  marginTop: '10px',
                  fontSize: '11.5px',
                  color: 'var(--text-secondary)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C93B3B' }} /> High-risk node
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#B76800' }} /> Network signal
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0B5FD6' }} /> Open dispute
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#157F4D' }} /> Held pre-shipment
                </span>
              </div>
            </div>

            {/* Right-hand Node Inspector */}
            <div
              className="evidence-box"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#FFFFFF',
                margin: 0,
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px',
                  }}
                >
                  <span className="stat-label">{selectedNode.category}</span>
                  <span className={`badge ${selectedNode.badgeClass}`}>{selectedNode.risk}</span>
                </div>

                <h4
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    margin: '0 0 4px 0',
                  }}
                >
                  {selectedNode.label}
                </h4>
                <p
                  className="num"
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    margin: '0 0 12px 0',
                  }}
                >
                  {selectedNode.subtitle}
                </p>

                <p
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.55,
                    color: 'var(--text-secondary)',
                    margin: '0 0 16px 0',
                  }}
                >
                  {selectedNode.description}
                </p>

                <dl className="kv" style={{ background: 'var(--surface-sunken)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  {selectedNode.fields.map((f) => (
                    <React.Fragment key={f.label}>
                      <dt>{f.label}</dt>
                      <dd className="num">{f.value}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              </div>

              <div
                style={{
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}
              >
                <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                <span>Shared entity evidence attached to eligible claim responses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Identified Clusters Breakdown */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Identified address &amp; network clusters</h3>
            <p className="stat-meta" style={{ marginTop: '2px' }}>
              Active groups flagged across incoming orders and dispute filings.
            </p>
          </div>
        </div>

        <div className="panel-body">
          {loading ? (
            <div className="empty-state">Loading cluster analysis...</div>
          ) : clusters.length === 0 ? (
            <div className="empty-state">No multi-dispute clusters detected in the current batch.</div>
          ) : (
            <div className="evidence-cards-grid">
              {clusters.map((cluster) => {
                const isCritical = cluster.threat_level === 'CRITICAL';
                return (
                  <div key={cluster.cluster_id} className="evidence-box" style={{ background: '#FFFFFF' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px',
                        marginBottom: '10px',
                      }}
                    >
                      <div>
                        <div className="num" style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {cluster.cluster_id}
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: '2px 0 0 0' }}>
                          {cluster.name}
                        </h4>
                      </div>
                      <span className={`badge ${isCritical ? 'danger' : 'warning'}`}>
                        {isCritical ? <ShieldAlert size={12} /> : <AlertTriangle size={12} />}
                        {cluster.threat_level}
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: '0 0 14px 0' }}>
                      {cluster.pattern}
                    </p>

                    <dl className="kv" style={{ marginBottom: '12px' }}>
                      <dt>Cluster location</dt>
                      <dd style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                        <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                        {cluster.location}
                      </dd>
                      <dt>Linked volume</dt>
                      <dd className="num">${cluster.blocked_volume_usd} USD</dd>
                      <dt>Order attempts</dt>
                      <dd className="num">{cluster.total_attempts}</dd>
                      <dt>Match confidence</dt>
                      <dd className="num">{cluster.confidence_pct}%</dd>
                    </dl>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '10px',
                        borderTop: '1px solid var(--border-subtle)',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span>
                        Disputes:{' '}
                        <strong className="num" style={{ color: 'var(--ink)' }}>
                          {cluster.disputes_involved?.length ? cluster.disputes_involved.join(', ') : 'Pre-dispute monitoring'}
                        </strong>
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', fontWeight: 500 }}>
                        Included in defense packets
                        <ArrowUpRight size={13} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
