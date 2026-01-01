# MapJitsu Implementation Plan

## Executive Summary

This plan transforms the ESARS v2 specification into a phased, executable roadmap. The implementation prioritizes **vertical slices** - delivering end-to-end functionality in each phase rather than building layers horizontally.

---

## Phase 0: Foundation & Infrastructure

### 0.1 Project Scaffolding
- [ ] Initialize Next.js 14 project with App Router
- [ ] Configure TypeScript with strict mode
- [ ] Set up Tailwind CSS with custom cyberpunk color palette
- [ ] Configure ESLint + Prettier
- [ ] Initialize Git repository with conventional commits

### 0.2 Environment & Secrets
- [ ] Create Mapbox account and obtain API tokens
  - Web token (URL-restricted)
  - Server-side token (secret scopes)
- [ ] Set up OpenRouter account for LLM access
- [ ] Create Supabase project (PostgreSQL + pgvector)
- [ ] Configure environment variables structure:
  ```
  NEXT_PUBLIC_MAPBOX_TOKEN=     # Client-side (restricted)
  MAPBOX_SECRET_TOKEN=          # Server-side only
  OPENROUTER_API_KEY=
  SUPABASE_URL=
  SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_KEY=
  ```

### 0.3 Core Dependencies
```bash
# Map Engine
npm install mapbox-gl @mapbox/mapbox-gl-geocoder

# Search
npm install @mapbox/search-js-react @mapbox/search-js-core

# AI Stack
npm install ai openai  # Vercel AI SDK

# Backend
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next
npm install @supabase/supabase-js

# Utilities
npm install zustand zod date-fns
```

### 0.4 Project Structure
```
mapjitsu/
├── app/
│   ├── (auth)/
│   ├── (map)/
│   │   ├── page.tsx           # Main map view
│   │   ├── explore/page.tsx   # Explorer mode
│   │   └── navigate/page.tsx  # Navigation mode
│   ├── api/
│   │   ├── map/
│   │   │   ├── token/route.ts
│   │   │   └── matrix/route.ts
│   │   ├── ai/
│   │   │   └── context/route.ts
│   │   └── trpc/[trpc]/route.ts
│   └── layout.tsx
├── components/
│   ├── map/
│   │   ├── MapContainer.tsx
│   │   ├── MapControls.tsx
│   │   ├── LayerToggle.tsx
│   │   └── CameraController.tsx
│   ├── ai/
│   │   ├── JitsuChat.tsx
│   │   ├── VibeCheck.tsx
│   │   └── POIInsight.tsx
│   ├── navigation/
│   │   ├── RoutePanel.tsx
│   │   ├── TurnByTurn.tsx
│   │   └── IsochroneOverlay.tsx
│   └── ui/
│       └── ... (shadcn/ui components)
├── lib/
│   ├── mapbox/
│   │   ├── client.ts
│   │   ├── styles.ts
│   │   └── layers.ts
│   ├── ai/
│   │   ├── prompts.ts
│   │   └── context-builder.ts
│   ├── supabase/
│   │   └── client.ts
│   └── trpc/
│       ├── client.ts
│       ├── server.ts
│       └── routers/
├── hooks/
│   ├── useMap.ts
│   ├── useGeolocation.ts
│   ├── useRoute.ts
│   └── useVibeCheck.ts
├── stores/
│   ├── mapStore.ts
│   ├── navigationStore.ts
│   └── aiStore.ts
└── styles/
    └── cyberpunk-theme.ts
```

**Deliverable:** Boilerplate project with all configs, running `npm run dev` shows placeholder map.

---

## Phase 1: The Immersive Map (FR-MAP-*)

### 1.1 Base Map with Cyberpunk Style
**Implements:** FR-MAP-01

