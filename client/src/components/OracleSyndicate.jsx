import React, { useState, useEffect } from 'react';
import {
  Network,
  ShieldAlert,
  ArrowUpRight,
  Stamp,
  MapPin,
  Globe,
} from 'lucide-react';

export default function OracleSyndicate({ onSelectDisputeById }) {
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
      code: 'NODE-DE-19810',
      title: 'Delaware Commercial Re-Shipper Hub',
      type: 'FREIGHT_FORWARDER_HOTSPOT',
      address: '3500 Silverside Rd, Suite 105, Wilmington DE 19810',
      description:
        'Commercial transshipment drop address correlated across multiple unauthorized chargeback claims. DHL scanner logged bulk consignee receipt (BOX_AGENT_DE).',
      threat: 'CRITICAL',
      linkedCase: 'PP-D-88210',
    },
    proxy: {
      code: 'NODE-TOR-185',
      title: 'Frankfurt Datacenter Exit Node',
      type: 'ANONYMIZING_PROXY_HOST',
      ip: '185.220.101.5 (M247 Ltd Hosting, Hesse DE)',
      description:
        'Non-residential datacenter exit node located 6,420.0 km from the Wilmington, DE shipping destination. Checkout completed in 4 seconds via HeadlessChrome.',
      threat: 'SEVERE',
      linkedCase: 'PP-D-88210',
    },
    buyer1: {
      code: 'NODE-ID-999401',
      title: 'Synthetic Consignee: Alexei V. Petrenko',
      type: 'HIGH_VELOCITY_ACCOUNT',
      email: 'user_x9401@tempmail-box.cc (PP-ACT-999401)',
      description:
        'Account tenure: 2 days at time of purchase. 4 prior chargeback disputes filed across merchant network within 48 hours.',
      threat: 'HIGH',
      linkedCase: 'PP-D-88210',
    },
    order1: {
      code: 'CASE-PP-D-88210',
      title: 'Disputed Order: ORD-88210 ($899.00)',
      type: 'CHARGEBACK_CASE_FILE',
      item: 'NVIDIA GeForce RTX 4080 Super 16GB GPU (DHL #DHL8821094100)',
      description:
        'Delivered 2026-10-25T16:48:22Z with GPS accuracy ±1.5m and signed by BOX_AGENT_DE. Eligible for PayPal Seller Protection.',
      threat: 'EVIDENCE SEALED',
      linkedCase: 'PP-D-88210',
    },
  };

  const active = nodeDetails[selectedNode] || nodeDetails.hub;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Institutional Header */}
      <div className="paper-panel">
        <div className="paper-panel-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                Oracle Cross-Dispute Fraud Ring &amp; Freight-Forwarder Topology
              </h3>
              <span className="status-pill escalated">ACTIVE CLUSTER: SYN-DE-19810</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '2px' }}>
              Entity-relationship link analysis isolating commercial re-shipper drops, Tor exit nodes, and synthetic buyer accounts.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div>
              <span className="form-label">Correlated Queue Case</span>
              <div className="mono" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--crimson)' }}>
                PP-D-88210 ($899.00)
              </div>
            </div>
            {onSelectDisputeById && (
              <button
                className="btn btn-primary"
                onClick={() => onSelectDisputeById('PP-D-88210')}
              >
                <span>Inspect PP-D-88210 in Queue</span>
                <ArrowUpRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Link-Analysis Canvas + Node Exhibit Inspector */}
      <div
        className="paper-panel"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          overflow: 'hidden',
        }}
      >
        {/* Left: Technical Link-Analysis Diagram */}
        <div style={{ padding: '16px', borderRight: '1px solid var(--hairline)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span className="form-label">
              LINK TOPOLOGY // CLUSTER SYN-DE-19810 (WILMINGTON, DE TRANSIT DROP)
            </span>
            <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
              Select any entity node to inspect forensic attributes
            </span>
          </div>

          <div
            style={{
              backgroundColor: '#FAF9F5',
              backgroundImage:
                'linear-gradient(#E6E4DD 1px, transparent 1px), linear-gradient(90deg, #E6E4DD 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              borderRadius: '4px',
              border: '1px solid var(--hairline)',
              height: '330px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 640 330">
              {/* Directed Link Edges */}
              <line
                x1="320"
                y1="165"
                x2="135"
                y2="85"
                stroke="#B3261E"
                strokeWidth="2"
                strokeDasharray="5,4"
              />
              <line x1="320" y1="165" x2="135" y2="245" stroke="#8A5A00" strokeWidth="2" />
              <line x1="320" y1="165" x2="505" y2="95" stroke="#005EA6" strokeWidth="2" />
              <line x1="320" y1="165" x2="505" y2="240" stroke="#166534" strokeWidth="2" />

              {/* Edge Distance / Link Annotations */}
              <rect x="180" y="105" width="90" height="18" rx="3" fill="#FFFFFF" stroke="#D8D6CE" />
              <text x="225" y="117" fill="#B3261E" fontSize="9.5" fontFamily="Geist Mono, monospace" fontWeight="600" textAnchor="middle">
                6,420 km ΔIP
              </text>

              <rect x="372" y="112" width="88" height="18" rx="3" fill="#FFFFFF" stroke="#D8D6CE" />
              <text x="416" y="124" fill="#005EA6" fontSize="9.5" fontFamily="Geist Mono, monospace" fontWeight="600" textAnchor="middle">
                DHL #8821094
              </text>

              {/* Central Hub Node: Wilmington DE Re-Shipper */}
              <g onClick={() => setSelectedNode('hub')} style={{ cursor: 'pointer' }}>
                <rect
                  x="245"
                  y="135"
                  width="150"
                  height="60"
                  rx="5"
                  fill={selectedNode === 'hub' ? '#FDF2F2' : '#FFFFFF'}
                  stroke="#B3261E"
                  strokeWidth={selectedNode === 'hub' ? '2.5' : '1.5'}
                />
                <text x="320" y="155" fill="#B3261E" fontSize="10" fontFamily="Geist Mono, monospace" fontWeight="700" textAnchor="middle">
                  DROP HUB: DE 19810
                </text>
                <text x="320" y="172" fill="#111827" fontSize="11" fontWeight="600" textAnchor="middle">
                  3500 Silverside Suite 105
                </text>
                <text x="320" y="186" fill="#6B7280" fontSize="9.5" fontFamily="Geist Mono, monospace" textAnchor="middle">
                  SIGNATORY: BOX_AGENT_DE
                </text>
              </g>

              {/* Node: Proxy (Frankfurt) */}
              <g onClick={() => setSelectedNode('proxy')} style={{ cursor: 'pointer' }}>
                <rect
                  x="55"
                  y="55"
                  width="160"
                  height="54"
                  rx="5"
                  fill={selectedNode === 'proxy' ? '#FDF2F2' : '#FFFFFF'}
                  stroke="#B3261E"
                  strokeWidth={selectedNode === 'proxy' ? '2.5' : '1.5'}
                />
                <text x="135" y="74" fill="#B3261E" fontSize="9.5" fontFamily="Geist Mono, monospace" fontWeight="700" textAnchor="middle">
                  TOR / DATACENTER IP
                </text>
                <text x="135" y="90" fill="#111827" fontSize="11" fontFamily="Geist Mono, monospace" fontWeight="600" textAnchor="middle">
                  185.220.101.5 (DE)
                </text>
                <text x="135" y="102" fill="#6B7280" fontSize="9" textAnchor="middle">
                  M247 Hosting &bull; 4s Checkout
                </text>
              </g>

              {/* Node: Synthetic Buyer */}
              <g onClick={() => setSelectedNode('buyer1')} style={{ cursor: 'pointer' }}>
                <rect
                  x="55"
                  y="218"
                  width="160"
                  height="54"
                  rx="5"
                  fill={selectedNode === 'buyer1' ? '#FBF6E9' : '#FFFFFF'}
                  stroke="#8A5A00"
                  strokeWidth={selectedNode === 'buyer1' ? '2.5' : '1.5'}
                />
                <text x="135" y="237" fill="#8A5A00" fontSize="9.5" fontFamily="Geist Mono, monospace" fontWeight="700" textAnchor="middle">
                  BUYER ACCOUNT (2d OLD)
                </text>
                <text x="135" y="253" fill="#111827" fontSize="11" fontWeight="600" textAnchor="middle">
                  Alexei V. Petrenko
                </text>
                <text x="135" y="265" fill="#6B7280" fontSize="9" fontFamily="Geist Mono, monospace" textAnchor="middle">
                  4 Prior Disputes
                </text>
              </g>

              {/* Node: Disputed Order PP-D-88210 */}
              <g onClick={() => setSelectedNode('order1')} style={{ cursor: 'pointer' }}>
                <rect
                  x="430"
                  y="65"
                  width="155"
                  height="54"
                  rx="5"
                  fill={selectedNode === 'order1' ? '#EBF4FF' : '#FFFFFF'}
                  stroke="#005EA6"
                  strokeWidth={selectedNode === 'order1' ? '2.5' : '1.5'}
                />
                <text x="507" y="84" fill="#005EA6" fontSize="9.5" fontFamily="Geist Mono, monospace" fontWeight="700" textAnchor="middle">
                  DISPUTE PP-D-88210
                </text>
                <text x="507" y="100" fill="#111827" fontSize="11" fontWeight="600" textAnchor="middle">
                  RTX 4080 Super ($899)
                </text>
                <text x="507" y="112" fill="#166534" fontSize="9" fontFamily="Geist Mono, monospace" textAnchor="middle">
                  GPS ±1.5m Verified
                </text>
              </g>

              {/* Node: Correlated Historical Shipment */}
              <g onClick={() => setSelectedNode('hub')} style={{ cursor: 'pointer' }}>
                <rect
                  x="430"
                  y="212"
                  width="155"
                  height="54"
                  rx="5"
                  fill="#FFFFFF"
                  stroke="#166534"
                  strokeWidth="1.5"
                />
                <text x="507" y="231" fill="#166534" fontSize="9.5" fontFamily="Geist Mono, monospace" fontWeight="700" textAnchor="middle">
                  LINKED DROP PATTERN
                </text>
                <text x="507" y="247" fill="#111827" fontSize="11" fontWeight="600" textAnchor="middle">
                  12 Commercial Drop Scans
                </text>
                <text x="507" y="259" fill="#6B7280" fontSize="9" fontFamily="Geist Mono, monospace" textAnchor="middle">
                  Suite 105 Consignee Match
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Right: Selected Node Forensic Exhibit Drawer */}
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--paper-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="exhibit-tag">
                <Stamp size={11} />
                {active.code}
              </span>
              <span className="status-pill escalated">{active.threat}</span>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink-primary)' }}>
              {active.title}
            </h4>

            <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
              {active.description}
            </p>

            <div className="kv-ledger">
              <div className="kv-row">
                <span className="kv-key">Classification</span>
                <span className="kv-val mono">{active.type}</span>
              </div>
              {active.address && (
                <div className="kv-row">
                  <span className="kv-key">Drop Street</span>
                  <span className="kv-val">{active.address}</span>
                </div>
              )}
              {active.ip && (
                <div className="kv-row">
                  <span className="kv-key">Exit Host</span>
                  <span className="kv-val mono">{active.ip}</span>
                </div>
              )}
              {active.email && (
                <div className="kv-row">
                  <span className="kv-key">Account ID</span>
                  <span className="kv-val mono">{active.email}</span>
                </div>
              )}
              {active.item && (
                <div className="kv-row">
                  <span className="kv-key">Fulfilled SKU</span>
                  <span className="kv-val">{active.item}</span>
                </div>
              )}
              <div className="kv-row">
                <span className="kv-key">Linked Dispute</span>
                <span className="kv-val mono" style={{ color: 'var(--paypal-blue)' }}>
                  {active.linkedCase}
                </span>
              </div>
            </div>
          </div>

          <div className="exhibit-card">
            <div className="exhibit-stamp-title">ORACLE ADJUDICATION DIRECTIVE</div>
            <div style={{ fontSize: '11.5px', color: 'var(--ink-primary)' }}>
              Append freight-forwarder transshipment proof to PayPal rebuttal packet under Seller Protection Policy.
            </div>
          </div>
        </div>
      </div>

      {/* Identified Syndicate Clusters from /api/syndicates */}
      <div className="evidence-cards-grid">
        {syndicateData?.identified_clusters?.map((cluster) => (
          <div key={cluster.cluster_id} className="evidence-box">
            <div className="evidence-box-title">
              <span className="mono" style={{ color: 'var(--paypal-blue)' }}>
                {cluster.cluster_id} &bull; {cluster.name}
              </span>
              <span
                className={`status-pill ${
                  cluster.threat_level === 'CRITICAL' ? 'escalated' : 'pending'
                }`}
              >
                {cluster.threat_level}
              </span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
              {cluster.pattern}
            </p>

            <div className="kv-ledger">
              <div className="kv-row">
                <span className="kv-key">Hotspot Jurisdiction</span>
                <span className="kv-val">{cluster.location}</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Correlated Attempts</span>
                <span className="kv-val mono" style={{ color: 'var(--crimson)' }}>
                  {cluster.total_attempts} Shipments
                </span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Cluster Match Confidence</span>
                <span className="kv-val mono" style={{ color: 'var(--forest)' }}>
                  {cluster.confidence_pct}%
                </span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Queue Cases Linked</span>
                <span className="kv-val mono">
                  {cluster.disputes_involved?.length
                    ? cluster.disputes_involved.join(', ')
                    : 'Historical Reference'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
