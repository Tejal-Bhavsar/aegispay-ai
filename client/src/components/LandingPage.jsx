import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  Copy,
  Check,
  Play,
  Menu,
  X,
} from 'lucide-react';
import '../landing.css';

const FALLBACK_CASES = [
  {
    dispute_id: 'PP-D-94821',
    dispute_reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
    dispute_amount: { currency_code: 'USD', value: '489.00' },
    transaction_details: {
      item_title: 'Sony WH-1000XM5 Wireless Headphones',
      order_id: 'ORD-94821',
    },
    buyer_info: { name: 'Marcus J. Reynolds' },
    carrier_tracking_key: 'FEDEX-94821038',
    seller_protection: {
      eligible: true,
      protection_reason: 'Delivered with GPS fix and direct buyer signature prior to claim.',
    },
    ai_state: {
      defense_confidence: 97,
      recommended_action: 'FIGHT_DISPUTE',
    },
  },
  {
    dispute_id: 'PP-D-88210',
    dispute_reason: 'UNAUTHORIZED',
    dispute_amount: { currency_code: 'USD', value: '899.00' },
    transaction_details: {
      item_title: 'NVIDIA GeForce RTX 4080 Super 16GB',
      order_id: 'ORD-88210',
    },
    buyer_info: { name: 'Alexei V. Petrenko' },
    carrier_tracking_key: 'DHL-88210941',
    seller_protection: {
      eligible: true,
      protection_reason: 'Shipped to verified PayPal suite; freight-forwarder cluster flagged.',
    },
    ai_state: {
      defense_confidence: 91,
      recommended_action: 'ESCALATE_FRAUD_RING',
    },
  },
  {
    dispute_id: 'PP-D-44102',
    dispute_reason: 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED',
    dispute_amount: { currency_code: 'USD', value: '340.00' },
    transaction_details: {
      item_title: 'Refurbished Apple iPad Air (5th Gen)',
      order_id: 'ORD-19044',
    },
    buyer_info: { name: 'David K. Miller' },
    carrier_tracking_key: 'USPS-19044812',
    seller_protection: {
      eligible: false,
      protection_reason: 'SNAD claims fall outside automated Seller Protection; partial goodwill avoids chargeback fee.',
    },
    ai_state: {
      defense_confidence: 60,
      recommended_action: 'SETTLE_GOODWILL',
    },
  },
];

const WORKFLOW_MODES = {
  INR: {
    label: 'Item not received',
    steps: [
      {
        num: '01',
        title: 'Deadline & risk triage',
        detail: 'Sorts claims by PayPal response deadline and flags amounts >= $750 that require direct signature.',
      },
      {
        num: '02',
        title: 'Carrier & GPS audit',
        detail: 'Matches FedEx/UPS/USPS tracking numbers, delivery scan timestamp, and dropoff GPS coordinates.',
      },
      {
        num: '03',
        title: 'Seller Protection check',
        detail: 'Verifies shipping address match against the PayPal transaction record before drafting a rebuttal.',
      },
      {
        num: '04',
        title: 'Submit PayPal packet',
        detail: 'Formats a PROOF_OF_DELIVERY payload and submits directly to PayPal Disputes API v1.',
      },
    ],
  },
  UNAUTHORIZED: {
    label: 'Unauthorized payment',
    steps: [
      {
        num: '01',
        title: 'Account velocity check',
        detail: 'Flags disposable emails, new buyer accounts, and anonymized proxy/VPN sessions at checkout.',
      },
      {
        num: '02',
        title: 'Address ring clustering',
        detail: 'Groups orders shipping to shared commercial freight-forwarder suites across open disputes.',
      },
      {
        num: '03',
        title: 'CE 3.0 & address match',
        detail: 'Compiles checkout IP proximity, 2FA/biometric logs, and commercial receiving-dock signatures.',
      },
      {
        num: '04',
        title: 'Escalate & quarantine',
        detail: 'Attaches cluster evidence to PayPal and marks the forwarder address for pre-shipment holds.',
      },
    ],
  },
  SNAD: {
    label: 'Not as described',
    steps: [
      {
        num: '01',
        title: 'Buyer LTV & claim read',
        detail: 'Reviews customer order history, prior disputes, and condition notes filed with the claim.',
      },
      {
        num: '02',
        title: 'Coverage verification',
        detail: 'Flags that SNAD claims are generally excluded from PayPal automated Seller Protection.',
      },
      {
        num: '03',
        title: 'Fee-vs-refund check',
        detail: 'Compares your goodwill ceiling ($45 default) against full item loss plus the $15 dispute fee.',
      },
      {
        num: '04',
        title: 'Draft retention offer',
        detail: 'Prepares a diplomatic partial credit or prepaid return note instead of an unwinnable contest.',
      },
    ],
  },
};

