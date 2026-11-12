import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Zap,
  RotateCcw,
  Send,
} from 'lucide-react';

export default function KpiGrid({
  disputes = [],
  onSimulateAttack,
  isSimulatingAttack,
  onBatchDefend,
  isBatchDefending,
  onResetQueue,
}) {
  const stats = React.useMemo(() => {
    const totalCases = disputes.length;
    const openCases = disputes.filter((d) => d.ai_state?.status !== 'DEFENDED_TO_PAYPAL');
    const defendedCases = disputes.filter((d) => d.ai_state?.status === 'DEFENDED_TO_PAYPAL');
    const protectedCases = disputes.filter((d) => d.seller_protection?.eligible);

    const totalVolume = disputes.reduce(
      (sum, d) => sum + parseFloat(d.dispute_amount?.value || 0),
      0
    );
    const openExposure = openCases.reduce(
      (sum, d) => sum + parseFloat(d.dispute_amount?.value || 0),
      0
    );
    const defendedVolume = defendedCases.reduce(
      (sum, d) => sum + parseFloat(d.dispute_amount?.value || 0),
      0
    );
    const protectedVolume = protectedCases.reduce(
      (sum, d) => sum + parseFloat(d.dispute_amount?.value || 0),
      0
    );

    const openFeeExposure = openCases.length * 15;

    // Sort open cases by earliest response_deadline
    const sortedByDeadline = [...openCases].sort(
      (a, b) => new Date(a.response_deadline || 0) - new Date(b.response_deadline || 0)
    );
    const nextUrgent = sortedByDeadline[0] || null;

    return {
      totalCases,
      openCount: openCases.length,
      defendedCount: defendedCases.length,
      protectedCount: protectedCases.length,
      totalVolume,
      openExposure,
      defendedVolume,
      protectedVolume,
      openFeeExposure,
      nextUrgent,
    };
  }, [disputes]);

  const formatUsd = (val) =>
    `$${Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <header className="ledger-topbar" role="region" aria-label="Operational Dispute Ledger">
      <div className="ledger-metrics-strip">
        {/* 1. Open Disputed Exposure */}
        <div className="ledger-metric-cell">
          <span className="ledger-metric-label">
            <AlertTriangle size={12} style={{ color: 'var(--crimson)' }} />
            Open Disputed Exposure
          </span>
          <div className="ledger-metric-value-row">
            <span
              className="ledger-metric-value"
              style={{ color: stats.openExposure > 0 ? 'var(--crimson)' : 'var(--ink-primary)' }}
            >
              {formatUsd(stats.openExposure)}
            </span>
            <span className="ledger-metric-sub">
              {stats.openCount} open &bull; +${stats.openFeeExposure} fee risk
            </span>
          </div>
        </div>

        {/* 2. Earliest Statutory Deadline */}
        <div className="ledger-metric-cell">
          <span className="ledger-metric-label">
            <Clock size={12} style={{ color: 'var(--crimson)' }} />
            Next Statutory Deadline
          </span>
          <div className="ledger-metric-value-row">
            {stats.nextUrgent ? (
              <>
                <span className="ledger-metric-value" style={{ fontSize: '15px' }}>
                  {stats.nextUrgent.dispute_id}
                </span>
                <span
                  className="status-pill escalated"
                  style={{ fontSize: '10px', padding: '1px 6px' }}
                >
                  Due {new Date(stats.nextUrgent.response_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </>
            ) : (
              <>
                <span className="ledger-metric-value" style={{ fontSize: '15px', color: 'var(--forest)' }}>
                  QUEUE CLEARED
                </span>
                <span className="ledger-metric-sub">0 pending</span>
              </>
            )}
          </div>
        </div>

        {/* 3. PayPal Seller Protection Eligibility */}
        <div className="ledger-metric-cell">
          <span className="ledger-metric-label">
            <ShieldCheck size={12} style={{ color: 'var(--forest)' }} />
            Seller Protection Eligible
          </span>
          <div className="ledger-metric-value-row">
            <span className="ledger-metric-value" style={{ color: 'var(--forest)' }}>
              {formatUsd(stats.protectedVolume)}
            </span>
            <span className="ledger-metric-sub">
              {stats.protectedCount} of {stats.totalCases} cases eligible
            </span>
          </div>
        </div>

        {/* 4. Defended & Submitted Volume */}
        <div className="ledger-metric-cell">
          <span className="ledger-metric-label">
            <CheckCircle2 size={12} style={{ color: 'var(--paypal-blue)' }} />
            Defended to PayPal API
          </span>
          <div className="ledger-metric-value-row">
            <span className="ledger-metric-value" style={{ color: 'var(--paypal-blue)' }}>
              {formatUsd(stats.defendedVolume)}
            </span>
            <span className="ledger-metric-sub">
              {stats.defendedCount}/{stats.totalCases} dispatched
            </span>
          </div>
        </div>
      </div>

      {/* Operational Action Triggers */}
      <div className="ledger-actions">
        <button
          id="btn-simulate-dispute"
          className="btn btn-crimson"
          onClick={onSimulateAttack}
          disabled={isSimulatingAttack}
          title="Inject a synthetic inbound PayPal dispute webhook event into the queue"
        >
          <Zap size={13} className={isSimulatingAttack ? 'spin' : ''} />
          <span>{isSimulatingAttack ? 'Ingesting Webhook...' : 'Simulate Dispute Attack'}</span>
        </button>

        {stats.openCount > 0 && (
          <button
            id="btn-auto-defend-all"
            className="btn btn-primary"
            onClick={onBatchDefend}
            disabled={isBatchDefending}
            title="Compile evidence and dispatch all pending disputes to PayPal API"
          >
            <Send size={13} />
            <span>{isBatchDefending ? 'Dispatching...' : `Batch Defend (${stats.openCount})`}</span>
          </button>
        )}

        <button
          className="btn btn-secondary"
          onClick={onResetQueue}
          title="Reset queue to initial 4 PayPal dispute cases"
          style={{ padding: '7px 9px' }}
        >
          <RotateCcw size={13} />
        </button>
      </div>
    </header>
  );
}
