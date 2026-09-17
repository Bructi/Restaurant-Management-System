# 🍽️ RestoFlow OS — Autonomous AI Restaurant Operating System & POS Hub

```text
██████╗ ███████╗███████╗████████╗ ██████╗ ███████╗██╗      ██████╗ ██╗    ██╗
██╔══██╗██╔════╝██╔════╝╚══██╔══╝██╔═══██╗██╔════╝██║     ██╔═══██╗██║    ██║
██████╔╝█████╗  ███████╗   ██║   ██║   ██║█████╗  ██║     ██║   ██║██║ █╗ ██║
██╔══██╗██╔══╝  ╚════██║   ██║   ██║   ██║██╔══╝  ██║     ██║   ██║██║███╗██║
██║  ██║███████╗███████║   ██║   ╚██████╔╝██║     ███████╗╚██████╔╝╚███╔███╔╝
╚═╝  ╚═╝╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ 
          ⚡ AUTONOMOUS AI SUPPLY ENGINE • RECHARTS BI • LEAFLET GPS ⚡
```

<div align="center">

[![n8n Workflow Engine](https://img.shields.io/badge/AI_Engine-n8n%20Workflows%20(v2.39)-EA580C?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n.io)
[![InsForge Backend](https://img.shields.io/badge/Backend-InsForge%20BaaS%20(PostgreSQL)-f97316?style=for-the-badge&logo=postgresql&logoColor=white)](https://insforge.dev)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Recharts](https://img.shields.io/badge/Charts-Recharts%20Interactive-22C55E?style=for-the-badge&logo=recharts&logoColor=white)](https://recharts.org)
[![Leaflet Maps](https://img.shields.io/badge/Maps-Leaflet%20GPS%20Radar-16A34A?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![WebSockets](https://img.shields.io/badge/Realtime-WebSocket%20Sync-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![Thermal Printing](https://img.shields.io/badge/Printing-80mm%20ESC%2FPOS-10B981?style=for-the-badge&logo=print&logoColor=white)](#)

</div>

---

## 🌟 Executive Overview

**RestoFlow** is an autonomous, high-velocity enterprise restaurant operating system designed for modern multi-station kitchens, busy dining rooms, online delivery fleets, and F&B hospitality groups.

Powered by **n8n AI Microservices**, **InsForge PostgreSQL**, **Recharts Visual Analytics**, **Leaflet Real-Time Maps**, and **WebSocket synchronization**, RestoFlow eliminates human friction across every operational boundary:

1. **Guest Self-Service & VIP Portal**: Interactive digital menus, table QR orders, and VIP AI concierge reservations.
2. **Staff Station & KDS Engine**: Multi-lane kitchen display, live timers, station routing, and fast till settlement.
3. **Autonomous AI Supply Chain**: Automatic ingredient deduction on order placement and automated n8n supplier Purchase Order (PO) dispatch.
4. **Executive Business Intelligence**: Recharts hourly curves, BCG dish profitability matrix, and GSTR-1 tax compliance.

---

## 🏛️ System Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       RESTOFLOW WEB CLIENT                                       │
│   [ Landing Page ] ──► [ Customer Portal ] ──► [ Staff POS / KDS ] ──► [ Admin Operations Hub ]  │
└───────────────────────────────────┬──────────────────────────────────────────────────────────────┘
                                    │ HTTP / WebSocket (ws://)
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  EXPRESS 5 API GATEWAY (Port 5000)                               │
│  • Fast Order Router & Ingredient Deductor     • Floor Table Dispatch (Grid / Ledger / Columns)  │
│  • WebSocket Hub (Broadcasts to all screens)   • Live Simulation Engine & Open-Meteo Weather API │
└───────────────────┬──────────────────────────────────────────────┬───────────────────────────────┘
                    │                                              │ Webhooks / API
                    ▼                                              ▼
┌──────────────────────────────────────┐        ┌──────────────────────────────────────────────────┐
│       INSFORGE BaaS (PostgreSQL)     │        │          n8n AI WORKFLOW ORCHESTRATOR            │
│  📦 10 Cloud Tables (Orders, KDS, ..) │        │  ⚡ 1. Autonomous AI Supplier PO Replenishment   │
│  🪣 Storage Buckets (Assets, Uploads)│        │  ⚡ 2. VIP Hospitality AI Concierge              │
│  🔐 PKCE Authentication & Roles      │        │  ⚡ 3. POS Kitchen Station Routing               │
└──────────────────────────────────────┘        │  ⚡ 4. Executive AI Daily Shift Briefing         │
                                                │  ⚡ 5. BCG Menu Matrix & Pricing Optimizer       │
                                                └──────────────────────────────────────────────────┘
```

---

## 🚀 Key Modules & Capabilities

### 1. 👤 Customer Dining Portal (`CustomerPortalView.tsx`)
- **Interactive Digital Menu**: Real-time dishes loaded from backend with pure veg / non-veg toggles, category selectors, and custom cooking instructions.
- **Dine-In Table & Delivery Ordering**: Order at Table (T-01 to T-24), Takeaway Counter, or Direct Delivery with `SPICE10` 10% coupon applicator.
- **VIP Table Reservation Concierge**: Book tables with party size, occasion, and seating zones. Triggers n8n VIP AI to calculate tiers and assign complimentary chef tasting starters.
- **Live 4-Step Kitchen Tracker & Delivery Map**: Real-time progress (`1. Placed` ➔ `2. Cooking` ➔ `3. Ready` ➔ `4. Served`) with Leaflet driver GPS tracking.
- **VIP Loyalty Pass**: Member ID, loyalty points balance, and printable receipt invoices.

### 2. 👨🍳 Staff Station & Kitchen KDS (`KitchenDisplayView.tsx`, `PosTerminalView.tsx`)
- **High-Velocity POS Terminal**: Sub-second order entry, modifier selector, split payment, and 80mm ESC/POS thermal printing.
- **Multi-Lane Kitchen Display (KDS)**: Strike-through item checkboxes, 30s elapsed prep timers with >18m rush alerts, and 1-tap ticket bumping.
- **Floor Plan Manager**: 3 interactive view modes:
  1. `Grid`: Interactive visual canvas with table shapes, seat indicators, and status rings.
  2. `Column Ledger`: Sortable master table with current bill, occupant, server, and quick transfer/seat actions.
  3. `Sections Kanban`: Swimlane view across Main Hall, Outdoor Patio, VIP Cabana, and Bar Lounge.

### 3. 📦 Autonomous AI Supply Chain (`server/services/n8n.ts`)
- **Continuous Ingredient Deduction**: Every placed order automatically deducts exact ingredient recipes (Paneer, Poultry, Basmati Rice, Butter, Spices, Ghee).
- **Automated Deficit Detection & PO Dispatch**: When stock hits reorder levels, n8n `restoflow-auto-supply` autonomously triggers:
  - Generates itemized Purchase Orders categorized across vendors (*Heritage Dairy, Apex Poultry, Royal Basmati, Malabar Spices*).
  - Updates the active inventory and broadcasts `INVENTORY_AUTOSUPPLY_COMPLETED` over WebSockets.
- **3-Tab Inventory Hub**: Live Ingredients Ledger, n8n Purchase Orders Ledger, and Certified Supplier Network.

### 4. 📊 Recharts Business Intelligence (`ReportsAnalyticsView.tsx`)
- **Hourly Revenue Area Curve**: Smooth gradient curve highlighting peak dinner rush windows (8:00 PM – 10:00 PM).
- **Sales Channel Share Donut**: Proportional breakdown of Dine-In (64%), Takeaway (22%), and Delivery (14%).
- **Dish Profitability Bar Chart**: Revenue vs COGS ingredient costs per top-selling menu item.
- **GSTR-1 & Tax Compliance**: Automatic calculation of Taxable Turnover, CGST, SGST, ITC, Net Tax, CSV export, and GSTR-1 JSON package download.

### 5. 🗺️ Leaflet Live Delivery Fleet & Geo-Radar (`LiveDeliveryMap.tsx`)
- Interactive OpenStreetMap layer with dark-mode CartoDB tiles.
- Pins for Restaurant Hub (#01 MG Road), active delivery drivers (Ramesh, Suresh, Vikas), and customer destinations (Koramangala, Indiranagar, Lavelle Road).
- Live dashed route polylines, 3km/6km/9km delivery radius rings, and interactive driver popups.

---

## 🎬 Step-by-Step Self-Demonstration Script

Follow this script to demonstrate the full power of RestoFlow end-to-end:

### Step 1: Launch the Application
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### Step 2: Test the Customer Experience (Place Table Order)
1. On the Landing Page, click **👤 Customer Dining Portal** (or switch to `👤 Guest` from the left sidebar).
2. Browse the **Digital Menu**, select **🟢 Pure Veg**, and click **Add Dish** for *Paneer Tikka* and *Garlic Naan*.
3. In the Food Cart on the right, select **Table T-12 (Main)** and verify the `SPICE10` 10% coupon discount.
4. Click **⚡ Place Order & Pay (₹473)**.
5. The UI immediately switches to **🚀 My Active Orders** showing the live 4-step progress tracker!

### Step 3: Test Staff / Kitchen KDS (Live Ticket Bump)
1. In the left sidebar top switcher, click **👨🍳 Staff** (or open **Kitchen (KDS)**).
2. Observe the new order arrive in real-time under `#KOT` for Table T-12!
3. Click the checkbox next to *Paneer Tikka* to mark it prepared (strikethrough).
4. Click **Bump Ready** to expedite the ticket to the floor.

### Step 4: Test Autonomous Supply Chain (n8n AI Auto-Restock)
1. In the sidebar, click **👑 Admin** ➔ Navigate to **Inventory & Supply**.
2. Notice that *Paneer* and *Butter* stock were automatically decremented from the customer's order.
3. Click the **⚡ n8n AI Auto-Restock** button at the top right.
4. Watch n8n execute the supply pipeline in ~200ms, generate official Purchase Orders (*Heritage Dairy, Royal Basmati*), and instantly replenish the inventory!
5. Switch to the **n8n Purchase Orders Ledger** tab to inspect the generated PO numbers and supplier contacts.

### Step 5: Test Floor Tables View Switcher
1. In the sidebar, click **Tables**.
2. Near the **Refresh** button at the top right, click:
   - `Grid`: Visual floor plan with seats and status rings.
   - `Column Ledger`: Sortable tabular ledger with table numbers, guest names, running bills, and quick transfer buttons.
   - `Sections`: 4-column swimlane view (Main Hall, Patio, VIP, Bar).

### Step 6: Test Recharts & Leaflet Delivery Fleet Map
1. In the sidebar, click **Reports & Analytics**.
2. Scroll to view the interactive **Hourly Revenue Area Curve**, **Sales Channel Donut**, and **Dish Profitability Bar Chart** (hover over any point to see tooltips).
3. Click **⚡ n8n Executive AI Forecast** to generate an automated shift briefing.
4. Scroll to the **Leaflet Delivery Fleet Map** at the bottom to interact with live GPS driver pins and delivery zones.

---

## ⌨️ System Keyboard Shortcuts

| Shortcut | Action | Scope |
|---|---|---|
| `F1` | Quick Order Modal | Global |
| `⌘K` / `Ctrl+K` | Spotlight Search (Tables, Dishes, Orders, Guests) | Global |
| `Esc` | Dismiss any open modal / drawer | Global |
| `Enter` | Place & Send POS Order | POS View |

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **AI Workflows** | n8n Workflow Automation Engine (Port 5678) |
| **Frontend UI** | React 18, TypeScript, Tailwind CSS v3.4, Lucide React, Google Material Symbols |
| **Visual Charts** | Recharts (ResponsiveContainer, AreaChart, BarChart, PieChart) |
| **Interactive Maps** | Leaflet, OpenStreetMap, CartoDB Dark Matter Tiles |
| **State & Auth** | React Context (`AuthContext`, `ToastContext`), InsForge PKCE Auth |
| **Backend Service** | Node.js, Express 5, TypeScript (`tsx`), `ws` (WebSockets) |
| **Cloud BaaS** | [InsForge](https://insforge.dev) (`@insforge/sdk`, PostgreSQL) |
| **Build & Tooling** | Vite 6, PostCSS, Autoprefixer |

---

## 📄 License

Distributed under the **Apache-2.0 License**.

Built for **SpiceRoute Gourmet Hospitality LLP** • Powered by **n8n AI** & **InsForge BaaS**.
