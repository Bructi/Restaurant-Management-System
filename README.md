# 🍽️ RestoFlow OS — Enterprise Restaurant Management & POS Operating System

```text
██████╗ ███████╗███████╗████████╗ ██████╗ ███████╗██╗      ██████╗ ██╗    ██╗
██╔══██╗██╔════╝██╔════╝╚══██╔══╝██╔═══██╗██╔════╝██║     ██╔═══██╗██║    ██║
██████╔╝█████╗  ███████╗   ██║   ██║   ██║█████╗  ██║     ██║   ██║██║ █╗ ██║
██╔══██╗██╔══╝  ╚════██║   ██║   ██║   ██║██╔══╝  ██║     ██║   ██║██║███╗██║
██║  ██║███████╗███████║   ██║   ╚██████╔╝██║     ███████╗╚██████╔╝╚███╔███╔╝
╚═╝  ╚═╝╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ 
                   ⚡ HIGH-VELOCITY CLOUD POS & KITCHEN OS ⚡
```

<div align="center">

[![InsForge Backend](https://img.shields.io/badge/Backend-InsForge%20BaaS%20(PostgreSQL)-f97316?style=for-the-badge&logo=postgresql&logoColor=white)](https://insforge.dev)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Build-Vite%206-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![WebSockets](https://img.shields.io/badge/Realtime-WebSocket%20Sync-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![Thermal Printing](https://img.shields.io/badge/Printing-80mm%20ESC%2FPOS-10B981?style=for-the-badge&logo=print&logoColor=white)](#)

</div>

---

## 🌟 Overview

**RestoFlow** is an enterprise-grade, high-velocity restaurant management operating system designed for modern dining rooms, fast-casual counters, multi-station kitchens, and cloud delivery operations.

Powered by **InsForge BaaS (PostgreSQL)**, **WebSockets**, and **React 18**, RestoFlow eliminates operational bottlenecks by bridging front-of-house ordering with back-of-house kitchen displays, live floor plans, recipe costing, dynamic revenue telemetry, and Indian GST tax compliance.

---

## 🚀 Live System Architecture

```text
  ┌────────────────────────────────────────────────────────────────────────┐
  │                         RESTOFLOW FRONTEND                             │
  │   [ Landing Page ] ───► [ POS ] ───► [ KDS ] ───► [ Tables & Floor ]   │
  │   [ Inventory ]    ───► [ CRM ] ───► [ GST Reports ] ───► [ Settings ] │
  └──────────────────┬─────────────────────────────────┬───────────────────┘
                     │                                 │
                     │ HTTP / REST                     │ WebSockets (ws://)
                     ▼                                 ▼
  ┌──────────────────────────────────┐  ┌──────────────────────────────────┐
  │      EXPRESS API GATEWAY         │  │     WEBSOCKET REALTIME HUB       │
  │  • Orders & KOT Router           │  │  • Broadcast ORDER_CREATED       │
  │  • Table Dispatch Engine         │  │  • Sync TABLE_UPDATED            │
  │  • Dynamic Telemetry & Analytics │  │  • Push KDS_TICKET_BUMPED        │
  └──────────────────┬───────────────┘  └──────────────────────────────────┘
                     │
                     │ @insforge/sdk (Admin & Client)
                     ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                      INSFORGE CLOUD PLATFORM                           │
  │   📦 PostgreSQL Database (orders, kds_tickets, menu_items, tables, ..) │
  │   🪣 Cloud Storage Buckets (restoflow, uploads)                        │
  │   🔐 Google & GitHub OAuth + PKCE Passwordless Authentication          │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Subsystems & Real Features

### 1. 🌐 Standalone Inbuilt Landing Page
* **Inbuilt Entry Experience**: The application starts on a standalone, high-converting Landing Page featuring the value proposition, dynamic InsForge status, and instant app launchers.
* **Interactive Live Demo Dispatcher**: Visitors can type a guest name and dispatch a live test order directly into the InsForge PostgreSQL database and kitchen queue.
* **Integrated Authentication CTA**: One-click **Continue with Google**, **Staff PIN**, or **Owner Sign In** directly from the hero header.

### 2. ⚡ High-Velocity Touch POS Terminal
* **Sub-Second Ordering**: Touch-optimized menu grid with instant dietary filters (`Veg`, `Non-Veg`), category selector, and live search.
* **Live Modifier Engine**: Attach cooking instructions (*"Extra Spicy"*, *"No Peanuts"*, *"Mint Dip"*) per item.
* **Smart Bill Breakdown**: Automatic CGST (2.5%), SGST (2.5%), Service Charge (5%), rounding, and promo coupon discounts (`SPICE10`).
* **Instant KOT Dispatch**: Single click / `Enter` sends order to kitchen display system and prints thermal ticket.

### 3. 🔥 Kitchen Display System (KDS)
* **Intelligent Station Auto-Routing**: Orders split into specific kitchen prep stations (**Tandoor**, **Curry**, **Bar**, **Pantry**).
* **Urgency Timers & Color Warnings**: Live elapsed minutes indicators with alert highlights for delayed tickets.
* **Allergy Badges**: Prominent visual warnings for guest dietary restrictions.
* **One-Tap Ticket Bumping**: Mark line items or entire tickets as ready, automatically updating parent orders and floor status.

### 4. 🍽️ Interactive Table & Floor Plan Management
* **Multi-Section Floor Plan**: Visual status grid for **Main Dining**, **Patio Terrace**, **VIP Lounge**, and **Bar Counter**.
* **Table Turnover Tracking**: Live seated duration counters, server assignments, and active guest counts.
* **Party Merge & Table Transfer**: Merge adjacent tables for large parties or transfer party tickets to another table with real-time database sync.

### 5. 📊 Real-Time Dynamic Analytics & Hourly Revenue Flow
* **Live Scaled Revenue Chart**: Scaled SVG bezier curves and area gradients that compute dynamically based on live database transactions.
* **Peak Hour Detection**: Dynamic annotation tracking the current peak hour and orders volume.
* **Sales Channel Breakdown**: Live proportional revenue split across **Dine-In Tables**, **Counter Takeaway**, and **Swiggy/Zomato Aggregators**.

### 6. 📜 Financial Intelligence & GST Tax Ledger
* **GSTR-3B Tax Summary**: Automatic calculation of Taxable F&B Turnover, Central GST (2.5%), State GST (2.5%), Input Tax Credit (ITC), and Net Tax Payable.
* **Real CSV Export**: Generates and downloads `restoflow-financial-ledger.csv` with full transactional order data.
* **Real GSTR-1 JSON Package**: Downloads GST portal-compliant `gstr1-tax-package.json`.
* **Printable Tax Invoice Report**: Formatted tax certificate for audit printing and PDF generation.

### 7. 🏷️ Menu & Recipe Engineering
* **BCG Profitability Matrix**: Classifies items into **Star**, **Plowhorse**, **Puzzle**, and **Dog** tiers.
* **Costing Guardrails**: Food cost percentage and gross margin calculations per recipe.
* **Bulk 86 Manager**: 1-click out-of-stock switches that immediately sync across terminals.
* **Price List CSV & Table QR Print**: Exports `restoflow-menu-price-list.csv` and prints table QR codes.

### 8. 📦 Real-Time Cloud Inventory & Waste Control
* **Auto-Deduction**: Deducts raw ingredients (paneer, chicken, rice, butter) upon order placement.
* **Stock Health Tracking**: Categorized as `Optimal`, `Low Stock`, or `Critical`.
* **Automated Purchase Orders (PO)**: Generates and downloads `purchase-order-[PO#].json` for low-stock items.
* **Kitchen Waste Ledger**: Logs damaged, overcooked, or expired items with associated financial loss.

### 9. 👥 Customer Intelligence & CRM Loyalty
* **Guest Profiles & Lifetime Value**: Tracks total visits, lifetime dining spend, and loyalty points.
* **VIP Tiers**: Standard, Silver, Gold, and Platinum tiers with dietary preference tags.
* **CSV Export**: Downloads `restoflow-customer-crm.csv`.

### 10. 🖨️ 80mm ESC/POS Thermal Receipt Printing
* Built-in 80mm thermal receipt generator for POS checkout, kitchen KOTs, bill reprints, and Daily Z-Reports.
* Clean monospace layout with store header, legal GSTIN/FSSAI, itemized charges, and payment mode.

### 11. 🔐 InsForge Authentication & Staff Security
* **Google OAuth & GitHub OAuth**: Social sign-in via InsForge PKCE flows.
* **Email & Password Authentication**: Role-based access for General Managers (`L4`), Supervisors (`L3`), and Cashiers (`L2`).
* **Fast 4-Digit Staff PIN Switcher**: Instant POS keypad login (`1234` for Manager, `3456` for Captain, `4567` for Cashier).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend UI** | React 18, TypeScript, Tailwind CSS v3.4, Lucide React, Google Material Symbols |
| **State & Hooks** | React Context (`AuthContext`, `ToastContext`), Custom Realtime Hooks |
| **Backend Service** | Node.js, Express 5, TypeScript (`tsx`), `ws` (WebSockets) |
| **Cloud BaaS** | [InsForge](https://insforge.dev) (`@insforge/sdk`, `@insforge/cli`) |
| **Database** | InsForge PostgreSQL (Cloud Hosted, Region: `ap-southeast`) |
| **Storage** | InsForge Cloud Storage (`restoflow`, `uploads` buckets) |
| **Build & Tooling** | Vite 6, PostCSS, Autoprefixer |

---

## 📂 PostgreSQL Schema on InsForge

The application persists data to 10 PostgreSQL tables managed via InsForge migrations:

```sql
orders         -- Live POS and delivery orders with line_items JSONB
kds_tickets    -- Kitchen Display System tickets with station routing
menu_items     -- Catalog pricing, recipe costs, BCG tiers, stock status
floor_tables   -- 24 dining tables across Main, Patio, VIP, Bar
reservations   -- Guest bookings, VIP statuses, notes, and deposit amounts
inventory      -- Raw ingredients stock, par levels, unit cost, valuation
waste_logs     -- Kitchen shift wastage and reason logs
customers      -- CRM loyalty database, lifetime spend, dietary tags
staff          -- Staff roster, assigned station, and encrypted PIN levels
settings       -- Legal entity GSTIN, FSSAI, tax slabs, peripheral devices
```

---

## ⌨️ System Keyboard Shortcuts

| Shortcut | Action | Scope |
|---|---|---|
| `F1` | Quick Order Modal | Global |
| `⌘K` / `Ctrl+K` | Global Spotlight Search | Global |
| `Esc` | Dismiss any open modal / drawer | Global |
| `Enter` | Place & Send POS Order | POS View |

---

## 📦 Getting Started & Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/restoflow.git
cd restoflow
npm install
```

### 2. Environment Variables Setup
Create `.env` and `.env.local` in the project root:

```env
# InsForge Cloud Configuration
VITE_INSFORGE_URL=https://your-project.region.insforge.app
VITE_INSFORGE_ANON_KEY=your_insforge_anon_key
INSFORGE_URL=https://your-project.region.insforge.app
INSFORGE_ANON_KEY=your_insforge_anon_key
INSFORGE_API_KEY=your_insforge_admin_api_key
INSFORGE_PROJECT_ID=your_project_id
PORT=5000
```

### 3. Link InsForge Backend & Run Migrations
```bash
# Link to project
npx -y @insforge/cli link --project-id <your-project-id>

# Apply database migrations
npx -y @insforge/cli db migrations up --all
```

### 4. Start Development Environment
```bash
# Runs backend Express API (Port 5000) and frontend Vite server concurrently
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs backend server and frontend client concurrently with colored prefixes |
| `npm run server` | Starts Express backend and WebSocket sync engine |
| `npm run client` | Starts Vite development frontend server |
| `npm run build` | Compiles TypeScript and builds production distribution in `dist/` |
| `npm run preview` | Previews the production build locally |

---

## 📄 License & Attribution

Distributed under the **Apache-2.0 License**.

Built for **SpiceRoute Gourmet Hospitality LLP** & powered by **InsForge BaaS**.
