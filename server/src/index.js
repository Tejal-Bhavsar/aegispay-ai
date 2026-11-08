require('dotenv').config();
const express = require('express');
const cors = require('cors');
const disputeStore = require('./data/mockDisputes');
const orchestrator = require('./agents/orchestrator');
const paypalClient = require('./paypalClient');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'AegisPay Multi-Agent Dispute Defense Platform',
    version: '1.0.0',
    paypal_mode: paypalClient.isConfigured() ? 'LIVE_SANDBOX' : 'SIMULATION_SANDBOX',
    timestamp: new Date().toISOString(),
  });
});

// 2. PayPal Credentials Status & Configuration
app.get('/api/paypal/status', async (req, res) => {
  const status = await paypalClient.verifyConnection();
  res.json(status);
});

app.post('/api/paypal/configure', async (req, res) => {
  const { clientId, clientSecret, isSandbox = true } = req.body;
  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: 'Both clientId and clientSecret are required.' });
  }

  paypalClient.updateCredentials(clientId, clientSecret, isSandbox);
  const status = await paypalClient.verifyConnection();
  res.json(status);
});

// 3. List all disputes (For AG Grid table)
app.get('/api/disputes', (req, res) => {
  const disputes = disputeStore.getAll();
  res.json({
    total: disputes.length,
    disputes,
  });
});

// 4. Get single dispute
app.get('/api/disputes/:id', (req, res) => {
  const dispute = disputeStore.getById(req.params.id);
  if (!dispute) {
    return res.status(404).json({ error: `Dispute ${req.params.id} not found.` });
  }
  res.json(dispute);
});

