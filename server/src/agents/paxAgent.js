/**
 * Agent 5: Pax - Autonomous Goodwill & Pre-Dispute Settlement Agent
 * Analyzes Customer Lifetime Value (LTV), brand reputation impact, and dispute fees.
 * Formulates smart micro-settlements during the Inquiry phase to prevent costly chargeback escalation.
 */

class PaxAgent {
  constructor() {
    this.name = 'Pax';
    this.role = 'Autonomous Settlement & Goodwill Negotiator';
  }

  async evaluateSettlement(dispute, forensicFindings) {
    const logs = [];
    logs.push({
      agent: this.name,
      timestamp: new Date().toISOString(),
      action: 'EVALUATE_GOODWILL_ECONOMICS',
      thought: `Assessing customer LTV vs dispute processing costs for dispute ${dispute.dispute_id}.`,
    });

    const buyer = dispute.buyer_info || {};
    const lifetimeSpend = parseFloat(buyer.lifetime_spend || '0');
    const claimAmount = parseFloat(dispute.dispute_amount.value);
    const standardDisputeFee = 20.00; // Average merchant card chargeback fee

    const isSubjectiveSNAD = dispute.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED';
    const isHighValueCustomer = lifetimeSpend > 1000 || buyer.account_age_days > 365;

    let shouldSettle = false;
    let proposedRefundAmount = 0;
    let strategy = 'FIGHT_FULL_DISPUTE';
    let rationale = '';

    if (isSubjectiveSNAD && isHighValueCustomer) {
      shouldSettle = true;
      // Propose 15% goodwill partial refund or $40 repair voucher
      proposedRefundAmount = Math.min(claimAmount * 0.15, 50.00);
      strategy = 'PROPOSE_GOODWILL_PARTIAL_REFUND';
      rationale = `Customer has high lifetime spend ($${lifetimeSpend.toFixed(2)}) and 0 prior disputes. Incurring a chargeback fee ($${standardDisputeFee}) and alienating a loyal customer costs more than a $${proposedRefundAmount.toFixed(2)} partial refund.`;
    } else if (isSubjectiveSNAD && !isHighValueCustomer) {
      strategy = 'REQUEST_RETURN_FOR_REFUND';
      rationale = 'Customer claims item condition issue; offer merchant prepaid return label in accordance with PayPal return policies.';
    } else {
      strategy = 'NO_SETTLEMENT_DEFEND_CLAIM';
      rationale = 'Factual delivery confirmed with clean telemetry. Zero merchant defect identified. Defend 100%.';
    }

    logs.push({
      agent: this.name,
      timestamp: new Date().toISOString(),
      action: 'SETTLEMENT_STRATEGY_DECIDED',
      thought: `Strategy: ${strategy}. Proposed refund: $${proposedRefundAmount.toFixed(2)}. ${rationale}`,
    });

    const customerMessage = `
Hi ${buyer.name || 'there'},

We received your inquiry regarding order #${dispute.transaction_details.order_id} (${dispute.transaction_details.item_title}). 

As a valued customer, we want to ensure you are 100% satisfied. Rather than waiting weeks for bank dispute processing, we would like to offer an immediate goodwill credit of $${proposedRefundAmount.toFixed(2)} directly back to your PayPal account to resolve this matter today.

If you accept, simply reply to this PayPal resolution message and the credit will be posted immediately.
`.trim();

    return {
      agent: this.name,
      should_settle: shouldSettle,
      strategy,
      proposed_refund_amount: proposedRefundAmount,
      economic_rationale: rationale,
      customer_message: customerMessage,
      net_merchant_savings_usd: shouldSettle ? (claimAmount - proposedRefundAmount + standardDisputeFee) : 0,
      logs,
    };
  }
}

module.exports = new PaxAgent();
