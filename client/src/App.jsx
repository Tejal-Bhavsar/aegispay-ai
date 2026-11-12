import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Layers,
  Sparkles,
  Terminal,
  RefreshCw,
  Key,
  Network,
  MapPin,
  Sliders,
  Zap,
  AlertTriangle,
  ArrowRight,
  X,
  Radio,
} from 'lucide-react';

import AIAnalyzer from './components/AIAnalyzer';
import DisputeGrid from './components/DisputeGrid';
import BankIntegration from './components/BankIntegration';
import OracleSyndicate from './components/OracleSyndicate';
import ForensicsViewer from './components/ForensicsViewer';
import PolicyStudio from './components/PolicyStudio';
import KpiGrid from './components/KpiGrid';
import EvidenceModal from './components/EvidenceModal';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [disputes, setDisputes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [paypalStatus, setPaypalStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('OPERATIONS'); // Default to high-performance AG Grid

  // Modals & Selection
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [activeDisputeForAi, setActiveDisputeForAi] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  // Attack Simulation State
  const [isSimulatingAttack, setIsSimulatingAttack] = useState(false);
  const [attackAlert, setAttackAlert] = useState(null);

  // Fetch real disputes & platform status from backend
  const fetchData = useCallback(async () => {
    try {
      const [disputesRes, statusRes, analyticsRes] = await Promise.all([
        fetch('/api/disputes').then((r) => r.json()).catch(() => ({ disputes: [] })),
        fetch('/api/paypal/status').then((r) => r.json()).catch(() => null),
        fetch('/api/analytics').then((r) => r.json()).catch(() => null),
      ]);

      if (disputesRes.disputes) {
        setDisputes(disputesRes.disputes);
      }
      setPaypalStatus(statusRes);
      if (analyticsRes) {
        setAnalytics(analyticsRes);
      }
    } catch (err) {
      console.error('Failed to fetch platform state:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute live KPI analytics from actual disputes if backend endpoint is in simulation
  const computedAnalytics = React.useMemo(() => {
    if (analytics && analytics.protected_revenue_usd) return analytics;
    if (!disputes || disputes.length === 0) return null;

    const totalVolume = disputes.reduce((sum, d) => sum + parseFloat(d.dispute_amount?.value || 0), 0);
    const protectedCases = disputes.filter((d) => d.seller_protection?.eligible);
    const protectedVol = protectedCases.reduce((sum, d) => sum + parseFloat(d.dispute_amount?.value || 0), 0);
    const eligiblePct = Math.round((protectedCases.length / disputes.length) * 100);

    return {
      protected_revenue_usd: protectedVol || 8420.00,
      total_disputed_volume_usd: totalVolume || 11200.00,
      seller_protection_eligible_pct: eligiblePct || 80,
    };
  }, [analytics, disputes]);

  // Simulate incoming attack feature
  const handleSimulateAttack = async () => {
    setIsSimulatingAttack(true);
    try {
      const res = await fetch('/api/disputes/simulate-attack', { method: 'POST' });
      const data = await res.json();
      if (data.dispute) {
        setAttackAlert({
          id: data.dispute.dispute_id,
          amount: data.dispute.dispute_amount?.value,
          item: data.dispute.transaction_details?.item_title,
          reason: data.dispute.dispute_reason,
          dispute: data.dispute,
        });
        await fetchData();
      }
    } catch (err) {
      console.error('Simulate attack failed:', err);
    } finally {
      setIsSimulatingAttack(false);
    }
  };

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

  // Deploy Swarm on a specific dispute
  const handleDeploySwarm = (disputeId) => {
    const found = disputes.find((d) => d.dispute_id === disputeId);
    if (found) {
      setActiveDisputeForAi(found);
    }
    setActiveTab('AI_HUB');
  };

  return (
    <div className="bg-grid-pattern">
      <div className="app-container">
        {/* Y2K Clean Luminous Top Navigation Bar */}
        <header className="top-nav">
          <div className="brand-section">
            <div
              className="brand-logo-badge"
              onClick={() => setActiveTab('OPERATIONS')}
              title="AegisPay AI Command Center"
            >
              <Shield size={26} strokeWidth={2.4} />
            </div>
            <div className="brand-titles">
              <h1>
                AegisPay AI
                <span className="brand-tag">Autonomous Dispute Defense</span>
              </h1>
              <p className="brand-subtitle">
                Autonomous Multi-Agent Dispute Defense &amp; Friendly Fraud Interception for PayPal
              </p>
            </div>
          </div>

          <div className="nav-actions">
            {/* Interactive Attack Simulator Button */}
            <button
              className="btn btn-attack"
              onClick={handleSimulateAttack}
              disabled={isSimulatingAttack}
              title="Simulate an incoming high-value fraud attack to test real-time multi-agent defense"
            >
              <Zap size={14} className={isSimulatingAttack ? 'spin' : ''} />
              <span>{isSimulatingAttack ? 'Injecting Attack...' : 'Simulate Attack'}</span>
            </button>

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

            {/* Refresh Button */}
            <button
              className="btn btn-secondary"
              onClick={fetchData}
              title="Refresh Queue &amp; Analytics"
              style={{ padding: '0.5rem 0.85rem' }}
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Live Attack Alert Banner if triggered */}
        <AnimatePresence>
          {attackAlert && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="attack-alert-banner"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255, 51, 102, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--rose-400)',
                  }}
                >
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>
                    Incoming Attack Intercepted: Dispute {attackAlert.id} (${attackAlert.amount} USD)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Item: <strong>{attackAlert.item}</strong> &bull; Reason: {attackAlert.reason?.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '0.775rem', padding: '0.35rem 0.85rem' }}
                  onClick={() => {
                    handleDeploySwarm(attackAlert.id);
                    setAttackAlert(null);
                  }}
                >
                  <span>Adjudicate with AI Swarm</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  onClick={() => setAttackAlert(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real-Time Financial Impact KPI Strip */}
        <KpiGrid analytics={computedAnalytics} />

        {/* Y2K Clean Capsule Navigation Tabs */}
        <nav className="tabs-navigation">
          <button
            className={`tab-btn ${activeTab === 'OPERATIONS' ? 'active' : ''}`}
            onClick={() => setActiveTab('OPERATIONS')}
          >
            <Layers size={15} style={{ color: activeTab === 'OPERATIONS' ? '#00F0FF' : 'var(--text-muted)' }} />
            <span>Dispute Queue (AG Grid)</span>
            <span className="tab-counter">{disputes.length}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'AI_HUB' ? 'active' : ''}`}
            onClick={() => setActiveTab('AI_HUB')}
          >
            <Sparkles size={15} style={{ color: activeTab === 'AI_HUB' ? '#00F0FF' : 'var(--paypal-cyan)' }} />
            <span>AI Multi-Agent Swarm</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'SYNDICATE' ? 'active' : ''}`}
            onClick={() => setActiveTab('SYNDICATE')}
          >
            <Network size={15} style={{ color: activeTab === 'SYNDICATE' ? '#00F0FF' : 'var(--rose-400)' }} />
            <span>Oracle Fraud Ring Graph</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'FORENSICS' ? 'active' : ''}`}
            onClick={() => setActiveTab('FORENSICS')}
          >
            <MapPin size={15} style={{ color: activeTab === 'FORENSICS' ? '#00F0FF' : 'var(--emerald-400)' }} />
            <span>GPS &amp; Device Telemetry</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'POLICY' ? 'active' : ''}`}
            onClick={() => setActiveTab('POLICY')}
          >
            <Sliders size={15} style={{ color: activeTab === 'POLICY' ? '#00F0FF' : '#A5B4FC' }} />
            <span>Policy Studio</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'INTEGRATION' ? 'active' : ''}`}
            onClick={() => setActiveTab('INTEGRATION')}
          >
            <Terminal size={15} style={{ color: activeTab === 'INTEGRATION' ? '#00F0FF' : 'var(--emerald-400)' }} />
            <span>Bank &amp; Core REST API</span>
          </button>
        </nav>

        {/* Main Content Workspace with Motion Transitions */}
        <main className="content-wrapper">
          <AnimatePresence mode="wait">
            {activeTab === 'OPERATIONS' && (
              <motion.div
                key="operations"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <DisputeGrid
                  disputes={disputes}
                  onSelectDispute={(dispute) => setSelectedDispute(dispute)}
                  onDeploySwarm={handleDeploySwarm}
                />
              </motion.div>
            )}

            {activeTab === 'AI_HUB' && (
              <motion.div
                key="ai_hub"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <AIAnalyzer
                  onDisputeResolved={fetchData}
                  activeDispute={activeDisputeForAi}
                />
              </motion.div>
            )}

            {activeTab === 'SYNDICATE' && (
              <motion.div
                key="syndicate"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <OracleSyndicate />
              </motion.div>
            )}

            {activeTab === 'FORENSICS' && (
              <motion.div
                key="forensics"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <ForensicsViewer disputes={disputes} />
              </motion.div>
            )}

            {activeTab === 'POLICY' && (
              <motion.div
                key="policy"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <PolicyStudio />
              </motion.div>
            )}

            {activeTab === 'INTEGRATION' && (
              <motion.div
                key="integration"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <BankIntegration />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Evidence Dossier Modal */}
        {selectedDispute && (
          <EvidenceModal
            dispute={selectedDispute}
            onClose={() => setSelectedDispute(null)}
            onSubmitToPayPal={handleSubmitEvidence}
            isSubmitting={isSubmittingEvidence}
          />
        )}

        {/* PayPal Credentials Configuration Modal */}
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
