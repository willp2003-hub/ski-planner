# Pray for Snow ⛷️

A social ski trip planning app for Northeast US resorts. Log ski days, explore mountains, check live snow conditions, and share trips with the community.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-FFCA28?logo=firebase&logoColor=black)
![Leaflet](https://img.shields.io/badge/Leaflet-Map-199900?logo=leaflet&logoColor=white)

---

## Features

- **Interactive Map** — 56 Northeast ski resorts plotted on a Leaflet map, color-coded by pass type (Ikon / Epic / Independent) and sized by resort category
- **Live Snow Data** — Real-time 7-day snowfall forecasts and season-to-date totals from Open-Meteo, compared against 10-year historical averages
- **Drive Times** — Live drive time estimates from any NYC-area origin via the OSRM routing API
- **Mountain Directory** — Searchable, state-grouped list of all resorts with acreage, pass type, and trail info
- **Ski Day Logging** — Log ski days with resort, date, star ratings (overall, conditions, crowds, terrain), notes, and photos
- **Community Feed** — Browse ski day posts from all users; filter by resort, pass type, or rating
- **User Profiles** — Profile pages with stats (ski days, resorts visited, favorite mountain), a visited-resorts mini-map, and a personal ski day history
- **Google Auth** — Sign in with Google via Firebase Authentication

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 7 |
| Mapping | Leaflet / react-leaflet |
| Auth & Database | Firebase (Auth + Firestore + Storage) |
| Weather | [Open-Meteo API](https://open-meteo.com/) |
| Routing | [OSRM API](https://project-osrm.org/) |
| Map Tiles | CartoDB |
| Styling | Plain CSS |
| Linting | ESLint (flat config, React Hooks + React Refresh plugins) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with **Authentication** (Google provider), **Firestore**, and **Storage** enabled

### Installation

```bash
git clone https://github.com/willp2003-hub/ski-planner.git
cd ski-planner
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Find these values in your Firebase Console under **Project Settings → Your apps → SDK setup and configuration**.

> `.env` is gitignored and will never be committed.

### Running the App

```bash
npm run dev       # Dev server at http://127.0.0.1:5173
npm run build     # Production build → dist/
npm run preview   # Serve production build locally
npm run lint      # Run ESLint
```

---

## Project Structure

```
src/
├── components/
│   ├── FeedCard.jsx          # Individual post card (feed + profile)
│   ├── SkiDayCard.jsx        # Ski day card with edit/delete for owner
│   ├── SkiMap.jsx            # Leaflet map with custom SVG markers
│   ├── MountainPopup.jsx     # Bottom sheet with resort details
│   ├── NavBar.jsx            # Bottom navigation bar
│   ├── StarRating.jsx        # Interactive / read-only star rating
│   └── ...                   # DatePicker, ProfileForm, TripForm, etc.
├── pages/
│   ├── HomePage.jsx          # Map view with filters and live data
│   ├── MountainsPage.jsx     # Searchable mountain directory
│   ├── MountainInfoPage.jsx  # Individual resort detail page
│   ├── FeedPage.jsx          # Community feed with filters
│   ├── ProfilePage.jsx       # User profile, stats, and ski day history
│   ├── LogSkiDayPage.jsx     # Log a new ski day
│   └── LoginPage.jsx         # Google sign-in
├── data/
│   └── mountains.js          # Static dataset of 56 resorts
├── services/
│   ├── weather.js            # Open-Meteo API integration
│   └── driving.js            # OSRM driving time calculations
├── contexts/
│   └── AuthContext.jsx       # Firebase auth state provider
└── firebase.js               # Firebase app initialization
```

---

## Data Sources

| Data | Source | Notes |
|---|---|---|
| Resort info | `src/data/mountains.js` | Static — coordinates, pass type, acreage, trail counts, costs |
| Snowfall forecast | [Open-Meteo](https://open-meteo.com/) | Free, no API key required |
| Historical snow averages | [Open-Meteo Historical](https://open-meteo.com/) | Used to compute % of average |
| Drive times | [OSRM](https://project-osrm.org/) | Free, no API key; batched in groups of 5 with a 0.88 calibration factor |
| Map tiles | [CartoDB](https://carto.com/) | Free basemap tiles |

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

---

## License

MIT
