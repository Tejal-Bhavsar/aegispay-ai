import React, { useState } from 'react';
import { X, Key, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  paypalStatus,
  onConfigurePayPal,
}) {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const isLive = paypalStatus?.mode === 'LIVE_SANDBOX';

  const handleSave = async (e) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await onConfigurePayPal(clientId, clientSecret);
      setTestResult(res);
    } catch (err) {
      setTestResult({ connected: false, message: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '5px',
                backgroundColor: 'var(--rail-bg)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Key size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '14.5px', fontWeight: 700 }}>
                PayPal Customer Disputes API v1 Configuration
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                Connect OAuth2 Sandbox credentials or operate in deterministic Sandbox Simulation
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '4px 8px' }}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body">
          {/* Active Mode Disclosure */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--paper-subtle)',
              border: '1px solid var(--hairline)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <div>
              <div className="form-label">ACTIVE EXECUTION ENVIRONMENT</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)', marginTop: '2px' }}>
                {isLive ? 'PayPal Live Sandbox (api-m.sandbox.paypal.com)' : 'PayPal Sandbox Simulation Mode'}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--ink-muted)' }}>
                {paypalStatus?.message ||
                  'All dispute evidence payloads and webhook transitions are simulated locally with full schema fidelity.'}
              </div>
            </div>
            <span className={`status-pill ${isLive ? 'defended' : 'pending'}`}>
              {isLive ? 'LIVE SANDBOX' : 'SIMULATION'}
            </span>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">PayPal Sandbox Client ID</label>
              <input
                type="text"
                className="form-input mono"
                placeholder="A21AAK... (Optional — leave blank for Simulation Mode)"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">PayPal Sandbox Client Secret</label>
              <input
                type="password"
                className="form-input mono"
                placeholder="EHK92... (PayPal REST API Secret)"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
              />
            </div>

            {testResult && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  backgroundColor: testResult.connected ? 'var(--forest-tint)' : 'var(--crimson-tint)',
                  border: `1px solid ${testResult.connected ? 'var(--forest-border)' : 'var(--crimson-border)'}`,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: testResult.connected ? 'var(--forest)' : 'var(--crimson)',
                }}
              >
                {testResult.connected ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{testResult.message}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isTesting}
              style={{ width: '100%', padding: '9px' }}
            >
              {isTesting ? 'Authenticating with api-m.sandbox.paypal.com...' : 'Verify & Save PayPal Credentials'}
            </button>
          </form>
        </div>

        <div className="modal-footer">
          <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
            Endpoint: https://api-m.sandbox.paypal.com/v1/oauth2/token
          </span>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