// 5. Run Investigation (Synchronous)
app.post('/api/disputes/:id/investigate', async (req, res) => {
  try {
    const strategy = req.body?.strategy || req.query.strategy || 'LEGAL_AGGRESSIVE';
    const report = await orchestrator.runInvestigation(req.params.id, null, strategy);
    const updatedDispute = disputeStore.getById(req.params.id);
    res.json({
      success: true,
      report,
      dispute: updatedDispute,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. SSE Real-Time Streaming Agent Investigation
app.get('/api/disputes/:id/investigate-stream', async (req, res) => {
  const disputeId = req.params.id;
  const strategy = req.query.strategy || 'LEGAL_AGGRESSIVE';
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    await orchestrator.runInvestigation(disputeId, (step) => {
      res.write(`data: ${JSON.stringify(step)}\n\n`);
    }, strategy);
    const updatedDispute = disputeStore.getById(disputeId);
    res.write(`data: ${JSON.stringify({ type: 'COMPLETE_PAYLOAD', dispute: updatedDispute })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ type: 'ERROR', message: error.message })}\n\n`);
    res.end();
  }
});

// 7. Submit Evidence to PayPal Disputes API
app.post('/api/disputes/:id/submit', async (req, res) => {
  try {
    const result = await orchestrator.submitToPayPal(req.params.id);
    const updated = disputeStore.getById(req.params.id);
    res.json({
      success: true,
      result,
      dispute: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Simulate a fresh dispute attack (Interactive demo feature)
app.post('/api/disputes/simulate-attack', (req, res) => {
  const types = [
    {
      reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
      item: 'Bose QuietComfort Ultra Noise-Cancelling Headphones',
      price: '429.00',
      sku: 'BOS-QCULTRA-BLK',
      buyer: 'Jordan Blake',
      email: 'jordan.blake.99@gmail.com',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    },
    {
      reason: 'UNAUTHORIZED',
      item: 'Sony Alpha 7 IV Full-frame Mirrorless Camera Body',
      price: '2498.00',
      sku: 'SNY-A7M4-BODY',
      buyer: 'Rachel Sterling',
      email: 'rachel.s.creative@protonmail.com',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    },
    {
      reason: 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED',
      item: 'Vintage Omega Seamaster Automatic Chronograph Watch',
      price: '1850.00',
      sku: 'OMG-SEAMASTER-VNTG',
      buyer: 'Thomas Sterling Jr.',
      email: 'tsterling@sterlingcapital.com',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const template = types[Math.floor(Math.random() * types.length)];
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const disputeId = `PP-D-${randomNum}`;
  const orderId = `ORD-${randomNum}`;

  const newDispute = {
    dispute_id: disputeId,
    create_time: new Date().toISOString(),
    dispute_amount: { currency_code: 'USD', value: template.price },
    status: 'REQUIRED_ACTION',
    dispute_life_cycle_stage: 'CHARGEBACK',
    dispute_channel: 'EXTERNAL',
    dispute_reason: template.reason,
    response_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    buyer_info: {
      name: template.buyer,
      email: template.email,
      paypal_account_id: `PP-ACT-${randomNum}`,
      account_age_days: Math.floor(30 + Math.random() * 400),
      prior_dispute_count: Math.floor(Math.random() * 2),
    },
    transaction_details: {
      transaction_id: `TX${uuidv4().substring(0, 12).toUpperCase()}`,
      order_id: orderId,
      invoice_id: `INV-2026-${randomNum}`,
      purchase_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      item_title: template.item,
      item_sku: template.sku,
      item_price: template.price,
      item_image: template.image,
      payment_source: 'Credit Card (via PayPal Checkout)',
    },
    shipping_address: {
      recipient_name: template.buyer,
      line1: '742 Evergreen Terrace',
      city: 'Austin',
      state: 'TX',
      postal_code: '78701',
      country_code: 'US',
    },
    carrier_tracking_key: 'FEDEX-94821038',
    seller_protection: {
      eligible: true,
      protection_category: template.reason === 'UNAUTHORIZED' ? 'UNAUTHORIZED_PAYMENT_ELIGIBLE' : 'ITEM_NOT_RECEIVED_ELIGIBLE',
      protection_reason: 'Shipped to verified PayPal address with recorded online tracking.',
    },
    ai_state: {
      status: 'PENDING_REVIEW',
      risk_score: 20,
      defense_confidence: 96,
      recommended_action: 'FIGHT_DISPUTE',
      recommended_evidence: 'PROOF_OF_DELIVERY_WITH_SIGNATURE',
      estimated_savings_usd: parseFloat(template.price) + 15,
      investigation_report: null,
    },
  };

  disputeStore.add(newDispute);
  res.json({
    success: true,
    message: `Simulated dispute event ingested: ${disputeId}`,
    dispute: newDispute,
  });
});

// 9. Batch Defend All Pending Disputes
app.post('/api/disputes/batch-defend', async (req, res) => {
  const disputes = disputeStore.getAll().filter((d) => d.ai_state.status === 'PENDING_REVIEW');
  const results = [];

  for (const d of disputes) {
    await orchestrator.runInvestigation(d.dispute_id);
    const subRes = await orchestrator.submitToPayPal(d.dispute_id);
    results.push(subRes);
  }

  res.json({
    success: true,
    count: results.length,
    results,
    disputes: disputeStore.getAll(),
  });
});

// 10. Reset data store
app.post('/api/disputes/reset', (req, res) => {
  const restored = disputeStore.reset();
  res.json({ success: true, count: restored.length, disputes: restored });
});

// 11. Dashboard Analytics & KPIs
app.get('/api/analytics', (req, res) => {
  const disputes = disputeStore.getAll();
  const totalVolume = disputes.reduce((sum, d) => sum + parseFloat(d.dispute_amount.value), 0);
  const defended = disputes.filter((d) => d.ai_state.status === 'DEFENDED_TO_PAYPAL');
  const protectedRevenue = defended.reduce((sum, d) => sum + parseFloat(d.dispute_amount.value), 0);
  const sellerProtectedCount = disputes.filter((d) => d.seller_protection?.eligible).length;

  res.json({
    total_disputes: disputes.length,
    total_disputed_volume_usd: totalVolume.toFixed(2),
    defended_count: defended.length,
    protected_revenue_usd: protectedRevenue.toFixed(2),
    automation_win_rate_pct: 94.6,
    avg_resolution_seconds: 34, // vs 14 days manual!
    seller_protection_eligible_pct: Math.round((sellerProtectedCount / disputes.length) * 100),
    disputes_by_reason: {
      INR: disputes.filter((d) => d.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED').length,
      UNAUTHORIZED: disputes.filter((d) => d.dispute_reason === 'UNAUTHORIZED').length,
      SNAD: disputes.filter((d) => d.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED').length,
    },
  });
});

// 12. Oracle Syndicate Hunter Intelligence Graph
app.get('/api/syndicates', (req, res) => {
  res.json({
    active_threat_level: 'HIGH',
    identified_clusters: [
      {
        cluster_id: 'SYN-DE-19810',
        name: 'Delaware Re-Shipper Syndicate Ring',
        pattern: 'Bulk GPU & Electronics orders shipped to commercial freight forwarder suites with synthetic identities.',
        location: 'Wilmington, Delaware 19810',
        total_attempts: 12,
        blocked_volume_usd: '14,890.00',
        confidence_pct: 98,
        disputes_involved: ['PP-D-88210'],
        threat_level: 'CRITICAL',
      },
      {
        cluster_id: 'SYN-FL-33166',
        name: 'South Florida Export Proxy Group',
        pattern: 'Rotating prepaid debit cards paired with Latin America IP proxies targeting consumer audio tech.',
        location: 'Doral, Florida 33166',
        total_attempts: 7,
        blocked_volume_usd: '5,320.00',
        confidence_pct: 89,
        disputes_involved: [],
        threat_level: 'MODERATE',
      },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`[AegisPay Server] Running on http://localhost:${PORT}`);
  console.log(`[PayPal Mode] ${paypalClient.isConfigured() ? 'Live Sandbox' : 'Sandbox Simulation'}`);
});
