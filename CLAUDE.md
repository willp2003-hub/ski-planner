# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ski Planner is a React SPA for planning ski trips to Northeast US resorts. It displays 56 ski resorts on an interactive Leaflet map with real-time snowfall data (Open-Meteo API) and drive times from NYC (OSRM API).

## Commands

```bash
npm run dev       # Dev server at http://127.0.0.1:5173
npm run build     # Production build to dist/
npm run lint      # ESLint on .js/.jsx files
npm run preview   # Serve production build locally
```

No test framework is configured.

## Architecture

**Data flow:** `mountains.js` (static resort data) → API services fetch snowfall + drive times → `App.jsx` aggregates into state → child components render.

**Key files:**
- `src/App.jsx` — Main controller; fetches data on mount, manages state (selectedMountain, passFilter, mountainData)
- `src/components/SkiMap.jsx` — Leaflet MapContainer centered on Northeast US; custom SVG markers color-coded by pass type (Ikon/Epic/Independent), sized by resort category
- `src/components/MountainPopup.jsx` — Bottom sheet modal showing resort details (drive time, snowfall, costs, trails)
- `src/components/DatePicker.jsx` — Dual date range picker (lodging + skiing dates)
- `src/data/mountains.js` — Dataset of 56 resorts with coordinates, pass type, size, costs
- `src/services/weather.js` — Fetches 7-day forecast and season-to-date snowfall from Open-Meteo; calculates percentage vs 10-year historical average
- `src/services/driving.js` — Calculates drive times from Empire State Building via OSRM; applies 0.88 calibration factor; batches requests in groups of 5

**External APIs (all free, no auth):**
- Open-Meteo — Weather forecast and historical snow data
- OSRM — Driving route calculations
- CartoDB — Map tile basemaps

## Tech Stack

React 19 + Vite 7 + Leaflet/react-leaflet. Pure JavaScript (no TypeScript). ESLint flat config with React Hooks and React Refresh plugins.
