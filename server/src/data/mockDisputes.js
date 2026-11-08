/**
 * High-fidelity dispute repository strictly modeled on PayPal Customer Disputes API v1
 * and PayPal Seller Protection specifications.
 */

const mockDisputes = [
  {
    dispute_id: 'PP-D-94821',
    create_time: '2026-11-06T09:14:22Z',
    dispute_amount: { currency_code: 'USD', value: '489.00' },
    status: 'REQUIRED_ACTION',
    dispute_life_cycle_stage: 'CHARGEBACK',
    dispute_channel: 'EXTERNAL', // Credit card bank chargeback routed to PayPal
    dispute_reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
    response_deadline: '2026-11-16T23:59:59Z', // 9 days remaining
    buyer_info: {
      name: 'Marcus Reynolds',
      email: 'm.reynolds742@gmail.com',
      paypal_account_id: 'PP-ACT-881294',
      account_age_days: 840,
      prior_dispute_count: 0,
    },
    transaction_details: {
      transaction_id: '9TX81729012384',
      order_id: 'ORD-94821',
      invoice_id: 'INV-2026-9041',
      purchase_date: '2026-10-31T18:22:10Z',
      item_title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones (Silver)',
      item_sku: 'SNY-WH1000XM5-SLV',
      item_price: '489.00',
      item_image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
      payment_source: 'Visa Credit Card ending in 4192 (via PayPal)',
    },
    shipping_address: {
      recipient_name: 'Marcus Reynolds',
      line1: '742 Evergreen Terrace',
      city: 'Austin',
      state: 'TX',
      postal_code: '78701',
      country_code: 'US',
    },
    carrier_tracking_key: 'FEDEX-94821038',
    seller_protection: {
      eligible: true,
      protection_category: 'ITEM_NOT_RECEIVED_ELIGIBLE',
      protection_reason: 'Shipped with online tracking and verified signature to PayPal confirmed address.',
    },
    ai_state: {
      status: 'PENDING_REVIEW',
      risk_score: 18, // Low risk of genuine loss, high probability of Friendly Fraud
      defense_confidence: 97, // 97% win probability under PayPal Seller Protection
      recommended_action: 'FIGHT_DISPUTE',
      recommended_evidence: 'PROOF_OF_DELIVERY_WITH_SIGNATURE',
      estimated_savings_usd: 504.00, // $489 + $15 chargeback fee
      investigation_report: null,
    },
  },

  {
    dispute_id: 'PP-D-38192',
    create_time: '2026-11-05T14:30:00Z',
    dispute_amount: { currency_code: 'USD', value: '1250.00' },
    status: 'REQUIRED_ACTION',
    dispute_life_cycle_stage: 'CHARGEBACK',
    dispute_channel: 'EXTERNAL',
    dispute_reason: 'UNAUTHORIZED',
    response_deadline: '2026-11-15T23:59:59Z',
    buyer_info: {
      name: 'Claire Vance',
      email: 'claire.vance@techcorp.io',
      paypal_account_id: 'PP-ACT-550192',
      account_age_days: 410,
      prior_dispute_count: 0,
    },
    transaction_details: {
      transaction_id: '4TX99104812391',
      order_id: 'ORD-38192',
      invoice_id: 'INV-2026-8819',
      purchase_date: '2026-10-26T20:14:02Z',
      item_title: 'MacBook Pro 14" M3 Pro 18GB/512GB Space Black',
      item_sku: 'APL-MBP14-M3P-BLK',
      item_price: '1250.00',
      item_image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      payment_source: 'Mastercard Debit ending in 9012 (via PayPal)',
    },
    shipping_address: {
      recipient_name: 'Claire Vance',
      line1: '1200 Grand Avenue, Suite 400',
      city: 'Seattle',
      state: 'WA',
      postal_code: '98101',
      country_code: 'US',
    },
    carrier_tracking_key: 'UPS-38192044',
    seller_protection: {
      eligible: true,
      protection_category: 'UNAUTHORIZED_PAYMENT_ELIGIBLE',
      protection_reason: 'PayPal 2FA SMS and Biometric authentication verified at time of capture.',
    },
    ai_state: {
      status: 'PENDING_REVIEW',
      risk_score: 22,
      defense_confidence: 94,
      recommended_action: 'FIGHT_DISPUTE',
      recommended_evidence: 'PROOF_OF_AUTHENTICATION_AND_DELIVERY',
      estimated_savings_usd: 1270.00,
      investigation_report: null,
    },
  },

  {
    dispute_id: 'PP-D-19044',
    create_time: '2026-11-04T18:02:11Z',
    dispute_amount: { currency_code: 'USD', value: '340.00' },
    status: 'REQUIRED_ACTION',
    dispute_life_cycle_stage: 'INQUIRY', // Inquiry phase: perfect for autonomous negotiator (Pax)
    dispute_channel: 'INTERNAL',
    dispute_reason: 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED',
    response_deadline: '2026-11-24T23:59:59Z',
    buyer_info: {
      name: 'David K. Miller',
      email: 'dmiller.designs@yahoo.com',
      paypal_account_id: 'PP-ACT-129038',
      account_age_days: 1200,
      prior_dispute_count: 0,
      lifetime_spend: '4820.00', // High VIP customer!
    },
    transaction_details: {
      transaction_id: '2TX33019284711',
      order_id: 'ORD-19044',
      invoice_id: 'INV-2026-7731',
      purchase_date: '2026-10-28T16:04:19Z',
      item_title: 'Refurbished Apple iPad Air (5th Gen) 64GB Wi-Fi - Starlight',
      item_sku: 'APL-IPADAIR5-64-SL',
      item_price: '340.00',
      item_image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
      payment_source: 'PayPal Balance',
      dispute_claim_notes: 'Customer claims chassis has minor scuff not depicted in product condition photos.',
    },
    shipping_address: {
      recipient_name: 'David Miller',
      line1: '450 North Elm Street, Apt 3B',
      city: 'Chicago',
      state: 'IL',
      postal_code: '60611',
      country_code: 'US',
    },
    carrier_tracking_key: 'USPS-19044812',
    seller_protection: {
      eligible: false,
      protection_category: 'NOT_ELIGIBLE',
      protection_reason: 'Significantly Not As Described claims are not covered by automated Seller Protection.',
    },
    ai_state: {
      status: 'PENDING_REVIEW',
      risk_score: 45,
      defense_confidence: 60,
      recommended_action: 'SETTLE_GOODWILL', // Pax Agent recommends $40 partial refund or prepaid return
      recommended_evidence: 'AUTONOMOUS_SETTLEMENT_OFFER',
      estimated_savings_usd: 300.00, // Saves customer relationship ($4.8k LTV) + prevents $20 chargeback fee
      investigation_report: null,
    },
  },

  {
    dispute_id: 'PP-D-88210',
    create_time: '2026-11-03T11:20:00Z',
    dispute_amount: { currency_code: 'USD', value: '899.00' },
    status: 'REQUIRED_ACTION',
    dispute_life_cycle_stage: 'CHARGEBACK',
    dispute_channel: 'EXTERNAL',
    dispute_reason: 'UNAUTHORIZED',
    response_deadline: '2026-11-13T23:59:59Z',
    buyer_info: {
      name: 'Alexei V. Petrenko',
      email: 'user_x9401@tempmail-box.cc',
      paypal_account_id: 'PP-ACT-999401',
      account_age_days: 2,
      prior_dispute_count: 4,
    },
    transaction_details: {
      transaction_id: '8TX10948291039',
      order_id: 'ORD-88210',
      invoice_id: 'INV-2026-6610',
      purchase_date: '2026-10-23T03:11:50Z',
      item_title: 'NVIDIA GeForce RTX 4080 Super 16GB Gaming GPU',
      item_sku: 'NVD-RTX4080S-16G',
      item_price: '899.00',
      item_image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80',
      payment_source: 'Amex Credit Card ending in 1004 (via PayPal)',
    },
    shipping_address: {
      recipient_name: 'Commercial Re-Shipper Dept 105',
      line1: '3500 Silverside Rd, Suite 105',
      city: 'Wilmington',
      state: 'DE',
      postal_code: '19810',
      country_code: 'US',
    },
    carrier_tracking_key: 'DHL-88210941',
    seller_protection: {
      eligible: true,
      protection_category: 'UNAUTHORIZED_PAYMENT_ELIGIBLE',
      protection_reason: 'Order shipped to verified PayPal address; re-shipper signature obtained.',
    },
    ai_state: {
      status: 'PENDING_REVIEW',
      risk_score: 96, // Highly coordinated syndicate attack!
      defense_confidence: 91,
      recommended_action: 'ESCALATE_FRAUD_RING',
      recommended_evidence: 'SYNDICATE_FORENSIC_DOSSIER',
      estimated_savings_usd: 914.00,
      investigation_report: null,
    },
  },
];

class DisputeStore {
  constructor() {
    this.disputes = [...mockDisputes];
  }

  getAll() {
    return this.disputes;
  }

  getById(id) {
    return this.disputes.find((d) => d.dispute_id === id);
  }

  update(id, partial) {
    const idx = this.disputes.findIndex((d) => d.dispute_id === id);
    if (idx !== -1) {
      this.disputes[idx] = { ...this.disputes[idx], ...partial };
      return this.disputes[idx];
    }
    return null;
  }

  add(dispute) {
    this.disputes.unshift(dispute);
    return dispute;
  }

  reset() {
    this.disputes = JSON.parse(JSON.stringify(mockDisputes));
    return this.disputes;
  }
}

module.exports = new DisputeStore();
