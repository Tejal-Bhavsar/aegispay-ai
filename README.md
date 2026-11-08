# 🛡️ AegisPay AI
### Autonomous Multi-Agent Dispute Defense & Fraud Interception Platform
> Built for the **PayPal AI Hackathon: Build What's Next with PayPal and AI**  
> *Targeting Overall 1st Place, Best Use of PayPal + AI, Best Use of Agentic Commerce, and Best Use of AG Grid ($5,000 Award)*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PayPal Developer API](https://img.shields.io/badge/PayPal%20API-Disputes%20%26%20Orders-0070BA)](https://developer.paypal.com)
[![AG Grid](https://img.shields.io/badge/AG%20Grid-Quartz%20Theme-E02424)](https://www.ag-grid.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![Express](https://img.shields.io/badge/Backend-Express%20%2F%20Node.js-green)](https://expressjs.com/)

---

## 💡 The Problem: The $100 Billion Chargeback Crisis

Every year, global merchants and payment networks lose over **$100 billion to card-not-present (CNP) chargebacks and "friendly fraud"**:
1. **Friendly Fraud Exploits**: A buyer legitimately orders high-value items via PayPal or credit card, receives the package at their doorstep, and then files a fraudulent claim stating *"Item Not Received (INR)"* or *"Unauthorized Charge / Card Stolen"*.
2. **The Merchant Burden**: When a dispute is filed, the bank immediately freezes the merchant's funds and slaps them with an unavoidable **$15 to $50 chargeback fee**. Merchants have **10 to 20 days** to compile physical tracking evidence, carrier signatures, IP geolocation logs, and legal rebuttal statements.
3. **The Manual Bottleneck**: Human caseworkers take **30 to 60 minutes per dispute**, leading to an abysmal industry win rate of under **28%**.
4. **Under-Utilized PayPal Seller Protection**: PayPal provides an industry-leading **Seller Protection Program**, reimbursing merchants 100% of the disputed amount *if* strict evidentiary standards are submitted. Most merchants fail to claim this protection due to manual friction.

---

## ⚡ The Solution: AegisPay AI

**AegisPay AI** transforms dispute defense from a slow, manual bleed into an **autonomous multi-agent operation running in under 35 seconds**:

* 🤖 **Swarm of 5 Specialized AI Agents**:
  * **Sentinel (Triage Agent)**: Parses incoming PayPal dispute events, checks response deadlines, and stratifies velocity risk.
  * **Sherlock (Forensic Detective Agent)**: Integrates carrier tracking telemetry (FedEx/UPS/USPS GPS fixes, signature capture, proof-of-delivery photos) and correlates checkout IP proximity.
  * **Oracle (Syndicate Hunter Agent)**: Analyzes cross-dispute cluster graphs to flag organized fraud rings, Delaware re-shipper hotspots, and proxy farms.
  * **Lex (Legal & Seller Protection Rebuttal Agent)**: Evaluates claims against PayPal Seller Protection criteria and Visa Compelling Evidence 3.0 (CE 3.0), auto-generating bank-grade rebuttals.
  * **Pax (Goodwill & Settlement Agent)**: Identifies subjective claims or high-LTV VIP customers in the Inquiry phase, evaluating micro-settlements to avoid chargeback fees.
* 💳 **Deep PayPal Developer Platform Integration**:
  * Direct integration with PayPal Customer Disputes API (`/v1/customer/disputes`).
  * Automated evidence compilation for `POST /v1/customer/disputes/{dispute_id}/provide-evidence`.
  * PayPal Orders API integration (`/v2/checkout/orders`).
* 📊 **Enterprise AG Grid Command Center**:
  * High-performance table with custom cell renderers (Risk Score pill, Seller Protection badge, dynamic action buttons, quick filters, and live search).

---

## 🏗️ Multi-Agent Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │      PayPal Disputes API / Inbound Webhook             │
                    │      (CUSTOMER.DISPUTE.CREATED / INQUIRY)              │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                                                ▼
                     [ Agent 1: Sentinel - Dispute Triage & Urgency ]
                                                │
                                                ▼
                   [ Agent 2: Sherlock - Forensic Evidence Gatherer ]
                      ├── Carrier Feeds (FedEx / UPS / USPS GPS Scans)
                      ├── Proof of Delivery Photo & Recipient Signature
                      └── Cardholder Checkout IP & Biometric Auth Telemetry
                                                │
                                                ▼
                  [ Agent 3: Oracle - Syndicate & Fraud Ring Hunter ]
                      └── Cross-checks addresses against known freight-forwarders
                                                │
                                                ▼
                  [ Agent 4: Lex - Legal Rebuttal & Policy Architect ]
                      ├── Evaluates PayPal Seller Protection Compliance
                      ├── Drafts formal bank-grade Rebuttal Letter (Visa CE 3.0)
                      └── Formats REST Payload for /provide-evidence
                                                │
                                                ▼
                 [ Agent 5: Pax - Customer Goodwill & Settlement Agent ]
                      └── Pre-dispute micro-settlement for subjective claims
                                                │
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │      PayPal Disputes API: provide_evidence             │
                    │      Status: DEFENDED // 100% Funds Retained           │
                    └────────────────────────────────────────────────────────┘
```

---

## 🏆 Key Features & Sponsor Alignments

| Feature / Sponsor Prize Track | Description |
| :--- | :--- |
| **AG Grid Command Center** *(AG Grid 1st Place - $5,000)* | Real-time dispute operations table powered by AG Grid with custom cell renderers, multi-column sorting, quick filtering, and category chips. |
| **Live Agent War Room** *(Best Use of Agentic Commerce)* | Real-time terminal with Server-Sent Events (SSE) streaming agent thoughts and tool invocations step-by-step. |
| **Dispute Policy Studio** | Configurable merchant rules engine for automated PayPal submission thresholds, goodwill settlement ceilings, and signature enforcement. |
| **Interactive Fraud Ring Topology** | Interactive SVG network graph isolating commercial re-shipper hotspots (Delaware 19810), proxy exit nodes, and synthetic identities. |
| **Postman Collection v2.1** *(Postman Sponsor)* | Pre-built Postman collection with tests, environment variables, and grouped requests for all dispute defense workflows. |
| **OpenAPI 3.1 & APIMatic Spec** *(APIMatic - $1,000)* | Standardized OpenAPI 3.1 contract and `apimatic.json` configuration for instant multi-language SDK and API portal generation. |
| **Physical & Digital Forensics** | Visual inspection of delivery doorstep photos, satellite GPS coordinates (±2.4m accuracy), and network IP distance. |
| **1-Click PayPal API Submission** | Dispatches the synthesized evidence bundle directly to PayPal Sandbox with instant receipt acknowledgement. |
| **Dual-Mode Engine** | Connect real PayPal Sandbox credentials (`PAYPAL_CLIENT_ID` / `SECRET`) or use the high-fidelity Sandbox Simulation mode for instant evaluation. |

---

## 🚀 Quickstart & Setup

### Prerequisites
* Node.js v18+ (tested on Node v23)
* npm v9+

### 1. Clone & Install
```bash
git clone https://github.com/your-username/aegispay-ai.git
cd aegispay-ai

# Install all dependencies (root, server, and client)
npm run install:all
```

### 2. Run Locally
```bash
npm run dev
```
* **Frontend**: `http://localhost:5173`
* **Backend API**: `http://localhost:5001`

### 3. (Optional) Configure PayPal Sandbox Credentials
Create a `.env` file in the root or `server/` directory:
```env
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
```
*Note: If no credentials are provided, AegisPay runs in high-fidelity Sandbox Simulation mode so judges can evaluate all flows instantly!*

---

## 🧪 Interactive Demo Walkthrough for Judges

1. **Explore the AG Grid Table**: Use the search bar or click filter chips (*Item Not Received*, *Unauthorized*, *PayPal Protected*).
2. **Simulate a Dispute Attack**: Click the **⚡ "Simulate Dispute Attack"** button in the top navigation bar to watch a new dispute event arrive live.
3. **Agent War Room**: Click the **"Agent War Room"** tab and press **"Deploy Swarm Investigation"** to watch Sentinel, Sherlock, Oracle, Lex, and Pax deliberate and stream reasoning in real time.
4. **Inspect Forensics**: Click **"Carrier GPS & Telemetry"** to view the handheld scanner ID, dropoff photo, and GPS fix.
5. **Syndicate Surveillance**: Click **"Oracle Syndicate Hunter"** to see freight-forwarder clusters.
6. **Submit Evidence to PayPal**: Click any dispute row in the AG Grid table, review the compiled rebuttal letter, and click **"Submit Evidence to PayPal API"** to celebrate retained revenue!

---

## 📜 License
This project is open-source under the [MIT License](LICENSE).
