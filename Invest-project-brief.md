# Invest — Investment Research Tracker

## Project Brief for Claude Code

### Overview
Build a personal investment research tracker inspired by Buffett/Munger's philosophy of deep company research through reading annual reports and 10-Ks. The app helps a value investor record thoughts, valuations, price targets, and portfolio holdings — all accessible from any device.

### Tech Stack
- **Frontend**: React (Vite for build)
- **Storage**: Firebase Firestore (cross-device sync)
- **Auth**: Firebase Auth (email/password or Google sign-in — keeps data private)
- **Hosting**: GitHub Pages
- **Styling**: Dark theme, professional fintech aesthetic

### Design Direction
- **Theme**: Dark background (#0b1120), gold/amber accent (#c8a44e), muted grays
- **Fonts**: Playfair Display (headings), DM Sans (body) — via Google Fonts
- **Tone**: Refined, data-focused, Bloomberg terminal meets modern fintech
- **Name**: "Invest" with ◆ diamond icon

### Features

#### 1. Dashboard
- Total companies tracked
- Portfolio value & total return
- Alert list: companies currently below their buy price
- Recent activity (last companies added/edited)

#### 2. Company Profiles & Notes
- **Fields**: Ticker, company name, sector (dropdown), competitive moats (multi-select tags)
- **Moat types**: Brand Power, Network Effects, Cost Advantages, Switching Costs, Intangible Assets, Efficient Scale, None Identified
- **Notes sections**: Management quality notes, key risks, general research notes (freeform text)
- **Table view**: Sortable/searchable list with ticker, name, sector, moats, buy target, current price, signal (BUY/HOLD/SELL)
- **CRUD**: Add, edit, delete companies via modal with tabs (Profile, Valuation, Targets, Notes)

#### 3. Valuation Calculator (per company)
- **DCF Model** with inputs:
  - Current Free Cash Flow ($M)
  - Growth Rate (%)
  - Discount Rate (%)
  - Terminal Growth Rate (%)
  - Projection Years
- Calculate button → computes intrinsic value
- Auto-populates buy/sell targets based on margin of safety
- Display estimated intrinsic value prominently

#### 4. Buy/Sell Price Targets (per company)
- Current market price (manual input)
- Intrinsic value (from valuation or manual override)
- Margin of safety % (default 30%)
- Auto-calculated buy price = intrinsic × (1 - margin of safety)
- Sell price (manual or auto at 1.2× intrinsic)
- Visual signal: BUY (green) / HOLD (amber) / SELL (red) based on current vs targets

#### 5. Portfolio Tracker
- Add holdings: select company, shares, avg cost, current price
- Table: ticker, shares, avg cost, current price (editable), market value, P&L ($), return (%)
- Summary stats: total invested, market value, unrealized P&L
- Allocation bar showing portfolio weights by position
- Remove holdings

#### 6. Data Management
- Export all data as JSON backup file
- Import from JSON backup
- This is a safety net alongside Firebase

### Data Model (Firestore)

```
users/{userId}/companies/{companyId}
{
  ticker: string,
  name: string,
  sector: string,
  moats: string[],
  managementNotes: string,
  risks: string,
  generalNotes: string,
  valuation: {
    method: "dcf",
    currentFCF: number,
    growthRate: number,
    discountRate: number,
    terminalGrowth: number,
    yearsProjected: number,
    intrinsicValue: number | null
  },
  targets: {
    currentPrice: number,
    intrinsicValue: number,
    marginOfSafety: number,
    buyPrice: number,
    sellPrice: number
  },
  createdAt: timestamp,
  updatedAt: timestamp
}

users/{userId}/portfolio/{holdingId}
{
  companyId: string,
  shares: number,
  avgCost: number,
  currentPrice: number,
  addedAt: timestamp
}
```

### Firebase Setup Instructions for User
1. Go to https://console.firebase.google.com
2. Create new project (e.g., "value-ledger")
3. Enable Firestore Database (start in test mode, tighten rules later)
4. Enable Authentication → Email/Password (and optionally Google)
5. Go to Project Settings → Your Apps → Add Web App
6. Copy the firebaseConfig object
7. Paste into the app's firebase config file

### Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### GitHub Pages Deployment
- Use Vite with `base` set to repo name in vite.config.js
- Build output goes to `dist/`
- Use `gh-pages` npm package or GitHub Actions for deployment
- Add a deploy script: `"deploy": "vite build && gh-pages -d dist"`

### Project Structure (suggested)
```
value-ledger/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── firebase.js          # Firebase config & init
│   ├── hooks/
│   │   ├── useAuth.js       # Auth state management
│   │   └── useFirestore.js  # Firestore CRUD operations
│   ├── components/
│   │   ├── Layout.jsx       # Header, nav, footer
│   │   ├── Dashboard.jsx
│   │   ├── Companies.jsx
│   │   ├── CompanyModal.jsx
│   │   ├── Portfolio.jsx
│   │   └── DataManager.jsx
│   └── styles/
│       └── theme.js         # Color tokens, shared styles
└── README.md
```

### Working Prototype
A complete working prototype exists as a single React component (see prototype.jsx in this directory). It uses in-memory state but has all the UI, DCF calculator, and interactions working. Use it as a reference for the component logic and design — adapt it into the proper project structure with Firebase.

### Key UX Decisions Already Made
- Navigation: horizontal nav bar in header (Dashboard | Companies | Portfolio | Backup)
- Companies: table view with inline signal badges, click to edit via modal
- Modal has tabs: Profile → Valuation → Targets → Notes
- DCF calc auto-fills buy/sell targets when you calculate intrinsic value
- Portfolio: inline editable current price field in the table
- Color coding: green = buy/gain, gold = hold, red = sell/loss
- Margin of safety default: 30% (Buffett style)
