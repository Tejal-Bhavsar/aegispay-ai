import React, { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community';
import { Search, ShieldCheck, ShieldAlert, ArrowUpRight, FileText } from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

const merchantLightTheme = themeQuartz.withParams({
  browserColorScheme: 'light',
  accentColor: '#0B5FD6',
  backgroundColor: '#FFFFFF',
  foregroundColor: '#0E1726',
  headerBackgroundColor: '#F7F8FA',
  headerTextColor: '#475467',
  headerFontWeight: 600,
  headerFontSize: 12,
  dataFontSize: 13,
  borderColor: '#E4E7EC',
  rowBorder: true,
  columnBorder: false,
  headerColumnBorder: false,
  rowHoverColor: '#F8FAFC',
  selectedRowBackgroundColor: '#EFF6FF',
  cellHorizontalPadding: 14,
  rowVerticalPaddingScale: 1.1,
  wrapperBorder: false,
  wrapperBorderRadius: 0,
});

const FILTER_DEFS = [
  { id: 'ALL', label: 'All disputes' },
  { id: 'INR', label: 'Not received' },
  { id: 'UNAUTHORIZED', label: 'Unauthorized' },
  { id: 'SNAD', label: 'Not as described' },
  { id: 'PROTECTED', label: 'Seller protected' },
  { id: 'DEFENDED', label: 'Submitted' },
];

const REASON_LABELS = {
  MERCHANDISE_OR_SERVICE_NOT_RECEIVED: 'Item not received',
  UNAUTHORIZED: 'Unauthorized payment',
  MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED: 'Not as described',
};

const STATUS_MAP = {
  DEFENDED_TO_PAYPAL: { label: 'Sent to PayPal', cls: 'defended' },
  EVIDENCE_READY: { label: 'Packet ready', cls: 'ready' },
  INVESTIGATING: { label: 'Reviewing', cls: 'pending' },
  SETTLED_GOODWILL: { label: 'Goodwill offer', cls: 'settled' },
  ESCALATED_FRAUD: { label: 'Flagged cluster', cls: 'escalated' },
  PENDING_REVIEW: { label: 'Needs review', cls: 'pending' },
};

function matchesFilter(dispute, filterId) {
  switch (filterId) {
    case 'INR':
      return dispute.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED';
    case 'UNAUTHORIZED':
      return dispute.dispute_reason === 'UNAUTHORIZED';
    case 'SNAD':
      return dispute.dispute_reason === 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED';
    case 'PROTECTED':
      return Boolean(dispute.seller_protection?.eligible);
    case 'DEFENDED':
      return dispute.ai_state?.status === 'DEFENDED_TO_PAYPAL';
    default:
      return true;
  }
}

export default function DisputeGrid({ disputes = [], isLoading = false, onSelectDispute, onDeploySwarm }) {
  const [quickFilterText, setQuickFilterText] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filterCounts = useMemo(() => {
    const counts = {};
    for (const f of FILTER_DEFS) {
      counts[f.id] = disputes.filter((d) => matchesFilter(d, f.id)).length;
    }
    return counts;
  }, [disputes]);

  const filteredData = useMemo(() => {
    return disputes.filter((d) => matchesFilter(d, activeFilter));
  }, [disputes, activeFilter]);

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Case & deadline',
        field: 'dispute_id',
        width: 176,
        sortable: true,
        cellRenderer: (params) => {
          const row = params.data;
          const isDone = row.ai_state?.status === 'DEFENDED_TO_PAYPAL';
          const msLeft = row.response_deadline ? new Date(row.response_deadline).getTime() - Date.now() : 7 * 86400000;
          const daysLeft = Math.max(0, Math.ceil(msLeft / 86400000));
          const pctElapsed = Math.min(100, Math.max(8, ((21 - Math.min(21, daysLeft)) / 21) * 100));
          const deadlineTone = isDone ? 'done' : daysLeft <= 3 ? 'urgent' : daysLeft <= 7 ? 'soon' : '';

          return (
            <div className={`deadline ${deadlineTone}`}>
              <span className="num" style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--ink)' }}>
                {row.dispute_id}
              </span>
              <span className="deadline-text">
                {isDone ? 'Evidence sent' : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
              </span>
              <div className="deadline-track">
                <div className="deadline-fill" style={{ width: `${isDone ? 100 : pctElapsed}%` }} />
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Item & claim reason',
        field: 'transaction_details.item_title',
        flex: 1.5,
        minWidth: 260,
        sortable: true,
        cellRenderer: (params) => {
          const row = params.data;
          const tx = row.transaction_details || {};
          const reason = REASON_LABELS[row.dispute_reason] || row.dispute_reason;
          return (
            <div className="cell-row">
              {tx.item_image && (
                <img className="thumb" src={tx.item_image} alt="" loading="lazy" />
              )}
              <div className="cell-stack">
                <span className="cell-primary" title={tx.item_title}>
                  {tx.item_title || 'Order item'}
                </span>
                <span className="cell-secondary">
                  {reason} · <span className="num">{row.carrier_tracking_key || tx.order_id}</span>
                </span>
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Amount',
        field: 'dispute_amount.value',
        width: 120,
        sortable: true,
        comparator: (a, b) => parseFloat(a || 0) - parseFloat(b || 0),
        cellRenderer: (params) => {
          const val = parseFloat(params.value || 0).toFixed(2);
          const currency = params.data.dispute_amount?.currency_code || 'USD';
          return (
            <div className="cell-stack">
              <span className="cell-primary num">${val}</span>
              <span className="cell-secondary num">{currency}</span>
            </div>
          );
        },
      },
      {
        headerName: 'Buyer account',
        field: 'buyer_info.name',
        width: 190,
        sortable: true,
        cellRenderer: (params) => {
          const buyer = params.data.buyer_info || {};
          return (
            <div className="cell-stack">
              <span className="cell-primary">{buyer.name || 'Unknown buyer'}</span>
              <span className="cell-secondary">
                {buyer.account_age_days ? `${buyer.account_age_days}d tenure` : 'PayPal account'} ·{' '}
                {buyer.prior_dispute_count || 0} prior
              </span>
            </div>
          );
        },
      },
      {
        headerName: 'Protection',
        field: 'seller_protection.eligible',
        width: 145,
        sortable: true,
        cellRenderer: (params) => {
          const eligible = Boolean(params.value);
          return (
            <span className={`seller-protection-badge ${eligible ? 'eligible' : 'ineligible'}`}>
              {eligible ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
              {eligible ? 'Protected' : 'Uninsured'}
            </span>
          );
        },
      },
      {
        headerName: 'Confidence',
        field: 'ai_state.defense_confidence',
        width: 138,
        sortable: true,
        cellRenderer: (params) => {
          const score = Number(params.value || 0);
          const fillColor =
            score >= 85 ? 'var(--success)' : score >= 65 ? 'var(--accent)' : 'var(--warning)';
          return (
            <div className="confidence">
              <span className="confidence-value num">{score}%</span>
              <div className="confidence-track">
                <div className="confidence-fill" style={{ width: `${score}%`, background: fillColor }} />
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Status',
        field: 'ai_state.status',
        width: 142,
        sortable: true,
        cellRenderer: (params) => {
          const state = STATUS_MAP[params.value] || STATUS_MAP.PENDING_REVIEW;
          return <span className={`status-pill ${state.cls}`}>{state.label}</span>;
        },
      },
      {
        headerName: 'Action',
        field: 'dispute_id',
        width: 186,
        pinned: 'right',
        sortable: false,
        filter: false,
        cellRenderer: (params) => {
          const row = params.data;
          const isDone = row.ai_state?.status === 'DEFENDED_TO_PAYPAL';
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '100%' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDispute?.(row);
                }}
                title="View evidence packet"
              >
                <FileText size={13} />
                Packet
              </button>
              <button
                type="button"
                className={`btn btn-sm ${isDone ? 'btn-ghost' : 'btn-primary'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeploySwarm?.(row.dispute_id);
                }}
              >
                {isDone ? 'View' : 'Review'}
                <ArrowUpRight size={13} />
              </button>
            </div>
          );
        },
      },
    ],
    [onSelectDispute, onDeploySwarm]
  );

  return (
    <div className="queue">
      <div className="grid-toolbar">
        <div className="search-input-wrapper">
          <Search size={14} className="search-icon" />
          <input
            type="search"
            className="form-input"
            placeholder="Search dispute ID, buyer name, SKU, or tracking key..."
            value={quickFilterText}
            onChange={(e) => setQuickFilterText(e.target.value)}
            aria-label="Filter disputes queue"
          />
        </div>

        <div className="filter-chips-group" role="tablist" aria-label="Dispute category filters">
          {FILTER_DEFS.map((filter) => {
            const active = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`filter-chip ${active ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                <span>{filter.label}</span>
                <span className="chip-count num">{filterCounts[filter.id] || 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      {isLoading && disputes.length === 0 ? (
        <div className="empty-state">Loading active PayPal disputes...</div>
      ) : (
        <div style={{ width: '100%' }}>
          <AgGridReact
            theme={merchantLightTheme}
            rowData={filteredData}
            columnDefs={columnDefs}
            quickFilterText={quickFilterText}
            domLayout="autoHeight"
            rowHeight={66}
            headerHeight={40}
            suppressCellFocus={true}
            onRowClicked={(e) => onSelectDispute?.(e.data)}
            overlayNoRowsTemplate='<span style="color:#475467;font-size:13px;">No disputes match the active filter.</span>'
          />
        </div>
      )}

      <div className="queue-foot">
        <span>
          Showing <strong className="num">{filteredData.length}</strong> of{' '}
          <strong className="num">{disputes.length}</strong> PayPal claims
        </span>
        <span>Select a row to inspect carrier logs &amp; Seller Protection packet, or click Review for AI drafting.</span>
      </div>
    </div>
  );
}
