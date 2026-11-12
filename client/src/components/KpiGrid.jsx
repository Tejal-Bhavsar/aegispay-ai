import React, { useMemo } from 'react';

const HOUR = 60 * 60 * 1000;

const money = (n) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function KpiGrid({ disputes = [] }) {
  const stats = useMemo(() => {
    const now = Date.now();
    const open = disputes.filter((d) => d.ai_state?.status !== 'DEFENDED_TO_PAYPAL');
    const submitted = disputes.length - open.length;
    const atRisk = open.reduce((sum, d) => sum + parseFloat(d.dispute_amount?.value || 0), 0);
    const dueSoon = open.filter((d) => {
      const t = new Date(d.response_deadline).getTime();
      return !Number.isNaN(t) && t - now < 72 * HOUR;
    }).length;
    const protectedCount = disputes.filter((d) => d.seller_protection?.eligible).length;
    const chargebacks = open.filter((d) => d.dispute_life_cycle_stage === 'CHARGEBACK').length;
    return { open: open.length, submitted, atRisk, dueSoon, protectedCount, chargebacks, fees: open.length * 15 };
  }, [disputes]);

  return (
    <section className="stat-strip" aria-label="Queue summary">
      <div className="stat">
        <div className="stat-label">Open disputes</div>
        <div className="stat-value">{stats.open}</div>
        <div className="stat-note">{stats.chargebacks} at chargeback stage</div>
      </div>
      <div className="stat">
        <div className="stat-label">Amount at risk</div>
        <div className="stat-value">{money(stats.atRisk)}</div>
        <div className="stat-note">plus {money(stats.fees)} in fees if lost</div>
      </div>
      <div className="stat">
        <div className="stat-label">Due within 72 hours</div>
        <div className={`stat-value ${stats.dueSoon > 0 ? 'danger' : ''}`}>{stats.dueSoon}</div>
        <div className="stat-note">{stats.dueSoon > 0 ? 'Respond first' : 'Nothing urgent'}</div>
      </div>
      <div className="stat">
        <div className="stat-label">Seller Protection eligible</div>
        <div className="stat-value">
          {stats.protectedCount}
          <span style={{ color: 'var(--ink-3)', fontSize: 15 }}> / {disputes.length}</span>
        </div>
        <div className="stat-note">Covered if evidence is sent in time</div>
      </div>
      <div className="stat">
        <div className="stat-label">Evidence sent to PayPal</div>
        <div className="stat-value">{stats.submitted}</div>
        <div className="stat-note">Awaiting PayPal decision</div>
      </div>
    </section>
  );
}
