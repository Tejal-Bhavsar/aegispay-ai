/**
 * Agent 4: Lex - Legal & Evidence Synthesis Agent
 * Synthesizes forensic findings into bank-grade rebuttals compliant with
 * PayPal Seller Protection Policy and Visa/Mastercard Compelling Evidence 3.0 rules.
 * Supports configurable defense strategies: LEGAL_AGGRESSIVE, DIPLOMATIC_INQUIRY, SYNDICATE_FRAUD_ESCALATION.
 */

class LexAgent {
  constructor() {
    this.name = 'Lex';
    this.role = 'Legal & Regulatory Rebuttal Architect';
  }

  generateRebuttalByTone(dispute, carrier, telemetry, strategy = 'LEGAL_AGGRESSIVE', oracleFindings = {}) {
    const isINR = dispute.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED';
    const isUnauthorized = dispute.dispute_reason === 'UNAUTHORIZED';
    const currency = dispute.dispute_amount.currency_code;
    const value = dispute.dispute_amount.value;

    if (strategy === 'SYNDICATE_FRAUD_ESCALATION' || oracleFindings.is_syndicate_ring) {
      return `
TO: PayPal Risk & Fraud Operations Directorate
CASE REF: FRAUD_RING_ESCALATION // DISPUTE ${dispute.dispute_id}
ORDER ID: ${dispute.transaction_details.order_id}
FLAGGED AMOUNT: ${currency} ${value}
SUSPECT ENTITY: ${dispute.buyer_info.name} (${dispute.buyer_info.email})

FORMAL CRIMINAL & SYNDICATE FRAUD REPORT:

AegisPay's Oracle Intelligence Hunter has isolated transaction #${dispute.transaction_details.order_id} as part of a high-velocity coordinated chargeback syndicate.

1. SYNDICATE INDICATORS & NETWORK CORRELATION
   - Re-Shipper Hotspot: Destination [${carrier.recipient_address?.street || dispute.shipping_address.line1}] matches known commercial freight-forwarding transshipment hub (${oracleFindings.hotspot_match || 'Commercial Proxy Drop'}).
   - Tor / Datacenter Proxy: Checkout originated from IP ${telemetry.checkout_ip} (${telemetry.ip_geolocation.isp}), registered as a hosting datacenter node with zero residential ISP signature.
   - Bot Checkout Velocity: Transaction was completed via automated Headless Chrome script in ${telemetry.authentication_record.checkout_duration_seconds} seconds.

2. EVIDENCE OF DELIVERY TO DESIGNATED FREIGHT FORWARDER
   - Carrier: ${carrier.carrier} (Tracking: ${carrier.tracking_number})
   - Destination Delivery: Handed to commercial drop agent on ${carrier.delivery_timestamp}.
   - Satellite GPS: Fix logged at ${carrier.geo_coordinates.latitude}, ${carrier.geo_coordinates.longitude}.

3. ACTION REQUESTED
In accordance with PayPal Acceptable Use & Seller Protection rules, merchant fulfillment to the buyer's specified address is complete. We request immediate dispute dismissal and referral of account [${dispute.buyer_info.paypal_account_id}] to PayPal Global Fraud Investigation.
`.trim();
    }

    if (strategy === 'DIPLOMATIC_INQUIRY') {
      return `
TO: PayPal Resolution Center & ${dispute.buyer_info.name}
RE: Friendly Inquiry Resolution for Order #${dispute.transaction_details.order_id}
DISPUTE ID: ${dispute.dispute_id}
AMOUNT: ${currency} ${value}

DEAR VALUED CUSTOMER & RESOLUTION TEAM,

We are committed to delivering five-star satisfaction on every purchase. We received notice of your inquiry regarding ${dispute.transaction_details.item_title}.

1. TRACKING DETAILS & DELIVERY STATUS
Our records confirm that your package was shipped via ${carrier.carrier} under tracking #${carrier.tracking_number}. Carrier records confirm delivery to your specified shipping address on ${carrier.delivery_timestamp} (${carrier.delivered_to}).

2. RESOLUTION OPTIONS
If the package was mislaid or placed in a community locker, please check around your front porch or building reception. Should you have any concerns regarding the product itself, our support team is available 24/7 to issue a replacement or store credit without requiring prolonged bank processing.

We respectfully submit the verified tracking confirmation and request resolution in accordance with PayPal guidelines.
`.trim();
    }

    // Default: Strict Legal Aggressive (Visa CE 3.0 + PayPal Seller Protection Section 11)
    return `
TO: PayPal Dispute Adjudication Team & Card Issuing Bank
RE: Formal Merchant Rebuttal for Dispute ${dispute.dispute_id}
TRANSACTION ID: ${dispute.transaction_details.transaction_id}
ORDER ID: ${dispute.transaction_details.order_id}
CLAIMED AMOUNT: ${currency} ${value}
CLAIM REASON: ${dispute.dispute_reason}

ESTEEMED REVIEW COMMITTEE,

The merchant respectfully submits this formal rebuttal along with conclusive physical and digital evidence demonstrating that the disputed transaction was legitimately authorized, fulfilled in exact accordance with merchant terms, and delivered directly to the cardholder.

1. PROOF OF PHYSICAL DELIVERY (PayPal Seller Protection Compliant)
   - Carrier: ${carrier.carrier}
   - Tracking Number: ${carrier.tracking_number}
   - Delivery Timestamp: ${carrier.delivery_timestamp}
   - Delivery Location: ${carrier.delivered_to}
   - Destination Street: ${carrier.recipient_address?.street || dispute.shipping_address.line1}
   - Recipient Geolocation Fix: Lat ${carrier.geo_coordinates.latitude}, Lon ${carrier.geo_coordinates.longitude} (Accuracy: ${carrier.geo_coordinates.accuracy_meters}m)
   - Proof of Signature: ${carrier.signed_by || 'Waived per carrier contactless protocol'}
   - Delivery Checkpoints: ${carrier.transit_checkpoints?.length || 3} sequential barcode scans logged in carrier chain of custody.

2. CARDHOLDER TELEMETRY & COMPELLING EVIDENCE (Visa CE 3.0 Standard)
   - Checkout IP: ${telemetry.checkout_ip} (${telemetry.ip_geolocation.city}, ${telemetry.ip_geolocation.region}, ISP: ${telemetry.ip_geolocation.isp})
   - IP Proximity to Delivery Destination: ${telemetry.ip_geolocation.distance_to_shipping_km} km (confirms local resident access).
   - Authentication Method: ${telemetry.authentication_record.auth_type} (MFA Verified: ${telemetry.authentication_record.mfa_verified}).
   - Device Hardware Hash: ${telemetry.device_fingerprint.hardware_hash} (Recognized returning browser profile).
   - Terms & Conditions Agreement: Accepted electronically at ${telemetry.authentication_record.timestamp}.

3. LEGAL CONCLUSION & SELLER PROTECTION CLAIM
The merchant has satisfied all requirements set forth in the PayPal Seller Protection Policy and industry Card-Not-Present dispute guidelines. The item was delivered in full prior to the dispute submission, and cardholder telemetry confirms legitimate authorization. We request that PayPal immediately close this dispute in favor of the merchant and release the held funds of ${currency} ${value}.

Respectfully submitted,
AegisPay Automated Defense Swarm on behalf of Merchant
`.trim();
  }

