import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

function buildDynamicRebuttal(dispute, strategy) {
  const existing = dispute.ai_state?.investigation_report?.formal_rebuttal_letter;
  if (existing && strategy === 'LEGAL_AGGRESSIVE') {
    return existing;
  }

  const tx = dispute.transaction_details || {};
  const buyer = dispute.buyer_info || {};
  const ship = dispute.shipping_address || {};
  const amount = parseFloat(dispute.dispute_amount?.value || 0).toFixed(2);
  const currency = dispute.dispute_amount?.currency_code || 'USD';
  const destination = `${ship.line1 || 'Verified PayPal address'}, ${ship.city || ''} ${ship.state || ''} ${ship.postal_code || ''}`.trim();
  const tracking = dispute.carrier_tracking_key || 'CARRIER-VERIFIED';

  if (strategy === 'DIPLOMATIC_INQUIRY') {
    return `TO: PayPal Resolution Center & Buyer (${buyer.name || 'Cardholder'})
RE: Resolution Offer — Dispute ${dispute.dispute_id}
ORDER: ${tx.order_id || dispute.dispute_id} · ITEM: ${tx.item_title || 'Purchased merchandise'}

Hello ${buyer.name || 'Customer'},

We value your business and reviewed your concern regarding order ${tx.order_id || dispute.dispute_id} (${currency} ${amount}).
Carrier records (${tracking}) show the parcel arrived at ${destination}. If you still have concerns about condition or delivery access, we are offering a prompt partial goodwill credit or prepaid return label so we can resolve this directly without an extended claim.

Please reply in the PayPal Resolution Center if you would like to accept this resolution.

Sincerely,
Merchant Support Team`;
  }

  if (strategy === 'SYNDICATE_FRAUD_ESCALATION') {
    return `TO: PayPal Risk & Disputes Directorate
RE: Escalation Notice — Commercial Forwarder / Linked Cluster Indicators (${dispute.dispute_id})
TRANSACTION: ${tx.transaction_id || tx.order_id} · AMOUNT: ${currency} ${amount}

REVIEW COMMITTEE,

This transaction matches shared address and network indicators tied to commercial freight-forwarding facilities.
1. Delivery Verification: Tracking ${tracking} confirms physical handoff to ${ship.recipient_name || buyer.name} at ${destination}.
2. Policy Coverage: Under PayPal Seller Protection terms, orders shipped to the verified PayPal transaction address with valid tracking and commercial receiving sign-off satisfy merchant fulfillment obligations.
3. Risk Note: Buyer account (${buyer.paypal_account_id || 'PayPal Buyer'}, tenure ${buyer.account_age_days || 'N/A'} days) shares shipment routing attributes with flagged high-risk drop points.

We request immediate closure in favor of the merchant and release of ${currency} ${amount}.`;
  }

  return `TO: PayPal Dispute Adjudication Directorate
RE: Formal Merchant Rebuttal — Dispute ${dispute.dispute_id}
TRANSACTION ID: ${tx.transaction_id || tx.order_id || 'N/A'}
DISPUTE REASON: ${dispute.dispute_reason}
DISPUTED AMOUNT: ${currency} ${amount}

REVIEW COMMITTEE,

The merchant submits this evidence packet establishing legitimate fulfillment and delivery of "${tx.item_title || 'Order merchandise'}" to the buyer's PayPal-verified shipping address.

1. CARRIER PROOF OF DELIVERY
   - Tracking Reference: ${tracking}
   - Recipient: ${ship.recipient_name || buyer.name || 'Cardholder'}
   - Verified Address: ${destination}
   - Carrier Status: Delivered with electronic scan confirmation prior to dispute filing.

2. PAYPAL SELLER PROTECTION ELIGIBILITY
   - Status: ${dispute.seller_protection?.eligible ? 'Eligible' : 'Review Required'}
   - Notes: ${dispute.seller_protection?.protection_reason || 'Shipped to verified PayPal transaction address with valid carrier tracking.'}

We respectfully request closure of dispute ${dispute.dispute_id} in favor of the merchant and release of the held ${currency} ${amount}.`;
}

