import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Send,
  Copy,
  Check,
  Printer,
  Key,
  Bot,
  Scale,
  Search,
  HeartHandshake,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Play,
  Network,
  Terminal,
  Stamp,
} from 'lucide-react';

const PRESET_SCENARIOS = {
  SCENARIO_INR: {
    id: 'PP-D-94821',
    dispute_reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
    dispute_amount: '489.00',
    currency: 'USD',
    buyer_name: 'Marcus Reynolds',
    buyer_email: 'm.reynolds742@gmail.com',
    buyer_claim_notes:
      'I checked my mailbox and front porch, but the package was never delivered. I want a full refund.',
    order_id: 'ORD-94821',
    item_title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    item_price: '489.00',
    carrier: 'FedEx Ground',
    tracking_number: '948210389102381',
    delivery_status: 'DELIVERED',
    delivery_timestamp: '2026-11-04T14:32:18Z',
    signed_by: 'M. REYNOLDS (Direct Signature)',
    delivery_location: 'Front Door / Covered Porch',
    shipping_address: '742 Evergreen Terrace, Austin, TX 78701',
    gps_coordinates: '30.2672 N, 97.7431 W (Accuracy: 2.4m)',
    checkout_ip: '70.112.44.89',
    ip_city: 'Austin, TX',
    ip_distance_km: '4.2',
    auth_method: 'PayPal One-Touch Biometric',
    customer_lifetime_spend: '1420.00',
  },
  SCENARIO_UNAUTHORIZED: {
    id: 'PP-D-38192',
    dispute_reason: 'UNAUTHORIZED',
    dispute_amount: '1250.00',
    currency: 'USD',
    buyer_name: 'Claire Vance',
    buyer_email: 'claire.vance@techcorp.io',
    buyer_claim_notes:
      'I did not recognize this transaction on my card statement. Someone must have stolen my card information.',
    order_id: 'ORD-38192',
    item_title: 'MacBook Pro 14" M3 Pro 18GB/512GB Space Black',
    item_price: '1250.00',
    carrier: 'UPS 2nd Day Air',
    tracking_number: '1Z9999999999999999',
    delivery_status: 'DELIVERED',
    delivery_timestamp: '2026-10-29T11:15:40Z',
    signed_by: 'C. VANCE (Recipient)',
    delivery_location: 'Front Reception Desk',
    shipping_address: '1200 Grand Avenue, Suite 400, Seattle, WA 98101',
    gps_coordinates: '47.6062 N, 122.3321 W (Accuracy: 1.8m)',
    checkout_ip: '198.54.133.9',
    ip_city: 'Seattle, WA',
    ip_distance_km: '1.1',
    auth_method: 'PayPal 2FA SMS & Biometric Confirmed',
    customer_lifetime_spend: '3100.00',
  },
  SCENARIO_SNAD: {
    id: 'PP-D-19044',
    dispute_reason: 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED',
    dispute_amount: '340.00',
    currency: 'USD',
    buyer_name: 'David K. Miller',
    buyer_email: 'dmiller.designs@yahoo.com',
    buyer_claim_notes:
      'The iPad chassis has a small hairline scratch on the back bezel that was not depicted in the listing photos. Requesting resolution.',
    order_id: 'ORD-19044',
    item_title: 'Refurbished Apple iPad Air (5th Gen) 64GB Wi-Fi - Starlight',
    item_price: '340.00',
    carrier: 'USPS Priority Mail',
    tracking_number: '9400111899562537482910',
    delivery_status: 'DELIVERED',
    delivery_timestamp: '2026-11-01T15:10:02Z',
    signed_by: 'Electronic Access Locker Keypad',
    delivery_location: 'Parcel Locker #14',
    shipping_address: '450 North Elm Street, Apt 3B, Chicago, IL 60611',
    gps_coordinates: '41.8988 N, 87.6229 W (Accuracy: 3.1m)',
    checkout_ip: '24.15.89.201',
    ip_city: 'Chicago, IL',
    ip_distance_km: '2.8',
    auth_method: 'PayPal Password Verified',
    customer_lifetime_spend: '4820.00',
  },
};

