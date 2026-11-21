# TerraCraft Agronomy

**TerraCraft Agronomy** is a complete, playable, visually rich browser-based Agriculture & Livestock Simulation Game built with **React, TypeScript, and Vite**. All visuals — including the real-time animated farm estate, 12 weather phenomena, 12 multi-stage crops/trees, grazing livestock, 4-level farmhouse, NPC SVG portraits, and commodity sparklines — are rendered procedurally via HTML5 Canvas and inline SVG with zero external backend, zero image URLs, and zero paid API dependencies.

---

## Features

### 1. Real-World Environmental & Weather Engine (`src/sim/weather.ts`, `src/sim/soil.ts`)
- **2 Selectable Climates / Biomes** (selectable via **New Farm**):
  - **Tropical Monsoon** (*Hot-Dry · Monsoon Wet · Cool-Dry*, 22–36°C year-round — ideal for Rubber Tree, Oil Palm, and Paddy Rice).
  - **Temperate 4-Season** (*Spring · Summer · Autumn · Winter*, -4°C to 34°C with frost and winter blizzards).
- **12 Distinct Weather Types** with real agronomy/livestock impacts and live animated Canvas overlays:
  1. Clear / Sunny · 2. Partly Cloudy · 3. Overcast / Morning Fog · 4. Light Drizzle · 5. Heavy Rain / Monsoon Downpour · 6. Thunderstorm & Lightning · 7. Strong Wind / Dry Gale · 8. Heatwave / Drought · 9. Hailstorm · 10. Frost · 11. Snow / Blizzard · 12. Post-Rain Rainbow.
- **Weather Forecast**: 3-day forecast by default, upgraded to **5-day forecast** when the **Brass Weather Barometer** is placed in your Farmhouse.
- **Per-Plot Soil Science & Heatmaps**: Soil Moisture (0–100%), Soil pH (4.5–8.5), Nitrogen (N), Phosphorus (P), Potassium (K), Organic Matter, and Weed/Pest Pressure — inspectable individually or via the **Heatmap Overlay Toggle** (Moisture, pH, N, K, Plant Health).
- **Soil Management**: Irrigate, Till/Clear, Compost (uses free Livestock Manure first!), Agricultural Lime (+pH), Elemental Sulfur (-pH), Organic Mulch (slower evaporation & fewer weeds), and Row Cover / Shade Cloth (protects against frost, hail, heatwaves, and thunderstorms).

### 2. 12 Real-World Plants & Plantation Trees (`src/sim/crops.ts`)
Every species models 5 growth stages (*Seed/Sapling → Sprout → Vegetative → Flowering/Maturing → Harvestable*), optimal/lethal temperatures, soil pH, moisture, N-P-K consumption or fixation, shelf life, and quality grading (Grade A/B/C):
1. **Rubber Tree (*Hevea brasiliensis*)** — Acid-loving tropical perennial; continuous **Natural Latex** tapping (rain lowers yield unless Rain Guard is owned; storable).
2. **Oil Palm Tree (*Elaeis guineensis*)** — Heavy K & N feeder; continuous **Fresh Fruit Bunch (FFB)** harvests (perishable: 2 days).
3. **Paddy Rice** — Thrives in flooded wet soil, immune to monsoon waterlogging; storable & feeds livestock.
4. **Tomato** — Warm-season multi-harvest vine; frost/hail sensitive; perishable.
5. **Sweet Corn** — Heavy Nitrogen feeder, full sun; perishable & feeds livestock.
6. **Soybean** — Symbiotic legume that naturally fixes Nitrogen (+N) into the soil; storable & feeds livestock.
7. **Spinach** — Cool-season, frost-hardy leafy green that bolts in heatwaves; perishable.
8. **Strawberry** — Slightly acidic pH (5.5–6.5), multi-harvest; perishable.
9. **Blueberry** — Strongly acidic pH (4.5–5.5), frost-hardy perennial; perishable.
10. **Potato** — Cool-temperate heavy Potassium (K) feeder; storable & feeds pigs.
11. **Sunflower** — Drought-tolerant, full sun; storable.
12. **Winter Wheat** — Cold-hardy grain that survives frost & snow dormant; storable & feeds livestock.

### 3. Livestock & Circular Agronomy (`src/sim/livestock.ts`)
- **Chickens** (*Chick → Pullet → Adult Hen*): Daily **Fresh Eggs** (Grade A/B/C) + light Organic Manure.
- **Dairy Cows** (*Calf → Heifer → Adult Cow*): High-value **Fresh Milk** (2-day perishable) + abundant Organic Manure.
- **Pigs** (*Piglet → Grower → Market Hog*): Fast weight gain, rich Organic Manure, top live resale profit, and rare **Black Truffles** when very happy.
- **Circular Agronomy**: Feed animals using commercial Animal Feed OR surplus crops from your Barn (Corn, Wheat, Rice, Soybean, Potato). Animals generate daily **Organic Manure** you can apply as free compost on your plots.
- **Weather Shelter**: Upgrade animal pens (Deluxe Chicken Coop, Timber Dairy Barn, Covered Pig Sty) and **Climate Ventilation Fans** to protect animals from storms, hail, frost, heatwaves, and blizzards.

