import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Layers,
  Sparkles,
  Globe,
  Code,
  Sliders,
  Send,
  RefreshCw,
  Key,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import TopNav from './components/TopNav';
import AIAnalyzer from './components/AIAnalyzer';
import DisputeGrid from './components/DisputeGrid';
import ForensicsViewer from './components/ForensicsViewer';
import PayPalInspector from './components/PayPalInspector';
import PolicyStudio from './components/PolicyStudio';
import EvidenceModal from './components/EvidenceModal';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [disputes, setDisputes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [paypalStatus, setPaypalStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('AI_HUB'); // Default to the AI Hub!

  // Modals & Selection
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  // Fetch live state from backend
  const fetchData = useCallback(async () => {
    try {
      const [disputesRes, analyticsRes, statusRes] = await Promise.all([
        fetch('/api/disputes').then((r) => r.json()),
        fetch('/api/analytics').then((r) => r.json()),
        fetch('/api/paypal/status').then((r) => r.json()),
      ]);

      if (disputesRes.disputes) {
        setDisputes(disputesRes.disputes);
      }
      setAnalytics(analyticsRes);
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
        {/* Streamlined Top Navigation */}
        <header className="top-nav">
          <div className="brand-section">
            <div className="brand-logo-badge">
              <Shield size={24} strokeWidth={2.4} />
            </div>
            <div className="brand-titles">
              <h1>
                AegisPay AI
                <span className="brand-tag">PayPal Dispute Defense</span>
              </h1>
              <p className="brand-subtitle">
                Autonomous AI Multi-Agent Swarm protecting merchants from friendly fraud &amp; chargebacks
              </p>
            </div>
          </div>

          <div className="nav-actions">
            {/* PayPal Sandbox Status */}
            <div
              className="mode-indicator-pill"
              onClick={() => setIsSettingsOpen(true)}
              title="Click to view or edit PayPal Sandbox API credentials"
            >
              <span className="pulse-dot online" />
              <span style={{ fontWeight: 600 }}>
                {paypalStatus?.mode === 'LIVE_SANDBOX' ? 'PayPal Sandbox: Connected' : 'PayPal: Sandbox Active'}
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

        {/* Clear Tabbed Navigation */}
        <nav className="tabs-navigation">
          <button
            className={`tab-btn ${activeTab === 'AI_HUB' ? 'active' : ''}`}
            onClick={() => setActiveTab('AI_HUB')}
          >
            <Sparkles size={16} style={{ color: 'var(--paypal-cyan)' }} />
            <span>AI Dispute Defense Hub (Core)</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'OPERATIONS' ? 'active' : ''}`}
            onClick={() => setActiveTab('OPERATIONS')}
          >
            <Layers size={16} />
            <span>Dispute Operations (AG Grid Table)</span>
            <span className="tab-counter">{disputes.length}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'FORENSICS' ? 'active' : ''}`}
            onClick={() => setActiveTab('FORENSICS')}
          >
            <Globe size={16} style={{ color: 'var(--emerald-400)' }} />
            <span>Carrier GPS &amp; Telemetry Proof</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'POLICY_STUDIO' ? 'active' : ''}`}
            onClick={() => setActiveTab('POLICY_STUDIO')}
          >
            <Sliders size={16} style={{ color: '#A5B4FC' }} />
            <span>Merchant Defense Policy</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'PAYPAL_API' ? 'active' : ''}`}
            onClick={() => setActiveTab('PAYPAL_API')}
          >
            <Code size={16} style={{ color: 'var(--amber-400)' }} />
            <span>PayPal REST API Inspector</span>
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

          {activeTab === 'FORENSICS' && (
            <ForensicsViewer disputes={disputes} />
          )}

          {activeTab === 'POLICY_STUDIO' && (
            <PolicyStudio />
          )}

          {activeTab === 'PAYPAL_API' && (
            <PayPalInspector disputes={disputes} />
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