const AGENTS_META = [
  {
    id: 'TRIAGE',
    name: 'Sentinel',
    role: 'Triage & Statutory SLA',
    desc: 'Validates response deadline, dispute channel, and velocity risk.',
    icon: ShieldAlert,
    color: '#005EA6',
  },
  {
    id: 'FORENSICS',
    name: 'Sherlock',
    role: 'Forensic Evidence Gatherer',
    desc: 'Correlates carrier GPS fix, signature scan, and checkout IP distance.',
    icon: Search,
    color: '#166534',
  },
  {
    id: 'SYNDICATE_SCAN',
    name: 'Oracle',
    role: 'Fraud Ring & Re-Shipper Hunter',
    desc: 'Cross-checks addresses against freight-forwarders and proxy nodes.',
    icon: Network,
    color: '#B3261E',
  },
  {
    id: 'LEGAL_SYNTHESIS',
    name: 'Lex',
    role: 'Seller Protection & Visa CE 3.0',
    desc: 'Drafts formal legal rebuttal and compiles /provide-evidence JSON.',
    icon: Scale,
    color: '#0F1D35',
  },
  {
    id: 'SETTLEMENT_ANALYSIS',
    name: 'Pax',
    role: 'Settlement Economics',
    desc: 'Evaluates Inquiry micro-settlement vs $15 bank chargeback fee.',
    icon: HeartHandshake,
    color: '#8A5A00',
  },
];