### 4. Dynamic Market, Barn & Currency (`src/sim/market.ts`)
- **Currency Toggle**: Switch anytime between **`$ USD`** and **`฿ THB`** (`1 USD = 35 THB`).
- **Live Exchange (18 Markets)**: Dynamic prices for all 12 crops, Fresh Eggs, Fresh Milk, Black Truffle, and Live Animals (Chicken, Cow, Pig) with daily ↑/↓ % trends, 10-day SVG sparklines, and **Market News Headlines**.
- **Barn Warehouse & Cooled Barn**: Store storable and perishable goods (with live countdown timers) to sell at market peaks; upgrade to **Expanded Cooled Barn** for 150-unit capacity and +1 shelf-life day.
- **Cooperative Farm Loan**: Start with `$2,500` (`฿87,500`) plus an optional simple-interest Farm Loan up to `$3,000`.

### 5. 5 Interactive NPCs (`src/sim/npcs.ts`)
- **Dr. Mali (Soil & Agronomy Scientist)** — Context-aware soil diagnostics based on your real farm plots + Soil Science Quests.
- **Uncle Somchai (Rubber & Palm Commodity Broker)** — Next-day market tips + timed Bulk Contracts (+35% bonus pay).
- **Nadia (Traveling Seed & Livestock Merchant)** — Daily rotating Flash Sales + up to 15% permanent shop discount at 5 Hearts.
- **Master Ken (Village Carpenter & Toolsmith)** — Homestead & shelter guidance + milestone quests.
- **Auntie Lin (Village Chef & Harvest Festival Host)** — Fresh produce baskets + Seasonal Harvest Festivals awarding cash and displayable **Festival Trophies**.

### 6. Land Expansion, Tools, Farmhouse & Furniture (`src/sim/homestead.ts`)
- **Land Expansion Deeds**: Expand from **4×4 (16 plots)** → **6×4 (24)** → **6×6 (36)** → **8×6 (48)** → **10×6 (60 plots)**.
- **Tools & Equipment**: Precision Soil Probe, Drip Irrigation Kit, Auto-Sprinkler System, Pro Latex Knife & Rain Guard, Palm Harvester Pole & Cart, Livestock Auto-Feeder, Expanded Cooled Barn, Pen Upgrades, and Climate Ventilation.
- **4-Level Farmhouse & Placeable Furniture**: Upgrade from *Cozy Cabin (4 slots)* → *Farm Homestead (8)* → *Two-Story Plantation Villa (12)* → *Grand Eco-Estate & Greenhouse Wing (16)*. Buy, place, move, and remove 12+ furniture items & earned Festival Trophies with active perks (e.g., **Weather Barometer** for 5-day forecast, **Agronomy Desk** for market trend hints, **Solar Roof Panels** for -50% daily upkeep, **Tranquil Koi Pond** for daily animal happiness).

---

## Architecture

```text
src/
├── sim/                  # Pure TypeScript simulation modules
│   ├── types.ts          # Shared simulation interfaces
│   ├── weather.ts        # 2 climates, 12 weather types, seasonal calendar & forecast
│   ├── soil.ts           # Per-plot soil science & management actions
│   ├── crops.ts          # 12 real-world crops & agronomic growth/harvest math
│   ├── livestock.ts      # Chickens, Cows, Pigs, feeding, manure & shelter logic
│   ├── market.ts         # Dynamic 18-commodity exchange, Barn spoilage & loans
│   ├── npcs.ts           # 5 NPCs, context-aware advice, quests, contracts & flash sales
│   ├── homestead.ts      # Land tiers, tools, 4-level farmhouse & furniture perks
│   ├── engine.ts         # Central immutable state engine & localStorage persistence
│   └── __tests__/        # Vitest unit test suite
├── components/           # Procedural Canvas/SVG & responsive tab views
└── styles/               # Nature-inspired CSS design system
```

---

## Controls & Shortcuts
- **Click any Farm Plot**: Select it in the Plot Inspector to irrigate, compost, adjust pH, mulch, cover, plant, or harvest.
- **Click Farmhouse / Visiting NPCs / Livestock Pasture** directly on the living Canvas to jump right to decorating, chatting, or tending animals.
- **`Space`**: Advance to the next day (when no modal/input is focused).
- **Auto-Save**: Progress saves automatically in `localStorage`.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run unit test suite (Vitest)
npm test

# Type-check & build for production (static hosting / GitHub Pages ready with base: './')
npm run build
```