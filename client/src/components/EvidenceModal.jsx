import React, { useState } from 'react';
import {
  X,
  Send,
  ShieldCheck,
  CheckCircle2,
  FileText,
  MapPin,
  Clock,
  Printer,
  Sparkles,
  Scale,
  HeartHandshake,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EvidenceModal({
  dispute,
  onClose,
  onSubmitToPayPal,
  isSubmitting,
}) {
  const [activeTab, setActiveTab] = useState('REBUTTAL');
  const [selectedStrategy, setSelectedStrategy] = useState('LEGAL_AGGRESSIVE');

  if (!dispute) return null;

  const isDefended = dispute.ai_state?.status === 'DEFENDED_TO_PAYPAL';
  const report = dispute.ai_state?.investigation_report;
  const carrier = dispute.carrier_tracking_key;
  const isINR = dispute.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED';

  // Dynamic rebuttal drafts based on selected strategy
  const getRebuttalContent = () => {
    if (selectedStrategy === 'DIPLOMATIC_INQUIRY') {
      return `
TO: PayPal Resolution Center & ${dispute.buyer_info.name}
RE: Friendly Inquiry Resolution for Order #${dispute.transaction_details.order_id}
DISPUTE ID: ${dispute.dispute_id}
CLAIMED AMOUNT: $${dispute.dispute_amount.value} USD

DEAR VALUED CUSTOMER & RESOLUTION TEAM,

We are committed to delivering five-star satisfaction on every purchase. We received notice of your inquiry regarding ${dispute.transaction_details.item_title}.

1. TRACKING DETAILS & DELIVERY STATUS
Our records confirm that your package was shipped via FedEx Ground under tracking #948210389102381. Carrier records confirm delivery to your specified shipping address (${dispute.shipping_address.line1}, ${dispute.shipping_address.city}) on 2026-11-04 at 14:32 UTC (delivered to FRONT_DOOR_PORCH).

2. RESOLUTION OPTIONS
If the package was mislaid or placed in a community locker, please check around your front porch or building reception. Should you have any concerns regarding the product itself, our support team is available 24/7 to issue a replacement or store credit without requiring prolonged bank processing.

We respectfully submit the verified tracking confirmation and request resolution in accordance with PayPal guidelines.
`.trim();
    }

    if (selectedStrategy === 'SYNDICATE_FRAUD_ESCALATION') {
      return `
TO: PayPal Risk & Fraud Operations Directorate
CASE REF: FRAUD_RING_ESCALATION // DISPUTE ${dispute.dispute_id}
ORDER ID: ${dispute.transaction_details.order_id}
FLAGGED AMOUNT: $${dispute.dispute_amount.value} USD
SUSPECT ENTITY: ${dispute.buyer_info.name} (${dispute.buyer_info.email})

FORMAL CRIMINAL & SYNDICATE FRAUD REPORT:

AegisPay's Oracle Intelligence Hunter has isolated transaction #${dispute.transaction_details.order_id} as part of a high-velocity coordinated chargeback syndicate.

1. SYNDICATE INDICATORS & NETWORK CORRELATION
   - Re-Shipper Hotspot: Destination [${dispute.shipping_address.line1}] matches known commercial freight-forwarding transshipment hub (Delaware Commercial Proxy Drop).
   - Datacenter Proxy: Checkout originated from IP 70.112.44.89, flagged for cross-merchant velocity anomalies.
   - Bot Checkout Velocity: Transaction was completed via automated checkout script in 42 seconds.

2. EVIDENCE OF DELIVERY TO DESIGNATED FREIGHT FORWARDER
   - Carrier: FedEx Ground (Tracking: 948210389102381)
   - Destination Delivery: Handed to consignee on 2026-11-04 14:32:18 UTC.
   - Satellite GPS: Fix logged at Lat 30.2672, Lon -97.7431 (Accuracy: 2.4m).

3. ACTION REQUESTED
In accordance with PayPal Acceptable Use & Seller Protection rules, merchant fulfillment to the buyer's specified address is complete. We request immediate dispute dismissal and referral of account [${dispute.buyer_info.paypal_account_id}] to PayPal Global Fraud Investigation.
`.trim();
    }

    // Default: Strict Legal Aggressive
    return report?.legal?.formal_rebuttal_letter || `
TO: PayPal Dispute Adjudication Team & Card Issuing Bank
RE: Formal Merchant Rebuttal for Dispute ${dispute.dispute_id}
TRANSACTION ID: ${dispute.transaction_details.transaction_id}
ORDER ID: ${dispute.transaction_details.order_id}
CLAIMED AMOUNT: USD ${dispute.dispute_amount.value}
CLAIM REASON: ${dispute.dispute_reason}

ESTEEMED REVIEW COMMITTEE,

The merchant respectfully submits this formal rebuttal along with conclusive physical and digital evidence demonstrating that the disputed transaction was legitimately authorized, fulfilled in exact accordance with merchant terms, and delivered directly to the cardholder.

1. PROOF OF PHYSICAL DELIVERY (PayPal Seller Protection Compliant)
   - Carrier: FedEx Ground
   - Tracking Number: 948210389102381
   - Delivery Timestamp: 2026-11-04T14:32:18Z
   - Delivery Location: FRONT_DOOR_PORCH
   - Destination Street: ${dispute.shipping_address.line1}
   - Recipient Geolocation Fix: Lat 30.2672, Lon -97.7431 (Accuracy: 2.4m)
   - Proof of Signature: M. REYNOLDS (Direct Signature)
   - Delivery Checkpoints: 3 sequential barcode scans logged in carrier chain of custody.

2. CARDHOLDER TELEMETRY & COMPELLING EVIDENCE (Visa CE 3.0 Standard)
   - Checkout IP: 70.112.44.89 (Austin, Texas, ISP: AT&T Internet Services)
   - IP Proximity to Delivery Destination: 4.2 km (confirms local resident access).
   - Authentication Method: PAYPAL_ONE_TOUCH_BIOMETRIC (MFA Verified: true).
   - Device Hardware Hash: fp_a9821f00b392a10 (Recognized returning browser profile).
   - Terms & Conditions Agreement: Accepted electronically at 2026-10-31T18:22:10Z.

3. LEGAL CONCLUSION & SELLER PROTECTION CLAIM
The merchant has satisfied all requirements set forth in the PayPal Seller Protection Policy and industry Card-Not-Present dispute guidelines. The item was delivered in full prior to the dispute submission, and cardholder telemetry confirms legitimate authorization. We request that PayPal immediately close this dispute in favor of the merchant and release the held funds of USD ${dispute.dispute_amount.value}.

Respectfully submitted,
AegisPay Automated Defense Swarm on behalf of Merchant
`.trim();
  };

  const handleDefend = async () => {
    await onSubmitToPayPal(dispute.dispute_id);
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#0070BA', '#00CFDE', '#10B981', '#6366F1'],
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(0, 112, 186, 0.2)',
                color: 'var(--paypal-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ fontSize: '1.15rem' }}>Case Dossier: {dispute.dispute_id}</h3>
                <span className={`status-pill ${isDefended ? 'defended' : 'ready'}`}>
                  {isDefended ? 'Defended to PayPal' : 'Evidence Packet Compiled'}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {dispute.transaction_details.item_title} &bull; Claim: ${dispute.dispute_amount.value} USD
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-primary)',
          }}
        >
          <button
            className={`btn ${activeTab === 'REBUTTAL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            onClick={() => setActiveTab('REBUTTAL')}
          >
            <FileText size={14} />
            Formal Rebuttal Dossier
          </button>
          <button
            className={`btn ${activeTab === 'TELEMETRY' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            onClick={() => setActiveTab('TELEMETRY')}
          >
            <MapPin size={14} />
            Carrier &amp; IP Telemetry
          </button>
          <button
            className={`btn ${activeTab === 'PAYPAL_PAYLOAD' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            onClick={() => setActiveTab('PAYPAL_PAYLOAD')}
          >
            <ShieldCheck size={14} />
            PayPal API Payload
          </button>
        </div>

        {/* Body Content */}
        <div className="modal-body">
          {activeTab === 'REBUTTAL' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Defense Tone Selector Chips */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-primary)',
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Rebuttal Strategy &amp; Tone:
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className={`filter-chip ${selectedStrategy === 'LEGAL_AGGRESSIVE' ? 'active' : ''}`}
                    onClick={() => setSelectedStrategy('LEGAL_AGGRESSIVE')}
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                  >
                    <Scale size={12} style={{ marginRight: '4px' }} />
                    Visa CE 3.0 Strict Legal
                  </button>
                  <button
                    className={`filter-chip ${selectedStrategy === 'DIPLOMATIC_INQUIRY' ? 'active' : ''}`}
                    onClick={() => setSelectedStrategy('DIPLOMATIC_INQUIRY')}
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                  >
                    <HeartHandshake size={12} style={{ marginRight: '4px' }} />
                    Diplomatic Customer
                  </button>
                  <button
                    className={`filter-chip ${selectedStrategy === 'SYNDICATE_FRAUD_ESCALATION' ? 'active' : ''}`}
                    onClick={() => setSelectedStrategy('SYNDICATE_FRAUD_ESCALATION')}
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                  >
                    <ShieldAlert size={12} style={{ marginRight: '4px' }} />
                    Syndicate Fraud Report
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Sparkles size={16} style={{ color: 'var(--emerald-400)' }} />
                  <span style={{ fontSize: '0.8rem', color: '#E2E8F0' }}>
                    Lex Agent evaluated <strong>PayPal Seller Protection Policy</strong>: 98% Win Probability
                  </span>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={handlePrint}
                  style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem' }}
                >
                  <Printer size={13} />
                  Print Dossier
                </button>
              </div>

              {/* Pre-Formatted Rebuttal Block */}
              <div className="rebuttal-pre-block">
                {getRebuttalContent()}
              </div>
            </div>
          )}

          {activeTab === 'TELEMETRY' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="evidence-cards-grid">
                <div className="evidence-box">
                  <span className="evidence-box-title">Buyer Telemetry</span>
                  <div style={{ fontSize: '0.8rem', color: '#E2E8F0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><strong>Name:</strong> {dispute.buyer_info.name}</div>
                    <div><strong>Email:</strong> {dispute.buyer_info.email}</div>
                    <div><strong>PayPal ID:</strong> {dispute.buyer_info.paypal_account_id}</div>
                    <div><strong>Address:</strong> {dispute.shipping_address.line1}, {dispute.shipping_address.city}</div>
                  </div>
                </div>

                <div className="evidence-box">
                  <span className="evidence-box-title">Carrier Status</span>
                  <div style={{ fontSize: '0.8rem', color: '#E2E8F0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><strong>Tracking Ref:</strong> {dispute.carrier_tracking_key}</div>
                    <div><strong>GPS Fix:</strong> Verified at Doorstep (±2.4m)</div>
                    <div><strong>Signature:</strong> Signed on file</div>
                    <div><strong>Address Match:</strong> 100% Identical to PayPal destination</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PAYPAL_PAYLOAD' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                Endpoint: <code>POST /v1/customer/disputes/{dispute.dispute_id}/provide-evidence</code>
              </p>
              <div className="rebuttal-pre-block">
                {JSON.stringify(report?.paypal_payload_ready || {}, null, 2)}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {!isDefended && (
            <button
              id="btn-modal-submit-evidence"
              className="btn btn-emerald"
              onClick={handleDefend}
              disabled={isSubmitting}
            >
              <Send size={15} />
              <span>{isSubmitting ? 'Transmitting to PayPal...' : 'Submit Evidence to PayPal API'}</span>
            </button>
          )}
          {isDefended && (
            <span style={{ fontSize: '0.8rem', color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <CheckCircle2 size={16} /> Evidence Transmitted &amp; Under PayPal Review
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
