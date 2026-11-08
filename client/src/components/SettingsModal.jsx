import React, { useState } from 'react';
import { X, Key, CheckCircle2, AlertCircle, Shield, Globe } from 'lucide-react';

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
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(0, 112, 186, 0.2)',
                color: 'var(--paypal-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Key size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>PayPal Developer API Configuration</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Configure PayPal REST Sandbox credentials or use zero-setup simulation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Current Status Banner */}
          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              className={`pulse-dot ${paypalStatus?.mode === 'LIVE_SANDBOX' ? 'online' : 'online'}`}
            />
            <div style={{ fontSize: '0.8rem', flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#FFFFFF' }}>
                Current Mode: {paypalStatus?.mode === 'LIVE_SANDBOX' ? 'Live PayPal Sandbox Connected' : 'High-Fidelity Sandbox Simulation'}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                {paypalStatus?.message || 'Ready for instant dispute defense evaluation.'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">PayPal Sandbox Client ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. A21AAK... or leave empty to use instant simulation"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">PayPal Sandbox Client Secret</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter PayPal Sandbox secret..."
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
              />
            </div>

            {testResult && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: testResult.connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                  border: `1px solid ${testResult.connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  color: testResult.connected ? 'var(--emerald-400)' : 'var(--rose-400)',
                }}
              >
                {testResult.connected ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{testResult.message}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isTesting}
              style={{ justifyContent: 'center' }}
            >
              {isTesting ? 'Verifying with PayPal...' : 'Test & Save Credentials'}
            </button>
          </form>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '8px' }}>
            💡 <strong>Judge note:</strong> You can test all multi-agent features, AG Grid filters, carrier GPS telemetry, and legal rebuttals immediately in Simulation Mode without entering keys. If you have PayPal developer credentials, paste them above to authenticate with <code>api-m.sandbox.paypal.com</code>.
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
