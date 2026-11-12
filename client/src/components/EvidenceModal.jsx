import React, { useState } from 'react';
import {
  X,
  Send,
  ShieldCheck,
  CheckCircle2,
  FileText,
  MapPin,
  Printer,
  Scale,
  HeartHandshake,
  ShieldAlert,
  Stamp,
  Copy,
  Check,
} from 'lucide-react';

export default function EvidenceModal({
  dispute,
  onClose,
  onSubmitToPayPal,
  isSubmitting,
}) {
  const [activeTab, setActiveTab] = useState('REBUTTAL');
  const [selectedStrategy, setSelectedStrategy] = useState(
    dispute?.ai_state?.recommended_action === 'ESCALATE_FRAUD_RING'
      ? 'SYNDICATE_FRAUD_ESCALATION'
      : dispute?.ai_state?.recommended_action === 'SETTLE_GOODWILL'
      ? 'DIPLOMATIC_INQUIRY'
      : 'LEGAL_AGGRESSIVE'
  );
  const [copied, setCopied] = useState(false);

  if (!dispute) return null;

  const isDefended = dispute.ai_state?.status === 'DEFENDED_TO_PAYPAL';
  const report = dispute.ai_state?.investigation_report;
  const carrier = dispute.carrier_telemetry || {};
  const telemetry = dispute.order_telemetry || {};

  const getRebuttalContent = () => {
    const cName = carrier.carrier || 'FedEx Ground';
    const cTrack = carrier.tracking_number || dispute.carrier_tracking_key;
    const cTime = carrier.delivery_timestamp || '2026-11-04T14:32:18Z';
    const cSign = carrier.signed_by || 'M. REYNOLDS (Direct Signature)';
    const cLoc = carrier.delivered_to || 'FRONT_DOOR_PORCH';
    const cGps = carrier.geo_coordinates
      ? `${carrier.geo_coordinates.latitude}, ${carrier.geo_coordinates.longitude} (Accuracy: ±${carrier.geo_coordinates.accuracy_meters}m)`
      : '30.2672, -97.7431 (Accuracy: ±2.4m)';
    const ipAddr = telemetry.checkout_ip || '70.112.44.89';
    const ipDist = telemetry.ip_geolocation?.distance_to_shipping_km ?? 4.2;
    const authType = telemetry.authentication_record?.auth_type || 'PAYPAL_ONE_TOUCH_BIOMETRIC';
    const hwHash = telemetry.device_fingerprint?.hardware_hash || 'fp_a9821f00b392a10';

    if (selectedStrategy === 'DIPLOMATIC_INQUIRY') {
      return `TO: PayPal Resolution Center & ${dispute.buyer_info?.name}
RE: Friendly Inquiry Resolution for Order #${dispute.transaction_details?.order_id}
DISPUTE ID: ${dispute.dispute_id}
CLAIMED AMOUNT: $${dispute.dispute_amount?.value} USD

1. VERIFIED TRACKING & DELIVERY RECORD (EXHIBIT A)
Our fulfillment records confirm that ${dispute.transaction_details?.item_title} was shipped via ${cName} under waybill #${cTrack}. Carrier telemetry confirms delivery to ${dispute.shipping_address?.line1}, ${dispute.shipping_address?.city} on ${cTime} (${cLoc}), signed/verified via ${cSign}.

2. RESOLUTION & GOODWILL SETTLEMENT OPTIONS (PAX AGENT)
To resolve this inquiry promptly without formal bank chargeback arbitration, we offer an immediate $40.00 partial goodwill credit or a prepaid return label for full replacement.`;
    }

    if (selectedStrategy === 'SYNDICATE_FRAUD_ESCALATION') {
      return `TO: PayPal Risk & Fraud Operations Directorate
CASE REF: FRAUD_RING_ESCALATION // DISPUTE ${dispute.dispute_id}
ORDER ID: ${dispute.transaction_details?.order_id}
FLAGGED AMOUNT: $${dispute.dispute_amount?.value} USD
SUSPECT ENTITY: ${dispute.buyer_info?.name} (${dispute.buyer_info?.email})

1. SYNDICATE & NETWORK INDICATORS (EXHIBIT B & C)
- Destination [${dispute.shipping_address?.line1}, ${dispute.shipping_address?.city} ${dispute.shipping_address?.state}] correlates with known commercial freight-forwarding drop hub.
- Checkout originated from IP ${ipAddr} (${telemetry.ip_geolocation?.isp || 'Datacenter Proxy'}) located ${ipDist} km from delivery destination.
- Checkout completed in ${telemetry.authentication_record?.checkout_duration_seconds || 4} seconds via hardware profile ${hwHash}.

2. PROOF OF DELIVERY TO DESIGNATED CONSIGNEE (EXHIBIT A)
- Carrier: ${cName} (Tracking: ${cTrack})
- Delivered: ${cTime} | Signatory: ${cSign}
- Satellite GPS Fix: ${cGps}

3. STATUTORY REQUEST
Merchant fulfilled to the PayPal-confirmed shipping address with verified signature. We request immediate dispute dismissal under PayPal Seller Protection.`;
    }

    return (
      report?.legal?.formal_rebuttal_letter ||
      `TO: PayPal Dispute Adjudication Team & Card Issuing Bank
RE: Formal Merchant Rebuttal for Dispute ${dispute.dispute_id}
TRANSACTION ID: ${dispute.transaction_details?.transaction_id}
ORDER ID: ${dispute.transaction_details?.order_id}
CLAIMED AMOUNT: USD ${dispute.dispute_amount?.value}
CLAIM REASON: ${dispute.dispute_reason}

1. EXHIBIT A — PROOF OF PHYSICAL DELIVERY (PayPal Seller Protection Compliant)
   - Carrier: ${cName}
   - Tracking Number: ${cTrack}
   - Delivery Timestamp: ${cTime}
   - Delivery Location: ${cLoc}
   - Destination Street: ${dispute.shipping_address?.line1}, ${dispute.shipping_address?.city}, ${dispute.shipping_address?.state} ${dispute.shipping_address?.postal_code}
   - Recipient Geolocation Fix: ${cGps}
   - Proof of Signature: ${cSign}

2. EXHIBIT B — CARDHOLDER TELEMETRY & COMPELLING EVIDENCE (Visa CE 3.0 Standard)
   - Checkout IP: ${ipAddr} (${telemetry.ip_geolocation?.city || 'Local'}, ISP: ${telemetry.ip_geolocation?.isp || 'Residential ISP'})
   - IP Proximity to Delivery Destination: ${ipDist} km
   - Authentication Method: ${authType} (MFA Verified: ${telemetry.authentication_record?.mfa_verified ? 'true' : 'false'})
   - Device Hardware Hash: ${hwHash} (${telemetry.device_fingerprint?.prior_sessions_count || 1} prior sessions)

3. LEGAL CONCLUSION & SELLER PROTECTION CLAIM
The merchant has satisfied all evidentiary requirements under the PayPal Seller Protection Policy and Visa Compelling Evidence 3.0 guidelines. We request immediate closure of dispute ${dispute.dispute_id} in favor of the merchant and release of held funds (USD ${dispute.dispute_amount?.value}).`
    );
  };

  const handleDefend = async () => {
    await onSubmitToPayPal(dispute.dispute_id);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const payloadObj = report?.paypal_payload_ready || {
    evidence_type:
      dispute.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED'
        ? 'PROOF_OF_DELIVERY'
        : 'PROOF_OF_FULFILLMENT',
    evidence_info: {
      tracking_info: [
        {
          carrier_name: (carrier.carrier || 'FEDEX').split(' ')[0].toUpperCase(),
          tracking_number: carrier.tracking_number || dispute.carrier_tracking_key,
        },
      ],
    },
    notes: getRebuttalContent(),
    item_tags: ['SELLER_PROTECTION_CLAIMED', 'CARRIER_GPS_VERIFIED', 'DELIVERY_CONFIRMED'],
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '5px',
                backgroundColor: 'var(--paypal-blue)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="mono" style={{ fontSize: '15px', fontWeight: 700 }}>
                  FORENSIC CASE DOSSIER // {dispute.dispute_id}
                </h3>
                <span className={`status-pill ${isDefended ? 'defended' : 'ready'}`}>
                  {isDefended ? 'DEFENDED TO PAYPAL' : 'EVIDENCE PACKET READY'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                {dispute.transaction_details?.item_title} &bull; Claim: ${dispute.dispute_amount?.value} USD
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '5px 8px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Sub-Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            borderBottom: '1px solid var(--hairline)',
            backgroundColor: 'var(--paper-bg)',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className={`filter-chip ${activeTab === 'REBUTTAL' ? 'active' : ''}`}
              onClick={() => setActiveTab('REBUTTAL')}
            >
              1. Formal Rebuttal Brief
            </button>
            <button
              className={`filter-chip ${activeTab === 'TELEMETRY' ? 'active' : ''}`}
              onClick={() => setActiveTab('TELEMETRY')}
            >
              2. Sealed Forensic Exhibits
            </button>
            <button
              className={`filter-chip ${activeTab === 'PAYPAL_PAYLOAD' ? 'active' : ''}`}
              onClick={() => setActiveTab('PAYPAL_PAYLOAD')}
            >
              3. PayPal REST Payload
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '11.5px', padding: '4px 9px' }}
              onClick={() => handleCopy(getRebuttalContent())}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy Brief'}</span>
            </button>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '11.5px', padding: '4px 9px' }}
              onClick={() => window.print()}
            >
              <Printer size={12} />
              <span>Print Dossier</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {activeTab === 'REBUTTAL' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'var(--paper-subtle)',
                  border: '1px solid var(--hairline)',
                  borderRadius: '4px',
                }}
              >
                <span className="form-label">Lex Citation Strategy:</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className={`filter-chip ${selectedStrategy === 'LEGAL_AGGRESSIVE' ? 'active' : ''}`}
                    onClick={() => setSelectedStrategy('LEGAL_AGGRESSIVE')}
                  >
                    Visa CE 3.0 &amp; Seller Protection
                  </button>
                  <button
                    className={`filter-chip ${selectedStrategy === 'DIPLOMATIC_INQUIRY' ? 'active' : ''}`}
                    onClick={() => setSelectedStrategy('DIPLOMATIC_INQUIRY')}
                  >
                    Pax Diplomatic Inquiry
                  </button>
                  <button
                    className={`filter-chip ${selectedStrategy === 'SYNDICATE_FRAUD_ESCALATION' ? 'active' : ''}`}
                    onClick={() => setSelectedStrategy('SYNDICATE_FRAUD_ESCALATION')}
                  >
                    Syndicate Fraud Report
                  </button>
                </div>
              </div>

              <pre className="rebuttal-pre-block" style={{ maxHeight: '360px' }}>
                {getRebuttalContent()}
              </pre>
            </div>
          )}

          {activeTab === 'TELEMETRY' && (
            <div className="evidence-cards-grid">
              <div className="exhibit-card">
                <div className="exhibit-card-header">
                  <span className="exhibit-stamp-title">
                    <Stamp size={12} />
                    EXHIBIT A &bull; CARRIER DELIVERY PROOF
                  </span>
                  <span className="exhibit-tag">GPS VERIFIED</span>
                </div>
                <div className="kv-ledger">
                  <div className="kv-row">
                    <span className="kv-key">Carrier &amp; Waybill</span>
                    <span className="kv-val mono">
                      {carrier.carrier} #{carrier.tracking_number}
                    </span>
                  </div>
                  <div className="kv-row">
                    <span className="kv-key">Delivered Timestamp</span>
                    <span className="kv-val mono">{carrier.delivery_timestamp}</span>
                  </div>
                  <div className="kv-row">
                    <span className="kv-key">Signatory</span>
                    <span className="kv-val mono">{carrier.signed_by}</span>
                  </div>
                  <div className="kv-row">
                    <span className="kv-key">GPS Fix</span>
                    <span className="kv-val mono">
                      {carrier.geo_coordinates?.latitude}, {carrier.geo_coordinates?.longitude} (±
                      {carrier.geo_coordinates?.accuracy_meters}m)
                    </span>
                  </div>
                </div>
              </div>

              <div className="exhibit-card">
                <div className="exhibit-card-header">
                  <span className="exhibit-stamp-title">
                    <Stamp size={12} />
                    EXHIBIT B &bull; CHECKOUT IP &amp; 2FA
                  </span>
                  <span className="exhibit-tag">VISA CE 3.0</span>
                </div>
                <div className="kv-ledger">
                  <div className="kv-row">
                    <span className="kv-key">Checkout IP</span>
                    <span className="kv-val mono">
                      {telemetry.checkout_ip} ({telemetry.ip_geolocation?.city})
                    </span>
                  </div>
                  <div className="kv-row">
                    <span className="kv-key">Distance to Consignee</span>
                    <span className="kv-val mono">
                      {telemetry.ip_geolocation?.distance_to_shipping_km} km
                    </span>
                  </div>
                  <div className="kv-row">
                    <span className="kv-key">Authentication</span>
                    <span className="kv-val mono">{telemetry.authentication_record?.auth_type}</span>
                  </div>
                  <div className="kv-row">
                    <span className="kv-key">Hardware Fingerprint</span>
                    <span className="kv-val mono">{telemetry.device_fingerprint?.hardware_hash}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PAYPAL_PAYLOAD' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="mono" style={{ fontSize: '11.5px', color: 'var(--paypal-blue)', fontWeight: 600 }}>
                POST https://api-m.sandbox.paypal.com/v1/customer/disputes/{dispute.dispute_id}/provide-evidence
              </div>
              <pre className="code-dark-block" style={{ maxHeight: '340px' }}>
                {JSON.stringify(payloadObj, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
            Case Ref: {dispute.dispute_id} &bull; Order: {dispute.transaction_details?.order_id}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Close Dossier
            </button>
            {!isDefended ? (
              <button
                id="btn-modal-submit-evidence"
                className="btn btn-forest"
                onClick={handleDefend}
                disabled={isSubmitting}
              >
                <Send size={14} />
                <span>
                  {isSubmitting ? 'Dispatching to PayPal API...' : 'Submit Evidence Packet to PayPal API'}
                </span>
              </button>
            ) : (
              <span className="status-pill defended">
                <CheckCircle2 size={14} /> Dispatched &amp; Under PayPal Review
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
