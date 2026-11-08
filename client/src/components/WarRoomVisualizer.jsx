import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Search,
  Scale,
  HeartHandshake,
  Network,
  Play,
  Terminal as TerminalIcon,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function WarRoomVisualizer({
  disputes,
  selectedDisputeId,
  onSelectDisputeId,
  onRunSwarm,
  activeLogs,
  isRunning,
  activePhase,
}) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeLogs]);

  const currentDispute = disputes.find((d) => d.dispute_id === selectedDisputeId) || disputes[0];

  const agents = [
    {
      id: 'TRIAGE',
      name: 'Sentinel',
      title: 'Triage & Urgency',
      desc: 'Ingests dispute event, validates response deadline, classifies velocity risk.',
      icon: ShieldAlert,
      color: '#6366F1',
    },
    {
      id: 'FORENSICS',
      name: 'Sherlock',
      title: 'Forensic Detective',
      desc: 'Pulls carrier GPS, scan history, proof of delivery photo, and checkout IP distance.',
      icon: Search,
      color: '#00CFDE',
    },
    {
      id: 'SYNDICATE_SCAN',
      name: 'Oracle',
      title: 'Syndicate Hunter',
      desc: 'Scans cross-dispute cluster graph for freight-forwarder rings and bot checkout patterns.',
      icon: Network,
      color: '#EC4899',
    },
    {
      id: 'LEGAL_SYNTHESIS',
      name: 'Lex',
      title: 'Legal & Seller Protection',
      desc: 'Evaluates PayPal Seller Protection eligibility, drafts formal rebuttal, compiles REST payload.',
      icon: Scale,
      color: '#10B981',
    },
    {
      id: 'SETTLEMENT_ANALYSIS',
      name: 'Pax',
      title: 'Goodwill Negotiator',
      desc: 'Calculates customer lifetime value vs dispute fees for smart micro-settlement.',
      icon: HeartHandshake,
      color: '#F59E0B',
    },
  ];

  return (
    <div className="war-room-container">
      {/* Left Roster: The 5 Autonomous Agents */}
      <div className="agent-roster-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} style={{ color: 'var(--paypal-cyan)' }} />
              AegisPay Swarm Agents
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>5 Specialized</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Collaborative agents operating with specialized domain tools.
          </p>
        </div>

        {/* Dispute Selector & Run CTA */}
        <div style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            TARGET DISPUTE CASE
          </label>
          <select
            value={currentDispute?.dispute_id}
            onChange={(e) => onSelectDisputeId(e.target.value)}
            disabled={isRunning}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '0.5rem',
              fontSize: '0.8rem',
              outline: 'none',
            }}
          >
            {disputes.map((d) => (
              <option key={d.dispute_id} value={d.dispute_id}>
                {d.dispute_id} — {d.transaction_details.item_title.substring(0, 24)}... (${d.dispute_amount.value})
              </option>
            ))}
          </select>

          <button
            id="btn-run-swarm-inspection"
            className="btn btn-primary"
            onClick={() => onRunSwarm(currentDispute?.dispute_id)}
            disabled={isRunning}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isRunning ? (
              <>
                <Clock size={14} className="spin" />
                <span>Swarm Collaborating...</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>Deploy Swarm Investigation</span>
              </>
            )}
          </button>
        </div>

        {/* The 5 Agent Nodes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isActive = activePhase === agent.id;
            const isCompleted = currentDispute?.ai_state?.investigation_report;

            return (
              <div
                key={agent.id}
                className={`agent-node ${isActive ? 'active-agent' : ''}`}
                style={{
                  borderLeft: `3px solid ${agent.color}`,
                }}
              >
                <div
                  className="agent-icon-box"
                  style={{
                    background: `${agent.color}20`,
                    color: agent.color,
                  }}
                >
                  <Icon size={18} />
                </div>
                <div className="agent-meta">
                  <div className="agent-name">
                    <span>{agent.name}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: isActive ? 'var(--paypal-cyan)' : 'var(--text-muted)' }}>
                      {isActive ? 'THINKING...' : isCompleted ? 'DONE' : 'STANDBY'}
                    </span>
                  </div>
                  <div className="agent-role" style={{ color: agent.color }}>
                    {agent.title}
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                    {agent.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Terminal: Live Agent Stream & Evidentiary Trace */}
      <div className="terminal-wrapper">
        <div className="terminal-header">
          <div className="terminal-title">
            <TerminalIcon size={15} style={{ color: 'var(--paypal-cyan)' }} />
            <span>SWARM REASONING TERMINAL // CASE #{currentDispute?.dispute_id || 'STANDBY'}</span>
          </div>
          <div className="terminal-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
        </div>

        <div className="terminal-body">
          {activeLogs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem', textAlign: 'center' }}>
              &gt; Select a dispute and click "Deploy Swarm Investigation" to observe the agents formulate evidence, query PayPal APIs, and construct the defense packet in real-time.
            </div>
          ) : (
            activeLogs.map((log, index) => {
              const agentMeta = agents.find((a) => a.name === log.agent) || {
                color: '#94A3B8',
              };

              return (
                <div key={index} className="log-entry">
                  <span className="log-time">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span
                    className="log-agent-tag"
                    style={{
                      background: `${agentMeta.color}25`,
                      color: agentMeta.color,
                      border: `1px solid ${agentMeta.color}50`,
                    }}
                  >
                    {log.agent}
                  </span>
                  <div className="log-message">
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', marginRight: '6px' }}>
                      [{log.action}]
                    </span>
                    <span>{log.thought}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}
