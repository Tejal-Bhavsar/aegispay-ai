import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, paypalStatus, onConfigurePayPal }) {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLiveConnected = paypalStatus?.mode === 'LIVE_SANDBOX' && paypalStatus?.connected;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId.trim() || !clientSecret.trim()) {
      setFeedback({
        type: 'error',
        message: 'Enter both a PayPal Sandbox Client ID and Client Secret.',
      });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      const result = await onConfigurePayPal?.(clientId.trim(), clientSecret.trim());
      if (result?.connected) {
        setFeedback({
          type: 'success',
          message: 'Connected to PayPal Developer Sandbox OAuth token endpoint.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: result?.message || 'Credentials saved, but OAuth verification failed.',
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Unable to verify PayPal credentials.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <KeyRound size={18} style={{ color: 'var(--accent)' }} />
            <h2 id="settings-modal-title" style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
              PayPal Sandbox settings
            </h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="evidence-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                  Current environment mode
                </div>
                <div className="stat-meta" style={{ marginTop: '2px' }}>
                  {isLiveConnected
                    ? 'Authenticated against api-m.sandbox.paypal.com'
                    : 'Running built-in PayPal Sandbox dispute simulation'}
                </div>
              </div>
              <span className={`badge ${isLiveConnected ? 'success' : 'info'}`}>
                <ShieldCheck size={12} />
                {isLiveConnected ? 'Live Sandbox' : 'Simulation'}
              </span>
            </div>

            {feedback && (
              <div
                className={feedback.type === 'error' ? 'error-box' : ''}
                style={
                  feedback.type === 'success'
                    ? {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        color: '#065F46',
                        fontSize: '13px',
                        fontWeight: 500,
                      }
                    : { display: 'flex', alignItems: 'center', gap: '8px' }
                }
              >
                {feedback.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="paypal-client-id">
                PayPal Sandbox Client ID
              </label>
              <input
                id="paypal-client-id"
                type="text"
                className="form-input num"
                placeholder="AeB7...SandboxClientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="paypal-client-secret">
                PayPal Sandbox Client Secret
              </label>
              <input
                id="paypal-client-secret"
                type="password"
                className="form-input num"
                placeholder="Enter sandbox app secret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                autoComplete="off"
              />
              <p className="form-hint" style={{ marginBottom: 0 }}>
                Used in memory to mint an OAuth2 bearer token for the PayPal Disputes API v1. Leave unchanged to stay in instant sandbox demo mode.
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Connecting...' : 'Save & verify connection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