```typescript
// lib/mapbox/styles.ts
export const MAPJITSU_STYLE = {
  version: 8,
  name: 'MapJitsu Cyberpunk',
  // Start with Mapbox Standard as base
  // Override in Mapbox Studio for custom styling
  sources: {},
  layers: []
};

// Custom color tokens
export const NEON_PALETTE = {
  primary: '#3b82f6',      // Electric blue (highways)
  secondary: '#f59e0b',    // Amber (POIs)
  accent: '#ec4899',       // Pink (selected routes)
  danger: '#ef4444',       // Red (congestion)
  success: '#22c55e',      // Green (safety corridors)
  water: '#0f172a',        // Deep navy (water bodies)
  background: '#020617',   // Near black (land)
  building: '#1e293b',     // Slate (buildings)
  text: '#f8fafc',         // White (labels)
};
```

**Tasks:**
- [ ] Create custom style in Mapbox Studio based on Standard
- [ ] Configure neon accent colors for road hierarchy
- [ ] Set up dark water bodies with subtle glow
- [ ] Configure label fonts (suggest: Inter or JetBrains Mono for cyberpunk feel)
- [ ] Export style and reference via `mapbox://styles/mapjitsu/...`

### 1.2 Dynamic Lighting System
**Implements:** FR-MAP-02

```typescript
// components/map/LightingController.tsx
const updateLighting = (map: mapboxgl.Map, hour: number) => {
  // Mapbox Standard Style supports setConfigProperty for lighting
  map.setConfigProperty('basemap', 'lightPreset', getLightPreset(hour));
};

const getLightPreset = (hour: number): 'dawn' | 'day' | 'dusk' | 'night' => {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
};
```

**Tasks:**
- [ ] Implement time-of-day detection (device time or user override)
- [ ] Create smooth lighting transitions
- [ ] Add "Golden Hour" mode toggle for manual override
- [ ] Configure shadow projection settings

### 1.3 Atmospheric Effects
**Implements:** FR-MAP-03

```typescript
// components/map/AtmosphereLayer.tsx
map.setFog({
  color: 'rgb(15, 23, 42)',         // Slate-900
  'high-color': 'rgb(30, 41, 59)',  // Slate-800
  'horizon-blend': 0.1,
  'space-color': 'rgb(2, 6, 23)',   // Slate-950
  'star-intensity': 0.6
});

map.setSky({
  'sky-type': 'atmosphere',
  'sky-atmosphere-sun': [0.0, 90.0],
  'sky-atmosphere-sun-intensity': 15
});
```

**Tasks:**
- [ ] Configure fog for depth perception
- [ ] Implement sky atmosphere with cyberpunk gradient
- [ ] Add star layer for night mode
- [ ] Create horizon glow effect

### 1.4 Animated Data Layers
**Implements:** FR-MAP-04

```typescript
// lib/mapbox/layers.ts
export const createPulsingLayer = (sourceId: string) => ({
  id: `${sourceId}-pulse`,
  type: 'circle',
  source: sourceId,
  paint: {
    'circle-radius': [
      'interpolate', ['linear'], ['get', 'intensity'],
      0, 4,
      1, 20
    ],
    'circle-color': '#ec4899',
    'circle-opacity': [
      'interpolate', ['linear'],
      ['%', ['*', ['get', 'timestamp'], 0.001], 2],
      0, 0.8,
      1, 0.2
    ]
  }
});
```

**Tasks:**
- [ ] Create nightlife activity heatmap layer
- [ ] Implement safety corridor visualization
- [ ] Add pulsing animation system using expressions
- [ ] Build layer toggle UI component

**Deliverable:** Fully styled, atmospheric 3D map with dynamic lighting.

---

## Phase 2: 3D & Navigation Experience (FR-NAV-*)

### 2.1 Camera System
**Implements:** FR-NAV-01

```typescript
// hooks/useCamera.ts
interface CameraMode {
  pitch: number;
  bearing: number;
  zoom: number;
  followUser: boolean;
}

export const CAMERA_MODES = {
  driver: { pitch: 60, bearing: 0, zoom: 17, followUser: true },
  explorer: { pitch: 45, bearing: 0, zoom: 15, followUser: false },
  overview: { pitch: 0, bearing: 0, zoom: 12, followUser: false },
};

// Free camera implementation
map.setFreeCameraOptions({
  position: mapboxgl.MercatorCoordinate.fromLngLat(
    { lng, lat },
    altitude
  ),
  orientation: [pitch, bearing, roll]
});
```

