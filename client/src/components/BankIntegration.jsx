import React, { useState } from 'react';
import { Terminal, Play, Copy, Check, AlertCircle, Code2 } from 'lucide-react';

const SAMPLE_PAYLOAD = {
  disputeCase: {
    dispute_id: 'PP-D-LIVE-402',
    dispute_reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
    dispute_amount: '640.00',
    currency: 'USD',
    buyer_name: 'Hannah Lindqvist',
    order_id: 'ORD-77412',
    item_title: 'Garmin Fenix 8 Solar Sapphire 47mm',
    item_price: '640.00',
    shipping_address: '1180 Congress Ave, Austin, TX 78701',
    carrier: 'FEDEX',
    tracking_number: '991204812093',
    delivery_status: 'DELIVERED',
    signed_by: 'H. LINDQVIST',
  },
};

const CODE_SNIPPETS = {
  curl: `curl -X POST http://localhost:5001/api/ai/analyze \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(SAMPLE_PAYLOAD, null, 2)}'`,
  node: `const res = await fetch('http://localhost:5001/api/ai/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(${JSON.stringify(SAMPLE_PAYLOAD, null, 2)}),
});
const { result } = await res.json();
console.log(result.verdict, result.paypal_rest_payload);`,
  python: `import requests

response = requests.post(
    "http://localhost:5001/api/ai/analyze",
    json=${JSON.stringify(SAMPLE_PAYLOAD, null, 4)},
    timeout=15,
)
print(response.json()["result"]["verdict"])`,
};

export default function BankIntegration() {
  const [activeLang, setActiveLang] = useState('curl');
  const [payloadText, setPayloadText] = useState(JSON.stringify(SAMPLE_PAYLOAD, null, 2));
  const [apiResponse, setApiResponse] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(CODE_SNIPPETS[activeLang]);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setErrorMsg('Clipboard access was denied by the browser.');
    }
  };

  const handleRunLive = async () => {
    setErrorMsg(null);
    setIsRunning(true);
    try {
      const parsed = JSON.parse(payloadText);
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `API returned status ${res.status}`);
      }
      setApiResponse(json);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid JSON or request error.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Endpoints Summary */}
      <div className="evidence-cards-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <div className="panel">
          <div className="panel-body">
            <span className="badge info num" style={{ marginBottom: '8px' }}>POST</span>
            <div className="num" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
              /api/ai/analyze
            </div>
            <p className="form-hint" style={{ margin: 0 }}>
              Evaluates a dispute JSON payload and returns Seller Protection status plus PayPal evidence JSON.
            </p>
          </div>
        </div>

        <div className="panel">
          <div className="panel-body">
            <span className="badge success num" style={{ marginBottom: '8px' }}>POST</span>
            <div className="num" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
              /api/disputes/:id/submit
            </div>
            <p className="form-hint" style={{ margin: 0 }}>
              Submits curated tracking proof and rebuttal notes directly to PayPal Disputes API v1.
            </p>
          </div>
        </div>

        <div className="panel">
          <div className="panel-body">
            <span className="badge neutral num" style={{ marginBottom: '8px' }}>GET</span>
            <div className="num" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
              /api/syndicates
            </div>
            <p className="form-hint" style={{ margin: 0 }}>
              Returns flagged address clusters and commercial freight-forwarder risk groups.
            </p>
          </div>
        </div>
      </div>

      {/* Main Split: SDK Examples + Live Runner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        {/* Left: Code Snippets */}
        <div className="panel">
          <div className="panel-head">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={16} style={{ color: 'var(--accent)' }} />
              Integration examples
            </h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopySnippet}>
              {copiedCode ? <Check size={13} /> : <Copy size={13} />}
              {copiedCode ? 'Copied' : 'Copy snippet'}
            </button>
          </div>

          <div className="panel-body">
            <div className="tabs" role="tablist" aria-label="Code snippet language">
              {[
                { id: 'curl', label: 'cURL' },
                { id: 'node', label: 'Node.js' },
                { id: 'python', label: 'Python' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  role="tab"
                  aria-selected={activeLang === lang.id}
                  className={`tab ${activeLang === lang.id ? 'active' : ''}`}
                  onClick={() => setActiveLang(lang.id)}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <pre className="rebuttal-pre-block num" style={{ marginTop: '14px', minHeight: '320px' }}>
              {CODE_SNIPPETS[activeLang]}
            </pre>
          </div>
        </div>

        {/* Right: Interactive Sandbox Runner */}
        <div className="panel">
          <div className="panel-head">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={16} style={{ color: 'var(--accent)' }} />
              Live API test console
            </h3>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleRunLive}
              disabled={isRunning}
            >
              <Play size={13} />
              {isRunning ? 'Running...' : 'Send request'}
            </button>
          </div>

          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {errorMsg && (
              <div className="error-box" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="api-test-payload">
                Request JSON body (<code className="num">POST /api/ai/analyze</code>)
              </label>
              <textarea
                id="api-test-payload"
                className="form-input num"
                rows={11}
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '12px', lineHeight: 1.5 }}
              />
            </div>

            <div>
              <div className="form-label">Response preview</div>
              {apiResponse ? (
                <pre className="rebuttal-pre-block num" style={{ maxHeight: '260px', overflowY: 'auto' }}>
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              ) : (
                <div className="evidence-box" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Click <strong>Send request</strong> to inspect the full verdict, agent findings, and formatted PayPal payload returned by the backend.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
