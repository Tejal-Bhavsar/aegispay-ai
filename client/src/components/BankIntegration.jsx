import React, { useState } from 'react';
import { Code, Terminal, Check, Copy, Send, Key, ShieldCheck } from 'lucide-react';

export default function BankIntegration() {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [testPayload, setTestPayload] = useState(JSON.stringify({
    dispute_id: "CARD-DISPUTE-7821",
    dispute_reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
    dispute_amount: "349.99",
    currency: "USD",
    buyer_name: "Sarah Jenkins",
    carrier: "FedEx",
    tracking_number: "789123456789",
    delivery_status: "DELIVERED",
    signed_by: "S. JENKINS",
    shipping_address: "100 Market St, San Francisco, CA 94105",
    buyer_claim_notes: "Customer claims package was missing from porch upon arrival."
  }, null, 2));

  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const curlCode = `curl -X POST http://localhost:5001/api/ai/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "disputeCase": {
      "dispute_id": "PP-D-94821",
      "dispute_reason": "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      "dispute_amount": "489.00",
      "buyer_name": "Marcus Reynolds",
      "carrier": "FedEx",
      "tracking_number": "948210389102381",
      "delivery_status": "DELIVERED",
      "signed_by": "M. REYNOLDS",
      "shipping_address": "742 Evergreen Terrace, Austin, TX 78701",
      "buyer_claim_notes": "Customer claims item not received."
    }
  }'`;

  const nodeCode = `const axios = require('axios');

async function evaluateDisputeWithAI(transactionData) {
  const response = await axios.post('http://localhost:5001/api/ai/analyze', {
    disputeCase: transactionData
  });
  
  const { verdict, win_probability_pct, formal_rebuttal_letter } = response.data.result;
  console.log(\`AI Verdict: \${verdict} (\${win_probability_pct}% confidence)\`);
  return response.data.result;
}`;

  const pythonCode = `import requests

def evaluate_dispute(dispute_data):
    url = "http://localhost:5001/api/ai/analyze"
    response = requests.post(url, json={"disputeCase": dispute_data})
    data = response.json()
    return data["result"]

# Example Bank Core Processing
result = evaluate_dispute({
    "dispute_id": "DISPUTE_88190",
    "dispute_reason": "UNAUTHORIZED",
    "dispute_amount": "899.00",
    "delivery_status": "DELIVERED"
})
print("AI Rebuttal:", result["formal_rebuttal_letter"])`;

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>Bank &amp; Merchant Core API Integration</h3>
          <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
            Integrate AegisPay AI directly into banking core systems, fraud platforms, or merchant payment gateways.
          </p>
        </div>
        <span className="status-pill defended" style={{ fontSize: '0.75rem' }}>
          REST API v1.0 Ready
        </span>
      </div>

      {/* Code Snippets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* cURL Implementation */}
        <div className="evidence-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="evidence-box-title">
              <Terminal size={14} style={{ color: 'var(--paypal-cyan)' }} />
              cURL Request
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => copyToClipboard(curlCode, 0)}
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
            >
              {copiedIndex === 0 ? <Check size={12} style={{ color: 'var(--emerald-400)' }} /> : <Copy size={12} />}
              <span>{copiedIndex === 0 ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="rebuttal-pre-block" style={{ maxHeight: '200px' }}>{curlCode}</pre>
        </div>

        {/* Node.js Implementation */}
        <div className="evidence-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="evidence-box-title">
              <Code size={14} style={{ color: 'var(--emerald-400)' }} />
              Node.js / Express Integration
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => copyToClipboard(nodeCode, 1)}
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
            >
              {copiedIndex === 1 ? <Check size={12} style={{ color: 'var(--emerald-400)' }} /> : <Copy size={12} />}
              <span>{copiedIndex === 1 ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="rebuttal-pre-block" style={{ maxHeight: '200px' }}>{nodeCode}</pre>
        </div>
      </div>

      {/* Interactive Live API Playground for Banks */}
      <div
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '14px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#FFFFFF' }}>Interactive Bank API Playground</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Test your transaction payload against the live AegisPay Multi-Agent endpoint.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleTestAPI}
            disabled={isLoading}
            style={{ fontSize: '0.8rem' }}
          >
            <Send size={14} />
            <span>{isLoading ? 'Processing with AI...' : 'Send Live API Request'}</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Request Body (JSON)
            </label>
            <textarea
              className="form-input"
              rows="10"
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Response from AI Multi-Agent Engine
            </label>
            <pre
              className="rebuttal-pre-block"
              style={{ height: '215px', overflowY: 'auto' }}
            >
              {apiResponse ? JSON.stringify(apiResponse, null, 2) : '// Click "Send Live API Request" to see real AI output'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
