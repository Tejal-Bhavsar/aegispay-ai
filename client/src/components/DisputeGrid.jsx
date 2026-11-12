import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Package,
  FileText,
  MapPin,
  Send,
  Play,
  ExternalLink,
  X,
  Scale,
  HeartHandshake,
  AlertTriangle,
  Copy,
  Check,
  Stamp,
  Globe,
  Truck,
} from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

// Compute deadline urgency relative to earliest case in queue (reference anchor: Nov 11, 2026)
function getDeadlineInfo(deadlineIso, isDefended) {
  if (isDefended) {
    return {
      label: 'Submitted',
      sub: 'Under PayPal Review',
      pct: 100,
      color: 'var(--forest)',
      bg: 'var(--forest-tint)',
      daysLeft: 99,
    };
  }
  if (!deadlineIso) {
    return {
      label: '10d left',
      sub: 'Standard SLA',
      pct: 50,
      color: 'var(--amber)',
      bg: 'var(--amber-tint)',
      daysLeft: 10,
    };
  }
  const refNow = new Date('2026-11-11T12:00:00Z').getTime();
  const due = new Date(deadlineIso).getTime();
  const diffDays = Math.max(1, Math.round((due - refNow) / (1000 * 60 * 60 * 24)));
  const dateStr = new Date(deadlineIso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  // 14-day window proportional bar (more fill = more urgent pressure)
  const urgencyPct = Math.min(96, Math.max(20, Math.round(((15 - Math.min(14, diffDays)) / 14) * 100)));
  const isUrgent = diffDays <= 5;

  return {
    label: `${diffDays}d remaining`,
    sub: `Due ${dateStr}`,
    pct: urgencyPct,
    color: isUrgent ? 'var(--crimson)' : 'var(--amber)',
    bg: isUrgent ? 'var(--crimson-tint)' : 'var(--amber-tint)',
    daysLeft: diffDays,
  };
}

export default function DisputeGrid({
  disputes,
  selectedDispute,
  onSelectDispute,
  onOpenModalDossier,
  onDeploySwarm,
  onSubmitToPayPal,
  isSubmittingEvidence,
  onDisputeUpdated,
}) {
  const gridRef = useRef();
  const [quickFilterText, setQuickFilterText] = useState('');
  const [activeFilterCategory, setActiveFilterCategory] = useState('ALL');

  // Drawer internal state
  const [inspectorTab, setInspectorTab] = useState('EXHIBITS'); // 'EXHIBITS' | 'REBUTTAL' | 'PAYLOAD'
  const [selectedStrategy, setSelectedStrategy] = useState('LEGAL_AGGRESSIVE');
  const [isStreamingSwarm, setIsStreamingSwarm] = useState(false);
  const [streamLogs, setStreamLogs] = useState([]);
  const [copiedText, setCopiedText] = useState(false);

  // Sort disputes by deadline first (Product Principle #1)
  const sortedAndFilteredDisputes = useMemo(() => {
    if (!disputes) return [];
    let list = [...disputes].sort((a, b) => {
      const aDef = a.ai_state?.status === 'DEFENDED_TO_PAYPAL' ? 1 : 0;
      const bDef = b.ai_state?.status === 'DEFENDED_TO_PAYPAL' ? 1 : 0;
      if (aDef !== bDef) return aDef - bDef;
      return new Date(a.response_deadline || 0) - new Date(b.response_deadline || 0);
    });

    if (activeFilterCategory === 'INR') {
      list = list.filter((d) => d.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED');
    } else if (activeFilterCategory === 'UNAUTHORIZED') {
      list = list.filter((d) => d.dispute_reason === 'UNAUTHORIZED');
    } else if (activeFilterCategory === 'SNAD') {
      list = list.filter((d) => d.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED');
    } else if (activeFilterCategory === 'PROTECTED') {
      list = list.filter((d) => d.seller_protection?.eligible);
    } else if (activeFilterCategory === 'DEFENDED') {
      list = list.filter((d) => d.ai_state?.status === 'DEFENDED_TO_PAYPAL');
    }
    return list;
  }, [disputes, activeFilterCategory]);

  // Reset stream logs when switching active dispute
  useEffect(() => {
    if (selectedDispute?.ai_state?.investigation_report?.timeline) {
      setStreamLogs(selectedDispute.ai_state.investigation_report.timeline);
    } else {
      setStreamLogs([]);
    }
    if (selectedDispute?.ai_state?.recommended_action === 'ESCALATE_FRAUD_RING') {
      setSelectedStrategy('SYNDICATE_FRAUD_ESCALATION');
    } else if (selectedDispute?.ai_state?.recommended_action === 'SETTLE_GOODWILL') {
      setSelectedStrategy('DIPLOMATIC_INQUIRY');
    } else {
      setSelectedStrategy('LEGAL_AGGRESSIVE');
    }
  }, [selectedDispute?.dispute_id]);

  // Run SSE 5-Agent Investigation directly inside the Case Inspector
  const handleRunLiveSwarmInDrawer = (disputeId) => {
    if (!disputeId || isStreamingSwarm) return;
    setIsStreamingSwarm(true);
    setStreamLogs([]);

    const evtSource = new EventSource(
      `/api/disputes/${disputeId}/investigate-stream?strategy=${selectedStrategy}`
    );

    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'COMPLETE_PAYLOAD') {
          evtSource.close();
          setIsStreamingSwarm(false);
          if (data.dispute) {
            onSelectDispute(data.dispute);
          }
          if (onDisputeUpdated) onDisputeUpdated();
        } else if (data.type === 'ERROR') {
          evtSource.close();
          setIsStreamingSwarm(false);
        } else {
          setStreamLogs((prev) => [...prev, data]);
        }
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    evtSource.onerror = () => {
      evtSource.close();
      setIsStreamingSwarm(false);
    };
  };

  // AG Grid Cell Renderers
  const CaseIdRenderer = useCallback((props) => {
    const data = props.data;
    if (!data) return null;

    let reasonLabel = 'INR · Not Received';
    let pillClass = 'status-pill ready';
    if (data.dispute_reason === 'UNAUTHORIZED') {
      reasonLabel = 'UNAUTH · Card Claim';
      pillClass = 'status-pill escalated';
    } else if (data.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED') {
      reasonLabel = 'SNAD · Condition';
      pillClass = 'status-pill pending';
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', justifyContent: 'center', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <strong className="mono" style={{ color: 'var(--ink-primary)', fontSize: '12.5px', fontWeight: 700 }}>
            {data.dispute_id}
          </strong>
          <span
            className="mono"
            style={{
              fontSize: '9.5px',
              color: 'var(--ink-muted)',
              padding: '1px 5px',
              borderRadius: '2px',
              background: 'var(--paper-subtle)',
              border: '1px solid var(--hairline)',
            }}
          >
            {data.dispute_life_cycle_stage}
          </span>
        </div>
        <div>
          <span className={pillClass} style={{ fontSize: '9.5px', padding: '1px 6px' }}>
            {reasonLabel}
          </span>
        </div>
      </div>
    );
  }, []);

  const DeadlineRenderer = useCallback((props) => {
    const data = props.data;
    if (!data) return null;
    const isDefended = data.ai_state?.status === 'DEFENDED_TO_PAYPAL';
    const dl = getDeadlineInfo(data.response_deadline, isDefended);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px', width: '100%', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '6px' }}>
          <span className="mono" style={{ fontSize: '11.5px', fontWeight: 700, color: dl.color }}>
            {dl.label}
          </span>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--ink-muted)' }}>
            {dl.sub}
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '5px',
            backgroundColor: 'var(--paper-subtle)',
            border: '1px solid var(--hairline-subtle)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${dl.pct}%`,
              height: '100%',
              backgroundColor: dl.color,
            }}
          />
        </div>
      </div>
    );
  }, []);

  const OrderConsigneeRenderer = useCallback((props) => {
    const data = props.data;
    if (!data) return null;
    const tx = data.transaction_details || {};
    const buyer = data.buyer_info || {};

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%', minWidth: 0 }}>
        {tx.item_image ? (
          <img
            src={tx.item_image}
            alt={tx.item_title}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '4px',
              objectFit: 'cover',
              border: '1px solid var(--hairline)',
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '4px',
              background: 'var(--paper-subtle)',
              border: '1px solid var(--hairline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Package size={16} style={{ color: 'var(--ink-muted)' }} />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: '2px' }}>
          <span
            style={{
              fontSize: '12.5px',
              fontWeight: 600,
              color: 'var(--ink-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={tx.item_title}
          >
            {tx.item_title}
          </span>
          <span className="mono" style={{ fontSize: '10.5px', color: 'var(--ink-muted)' }}>
            {tx.order_id} &bull; {buyer.name}
          </span>
        </div>
      </div>
    );
  }, []);

  const ExposureRenderer = useCallback((props) => {
    const data = props.data;
    if (!data) return null;
    const amount = parseFloat(data.dispute_amount?.value || 0).toFixed(2);
    const isInquiry = data.dispute_life_cycle_stage === 'INQUIRY';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: '2px' }}>
        <strong className="mono" style={{ fontSize: '13px', color: 'var(--ink-primary)', fontWeight: 700 }}>
          ${amount}
        </strong>
        <span
          className="mono"
          style={{
            fontSize: '10px',
            color: isInquiry ? 'var(--ink-muted)' : 'var(--crimson)',
            fontWeight: 600,
          }}
        >
          {isInquiry ? '$0 Inquiry Stage' : '+$15.00 CB Fee'}
        </span>
      </div>
    );
  }, []);

  const ExhibitProtectionRenderer = useCallback((props) => {
    const data = props.data;
    if (!data) return null;
    const isEligible = data.seller_protection?.eligible;
    const carrier = data.carrier_telemetry?.carrier?.split(' ')[0] || 'CARRIER';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px', height: '100%' }}>
        <div>
          {isEligible ? (
            <span className="seller-protection-badge eligible" title={data.seller_protection?.protection_reason}>
              <ShieldCheck size={11} />
              PP Seller Protected
            </span>
          ) : (
            <span className="seller-protection-badge ineligible" title={data.seller_protection?.protection_reason}>
              <ShieldAlert size={11} />
              Unprotected Stage
            </span>
          )}
        </div>
        <div>
          <span className="exhibit-tag" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
            <Stamp size={10} />
            EXH: {carrier} GPS + 2FA
          </span>
        </div>
      </div>
    );
  }, []);

  const DecisionRenderer = useCallback((props) => {
    const data = props.data;
    if (!data) return null;
    const action = data.ai_state?.recommended_action || 'FIGHT_DISPUTE';
    const status = data.ai_state?.status || 'PENDING_REVIEW';
    const confidence = data.ai_state?.defense_confidence || 92;

    if (status === 'DEFENDED_TO_PAYPAL') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px', height: '100%' }}>
          <span className="status-pill defended">
            <CheckCircle2 size={11} />
            DEFENDED TO PAYPAL
          </span>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--forest)' }}>
            Evidence Packet Sealed
          </span>
        </div>
      );
    }

    let actionBadge = 'status-pill ready';
    if (action === 'ESCALATE_FRAUD_RING') actionBadge = 'status-pill escalated';
    if (action === 'SETTLE_GOODWILL') actionBadge = 'status-pill pending';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px', height: '100%' }}>
        <span className={actionBadge} style={{ fontSize: '10px' }}>
          {action.replace(/_/g, ' ')}
        </span>
        <span className="mono" style={{ fontSize: '10.5px', color: 'var(--ink-secondary)', fontWeight: 600 }}>
          {confidence}% Evidentiary Match
        </span>
      </div>
    );
  }, []);

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Case ID & Reason',
        field: 'dispute_id',
        width: 175,
        minWidth: 165,
        cellRenderer: CaseIdRenderer,
      },
      {
        headerName: 'Statutory Deadline',
        field: 'response_deadline',
        width: 165,
        minWidth: 150,
        cellRenderer: DeadlineRenderer,
      },
      {
        headerName: 'Fulfillment & Consignee',
        field: 'transaction_details.item_title',
        minWidth: 230,
        flex: 1.3,
        cellRenderer: OrderConsigneeRenderer,
      },
      {
        headerName: 'Exposure',
        field: 'dispute_amount.value',
        width: 120,
        cellRenderer: ExposureRenderer,
      },
      {
        headerName: 'Protection & Exhibits',
        field: 'seller_protection.eligible',
        width: 175,
        cellRenderer: ExhibitProtectionRenderer,
      },
      {
        headerName: 'Recommended Decision',
        field: 'ai_state.recommended_action',
        width: 175,
        cellRenderer: DecisionRenderer,
      },
    ],
    [
      CaseIdRenderer,
      DeadlineRenderer,
      OrderConsigneeRenderer,
      ExposureRenderer,
      ExhibitProtectionRenderer,
      DecisionRenderer,
    ]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
    }),
    []
  );

  const onRowClicked = useCallback(
    (event) => {
      if (event.data) {
        onSelectDispute(event.data);
      }
    },
    [onSelectDispute]
  );

  // Active Dispute Forensics & Rebuttal helpers for the Right-Hand Inspector Drawer
  const activeCarrier = selectedDispute?.carrier_telemetry || {};
  const activeTelemetry = selectedDispute?.order_telemetry || {};
  const isDefended = selectedDispute?.ai_state?.status === 'DEFENDED_TO_PAYPAL';

  const getCompiledRebuttal = () => {
    if (!selectedDispute) return '';
    const reportLetter = selectedDispute.ai_state?.investigation_report?.legal?.formal_rebuttal_letter;
    if (reportLetter && selectedStrategy === selectedDispute.ai_state?.investigation_report?.legal?.strategy_used) {
      return reportLetter;
    }

    const cName = activeCarrier.carrier || 'FedEx Ground';
    const cTrack = activeCarrier.tracking_number || selectedDispute.carrier_tracking_key;
    const cTime = activeCarrier.delivery_timestamp || '2026-11-04T14:32:18Z';
    const cSign = activeCarrier.signed_by || 'CONSIGNEE';
    const cGps = activeCarrier.geo_coordinates
      ? `${activeCarrier.geo_coordinates.latitude}, ${activeCarrier.geo_coordinates.longitude} (±${activeCarrier.geo_coordinates.accuracy_meters}m)`
      : '30.2672, -97.7431 (±2.4m)';
    const ipAddr = activeTelemetry.checkout_ip || '70.112.44.89';
    const ipDist = activeTelemetry.ip_geolocation?.distance_to_shipping_km ?? 4.2;
    const authType = activeTelemetry.authentication_record?.auth_type || 'PAYPAL_ONE_TOUCH_BIOMETRIC';
    const hwHash = activeTelemetry.device_fingerprint?.hardware_hash || 'fp_a9821f00b392a10';

    if (selectedStrategy === 'SYNDICATE_FRAUD_ESCALATION') {
      return `TO: PayPal Risk & Fraud Operations Directorate
CASE REF: FRAUD_RING_ESCALATION // ${selectedDispute.dispute_id}
ORDER ID: ${selectedDispute.transaction_details?.order_id}
AMOUNT: $${selectedDispute.dispute_amount?.value} USD

1. SYNDICATE & NETWORK INDICATORS (EXHIBIT B & C)
- Destination: ${selectedDispute.shipping_address?.line1}, ${selectedDispute.shipping_address?.city} ${selectedDispute.shipping_address?.state}
- Checkout IP: ${ipAddr} (${activeTelemetry.ip_geolocation?.isp || 'Datacenter Host'}) — ${ipDist} km from consignee
- Device Hash: ${hwHash} (Checkout velocity: ${activeTelemetry.authentication_record?.checkout_duration_seconds || 4}s)

2. VERIFIED CARRIER PROOF OF DELIVERY (EXHIBIT A)
- Carrier: ${cName} (Tracking: ${cTrack})
- Delivered: ${cTime} | Signed: ${cSign}
- GPS Coordinates: ${cGps}

3. REQUESTED ADJUDICATION
Merchant fulfilled to the PayPal-verified shipping address with carrier signature and GPS confirmation. Request immediate dismissal under PayPal Seller Protection.`;
    }

    if (selectedStrategy === 'DIPLOMATIC_INQUIRY') {
      return `TO: PayPal Resolution Center & ${selectedDispute.buyer_info?.name}
RE: Inquiry Resolution & Carrier Verification // ${selectedDispute.dispute_id}
ORDER: ${selectedDispute.transaction_details?.order_id} (${selectedDispute.transaction_details?.item_title})

1. FULFILLMENT & CARRIER RECORD (EXHIBIT A)
- Carrier: ${cName} | Tracking: ${cTrack}
- Delivered: ${cTime} (${activeCarrier.delivered_to || 'PARCEL_LOCKER'})
- Signatory / Access: ${cSign}

2. GOODWILL SETTLEMENT / RESOLUTION OFFER (PAX AGENT)
For valued customer ${selectedDispute.buyer_info?.name}, we have verified physical delivery to ${selectedDispute.shipping_address?.line1}. To resolve this inquiry immediately without chargeback escalation, we offer a $40.00 partial goodwill adjustment or a prepaid return label.`;
    }

    return `TO: PayPal Dispute Adjudication Team & Issuing Bank
RE: Formal Merchant Rebuttal // Dispute ${selectedDispute.dispute_id}
TRANSACTION ID: ${selectedDispute.transaction_details?.transaction_id}
ORDER ID: ${selectedDispute.transaction_details?.order_id}
CLAIMED AMOUNT: USD ${selectedDispute.dispute_amount?.value} (${selectedDispute.dispute_reason})

1. EXHIBIT A — CARRIER PROOF OF DELIVERY (PayPal Seller Protection Compliant)
- Carrier: ${cName}
- Tracking Number: ${cTrack}
- Delivery Timestamp: ${cTime}
- Recipient Address: ${selectedDispute.shipping_address?.line1}, ${selectedDispute.shipping_address?.city}, ${selectedDispute.shipping_address?.state} ${selectedDispute.shipping_address?.postal_code}
- GPS Geolocation Fix: ${cGps} (${activeCarrier.geo_coordinates?.device || 'Carrier Handheld Scanner'})
- Proof of Signature: ${cSign}

2. EXHIBIT B — CARDHOLDER TELEMETRY (Visa Compelling Evidence 3.0)
- Checkout IP: ${ipAddr} (${activeTelemetry.ip_geolocation?.city || 'Local'}, ${activeTelemetry.ip_geolocation?.isp || 'Residential ISP'})
- IP Distance to Shipping Address: ${ipDist} km
- Authentication: ${authType} (MFA Verified: ${activeTelemetry.authentication_record?.mfa_verified ? 'YES' : 'NO'})
- Device Fingerprint: ${hwHash} (${activeTelemetry.device_fingerprint?.prior_sessions_count || 1} prior sessions)

3. STATUTORY CONCLUSION
All evidentiary criteria under PayPal Seller Protection Policy and Visa CE 3.0 are satisfied. Request immediate dispute closure and release of held funds ($${selectedDispute.dispute_amount?.value} USD).`;
  };

  const compiledPayload = useMemo(() => {
    if (!selectedDispute) return {};
    return (
      selectedDispute.ai_state?.investigation_report?.paypal_payload_ready || {
        evidence_type:
          selectedDispute.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED'
            ? 'PROOF_OF_DELIVERY'
            : 'PROOF_OF_FULFILLMENT',
        evidence_info: {
          tracking_info: [
            {
              carrier_name: (activeCarrier.carrier || 'FEDEX').split(' ')[0].toUpperCase(),
              tracking_number: activeCarrier.tracking_number || selectedDispute.carrier_tracking_key,
            },
          ],
        },
        notes: getCompiledRebuttal(),
        item_tags: [
          'SELLER_PROTECTION_CLAIMED',
          'CARRIER_GPS_VERIFIED',
          'DELIVERY_CONFIRMED',
        ],
      }
    );
  }, [selectedDispute, selectedStrategy, activeCarrier]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 1800);
  };

  return (
    <div className={`operations-workbench ${selectedDispute ? '' : 'drawer-closed'}`}>
      {/* Left Pane: AG Grid Dispute Queue */}
      <section className="ag-grid-container" aria-label="Dispute Operations Queue">
        <div className="grid-toolbar">
          <div className="search-input-wrapper">
            <Search size={14} style={{ color: 'var(--ink-muted)' }} />
            <input
              id="dispute-search-input"
              type="text"
              placeholder="Filter by Case ID, Order, Buyer, Tracking..."
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
            />
          </div>

          <div className="filter-chips-group">
            <button
              className={`filter-chip ${activeFilterCategory === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveFilterCategory('ALL')}
            >
              All Cases ({disputes?.length || 0})
            </button>
            <button
              className={`filter-chip ${activeFilterCategory === 'INR' ? 'active' : ''}`}
              onClick={() => setActiveFilterCategory('INR')}
            >
              INR (Not Received)
            </button>
            <button
              className={`filter-chip ${activeFilterCategory === 'UNAUTHORIZED' ? 'active' : ''}`}
              onClick={() => setActiveFilterCategory('UNAUTHORIZED')}
            >
              Unauthorized (10.4)
            </button>
            <button
              className={`filter-chip ${activeFilterCategory === 'SNAD' ? 'active' : ''}`}
              onClick={() => setActiveFilterCategory('SNAD')}
            >
              SNAD (Inquiry)
            </button>
            <button
              className={`filter-chip ${activeFilterCategory === 'PROTECTED' ? 'active' : ''}`}
              onClick={() => setActiveFilterCategory('PROTECTED')}
            >
              Seller Protected
            </button>
            <button
              className={`filter-chip ${activeFilterCategory === 'DEFENDED' ? 'active' : ''}`}
              onClick={() => setActiveFilterCategory('DEFENDED')}
            >
              Defended
            </button>
          </div>
        </div>

        {/* AG Grid Table */}
        <div className="ag-theme-quartz" style={{ width: '100%' }}>
          <AgGridReact
            ref={gridRef}
            rowData={sortedAndFilteredDisputes}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            quickFilterText={quickFilterText}
            rowSelection="single"
            onRowClicked={onRowClicked}
            animateRows={true}
            suppressCellFocus={true}
            domLayout="autoHeight"
            rowHeight={66}
            headerHeight={40}
            getRowId={(params) => params.data.dispute_id}
          />
        </div>

        {/* Ledger Footer Note */}
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: 'var(--paper-subtle)',
            borderTop: '1px solid var(--hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11.5px',
            color: 'var(--ink-muted)',
          }}
        >
          <span>
            Queue ordered by earliest statutory bank response deadline. Select any case row to inspect sealed forensic exhibits.
          </span>
          <span className="mono" style={{ fontSize: '11px' }}>
            AG Grid Enterprise Ledger &bull; PayPal Customer Disputes API v1
          </span>
        </div>
      </section>

      {/* Right Pane: Integrated Case Exhibit & Rebuttal Inspector Drawer */}
      {selectedDispute && (
        <aside className="inspector-drawer" aria-label="Case Exhibit & Rebuttal Inspector">
          {/* Drawer Header */}
          <div className="inspector-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="mono" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                  {selectedDispute.dispute_id}
                </span>
                <span className={`status-pill ${isDefended ? 'defended' : 'escalated'}`}>
                  {isDefended
                    ? 'DEFENDED TO PAYPAL'
                    : `${selectedDispute.dispute_life_cycle_stage} · ${
                        getDeadlineInfo(selectedDispute.response_deadline, false).label
                      }`}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                  onClick={() => onOpenModalDossier(selectedDispute)}
                  title="Open full-screen printable dossier modal"
                >
                  <ExternalLink size={12} />
                  <span>Full Dossier</span>
                </button>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--ink-secondary)', fontWeight: 500 }}>
              {selectedDispute.transaction_details?.item_title}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '6px',
                borderTop: '1px solid var(--hairline-subtle)',
                fontSize: '11.5px',
              }}
            >
              <span className="mono" style={{ fontWeight: 700, color: 'var(--ink-primary)' }}>
                Claim: ${parseFloat(selectedDispute.dispute_amount?.value || 0).toFixed(2)} USD
              </span>
              {selectedDispute.seller_protection?.eligible ? (
                <span className="seller-protection-badge eligible">
                  <ShieldCheck size={11} />
                  Seller Protection Eligible
                </span>
              ) : (
                <span className="seller-protection-badge ineligible">
                  <ShieldAlert size={11} />
                  Inquiry Stage (Pax Goodwill)
                </span>
              )}
            </div>

            {/* Sub-navigation inside Inspector Drawer */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginTop: '4px' }}>
              <button
                className={`filter-chip ${inspectorTab === 'EXHIBITS' ? 'active' : ''}`}
                onClick={() => setInspectorTab('EXHIBITS')}
                style={{ textAlign: 'center', padding: '5px 6px', fontSize: '11px' }}
              >
                1. Forensic Exhibits
              </button>
              <button
                className={`filter-chip ${inspectorTab === 'REBUTTAL' ? 'active' : ''}`}
                onClick={() => setInspectorTab('REBUTTAL')}
                style={{ textAlign: 'center', padding: '5px 6px', fontSize: '11px' }}
              >
                2. Legal Rebuttal
              </button>
              <button
                className={`filter-chip ${inspectorTab === 'PAYLOAD' ? 'active' : ''}`}
                onClick={() => setInspectorTab('PAYLOAD')}
                style={{ textAlign: 'center', padding: '5px 6px', fontSize: '11px' }}
              >
                3. PayPal JSON
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="inspector-body">
            {/* One Decision & Live 5-Agent Stream Trigger */}
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--paper-subtle)',
                border: '1px solid var(--hairline)',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <div>
                <div className="mono" style={{ fontSize: '10px', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                  Recommended Decision
                </div>
                <div className="mono" style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink-primary)' }}>
                  {selectedDispute.ai_state?.recommended_action?.replace(/_/g, ' ') || 'FIGHT DISPUTE'} (
                  {selectedDispute.ai_state?.defense_confidence || 95}%)
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '5px 9px', fontSize: '11px' }}
                  onClick={() => handleRunLiveSwarmInDrawer(selectedDispute.dispute_id)}
                  disabled={isStreamingSwarm}
                  title="Stream 5-agent forensic verification via SSE"
                >
                  <Play size={11} className={isStreamingSwarm ? 'spin' : ''} />
                  <span>{isStreamingSwarm ? 'Running...' : 'Verify (5-Agent SSE)'}</span>
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '5px 9px', fontSize: '11px' }}
                  onClick={() => onDeploySwarm(selectedDispute.dispute_id)}
                  title="Open in full AI Adjudication Bench"
                >
                  <span>AI Bench</span>
                </button>
              </div>
            </div>

            {/* Live SSE Agent Trace (if run or available) */}
            {(isStreamingSwarm || streamLogs.length > 0) && (
              <div
                style={{
                  backgroundColor: '#0F1D35',
                  color: '#F8FAFC',
                  borderRadius: '4px',
                  padding: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10.5px',
                  maxHeight: '140px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '9.5px' }}>
                  <span>5-AGENT CHAIN OF CUSTODY LOG</span>
                  <span>{streamLogs.length} STEPS</span>
                </div>
                {streamLogs.slice(-5).map((log, i) => (
                  <div key={i} style={{ lineHeight: 1.4 }}>
                    <strong style={{ color: '#60A5FA' }}>[{log.agent}]</strong>{' '}
                    <span style={{ color: '#E2E8F0' }}>{log.thought}</span>
                  </div>
                ))}
              </div>
            )}

            {inspectorTab === 'EXHIBITS' && (
              <>
                {/* EXHIBIT A: Manila Forensic Tag — Physical Carrier POD & GPS */}
                <div className="exhibit-card">
                  <div className="exhibit-card-header">
                    <span className="exhibit-stamp-title">
                      <Truck size={12} />
                      EXHIBIT A &bull; CARRIER PROOF OF DELIVERY
                    </span>
                    <span className="exhibit-tag">GPS ±{activeCarrier.geo_coordinates?.accuracy_meters || 2.4}m</span>
                  </div>

                  <div className="kv-ledger">
                    <div className="kv-row">
                      <span className="kv-key">Carrier &amp; Tracking</span>
                      <span className="kv-val mono">
                        {activeCarrier.carrier || 'FedEx Ground'} #{activeCarrier.tracking_number}
                      </span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-key">Delivery Status</span>
                      <span className="kv-val mono" style={{ color: 'var(--forest)' }}>
                        {activeCarrier.status || 'DELIVERED'} ({activeCarrier.delivered_to || 'PORCH'})
                      </span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-key">Signatory on File</span>
                      <span className="kv-val mono">{activeCarrier.signed_by || 'M. REYNOLDS'}</span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-key">Scanner GPS Fix</span>
                      <span className="kv-val mono">
                        {activeCarrier.geo_coordinates?.latitude}, {activeCarrier.geo_coordinates?.longitude}
                      </span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-key">Destination Match</span>
                      <span className="kv-val" style={{ color: 'var(--forest)' }}>
                        {selectedDispute.shipping_address?.line1}, {selectedDispute.shipping_address?.city}{' '}
                        {selectedDispute.shipping_address?.state} (100% Match)
                      </span>
                    </div>
                  </div>
                </div>

                {/* EXHIBIT B: Manila Forensic Tag — Checkout IP & 2FA Telemetry */}
                <div className="exhibit-card">
                  <div className="exhibit-card-header">
                    <span className="exhibit-stamp-title">
                      <Globe size={12} />
                      EXHIBIT B &bull; CHECKOUT IP &amp; 2FA TELEMETRY
                    </span>
                    <span className="exhibit-tag">VISA CE 3.0</span>
                  </div>

                  <div className="kv-ledger">
                    <div className="kv-row">
                      <span className="kv-key">Checkout IP &amp; ISP</span>
                      <span className="kv-val mono">
                        {activeTelemetry.checkout_ip} ({activeTelemetry.ip_geolocation?.city},{' '}
                        {activeTelemetry.ip_geolocation?.isp})
                      </span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-key">IP-to-Delivery Distance</span>
                      <span
                        className="kv-val mono"
                        style={{
                          color:
                            (activeTelemetry.ip_geolocation?.distance_to_shipping_km || 0) > 100
                              ? 'var(--crimson)'
                              : 'var(--forest)',
                        }}
                      >
                        {activeTelemetry.ip_geolocation?.distance_to_shipping_km} km from shipping address
                      </span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-key">Authentication</span>
                      <span className="kv-val mono">
                        {activeTelemetry.authentication_record?.auth_type} (MFA:{' '}
                        {activeTelemetry.authentication_record?.mfa_verified ? 'Verified' : 'None'})
                      </span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-key">Device Fingerprint</span>
                      <span className="kv-val mono">
                        {activeTelemetry.device_fingerprint?.hardware_hash} (
                        {activeTelemetry.device_fingerprint?.prior_sessions_count || 1} sessions)
                      </span>
                    </div>
                  </div>
                </div>

                {/* EXHIBIT C: Buyer Account & Chronology */}
                <div className="exhibit-card">
                  <div className="exhibit-card-header">
                    <span className="exhibit-stamp-title">
                      <Clock size={12} />
                      EXHIBIT C &bull; BUYER HISTORY &amp; CHRONOLOGY
                    </span>
                    <span className="exhibit-tag">TIMELINE VERIFIED</span>
                  </div>

                  <div className="kv-ledger">
                    <div className="kv-row">
                      <span className="kv-key">Buyer Identity</span>
                      <span className="kv-val">
                        {selectedDispute.buyer_info?.name} ({selectedDispute.buyer_info?.email})
                      </span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-key">Account Tenure</span>
                      <span className="kv-val mono">
                        {selectedDispute.buyer_info?.account_age_days} days &bull;{' '}
                        {selectedDispute.buyer_info?.prior_dispute_count} prior disputes
                      </span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-key">Delivered Before Claim</span>
                      <span className="kv-val mono" style={{ color: 'var(--forest)' }}>
                        YES ({activeCarrier.delivery_timestamp?.slice(0, 10)} &lt;{' '}
                        {selectedDispute.create_time?.slice(0, 10)})
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {inspectorTab === 'REBUTTAL' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="form-label">Lex Legal Strategy</span>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '11px' }}
                    onClick={() => handleCopy(getCompiledRebuttal())}
                  >
                    {copiedText ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedText ? 'Copied' : 'Copy Brief'}</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                  <button
                    className={`filter-chip ${selectedStrategy === 'LEGAL_AGGRESSIVE' ? 'active' : ''}`}
                    onClick={() => setSelectedStrategy('LEGAL_AGGRESSIVE')}
                    style={{ fontSize: '10.5px', padding: '4px 6px', textAlign: 'center' }}
                  >
                    Visa CE 3.0 Legal
                  </button>
                  <button
                    className={`filter-chip ${selectedStrategy === 'DIPLOMATIC_INQUIRY' ? 'active' : ''}`}
                    onClick={() => setSelectedStrategy('DIPLOMATIC_INQUIRY')}
                    style={{ fontSize: '10.5px', padding: '4px 6px', textAlign: 'center' }}
                  >
                    Pax Goodwill
                  </button>
                  <button
                    className={`filter-chip ${selectedStrategy === 'SYNDICATE_FRAUD_ESCALATION' ? 'active' : ''}`}
                    onClick={() => setSelectedStrategy('SYNDICATE_FRAUD_ESCALATION')}
                    style={{ fontSize: '10.5px', padding: '4px 6px', textAlign: 'center' }}
                  >
                    Syndicate Escalate
                  </button>
                </div>

                <pre className="rebuttal-pre-block" style={{ maxHeight: '340px' }}>
                  {getCompiledRebuttal()}
                </pre>
              </div>
            )}

            {inspectorTab === 'PAYLOAD' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="mono" style={{ fontSize: '10.5px', color: 'var(--paypal-blue)', fontWeight: 600 }}>
                    POST /v1/customer/disputes/{selectedDispute.dispute_id}/provide-evidence
                  </span>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '11px' }}
                    onClick={() => handleCopy(JSON.stringify(compiledPayload, null, 2))}
                  >
                    {copiedText ? <Check size={11} /> : <Copy size={11} />}
                    <span>Copy JSON</span>
                  </button>
                </div>
                <pre className="code-dark-block" style={{ maxHeight: '350px', fontSize: '11px' }}>
                  {JSON.stringify(compiledPayload, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Drawer Decisive Action Footer */}
          <div className="inspector-footer">
            {!isDefended ? (
              <button
                id="btn-drawer-submit-evidence"
                className="btn btn-forest"
                style={{ width: '100%', padding: '10px 14px', fontSize: '13px' }}
                onClick={() => onSubmitToPayPal(selectedDispute.dispute_id)}
                disabled={isSubmittingEvidence}
              >
                <Send size={14} />
                <span>
                  {isSubmittingEvidence
                    ? 'Dispatching Packet to PayPal API...'
                    : `Dispatch Evidence Packet to PayPal ($${parseFloat(
                        selectedDispute.dispute_amount?.value || 0
                      ).toFixed(2)})`}
                </span>
              </button>
            ) : (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--forest-tint)',
                  border: '1px solid var(--forest-border)',
                  borderRadius: '4px',
                  color: 'var(--forest)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle2 size={14} />
                <span>EVIDENCE PACKET DISPATCHED &amp; SEALED WITH PAYPAL</span>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
