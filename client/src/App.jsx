import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Layers,
  Terminal,
  Activity,
  Globe,
  Code,
  Network,
  Sparkles,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import TopNav from './components/TopNav';
import KpiGrid from './components/KpiGrid';
import DisputeGrid from './components/DisputeGrid';
import WarRoomVisualizer from './components/WarRoomVisualizer';
import ForensicsViewer from './components/ForensicsViewer';
import OracleSyndicate from './components/OracleSyndicate';
import PayPalInspector from './components/PayPalInspector';
import EvidenceModal from './components/EvidenceModal';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [disputes, setDisputes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [paypalStatus, setPaypalStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('OPERATIONS');

  // Modals & Selection
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // War Room Execution State
  const [warRoomDisputeId, setWarRoomDisputeId] = useState('');
  const [activeLogs, setActiveLogs] = useState([]);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [activePhase, setActivePhase] = useState(null);

  // Global Actions
  const [isDefendingAll, setIsDefendingAll] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [disputesRes, analyticsRes, statusRes] = await Promise.all([
        fetch('/api/disputes').then((r) => r.json()),
        fetch('/api/analytics').then((r) => r.json()),
        fetch('/api/paypal/status').then((r) => r.json()),
      ]);

      if (disputesRes.disputes) {
        setDisputes(disputesRes.disputes);
        if (!warRoomDisputeId && disputesRes.disputes.length > 0) {
          setWarRoomDisputeId(disputesRes.disputes[0].dispute_id);
        }
      }
      setAnalytics(analyticsRes);
      setPaypalStatus(statusRes);
    } catch (err) {
      console.error('Failed to fetch platform state:', err);
    }
  }, [warRoomDisputeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Run Multi-Agent Swarm (with live stream)
  const handleRunSwarm = async (disputeId) => {
    const idToRun = disputeId || warRoomDisputeId;
    if (!idToRun) return;

    setIsInvestigating(true);
    setActiveLogs([]);
    setActivePhase('INITIALIZATION');

    try {
      const eventSource = new EventSource(`/api/disputes/${idToRun}/investigate-stream`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'COMPLETE_PAYLOAD') {
            eventSource.close();
            setIsInvestigating(false);
            setActivePhase(null);
            fetchData();
          } else if (data.type === 'ERROR') {
            eventSource.close();
            setIsInvestigating(false);
            setActivePhase(null);
          } else {
            setActiveLogs((prev) => [...prev, data]);
            if (data.phase) {
              setActivePhase(data.phase);
            }
          }
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsInvestigating(false);
        setActivePhase(null);
        fetchData();
      };
    } catch (err) {
      console.error('Failed to start swarm run:', err);
      setIsInvestigating(false);
      setActivePhase(null);
    }
  };

  // Deploy Swarm directly from AG Grid row action
  const handleDeploySwarmFromGrid = (disputeId) => {
    setWarRoomDisputeId(disputeId);
    setActiveTab('WAR_ROOM');
    handleRunSwarm(disputeId);
  };

  // Simulate Inbound Dispute Attack
  const handleSimulateAttack = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/disputes/simulate-attack', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchData();
        // Toast or focus new dispute
        setWarRoomDisputeId(data.dispute.dispute_id);
      }
    } catch (err) {
      console.error('Simulate attack error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Batch Auto-Defend All
  const handleBatchDefend = async () => {
    setIsDefendingAll(true);
    try {
      const res = await fetch('/api/disputes/batch-defend', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#10B981', '#00CFDE', '#0070BA', '#F59E0B'],
        });
        await fetchData();
      }
    } catch (err) {
      console.error('Batch defend error:', err);
    } finally {
      setIsDefendingAll(false);
    }
  };

  // Reset Dataset
  const handleResetData = async () => {
    try {
      await fetch('/api/disputes/reset', { method: 'POST' });
      await fetchData();
    } catch (err) {
      console.error('Reset error:', err);
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

  return (
    <div className="bg-grid-pattern" style={{ minHeight: '100vh' }}>
      <div className="app-container">
        {/* Top Navigation */}
        <TopNav
          paypalStatus={paypalStatus}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSimulateAttack={handleSimulateAttack}
          onBatchDefend={handleBatchDefend}
          onResetData={handleResetData}
          isDefendingAll={isDefendingAll}
          isSimulating={isSimulating}
        />

        {/* Real-Time KPI Cards */}
        <KpiGrid analytics={analytics} />

        {/* Main Tabbed Navigation */}
        <nav className="tabs-navigation">
          <button
            className={`tab-btn ${activeTab === 'OPERATIONS' ? 'active' : ''}`}
            onClick={() => setActiveTab('OPERATIONS')}
          >
            <Layers size={15} />
            <span>Dispute Operations (AG Grid)</span>
            <span className="tab-counter">{disputes.length}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'WAR_ROOM' ? 'active' : ''}`}
            onClick={() => setActiveTab('WAR_ROOM')}
          >
            <Terminal size={15} style={{ color: 'var(--paypal-cyan)' }} />
            <span>Agent War Room</span>
            {isInvestigating && (
              <span className="tab-counter" style={{ background: 'var(--paypal-cyan)', color: '#000' }}>
                LIVE
              </span>
            )}
          </button>

          <button
            className={`tab-btn ${activeTab === 'FORENSICS' ? 'active' : ''}`}
            onClick={() => setActiveTab('FORENSICS')}
          >
            <Globe size={15} style={{ color: 'var(--emerald-400)' }} />
            <span>Carrier GPS &amp; Telemetry</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'SYNDICATES' ? 'active' : ''}`}
            onClick={() => setActiveTab('SYNDICATES')}
          >
            <Network size={15} style={{ color: '#F472B6' }} />
            <span>Oracle Syndicate Hunter</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'PAYPAL_API' ? 'active' : ''}`}
            onClick={() => setActiveTab('PAYPAL_API')}
          >
            <Code size={15} style={{ color: 'var(--amber-400)' }} />
            <span>PayPal REST API Inspector</span>
          </button>
        </nav>

        {/* Tab Content Display */}
        <main className="content-wrapper">
          {activeTab === 'OPERATIONS' && (
            <DisputeGrid
              disputes={disputes}
              onSelectDispute={(dispute) => setSelectedDispute(dispute)}
              onDeploySwarm={handleDeploySwarmFromGrid}
            />
          )}

          {activeTab === 'WAR_ROOM' && (
            <WarRoomVisualizer
              disputes={disputes}
              selectedDisputeId={warRoomDisputeId}
              onSelectDisputeId={(id) => setWarRoomDisputeId(id)}
              onRunSwarm={handleRunSwarm}
              activeLogs={activeLogs}
              isRunning={isInvestigating}
              activePhase={activePhase}
            />
          )}

          {activeTab === 'FORENSICS' && (
            <ForensicsViewer disputes={disputes} />
          )}

          {activeTab === 'SYNDICATES' && (
            <OracleSyndicate />
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
