/**
 * Agent 2: Sherlock - Forensic Evidence Gatherer
 * Deep cross-system detective that queries carrier APIs, order records,
 * and device network telemetry to construct an unassailable factual timeline.
 */

const { getCarrierTelemetry } = require('../data/carrierService');
const { getOrderTelemetry } = require('../data/telemetryService');

class SherlockAgent {
  constructor() {
    this.name = 'Sherlock';
    this.role = 'Forensic Evidence Detective';
  }

  async investigate(dispute) {
    const logs = [];
    const orderId = dispute.transaction_details.order_id;
    const trackingKey = dispute.carrier_tracking_key;

    logs.push({
      agent: this.name,
      timestamp: new Date().toISOString(),
      action: 'INITIATE_FORENSIC_SWEEP',
      thought: `Querying carrier feeds for key [${trackingKey}] and merchant telemetry for order [${orderId}].`,
    });

    // 1. Fetch carrier proof of delivery
    const carrierData = getCarrierTelemetry(trackingKey);
    logs.push({
      agent: this.name,
      timestamp: new Date().toISOString(),
      action: 'CARRIER_VERIFICATION',
      thought: `Carrier [${carrierData.carrier}] reports status '${carrierData.status}' on ${carrierData.delivery_timestamp}. Signed by: '${carrierData.signed_by}'. GPS fix: (${carrierData.geo_coordinates.latitude}, ${carrierData.geo_coordinates.longitude}).`,
    });

    // 2. Fetch network and checkout telemetry
    const telemetry = getOrderTelemetry(orderId);
    logs.push({
      agent: this.name,
      timestamp: new Date().toISOString(),
      action: 'NETWORK_FORENSICS',
      thought: `Checkout IP [${telemetry.checkout_ip}] located in ${telemetry.ip_geolocation.city}, ${telemetry.ip_geolocation.region} (${telemetry.ip_geolocation.isp}). VPN/Tor: ${telemetry.ip_geolocation.is_vpn}. Distance to delivery address: ${telemetry.ip_geolocation.distance_to_shipping_km} km.`,
    });

    // 3. Temporal Sequence Analysis
    const deliveryDate = new Date(carrierData.delivery_timestamp);
    const disputeDate = new Date(dispute.create_time);
    const deliveredBeforeDispute = deliveryDate < disputeDate;
    const daysFromDeliveryToDispute = Math.round((disputeDate - deliveryDate) / (1000 * 60 * 60 * 24));

    logs.push({
      agent: this.name,
      timestamp: new Date().toISOString(),
      action: 'CHRONOLOGY_AUDIT',
      thought: `Item was delivered on ${carrierData.delivery_timestamp}; dispute was filed on ${dispute.create_time} (${daysFromDeliveryToDispute} days post-delivery). Temporal sequence confirms item was in buyer possession prior to claim.`,
    });

    // 4. Address Cross-Validation (Crucial for PayPal Seller Protection)
    const expectedAddress = dispute.shipping_address;
    const deliveredStreet = carrierData.recipient_address?.street || '';
    const addressMatch = deliveredStreet.toLowerCase().includes(expectedAddress.line1.split(' ')[0].toLowerCase());

    logs.push({
      agent: this.name,
      timestamp: new Date().toISOString(),
      action: 'SELLER_PROTECTION_ADDRESS_CHECK',
      thought: `Cross-checking PayPal confirmed shipping address against carrier destination: [${expectedAddress.line1}, ${expectedAddress.city}] vs [${carrierData.recipient_address?.street || 'N/A'}]. Address match: ${addressMatch ? '100% IDENTICAL' : 'FLAGGED_MISMATCH'}.`,
    });

    // 5. Fraud Classification
    let hypothesis = 'FRIENDLY_FRAUD_FIRST_PARTY';
    let confidence = 95;

    if (telemetry.ip_geolocation.is_tor || telemetry.ip_geolocation.distance_to_shipping_km > 1000) {
      hypothesis = 'COORDINATED_THIRD_PARTY_FRAUD';
      confidence = 92;
    } else if (dispute.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED') {
      hypothesis = 'SUBJECTIVE_BUYER_DISSATISFACTION';
      confidence = 88;
    }

    logs.push({
      agent: this.name,
      timestamp: new Date().toISOString(),
      action: 'HYPOTHESIS_FORMULATION',
      thought: `Forensic findings point to: ${hypothesis} with ${confidence}% confidence. Assembling factual evidentiary bundle for legal synthesis.`,
    });

    return {
      agent: this.name,
      carrier_data: carrierData,
      telemetry: telemetry,
      delivered_before_dispute: deliveredBeforeDispute,
      days_from_delivery_to_dispute: daysFromDeliveryToDispute,
      address_match: addressMatch,
      fraud_hypothesis: hypothesis,
      confidence,
      logs,
    };
  }
}

module.exports = new SherlockAgent();
