import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Inbox,
  FileSearch,
  Network,
  MapPin,
  SlidersHorizontal,
  Code2,
  RefreshCw,
  Plus,
  AlertTriangle,
  X,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

import LandingPage from './components/LandingPage';
import AIAnalyzer from './components/AIAnalyzer';
import DisputeGrid from './components/DisputeGrid';
import BankIntegration from './components/BankIntegration';
import OracleSyndicate from './components/OracleSyndicate';
import ForensicsViewer from './components/ForensicsViewer';
import PolicyStudio from './components/PolicyStudio';
import KpiGrid from './components/KpiGrid';
import EvidenceModal from './components/EvidenceModal';
import SettingsModal from './components/SettingsModal';

const PAGES = {
  OPERATIONS: {
    title: 'Disputes',
    description: 'Every open PayPal dispute and chargeback, sorted by how soon the response is due.',
    icon: Inbox,
  },
  AI_HUB: {
    title: 'Case review',
    description: 'Run a case through the five review agents, read the recommendation, and send evidence to PayPal.',
    icon: FileSearch,
  },
  SYNDICATE: {
    title: 'Fraud rings',
    description: 'Disputes that share addresses, devices, or networks, grouped so you can act on them together.',
    icon: Network,
  },
  FORENSICS: {
    title: 'Delivery evidence',
    description: 'Carrier scans, delivery photos, and checkout signals for a single order.',
    icon: MapPin,
  },
  POLICY: {
    title: 'Rules',
    description: 'Decide when evidence is sent automatically and when a goodwill refund is offered instead.',
    icon: SlidersHorizontal,
  },
  INTEGRATION: {
    title: 'Developer API',
    description: 'Send dispute data from your own systems and get a recommendation and rebuttal back.',
    icon: Code2,
  },
};

const NAV_WORK = ['OPERATIONS', 'AI_HUB', 'SYNDICATE', 'FORENSICS'];
const NAV_SETUP = ['POLICY', 'INTEGRATION'];

