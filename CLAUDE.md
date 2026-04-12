# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Value Ledger** — a personal investment research tracker for value investors, inspired by Buffett/Munger philosophy. Tracks company research, DCF valuations, price targets, and portfolio holdings.

## Current State

This is a **pre-scaffold prototype**. No `package.json` or build tooling exists yet. The repo contains:

- `investment-tracker.jsx` — Complete working prototype (single React component, ~800 lines) with all UI, DCF calculator, and interactions using in-memory state via `useStorage()` hook
- `value-ledger-project-brief.md` — Full project specification including data model, Firebase setup, suggested project structure, and deployment plan

## Planned Tech Stack

- **Frontend**: React 18 + Vite 5
- **Storage**: Firebase Firestore (cross-device sync)
- **Auth**: Firebase Auth (email/password + Google)
- **Hosting**: GitHub Pages (`gh-pages` package)
- **Styling**: Inline CSS-in-JS via centralized `S` object and `COLORS` constants

## Architecture Notes

**The prototype is the source of truth for UI behavior.** When building the full app, adapt from `investment-tracker.jsx` rather than reimplementing. Key patterns:

- Navigation: horizontal nav bar with 4 views (Dashboard, Companies, Portfolio, Backup)
- Company editing: modal with tabbed interface (Profile → Valuation → Targets → Notes)
- DCF calculation auto-populates buy/sell targets when intrinsic value is computed
- Signal logic: BUY (price < buyPrice), SELL (price > sellPrice), HOLD (between)
- Margin of safety default: 30%
- Portfolio current price is inline-editable in the table

**Data model** lives in the project brief under "Data Model (Firestore)" — two collections: `companies` and `portfolio`, nested under `users/{userId}/`.

## Design Tokens

Dark theme with gold accents. Key colors defined in `COLORS` object at top of prototype:
- Background: `#0b1120`, Surface: `#111827`
- Gold accent: `#c8a44e`, Green (buy/gain): `#34d399`, Red (sell/loss): `#f87171`
- Fonts: Playfair Display (headings), DM Sans (body)

## When Scaffolding the Full Project

Follow the suggested structure in `value-ledger-project-brief.md`. Key decisions already made:
- Vite config needs `base` set to repo name for GitHub Pages
- Deploy script: `"deploy": "vite build && gh-pages -d dist"`
- Firebase config goes in `src/firebase.js`
- Custom hooks: `useAuth.js` (auth state), `useFirestore.js` (CRUD operations)
- Firestore security rules are specified in the project brief
