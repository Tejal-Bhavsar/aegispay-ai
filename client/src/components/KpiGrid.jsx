import React from 'react';
import { DollarSign, ShieldCheck, Zap, Award, Clock } from 'lucide-react';

export default function KpiGrid({ analytics }) {
  const protectedRev = analytics ? parseFloat(analytics.protected_revenue_usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00';
  const totalVolume = analytics ? parseFloat(analytics.total_disputed_volume_usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00';

  return (
    <section className="kpi-grid">
      {/* 1. Protected Revenue */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Protected Revenue</span>
          <div className="kpi-icon-wrapper" style={{ background: 'var(--emerald-bg)', color: 'var(--emerald-400)' }}>
            <ShieldCheck size={18} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value" style={{ color: 'var(--emerald-400)' }}>${protectedRev}</span>
          <span className="kpi-badge" style={{ background: 'var(--emerald-bg)', color: 'var(--emerald-400)' }}>
            100% Retained
          </span>
        </div>
        <div className="kpi-footer">
          <span>Total In-Flight Disputes: <strong>${totalVolume}</strong></span>
        </div>
      </div>

      {/* 2. Automation Win Rate */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Dispute Win Rate</span>
          <div className="kpi-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#A5B4FC' }}>
            <Award size={18} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">94.6%</span>
          <span className="kpi-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
            +66.6% vs Manual
          </span>
        </div>
        <div className="kpi-footer">
          <span>Visa/Mastercard/PayPal industry benchmark: 28%</span>
        </div>
      </div>

      {/* 3. Defense Velocity */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Defense Turnaround</span>
          <div className="kpi-icon-wrapper" style={{ background: 'var(--cyan-bg)', color: 'var(--cyan-400)' }}>
            <Zap size={18} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value" style={{ color: 'var(--cyan-400)' }}>34 sec</span>
          <span className="kpi-badge" style={{ background: 'var(--cyan-bg)', color: 'var(--cyan-400)' }}>
            Autonomous
          </span>
        </div>
        <div className="kpi-footer">
          <Clock size={12} />
          <span>Manual caseworker SLA: 10 to 14 days</span>
        </div>
      </div>

      {/* 4. PayPal Seller Protection */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Seller Protection Backing</span>
          <div className="kpi-icon-wrapper" style={{ background: 'rgba(0, 112, 186, 0.15)', color: 'var(--paypal-cyan)' }}>
            <DollarSign size={18} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value">{analytics?.seller_protection_eligible_pct || 75}%</span>
          <span className="kpi-badge" style={{ background: 'rgba(0, 207, 222, 0.15)', color: 'var(--paypal-cyan)' }}>
            PayPal Backed
          </span>
        </div>
        <div className="kpi-footer">
          <span>Zero merchant liability on approved claims</span>
        </div>
      </div>
    </section>
  );
}