export default function App() {
  const [showLanding, setShowLanding] = useState(() => window.location.hash !== '#console');
  const [disputes, setDisputes] = useState([]);
  const [paypalStatus, setPaypalStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('OPERATIONS');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [selectedDispute, setSelectedDispute] = useState(null);
  const [activeDisputeForAi, setActiveDisputeForAi] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  const [isSimulating, setIsSimulating] = useState(false);
  const [newDispute, setNewDispute] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [disputesRes, statusRes] = await Promise.all([
        fetch('/api/disputes').then((r) => r.json()),
        fetch('/api/paypal/status').then((r) => r.json()).catch(() => null),
      ]);
      setDisputes(disputesRes.disputes || []);
      setPaypalStatus(statusRes);
      setLoadError(null);
    } catch (err) {
      setLoadError('Could not reach the AegisPay server on port 5001. Start it with npm run dev and refresh.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const syncFromHash = () => {
      setShowLanding(window.location.hash !== '#console');
    };
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const openCount = useMemo(
    () => disputes.filter((d) => d.ai_state?.status !== 'DEFENDED_TO_PAYPAL').length,
    [disputes]
  );

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/disputes/simulate-attack', { method: 'POST' });
      const data = await res.json();
      if (data.dispute) {
        setNewDispute(data.dispute);
        await fetchData();
      }
    } catch (err) {
      console.error('Simulate dispute failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

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

  const handleReviewCase = (disputeId) => {
    const found = disputes.find((d) => d.dispute_id === disputeId);
    if (found) setActiveDisputeForAi(found);
    setActiveTab('AI_HUB');
  };

  const enterConsole = (tab = 'OPERATIONS') => {
    setActiveTab(tab);
    setShowLanding(false);
    window.location.hash = 'console';
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const returnToLanding = () => {
    setShowLanding(true);
    window.history.replaceState(null, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSimulateAndEnter = () => {
    enterConsole('OPERATIONS');
    handleSimulate();
  };

  const isLive = paypalStatus?.mode === 'LIVE_SANDBOX';
  const page = PAGES[activeTab];

  if (showLanding) {
    return (
      <>
        <LandingPage
          disputes={disputes}
          onEnterConsole={enterConsole}
          onSimulateAndEnter={handleSimulateAndEnter}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          paypalStatus={paypalStatus}
          onConfigurePayPal={handleConfigurePayPal}
        />
      </>
    );
  }

  const NavItem = ({ id }) => {
    const Icon = PAGES[id].icon;
    return (
      <button
        className={`nav-item ${activeTab === id ? 'active' : ''}`}
        onClick={() => setActiveTab(id)}
        aria-current={activeTab === id ? 'page' : undefined}
      >
        <Icon size={16} strokeWidth={1.8} />
        <span>{PAGES[id].title}</span>
        {id === 'OPERATIONS' && <span className="nav-count">{openCount}</span>}
      </button>
    );
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <button
          type="button"
          className="sidebar-brand"
          onClick={returnToLanding}
          title="Back to AegisPay overview"
          aria-label="Open AegisPay overview page"
        >
          <span className="brand-mark">
            <Shield size={16} strokeWidth={2.2} />
          </span>
          <span>
            <span className="brand-name">AegisPay</span>
            <span className="brand-sub" style={{ display: 'block' }}>Dispute desk</span>
          </span>
        </button>

        <nav className="nav-group" aria-label="Workspace">
          <span className="nav-label">Work</span>
          {NAV_WORK.map((id) => <NavItem key={id} id={id} />)}
        </nav>

        <nav className="nav-group" aria-label="Setup">
          <span className="nav-label">Setup</span>
          {NAV_SETUP.map((id) => <NavItem key={id} id={id} />)}
        </nav>

        <div className="sidebar-footer">
          <button className="connection" onClick={() => setIsSettingsOpen(true)}>
            <span className={`dot ${isLive ? 'live' : 'sim'}`} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <strong>{isLive ? 'PayPal sandbox' : 'Simulated sandbox'}</strong>
              {isLive ? 'Connected' : 'Add API credentials'}
            </span>
            <ChevronRight size={14} />
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="page-header">
          <div>
            <h1>{page.title}</h1>
            <p>{page.description}</p>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={fetchData} title="Reload disputes">
              <RefreshCw size={14} />
              Refresh
            </button>
            <button className="btn btn-primary" onClick={handleSimulate} disabled={isSimulating}>
              <Plus size={15} />
              {isSimulating ? 'Creating dispute…' : 'Simulate new dispute'}
            </button>
          </div>
        </header>

        <div className="page-body">
          {loadError && (
            <div className="error-box">
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{loadError}</span>
            </div>
          )}

          <AnimatePresence>
            {newDispute && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="notice"
                role="status"
              >
                <div className="notice-main">
                  <span className="notice-icon">
                    <AlertTriangle size={16} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div className="notice-title">
                      New dispute <span className="num">{newDispute.dispute_id}</span> for{' '}
                      <span className="num">${parseFloat(newDispute.dispute_amount?.value || 0).toFixed(2)}</span>
                    </div>
                    <div className="notice-text">
                      {newDispute.transaction_details?.item_title} · {formatReason(newDispute.dispute_reason)}
                    </div>
                  </div>
                </div>
                <div className="notice-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      handleReviewCase(newDispute.dispute_id);
                      setNewDispute(null);
                    }}
                  >
                    Review case
                    <ArrowRight size={13} />
                  </button>
                  <button className="icon-btn" onClick={() => setNewDispute(null)} aria-label="Dismiss">
                    <X size={15} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'OPERATIONS' && <KpiGrid disputes={disputes} />}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              {activeTab === 'OPERATIONS' && (
                <DisputeGrid
                  disputes={disputes}
                  isLoading={isLoading}
                  onSelectDispute={(dispute) => setSelectedDispute(dispute)}
                  onDeploySwarm={handleReviewCase}
                />
              )}
              {activeTab === 'AI_HUB' && (
                <AIAnalyzer onDisputeResolved={fetchData} activeDispute={activeDisputeForAi} />
              )}
              {activeTab === 'SYNDICATE' && <OracleSyndicate />}
              {activeTab === 'FORENSICS' && <ForensicsViewer disputes={disputes} />}
              {activeTab === 'POLICY' && <PolicyStudio disputes={disputes} />}
              {activeTab === 'INTEGRATION' && <BankIntegration />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {selectedDispute && (
        <EvidenceModal
          dispute={selectedDispute}
          onClose={() => setSelectedDispute(null)}
          onSubmitToPayPal={handleSubmitEvidence}
          isSubmitting={isSubmittingEvidence}
          onReviewCase={(id) => {
            setSelectedDispute(null);
            handleReviewCase(id);
          }}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        paypalStatus={paypalStatus}
        onConfigurePayPal={handleConfigurePayPal}
      />
    </div>
  );
}

function formatReason(reason) {
  if (reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED') return 'Item not received';
  if (reason === 'UNAUTHORIZED') return 'Unauthorized payment';
  if (reason === 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED') return 'Not as described';
  return reason?.replace(/_/g, ' ').toLowerCase();
}