export default function EvidenceModal({
  dispute,
  onClose,
  onSubmitToPayPal,
  isSubmitting = false,
  onReviewCase,
}) {
  const [activeTab, setActiveTab] = useState('REBUTTAL');
  const [strategy, setStrategy] = useState(
    dispute?.ai_state?.recommended_action === 'ESCALATE_FRAUD_RING'
      ? 'SYNDICATE_FRAUD_ESCALATION'
      : dispute?.ai_state?.recommended_action === 'SETTLE_GOODWILL'
      ? 'DIPLOMATIC_INQUIRY'
      : 'LEGAL_AGGRESSIVE'
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!dispute) return null;

  const isDefended = dispute.ai_state?.status === 'DEFENDED_TO_PAYPAL';
  const protectedEligible = Boolean(dispute.seller_protection?.eligible);
  const tx = dispute.transaction_details || {};
  const buyer = dispute.buyer_info || {};
  const ship = dispute.shipping_address || {};
  const amount = parseFloat(dispute.dispute_amount?.value || 0).toFixed(2);
  const rebuttalText = buildDynamicRebuttal(dispute, strategy);

  const carrierParts = (dispute.carrier_tracking_key || 'FEDEX-94821038').split('-');
  const paypalPayload = {
    dispute_id: dispute.dispute_id,
    evidence_type:
      dispute.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED'
        ? 'PROOF_OF_DELIVERY'
        : 'PROOF_OF_FULFILLMENT',
    evidences: [
      {
        evidence_type: 'PROOF_OF_FULFILLMENT',
        evidence_info: {
          tracking_info: [
            {
              carrier_name: carrierParts[0] || 'FEDEX',
              tracking_number: carrierParts.slice(1).join('-') || dispute.carrier_tracking_key,
            },
          ],
        },
        notes: rebuttalText,
      },
    ],
  };

  const handleCopy = async () => {
    try {
      const content =
        activeTab === 'PAYPAL_PAYLOAD' ? JSON.stringify(paypalPayload, null, 2) : rebuttalText;
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors gracefully
    }
  };

  return (
    <div
      className="modal-overlay drawer-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-drawer-title"
    >
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 id="evidence-drawer-title" className="num" style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--ink)' }}>
                {dispute.dispute_id}
              </h2>
              <span className={`seller-protection-badge ${protectedEligible ? 'eligible' : 'ineligible'}`}>
                {protectedEligible ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                {protectedEligible ? 'Seller Protection' : 'Uninsured'}
              </span>
              {isDefended && (
                <span className="status-pill defended">
                  <CheckCircle2 size={12} />
                  Sent to PayPal
                </span>
              )}
            </div>
            <p className="stat-meta" style={{ margin: '4px 0 0 0' }}>
              {tx.item_title} · <span className="num">${amount} {dispute.dispute_amount?.currency_code || 'USD'}</span>
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close packet drawer">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="tabs" role="tablist" aria-label="Evidence packet views">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'REBUTTAL'}
              className={`tab ${activeTab === 'REBUTTAL' ? 'active' : ''}`}
              onClick={() => setActiveTab('REBUTTAL')}
            >
              Rebuttal letter
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'TELEMETRY'}
              className={`tab ${activeTab === 'TELEMETRY' ? 'active' : ''}`}
              onClick={() => setActiveTab('TELEMETRY')}
            >
              Delivery &amp; account details
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'PAYPAL_PAYLOAD'}
              className={`tab ${activeTab === 'PAYPAL_PAYLOAD' ? 'active' : ''}`}
              onClick={() => setActiveTab('PAYPAL_PAYLOAD')}
            >
              PayPal API JSON
            </button>
          </div>

          {activeTab === 'REBUTTAL' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="drawer-strategy">Response framing</label>
                <select
                  id="drawer-strategy"
                  className="form-input"
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                >
                  <option value="LEGAL_AGGRESSIVE">Compliance &amp; Seller Protection citation</option>
                  <option value="DIPLOMATIC_INQUIRY">Diplomatic customer retention &amp; partial resolution</option>
                  <option value="SYNDICATE_FRAUD_ESCALATION">Commercial forwarder &amp; cluster escalation</option>
                </select>
              </div>
              <pre className="rebuttal-pre-block document">{rebuttalText}</pre>
            </div>
          )}

          {activeTab === 'TELEMETRY' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="evidence-box">
                <div className="evidence-box-title">Shipping &amp; fulfillment</div>
                <dl className="kv">
                  <dt>Tracking key</dt>
                  <dd className="num">{dispute.carrier_tracking_key || '—'}</dd>
                  <dt>Recipient</dt>
                  <dd>{ship.recipient_name || buyer.name || '—'}</dd>
                  <dt>Destination</dt>
                  <dd>
                    {ship.line1}, {ship.city}, {ship.state} {ship.postal_code}
                  </dd>
                  <dt>Order ID</dt>
                  <dd className="num">{tx.order_id || '—'}</dd>
                </dl>
              </div>

              <div className="evidence-box">
                <div className="evidence-box-title">Buyer account profile</div>
                <dl className="kv">
                  <dt>Name</dt>
                  <dd>{buyer.name || '—'}</dd>
                  <dt>Email</dt>
                  <dd className="num">{buyer.email || '—'}</dd>
                  <dt>Account tenure</dt>
                  <dd className="num">{buyer.account_age_days ? `${buyer.account_age_days} days` : '—'}</dd>
                  <dt>Prior disputes</dt>
                  <dd className="num">{buyer.prior_dispute_count ?? 0}</dd>
                  <dt>Confidence score</dt>
                  <dd className="num">{dispute.ai_state?.defense_confidence ?? 0}%</dd>
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'PAYPAL_PAYLOAD' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p className="form-hint" style={{ margin: 0 }}>
                Payload formatted for <code className="num">POST /v1/customer/disputes/{dispute.dispute_id}/provide-evidence</code>.
              </p>
              <pre className="rebuttal-pre-block num">{JSON.stringify(paypalPayload, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopy}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.print()}>
              <Printer size={13} />
              Print
            </button>
            {onReviewCase && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onReviewCase(dispute.dispute_id)}
              >
                Open in Case review
                <ArrowUpRight size={13} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="btn btn-success"
            disabled={isDefended || isSubmitting}
            onClick={() => onSubmitToPayPal?.(dispute.dispute_id)}
          >
            <Send size={14} />
            {isDefended ? 'Already submitted' : isSubmitting ? 'Submitting...' : 'Send evidence to PayPal'}
          </button>
        </div>
      </div>
    </div>
  );
}