**Tasks:**
- [ ] Implement Driver Mode with heading-locked camera
- [ ] Implement Explorer Mode with gesture controls
- [ ] Create smooth camera transitions between modes
- [ ] Add pitch/bearing gestures for mobile

### 2.2 3D Terrain & Buildings
**Implements:** FR-NAV-02

```typescript
// components/map/TerrainLayer.tsx
map.addSource('mapbox-dem', {
  type: 'raster-dem',
  url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
  tileSize: 512,
  maxzoom: 14
});

map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

// 3D Buildings
map.addLayer({
  id: '3d-buildings',
  source: 'composite',
  'source-layer': 'building',
  type: 'fill-extrusion',
  minzoom: 15,
  paint: {
    'fill-extrusion-color': '#1e293b',
    'fill-extrusion-height': ['get', 'height'],
    'fill-extrusion-base': ['get', 'min_height'],
    'fill-extrusion-opacity': 0.9
  }
});
```

**Tasks:**
- [ ] Enable terrain with appropriate exaggeration
- [ ] Configure 3D building extrusions
- [ ] Add building edge highlighting for cyberpunk effect
- [ ] Implement occlusion culling for performance

### 2.3 Routing Engine
**Implements:** FR-NAV-03

```typescript
// app/api/map/directions/route.ts
export async function POST(req: Request) {
  const { origin, destination, profile } = await req.json();

  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/${profile}/` +
    `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
    `?geometries=geojson&steps=true&annotations=congestion,duration` +
    `&access_token=${process.env.MAPBOX_SECRET_TOKEN}`
  );

  return Response.json(await response.json());
}

// Route visualization with congestion coloring
const CONGESTION_COLORS = {
  low: '#22c55e',
  moderate: '#f59e0b',
  heavy: '#ef4444',
  severe: '#7f1d1d'
};
```

**Tasks:**
- [ ] Create server-side Directions API proxy
- [ ] Build route line layer with congestion colors
- [ ] Implement turn-by-turn instruction parser
- [ ] Add route alternatives selection
- [ ] Create maneuver icon system

### 2.4 Isochrone Visualization
**Implements:** FR-NAV-04

```typescript
// hooks/useIsochrone.ts
const fetchIsochrone = async (center: LngLat, minutes: number[]) => {
  const response = await fetch(
    `/api/map/isochrone?` +
    `lng=${center.lng}&lat=${center.lat}&` +
    `contours_minutes=${minutes.join(',')}`
  );
  return response.json();
};

// Gradient fill for walkability zones
map.addLayer({
  id: 'isochrone-fill',
  type: 'fill',
  source: 'isochrone',
  paint: {
    'fill-color': [
      'interpolate', ['linear'], ['get', 'contour'],
      5, '#22c55e',
      10, '#3b82f6',
      15, '#8b5cf6'
    ],
    'fill-opacity': 0.3
  }
});
```

**Tasks:**
- [ ] Create Isochrone API proxy
- [ ] Build walkability zone visualization
- [ ] Add "Show bars within X minutes" feature
- [ ] Implement isochrone animation (expanding rings)

**Deliverable:** Full 3D navigation with routing, camera modes, and reachability zones.

---

## Phase 3: Jitsu AI Co-Pilot (FR-AI-*)

### 3.1 Context Engine
**Implements:** FR-AI-01

