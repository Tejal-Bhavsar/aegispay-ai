import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Layers,
  Scale,
  Terminal,
  RefreshCw,
  Key,
  Network,
  MapPin,
  Sliders,
  AlertTriangle,
  ArrowRight,
  X,
  RotateCcw,
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
  const [paypalStatus, setPaypalStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('OPERATIONS');

  // Active Dispute in Split-Pane Inspector Drawer + Full Dossier Modal
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [modalDispute, setModalDispute] = useState(null);
  const [activeDisputeForAi, setActiveDisputeForAi] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const [isBatchDefending, setIsBatchDefending] = useState(false);

  // Inbound Webhook Simulation State
  const [isSimulatingAttack, setIsSimulatingAttack] = useState(false);
  const [attackAlert, setAttackAlert] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [disputesRes, statusRes] = await Promise.all([
        fetch('/api/disputes')
          .then((r) => r.json())
          .catch(() => ({ disputes: [] })),
        fetch('/api/paypal/status')
          .then((r) => r.json())
          .catch(() => null),
      ]);

      if (disputesRes.disputes) {
        const list = disputesRes.disputes;
        setDisputes(list);
        setSelectedDispute((prev) => {
          if (prev) {
            const updated = list.find((d) => d.dispute_id === prev.dispute_id);
            if (updated) return updated;
          }
          // Default to earliest deadline open case so the right-hand inspector drawer is active on first viewport
          const sortedOpen = [...list]
            .filter((d) => d.ai_state?.status !== 'DEFENDED_TO_PAYPAL')
            .sort(
              (a, b) =>
                new Date(a.response_deadline || 0) - new Date(b.response_deadline || 0)
            );
          return sortedOpen[0] || list[0] || null;
        });
      }
      setPaypalStatus(statusRes);
    } catch (err) {
      console.error('Failed to fetch platform state:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Simulate incoming PayPal dispute webhook
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
        setSelectedDispute(data.dispute);
        await fetchData();
      }
    } catch (err) {
      console.error('Simulate attack failed:', err);
    } finally {
      setIsSimulatingAttack(false);
    }
  };

  // Batch Defend all pending disputes
  const handleBatchDefend = async () => {
    setIsBatchDefending(true);
    try {
      const res = await fetch('/api/disputes/batch-defend', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      }
    } catch (err) {
      console.error('Batch defend failed:', err);
    } finally {
      setIsBatchDefending(false);
    }
  };

  // Reset queue to initial 4 PayPal disputes
  const handleResetQueue = async () => {
    try {
      const res = await fetch('/api/disputes/reset', { method: 'POST' });
      const data = await res.json();
      if (data.disputes) {
        setDisputes(data.disputes);
        setSelectedDispute(data.disputes[0] || null);
        setAttackAlert(null);
      }
    } catch (err) {
      console.error('Reset queue failed:', err);
    }
  };

  // Submit Evidence Packet to PayPal API
  const handleSubmitEvidence = async (disputeId) => {
    setIsSubmittingEvidence(true);
    try {
      const res = await fetch(`/api/disputes/${disputeId}/submit`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        if (data.dispute) {
          setSelectedDispute(data.dispute);
          if (modalDispute?.dispute_id === disputeId) {
            setModalDispute(data.dispute);
          }
        }
        await fetchData();
      }
    } catch (err) {
      console.error('Submit evidence failed:', err);
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  // Configure PayPal Sandbox Credentials
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

  // Open a specific dispute in the 5-Agent Adjudication Bench
  const handleDeploySwarm = (disputeId) => {
    const found = disputes.find((d) => d.dispute_id === disputeId);
    if (found) {
      setActiveDisputeForAi(found);
      setSelectedDispute(found);
    }
    setActiveTab('AI_HUB');
  };

  // Select a dispute by ID and jump to Queue Workbench
  const handleSelectDisputeById = (disputeId) => {
    const found = disputes.find((d) => d.dispute_id === disputeId);
    if (found) {
      setSelectedDispute(found);
    }
    setActiveTab('OPERATIONS');
  };

  const isLiveSandbox = paypalStatus?.mode === 'LIVE_SANDBOX';
  const openDisputesCount = disputes.filter(
    (d) => d.ai_state?.status !== 'DEFENDED_TO_PAYPAL'
  ).length;

  return (
    <div className="workbench-shell">
      {/* Fixed 248px Institutional Navy Command Rail */}
      <aside className="command-rail" aria-label="Workspace Command Rail">
        <div className="rail-top">
          {/* Brand Identity */}
          <div
            className="rail-brand"
            onClick={() => setActiveTab('OPERATIONS')}
            title="AegisPay Dispute Operations Workbench"
          >
            <div className="rail-brand-mark">
              <Shield size={18} strokeWidth={2.2} />
            </div>
            <div className="rail-brand-text">
              <h1>AegisPay</h1>
              <span className="rail-brand-sub">Dispute Defense Workbench</span>
            </div>
          </div>

          {/* Primary Workspace Navigation */}
          <div className="rail-section-label">Operations &amp; Exhibits</div>
          <nav className="rail-nav">
            <button
              className={`rail-nav-btn ${activeTab === 'OPERATIONS' ? 'active' : ''}`}
              onClick={() => setActiveTab('OPERATIONS')}
            >
              <span className="rail-nav-btn-left">
                <Layers size={15} />
                <span>Dispute Queue</span>
              </span>
              <span className="rail-nav-badge">{disputes.length}</span>
            </button>

            <button
              className={`rail-nav-btn ${activeTab === 'AI_HUB' ? 'active' : ''}`}
              onClick={() => setActiveTab('AI_HUB')}
            >
              <span className="rail-nav-btn-left">
                <Scale size={15} />
                <span>5-Agent Adjudication</span>
              </span>
              <span className="rail-nav-badge">SSE</span>
            </button>

            <button
              className={`rail-nav-btn ${activeTab === 'FORENSICS' ? 'active' : ''}`}
              onClick={() => setActiveTab('FORENSICS')}
            >
              <span className="rail-nav-btn-left">
                <MapPin size={15} />
                <span>Forensic Exhibit Vault</span>
              </span>
              <span className="rail-nav-badge">POD</span>
            </button>

            <button
              className={`rail-nav-btn ${activeTab === 'SYNDICATE' ? 'active' : ''}`}
              onClick={() => setActiveTab('SYNDICATE')}
            >
              <span className="rail-nav-btn-left">
                <Network size={15} />
                <span>Oracle Fraud Graph</span>
              </span>
              <span className="rail-nav-badge">2</span>
            </button>

            <button
              className={`rail-nav-btn ${activeTab === 'POLICY' ? 'active' : ''}`}
              onClick={() => setActiveTab('POLICY')}
            >
              <span className="rail-nav-btn-left">
                <Sliders size={15} />
                <span>Underwriting Policy</span>
              </span>
            </button>

            <button
              className={`rail-nav-btn ${activeTab === 'INTEGRATION' ? 'active' : ''}`}
              onClick={() => setActiveTab('INTEGRATION')}
            >
              <span className="rail-nav-btn-left">
                <Terminal size={15} />
                <span>PayPal &amp; Core API</span>
              </span>
              <span className="rail-nav-badge">v1</span>
            </button>
          </nav>

          {/* 5-Agent Pipeline Roster */}
          <div className="rail-section-label">5-Agent Pipeline</div>
          <div className="rail-agents-box">
            <div className="rail-agent-row">
              <span className="rail-agent-name">
                <span className="rail-agent-dot" />
                1. Sentinel
              </span>
              <span className="rail-agent-role">SLA Triage</span>
            </div>
            <div className="rail-agent-row">
              <span className="rail-agent-name">
                <span className="rail-agent-dot" />
                2. Sherlock
              </span>
              <span className="rail-agent-role">GPS / POD</span>
            </div>
            <div className="rail-agent-row">
              <span className="rail-agent-name">
                <span className="rail-agent-dot" />
                3. Oracle
              </span>
              <span className="rail-agent-role">Ring Scan</span>
            </div>
            <div className="rail-agent-row">
              <span className="rail-agent-name">
                <span className="rail-agent-dot" />
                4. Lex
              </span>
              <span className="rail-agent-role">CE 3.0 Brief</span>
            </div>
            <div className="rail-agent-row">
              <span className="rail-agent-name">
                <span className="rail-agent-dot" />
                5. Pax
              </span>
              <span className="rail-agent-role">Settlement</span>
            </div>
          </div>
        </div>

        {/* Rail Footer: Honest Sandbox Mode Status & Utilities */}
        <div className="rail-footer">
          <div
            className="rail-env-card"
            onClick={() => setIsSettingsOpen(true)}
            title="Click to configure PayPal Sandbox API credentials"
          >
            <div className="rail-env-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={`status-dot ${isLiveSandbox ? 'live' : 'sim'}`} />
                {isLiveSandbox ? 'PayPal Live Sandbox' : 'Sandbox Simulation'}
              </span>
              <Key size={12} style={{ color: 'var(--rail-text-muted)' }} />
            </div>
            <div className="rail-env-sub">
              <span>/v1/customer/disputes</span>
              <span className="mono">{openDisputesCount} open</span>
            </div>
          </div>

          <div className="rail-utility-row">
            <button className="rail-util-btn" onClick={fetchData} title="Refresh Queue">
              <RefreshCw size={11} />
              <span>Sync Queue</span>
            </button>
            <button className="rail-util-btn" onClick={handleResetQueue} title="Reset Mock Data">
              <RotateCcw size={11} />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workbench Area */}
      <div className="workbench-main">
        {/* Top Operational Ledger Bar */}
        <KpiGrid
          disputes={disputes}
          onSimulateAttack={handleSimulateAttack}
          isSimulatingAttack={isSimulatingAttack}
          onBatchDefend={handleBatchDefend}
          isBatchDefending={isBatchDefending}
          onResetQueue={handleResetQueue}
        />

        {/* Inbound Dispute Webhook Alert Strip */}
        {attackAlert && (
          <div className="webhook-alert-strip" role="alert">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={16} style={{ color: 'var(--crimson)', flexShrink: 0 }} />
              <div style={{ fontSize: '12.5px', color: 'var(--ink-primary)' }}>
                <strong className="mono">
                  WEBHOOK INGESTED [CUSTOMER.DISPUTE.CREATED]: {attackAlert.id}
                </strong>{' '}
                &mdash; ${attackAlert.amount} USD &bull; {attackAlert.item} (
                {attackAlert.reason?.replace(/_/g, ' ')})
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                className="btn btn-primary"
                style={{ padding: '5px 10px', fontSize: '11.5px' }}
                onClick={() => {
                  handleDeploySwarm(attackAlert.id);
                  setAttackAlert(null);
                }}
              >
                <span>Adjudicate in 5-Agent Bench</span>
                <ArrowRight size={12} />
              </button>
              <button
                onClick={() => setAttackAlert(null)}
                className="btn btn-secondary"
                style={{ padding: '4px 7px' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Active Workspace View */}
        <main className="workspace-body">
          {activeTab === 'OPERATIONS' && (
            <DisputeGrid
              disputes={disputes}
              selectedDispute={selectedDispute}
              onSelectDispute={(dispute) => setSelectedDispute(dispute)}
              onOpenModalDossier={(dispute) => setModalDispute(dispute)}
              onDeploySwarm={handleDeploySwarm}
              onSubmitToPayPal={handleSubmitEvidence}
              isSubmittingEvidence={isSubmittingEvidence}
              onDisputeUpdated={fetchData}
            />
          )}

          {activeTab === 'AI_HUB' && (
            <AIAnalyzer
              disputes={disputes}
              onDisputeResolved={fetchData}
              activeDispute={activeDisputeForAi || selectedDispute}
            />
          )}

          {activeTab === 'FORENSICS' && (
            <ForensicsViewer disputes={disputes} selectedDispute={selectedDispute} />
          )}

          {activeTab === 'SYNDICATE' && (
            <OracleSyndicate onSelectDisputeById={handleSelectDisputeById} />
          )}

          {activeTab === 'POLICY' && <PolicyStudio disputes={disputes} />}

          {activeTab === 'INTEGRATION' && <BankIntegration disputes={disputes} />}
        </main>

        {/* Full-Screen Printable Evidence Dossier Modal */}
        {modalDispute && (
          <EvidenceModal
            dispute={modalDispute}
            onClose={() => setModalDispute(null)}
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
