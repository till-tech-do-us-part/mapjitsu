# **MapJitsu Enterprise Software Architecture & Requirements Specification (ESARS)**

**Version:** 2.0.0 (Unified)

**Status:** Approved for Engineering

**Date:** 2025-05-12

**Confidentiality:** Internal Use Only

## **📚 Table of Contents**

1. [Product Requirements Document (PRD)](https://www.google.com/search?q=%231-product-requirements-document-prd)  
2. [Functional Requirements Document (FRD)](https://www.google.com/search?q=%232-functional-requirements-document-frd)  
3. [Technical Requirements Document (TRD)](https://www.google.com/search?q=%233-technical-requirements-document-trd)  
4. [Mapbox Service Provisioning & Integration](https://www.google.com/search?q=%234-mapbox-service-provisioning--integration)  
5. [System Architecture & Data Model](https://www.google.com/search?q=%235-system-architecture--data-model)  
6. [API Specifications](https://www.google.com/search?q=%236-api-specifications)  
7. [Security, Privacy & Compliance](https://www.google.com/search?q=%237-security-privacy--compliance)  
8. [Quality Assurance & Testing Strategy](https://www.google.com/search?q=%238-quality-assurance--testing-strategy)  
9. [DevOps, Deployment & Observability](https://www.google.com/search?q=%239-devops-deployment--observability)

## **1\. Product Requirements Document (PRD)**

### **1.1 Product Vision**

To build the world's first **Immersive AI-Native Navigation Platform**, moving beyond static 2D grids to a living, breathing 3D representation of the world. MapJitsu combines high-fidelity "Cyberpunk/Cinematic" visual aesthetics with a context-aware Generative AI Co-Pilot that understands *vibes*, not just coordinates.

### **1.2 Target Audience**

* **Primary:** Urban Explorers & Tech-Forward Commuters (Gen Z/Millennials) who value aesthetics and discovery.  
* **Secondary:** Gig Economy Drivers requiring legible, high-contrast visual interfaces for night shifts.  
* **Tertiary:** Automotive OEMs seeking white-label, next-gen dashboard visualizations.

### **1.3 Core Value Proposition**

1. **Legibility through Depth:** True 3D structures help users orient themselves instantly.  
2. **Contextual Intelligence:** The AI Co-Pilot aggregates reviews, safety data, and history to give a "Vibe Check."  
3. **Visual Delight:** Gamified, high-frame-rate rendering utilizing **Mapbox Standard Style** lighting and shadows.

## **2\. Functional Requirements Document (FRD)**

### **2.1 Epic: The Immersive Map (Visuals & Rendering)**

* **FR-MAP-01 (Cinematic Style):** The system shall utilize **Mapbox Studio** to enforce a custom "Night Mode" aesthetic with neon accent colors (e.g., \#3b82f6 for highways) and saturated dark water bodies.  
* **FR-MAP-02 (Dynamic Lighting):** The map must utilize **Mapbox Standard Style's** procedural lighting engine to render realistic shadows that shift with the time of day ("Golden Hour" vs. "Midnight").  
* **FR-MAP-03 (Atmospherics):** The system shall implement the **Mapbox Sky API** to render atmospheric scattering, horizon gradients, and volumetric fog to simulate depth/scale.  
* **FR-MAP-04 (Animated Layers):** The map must support **Animated Vector Layers** to visualize dynamic data (e.g., pulsing heatmaps for "Nightlife Activity" or "Safety Corridors").

### **2.2 Epic: 3D & Navigation Experience**

* **FR-NAV-01 (Driver Camera):** The application must utilize the **Free Camera API** to support a "Driver Mode" (60° pitch, fixed bearing follow) and "Explorer Mode" (free cam).  
* **FR-NAV-02 (3D Volumetrics):** The map shall render global **3D Terrain (DEM)** and extruded building volumes to create occlusion effects, requiring users to visually "drive through" city canyons.  
* **FR-NAV-03 (Routing):** The system shall calculate traffic-aware routes using the **Mapbox Directions API**, visualizing congestion with neon-coded route lines.  
* **FR-NAV-04 (Reachability):** The system shall implement the **Isochrone API** to visualize "Walkable Vibe" zones (e.g., "Show all bars within a 10-minute walk").

### **2.3 Epic: AI Co-Pilot ("Jitsu AI")**

* **FR-AI-01 (Context Injection):** Upon user request ("Vibe Check"), the system must perform **Reverse Geocoding** via Mapbox to extract semantic location context (Neighborhood, POI types) to feed the LLM prompt.  
* **FR-AI-02 (Smart POI):** Clicking a POI triggers an RAG lookup. The system utilizes **Mapbox Search Box API** metadata to enhance the AI's knowledge of the specific business category and reviews.

### **2.4 Epic: Mobility & Logistics (Advanced)**

* **FR-LOG-01 (Route Sequencing):** The system shall use the **Mapbox Matrix API** to optimize multi-stop routes (e.g., "Plan the most efficient path between these 5 favorite bars").  
* **FR-LOG-02 (Offline Packs):** The mobile application must support downloading "City Packs" via the **Mobile Maps SDK (v11)** for full offline navigation capability.

## **3\. Technical Requirements Document (TRD)**

### **3.1 Tech Stack Selection**

* **Frontend:** Next.js 14 (App Router), Tailwind CSS.  
* **Map Engine:** Mapbox GL JS v3 (Web), Mapbox Maps SDK v11 (iOS/Android).  
* **AI Orchestration:** OpenRouter (Gateway) \+ Vercel AI SDK.  
* **Backend:** Next.js Server Actions \+ tRPC.  
* **Database:** Supabase (PostgreSQL \+ pgvector).

### **3.2 Performance Constraints**

* **TR-PERF-01:** Map TTI \< 1.5s on 4G.  
* **TR-PERF-02:** 3D Rendering must maintain 60fps using Mapbox’s Metal/Vulkan/WebGL renderers.  
* **TR-PERF-03:** Custom vector tile loading (MTS) must occur within 200ms of viewport entry.

## **4\. Mapbox Service Provisioning & Integration**

This section details the specific Mapbox services required to execute the FRD.

### **4.1 Service Matrix & Account Tiers**

| Feature | Mapbox Service | Plan Requirement | Integration Method |
| :---- | :---- | :---- | :---- |
| **Base Map** | Mapbox Standard Style | Pay-as-you-go / Enterprise | style: 'mapbox://styles/mapbox/standard' |
| **Custom Data** | Mapbox Tiling Service (MTS) | Enterprise (for high throughput) | CLI / MTS API Pipeline |
| **Search** | Search Box API | Pay-as-you-go | Search SDK / Geocoding API |
| **Routing** | Directions API \+ Matrix API | Pay-as-you-go | Navigation SDK / API |
| **3D Terrain** | Mapbox Terrain-RGB | Included | setTerrain({ source: 'mapbox-dem' }) |
| **Offline** | Offline Manager (Mobile) | Included in MAUs | Mobile SDK Native Methods |

### **4.2 Custom Data Pipeline (The "Vibe" Layer)**

* **Objective:** Render "Reputation Scores" and "Safety Indexes" without client-side heavy lifting.  
* **Architecture:**  
  1. **Ingest:** Raw safety/review data (CSV/GeoJSON) stored in Supabase.  
  2. **Process:** GitHub Action triggers **MTS Recipe** to convert data into Vector Tiles.  
  3. **Publish:** Tilesets hosted on Mapbox Edge (mapbox://tilesets/mapjitsu.safety-v1).  
  4. **Render:** Client consumes Vector Tiles; styling logic applied via **Data-Driven Expressions** (e.g., \['interpolate', \['linear'\], \['get', 'safety\_score'\], 0, 'red', 10, 'green'\]).

### **4.3 Navigation SDK Integration**

* **Strategy:** Use **Mapbox Navigation SDK (iOS/Android)** for the core logic (snapping, turn detection, voice synthesis) but suppress the default UI.  
* **Implementation:**  
  * Initialize NavigationRouter.  
  * Subscribe to RouteProgress events.  
  * Feed progress data into the custom MapJitsu React Native/SwiftUI HUD overlay.

## **5\. System Architecture & Data Model**

### **5.1 High-Level Architecture (Updated)**

graph TD  
    User\[End User Mobile/Web\] \--\>|HTTPS| CDN\[Vercel Edge\]  
      
    subgraph Frontend\_Device  
        CDN \--\> NextJS\[Next.js App\]  
        NextJS \--\> MapGL\[Mapbox GL JS v3\]  
        MapGL \--\>|Render Loop| WebGL\[WebGL/Metal Engine\]  
    end  
      
    subgraph Mapbox\_Cloud  
        MapGL \--\>|Vector Tiles| MTS\[Mapbox Tiling Service\]  
        MapGL \--\>|Styles/Assets| Styles\[Mapbox Studio Styles\]  
        NextJS \--\>|Geocoding| SearchAPI\[Search Box API\]  
        NextJS \--\>|Routing| NavAPI\[Directions/Matrix API\]  
    end  
      
    subgraph Backend\_AI  
        NextJS \--\>|Context \+ Prompt| OpenRouter  
        OpenRouter \--\>|LLM| Gemini\[Gemini 2.5 Flash\]  
        Gemini \--\>|Response| NextJS  
    end  
      
    subgraph Data\_Layer  
        MTS \--\>|Ingest| Supabase\[Supabase DB\]  
    end

### **5.2 Module Dependencies**

* @mapbox/mapbox-gl-js (v3.x)  
* @mapbox/search-js-react  
* @mapbox/mapbox-sdk (Services client for Node.js)  
* **Mobile:** Mapbox Maps SDK for iOS (v11), Mapbox Navigation SDK for iOS (v3).

## **6\. API Specifications**

### **6.1 Internal Map Proxies (/api/map)**

To protect Mapbox tokens and manage quotas.

* **GET /api/map/token:** Returns a scoped, short-lived Mapbox access token for the client session.  
* **POST /api/map/matrix:** Wraps Mapbox Matrix API.  
  * Input: origins: \[\], destinations: \[\], profile: 'driving'  
  * Output: durations: \[\[\],\[\]\]

### **6.2 AI Context API (/api/ai/context)**

* **Process:**  
  1. Receives lat, lng.  
  2. Calls **Mapbox Reverse Geocoding** to get neighborhood name.  
  3. Calls **Mapbox Isochrone** to get "walkability score" (area reachable in 5 mins).  
  4. Returns aggregated context object to Frontend for LLM injection.

## **7\. Security, Privacy & Compliance**

### **7.1 Mapbox Token Security**

* **Requirement:** Use separate tokens for Web (referral restricted) and Mobile (bundle ID restricted).  
* **Requirement:** Secret scopes (Styles:Read, Tilesets:Read) must never be exposed to client. Use **Token Rotation** policies.

### **7.2 Location Privacy**

* **Requirement:** Telemetry collection via Mapbox SDKs must be configured to "Anonymized" or disabled based on user consent (GDPR/CCPA compliance).

## **8\. Quality Assurance & Testing Strategy**

### **8.1 Map & Visual Testing**

* **Visual Regression:** Use **Chromatic** to snapshot the Map Canvas. Ensure style updates in Mapbox Studio do not break color contrast ratios or label visibility.  
* **Tile Loading:** Automated tests to verify custom MTS tilesets load within 200ms using mock network throttling.

### **8.2 Navigation Logic**

* **Simulation:** Use Mapbox Navigation SDK's built-in **Trajectory Simulation** to test turn-by-turn instruction triggering without physical driving.

## **9\. DevOps, Deployment & Observability**

### **9.1 Build Pipeline**

* **Mapbox Studio Sync:** CI/CD pipeline should validate that the production Mapbox Style ID exists and is public before deployment.  
* **MTS Automation:** Changes to data/safety\_scores.csv in the repo trigger a GitHub Action to upload and re-process the tileset via MTS API.

### **9.2 Observability**

* **Mapbox Metrics:** Monitor Tile Requests, Geocoding API usage, and Matrix API calls via Mapbox Account Dashboard to track costs against MAUs.