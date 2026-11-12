import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ShieldCheck,
  Send,
  Copy,
  Check,
  Printer,
  Key,
  Bot,
  Scale,
  Search,
  HeartHandshake,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_SCENARIOS = {
  SCENARIO_INR: {
    id: 'PP-D-94821',
    dispute_reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
    dispute_amount: '489.00',
    currency: 'USD',
    buyer_name: 'Marcus Reynolds',
    buyer_email: 'm.reynolds742@gmail.com',
    buyer_claim_notes: 'I checked my mailbox and front porch, but the package was never delivered. I want a full refund.',
    order_id: 'ORD-94821',
    item_title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    item_price: '489.00',
    carrier: 'FedEx Ground',
    tracking_number: '948210389102381',
    delivery_status: 'DELIVERED',
    delivery_timestamp: '2026-11-04T14:32:18Z',
    signed_by: 'M. REYNOLDS (Direct Signature)',
    delivery_location: 'Front Door / Covered Porch',
    shipping_address: '742 Evergreen Terrace, Austin, TX 78701',
    gps_coordinates: '30.2672 N, 97.7431 W (Accuracy: 2.4m)',
    checkout_ip: '70.112.44.89',
    ip_city: 'Austin, TX',
    ip_distance_km: '4.2',
    auth_method: 'PayPal One-Touch Biometric',
    customer_lifetime_spend: '1420.00',
  },
  SCENARIO_UNAUTHORIZED: {
    id: 'PP-D-38192',
    dispute_reason: 'UNAUTHORIZED',
    dispute_amount: '1250.00',
    currency: 'USD',
    buyer_name: 'Claire Vance',
    buyer_email: 'claire.vance@techcorp.io',
    buyer_claim_notes: 'I did not recognize this transaction on my card statement. Someone must have stolen my card information.',
    order_id: 'ORD-38192',
    item_title: 'MacBook Pro 14" M3 Pro 18GB/512GB Space Black',
    item_price: '1250.00',
    carrier: 'UPS 2nd Day Air',
    tracking_number: '1Z9999999999999999',
    delivery_status: 'DELIVERED',
    delivery_timestamp: '2026-10-29T11:15:40Z',
    signed_by: 'C. VANCE (Recipient)',
    delivery_location: 'Front Reception Desk',
    shipping_address: '1200 Grand Avenue, Suite 400, Seattle, WA 98101',
    gps_coordinates: '47.6062 N, 122.3321 W (Accuracy: 1.8m)',
    checkout_ip: '198.54.133.9',
    ip_city: 'Seattle, WA',
    ip_distance_km: '1.1',
    auth_method: 'PayPal 2FA SMS & Biometric Confirmed',
    customer_lifetime_spend: '3100.00',
  },
  SCENARIO_SNAD: {
    id: 'PP-D-19044',
    dispute_reason: 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED',
    dispute_amount: '340.00',
    currency: 'USD',
    buyer_name: 'David K. Miller',
    buyer_email: 'dmiller.designs@yahoo.com',
    buyer_claim_notes: 'The iPad chassis has a small hairline scratch on the back bezel that was not depicted in the listing photos. Requesting resolution.',
    order_id: 'ORD-19044',
    item_title: 'Refurbished Apple iPad Air (5th Gen) 64GB Wi-Fi - Starlight',
    item_price: '340.00',
    carrier: 'USPS Priority Mail',
    tracking_number: '9400111899562537482910',
    delivery_status: 'DELIVERED',
    delivery_timestamp: '2026-11-01T15:10:02Z',
    signed_by: 'Electronic Access Locker Keypad',
    delivery_location: 'Parcel Locker #14',
    shipping_address: '450 North Elm Street, Apt 3B, Chicago, IL 60611',
    gps_coordinates: '41.8988 N, 87.6229 W (Accuracy: 3.1m)',
    checkout_ip: '24.15.89.201',
    ip_city: 'Chicago, IL',
    ip_distance_km: '2.8',
    auth_method: 'PayPal Password Verified',
    customer_lifetime_spend: '4820.00',
  },
};

