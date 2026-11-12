import React from 'react';
import { Shield, Zap, RefreshCw, Key, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function TopNav({
  paypalStatus,
  onOpenSettings,
  onSimulateAttack,
  onBatchDefend,
  onResetData,
  isDefendingAll,
  isSimulating,
}) {
  const isLive = paypalStatus?.mode === 'LIVE_SANDBOX';

  return (
    <header className="top-nav">
      <div className="brand-section">
        <div className="brand-logo-badge">
          <Shield size={26} strokeWidth={2.4} />
        </div>
        <div className="brand-titles">
          <h1>
            AegisPay AI
            <span className="brand-tag">Multi-Agent Swarm</span>
          </h1>
          <p className="brand-subtitle">
            Autonomous Dispute Defense & Fraud Interception for PayPal
          </p>
        </div>
      </div>

      <div className="nav-actions">
        {/* PayPal Connectivity Pill */}
        <div
          className="mode-indicator-pill"
          onClick={onOpenSettings}
          title="Click to configure PayPal API Sandbox credentials"
        >
          <span className={`pulse-dot ${isLive ? 'online' : 'online'}`} />
          <span style={{ fontWeight: 600 }}>
            {isLive ? 'PayPal Sandbox: Connected' : 'PayPal: Sandbox Simulation'}
          </span>
          <Key size={14} style={{ color: 'var(--text-muted)' }} />
        </div>

        {/* Simulate Dispute Attack */}
        <button
          id="btn-simulate-dispute"
          className="btn btn-secondary"
          onClick={onSimulateAttack}
          disabled={isSimulating}
          title="Simulate a fresh inbound PayPal dispute webhook"
        >
          <Zap size={15} style={{ color: 'var(--amber-400)' }} />
          <span>{isSimulating ? 'Injecting...' : 'Simulate Dispute Attack'}</span>
        </button>

        {/* Auto-Defend All */}
        <button
          id="btn-auto-defend-all"
          className="btn btn-emerald"
          onClick={onBatchDefend}
          disabled={isDefendingAll}
          title="Run Multi-Agent Swarm across all pending disputes"
        >
          <ShieldCheck size={16} />
          <span>{isDefendingAll ? 'Defending Swarm...' : 'Auto-Defend All'}</span>
        </button>

        {/* Reset */}
        <button
          className="btn btn-secondary"
          onClick={onResetData}
          title="Reset dataset to initial state"
          style={{ padding: '0.5rem 0.75rem' }}
        >
          <RefreshCw size={15} />
        </button>
      </div>
    </header>
  );
}
