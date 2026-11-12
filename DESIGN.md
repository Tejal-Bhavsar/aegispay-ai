# AegisPay — Design System & Surface Specification (`DESIGN.md`)

## 1. Design Thesis & Anti-Slop Mandate
Every PayPal dispute is a forensic case file whose physical carrier proof, network telemetry, and legal rebuttal are tagged, sealed, and signed before dispatch. AegisPay refuses the generic dark-mode neon-cyan/purple glassmorphic SaaS template in favor of an authoritative **Chain of Custody & Forensic Exhibit Workbench**.

### Core Principles
1. **Deadline First**: The AG Grid queue is ordered by earliest statutory bank response deadline, with proportional urgency bars and day countdowns.
2. **Show the Evidence, Not the Vibe**: Every recommendation (`FIGHT_DISPUTE`, `SETTLE_GOODWILL`, `ESCALATE_FRAUD_RING`) is directly traceable to sealed carrier GPS coordinates, recipient signatures, device fingerprints, and 2FA logs. Zero fabricated vanity benchmarks.
3. **One Decision Per Case**: Inspect the exhibit chain, select the legal citation tone, and dispatch the `POST /v1/customer/disputes/{id}/provide-evidence` payload in one decisive action.
4. **Honest About Simulation**: The execution mode (`Sandbox Simulation` vs `PayPal Live Sandbox`) is persistently visible in the command rail.

---

## 2. Color & Materiality System

| Token / Role | Hex | Usage |
| :--- | :--- | :--- |
| `--rail-bg` | `#0F1D35` | Fixed `248px` Institutional Navy left command rail |
| `--rail-bg-elevated` | `#162847` | Command rail interactive cards & hover states |
| `--canvas-bg` | `#F4F3EF` | Warm archival stone main workspace background |
| `--paper-bg` | `#FFFFFF` | Crisp paper surfaces for AG Grid rows, dossiers, and panels |
| `--paper-subtle` | `#FAF9F5` | Secondary ledger headers and recessed alternating rows |
| `--hairline` | `#D8D6CE` | Structural `1px` borders separating ledger cells and drawers |
| `--manila-bg` | `#FBF6E9` | Forensic Manila Exhibit tag & card ground (reserved strictly for verified evidence) |
| `--manila-border` | `#DFC99B` | Manila exhibit tag border |
| `--manila-stamp` | `#8A5A00` | Manila exhibit ink stamp text (`EXHIBIT A`, `VISA CE 3.0`, `GPS ±2.4m`) |
| `--paypal-blue` | `#005EA6` | PayPal Institutional Blue for primary actions and active indicators |
| `--crimson` | `#B3261E` | Statutory deadlines, chargeback fee exposure, and fraud ring alerts |
| `--forest` | `#166534` | PayPal Seller Protection seals and defended/dispatched confirmation |

---

## 3. Typography
- **Structural UI & Headings (`--font-sans`)**: `Geist` (`400`, `500`, `600`, `700`) with tight `-0.02em` heading tracking.
- **Tabular Ledger & Forensics (`--font-mono`)**: `Geist Mono` with `font-variant-numeric: tabular-nums` applied to all Dispute IDs (`PP-D-94821`), Order IDs (`ORD-94821`), dollar amounts (`$489.00`), GPS coordinates (`30.2672, -97.7431`), IP addresses (`70.112.44.89`), timestamps, and JSON payloads.

---

## 4. Layout Architecture
1. **Fixed `248px` Institutional Navy Command Rail**: Houses brand identity, workspace view switcher with live tabular counts, the 5-agent pipeline status roster (`Sentinel`, `Sherlock`, `Oracle`, `Lex`, `Pax`), and the PayPal Sandbox status trigger.
2. **Top Operational Ledger Bar**: Computes real-time metrics directly from the active dispute queue (Open Disputed Exposure + `$15` fee risk, Earliest Statutory Deadline, Seller Protection Eligible Volume, Defended Volume) alongside the `Simulate Dispute Attack` and `Batch Defend` triggers.
3. **Split-Pane Dispute Operations Workbench**: Pairs the AG Grid Dispute Queue on the left with a sticky `440px` **Case Exhibit & Rebuttal Inspector Drawer** on the right, allowing the analyst to stream the 5-agent SSE investigation, inspect Manila Exhibits A/B/C, review the Visa CE 3.0 rebuttal brief or JSON payload, and dispatch to PayPal without leaving the queue.