const API_EXAMPLES = {
  curl: `curl -X POST http://localhost:5001/api/ai/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "disputeCase": {
      "dispute_id": "PP-D-94821",
      "dispute_reason": "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      "dispute_amount": "489.00",
      "carrier": "FEDEX",
      "tracking_number": "948210389102381",
      "delivery_status": "DELIVERED",
      "signed_by": "M. REYNOLDS"
    }
  }'`,
  node: `const response = await fetch('http://localhost:5001/api/ai/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    disputeCase: {
      dispute_id: 'PP-D-94821',
      dispute_reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
      dispute_amount: '489.00',
      carrier: 'FEDEX',
      tracking_number: '948210389102381',
      delivery_status: 'DELIVERED',
      signed_by: 'M. REYNOLDS',
    },
  }),
});
const { result } = await response.json();
// result.verdict === "FIGHT_DISPUTE"
// result.paypal_rest_payload -> ready for PayPal provide-evidence`,
};

const FAQ_ITEMS = [
  {
    q: 'Do I need live PayPal Sandbox credentials to test AegisPay?',
    a: 'No. AegisPay starts in built-in PayPal Sandbox simulation mode with realistic INR, Unauthorized, and SNAD disputes preloaded. When you are ready to hit api-m.sandbox.paypal.com directly, add your Client ID and Client Secret under PayPal settings.',
  },
  {
    q: 'Can I inspect and edit rebuttal letters before sending to PayPal?',
    a: 'Yes. Every dispute opens in a Packet drawer or Case review workbench where you can switch framing (Compliance, Diplomatic retention, or Forwarder escalation), copy or print the letter, and choose when to submit.',
  },
  {
    q: 'What happens if I do not configure a Gemini or OpenAI API key?',
    a: 'If no external LLM key is provided, AegisPay runs its built-in deterministic adjudication engine in server/src/aiEngine.js so every analysis, Seller Protection check, and PayPal payload still completes consistently.',
  },
  {
    q: 'Why does AegisPay sometimes recommend a goodwill refund?',
    a: 'Significantly Not As Described claims and un-signed deliveries over $750 rarely qualify for PayPal Seller Protection. In those cases, a small partial refund or prepaid return saves the $15 dispute fee and preserves repeat buyer relationships.',
  },
];

