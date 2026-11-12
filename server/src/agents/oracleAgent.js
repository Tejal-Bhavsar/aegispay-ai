/**
 * Agent 3: Oracle - Syndicate & Fraud Ring Hunter
 * Cross-references dispute network graphs to detect coordinated syndicate attacks,
 * freight-forwarding fraud hubs, and card-testing velocity rings.
 */

class OracleAgent {
  constructor() {
    this.name = 'Oracle';
    this.role = 'Syndicate & Network Intelligence Hunter';
  }

  async scanNetwork(currentDispute, allDisputes = []) {
    const logs = [];
    logs.push({
      agent: this.name,
      timestamp: new Date().toISOString(),
      action: 'SCAN_CROSS_DISPUTE_NETWORK',
      thought: `Scanning historical cluster graph across ${allDisputes.length} active merchant transactions for syndicate patterns.`,
    });

    const currentAddr = (currentDispute.shipping_address?.line1 || '').toLowerCase();
    const currentBuyer = (currentDispute.buyer_info?.email || '').toLowerCase();
    const currentZip = currentDispute.shipping_address?.postal_code || '';

    // Check for freight forwarder or re-shipper hotspots
    const knownHotspots = [
      { name: 'Delaware Re-Shipper Hub', pattern: 'silverside', zip: '19810', risk: 95 },
      { name: 'Doral Florida Forwarder Hub', pattern: 'nw 72nd ave', zip: '33166', risk: 90 },
      { name: 'Oregon Tax-Free Export Hub', pattern: 'airport way', zip: '97230', risk: 85 },
    ];

    const matchedHotspot = knownHotspots.find(
      (h) => currentAddr.includes(h.pattern) || currentZip === h.zip
    );

    const relatedDisputes = allDisputes.filter(
      (d) =>
        d.dispute_id !== currentDispute.dispute_id &&
        ((d.shipping_address?.postal_code === currentZip && currentZip.length > 0) ||
          d.buyer_info?.email?.split('@')[1] === currentBuyer.split('@')[1])
    );

    let isSyndicateRing = false;
    let syndicateNotes = 'No organized cluster detected. Isolated transaction.';
    let syndicateRisk = 15;

    if (matchedHotspot) {
      isSyndicateRing = true;
      syndicateRisk = matchedHotspot.risk;
      syndicateNotes = `CRITICAL MATCH: Destination matches known commercial re-shipper hub [${matchedHotspot.name}]. High correlation with international freight-forwarding chargeback syndicates.`;
    } else if (relatedDisputes.length > 0) {
      isSyndicateRing = true;
      syndicateRisk = 80;
      syndicateNotes = `Cross-dispute cluster detected: linked with ${relatedDisputes.length} other pending disputes via shared postal zone or email domain.`;
    }

    logs.push({
      agent: this.name,
      timestamp: new Date().toISOString(),
      action: 'NETWORK_CLUSTER_ASSESSMENT',
      thought: `Syndicate analysis complete: Risk Score: ${syndicateRisk}/100. ${syndicateNotes}`,
    });

    return {
      agent: this.name,
      is_syndicate_ring: isSyndicateRing,
      syndicate_risk: syndicateRisk,
      hotspot_match: matchedHotspot ? matchedHotspot.name : null,
      related_dispute_ids: relatedDisputes.map((d) => d.dispute_id),
      analysis_notes: syndicateNotes,
      logs,
    };
  }
}

module.exports = new OracleAgent();
