import React, { useState } from 'react';
import { Sliders, ShieldCheck, Zap, DollarSign, Lock, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';

export default function PolicyStudio() {
  const [autoSubmitThreshold, setAutoSubmitThreshold] = useState(88);
  const [goodwillCeiling, setGoodwillCeiling] = useState(45);
  const [requireSignature750, setRequireSignature750] = useState(true);
  const [quarantineReShippers, setQuarantineReShippers] = useState(true);
  const [defaultStrategy, setDefaultStrategy] = useState('LEGAL_AGGRESSIVE');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    setAutoSubmitThreshold(88);
    setGoodwillCeiling(45);
    setRequireSignature750(true);
    setQuarantineReShippers(true);
    setDefaultStrategy('LEGAL_AGGRESSIVE');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(15, 23, 42, 0.8))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
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
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.25)',
              color: '#A5B4FC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sliders size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>Autonomous Dispute Policy Studio</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Configure underwriting rules, automatic PayPal API submission triggers, and customer goodwill thresholds.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleReset}>
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>
          <button className="btn btn-emerald" onClick={handleSave}>
            {isSaved ? <CheckCircle2 size={15} /> : <ShieldCheck size={15} />}
            <span>{isSaved ? 'Policy Saved!' : 'Save Active Policy'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Simulated Financial Impact on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>
        {/* Policy Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Rule 1: Auto-Submission Confidence */}
          <div className="evidence-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#FFFFFF' }}>
                  Automatic PayPal API Submission Threshold
                </strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  When AegisPay win probability equals or exceeds this threshold, auto-transmit evidence to PayPal without manual review.
                </p>
              </div>
              <span className="kpi-value" style={{ fontSize: '1.4rem', color: 'var(--emerald-400)' }}>
                {autoSubmitThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="70"
              max="98"
              value={autoSubmitThreshold}
              onChange={(e) => setAutoSubmitThreshold(Number(e.target.value))}
              style={{ accentColor: 'var(--emerald-400)', marginTop: '0.5rem', width: '100%' }}
            />
          </div>

          {/* Rule 2: Goodwill Settlement Ceiling */}
          <div className="evidence-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#FFFFFF' }}>
                  Pax Goodwill Pre-Dispute Micro-Refund Ceiling
                </strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Maximum credit Pax Agent can autonomously offer during Inquiry phase to bypass $20-$50 bank chargeback fees.
                </p>
              </div>
              <span className="kpi-value" style={{ fontSize: '1.4rem', color: 'var(--amber-400)' }}>
                ${goodwillCeiling}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={goodwillCeiling}
              onChange={(e) => setGoodwillCeiling(Number(e.target.value))}
              style={{ accentColor: 'var(--amber-400)', marginTop: '0.5rem', width: '100%' }}
            />
          </div>

          {/* Rule 3: High-Value Signature Enforcement */}
          <div className="evidence-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Lock size={18} style={{ color: 'var(--paypal-cyan)' }} />
                <div>
                  <strong style={{ fontSize: '0.875rem', color: '#FFFFFF' }}>
                    Enforce PayPal $750+ Signature Confirmation Rule
                  </strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Mandates carrier direct signature verification on claims $\ge \$750$ to guarantee Seller Protection coverage.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={requireSignature750}
                onChange={(e) => setRequireSignature750(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--paypal-blue)' }}
              />
            </div>
          </div>

          {/* Rule 4: Quarantine Freight Forwarders */}
          <div className="evidence-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <AlertTriangle size={18} style={{ color: 'var(--rose-400)' }} />
                <div>
                  <strong style={{ fontSize: '0.875rem', color: '#FFFFFF' }}>
                    Auto-Quarantine Freight-Forwarder Hotspots
                  </strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Automatically tag orders destined to commercial re-shippers (Delaware 19810, Doral FL 33166) for syndicate review.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={quarantineReShippers}
                onChange={(e) => setQuarantineReShippers(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--rose-500)' }}
              />
            </div>
          </div>

          {/* Rule 5: Default Defense Strategy */}
          <div className="evidence-box">
            <strong style={{ fontSize: '0.875rem', color: '#FFFFFF' }}>
              Lex Agent Default Rebuttal Tone &amp; Standard
            </strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Controls the legal citation model generated for bank issuing arbitration.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                className={`filter-chip ${defaultStrategy === 'LEGAL_AGGRESSIVE' ? 'active' : ''}`}
                onClick={() => setDefaultStrategy('LEGAL_AGGRESSIVE')}
                style={{ textAlign: 'center', padding: '0.5rem' }}
              >
                Visa CE 3.0 &amp; Seller Protection
              </button>
              <button
                type="button"
                className={`filter-chip ${defaultStrategy === 'DIPLOMATIC_INQUIRY' ? 'active' : ''}`}
                onClick={() => setDefaultStrategy('DIPLOMATIC_INQUIRY')}
                style={{ textAlign: 'center', padding: '0.5rem' }}
              >
                Diplomatic Inquiry
              </button>
              <button
                type="button"
                className={`filter-chip ${defaultStrategy === 'SYNDICATE_FRAUD_ESCALATION' ? 'active' : ''}`}
                onClick={() => setDefaultStrategy('SYNDICATE_FRAUD_ESCALATION')}
                style={{ textAlign: 'center', padding: '0.5rem' }}
              >
                Syndicate Fraud Report
              </button>
            </div>
          </div>
        </div>

        {/* Real-Time Policy Impact Simulator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} style={{ color: 'var(--paypal-cyan)' }} />
              <h4 style={{ fontSize: '1rem' }}>Simulated ROI Impact</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Projected Annual Capital Saved
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-400)', fontFamily: 'var(--font-brand)' }}>
                  $148,420 / yr
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Casework Hours Eliminated
                </span>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF' }}>
                  1,840 Hours / yr
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Zero-Touch Auto-Resolved Rate
                </span>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--paypal-cyan)' }}>
                  87.4%
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Dispute Fee Penalties Avoided
                </span>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--amber-400)' }}>
                  $14,200.00
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '10px',
                padding: '0.75rem',
                fontSize: '0.75rem',
                color: '#E2E8F0',
                lineHeight: 1.5,
              }}
            >
              ✅ Current rule configuration complies 100% with PayPal Seller Protection guidelines and Visa Compelling Evidence 3.0 mandates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
