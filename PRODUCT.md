# Product

<!-- impeccable:product-schema 1 -->

> Interview round was skipped by the user; facts marked *(inferred)* come from the repository and the brief "build a webapp interface for PayPal fintech to resolve disputes and friendly frauds". Confirm or correct them.

## Platform

web

## Users

- **Primary *(inferred)*:** a merchant dispute / risk analyst at a PayPal merchant who works a queue of open disputes every day, deciding for each one whether to fight, settle, or escalate before the response deadline.
- **Secondary:** hackathon judges (PayPal AI Hackathon) evaluating the product in a short live demo.

## Product Purpose

AegisPay AI resolves PayPal disputes and chargebacks, with a focus on friendly fraud (buyer received the item but claims "not received" or "unauthorized"). For each dispute it gathers carrier proof, checkout telemetry and account history, recommends an action, drafts the rebuttal, and submits evidence to the PayPal Disputes API. Success = more disputes won or cheaply settled, before deadlines, with less analyst time per case.

## Positioning

A five-agent pipeline (Sentinel triage, Sherlock forensics, Oracle fraud-ring scan, Lex legal rebuttal, Pax settlement economics) whose output is a submit-ready PayPal `provide-evidence` payload, not just a risk score.

## Operating Context

- Disputes arrive from PayPal Customer Disputes API v1 (stages: INQUIRY, CHARGEBACK; channels: INTERNAL, EXTERNAL).
- Hard response deadlines (days to hours). $15 chargeback fee per lost case.
- Evidence types: carrier tracking + GPS + signature + delivery photo, checkout IP distance, device fingerprint, MFA/biometric auth record, buyer account age and prior disputes.
- Outcome verbs: FIGHT_DISPUTE, SETTLE_GOODWILL, ESCALATE_FRAUD_RING; submit to PayPal.

## Capabilities and Constraints

- Stack: React 19 + Vite client, Express server, AG Grid (Best Use of AG Grid prize target — the grid must stay central).
- Endpoints: `/api/disputes`, `/api/disputes/:id/investigate-stream` (SSE agent steps), `/api/disputes/:id/submit`, `/api/disputes/simulate-attack`, `/api/ai/analyze` (Gemini/OpenAI, user-supplied key), `/api/paypal/status|configure`.
- Runs in PayPal sandbox simulation when no credentials are configured.

## Brand Commitments

- Name: AegisPay AI. Built for PayPal; may use PayPal-adjacent cues but must not impersonate PayPal's own brand *(inferred)*.

## Evidence on Hand

- Mock disputes, carrier records and telemetry in `server/src/data/` (synthetic, modeled on PayPal API v1). Item and delivery photos are Unsplash URLs.
- No real customers, win-rate benchmarks, or testimonials exist; do not fabricate them.

## Product Principles

1. Deadline first: the queue is ordered by what will be lost soonest.
2. Show the evidence, not the vibe: every recommendation is traceable to a concrete fact.
3. One decision per case: fight, settle, or escalate — then submit.
4. Honest about simulation: sandbox/mock state is always visible.