```typescript
// lib/ai/context-builder.ts
interface LocationContext {
  coordinates: { lat: number; lng: number };
  neighborhood: string;
  city: string;
  nearbyPOIs: POI[];
  walkabilityScore: number;
  safetyIndex: number;
  timeContext: 'morning' | 'afternoon' | 'evening' | 'night';
}

export async function buildContext(lat: number, lng: number): Promise<LocationContext> {
  const [geocode, isochrone, pois] = await Promise.all([
    reverseGeocode(lat, lng),
    fetchIsochrone({ lat, lng }, [5]),
    searchNearbyPOIs(lat, lng, 500)
  ]);

  return {
    coordinates: { lat, lng },
    neighborhood: geocode.features[0]?.context?.neighborhood?.name,
    city: geocode.features[0]?.context?.place?.name,
    nearbyPOIs: pois.slice(0, 10),
    walkabilityScore: calculateWalkability(isochrone),
    safetyIndex: await getSafetyScore(lat, lng),
    timeContext: getTimeContext()
  };
}
```

**Tasks:**
- [ ] Implement reverse geocoding integration
- [ ] Build context aggregation pipeline
- [ ] Create neighborhood/area classification
- [ ] Add time-of-day context awareness

### 3.2 Vibe Check Feature
**Implements:** FR-AI-01, FR-AI-02

```typescript
// lib/ai/prompts.ts
export const VIBE_CHECK_PROMPT = `You are Jitsu, an AI navigation companion with a cyberpunk personality.
You help users understand the "vibe" of locations - not just facts, but the feel.

Context about current location:
- Neighborhood: {neighborhood}
- Time: {timeContext}
- Nearby spots: {nearbyPOIs}
- Walkability: {walkabilityScore}/10
- Safety Index: {safetyIndex}/10

User question: {userQuery}

Respond with:
1. A brief vibe summary (2-3 sentences, include emoji)
2. Top 3 recommendations based on time of day
3. One "hidden gem" if you know of one

Keep it conversational and slightly edgy - you're a local who knows the scene.`;

// app/api/ai/vibe-check/route.ts
export async function POST(req: Request) {
  const { lat, lng, query } = await req.json();
  const context = await buildContext(lat, lng);

  const response = await openai.chat.completions.create({
    model: 'google/gemini-2.5-flash', // via OpenRouter
    messages: [
      { role: 'system', content: buildSystemPrompt(context) },
      { role: 'user', content: query || 'Give me a vibe check' }
    ],
    stream: true
  });

  return new StreamingTextResponse(response);
}
```

**Tasks:**
- [ ] Create Jitsu AI personality system prompt
- [ ] Implement streaming chat interface
- [ ] Build context injection pipeline
- [ ] Add conversation history management
- [ ] Create "Vibe Check" quick action button

### 3.3 Smart POI Insights
**Implements:** FR-AI-02

```typescript
// components/ai/POIInsight.tsx
interface POIInsightProps {
  poi: SearchResult;
  onClose: () => void;
}

export function POIInsight({ poi, onClose }: POIInsightProps) {
  const { data: insight, isLoading } = useQuery({
    queryKey: ['poi-insight', poi.id],
    queryFn: () => fetchPOIInsight(poi)
  });

  // RAG-enhanced response combining:
  // - Mapbox POI metadata (category, hours, etc.)
  // - Aggregated reviews (if available)
  // - User-contributed tips
  // - AI-generated summary
}
```

**Tasks:**
- [ ] Create POI detail sheet component
- [ ] Implement Search Box API integration
- [ ] Build RAG pipeline for enhanced POI data
- [ ] Add "Ask Jitsu about this place" feature

### 3.4 Chat Interface
```typescript
// components/ai/JitsuChat.tsx
export function JitsuChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/ai/chat',
    body: {
      lat: mapStore.center.lat,
      lng: mapStore.center.lng
    }
  });

  return (
    <Sheet>
      <SheetTrigger>
        <JitsuAvatar /> {/* Floating AI button */}
      </SheetTrigger>
      <SheetContent>
        <ChatMessages messages={messages} />
        <ChatInput
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          placeholder="Ask Jitsu anything..."
        />
      </SheetContent>
    </Sheet>
  );
}
```

**Tasks:**
- [ ] Build chat UI with streaming responses
- [ ] Create Jitsu avatar/personality visuals
- [ ] Implement suggested prompts
- [ ] Add voice input option

**Deliverable:** Fully functional AI co-pilot with contextual awareness and chat interface.

---

## Phase 4: Data Pipeline & Custom Layers

### 4.1 Supabase Schema

```sql
-- Database schema
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinates GEOGRAPHY(POINT, 4326),
  neighborhood TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE safety_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id),
  score DECIMAL(3,1) CHECK (score >= 0 AND score <= 10),
  source TEXT, -- 'user_report', 'official_data', 'ai_inference'
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vibe_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id),
  category TEXT, -- 'nightlife', 'food', 'culture', 'outdoors'
  score DECIMAL(3,1),
  peak_hours INT[], -- e.g., [20, 21, 22, 23]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pgvector for RAG embeddings
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE poi_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poi_id TEXT UNIQUE,
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tasks:**
- [ ] Set up Supabase project
- [ ] Create database schema
- [ ] Enable PostGIS and pgvector extensions
- [ ] Set up Row Level Security policies
- [ ] Create database indexes for geo queries