function shortReason(reason) {
  if (reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED') return 'Item not received';
  if (reason === 'UNAUTHORIZED') return 'Unauthorized';
  if (reason === 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED') return 'Not as described';
  return 'Dispute';
}

export default function LandingPage({
  disputes = [],
  onEnterConsole,
  onSimulateAndEnter,
  onOpenSettings,
}) {
  const previewCases = disputes.length >= 3 ? disputes.slice(0, 3) : FALLBACK_CASES;
  const [selectedCaseId, setSelectedCaseId] = useState(previewCases[0].dispute_id);
  const [workflowTab, setWorkflowTab] = useState('INR');
  const [apiLang, setApiLang] = useState('curl');
  const [copiedApi, setCopiedApi] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedCase =
    previewCases.find((d) => d.dispute_id === selectedCaseId) || previewCases[0];
  const workflow = WORKFLOW_MODES[workflowTab];

  const handleCopyApi = async () => {
    try {
      await navigator.clipboard.writeText(API_EXAMPLES[apiLang]);
      setCopiedApi(true);
      setTimeout(() => setCopiedApi(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="lp-root" id="top">
      {/* Top Navigation */}
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <a href="#top" className="lp-brand">
            <span className="lp-brand-mark">
              <Shield size={16} strokeWidth={2.2} />
            </span>
            <span className="lp-brand-name">AegisPay</span>
          </a>

          <nav className="lp-nav-links" aria-label="Landing navigation">
            <a href="#workflow">Workflow</a>
            <a href="#capabilities">Capabilities</a>
            <a href="#api">API</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="lp-nav-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm lp-nav-desktop-only"
              onClick={() => onEnterConsole('AI_HUB')}
            >
              Case review
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onEnterConsole('OPERATIONS')}
            >
              Open dispute desk
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              className="icon-btn lp-mobile-toggle"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            style={{
              background: '#FFFFFF',
              borderBottom: '1px solid var(--line)',
              padding: '12px 20px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <a href="#workflow" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
              Workflow
            </a>
            <a href="#capabilities" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
              Capabilities
            </a>
            <a href="#api" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
              API
            </a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
              FAQ
            </a>
          </div>
        )}
      </header>

      <main>
        {/* Screen 1: Hero */}
        <section className="lp-hero">
          <div className="lp-wrap lp-hero-grid">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="lp-eyebrow">PayPal Seller Protection · Disputes API v1</div>
              <h1 className="lp-h1">PayPal dispute defense for online merchants</h1>
              <p className="lp-lead">
                AegisPay checks carrier GPS scans, checkout network signals, and PayPal Seller Protection rules—then drafts and submits your evidence packet.
              </p>

              <div className="lp-cta-row">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => onEnterConsole('OPERATIONS')}
                >
                  Open dispute desk
                  <ArrowRight size={15} />
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={() => onEnterConsole('AI_HUB')}
                >
                  <Play size={14} />
                  Try a live case
                </button>
              </div>

              <div className="lp-hero-facts">
                <span className="lp-hero-fact">
                  <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
                  Verifies $750+ signature rules
                </span>
                <span className="lp-hero-fact">
                  <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
                  Groups freight-forwarder clusters
                </span>
                <span className="lp-hero-fact">
                  <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
                  Runs with or without an LLM key
                </span>
              </div>
            </motion.div>

            {/* Interactive Product Preview */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="lp-app-frame"
            >
              <div className="lp-frame-bar">
                <div className="lp-frame-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="num" style={{ fontWeight: 600 }}>
                  AegisPay · Live Sandbox Queue ({previewCases.length})
                </span>
                <span className="badge info">Interactive</span>
              </div>

              <div className="lp-frame-body">
                <div className="lp-case-list" role="listbox" aria-label="Sample PayPal disputes">
                  {previewCases.map((item) => {
                    const active = item.dispute_id === selectedCase.dispute_id;
                    const eligible = Boolean(item.seller_protection?.eligible);
                    return (
                      <button
                        key={item.dispute_id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`lp-case-row ${active ? 'active' : ''}`}
                        onClick={() => setSelectedCaseId(item.dispute_id)}
                      >
                        <span className="num" style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--ink)' }}>
                          {item.dispute_id}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: 'var(--ink)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.transaction_details?.item_title}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--ink-2)' }}>
                            {shortReason(item.dispute_reason)} ·{' '}
                            <span className="num">${parseFloat(item.dispute_amount?.value || 0).toFixed(2)}</span>
                          </div>
                        </div>
                        <span className={`seller-protection-badge lp-case-row-badge ${eligible ? 'eligible' : 'ineligible'}`}>
                          {eligible ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                          {eligible ? 'Protected' : 'Goodwill'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Live Selected Case Inspector inside Hero */}
                <div className="lp-case-inspector">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <div>
                      <span className="stat-label">Selected case recommendation</span>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>
                        {selectedCase.ai_state?.recommended_action === 'SETTLE_GOODWILL'
                          ? 'Offer goodwill settlement ($40 credit)'
                          : selectedCase.ai_state?.recommended_action === 'ESCALATE_FRAUD_RING'
                          ? 'Submit freight-forwarder cluster packet'
                          : 'Contest claim with Seller Protection proof'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="stat-label">Confidence</span>
                      <div className="num" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent)' }}>
                        {selectedCase.ai_state?.defense_confidence ?? 95}%
                      </div>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'var(--ink-2)' }}>
                    {selectedCase.seller_protection?.protection_reason}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
                    <span className="num" style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
                      Tracking: {selectedCase.carrier_tracking_key}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEnterConsole('OPERATIONS')}
                    >
                      Inspect full queue
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Screen 2: How a claim is verified */}
        <section className="lp-section" id="workflow">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <div>
                <h2 className="lp-h2">How a claim is verified</h2>
                <p className="lp-sub">
                  Pick a PayPal dispute category to see the exact sequence of checks AegisPay runs before submitting evidence.
                </p>
              </div>

              <div className="filter-chips-group" role="tablist" aria-label="Dispute category walkthrough">
                {Object.entries(WORKFLOW_MODES).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={workflowTab === key}
                    className={`filter-chip ${workflowTab === key ? 'active' : ''}`}
                    onClick={() => setWorkflowTab(key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="lp-steps-grid">
              {workflow.steps.map((step) => (
                <div key={step.num} className="lp-step-card">
                  <span className="lp-step-num">{step.num}</span>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--ink)' }}>
                    {step.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.55, color: 'var(--ink-2)' }}>
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Screen 3: Core Merchant Capabilities */}
        <section className="lp-section lp-section--white" id="capabilities">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <div>
                <h2 className="lp-h2">Built for dispute operations</h2>
                <p className="lp-sub">
                  Each view in the merchant workspace focuses on one part of claim resolution—no hidden prompts or cluttered charts.
                </p>
              </div>
            </div>

            <div className="lp-cap-grid">
              {/* Card 1: Carrier & Signature */}
              <div className="lp-cap-card">
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>
                    Carrier telemetry &amp; $750 signature checks
                  </h3>
                  <p style={{ margin: 0, fontSize: '14.5px', lineHeight: 1.55, color: 'var(--ink-2)' }}>
                    Matches delivery scans, GPS dropoff fixes, and signature confirmation against PayPal Seller Protection requirements.
                  </p>
                </div>

                <div className="lp-cap-visual">
                  <dl className="kv">
                    <dt>Tracking number</dt>
                    <dd className="num">FEDEX-94821038</dd>
                    <dt>GPS dropoff fix</dt>
                    <dd className="num" style={{ color: 'var(--accent)' }}>30.2672 N, 97.7431 W</dd>
                    <dt>Recipient signature</dt>
                    <dd className="num" style={{ color: 'var(--success)' }}>M. REYNOLDS (Verified)</dd>
                  </dl>
                </div>

                <div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEnterConsole('FORENSICS')}
                  >
                    Open Delivery evidence
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Card 2: Freight forwarder cluster detection */}
              <div className="lp-cap-card">
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>
                    Freight-forwarder ring clustering
                  </h3>
                  <p style={{ margin: 0, fontSize: '14.5px', lineHeight: 1.55, color: 'var(--ink-2)' }}>
                    Spots repeat high-risk suites, disposable email domains, and anonymized checkout proxies across separate claims.
                  </p>
                </div>

                <div className="lp-cap-visual" style={{ padding: '10px' }}>
                  <svg viewBox="0 0 380 120" style={{ width: '100%', height: '108px', display: 'block' }} aria-label="Cluster diagram preview">
                    <line x1="65" y1="30" x2="190" y2="60" stroke="#94A3B8" strokeWidth="1.6" strokeDasharray="4 3" />
                    <line x1="65" y1="90" x2="190" y2="60" stroke="#DC2626" strokeWidth="1.8" />
                    <line x1="190" y1="60" x2="315" y2="30" stroke="#0B5FD6" strokeWidth="1.8" />
                    <line x1="190" y1="60" x2="315" y2="90" stroke="#157F4D" strokeWidth="1.8" />
                    <circle cx="65" cy="30" r="16" fill="#FFFBEB" stroke="#B76800" strokeWidth="1.6" />
                    <text x="65" y="34" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#0E1726" fontFamily="Geist Mono, monospace">TOR</text>
                    <circle cx="65" cy="90" r="16" fill="#FEF2F2" stroke="#C93B3B" strokeWidth="1.6" />
                    <text x="65" y="94" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#0E1726" fontFamily="Geist Mono, monospace">ACCT</text>
                    <circle cx="190" cy="60" r="22" fill="#FEF2F2" stroke="#C93B3B" strokeWidth="2" />
                    <text x="190" y="64" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0E1726" fontFamily="Geist Mono, monospace">SUITE 105</text>
                    <circle cx="315" cy="30" r="16" fill="#EFF6FF" stroke="#0B5FD6" strokeWidth="1.6" />
                    <text x="315" y="34" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0E1726" fontFamily="Geist Mono, monospace">$899</text>
                    <circle cx="315" cy="90" r="16" fill="#ECFDF5" stroke="#157F4D" strokeWidth="1.6" />
                    <text x="315" y="94" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0E1726" fontFamily="Geist Mono, monospace">HELD</text>
                  </svg>
                </div>

                <div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEnterConsole('SYNDICATE')}
                  >
                    Open Fraud rings
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Card 3: Underwriting & Goodwill Rules */}
              <div className="lp-cap-card">
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>
                    Configurable automation &amp; goodwill limits
                  </h3>
                  <p style={{ margin: 0, fontSize: '14.5px', lineHeight: 1.55, color: 'var(--ink-2)' }}>
                    Set your auto-submission confidence threshold and goodwill ceiling, and see right away which open claims qualify.
                  </p>
                </div>

                <div className="lp-cap-visual">
                  <dl className="kv">
                    <dt>Auto-submit threshold</dt>
                    <dd className="num" style={{ color: 'var(--accent)' }}>88% confidence</dd>
                    <dt>Goodwill settlement cap</dt>
                    <dd className="num">$45 USD (SNAD / VIP)</dd>
                    <dt>Forwarder quarantine</dt>
                    <dd style={{ color: 'var(--success)', fontWeight: 600 }}>Enabled</dd>
                  </dl>
                </div>

                <div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEnterConsole('POLICY')}
                  >
                    Configure Rules
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Card 4: Direct PayPal Disputes API Payload */}
              <div className="lp-cap-card">
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>
                    Editable rebuttals &amp; PayPal API packets
                  </h3>
                  <p style={{ margin: 0, fontSize: '14.5px', lineHeight: 1.55, color: 'var(--ink-2)' }}>
                    Generates structured PayPal evidence JSON and plain-English merchant letters you can copy, print, or transmit.
                  </p>
                </div>

                <div className="lp-cap-visual">
                  <div className="num" style={{ fontSize: '12px', color: 'var(--ink)', lineHeight: 1.6 }}>
                    <div><span style={{ color: 'var(--accent)', fontWeight: 600 }}>POST</span> /v1/customer/disputes/PP-D-94821/provide-evidence</div>
                    <div style={{ color: 'var(--ink-2)' }}>evidence_type: &quot;PROOF_OF_DELIVERY&quot; · carrier: &quot;FEDEX&quot;</div>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEnterConsole('AI_HUB')}
                  >
                    Open Case review
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Screen 4: Navy Developer API Band */}
        <section className="lp-section lp-section--navy" id="api">
          <div className="lp-wrap lp-api-grid">
            <div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '14px',
                }}
              >
                REST API &amp; PayPal Sandbox
              </div>
              <h2 className="lp-h2">Send any order payload, get a verdict and packet back</h2>
              <p className="lp-sub" style={{ marginBottom: '24px' }}>
                Hook your checkout or fulfillment webhook to <code className="num">/api/ai/analyze</code> to evaluate Seller Protection coverage and return formatted PayPal evidence JSON.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onEnterConsole('INTEGRATION')}
                >
                  Open Developer API console
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onOpenSettings}
                >
                  Configure PayPal Sandbox
                </button>
              </div>
            </div>

            <div className="lp-code-panel">
              <div className="lp-code-head">
                <div className="lp-code-tabs" role="tablist" aria-label="API snippet language">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={apiLang === 'curl'}
                    className={`lp-code-tab ${apiLang === 'curl' ? 'active' : ''}`}
                    onClick={() => setApiLang('curl')}
                  >
                    cURL
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={apiLang === 'node'}
                    className={`lp-code-tab ${apiLang === 'node' ? 'active' : ''}`}
                    onClick={() => setApiLang('node')}
                  >
                    Node.js
                  </button>
                </div>

                <button
                  type="button"
                  className="lp-code-tab"
                  onClick={handleCopyApi}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#FFFFFF' }}
                >
                  {copiedApi ? <Check size={13} /> : <Copy size={13} />}
                  {copiedApi ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="lp-code-pre">{API_EXAMPLES[apiLang]}</pre>
            </div>
          </div>
        </section>

        {/* Screen 5: FAQ & Direct Launch Close */}
        <section className="lp-section" id="faq">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <div>
                <h2 className="lp-h2">Frequently asked questions</h2>
                <p className="lp-sub">
                  Practical details on sandbox credentials, evidence review, and AI provider fallback.
                </p>
              </div>
            </div>

            <div className="lp-faq-list">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={item.q} className="lp-faq-item">
                    <button
                      type="button"
                      className="lp-faq-trigger"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        size={17}
                        style={{
                          flexShrink: 0,
                          color: 'var(--ink-3)',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 160ms var(--ease)',
                        }}
                      />
                    </button>
                    {isOpen && <div className="lp-faq-answer">{item.a}</div>}
                  </div>
                );
              })}
            </div>

            <div className="lp-close-card">
              <div>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>
                  Inspect the live PayPal dispute desk
                </h2>
                <p style={{ margin: 0, fontSize: '15px', color: 'var(--ink-2)' }}>
                  Open the queue directly or generate a fresh simulated PayPal claim to watch the review flow end-to-end.
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onSimulateAndEnter}
                >
                  Simulate new dispute
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onEnterConsole('OPERATIONS')}
                >
                  Open dispute desk
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="lp-brand-mark" style={{ width: 28, height: 28 }}>
              <Shield size={14} strokeWidth={2.2} />
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>AegisPay</span>
            <span style={{ fontSize: '13px', color: 'var(--ink-3)' }}>
              PayPal Seller Protection &amp; Dispute Workbench
            </span>
          </div>

          <div className="lp-footer-links">
            <button type="button" className="lp-footer-link" onClick={() => onEnterConsole('OPERATIONS')}>
              Disputes
            </button>
            <button type="button" className="lp-footer-link" onClick={() => onEnterConsole('AI_HUB')}>
              Case review
            </button>
            <button type="button" className="lp-footer-link" onClick={() => onEnterConsole('SYNDICATE')}>
              Fraud rings
            </button>
            <button type="button" className="lp-footer-link" onClick={() => onEnterConsole('FORENSICS')}>
              Delivery evidence
            </button>
            <button type="button" className="lp-footer-link" onClick={() => onEnterConsole('POLICY')}>
              Rules
            </button>
            <button type="button" className="lp-footer-link" onClick={() => onEnterConsole('INTEGRATION')}>
              Developer API
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

