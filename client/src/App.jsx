import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Layers,
  Sparkles,
  Terminal,
  RefreshCw,
  Key,
} from 'lucide-react';

import AIAnalyzer from './components/AIAnalyzer';
import DisputeGrid from './components/DisputeGrid';
import BankIntegration from './components/BankIntegration';
import EvidenceModal from './components/EvidenceModal';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [disputes, setDisputes] = useState([]);
  const [paypalStatus, setPaypalStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('AI_HUB'); // Default to AI Defense Hub

  // Modals & Selection
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  // Fetch real disputes from backend
  const fetchData = useCallback(async () => {
    try {
      const [disputesRes, statusRes] = await Promise.all([
        fetch('/api/disputes').then((r) => r.json()),
        fetch('/api/paypal/status').then((r) => r.json()),
      ]);

      if (disputesRes.disputes) {
        setDisputes(disputesRes.disputes);
      }
      setPaypalStatus(statusRes);
    } catch (err) {
      console.error('Failed to fetch platform state:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Submit Evidence to PayPal API
  const handleSubmitEvidence = async (disputeId) => {
    setIsSubmittingEvidence(true);
    try {
      const res = await fetch(`/api/disputes/${disputeId}/submit`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSelectedDispute(data.dispute);
        await fetchData();
      }
    } catch (err) {
      console.error('Submit evidence failed:', err);
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  // Configure PayPal Credentials
  const handleConfigurePayPal = async (clientId, clientSecret) => {
    const res = await fetch('/api/paypal/configure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, clientSecret }),
    });
    const data = await res.json();
    setPaypalStatus(data);
    return data;
  };

  return (
    <div className="bg-grid-pattern" style={{ minHeight: '100vh' }}>
      <div className="app-container">
        {/* Clean, Modern Header */}
        <header className="top-nav">
          <div className="brand-section">
            <div className="brand-logo-badge">
              <Shield size={24} strokeWidth={2.4} />
            </div>
            <div className="brand-titles">
              <h1>
                AegisPay AI
                <span className="brand-tag">Autonomous Dispute Defense</span>
              </h1>
              <p className="brand-subtitle">
                Multi-Agent Fraud Defense &amp; Chargeback Adjudication for PayPal and Credit Cards
              </p>
            </div>
          </div>

          <div className="nav-actions">
            {/* PayPal Connection Pill */}
            <div
              className="mode-indicator-pill"
              onClick={() => setIsSettingsOpen(true)}
              title="Click to view or edit PayPal Sandbox API credentials"
            >
              <span className="pulse-dot online" />
              <span style={{ fontWeight: 600 }}>
                {paypalStatus?.mode === 'LIVE_SANDBOX' ? 'PayPal Sandbox: Connected' : 'PayPal: Sandbox Mode'}
              </span>
              <Key size={13} style={{ color: 'var(--text-muted)' }} />
            </div>

            <button
              className="btn btn-secondary"
              onClick={fetchData}
              title="Refresh Data"
              style={{ padding: '0.45rem 0.75rem' }}
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* 3 Focused, Purposeful Navigation Tabs */}
        <nav className="tabs-navigation">
          <button
            className={`tab-btn ${activeTab === 'AI_HUB' ? 'active' : ''}`}
            onClick={() => setActiveTab('AI_HUB')}
          >
            <Sparkles size={16} style={{ color: 'var(--paypal-cyan)' }} />
            <span>AI Dispute Defense Engine</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'OPERATIONS' ? 'active' : ''}`}
            onClick={() => setActiveTab('OPERATIONS')}
          >
            <Layers size={16} />
            <span>Dispute Operations (AG Grid)</span>
            <span className="tab-counter">{disputes.length}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'INTEGRATION' ? 'active' : ''}`}
            onClick={() => setActiveTab('INTEGRATION')}
          >
            <Terminal size={16} style={{ color: 'var(--emerald-400)' }} />
            <span>Bank API Integration</span>
          </button>
        </nav>

        {/* Main Content Workspace */}
        <main className="content-wrapper">
          {activeTab === 'AI_HUB' && (
            <AIAnalyzer onDisputeResolved={fetchData} />
          )}

          {activeTab === 'OPERATIONS' && (
            <DisputeGrid
              disputes={disputes}
              onSelectDispute={(dispute) => setSelectedDispute(dispute)}
              onDeploySwarm={(disputeId) => {
                setActiveTab('AI_HUB');
              }}
            />
          )}

          {activeTab === 'INTEGRATION' && (
            <BankIntegration />
          )}
        </main>

        {/* Modals */}
        {selectedDispute && (
          <EvidenceModal
            dispute={selectedDispute}
            onClose={() => setSelectedDispute(null)}
            onSubmitToPayPal={handleSubmitEvidence}
            isSubmitting={isSubmittingEvidence}
          />
        )}

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          paypalStatus={paypalStatus}
          onConfigurePayPal={handleConfigurePayPal}
        />
      </div>
    </div>
  );
}
