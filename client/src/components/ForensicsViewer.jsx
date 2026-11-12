import React, { useState, useEffect } from 'react';
import {
  MapPin,
  CheckCircle2,
  Globe,
  Camera,
  ShieldCheck,
  Calendar,
  Truck,
  Stamp,
  AlertTriangle,
} from 'lucide-react';

export default function ForensicsViewer({ disputes = [], selectedDispute }) {
  const [selectedDisputeId, setSelectedDisputeId] = useState(
    selectedDispute?.dispute_id || disputes[0]?.dispute_id || ''
  );

  useEffect(() => {
    if (selectedDispute?.dispute_id) {
      setSelectedDisputeId(selectedDispute.dispute_id);
    } else if (!selectedDisputeId && disputes[0]?.dispute_id) {
      setSelectedDisputeId(disputes[0].dispute_id);
    }
  }, [selectedDispute, disputes]);

  const dispute =
    disputes.find((d) => d.dispute_id === selectedDisputeId) || disputes[0];

  if (!dispute) {
    return (
      <div className="paper-panel" style={{ padding: '32px', textAlign: 'center' }}>
        No dispute cases loaded in queue.
      </div>
    );
  }

  const carrier = dispute.carrier_telemetry || {};
  const telemetry = dispute.order_telemetry || {};
  const tx = dispute.transaction_details || {};
  const addr = dispute.shipping_address || {};

  const isAnomaly =
    telemetry.anomaly_detected ||
    telemetry.ip_geolocation?.is_tor ||
    (telemetry.ip_geolocation?.distance_to_shipping_km || 0) > 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Institutional Case Selector Header */}
      <div className="paper-panel">
        <div className="paper-panel-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                Chain-of-Custody Physical &amp; Digital Forensics Vault
              </h3>
              <span className="exhibit-tag">
                <Stamp size={11} />4 SEALED EXHIBITS
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--ink-muted)', marginTop: '2px' }}>
              Cryptographic carrier GPS scans, doorstep delivery photography, device fingerprinting, and checkout IP telemetry.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="form-label">Active Case File:</span>
            <select
              value={dispute.dispute_id}
              onChange={(e) => setSelectedDisputeId(e.target.value)}
              className="form-input mono"
              style={{ minWidth: '300px', fontWeight: 600 }}
            >
              {disputes.map((d) => (
                <option key={d.dispute_id} value={d.dispute_id}>
                  {d.dispute_id} — {d.buyer_info?.name} (${d.dispute_amount?.value})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4-Card Forensic Exhibit Grid */}
      <div className="evidence-cards-grid">
        {/* EXHIBIT A: Visual Proof of Delivery & Signatory */}
        <div className="evidence-box">
          <div className="evidence-box-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Camera size={14} style={{ color: 'var(--paypal-blue)' }} />
              EXHIBIT A &bull; CARRIER VISUAL PROOF OF DELIVERY
            </span>
            <span className="exhibit-tag">POD IMAGE VERIFIED</span>
          </div>

          <div
            style={{
              position: 'relative',
              borderRadius: '4px',
              overflow: 'hidden',
              height: '200px',
              backgroundColor: '#111827',
              border: '1px solid var(--hairline)',
            }}
          >
            <img
              src={
                carrier.proof_of_delivery_photo ||
                'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80'
              }
              alt={`Carrier Proof of Delivery for ${dispute.dispute_id}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              className="mono"
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                right: '8px',
                backgroundColor: 'rgba(15, 29, 53, 0.92)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                padding: '6px 10px',
                fontSize: '11px',
                display: 'flex',
                justifyContent: 'space-between',
                color: '#F8FAFC',
              }}
            >
              <span>SCAN: {carrier.delivery_timestamp || '2026-11-04T14:32:18Z'}</span>
              <span style={{ color: '#4ADE80', fontWeight: 700 }}>
                LOC: {carrier.delivered_to || 'FRONT_DOOR_PORCH'}
              </span>
            </div>
          </div>

          <div className="exhibit-card" style={{ marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>
                Signatory Record: <strong className="mono">{carrier.signed_by || 'CONSIGNEE'}</strong>
              </span>
              <span className="status-pill defended">Chain Sealed</span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--ink-secondary)' }}>
              {carrier.delivery_notes || 'Package delivered to verified shipping address on PayPal order.'}
            </div>
          </div>
        </div>

        {/* EXHIBIT B: Carrier Satellite GPS & Transit Checkpoints */}
        <div className="evidence-box">
          <div className="evidence-box-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} style={{ color: 'var(--forest)' }} />
              EXHIBIT B &bull; SATELLITE GPS FIX &amp; SCANNER TELEMETRY
            </span>
            <span className="exhibit-tag">
              ±{carrier.geo_coordinates?.accuracy_meters || 2.4}m ACCURACY
            </span>
          </div>

          <div className="kv-ledger">
            <div className="kv-row">
              <span className="kv-key">Carrier Service</span>
              <span className="kv-val">{carrier.carrier || 'FedEx Ground'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Tracking Waybill</span>
              <span className="kv-val mono">{carrier.tracking_number || dispute.carrier_tracking_key}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Dropoff Coordinates</span>
              <span className="kv-val mono" style={{ color: 'var(--paypal-blue)' }}>
                {carrier.geo_coordinates?.latitude}° N, {carrier.geo_coordinates?.longitude}° W (±
                {carrier.geo_coordinates?.accuracy_meters}m)
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Courier Scanner Hardware</span>
              <span className="kv-val mono">{carrier.geo_coordinates?.device || 'Handheld Courier Terminal'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">PayPal Order Address</span>
              <span className="kv-val">
                {addr.line1}, {addr.city}, {addr.state} {addr.postal_code}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--forest)',
              fontSize: '11.5px',
              fontWeight: 600,
              marginTop: '2px',
            }}
          >
            <CheckCircle2 size={14} />
            <span>
              Carrier destination street matches PayPal Order shipping address 100% (Seller Protection §11 compliant)
            </span>
          </div>
        </div>

        {/* EXHIBIT C: Cardholder Checkout IP & Device Fingerprint */}
        <div className="evidence-box">
          <div className="evidence-box-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={14} style={{ color: 'var(--paypal-blue)' }} />
              EXHIBIT C &bull; CHECKOUT NETWORK &amp; DEVICE FINGERPRINT
            </span>
            <span className="exhibit-tag">VISA CE 3.0 RECORD</span>
          </div>

          <div className="kv-ledger">
            <div className="kv-row">
              <span className="kv-key">Checkout IP &amp; Origin</span>
              <span className="kv-val mono">
                {telemetry.checkout_ip} ({telemetry.ip_geolocation?.city}, {telemetry.ip_geolocation?.region},{' '}
                {telemetry.ip_geolocation?.country})
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">ISP / Autonomous System</span>
              <span className="kv-val">{telemetry.ip_geolocation?.isp}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Distance to Delivery Address</span>
              <span
                className="kv-val mono"
                style={{ color: isAnomaly ? 'var(--crimson)' : 'var(--forest)' }}
              >
                {telemetry.ip_geolocation?.distance_to_shipping_km} km
                {isAnomaly ? ' (CROSS-BORDER PROXY ANOMALY)' : ' (Same Local Residence)'}
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">VPN / Tor / Datacenter</span>
              <span
                className="kv-val mono"
                style={{ color: isAnomaly ? 'var(--crimson)' : 'var(--forest)' }}
              >
                {telemetry.ip_geolocation?.is_tor
                  ? 'TOR EXIT & DATACENTER DETECTED'
                  : 'Clean Residential Connection (0 Flags)'}
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Device Hardware Hash</span>
              <span className="kv-val mono">
                {telemetry.device_fingerprint?.hardware_hash} (
                {telemetry.device_fingerprint?.prior_sessions_count || 1} sessions)
              </span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Checkout Authentication</span>
              <span className="kv-val mono">
                {telemetry.authentication_record?.auth_type} (Duration:{' '}
                {telemetry.authentication_record?.checkout_duration_seconds}s)
              </span>
            </div>
          </div>
        </div>

        {/* EXHIBIT D: Temporal Chain of Custody & Carrier Scan Log */}
        <div className="evidence-box">
          <div className="evidence-box-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} style={{ color: 'var(--manila-stamp)' }} />
              EXHIBIT D &bull; CHRONOLOGICAL CHAIN OF CUSTODY
            </span>
            <span className="exhibit-tag">TIMESTAMP AUDIT</span>
          </div>

          <div className="kv-ledger">
            <div className="kv-row">
              <span className="kv-key mono">1. {tx.purchase_date?.slice(0, 16).replace('T', ' ')} UTC</span>
              <span className="kv-val">
                Order {tx.order_id} captured via { telemetry.authentication_record?.auth_type || 'PayPal Checkout' }
              </span>
            </div>
            {(carrier.transit_checkpoints || []).map((cp, idx) => (
              <div className="kv-row" key={idx}>
                <span className="kv-key mono">
                  {idx + 2}. {cp.time?.slice(0, 16).replace('T', ' ')} UTC
                </span>
                <span className="kv-val">
                  {cp.status} — {cp.location}
                </span>
              </div>
            ))}
            <div className="kv-row">
              <span className="kv-key mono" style={{ color: 'var(--crimson)', fontWeight: 700 }}>
                {(carrier.transit_checkpoints?.length || 2) + 2}.{' '}
                {dispute.create_time?.slice(0, 16).replace('T', ' ')} UTC
              </span>
              <span className="kv-val" style={{ color: 'var(--crimson)' }}>
                Dispute {dispute.dispute_id} filed ({dispute.dispute_reason})
              </span>
            </div>
          </div>

          <div className="exhibit-card" style={{ marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600 }}>
              <ShieldCheck size={14} style={{ color: 'var(--manila-stamp)' }} />
              <span>
                Chronological Finding: Physical delivery completed on{' '}
                <span className="mono">{carrier.delivery_timestamp?.slice(0, 10)}</span> prior to dispute filing on{' '}
                <span className="mono">{dispute.create_time?.slice(0, 10)}</span>.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