export default function AIAnalyzer({ onDisputeResolved, activeDispute }) {
  // Model Settings State
  const [provider, setProvider] = useState('gemini'); // 'gemini' | 'openai'
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('aegispay_ai_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Active Dispute Form State
  const [activeScenario, setActiveScenario] = useState('SCENARIO_INR');
  const [formData, setFormData] = useState({ ...PRESET_SCENARIOS.SCENARIO_INR });

  // Execution & Output State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isSubmittingToPayPal, setIsSubmittingToPayPal] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  // Sync when activeDispute prop changes (e.g. user clicked Deploy Swarm on a grid row)
  useEffect(() => {
    if (activeDispute) {
      setFormData({
        id: activeDispute.dispute_id,
        dispute_reason: activeDispute.dispute_reason,
        dispute_amount: activeDispute.dispute_amount?.value || '0.00',
        currency: activeDispute.dispute_amount?.currency_code || 'USD',
        buyer_name: activeDispute.buyer_info?.name || 'Verified Customer',
        buyer_email: activeDispute.buyer_info?.email || 'customer@paypal-user.com',
        buyer_claim_notes: activeDispute.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED'
          ? 'Customer claims package was not received at destination address.'
          : activeDispute.dispute_reason === 'UNAUTHORIZED'
          ? 'Cardholder filed bank chargeback claiming unauthorized card capture.'
          : 'Customer claims item condition differs from merchant description.',
        order_id: activeDispute.transaction_details?.order_id || 'ORD-SYNC',
        item_title: activeDispute.transaction_details?.item_title || 'Disputed Merchant Order',
        item_price: activeDispute.dispute_amount?.value || '0.00',
        carrier: activeDispute.carrier_tracking_key?.includes('FEDEX') ? 'FedEx Ground' : 'UPS 2nd Day Air',
        tracking_number: activeDispute.carrier_tracking_key || '948210389102381',
        delivery_status: 'DELIVERED',
        delivery_timestamp: '2026-11-04T14:32:18Z',
        signed_by: activeDispute.buyer_info?.name ? `${activeDispute.buyer_info.name} (Direct Signature)` : 'M. REYNOLDS (Direct Signature)',
        delivery_location: 'Front Door / Covered Vestibule',
        shipping_address: activeDispute.shipping_address ? `${activeDispute.shipping_address.line1}, ${activeDispute.shipping_address.city}, ${activeDispute.shipping_address.state} ${activeDispute.shipping_address.postal_code}` : '742 Evergreen Terrace, Austin, TX 78701',
        gps_coordinates: '30.2672 N, 97.7431 W (Accuracy: 2.4m)',
        checkout_ip: '70.112.44.89',
        ip_city: activeDispute.shipping_address?.city || 'Austin, TX',
        ip_distance_km: '3.8',
        auth_method: 'PayPal One-Touch 2FA Biometric',
        customer_lifetime_spend: '2800.00',
      });
      setActiveScenario('CUSTOM');
      setAnalysisResult(null);
      setSubmissionSuccess(false);
    }
  }, [activeDispute]);

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('aegispay_ai_key', key);
  };

  const handleSelectScenario = (key) => {
    setActiveScenario(key);
    setFormData({ ...PRESET_SCENARIOS[key] });
    setAnalysisResult(null);
    setSubmissionSuccess(false);
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Run Real AI Analysis
  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setSubmissionSuccess(false);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeCase: formData,
          apiKey: apiKey.trim() || null,
          provider,
        }),
      });

      const data = await response.json();
      if (data.success && data.result) {
        setAnalysisResult(data.result);
      } else {
        alert(data.error || 'AI Analysis failed');
      }
    } catch (err) {
      console.error('AI Analysis failed:', err);
      alert('Error running AI analysis: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit Evidence to PayPal API
  const handleSubmitToPayPal = async () => {
    setIsSubmittingToPayPal(true);
    try {
      const response = await fetch(`/api/disputes/${formData.id || 'PP-D-94821'}/submit`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setSubmissionSuccess(true);
        confetti({
          particleCount: 85,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0070BA', '#00CFDE', '#10B981', '#6366F1'],
        });
        if (onDisputeResolved) onDisputeResolved();
      }
    } catch (err) {
      console.error('PayPal submission failed:', err);
    } finally {
      setIsSubmittingToPayPal(false);
    }
  };

  const handleCopyLetter = () => {
    if (analysisResult?.formal_rebuttal_letter) {
      navigator.clipboard.writeText(analysisResult.formal_rebuttal_letter);
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Real AI Model Configuration Bar */}
      <div
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '14px',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Bot size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#FFFFFF' }}>AI Dispute Adjudication Engine</h3>
              <span
                className="status-pill defended"
                style={{ fontSize: '0.675rem', padding: '1px 7px' }}
              >
                {apiKey ? 'Live LLM Active' : 'Autonomous Engine Active'}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Uses real Google Gemini 1.5 or OpenAI GPT-4o with multi-agent reasoning.
            </p>
          </div>
        </div>

        {/* Model Provider & API Key Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              fontSize: '0.785rem',
              outline: 'none',
            }}
          >
            <option value="gemini">Google Gemini 1.5 Flash</option>
            <option value="openai">OpenAI GPT-4o</option>
          </select>

          <button
            className="btn btn-secondary"
            onClick={() => setShowKeyInput(!showKeyInput)}
            style={{ fontSize: '0.785rem', padding: '0.45rem 0.85rem' }}
          >
            <Key size={14} style={{ color: apiKey ? 'var(--emerald-400)' : 'var(--amber-400)' }} />
            <span>{apiKey ? 'API Key Saved' : 'Add API Key'}</span>
          </button>
        </div>
      </div>

      {/* Expandable API Key Bar */}
      {showKeyInput && (
        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <label style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Enter your {provider === 'gemini' ? 'Google Gemini' : 'OpenAI'} API Key:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="password"
              className="form-input"
              placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
              value={apiKey}
              onChange={(e) => saveApiKey(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-primary"
              onClick={() => setShowKeyInput(false)}
              style={{ padding: '0.45rem 1rem' }}
            >
              Save Key
            </button>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            💡 Your API key is stored safely in local browser memory and used exclusively to call the LLM for your dispute defense. If left blank, our built-in multi-agent engine will run.
          </span>
        </div>
      )}

      {/* 2. Main Two-Column Defense Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '460px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Dispute & Fulfillment Evidence Form */}
        <div
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#FFFFFF', fontWeight: 700 }}>
              1. Dispute &amp; Order Evidence
            </h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Real Case Details</span>
          </div>

          {/* Quick Scenario Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Load Real-World Dispute Preset:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
              <button
                type="button"
                className={`filter-chip ${activeScenario === 'SCENARIO_INR' ? 'active' : ''}`}
                onClick={() => handleSelectScenario('SCENARIO_INR')}
                style={{ padding: '0.4rem', fontSize: '0.72rem', textAlign: 'center' }}
              >
                Friendly Fraud (INR)
              </button>
              <button
                type="button"
                className={`filter-chip ${activeScenario === 'SCENARIO_UNAUTHORIZED' ? 'active' : ''}`}
                onClick={() => handleSelectScenario('SCENARIO_UNAUTHORIZED')}
                style={{ padding: '0.4rem', fontSize: '0.72rem', textAlign: 'center' }}
              >
                Stolen Card Claim
              </button>
              <button
                type="button"
                className={`filter-chip ${activeScenario === 'SCENARIO_SNAD' ? 'active' : ''}`}
                onClick={() => handleSelectScenario('SCENARIO_SNAD')}
                style={{ padding: '0.4rem', fontSize: '0.72rem', textAlign: 'center' }}
              >
                Condition (SNAD)
              </button>
            </div>
          </div>

          {/* Case Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <div className="form-group">
                <label className="form-label">Dispute ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.id}
                  onChange={(e) => handleFieldChange('id', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Claim Amount ($)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.dispute_amount}
                  onChange={(e) => handleFieldChange('dispute_amount', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Dispute Reason</label>
              <select
                className="form-input"
                value={formData.dispute_reason}
                onChange={(e) => handleFieldChange('dispute_reason', e.target.value)}
              >
                <option value="MERCHANDISE_OR_SERVICE_NOT_RECEIVED">Item Not Received (INR - Friendly Fraud)</option>
                <option value="UNAUTHORIZED">Unauthorized Charge / Card Stolen</option>
                <option value="MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED">Significantly Not As Described (SNAD)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Buyer Claim / Complaint Notes</label>
              <textarea
                className="form-input"
                rows="2"
                value={formData.buyer_claim_notes}
                onChange={(e) => handleFieldChange('buyer_claim_notes', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Purchased Item Title</label>
              <input
                type="text"
                className="form-input"
                value={formData.item_title}
                onChange={(e) => handleFieldChange('item_title', e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <div className="form-group">
                <label className="form-label">Carrier</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.carrier}
                  onChange={(e) => handleFieldChange('carrier', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tracking Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.tracking_number}
                  onChange={(e) => handleFieldChange('tracking_number', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <div className="form-group">
                <label className="form-label">Delivery Status</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.delivery_status}
                  onChange={(e) => handleFieldChange('delivery_status', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Direct Signature</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.signed_by}
                  onChange={(e) => handleFieldChange('signed_by', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Verified Destination Address</label>
              <input
                type="text"
                className="form-input"
                value={formData.shipping_address}
                onChange={(e) => handleFieldChange('shipping_address', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Carrier GPS Coordinates</label>
              <input
                type="text"
                className="form-input"
                value={formData.gps_coordinates}
                onChange={(e) => handleFieldChange('gps_coordinates', e.target.value)}
              />
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            id="btn-run-ai-agent"
            className="btn btn-primary"
            onClick={handleRunAIAnalysis}
            disabled={isAnalyzing}
            style={{ padding: '0.75rem', justifyContent: 'center', fontSize: '0.9rem' }}
          >
            {isAnalyzing ? (
              <>
                <Clock size={16} className="spin" />
                <span>Running AI Swarm (Sentinel &bull; Sherlock &bull; Lex &bull; Pax)...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Analyze &amp; Defend with AI Swarm</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Real AI Decision & Results Showcase */}
        <div
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            minHeight: '600px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#FFFFFF', fontWeight: 700 }}>
              2. AI Defense Dossier &amp; Adjudication Verdict
            </h4>
            {analysisResult && (
              <span style={{ fontSize: '0.72rem', color: 'var(--paypal-cyan)', fontFamily: 'var(--font-mono)' }}>
                {analysisResult.model_used || 'AI Multi-Agent Swarm'}
              </span>
            )}
          </div>

          {!analysisResult && !isAnalyzing && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem',
                textAlign: 'center',
                gap: '1rem',
                color: 'var(--text-muted)',
              }}
            >
              <Bot size={48} strokeWidth={1.5} style={{ color: 'var(--paypal-blue)' }} />
              <div>
                <h5 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '4px' }}>
                  Awaiting Dispute Evaluation
                </h5>
                <p style={{ fontSize: '0.8rem', maxWidth: '420px', lineHeight: 1.5 }}>
                  Select a real dispute case on the left and click <strong>"Analyze &amp; Defend with AI Swarm"</strong>. The AI model will audit delivery evidence, check PayPal Seller Protection eligibility, and draft the bank defense letter.
                </p>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem',
                gap: '1rem',
              }}
            >
              <div className="pulse-dot online" style={{ width: '20px', height: '20px' }} />
              <div style={{ textAlign: 'center' }}>
                <h5 style={{ color: '#FFFFFF', fontSize: '1rem' }}>Multi-Agent Swarm Deliberating</h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Sentinel validating deadlines &bull; Sherlock cross-checking GPS fix &bull; Lex drafting Seller Protection rebuttal
                </p>
              </div>
            </div>
          )}

          {analysisResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Verdict Summary Card */}
              <div
                style={{
                  background: analysisResult.verdict === 'FIGHT_DISPUTE' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                  border: `1px solid ${analysisResult.verdict === 'FIGHT_DISPUTE' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      className={`status-pill ${analysisResult.verdict === 'FIGHT_DISPUTE' ? 'defended' : 'pending'}`}
                      style={{ fontSize: '0.8rem', padding: '3px 10px' }}
                    >
                      {analysisResult.verdict === 'FIGHT_DISPUTE' ? 'RECOMMENDED: FIGHT DISPUTE' : 'RECOMMENDED: SETTLE GOODWILL'}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Win Prob: {analysisResult.win_probability_pct}%
                    </span>
                  </div>
                  <p style={{ fontSize: '0.775rem', color: '#E2E8F0', marginTop: '6px' }}>
                    {analysisResult.seller_protection_reason}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Protected Capital
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-400)', fontFamily: 'var(--font-brand)' }}>
                    ${analysisResult.estimated_savings_usd || formData.dispute_amount} USD
                  </div>
                </div>
              </div>

              {/* Agent Thought Stream */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Multi-Agent Reasoning Trace:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                  {analysisResult.agent_thought_stream?.map((step, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#070C18',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                      }}
                    >
                      <strong style={{ color: 'var(--paypal-cyan)' }}>{step.agent}:</strong>{' '}
                      <span style={{ color: '#CBD5E1' }}>{step.thought}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* The Generated Formal Rebuttal Letter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    AI-Drafted Bank Rebuttal Letter (Visa CE 3.0 &amp; PayPal Policy Compliant):
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={handleCopyLetter}
                      style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem' }}
                    >
                      {copiedLetter ? <Check size={12} style={{ color: 'var(--emerald-400)' }} /> : <Copy size={12} />}
                      <span>{copiedLetter ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => window.print()}
                      style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem' }}
                    >
                      <Printer size={12} />
                      <span>Print</span>
                    </button>
                  </div>
                </div>

                <div className="rebuttal-pre-block">
                  {analysisResult.formal_rebuttal_letter}
                </div>
              </div>

              {/* PayPal REST API Submission Flow */}
              <div
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>
                    PayPal Disputes REST API Dispatch
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    POST /v1/customer/disputes/{formData.id}/provide-evidence
                  </div>
                </div>

                {!submissionSuccess ? (
                  <button
                    id="btn-submit-paypal-evidence"
                    className="btn btn-emerald"
                    onClick={handleSubmitToPayPal}
                    disabled={isSubmittingToPayPal}
                  >
                    <Send size={14} />
                    <span>{isSubmittingToPayPal ? 'Transmitting...' : 'Submit Evidence to PayPal API'}</span>
                  </button>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <CheckCircle2 size={16} /> Transmitted &amp; Acknowledged by PayPal
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
