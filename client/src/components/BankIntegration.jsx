import React, { useState } from 'react';
import { Code, Terminal, Check, Copy, Send, ShieldCheck, Stamp } from 'lucide-react';

export default function BankIntegration({ disputes = [] }) {
  const [selectedDisputeId, setSelectedDisputeId] = useState(
    disputes[0]?.dispute_id || 'PP-D-94821'
  );
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [testPayload, setTestPayload] = useState(
    JSON.stringify(
      {
        dispute_id: 'CARD-DISPUTE-7821',
        dispute_reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
        dispute_amount: '349.99',
        currency: 'USD',
        buyer_name: 'Sarah Jenkins',
        carrier: 'FedEx Ground',
        tracking_number: '789123456789',
        delivery_status: 'DELIVERED',
        signed_by: 'S. JENKINS',
        shipping_address: '100 Market St, San Francisco, CA 94105',
        buyer_claim_notes: 'Customer claims package was missing from porch upon arrival.',
      },
      null,
      2
    )
  );

  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeDispute =
    disputes.find((d) => d.dispute_id === selectedDisputeId) || disputes[0];
  const activeCarrier = activeDispute?.carrier_telemetry || {};

  const paypalProvideEvidencePayload =
    activeDispute?.ai_state?.investigation_report?.paypal_payload_ready || {
      evidence_type:
        activeDispute?.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED'
          ? 'PROOF_OF_DELIVERY'
          : 'PROOF_OF_FULFILLMENT',
      evidence_info: {
        tracking_info: [
          {
            carrier_name: (activeCarrier.carrier || 'FEDEX').split(' ')[0].toUpperCase(),
            tracking_number:
              activeCarrier.tracking_number ||
              activeDispute?.carrier_tracking_key ||
              '948210389102381',
          },
        ],
      },
      notes: `Formal merchant rebuttal compiled by AegisPay for ${
        activeDispute?.dispute_id || 'PP-D-94821'
      } under PayPal Seller Protection Policy. Carrier GPS fix (${
        activeCarrier.geo_coordinates?.latitude || 30.2672
      }, ${activeCarrier.geo_coordinates?.longitude || -97.7431} ±${
        activeCarrier.geo_coordinates?.accuracy_meters || 2.4
      }m) and signatory (${activeCarrier.signed_by || 'M. REYNOLDS'}) verified.`,
      item_tags: [
        'SELLER_PROTECTION_CLAIMED',
        'CARRIER_GPS_VERIFIED',
        'DELIVERY_CONFIRMED',
      ],
    };

  const curlCode = `curl -X POST http://localhost:5001/api/ai/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "disputeCase": {
      "dispute_id": "PP-D-94821",
      "dispute_reason": "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      "dispute_amount": "489.00",
      "buyer_name": "Marcus Reynolds",
      "carrier": "FedEx Ground",
      "tracking_number": "948210389102381",
      "delivery_status": "DELIVERED",
      "signed_by": "M. REYNOLDS",
      "shipping_address": "742 Evergreen Terrace, Austin, TX 78701",
      "buyer_claim_notes": "Customer claims item not received."
    }
  }'`;

  const nodeCode = `const axios = require('axios');

async function dispatchPayPalEvidence(disputeId) {
  // 1. Trigger 5-Agent forensic investigation & Lex legal synthesis
  await axios.post(\`http://localhost:5001/api/disputes/\${disputeId}/investigate\`, {
    strategy: 'LEGAL_AGGRESSIVE'
  });

  // 2. Dispatch compiled evidence packet to PayPal Customer Disputes API v1
  const { data } = await axios.post(\`http://localhost:5001/api/disputes/\${disputeId}/submit\`);
  return data.result;
}`;

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleTestAPI = async () => {
    setIsLoading(true);
    setApiResponse(null);
    try {
      const parsedCase = JSON.parse(testPayload);
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeCase: parsedCase }),
      });
      const data = await res.json();
      setApiResponse(data);
    } catch (err) {
      setApiResponse({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Section 1: PayPal Customer Disputes API v1 Provide-Evidence Inspector */}
      <div className="paper-panel">
        <div className="paper-panel-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                PayPal Customer Disputes API v1 &bull; Evidence Payload Inspector
              </h3>
              <span className="exhibit-tag">
                <Stamp size={11} />
                OPENAPI 3.1 CONTRACT
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '2px' }}>
              Inspect the exact REST payload compiled by Lex Agent for{' '}
              <code className="mono">POST /v1/customer/disputes/&#123;dispute_id&#125;/provide-evidence</code>.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={activeDispute?.dispute_id || ''}
              onChange={(e) => setSelectedDisputeId(e.target.value)}
              className="form-input mono"
              style={{ fontWeight: 600 }}
            >
              {disputes.map((d) => (
                <option key={d.dispute_id} value={d.dispute_id}>
                  {d.dispute_id} — ${d.dispute_amount?.value} ({d.dispute_reason})
                </option>
              ))}
            </select>

            <button
              className="btn btn-secondary"
              onClick={() =>
                copyToClipboard(JSON.stringify(paypalProvideEvidencePayload, null, 2), 'paypal')
              }
            >
              {copiedIndex === 'paypal' ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedIndex === 'paypal' ? 'Copied JSON' : 'Copy PayPal Payload'}</span>
            </button>
          </div>
        </div>

        <div className="paper-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            className="mono"
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--paper-subtle)',
              border: '1px solid var(--hairline)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11.5px',
            }}
          >
            <div>
              <span
                style={{
                  backgroundColor: 'var(--paypal-blue)',
                  color: '#FFFFFF',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontWeight: 700,
                  marginRight: '8px',
                }}
              >
                POST
              </span>
              <span style={{ color: 'var(--ink-primary)', fontWeight: 600 }}>
                https://api-m.sandbox.paypal.com/v1/customer/disputes/{activeDispute?.dispute_id}/provide-evidence
              </span>
            </div>
            <span style={{ color: 'var(--ink-muted)' }}>
              Authorization: Bearer &bull;&bull;&bull;&bull; | Content-Type: application/json
            </span>
          </div>

          <pre className="code-dark-block" style={{ maxHeight: '260px' }}>
            {JSON.stringify(paypalProvideEvidencePayload, null, 2)}
          </pre>
        </div>
      </div>

      {/* Section 2: Interactive Live REST API Test Bench */}
      <div className="paper-panel">
        <div className="paper-panel-header">
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700 }}>
              Live Multi-Agent REST Endpoint Playground (<code className="mono">POST /api/ai/analyze</code>)
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
              Dispatch a raw JSON dispute event to the local Express backend and inspect the synchronous adjudication response.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleTestAPI}
            disabled={isLoading}
          >
            <Send size={13} />
            <span>{isLoading ? 'Executing Request...' : 'Send Live POST Request'}</span>
          </button>
        </div>

        <div className="paper-panel-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="form-label">Request Payload (JSON)</span>
            <textarea
              className="form-input mono"
              rows="11"
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              style={{ fontSize: '11.5px', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="form-label">200 OK Response Body</span>
            <pre className="code-dark-block" style={{ height: '234px', overflowY: 'auto' }}>
              {apiResponse
                ? JSON.stringify(apiResponse, null, 2)
                : '// Click "Send Live POST Request" to execute against /api/ai/analyze'}
            </pre>
          </div>
        </div>
      </div>

      {/* Section 3: SDK & Webhook Integration Reference */}
      <div className="evidence-cards-grid">
        <div className="evidence-box">
          <div className="evidence-box-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={13} style={{ color: 'var(--paypal-blue)' }} />
              cURL CLI Invocation
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => copyToClipboard(curlCode, 0)}
              style={{ fontSize: '11px', padding: '2px 7px' }}
            >
              {copiedIndex === 0 ? <Check size={11} /> : <Copy size={11} />}
              <span>{copiedIndex === 0 ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="rebuttal-pre-block" style={{ maxHeight: '190px' }}>
            {curlCode}
          </pre>
        </div>

        <div className="evidence-box">
          <div className="evidence-box-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Code size={13} style={{ color: 'var(--forest)' }} />
              Node.js Webhook Handler
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => copyToClipboard(nodeCode, 1)}
              style={{ fontSize: '11px', padding: '2px 7px' }}
            >
              {copiedIndex === 1 ? <Check size={11} /> : <Copy size={11} />}
              <span>{copiedIndex === 1 ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="rebuttal-pre-block" style={{ maxHeight: '190px' }}>
            {nodeCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
