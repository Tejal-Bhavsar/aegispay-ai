/**
 * Agent 1: Sentinel - Dispute Triage & Intake Agent
 * Responsible for intake parsing, urgency calculation, deadline tracking,
 * and velocity risk stratification.
 */

class SentinelAgent {
  constructor() {
    this.name = 'Sentinel';
    this.role = 'Dispute Triage & Velocity Sentinel';
  }

  async analyze(dispute) {
    const logs = [];
    logs.push({
      agent: this.name,
      timestamp: new Date().toISOString(),
      action: 'INGEST_DISPUTE_EVENT',
      thought: `Ingesting PayPal dispute event ${dispute.dispute_id} for amount ${dispute.dispute_amount.currency_code} ${dispute.dispute_amount.value}.`,
    });

    // 1. Calculate time remaining
    const now = new Date();
    const deadline = new Date(dispute.response_deadline);
    const hoursRemaining = Math.max(0, Math.round((deadline - now) / (1000 * 60 * 60)));
    const daysRemaining = Math.round(hoursRemaining / 24);

    let urgencyLevel = 'NORMAL';
    if (hoursRemaining < 48) {
      urgencyLevel = 'CRITICAL';
    } else if (hoursRemaining < 120) {
      urgencyLevel = 'HIGH';
    }

    logs.push({
      agent: this.name,
      timestamp: new Date().toISOString(),
      action: 'EVALUATE_DEADLINE',
      thought: `PayPal response deadline is ${dispute.response_deadline} (${daysRemaining} days / ${hoursRemaining} hours remaining). Urgency tier: ${urgencyLevel}.`,
    });

    // 2. Velocity and Account Longevity Analysis
    const buyer = dispute.buyer_info || {};
    const accountAge = buyer.account_age_days || 0;
    const priorDisputes = buyer.prior_dispute_count || 0;

    let velocityRisk = 'LOW';
    if (accountAge < 7 && priorDisputes > 1) {
      velocityRisk = 'SEVERE';
    } else if (priorDisputes >= 3) {
      velocityRisk = 'HIGH';
    } else if (accountAge > 180 && priorDisputes === 0) {
      velocityRisk = 'MINIMAL';
    }

    logs.push({
      agent: this.name,
      timestamp: new Date().toISOString(),
      action: 'VELOCITY_ASSESSMENT',
      thought: `Buyer account age: ${accountAge} days, prior disputes on record: ${priorDisputes}. Velocity profile: ${velocityRisk}.`,
    });

    // 3. Dispute Channel Categorization
    const isExternalChargeback = dispute.dispute_channel === 'EXTERNAL';
    logs.push({
      agent: this.name,
      timestamp: new Date().toISOString(),
      action: 'CHANNEL_CLASSIFICATION',
      thought: `Dispute channel is ${dispute.dispute_channel} (${isExternalChargeback ? 'Bank Card Issuer Chargeback' : 'PayPal Internal Dispute'}). Stage: ${dispute.dispute_life_cycle_stage}.`,
    });

    return {
      agent: this.name,
      urgency_level: urgencyLevel,
      hours_remaining: hoursRemaining,
      days_remaining: daysRemaining,
      velocity_risk: velocityRisk,
      is_external_chargeback: isExternalChargeback,
      recommended_pipeline: dispute.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED' ? 'SETTLEMENT_OR_REBUTTAL' : 'AUTOMATED_DEFENSE',
      logs,
    };
  }
}

module.exports = new SentinelAgent();