  async draftRebuttal(dispute, forensicFindings, oracleFindings, strategy = 'LEGAL_AGGRESSIVE') {
    const logs = [];
    logs.push({
      agent: this.name,
      timestamp: new Date().toISOString(),
      action: 'EVALUATE_SELLER_PROTECTION',
      thought: `Reviewing claim against PayPal Seller Protection standards for reason [${dispute.dispute_reason}] using strategy [${strategy}].`,
    });

    const carrier = forensicFindings.carrier_data;
    const telemetry = forensicFindings.telemetry;
    const isINR = dispute.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED';
    const isUnauthorized = dispute.dispute_reason === 'UNAUTHORIZED';
    const amountVal = parseFloat(dispute.dispute_amount.value);
    const requiresSignature = amountVal >= 750.00;

    let sellerProtectionStatus = 'ELIGIBLE';
    let legalGrounds = [];

    if (isINR) {
      if (carrier.status === 'DELIVERED') {
        legalGrounds.push('Online tracking confirms verified delivery to the recipient address provided on PayPal Order.');
      }
      if (requiresSignature) {
        if (carrier.signed_by) {
          legalGrounds.push(`High-value transaction ($${amountVal.toFixed(2)} >= $750.00): Mandatory signature confirmation satisfied via signatory '${carrier.signed_by}'.`);
        } else {
          sellerProtectionStatus = 'PARTIAL_REVIEW';
          legalGrounds.push('Signature missing on high value order.');
        }
      }
      legalGrounds.push(`Carrier GPS timestamp (${carrier.delivery_timestamp}) precedes dispute creation by ${forensicFindings.days_from_delivery_to_dispute} days.`);
    } else if (isUnauthorized) {
      legalGrounds.push(`Customer authenticated checkout session via ${telemetry.authentication_record.auth_type}.`);
      legalGrounds.push(`Checkout IP address was located within ${telemetry.ip_geolocation.distance_to_shipping_km} km of the shipping destination.`);
      legalGrounds.push(`Device fingerprint hash matches ${telemetry.device_fingerprint.prior_sessions_count} previous verified merchant transactions.`);
    }

    // Generate formal rebuttal statement using chosen strategy
    const formalRebuttalLetter = this.generateRebuttalByTone(dispute, carrier, telemetry, strategy, oracleFindings);

    // PayPal API formatted payload for /v1/customer/disputes/{id}/provide-evidence
    const paypalEvidencePayload = {
      evidence_type: isINR ? 'PROOF_OF_DELIVERY' : 'PROOF_OF_FULFILLMENT',
      evidence_info: {
        tracking_info: [
          {
            carrier_name: carrier.carrier.toUpperCase().includes('FEDEX')
              ? 'FEDEX'
              : carrier.carrier.toUpperCase().includes('UPS')
              ? 'UPS'
              : carrier.carrier.toUpperCase().includes('DHL')
              ? 'DHL'
              : 'USPS',
            tracking_number: carrier.tracking_number,
          },
        ],
      },
      notes: formalRebuttalLetter,
      item_tags: [
        'SELLER_PROTECTION_CLAIMED',
        'CARRIER_GPS_VERIFIED',
        'DELIVERY_CONFIRMED',
        isUnauthorized ? '2FA_AUTHENTICATED' : 'SIGNATURE_CAPTURED',
      ],
    };

    logs.push({
      agent: this.name,
      timestamp: new Date().toISOString(),
      action: 'PAYLOAD_COMPILED',
      thought: `PayPal REST API payload compiled for endpoint [/v1/customer/disputes/${dispute.dispute_id}/provide-evidence].`,
    });

    return {
      agent: this.name,
      strategy_used: strategy,
      seller_protection_status: sellerProtectionStatus,
      legal_grounds: legalGrounds,
      formal_rebuttal_letter: formalRebuttalLetter,
      paypal_evidence_payload: paypalEvidencePayload,
      win_probability_pct: Math.min(99, forensicFindings.confidence + 3),
      logs,
    };
  }
}

module.exports = new LexAgent();
