# Atlas City: Integrated Architecture

## Overview
Atlas City is a reputation economy platform that identifies, scores, and visualizes technical influence. The system is composed of two primary layers: the **Antigravity Search Engine** and the **Atlas City Visual**.

## Core Components

### 1. Antigravity Search Engine (`/src/app/page.tsx`)
- **Purpose**: Data-driven discovery of technical clusters.
- **Engine**: D3.js (Transitioning to Three.js for 3D visualization).
- **Function**: Queries users based on technical affinity (stars, commits, languages).
- **Navigation**: Selecting a user redirects to their specific location in the City Map.

### 2. Atlas City Visual (`/src/app/city/`)
- **Purpose**: Spatial representation of the reputation economy.
- **Engine**: Custom SVG/React visualization (`CityMap2D`).
- **Function**: Renders users as "buildings" in themed districts.
- **Integration**: Supports deep-linking via query parameters (`?user=xyz`) to center camera on specific buildings.

### 3. Score Engine (`/src/lib/score/`)
- **Developer Influence Score (DIS)**: Base reputation metric derived from GitHub metadata.
- **Calculator**: `dis-calculator.ts` implements the weighting formulas.

### 4. Data Layer (`/prisma/`)
- **Provider**: PostgreSQL (Vercel) / SQLite (Local).
- **Models**:
    - `User`: Central identity and scores.
    - `Building`: Spatial coordinates and visual properties.
    - `PeerVote`: Trust-based reputation propagation.
    - `CityCredit`: Economic balance and history.
    - `Badge`: Milestone tracking.

## Data Flow
1. **Fetch**: `GitHubAdapter` retrieves raw stats.
2. **Score**: `DISCalculator` processes stats into reputation scores.
3. **Persist**: Scores and Building data are saved to Prisma.
4. **Search**: `Search API` exposes users to the Antigravity frontend.
5. **Visualize**: Home page nodes link to City Map buildings.
