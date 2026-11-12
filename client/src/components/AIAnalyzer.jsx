import React, { useState, useEffect } from 'react';
import {
  Play,
  Send,
  Copy,
  Check,
  Printer,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const PRESET_SCENARIOS = {
  INR: {
    label: 'Item not received ($489)',
    data: {
      dispute_id: 'PP-D-94821',
      dispute_reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
      dispute_amount: '489.00',
      currency: 'USD',
      buyer_name: 'Marcus J. Reynolds',
      buyer_email: 'm.reynolds84@gmail.com',
      buyer_claim_notes: 'Buyer claims package never arrived despite carrier delivery confirmation.',
      order_id: 'ORD-94821',
      item_title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
      item_price: '489.00',
      shipping_address: '742 Evergreen Terrace, Austin, TX 78701',
      carrier: 'FEDEX',
      tracking_number: '948210389102381',
      delivery_status: 'DELIVERED',
      signed_by: 'M. REYNOLDS',
      delivery_location: 'Front Porch / Covered Doorstep',
      gps_coordinates: '30.2672 N, 97.7431 W (Accuracy: 2.4m)',
      checkout_ip: '70.112.44.89',
      ip_city: 'Austin, TX',
      ip_distance_km: '4.2',
      auth_method: 'PayPal One-Touch Biometric / 2FA',
      customer_lifetime_spend: '489.00',
    },
  },
  UNAUTHORIZED: {
    label: 'Freight forwarder ($899)',
    data: {
      dispute_id: 'PP-D-88210',
      dispute_reason: 'UNAUTHORIZED',
      dispute_amount: '899.00',
      currency: 'USD',
      buyer_name: 'Alexei V. Petrenko',
      buyer_email: 'user_x9401@tempmail-box.cc',
      buyer_claim_notes: 'Cardholder alleges unauthorized transaction.',
      order_id: 'ORD-88210',
      item_title: 'NVIDIA GeForce RTX 4080 Super 16GB Gaming GPU',
      item_price: '899.00',
      shipping_address: '3500 Silverside Rd, Suite 105, Wilmington, DE 19810',
      carrier: 'DHL',
      tracking_number: '882109412201',
      delivery_status: 'DELIVERED',
      signed_by: 'RECEIVING CLERK D.105',
      delivery_location: 'Commercial Freight Receiving Dock',
      gps_coordinates: '39.8143 N, 75.5467 W (Accuracy: 1.8m)',
      checkout_ip: '185.220.101.47',
      ip_city: 'Wilmington / Proxy Exit',
      ip_distance_km: '4180',
      auth_method: 'Credit Card Checkout + Verified Address',
      customer_lifetime_spend: '899.00',
    },
  },
  SNAD: {
    label: 'Not as described ($340)',
    data: {
      dispute_id: 'PP-D-44102',
      dispute_reason: 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED',
      dispute_amount: '340.00',
      currency: 'USD',
      buyer_name: 'David K. Miller',
      buyer_email: 'dmiller.designs@yahoo.com',
      buyer_claim_notes: 'Customer reports minor chassis scuff not depicted in condition photos.',
      order_id: 'ORD-19044',
      item_title: 'Refurbished Apple iPad Air (5th Gen) 64GB Wi-Fi',
      item_price: '340.00',
      shipping_address: '450 North Elm Street, Apt 3B, Chicago, IL 60611',
      carrier: 'USPS',
      tracking_number: '190448129011',
      delivery_status: 'DELIVERED',
      signed_by: 'D. MILLER',
      delivery_location: 'Apartment Reception Desk',
      gps_coordinates: '41.8947 N, 87.6242 W (Accuracy: 3.1m)',
      checkout_ip: '73.241.18.92',
      ip_city: 'Chicago, IL',
      ip_distance_km: '1.8',
      auth_method: 'PayPal Balance + Verified Account',
      customer_lifetime_spend: '4820.00',
    },
  },
};

function formatStepRole(action = '') {
  const map = {
    INTAKE_TRIAGE: 'Intake triage',
    TRIAGE: 'Intake triage',
    CARRIER_GPS_AUDIT: 'Carrier & GPS',
    CARRIER_AUDIT: 'Carrier & GPS',
    SELLER_PROTECTION_EVALUATION: 'Seller Protection',
    LEGAL_DEFENSE: 'Seller Protection',
    SETTLEMENT_ANALYSIS: 'Settlement check',
    GOODWILL_CHECK: 'Settlement check',
  };
  if (map[action]) return map[action];
  return action
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function mapDisputeToForm(dispute) {
  const tx = dispute.transaction_details || {};
  const buyer = dispute.buyer_info || {};
  const ship = dispute.shipping_address || {};
  const trackingRaw = dispute.carrier_tracking_key || '';
  const carrier = trackingRaw.includes('-') ? trackingRaw.split('-')[0] : 'FEDEX';
  const trackingNumber = trackingRaw.includes('-') ? trackingRaw.split('-').slice(1).join('-') : trackingRaw;

  return {
    dispute_id: dispute.dispute_id || 'PP-D-CUSTOM',
    dispute_reason: dispute.dispute_reason || 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
    dispute_amount: String(dispute.dispute_amount?.value || tx.item_price || '0.00'),
    currency: dispute.dispute_amount?.currency_code || 'USD',
    buyer_name: buyer.name || '',
    buyer_email: buyer.email || '',
    buyer_claim_notes:
      tx.dispute_claim_notes || `Buyer opened ${dispute.dispute_reason?.replace(/_/g, ' ').toLowerCase() || 'dispute'} claim.`,
    order_id: tx.order_id || 'ORD-00000',
    item_title: tx.item_title || '',
    item_price: String(tx.item_price || dispute.dispute_amount?.value || '0.00'),
    shipping_address: `${ship.line1 || ''}, ${ship.city || ''}, ${ship.state || ''} ${ship.postal_code || ''}`.replace(/^,\s*/, ''),
    carrier,
    tracking_number: trackingNumber || '948210389102381',
    delivery_status: 'DELIVERED',
    signed_by: ship.recipient_name || buyer.name || 'Verified Recipient',
    delivery_location: ship.city === 'Wilmington' ? 'Commercial Loading Dock' : 'Front Door / Porch',
    gps_coordinates: ship.city === 'Wilmington' ? '39.8143 N, 75.5467 W' : '30.2672 N, 97.7431 W',
    checkout_ip: ship.city === 'Wilmington' ? '185.220.101.47' : '70.112.44.89',
    ip_city: ship.city ? `${ship.city}, ${ship.state || ''}`.trim() : 'Austin, TX',
    ip_distance_km: ship.city === 'Wilmington' ? '4180' : '4.2',
    auth_method: tx.payment_source || 'PayPal Checkout 2FA',
    customer_lifetime_spend: buyer.lifetime_spend || '489.00',
  };
}

export default function AIAnalyzer({ onDisputeResolved, activeDispute }) {
  const [formData, setFormData] = useState(PRESET_SCENARIOS.INR.data);
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('aegispay_ai_key') || '');
  const [showModelSettings, setShowModelSettings] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitBanner, setSubmitBanner] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeDispute) {
      setFormData(mapDisputeToForm(activeDispute));
      setAnalysis(null);
      setErrorMsg(null);
      setSubmitBanner(null);
    }
  }, [activeDispute]);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (key) => {
    setFormData(PRESET_SCENARIOS[key].data);
    setAnalysis(null);
    setErrorMsg(null);
    setSubmitBanner(null);
  };

  const handleApiKeyChange = (val) => {
    setApiKey(val);
    localStorage.setItem('aegispay_ai_key', val);
  };

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    setIsAnalyzing(true);
    setErrorMsg(null);
    setSubmitBanner(null);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeCase: formData,
          apiKey: apiKey.trim() || undefined,
          provider,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to run case evaluation.');
      }
      setAnalysis(json.result);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to contact analysis service.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitToPayPal = async () => {
    if (!analysis) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const targetId = formData.dispute_id || 'PP-D-94821';
      const res = await fetch(`/api/disputes/${encodeURIComponent(targetId)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: analysis.formal_rebuttal_letter,
          evidence_payload: analysis.paypal_rest_payload,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to transmit evidence to PayPal.');
      }
      setSubmitBanner(`Evidence packet sent to PayPal Sandbox for ${targetId}.`);
      onDisputeResolved?.();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit evidence.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRebuttal = async () => {
    if (!analysis?.formal_rebuttal_letter) return;
    try {
      await navigator.clipboard.writeText(analysis.formal_rebuttal_letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMsg('Clipboard access was denied by the browser.');
    }
  };

  const verdictLabel =
    analysis?.verdict === 'FIGHT_DISPUTE'
      ? 'Recommended: Contest with Seller Protection packet'
      : analysis?.verdict === 'ESCALATE_FRAUD_RING'
      ? 'Recommended: Escalate linked cluster evidence'
      : 'Recommended: Offer goodwill refund or return';

  const verdictTone =
    analysis?.verdict === 'SETTLE_GOODWILL' ? 'warning' : 'success';

  return (
    <div className="case-layout">
      {/* Left Column: Case Details Form */}
      <form className="panel" onSubmit={handleAnalyze}>
        <div className="panel-head" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3>Dispute parameters</h3>
            <p className="stat-meta" style={{ marginTop: '2px' }}>
              Edit any field or load a sample claim before generating a defense packet.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {Object.entries(PRESET_SCENARIOS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                className={`btn btn-sm ${formData.dispute_id === preset.data.dispute_id ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => applyPreset(key)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="panel-body">
          <div className="form-section">
            <div className="form-section-title">Claim &amp; transaction</div>
            <div className="field-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="case-id">Dispute ID</label>
                <input
                  id="case-id"
                  className="form-input num"
                  value={formData.dispute_id}
                  onChange={(e) => updateField('dispute_id', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="case-amount">Amount (USD)</label>
                <input
                  id="case-amount"
                  className="form-input num"
                  value={formData.dispute_amount}
                  onChange={(e) => updateField('dispute_amount', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="case-reason">PayPal dispute reason</label>
                <select
                  id="case-reason"
                  className="form-input"
                  value={formData.dispute_reason}
                  onChange={(e) => updateField('dispute_reason', e.target.value)}
                >
                  <option value="MERCHANDISE_OR_SERVICE_NOT_RECEIVED">Item not received (INR)</option>
                  <option value="UNAUTHORIZED">Unauthorized payment</option>
                  <option value="MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED">Significantly not as described (SNAD)</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="case-item">Item description</label>
                <input
                  id="case-item"
                  className="form-input"
                  value={formData.item_title}
                  onChange={(e) => updateField('item_title', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Fulfillment &amp; carrier proof</div>
            <div className="field-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="case-carrier">Carrier</label>
                <select
                  id="case-carrier"
                  className="form-input"
                  value={formData.carrier}
                  onChange={(e) => updateField('carrier', e.target.value)}
                >
                  <option value="FEDEX">FedEx</option>
                  <option value="UPS">UPS</option>
                  <option value="USPS">USPS</option>
                  <option value="DHL">DHL Express</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="case-tracking">Tracking number</label>
                <input
                  id="case-tracking"
                  className="form-input num"
                  value={formData.tracking_number}
                  onChange={(e) => updateField('tracking_number', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="case-status">Delivery status</label>
                <select
                  id="case-status"
                  className="form-input"
                  value={formData.delivery_status}
                  onChange={(e) => updateField('delivery_status', e.target.value)}
                >
                  <option value="DELIVERED">Delivered</option>
                  <option value="IN_TRANSIT">In transit</option>
                  <option value="EXCEPTION">Delivery exception</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="case-signed">Signature on file</label>
                <input
                  id="case-signed"
                  className="form-input"
                  value={formData.signed_by}
                  onChange={(e) => updateField('signed_by', e.target.value)}
                  placeholder="None if unsigned"
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="case-address">Verified shipping destination</label>
                <input
                  id="case-address"
                  className="form-input"
                  value={formData.shipping_address}
                  onChange={(e) => updateField('shipping_address', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-section" style={{ marginBottom: 0 }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowModelSettings((v) => !v)}
              style={{ paddingLeft: 0, marginBottom: showModelSettings ? '10px' : 0 }}
            >
              <KeyRound size={14} />
              <span>AI model provider (optional BYOK)</span>
              {showModelSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showModelSettings && (
              <div className="evidence-box" style={{ marginTop: '6px' }}>
                <div className="field-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="ai-provider">Provider</label>
                    <select
                      id="ai-provider"
                      className="form-input"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                    >
                      <option value="gemini">Google Gemini 1.5 Flash</option>
                      <option value="openai">OpenAI GPT-4o</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="ai-key">API key (optional)</label>
                    <input
                      id="ai-key"
                      type="password"
                      className="form-input num"
                      value={apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      placeholder="Leave blank for built-in rules engine"
                    />
                  </div>
                </div>
                <p className="form-hint" style={{ margin: '6px 0 0 0' }}>
                  Stored locally in your browser. If omitted, AegisPay uses its deterministic Seller Protection engine.
                </p>
              </div>
            )}
          </div>

          <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={isAnalyzing}>
              <Play size={14} />
              {isAnalyzing ? 'Evaluating evidence...' : 'Run case review'}
            </button>
          </div>
        </div>
      </form>

      {/* Right Column: Review Findings & Rebuttal Packet */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Recommendation &amp; rebuttal packet</h3>
            <p className="stat-meta" style={{ marginTop: '2px' }}>
              Policy check, specialist findings, and ready-to-send PayPal Disputes API payload.
            </p>
          </div>
          {analysis?.model_used && (
            <span className="badge neutral">{analysis.model_used}</span>
          )}
        </div>

        <div className="panel-body">
          {errorMsg && (
            <div className="error-box" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {submitBanner && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '8px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '14px',
              }}
            >
              <CheckCircle2 size={15} />
              <span>{submitBanner}</span>
            </div>
          )}

          {!analysis ? (
            <div className="empty-state">
              <p style={{ margin: '0 0 10px 0', color: 'var(--ink)', fontWeight: 500 }}>
                Ready to evaluate {formData.dispute_id}
              </p>
              <p style={{ margin: 0, maxWidth: '420px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Click <strong>Run case review</strong> to verify PayPal Seller Protection eligibility, check delivery signatures, and draft a response letter.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Verdict Block */}
              <div className={`verdict ${verdictTone}`}>
                <div>
                  <span className={`badge ${analysis.seller_protection_eligible ? 'success' : 'warning'}`} style={{ marginBottom: '6px' }}>
                    {analysis.seller_protection_eligible ? 'Seller Protection eligible' : 'Review settlement'}
                  </span>
                  <div className="verdict-title">{verdictLabel}</div>
                  <p className="verdict-reason">{analysis.seller_protection_reason}</p>
                </div>

                <div className="verdict-figures">
                  <div>
                    <div className="figure-label">Win likelihood</div>
                    <div className="figure-value num">{analysis.win_probability_pct}%</div>
                  </div>
                  <div>
                    <div className="figure-label">Est. recovery</div>
                    <div className="figure-value num">${analysis.estimated_savings_usd}</div>
                  </div>
                </div>
              </div>

              {/* Specialist Checks */}
              <div>
                <div className="section-label">Verification steps</div>
                <div className="findings">
                  {(analysis.agent_thought_stream || []).map((item, idx) => (
                    <div key={idx} className="finding">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                        <span className="finding-agent">{item.agent}</span>
                        <span className="finding-role">{formatStepRole(item.action)}</span>
                      </div>
                      <p className="finding-text">
                        {(item.thought || '').replace(/\.\.+/g, '.')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Draft Rebuttal Letter */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div className="section-label" style={{ margin: 0 }}>Formal PayPal rebuttal letter</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopyRebuttal}>
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? 'Copied' : 'Copy text'}
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.print()}>
                      <Printer size={13} />
                      Print
                    </button>
                  </div>
                </div>

                <pre className="rebuttal-pre-block document">{analysis.formal_rebuttal_letter}</pre>
              </div>

              {/* Submission Bar */}
              <div className="submit-bar">
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Target endpoint: <code className="endpoint num">POST /v1/customer/disputes/{formData.dispute_id}/provide-evidence</code>
                </div>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSubmitToPayPal}
                  disabled={isSubmitting}
                >
                  <Send size={14} />
                  {isSubmitting ? 'Submitting...' : 'Send evidence to PayPal'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