export default function AIAnalyzer({ disputes = [], onDisputeResolved, activeDispute }) {
  // Mode switcher: 'SSE_PIPELINE' (Live 5-Agent SSE Stream) | 'LLM_SANDBOX' (Custom Case + Gemini/OpenAI)
  const [benchMode, setBenchMode] = useState('SSE_PIPELINE');

  // SSE Pipeline State
  const [selectedDisputeId, setSelectedDisputeId] = useState(
    activeDispute?.dispute_id || disputes[0]?.dispute_id || 'PP-D-94821'
  );
  const [sseStrategy, setSseStrategy] = useState('LEGAL_AGGRESSIVE');
  const [sseLogs, setSseLogs] = useState([]);
  const [activePhase, setActivePhase] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedDispute, setStreamedDispute] = useState(null);
  const logEndRef = useRef(null);

  // LLM Settings State
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('aegispay_ai_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Custom Form State
  const [activeScenario, setActiveScenario] = useState('SCENARIO_INR');
  const [formData, setFormData] = useState({ ...PRESET_SCENARIOS.SCENARIO_INR });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isSubmittingToPayPal, setIsSubmittingToPayPal] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sseLogs]);

  // Sync when activeDispute prop changes
  useEffect(() => {
    if (activeDispute) {
      setSelectedDisputeId(activeDispute.dispute_id);
      setStreamedDispute(activeDispute);
      if (activeDispute.ai_state?.investigation_report?.timeline) {
        setSseLogs(activeDispute.ai_state.investigation_report.timeline);
      }

      const c = activeDispute.carrier_telemetry || {};
      const t = activeDispute.order_telemetry || {};
      setFormData({
        id: activeDispute.dispute_id,
        dispute_reason: activeDispute.dispute_reason,
        dispute_amount: activeDispute.dispute_amount?.value || '0.00',
        currency: activeDispute.dispute_amount?.currency_code || 'USD',
        buyer_name: activeDispute.buyer_info?.name || 'Verified Customer',
        buyer_email: activeDispute.buyer_info?.email || 'customer@paypal-user.com',
        buyer_claim_notes:
          activeDispute.transaction_details?.dispute_claim_notes ||
          (activeDispute.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED'
            ? 'Customer claims package was not received at destination address.'
            : activeDispute.dispute_reason === 'UNAUTHORIZED'
            ? 'Cardholder filed bank chargeback claiming unauthorized card capture.'
            : 'Customer claims item condition differs from merchant description.'),
        order_id: activeDispute.transaction_details?.order_id || 'ORD-SYNC',
        item_title: activeDispute.transaction_details?.item_title || 'Disputed Merchant Order',
        item_price: activeDispute.dispute_amount?.value || '0.00',
        carrier: c.carrier || 'FedEx Ground',
        tracking_number: c.tracking_number || activeDispute.carrier_tracking_key || '948210389102381',
        delivery_status: c.status || 'DELIVERED',
        delivery_timestamp: c.delivery_timestamp || '2026-11-04T14:32:18Z',
        signed_by: c.signed_by || 'M. REYNOLDS (Direct Signature)',
        delivery_location: c.delivered_to || 'Front Door / Covered Vestibule',
        shipping_address: activeDispute.shipping_address
          ? `${activeDispute.shipping_address.line1}, ${activeDispute.shipping_address.city}, ${activeDispute.shipping_address.state} ${activeDispute.shipping_address.postal_code}`
          : '742 Evergreen Terrace, Austin, TX 78701',
        gps_coordinates: c.geo_coordinates
          ? `${c.geo_coordinates.latitude} N, ${c.geo_coordinates.longitude} W (±${c.geo_coordinates.accuracy_meters}m)`
          : '30.2672 N, 97.7431 W (Accuracy: 2.4m)',
        checkout_ip: t.checkout_ip || '70.112.44.89',
        ip_city: t.ip_geolocation?.city || activeDispute.shipping_address?.city || 'Austin, TX',
        ip_distance_km: String(t.ip_geolocation?.distance_to_shipping_km ?? '4.2'),
        auth_method: t.authentication_record?.auth_type || 'PayPal One-Touch 2FA Biometric',
        customer_lifetime_spend: activeDispute.buyer_info?.lifetime_spend || '2800.00',
      });
      setActiveScenario('CUSTOM');
      setSubmissionSuccess(false);
    }
  }, [activeDispute]);

  const currentQueueDispute =
    streamedDispute?.dispute_id === selectedDisputeId
      ? streamedDispute
      : disputes.find((d) => d.dispute_id === selectedDisputeId) || disputes[0];

  const handleRunSsePipeline = () => {
    const targetId = currentQueueDispute?.dispute_id;
    if (!targetId || isStreaming) return;
    setIsStreaming(true);
    setSseLogs([]);
    setActivePhase('TRIAGE');
    setSubmissionSuccess(false);

    const es = new EventSource(
      `/api/disputes/${targetId}/investigate-stream?strategy=${sseStrategy}`
    );

    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === 'COMPLETE_PAYLOAD') {
          es.close();
          setIsStreaming(false);
          setActivePhase(null);
          if (data.dispute) {
            setStreamedDispute(data.dispute);
          }
          if (onDisputeResolved) onDisputeResolved();
        } else if (data.type === 'ERROR') {
          es.close();
          setIsStreaming(false);
          setActivePhase(null);
        } else {
          if (data.phase) setActivePhase(data.phase);
          setSseLogs((prev) => [...prev, data]);
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    es.onerror = () => {
      es.close();
      setIsStreaming(false);
      setActivePhase(null);
    };
  };

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('aegispay_ai_key', key);
  };

  const handleSelectScenario = (key) => {
    setActiveScenario(key);
    setFormData({ ...PRESET_SCENARIOS[key] });
    setAnalysisResult(null);
    setSubmissionSuccess(false);
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setSubmissionSuccess(false);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeCase: formData,
          apiKey: apiKey.trim() || null,
          provider,
        }),
      });

      const data = await response.json();
      if (data.success && data.result) {
        setAnalysisResult(data.result);
      }
    } catch (err) {
      console.error('AI Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitToPayPal = async (targetDisputeId) => {
    setIsSubmittingToPayPal(true);
    try {
      const idToUse = targetDisputeId || formData.id || 'PP-D-94821';
      const response = await fetch(`/api/disputes/${idToUse}/submit`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setSubmissionSuccess(true);
        if (data.dispute) setStreamedDispute(data.dispute);
        if (onDisputeResolved) onDisputeResolved();
      }
    } catch (err) {
      console.error('PayPal submission failed:', err);
    } finally {
      setIsSubmittingToPayPal(false);
    }
  };

  const handleCopyLetter = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    }
  };

  const compiledReport = currentQueueDispute?.ai_state?.investigation_report;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Institutional Mode & LLM Configuration Bar */}
      <div className="paper-panel">
        <div className="paper-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                  Multi-Agent Adjudication &amp; Forensic Synthesis Bench
                </h3>
                <span className="status-pill defended">
                  {apiKey ? `Live ${provider.toUpperCase()} Key Configured` : '5-Agent Pipeline Ready'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                Stream the 5-agent chain-of-custody investigation via SSE or evaluate custom cases with Gemini 1.5 / GPT-4o.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className={`filter-chip ${benchMode === 'SSE_PIPELINE' ? 'active' : ''}`}
                onClick={() => setBenchMode('SSE_PIPELINE')}
              >
                Live 5-Agent SSE Pipeline
              </button>
              <button
                className={`filter-chip ${benchMode === 'LLM_SANDBOX' ? 'active' : ''}`}
                onClick={() => setBenchMode('LLM_SANDBOX')}
              >
                Custom Case &amp; LLM Evaluator
              </button>
            </div>

            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="form-input"
              style={{ padding: '5px 8px', fontSize: '11.5px' }}
            >
              <option value="gemini">Google Gemini 1.5 Flash</option>
              <option value="openai">OpenAI GPT-4o</option>
            </select>

            <button
              className="btn btn-secondary"
              onClick={() => setShowKeyInput(!showKeyInput)}
              style={{ fontSize: '11.5px', padding: '5px 10px' }}
            >
              <Key size={13} style={{ color: apiKey ? 'var(--forest)' : 'var(--manila-stamp)' }} />
              <span>{apiKey ? 'LLM Key Saved' : 'Configure LLM Key'}</span>
            </button>
          </div>
        </div>

        {showKeyInput && (
          <div
            style={{
              padding: '12px 18px',
              borderTop: '1px solid var(--hairline)',
              backgroundColor: 'var(--paper-bg)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <span className="form-label">
              {provider === 'gemini' ? 'Google Gemini API Key:' : 'OpenAI API Key:'}
            </span>
            <input
              type="password"
              className="form-input mono"
              placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
              value={apiKey}
              onChange={(e) => saveApiKey(e.target.value)}
              style={{ flex: 1, minWidth: '240px' }}
            />
            <button className="btn btn-primary" onClick={() => setShowKeyInput(false)}>
              Save to Browser
            </button>
            <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
              Stored in localStorage. Leave blank to use the built-in deterministic 5-agent orchestrator.
            </span>
          </div>
        )}
      </div>

      {/* MODE 1: LIVE 5-AGENT SSE PIPELINE */}
      {benchMode === 'SSE_PIPELINE' && (
        <div className="war-room-container">
          {/* Left Column: 5-Agent Roster & Case Trigger */}
          <div className="agent-roster-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span className="form-label">Target Queue Dispute</span>
              <select
                className="form-input mono"
                value={currentQueueDispute?.dispute_id || ''}
                onChange={(e) => {
                  setSelectedDisputeId(e.target.value);
                  const found = disputes.find((d) => d.dispute_id === e.target.value);
                  setStreamedDispute(found || null);
                  setSseLogs(found?.ai_state?.investigation_report?.timeline || []);
                  setSubmissionSuccess(false);
                }}
                disabled={isStreaming}
                style={{ fontWeight: 600 }}
              >
                {disputes.map((d) => (
                  <option key={d.dispute_id} value={d.dispute_id}>
                    {d.dispute_id} — ${d.dispute_amount?.value} ({d.buyer_info?.name})
                  </option>
                ))}
              </select>

              <span className="form-label" style={{ marginTop: '4px' }}>
                Lex Legal Rebuttal Standard
              </span>
              <select
                className="form-input"
                value={sseStrategy}
                onChange={(e) => setSseStrategy(e.target.value)}
                disabled={isStreaming}
              >
                <option value="LEGAL_AGGRESSIVE">Visa CE 3.0 &amp; Seller Protection (§11)</option>
                <option value="DIPLOMATIC_INQUIRY">Pax Diplomatic Customer Inquiry</option>
                <option value="SYNDICATE_FRAUD_ESCALATION">Oracle Syndicate Fraud Escalation</option>
              </select>

              <button
                id="btn-run-swarm-inspection"
                className="btn btn-primary"
                onClick={handleRunSsePipeline}
                disabled={isStreaming}
                style={{ width: '100%', padding: '9px 12px', marginTop: '4px' }}
              >
                {isStreaming ? (
                  <>
                    <Clock size={14} className="spin" />
                    <span>Streaming 5-Agent Deliberation...</span>
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    <span>Execute 5-Agent SSE Investigation</span>
                  </>
                )}
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="form-label">Autonomous Pipeline Roster</span>
              {AGENTS_META.map((agent) => {
                const Icon = agent.icon;
                const isActive = activePhase === agent.id;
                const isDone = Boolean(compiledReport) && !isStreaming;

                return (
                  <div
                    key={agent.id}
                    className={`agent-node ${isActive ? 'active-agent' : ''}`}
                    style={{ borderLeft: `3px solid ${agent.color}` }}
                  >
                    <div
                      className="agent-icon-box"
                      style={{
                        backgroundColor: 'var(--paper-bg)',
                        border: '1px solid var(--hairline)',
                        color: agent.color,
                      }}
                    >
                      <Icon size={15} />
                    </div>
                    <div className="agent-meta">
                      <div className="agent-name">
                        <span>{agent.name}</span>
                        <span
                          className="mono"
                          style={{
                            fontSize: '9.5px',
                            color: isActive
                              ? 'var(--paypal-blue)'
                              : isDone
                              ? 'var(--forest)'
                              : 'var(--ink-muted)',
                          }}
                        >
                          {isActive ? 'ACTIVE' : isDone ? 'SEALED' : 'READY'}
                        </span>
                      </div>
                      <div className="agent-role" style={{ color: 'var(--ink-secondary)' }}>
                        {agent.role}
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                        {agent.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live SSE Stream + Compiled Rebuttal & Dispatch */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="terminal-wrapper" style={{ minHeight: '280px' }}>
              <div className="terminal-header">
                <div className="terminal-title">
                  <Terminal size={14} style={{ color: '#60A5FA' }} />
                  <span>
                    SSE CHAIN-OF-CUSTODY STREAM // CASE {currentQueueDispute?.dispute_id}
                  </span>
                </div>
                <span className="mono" style={{ fontSize: '10.5px', color: '#94A3B8' }}>
                  GET /api/disputes/{currentQueueDispute?.dispute_id}/investigate-stream
                </span>
              </div>

              <div className="terminal-body" style={{ maxHeight: '280px' }}>
                {sseLogs.length === 0 ? (
                  <div style={{ color: '#94A3B8', padding: '24px', textAlign: 'center', fontSize: '12px' }}>
                    Click &ldquo;Execute 5-Agent SSE Investigation&rdquo; to stream live forensic verification from Sentinel, Sherlock, Oracle, Lex, and Pax.
                  </div>
                ) : (
                  sseLogs.map((log, index) => (
                    <div key={index} className="log-entry">
                      <span className="log-time">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                      <span
                        className="log-agent-tag"
                        style={{
                          backgroundColor: 'rgba(96, 165, 250, 0.16)',
                          color: '#93C5FD',
                          border: '1px solid rgba(96, 165, 250, 0.35)',
                        }}
                      >
                        {log.agent}
                      </span>
                      <div className="log-message">
                        <span style={{ color: '#94A3B8', marginRight: '6px' }}>[{log.action}]</span>
                        <span>{log.thought}</span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </div>

            {/* Compiled Dossier Output Card */}
            {compiledReport && (
              <div className="paper-panel">
                <div className="paper-panel-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="exhibit-tag">
                      <Stamp size={11} />
                      VERDICT: {compiledReport.recommendation?.replace(/_/g, ' ')}
                    </span>
                    <span className="status-pill defended">
                      {compiledReport.win_probability_pct}% Evidentiary Confidence
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 9px', fontSize: '11.5px' }}
                      onClick={() => handleCopyLetter(compiledReport.legal?.formal_rebuttal_letter)}
                    >
                      {copiedLetter ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedLetter ? 'Copied' : 'Copy Rebuttal'}</span>
                    </button>
                    {currentQueueDispute?.ai_state?.status !== 'DEFENDED_TO_PAYPAL' && !submissionSuccess ? (
                      <button
                        className="btn btn-forest"
                        style={{ padding: '5px 12px', fontSize: '12px' }}
                        onClick={() => handleSubmitToPayPal(currentQueueDispute.dispute_id)}
                        disabled={isSubmittingToPayPal}
                      >
                        <Send size={13} />
                        <span>
                          {isSubmittingToPayPal
                            ? 'Dispatching...'
                            : 'Dispatch Evidence Packet to PayPal API'}
                        </span>
                      </button>
                    ) : (
                      <span className="status-pill defended">
                        <CheckCircle2 size={12} /> Dispatched to PayPal
                      </span>
                    )}
                  </div>
                </div>

                <div className="paper-panel-body">
                  <pre className="rebuttal-pre-block" style={{ maxHeight: '260px' }}>
                    {compiledReport.legal?.formal_rebuttal_letter}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: CUSTOM CASE & LIVE LLM EVALUATOR (/api/ai/analyze) */}
      {benchMode === 'LLM_SANDBOX' && (
        <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: '16px', alignItems: 'start' }}>
          {/* Left Column: Dispute Evidence Form */}
          <div className="paper-panel">
            <div className="paper-panel-header">
              <h4 style={{ fontSize: '13.5px', fontWeight: 700 }}>1. Case Evidence Input</h4>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  className={`filter-chip ${activeScenario === 'SCENARIO_INR' ? 'active' : ''}`}
                  onClick={() => handleSelectScenario('SCENARIO_INR')}
                  style={{ padding: '3px 7px', fontSize: '10.5px' }}
                >
                  INR Preset
                </button>
                <button
                  type="button"
                  className={`filter-chip ${activeScenario === 'SCENARIO_UNAUTHORIZED' ? 'active' : ''}`}
                  onClick={() => handleSelectScenario('SCENARIO_UNAUTHORIZED')}
                  style={{ padding: '3px 7px', fontSize: '10.5px' }}
                >
                  10.4 Unauth
                </button>
                <button
                  type="button"
                  className={`filter-chip ${activeScenario === 'SCENARIO_SNAD' ? 'active' : ''}`}
                  onClick={() => handleSelectScenario('SCENARIO_SNAD')}
                  style={{ padding: '3px 7px', fontSize: '10.5px' }}
                >
                  SNAD Preset
                </button>
              </div>
            </div>

            <div className="paper-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className="form-group">
                  <label className="form-label">Dispute ID</label>
                  <input
                    type="text"
                    className="form-input mono"
                    value={formData.id}
                    onChange={(e) => handleFieldChange('id', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Disputed Amount ($)</label>
                  <input
                    type="text"
                    className="form-input mono"
                    value={formData.dispute_amount}
                    onChange={(e) => handleFieldChange('dispute_amount', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">PayPal Dispute Reason</label>
                <select
                  className="form-input"
                  value={formData.dispute_reason}
                  onChange={(e) => handleFieldChange('dispute_reason', e.target.value)}
                >
                  <option value="MERCHANDISE_OR_SERVICE_NOT_RECEIVED">
                    MERCHANDISE_OR_SERVICE_NOT_RECEIVED (INR)
                  </option>
                  <option value="UNAUTHORIZED">UNAUTHORIZED (Stolen Card / 10.4)</option>
                  <option value="MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED">
                    MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED (SNAD)
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Buyer Statement</label>
                <textarea
                  className="form-input"
                  rows="2"
                  value={formData.buyer_claim_notes}
                  onChange={(e) => handleFieldChange('buyer_claim_notes', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fulfilled Item</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.item_title}
                  onChange={(e) => handleFieldChange('item_title', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className="form-group">
                  <label className="form-label">Carrier</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.carrier}
                    onChange={(e) => handleFieldChange('carrier', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tracking Number</label>
                  <input
                    type="text"
                    className="form-input mono"
                    value={formData.tracking_number}
                    onChange={(e) => handleFieldChange('tracking_number', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className="form-group">
                  <label className="form-label">Signatory Record</label>
                  <input
                    type="text"
                    className="form-input mono"
                    value={formData.signed_by}
                    onChange={(e) => handleFieldChange('signed_by', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GPS Fix</label>
                  <input
                    type="text"
                    className="form-input mono"
                    value={formData.gps_coordinates}
                    onChange={(e) => handleFieldChange('gps_coordinates', e.target.value)}
                  />
                </div>
              </div>

              <button
                id="btn-run-ai-agent"
                className="btn btn-primary"
                onClick={handleRunAIAnalysis}
                disabled={isAnalyzing}
                style={{ width: '100%', padding: '9px 12px', marginTop: '4px' }}
              >
                {isAnalyzing ? (
                  <>
                    <Clock size={14} className="spin" />
                    <span>Evaluating Evidence &amp; Drafting Rebuttal...</span>
                  </>
                ) : (
                  <>
                    <Scale size={14} />
                    <span>Run Adjudication &amp; Draft Rebuttal</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Verdict & Rebuttal Output */}
          <div className="paper-panel" style={{ minHeight: '520px' }}>
            <div className="paper-panel-header">
              <h4 style={{ fontSize: '13.5px', fontWeight: 700 }}>
                2. Adjudication Verdict &amp; Bank Rebuttal Brief
              </h4>
              {analysisResult && (
                <span className="exhibit-tag">{analysisResult.model_used || '5-Agent Engine'}</span>
              )}
            </div>

            <div className="paper-panel-body">
              {!analysisResult && !isAnalyzing && (
                <div
                  style={{
                    padding: '64px 24px',
                    textAlign: 'center',
                    color: 'var(--ink-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <Scale size={36} strokeWidth={1.5} style={{ color: 'var(--paypal-blue)' }} />
                  <div style={{ fontWeight: 600, color: 'var(--ink-primary)' }}>
                    Ready for Case Evaluation
                  </div>
                  <p style={{ fontSize: '12.5px', maxWidth: '400px' }}>
                    Inspect or modify the evidentiary fields on the left and click &ldquo;Run Adjudication &amp; Draft Rebuttal&rdquo; to generate a Visa CE 3.0 / PayPal Seller Protection brief.
                  </p>
                </div>
              )}

              {isAnalyzing && (
                <div style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--ink-secondary)' }}>
                  <Clock size={28} className="spin" style={{ color: 'var(--paypal-blue)', marginBottom: '8px' }} />
                  <div style={{ fontWeight: 600 }}>Evaluating Evidentiary Chain...</div>
                </div>
              )}

              {analysisResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="exhibit-card">
                    <div className="exhibit-card-header">
                      <span className="exhibit-stamp-title">
                        <Stamp size={12} />
                        RECOMMENDED ACTION: {analysisResult.verdict}
                      </span>
                      <span className="status-pill defended">
                        {analysisResult.win_probability_pct}% Evidentiary Match
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-primary)' }}>
                      {analysisResult.seller_protection_reason}
                    </div>
                  </div>

                  {/* Agent Trace */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {analysisResult.agent_thought_stream?.map((step, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '8px 10px',
                          backgroundColor: 'var(--paper-subtle)',
                          border: '1px solid var(--hairline)',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                        }}
                      >
                        <strong className="mono" style={{ color: 'var(--paypal-blue)' }}>
                          [{step.agent}]
                        </strong>{' '}
                        <span style={{ color: 'var(--ink-secondary)' }}>{step.thought}</span>
                      </div>
                    ))}
                  </div>

                  {/* Rebuttal Letter */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="form-label">Compiled Rebuttal Brief</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => handleCopyLetter(analysisResult.formal_rebuttal_letter)}
                        >
                          {copiedLetter ? <Check size={11} /> : <Copy size={11} />}
                          <span>{copiedLetter ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => window.print()}
                        >
                          <Printer size={11} />
                          <span>Print</span>
                        </button>
                      </div>
                    </div>
                    <pre className="rebuttal-pre-block">{analysisResult.formal_rebuttal_letter}</pre>
                  </div>

                  {/* Dispatch Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      backgroundColor: 'var(--paper-subtle)',
                      border: '1px solid var(--hairline)',
                      borderRadius: '4px',
                    }}
                  >
                    <span className="mono" style={{ fontSize: '11.5px', color: 'var(--ink-secondary)' }}>
                      POST /v1/customer/disputes/{formData.id}/provide-evidence
                    </span>
                    {!submissionSuccess ? (
                      <button
                        id="btn-submit-paypal-evidence"
                        className="btn btn-forest"
                        onClick={() => handleSubmitToPayPal(formData.id)}
                        disabled={isSubmittingToPayPal}
                      >
                        <Send size={13} />
                        <span>
                          {isSubmittingToPayPal ? 'Dispatching...' : 'Submit Evidence to PayPal API'}
                        </span>
                      </button>
                    ) : (
                      <span className="status-pill defended">
                        <CheckCircle2 size={13} /> Dispatched &amp; Acknowledged
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
