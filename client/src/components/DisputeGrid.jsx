import React, { useState, useMemo, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

// AG Grid styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Bot,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
  Package,
} from 'lucide-react';

// Register all community modules
ModuleRegistry.registerModules([AllCommunityModule]);

export default function DisputeGrid({ disputes, onSelectDispute, onDeploySwarm }) {
  const gridRef = useRef();
  const [quickFilterText, setQuickFilterText] = useState('');
  const [activeFilterCategory, setActiveFilterCategory] = useState('ALL');

  // Filter disputes based on category chips
  const filteredRowData = useMemo(() => {
    if (!disputes) return [];
    if (activeFilterCategory === 'ALL') return disputes;
    if (activeFilterCategory === 'INR') {
      return disputes.filter((d) => d.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED');
    }
    if (activeFilterCategory === 'UNAUTHORIZED') {
      return disputes.filter((d) => d.dispute_reason === 'UNAUTHORIZED');
    }
    if (activeFilterCategory === 'SNAD') {
      return disputes.filter((d) => d.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED');
    }
    if (activeFilterCategory === 'PROTECTED') {
      return disputes.filter((d) => d.seller_protection?.eligible);
    }
    if (activeFilterCategory === 'DEFENDED') {
      return disputes.filter((d) => d.ai_state?.status === 'DEFENDED_TO_PAYPAL');
    }
    return disputes;
  }, [disputes, activeFilterCategory]);

  // Custom Cell Renderers
  const DisputeIdRenderer = useCallback((props) => {
    const data = props.data;
    if (!data) return null;

    let reasonBadgeClass = 'status-pill ready';
    let reasonText = 'INR (Not Received)';
    if (data.dispute_reason === 'UNAUTHORIZED') {
      reasonBadgeClass = 'status-pill escalated';
      reasonText = 'Unauthorized Card';
    } else if (data.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED') {
      reasonBadgeClass = 'status-pill pending';
      reasonText = 'SNAD (Condition)';
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <strong style={{ color: '#FFFFFF', fontFamily: 'var(--font-mono)', fontSize: '0.825rem', letterSpacing: '0.02em' }}>
            {data.dispute_id}
          </strong>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {data.dispute_life_cycle_stage?.replace(/_/g, ' ')}
          </span>
        </div>
        <div>
          <span className={reasonBadgeClass} style={{ padding: '2px 8px', fontSize: '0.68rem', borderRadius: '4px' }}>
            {reasonText}
          </span>
        </div>
      </div>
    );
  }, []);

  const ItemRenderer = useCallback((props) => {
    const data = props.data;
    if (!data) return null;
    const tx = data.transaction_details || {};

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '100%' }}>
        {tx.item_image ? (
          <img
            src={tx.item_image}
            alt={tx.item_title}
            style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.12)', flexShrink: 0 }}
          />
        ) : (
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Package size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: '2px' }}>
          <span
            style={{
              fontSize: '0.825rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '260px',
            }}
            title={tx.item_title}
          >
            {tx.item_title}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Order {tx.order_id}
          </span>
        </div>
      </div>
    );
  }, []);

  const AmountRenderer = useCallback((props) => {
    const data = props.data;
    if (!data) return null;
    const amount = data.dispute_amount?.value || '0.00';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: '2px' }}>
        <strong style={{ fontSize: '0.925rem', color: '#FFFFFF', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          ${parseFloat(amount).toFixed(2)}
        </strong>
        <span style={{ fontSize: '0.675rem', color: 'var(--rose-400)', fontWeight: 500 }}>
          +$15.00 fee
        </span>
      </div>
    );
  }, []);

  const BuyerRenderer = useCallback((props) => {
    const data = props.data;
    if (!data) return null;
    const buyer = data.buyer_info || {};

    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: '2px' }}>
        <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {buyer.name || 'Unknown Buyer'}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
          {buyer.email || data.transaction_details?.shipping_address?.split(',')[0] || ''}
        </span>
      </div>
    );
  }, []);

  const ProtectionRenderer = useCallback((props) => {
    const data = props.data;
    if (!data) return null;
    const isEligible = data.seller_protection?.eligible;

    return (
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        {isEligible ? (
          <span className="seller-protection-badge eligible" title={data.seller_protection?.protection_reason}>
            <ShieldCheck size={13} />
            PayPal Backed
          </span>
        ) : (
          <span className="seller-protection-badge ineligible" title={data.seller_protection?.protection_reason}>
            <ShieldAlert size={13} />
            Ineligible
          </span>
        )}
      </div>
    );
  }, []);

  const RiskRenderer = useCallback((props) => {
    const data = props.data;
    if (!data) return null;
    const confidence = data.ai_state?.defense_confidence || 90;
    const isHigh = confidence >= 85;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '100%', width: '100%' }}>
        <div className="risk-bar" style={{ width: '56px', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
          <div
            className="risk-bar-fill"
            style={{
              width: `${confidence}%`,
              height: '100%',
              borderRadius: '999px',
              background: isHigh ? 'linear-gradient(90deg, #10B981, #34D399)' : 'linear-gradient(90deg, #F59E0B, #FBBF24)',
            }}
          />
        </div>
        <span style={{ fontSize: '0.785rem', fontWeight: 700, color: isHigh ? 'var(--emerald-400)' : 'var(--amber-400)', whiteSpace: 'nowrap' }}>
          {confidence}% Win Prob
        </span>
      </div>
    );
  }, []);

  const StatusRenderer = useCallback((props) => {
    const data = props.data;
    if (!data) return null;
    const status = data.ai_state?.status || 'PENDING_REVIEW';

    let pillClass = 'status-pill pending';
    let label = 'Pending Triage';

    if (status === 'DEFENDED_TO_PAYPAL') {
      pillClass = 'status-pill defended';
      label = 'Defended to PayPal';
    } else if (status === 'EVIDENCE_READY') {
      pillClass = 'status-pill ready';
      label = 'Evidence Ready';
    } else if (status === 'SETTLED') {
      pillClass = 'status-pill settled';
      label = 'Goodwill Settled';
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <span className={pillClass}>
          {status === 'DEFENDED_TO_PAYPAL' && <CheckCircle2 size={12} />}
          {status === 'PENDING_REVIEW' && <Clock size={12} />}
          {label}
        </span>
      </div>
    );
  }, []);

  const ActionRenderer = useCallback(
    (props) => {
      const data = props.data;
      if (!data) return null;
      const isDefended = data.ai_state?.status === 'DEFENDED_TO_PAYPAL';

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '100%' }}>
          {isDefended ? (
            <button
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '7px' }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectDispute(data);
              }}
            >
              <ExternalLink size={12} />
              Dossier
            </button>
          ) : (
            <button
              className="btn btn-primary"
              style={{
                padding: '0.35rem 0.8rem',
                fontSize: '0.75rem',
                borderRadius: '7px',
                background: 'linear-gradient(135deg, #0070BA, #00509E)',
                boxShadow: '0 2px 8px rgba(0, 112, 186, 0.4)',
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDeploySwarm(data.dispute_id);
              }}
            >
              <Sparkles size={12} />
              Deploy Swarm
            </button>
          )}
        </div>
      );
    },
    [onSelectDispute, onDeploySwarm]
  );

  // AG Grid Column Definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Dispute & Reason',
        field: 'dispute_id',
        width: 220,
        minWidth: 200,
        cellRenderer: DisputeIdRenderer,
      },
      {
        headerName: 'Fulfillment & Item',
        field: 'transaction_details.item_title',
        minWidth: 260,
        flex: 1.2,
        cellRenderer: ItemRenderer,
      },
      {
        headerName: 'Claim Amount',
        field: 'dispute_amount.value',
        width: 130,
        cellRenderer: AmountRenderer,
      },
      {
        headerName: 'Buyer',
        field: 'buyer_info.name',
        width: 170,
        cellRenderer: BuyerRenderer,
      },
      {
        headerName: 'PayPal Seller Protection',
        field: 'seller_protection.eligible',
        width: 185,
        cellRenderer: ProtectionRenderer,
      },
      {
        headerName: 'AI Defense Win Prob',
        field: 'ai_state.defense_confidence',
        width: 180,
        cellRenderer: RiskRenderer,
      },
      {
        headerName: 'Defense Status',
        field: 'ai_state.status',
        width: 175,
        cellRenderer: StatusRenderer,
      },
      {
        headerName: 'Action',
        width: 140,
        cellRenderer: ActionRenderer,
        pinned: 'right',
      },
    ],
    [DisputeIdRenderer, ItemRenderer, AmountRenderer, BuyerRenderer, ProtectionRenderer, RiskRenderer, StatusRenderer, ActionRenderer]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
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

  return (
    <section className="ag-grid-container">
      {/* Grid Toolbar with Search and Category Filter Chips */}
      <div className="grid-toolbar">
        <div className="search-input-wrapper">
          <Search size={15} style={{ color: 'var(--text-muted)' }} />
          <input
            id="dispute-search-input"
            type="text"
            placeholder="Search dispute ID, buyer, tracking, item..."
            value={quickFilterText}
            onChange={(e) => setQuickFilterText(e.target.value)}
          />
        </div>

        <div className="filter-chips-group">
          <button
            className={`filter-chip ${activeFilterCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilterCategory('ALL')}
          >
            All Disputes ({disputes?.length || 0})
          </button>
          <button
            className={`filter-chip ${activeFilterCategory === 'INR' ? 'active' : ''}`}
            onClick={() => setActiveFilterCategory('INR')}
          >
            Item Not Received
          </button>
          <button
            className={`filter-chip ${activeFilterCategory === 'UNAUTHORIZED' ? 'active' : ''}`}
            onClick={() => setActiveFilterCategory('UNAUTHORIZED')}
          >
            Unauthorized Card
          </button>
          <button
            className={`filter-chip ${activeFilterCategory === 'SNAD' ? 'active' : ''}`}
            onClick={() => setActiveFilterCategory('SNAD')}
          >
            SNAD (Condition)
          </button>
          <button
            className={`filter-chip ${activeFilterCategory === 'PROTECTED' ? 'active' : ''}`}
            onClick={() => setActiveFilterCategory('PROTECTED')}
          >
            PayPal Protected
          </button>
          <button
            className={`filter-chip ${activeFilterCategory === 'DEFENDED' ? 'active' : ''}`}
            onClick={() => setActiveFilterCategory('DEFENDED')}
          >
            Defended
          </button>
        </div>
      </div>

      {/* The AG Grid Table Component */}
      <div className="ag-theme-quartz-dark" style={{ width: '100%', backgroundColor: '#0B1120', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <AgGridReact
          ref={gridRef}
          rowData={filteredRowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilterText}
          rowSelection="single"
          onRowClicked={onRowClicked}
          animateRows={true}
          suppressCellFocus={true}
          domLayout="autoHeight"
          rowHeight={68}
          headerHeight={46}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>
          💡 Click any row to inspect deep carrier GPS proof, device telemetry, and bank rebuttal dossier.
        </span>
        <span>
          Powered by <strong>AG Grid</strong> &amp; <strong>PayPal Developer Platform</strong>
        </span>
      </div>
    </section>
  );
}
