import React, { useState } from 'react';
import {
  MapPin,
  CheckCircle2,
  FileCheck,
  Smartphone,
  Globe,
  Camera,
  ShieldCheck,
  Calendar,
  Truck,
} from 'lucide-react';

export default function ForensicsViewer({ disputes }) {
  const [selectedDisputeId, setSelectedDisputeId] = useState(disputes[0]?.dispute_id || '');
  const dispute = disputes.find((d) => d.dispute_id === selectedDisputeId) || disputes[0];

  if (!dispute) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>No disputes available.</div>;
  }

  const carrier = dispute.carrier_tracking_key;
  const isINR = dispute.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Selector Card */}
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
        <div>
          <h3 style={{ fontSize: '1.1rem' }}>Physical &amp; Digital Telemetry Forensics</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Examine unalterable GPS scans, carrier proof-of-delivery photos, and checkout network telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Select Case:</label>
          <select
            value={selectedDisputeId}
            onChange={(e) => setSelectedDisputeId(e.target.value)}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              outline: 'none',
            }}
          >
            {disputes.map((d) => (
              <option key={d.dispute_id} value={d.dispute_id}>
                {d.dispute_id} — {d.transaction_details.item_title.substring(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Evidence Cards */}
      <div className="evidence-cards-grid">
        {/* 1. Carrier Proof of Delivery Photo & Signature */}
        <div className="evidence-box">
          <div className="evidence-box-title">
            <Camera size={14} style={{ color: 'var(--paypal-cyan)' }} />
            <span>Carrier Proof of Delivery &amp; Visual Verification</span>
          </div>
          <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '180px', background: '#0B1120' }}>
            <img
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80"
              alt="Proof of Delivery on doorstep"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                right: '8px',
                background: 'rgba(11, 17, 32, 0.85)',
                backdropFilter: 'blur(8px)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.72rem',
                display: 'flex',
                justifyContent: 'space-between',
                color: '#E2E8F0',
              }}
            >
              <span>Timestamp: 2026-11-04 14:32:18 UTC</span>
              <span style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>GPS Verified</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.775rem', marginTop: '0.5rem' }}>
            <span>
              Signature on file: <strong>M. REYNOLDS (Direct Signature)</strong>
            </span>
            <span className="status-pill defended" style={{ padding: '2px 6px', fontSize: '0.675rem' }}>
              Confirmed
            </span>
          </div>
        </div>

        {/* 2. GPS Geolocation & Carrier Satellite Fix */}
        <div className="evidence-box">
          <div className="evidence-box-title">
            <MapPin size={14} style={{ color: 'var(--emerald-400)' }} />
            <span>Carrier Dropoff Satellite Coordinates</span>
          </div>

          <div
            style={{
              background: '#070C18',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Carrier:</span>
              <strong style={{ color: 'var(--text-primary)' }}>FedEx Ground Home Delivery</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Delivery Location:</span>
              <span>Front Door / Covered Porch</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>GPS Geolocation:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--paypal-cyan)' }}>
                30.2672° N, 97.7431° W (±2.4m)
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Handheld Scanner ID:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>Honeywell ScanPal EDA52 #4901</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Recipient Address:</span>
              <span style={{ textAlign: 'right' }}>
                {dispute.shipping_address.line1}, {dispute.shipping_address.city}, {dispute.shipping_address.state}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-400)', fontSize: '0.75rem', marginTop: '0.4rem' }}>
            <CheckCircle2 size={14} />
            <span>Matches PayPal Order Destination Address 100%</span>
          </div>
        </div>

        {/* 3. Checkout IP & Network Telemetry */}
        <div className="evidence-box">
          <div className="evidence-box-title">
            <Globe size={14} style={{ color: 'var(--accent-indigo)' }} />
            <span>Cardholder Checkout Network Intelligence</span>
          </div>

          <div
            style={{
              background: '#070C18',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Checkout IP:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>70.112.44.89 (Austin TX)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>ISP Provider:</span>
              <span>AT&amp;T Internet Services</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Proximity to Delivery Address:</span>
              <strong style={{ color: 'var(--emerald-400)' }}>4.2 km (Same Household Area)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Proxy / VPN Status:</span>
              <span style={{ color: 'var(--emerald-400)' }}>Clean (Zero VPN/Tor detected)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Device Fingerprint:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>fp_a9821f00b392a10 (MacBook Pro)</span>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Provides conclusive Visa Compelling Evidence 3.0 (CE 3.0) proof of authorized resident purchase.
          </div>
        </div>

        {/* 4. Temporal Sequence Audit */}
        <div className="evidence-box">
          <div className="evidence-box-title">
            <Calendar size={14} style={{ color: 'var(--amber-400)' }} />
            <span>Temporal Chain of Custody Timeline</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--paypal-blue)', marginTop: '5px' }} />
              <div style={{ fontSize: '0.775rem' }}>
                <strong>2026-10-31 18:22 UTC:</strong> Order Placed &amp; PayPal Biometric Auth Confirmed.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--paypal-cyan)', marginTop: '5px' }} />
              <div style={{ fontSize: '0.775rem' }}>
                <strong>2026-11-02 08:15 UTC:</strong> In Transit via FedEx Dallas TX Processing Hub.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald-400)', marginTop: '5px' }} />
              <div style={{ fontSize: '0.775rem' }}>
                <strong>2026-11-04 14:32 UTC:</strong> Package Delivered &amp; Signed by Marcus Reynolds.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--rose-400)', marginTop: '5px' }} />
              <div style={{ fontSize: '0.775rem' }}>
                <strong>2026-11-06 09:14 UTC:</strong> Customer filed dispute claiming "Item Not Received" (2 days post-delivery).
              </div>
            </div>
          </div>

          <div className="seller-protection-badge eligible" style={{ marginTop: '0.5rem' }}>
            <ShieldCheck size={14} />
            <span>Temporal audit refutes claim: Buyer possessed item 48 hours prior to dispute</span>
          </div>
        </div>
      </div>
    </div>
  );
}