### 4.2 MTS Pipeline (Custom Tilesets)

```yaml
# .github/workflows/tileset-update.yml
name: Update Safety Tileset

on:
  push:
    paths:
      - 'data/safety_scores.csv'
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours

jobs:
  update-tileset:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Convert to GeoJSON
        run: |
          python scripts/csv_to_geojson.py \
            data/safety_scores.csv \
            data/safety_scores.geojson

      - name: Upload to MTS
        env:
          MAPBOX_SECRET_TOKEN: ${{ secrets.MAPBOX_SECRET_TOKEN }}
        run: |
          tilesets upload-source mapjitsu safety-source \
            data/safety_scores.geojson
          tilesets publish mapjitsu.safety-v1
```

**Tasks:**
- [ ] Set up MTS CLI and credentials
- [ ] Create tileset recipe for safety data
- [ ] Build CSV-to-GeoJSON conversion script
- [ ] Configure GitHub Actions workflow
- [ ] Test tileset publishing pipeline

### 4.3 Data-Driven Styling

```typescript
// lib/mapbox/layers.ts
export const SAFETY_LAYER = {
  id: 'safety-layer',
  type: 'fill',
  source: {
    type: 'vector',
    url: 'mapbox://mapjitsu.safety-v1'
  },
  'source-layer': 'safety',
  paint: {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'safety_score'],
      0, '#ef4444',  // Red - dangerous
      3, '#f97316',  // Orange - caution
      5, '#eab308',  // Yellow - moderate
      7, '#22c55e',  // Green - safe
      10, '#10b981'  // Emerald - very safe
    ],
    'fill-opacity': 0.4
  }
};
```

**Tasks:**
- [ ] Create safety heatmap layer
- [ ] Build nightlife activity layer
- [ ] Implement vibe zone overlays
- [ ] Add layer blending modes for aesthetics

**Deliverable:** Custom data pipeline with real-time tileset updates and styled overlays.

---

## Phase 5: Advanced Features (FR-LOG-*)

### 5.1 Multi-Stop Route Optimization
**Implements:** FR-LOG-01

```typescript
// app/api/map/matrix/route.ts
export async function POST(req: Request) {
  const { locations, profile } = await req.json();

  const coords = locations.map(l => `${l.lng},${l.lat}`).join(';');

  const response = await fetch(
    `https://api.mapbox.com/directions-matrix/v1/mapbox/${profile}/${coords}` +
    `?annotations=duration,distance` +
    `&access_token=${process.env.MAPBOX_SECRET_TOKEN}`
  );

  const matrix = await response.json();

  // Apply nearest-neighbor TSP optimization
  const optimizedOrder = optimizeRoute(matrix.durations);

  return Response.json({
    matrix,
    optimizedOrder,
    totalDuration: calculateTotalDuration(matrix, optimizedOrder)
  });
}
```

**Tasks:**
- [ ] Create Matrix API integration
- [ ] Implement route optimization algorithm (TSP)
- [ ] Build multi-stop route UI
- [ ] Add drag-to-reorder stops
- [ ] Create "Bar Crawl Planner" feature

### 5.2 Search Integration

```typescript
// components/map/SearchBox.tsx
import { SearchBox } from '@mapbox/search-js-react';

