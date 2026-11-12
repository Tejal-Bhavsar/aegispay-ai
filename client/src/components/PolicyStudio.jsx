import React, { useState, useMemo } from 'react';
import { ShieldCheck, RotateCcw, Save, CheckCircle2, SlidersHorizontal, Info } from 'lucide-react';

const DEFAULT_POLICY = {
  autoSubmitThreshold: 88,
  goodwillCeiling: 45,
  requireSignature750: true,
  quarantineReshippers: true,
  defaultStrategy: 'LEGAL_AGGRESSIVE',
};

export default function PolicyStudio({ disputes = [] }) {
  const [autoSubmitThreshold, setAutoSubmitThreshold] = useState(DEFAULT_POLICY.autoSubmitThreshold);
  const [goodwillCeiling, setGoodwillCeiling] = useState(DEFAULT_POLICY.goodwillCeiling);
  const [requireSignature750, setRequireSignature750] = useState(DEFAULT_POLICY.requireSignature750);
  const [quarantineReshippers, setQuarantineReshippers] = useState(DEFAULT_POLICY.quarantineReshippers);
  const [defaultStrategy, setDefaultStrategy] = useState(DEFAULT_POLICY.defaultStrategy);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    setAutoSubmitThreshold(DEFAULT_POLICY.autoSubmitThreshold);
    setGoodwillCeiling(DEFAULT_POLICY.goodwillCeiling);
    setRequireSignature750(DEFAULT_POLICY.requireSignature750);
    setQuarantineReshippers(DEFAULT_POLICY.quarantineReshippers);
    setDefaultStrategy(DEFAULT_POLICY.defaultStrategy);
    setIsSaved(false);
  };

  // Compute live queue impact directly from active disputes rather than static placeholders
  const liveImpact = useMemo(() => {
    const open = disputes.filter((d) => d.ai_state?.status !== 'DEFENDED_TO_PAYPAL');
    const autoEligible = open.filter((d) => (d.ai_state?.defense_confidence || 0) >= autoSubmitThreshold);
    const goodwillEligible = open.filter(
      (d) =>
        d.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED' ||
        parseFloat(d.dispute_amount?.value || 0) <= goodwillCeiling
    );
    const highValueSignature = disputes.filter((d) => parseFloat(d.dispute_amount?.value || 0) >= 750);
    const reshipperCases = disputes.filter(
      (d) =>
        (d.shipping_address?.city || '').toLowerCase() === 'wilmington' ||
        d.ai_state?.recommended_action === 'ESCALATE_FRAUD_RING'
    );
    const protectedUsd = autoEligible.reduce((sum, d) => sum + parseFloat(d.dispute_amount?.value || 0), 0);

    return {
      openCount: open.length,
      autoEligibleCount: autoEligible.length,
      goodwillCount: goodwillEligible.length,
      highValueCount: highValueSignature.length,
      reshipperCount: reshipperCases.length,
      protectedUsd,
    };
  }, [disputes, autoSubmitThreshold, goodwillCeiling]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.5fr) minmax(280px, 1fr)',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        {/* Left: Threshold & Automation Rules */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={16} style={{ color: 'var(--accent)' }} />
                Underwriting &amp; submission rules
              </h3>
              <p className="stat-meta" style={{ marginTop: '2px' }}>
                Configure when AegisPay auto-submits evidence to PayPal or recommends a partial goodwill offer.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>
                <RotateCcw size={13} />
                Reset
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSave}>
                {isSaved ? <CheckCircle2 size={13} /> : <Save size={13} />}
                {isSaved ? 'Saved' : 'Save rules'}
              </button>
            </div>
          </div>

          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Rule 1: Confidence Threshold */}
            <div className="evidence-box" style={{ background: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
                <label htmlFor="auto-submit-threshold" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                  Auto-submit evidence threshold
                </label>
                <span className="num" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent)' }}>
                  {autoSubmitThreshold}%
                </span>
              </div>
              <p className="form-hint" style={{ marginBottom: '12px' }}>
                Disputes at or above this defense confidence score can be submitted to PayPal without manual review.
              </p>
              <input
                id="auto-submit-threshold"
                type="range"
                min="60"
                max="99"
                value={autoSubmitThreshold}
                onChange={(e) => setAutoSubmitThreshold(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>60% (More automated)</span>
                <span>99% (Strict review)</span>
              </div>
            </div>

            {/* Rule 2: Goodwill Ceiling */}
            <div className="evidence-box" style={{ background: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
                <label htmlFor="goodwill-ceiling" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                  Goodwill settlement ceiling
                </label>
                <span className="num" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
                  ${goodwillCeiling} USD
                </span>
              </div>
              <p className="form-hint" style={{ marginBottom: '12px' }}>
                Offer an automatic refund or partial credit up to this amount on SNAD or VIP claims to avoid chargeback fees.
              </p>
              <input
                id="goodwill-ceiling"
                type="range"
                min="15"
                max="150"
                step="5"
                value={goodwillCeiling}
                onChange={(e) => setGoodwillCeiling(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>$15 USD</span>
                <span>$150 USD</span>
              </div>
            </div>

            {/* Rule 3: High-Value Signature */}
            <div
              className="evidence-box"
              style={{
                background: '#FFFFFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>
                  Require direct signature above $750
                </div>
                <p className="form-hint" style={{ margin: 0 }}>
                  Enforces PayPal Seller Protection signature confirmation rule for orders of $750 USD or more.
                </p>
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}>
                <input
                  type="checkbox"
                  checked={requireSignature750}
                  onChange={(e) => setRequireSignature750(e.target.checked)}
                  style={{ width: 17, height: 17, accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <span className={`badge ${requireSignature750 ? 'success' : 'neutral'}`}>
                  {requireSignature750 ? 'Enabled' : 'Off'}
                </span>
              </label>
            </div>

            {/* Rule 4: Freight Forwarder Quarantine */}
            <div
              className="evidence-box"
              style={{
                background: '#FFFFFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>
                  Flag commercial freight-forwarder addresses
                </div>
                <p className="form-hint" style={{ margin: 0 }}>
                  Automatically holds fulfillment and attaches re-shipper exclusion notes to any linked claim.
                </p>
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}>
                <input
                  type="checkbox"
                  checked={quarantineReshippers}
                  onChange={(e) => setQuarantineReshippers(e.target.checked)}
                  style={{ width: 17, height: 17, accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <span className={`badge ${quarantineReshippers ? 'success' : 'neutral'}`}>
                  {quarantineReshippers ? 'Enabled' : 'Off'}
                </span>
              </label>
            </div>

            {/* Rule 5: Default Response Tone */}
            <div className="evidence-box" style={{ background: '#FFFFFF' }}>
              <label htmlFor="default-strategy-select" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Default evidence packet style
              </label>
              <p className="form-hint" style={{ marginBottom: '10px' }}>
                Controls how AegisPay frames carrier telemetry, network signals, and settlement terms in PayPal packets.
              </p>
              <select
                id="default-strategy-select"
                className="form-input"
                value={defaultStrategy}
                onChange={(e) => setDefaultStrategy(e.target.value)}
              >
                <option value="LEGAL_AGGRESSIVE">Direct compliance &amp; Seller Protection citation</option>
                <option value="DIPLOMATIC_INQUIRY">Customer-retention settlement &amp; partial offer</option>
                <option value="SYNDICATE_FRAUD_ESCALATION">Commercial forwarder &amp; network escalation</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Live Queue Impact */}
        <div className="panel">
          <div className="panel-head">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} style={{ color: 'var(--success)' }} />
              Live queue coverage
            </h3>
            <span className="badge info num">{disputes.length} cases</span>
          </div>

          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="evidence-box">
              <div className="stat-label" style={{ marginBottom: '4px' }}>
                Open disputes matching auto-submit ({autoSubmitThreshold}%+)
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
                <span className="stat-value num" style={{ fontSize: '24px' }}>
                  {liveImpact.autoEligibleCount} / {liveImpact.openCount}
                </span>
                <span className="num" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)' }}>
                  ${liveImpact.protectedUsd.toFixed(2)} USD
                </span>
              </div>
              <p className="form-hint" style={{ marginTop: '6px', marginBottom: 0 }}>
                Open claims that meet your confidence threshold right now.
              </p>
            </div>

            <dl className="kv" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: '#FFFFFF' }}>
              <dt>Goodwill candidates (&le; ${goodwillCeiling} or SNAD)</dt>
              <dd className="num">{liveImpact.goodwillCount} open</dd>
              <dt>Orders &ge; $750 signature rule</dt>
              <dd className="num">{requireSignature750 ? `${liveImpact.highValueCount} tracked` : 'Rule paused'}</dd>
              <dt>Forwarder cluster flags</dt>
              <dd className="num">{quarantineReshippers ? `${liveImpact.reshipperCount} flagged` : 'Rule paused'}</dd>
              <dt>Active rebuttal preset</dt>
              <dd>
                {defaultStrategy === 'LEGAL_AGGRESSIVE'
                  ? 'Compliance citation'
                  : defaultStrategy === 'DIPLOMATIC_INQUIRY'
                  ? 'Retention offer'
                  : 'Forwarder escalation'}
              </dd>
            </dl>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '12px',
                borderRadius: '8px',
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border-subtle)',
                fontSize: '12.5px',
                lineHeight: 1.5,
                color: 'var(--text-secondary)',
              }}
            >
              <Info size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
              <span>
                Counts update immediately against the active queue loaded from PayPal Sandbox simulation so you can verify rule reach before saving.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
