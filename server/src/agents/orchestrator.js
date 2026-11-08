/**
 * AegisPay Swarm Orchestrator
 * Coordinates Sentinel, Sherlock, Oracle, Lex, and Pax agents into an autonomous defense loop.
 */

const sentinel = require('./sentinelAgent');
const sherlock = require('./sherlockAgent');
const oracle = require('./oracleAgent');
const lex = require('./lexAgent');
const pax = require('./paxAgent');
const disputeStore = require('../data/mockDisputes');
const paypalClient = require('../paypalClient');

class SwarmOrchestrator {
  constructor() {
    this.activeRuns = new Map();
  }

  async runInvestigation(disputeId, onStepCallback = null, strategy = 'LEGAL_AGGRESSIVE') {
    const dispute = disputeStore.getById(disputeId);
    if (!dispute) {
      throw new Error(`Dispute ${disputeId} not found in repository.`);
    }

    const allDisputes = disputeStore.getAll();
    const swarmTimeline = [];

    const emitStep = (step) => {
      swarmTimeline.push(step);
      if (onStepCallback) {
        onStepCallback(step);
      }
    };

    emitStep({
      phase: 'INITIALIZATION',
      agent: 'Orchestrator',
      timestamp: new Date().toISOString(),
      action: 'SPAWN_SWARM',
      thought: `Spawning AegisPay Multi-Agent Swarm for PayPal Dispute [${dispute.dispute_id}] using Strategy [${strategy}].`,
    });

    // Step 1: Sentinel Triage
    emitStep({
      phase: 'TRIAGE',
      agent: sentinel.name,
      timestamp: new Date().toISOString(),
      action: 'START_TRIAGE',
      thought: 'Sentinel evaluating urgency, channel, and velocity risk.',
    });
    const triageReport = await sentinel.analyze(dispute);
    triageReport.logs.forEach((log) => emitStep({ phase: 'TRIAGE', ...log }));

    // Step 2: Sherlock Forensics
    emitStep({
      phase: 'FORENSICS',
      agent: sherlock.name,
      timestamp: new Date().toISOString(),
      action: 'START_INVESTIGATION',
      thought: 'Sherlock retrieving carrier proofs and store telemetry.',
    });
    const forensicReport = await sherlock.investigate(dispute);
    forensicReport.logs.forEach((log) => emitStep({ phase: 'FORENSICS', ...log }));

    // Step 3: Oracle Syndicate Scan
    emitStep({
      phase: 'SYNDICATE_SCAN',
      agent: oracle.name,
      timestamp: new Date().toISOString(),
      action: 'START_NETWORK_SCAN',
      thought: 'Oracle cross-checking cluster relationships and address hotspots.',
    });
    const oracleReport = await oracle.scanNetwork(dispute, allDisputes);
    oracleReport.logs.forEach((log) => emitStep({ phase: 'SYNDICATE_SCAN', ...log }));

    // Step 4: Lex Legal Rebuttal Drafting
    emitStep({
      phase: 'LEGAL_SYNTHESIS',
      agent: lex.name,
      timestamp: new Date().toISOString(),
      action: 'START_DRAFTING',
      thought: `Lex formatting PayPal Seller Protection evidence pack with strategy [${strategy}].`,
    });
    const legalReport = await lex.draftRebuttal(dispute, forensicReport, oracleReport, strategy);
    legalReport.logs.forEach((log) => emitStep({ phase: 'LEGAL_SYNTHESIS', ...log }));

    // Step 5: Pax Goodwill Evaluation
    emitStep({
      phase: 'SETTLEMENT_ANALYSIS',
      agent: pax.name,
      timestamp: new Date().toISOString(),
      action: 'START_SETTLEMENT_CHECK',
      thought: 'Pax calculating goodwill settlement vs dispute fee economics.',
    });
    const settlementReport = await pax.evaluateSettlement(dispute, forensicReport);
    settlementReport.logs.forEach((log) => emitStep({ phase: 'SETTLEMENT_ANALYSIS', ...log }));

    // Determine final recommendation
    let finalRecommendation = 'FIGHT_DISPUTE';
    if (oracleReport.is_syndicate_ring) {
      finalRecommendation = 'ESCALATE_FRAUD_RING';
    } else if (settlementReport.should_settle) {
      finalRecommendation = 'SETTLE_GOODWILL';
    }

    const compiledDossier = {
      dispute_id: dispute.dispute_id,
      generated_at: new Date().toISOString(),
      recommendation: finalRecommendation,
      win_probability_pct: legalReport.win_probability_pct,
      triage: triageReport,
      forensics: forensicReport,
      oracle: oracleReport,
      legal: legalReport,
      settlement: settlementReport,
      timeline: swarmTimeline,
      paypal_payload_ready: legalReport.paypal_evidence_payload,
    };

    // Update store
    disputeStore.update(disputeId, {
      ai_state: {
        ...dispute.ai_state,
        status: 'EVIDENCE_READY',
        recommended_action: finalRecommendation,
        defense_confidence: legalReport.win_probability_pct,
        investigation_report: compiledDossier,
      },
    });

    emitStep({
      phase: 'COMPLETE',
      agent: 'Orchestrator',
      timestamp: new Date().toISOString(),
      action: 'EVIDENCE_DOSSIER_READY',
      thought: `Investigation complete. Final Recommendation: ${finalRecommendation} (${legalReport.win_probability_pct}% confidence). Dossier ready for submission to PayPal.`,
    });

    return compiledDossier;
  }

  async submitToPayPal(disputeId) {
    const dispute = disputeStore.getById(disputeId);
    if (!dispute) throw new Error(`Dispute ${disputeId} not found.`);

    let dossier = dispute.ai_state?.investigation_report;
    if (!dossier) {
      dossier = await this.runInvestigation(disputeId);
    }

    const payload = dossier.paypal_payload_ready;
    const paypalResult = await paypalClient.provideEvidence(disputeId, payload);

    disputeStore.update(disputeId, {
      status: 'UNDER_REVIEW',
      ai_state: {
        ...dispute.ai_state,
        status: 'DEFENDED_TO_PAYPAL',
        submission_receipt: paypalResult,
        submitted_at: new Date().toISOString(),
      },
    });

    return {
      success: true,
      dispute_id: disputeId,
      status: 'DEFENDED_TO_PAYPAL',
      paypal_result: paypalResult,
    };
  }
}

module.exports = new SwarmOrchestrator();