export function MapSearchBox() {
  const mapStore = useMapStore();

  return (
    <SearchBox
      accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      map={mapStore.map}
      mapboxgl={mapboxgl}
      options={{
        language: 'en',
        proximity: mapStore.center,
        types: 'poi,address,neighborhood'
      }}
      onRetrieve={(result) => {
        mapStore.flyTo(result.features[0].geometry.coordinates);
        // Trigger POI insight panel
      }}
      theme={{
        variables: {
          colorBackground: '#0f172a',
          colorText: '#f8fafc',
          colorPrimary: '#3b82f6'
        }
      }}
    />
  );
}
```

**Tasks:**
- [ ] Integrate Search Box component
- [ ] Apply cyberpunk theme to search UI
- [ ] Add recent searches persistence
- [ ] Implement search suggestions
- [ ] Create category filters (bars, restaurants, etc.)

### 5.3 User Location & Tracking

```typescript
// hooks/useGeolocation.ts
export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    if (!tracking) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => setLocation(pos),
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [tracking]);

  return { location, tracking, setTracking };
}
```

**Tasks:**
- [ ] Implement geolocation hook
- [ ] Create user location marker (pulsing dot)
- [ ] Add heading indicator
- [ ] Build "center on me" control

**Deliverable:** Full-featured navigation with search, multi-stop routing, and location tracking.

---

## Phase 6: Security & Compliance

### 6.1 Token Security
**Implements:** 7.1

```typescript
// app/api/map/token/route.ts
import { SignJWT } from 'jose';

export async function GET(req: Request) {
  // Generate short-lived session token
  const sessionToken = await new SignJWT({
    scope: ['styles:read', 'tilesets:read'],
    referrer: req.headers.get('referer')
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(process.env.TOKEN_SECRET));

  // Exchange for Mapbox temporary token
  const mapboxToken = await createTemporaryToken(sessionToken);

  return Response.json({ token: mapboxToken });
}
```

**Tasks:**
- [ ] Implement token rotation system
- [ ] Create referrer-restricted web tokens
- [ ] Set up bundle ID restriction for mobile
- [ ] Configure token scope limits
- [ ] Add rate limiting per user

### 6.2 Privacy Controls
**Implements:** 7.2

```typescript
// lib/mapbox/privacy.ts
export function configurePrivacy(map: mapboxgl.Map, consent: ConsentLevel) {
  switch (consent) {
    case 'full':
      mapboxgl.setRTLTextPlugin('...', null, true);
      break;
    case 'minimal':
      // Disable telemetry
      (mapboxgl as any).config.DISABLE_TELEMETRY = true;
      break;
    case 'none':
      // Fully anonymous mode
      break;
  }
}
```

**Tasks:**
- [ ] Create consent management UI
- [ ] Implement telemetry toggle
- [ ] Add GDPR compliance banner
- [ ] Build data export/deletion features

---

## Phase 7: Testing & Quality Assurance

### 7.1 Visual Regression Testing

```typescript
// tests/visual/map.test.ts
import { test, expect } from '@playwright/test';

test('map renders with cyberpunk style', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="map-container"]');

  // Wait for tiles to load
  await page.waitForTimeout(2000);

  await expect(page).toHaveScreenshot('map-default.png', {
    maxDiffPixels: 100
  });
});

test('night mode lighting', async ({ page }) => {
  await page.goto('/?time=23:00');
  await expect(page).toHaveScreenshot('map-night.png');
});
```

**Tasks:**
- [ ] Set up Playwright for E2E tests
- [ ] Configure Chromatic for visual regression
- [ ] Create baseline screenshots for each mode
- [ ] Add CI/CD visual diff checks

### 7.2 Performance Testing

```typescript
// tests/performance/tiles.test.ts
test('tiles load within 200ms', async () => {
  const loadTimes: number[] = [];

  map.on('sourcedata', (e) => {
    if (e.isSourceLoaded && e.sourceId === 'mapjitsu.safety-v1') {
      loadTimes.push(performance.now() - startTime);
    }
  });

  expect(Math.max(...loadTimes)).toBeLessThan(200);
});
```

**Tasks:**
- [ ] Set up performance monitoring
- [ ] Create tile load time benchmarks
- [ ] Test 60fps maintenance under load
- [ ] Measure TTI on throttled connections

---

## Phase 8: DevOps & Deployment

### 8.1 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate Mapbox Style
        run: |
          STYLE_ID=$(grep MAPBOX_STYLE_ID .env.production)
          curl -s "https://api.mapbox.com/styles/v1/${STYLE_ID}?access_token=${{ secrets.MAPBOX_SECRET_TOKEN }}" | jq -e '.id'

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
      - run: npx playwright test

  deploy:
    needs: [validate, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Tasks:**
- [ ] Set up Vercel project
- [ ] Configure GitHub Actions workflows
- [ ] Add Mapbox style validation step
- [ ] Set up staging environment
- [ ] Configure preview deployments

### 8.2 Observability

```typescript
// lib/monitoring/mapbox.ts
export function trackMapboxUsage() {
  // Track API calls for cost monitoring
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const url = args[0] as string;
    if (url.includes('api.mapbox.com')) {
      analytics.track('mapbox_api_call', {
        endpoint: new URL(url).pathname,
        timestamp: Date.now()
      });
    }
    return originalFetch(...args);
  };
}
```

**Tasks:**
- [ ] Set up Mapbox usage dashboard
- [ ] Create cost alerts
- [ ] Implement client-side error tracking
- [ ] Add performance metrics collection

---

## Milestone Summary

| Phase | Milestone | Key Deliverable |
|-------|-----------|-----------------|
| 0 | Foundation | Project scaffold with configs |
| 1 | Immersive Map | Styled 3D map with atmospherics |
| 2 | Navigation | Routing, camera modes, isochrones |
| 3 | AI Co-Pilot | Jitsu chat with context awareness |
| 4 | Data Pipeline | Custom tilesets and overlays |
| 5 | Advanced | Search, multi-stop, tracking |
| 6 | Security | Token management, privacy |
| 7 | Testing | Visual regression, performance |
| 8 | Deployment | CI/CD, observability |

---

## Technical Decisions & Trade-offs

### Why Next.js 14 App Router?
- Server Components for Mapbox token proxying
- Built-in API routes for backend logic
- Streaming support for AI responses
- Vercel Edge deployment for low latency

### Why OpenRouter over Direct LLM APIs?
- Single API for multiple models (fallback support)
- Cost optimization across providers
- Easier model switching without code changes

### Why Supabase over Custom PostgreSQL?
- Built-in PostGIS support
- pgvector for RAG embeddings
- Real-time subscriptions (future: live location sharing)
- Auth system ready for user accounts

### Why tRPC?
- End-to-end type safety with TypeScript
- Better DX than REST for internal APIs
- Works seamlessly with React Query

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Mapbox API costs spike | Implement caching, rate limiting, usage alerts |
| 60fps not achievable on low-end devices | Graceful degradation: disable terrain, reduce building detail |
| AI hallucinations about locations | RAG grounding with verified POI data |
| Token exposure | Server-side proxying, short-lived tokens |
| Style changes break UI | Visual regression testing with Chromatic |

---

## Next Steps

1. **Immediate:** Set up Mapbox account and create Studio style
2. **Week 1:** Complete Phase 0 + Phase 1.1 (base map)
3. **Week 2:** Complete remaining Phase 1 (lighting, atmospherics)
4. **Week 3:** Phase 2 (navigation core)
5. **Week 4:** Phase 3 (AI integration)
6. **Ongoing:** Phases 4-8 in parallel with feature development
