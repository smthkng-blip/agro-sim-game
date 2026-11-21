import type {
  FurnitureId,
  HomesteadState,
  ToolId,
} from './types';

export interface LandTierSpec {
  tier: number;
  label: string;
  cols: number;
  rows: number;
  totalPlots: number;
  cost: number;
  description: string;
}

export const LAND_TIERS: LandTierSpec[] = [
  { tier: 0, label: 'Starter Parcel (4×4)', cols: 4, rows: 4, totalPlots: 16, cost: 0, description: '16 fertile starter plots.' },
  { tier: 1, label: 'East Meadow Deed (6×4)', cols: 6, rows: 4, totalPlots: 24, cost: 650, description: 'Expands farm to 24 plots.' },
  { tier: 2, label: 'South Orchard Deed (6×6)', cols: 6, rows: 6, totalPlots: 36, cost: 1350, description: 'Expands farm to 36 plots.' },
  { tier: 3, label: 'River Valley Deed (8×6)', cols: 8, rows: 6, totalPlots: 48, cost: 2400, description: 'Expands farm to 48 plots.' },
  { tier: 4, label: 'Grand Plantation Deed (10×6)', cols: 10, rows: 6, totalPlots: 60, cost: 3800, description: 'Full 60-plot commercial plantation!' },
];

export interface ToolSpec {
  id: ToolId;
  name: string;
  cost: number;
  category: 'agronomy' | 'plantation' | 'livestock' | 'storage';
  description: string;
  perkSummary: string;
}

export const TOOL_CATALOG: Record<ToolId, ToolSpec> = {
  soil_probe: {
    id: 'soil_probe',
    name: 'Precision Soil Probe',
    cost: 180,
    category: 'agronomy',
    description: 'Digital probe that highlights exact pH, N-P-K, and moisture recommendations for every planted crop.',
    perkSummary: 'Detailed soil diagnostics',
  },
  drip_irrigation: {
    id: 'drip_irrigation',
    name: 'Drip Irrigation Kit',
    cost: 420,
    category: 'agronomy',
    description: 'Waters an entire row of plots at once when irrigating and reduces daily soil evaporation by 25%.',
    perkSummary: 'Row watering + -25% evap',
  },
  auto_sprinkler: {
    id: 'auto_sprinkler',
    name: 'Auto-Sprinkler System',
    cost: 950,
    category: 'agronomy',
    description: 'Automatically waters any plot that drops below 40% soil moisture each morning.',
    perkSummary: 'Auto-waters dry plots <40%',
  },
  latex_rain_guard: {
    id: 'latex_rain_guard',
    name: 'Pro Latex Knife & Rain Guard',
    cost: 520,
    category: 'plantation',
    description: 'Shields Rubber Tree tapping cups from monsoon downpours and boosts Natural Latex yield by +25%.',
    perkSummary: '+25% Latex + Rain protection',
  },
  palm_harvester: {
    id: 'palm_harvester',
    name: 'Palm Harvester Pole & Cart',
    cost: 580,
    category: 'plantation',
    description: 'Boosts Oil Palm Fresh Fruit Bunch (FFB) yield by +20% and unlocks the one-click Harvest All Ready button.',
    perkSummary: '+20% FFB + Harvest-All button',
  },
  auto_feeder: {
    id: 'auto_feeder',
    name: 'Livestock Auto-Feeder',
    cost: 540,
    category: 'livestock',
    description: 'Automatically dispenses commercial Animal Feed each day to hungry animals whenever feed is in stock.',
    perkSummary: 'Auto-feeds livestock daily',
  },
  cooled_barn: {
    id: 'cooled_barn',
    name: 'Expanded Cooled Barn',
    cost: 680,
    category: 'storage',
    description: 'Expands Barn capacity from 60 to 150 units and extends shelf life of all perishable produce, milk & FFB by +1 day.',
    perkSummary: '150 Barn cap +1d shelf life',
  },
  coop_upgrade: {
    id: 'coop_upgrade',
    name: 'Deluxe Chicken Coop',
    cost: 340,
    category: 'livestock',
    description: 'Raises max Chickens from 4 to 10 and shelters hens from storms, hail, and frost.',
    perkSummary: 'Max 10 Chickens + Shelter',
  },
  cow_barn_upgrade: {
    id: 'cow_barn_upgrade',
    name: 'Timber Dairy Barn',
    cost: 620,
    category: 'livestock',
    description: 'Raises max Dairy Cows from 2 to 6 and shelters cows from storms, hail, and frost.',
    perkSummary: 'Max 6 Cows + Shelter',
  },
  pig_pen_upgrade: {
    id: 'pig_pen_upgrade',
    name: 'Covered Pig Sty',
    cost: 480,
    category: 'livestock',
    description: 'Raises max Pigs from 2 to 6 and shelters hogs from storms, hail, and frost.',
    perkSummary: 'Max 6 Pigs + Shelter',
  },
  climate_ventilation: {
    id: 'climate_ventilation',
    name: 'Climate Ventilation Fans',
    cost: 760,
    category: 'livestock',
    description: 'Full all-weather barn cooling & heating — protects every animal from heatwaves and winter blizzards.',
    perkSummary: 'All-weather animal shelter',
  },
};

export const ALL_TOOL_IDS = Object.keys(TOOL_CATALOG) as ToolId[];

export interface FarmhouseLevelSpec {
  level: 1 | 2 | 3 | 4;
  name: string;
  slots: number;
  upgradeCost: number;
  dailyUpkeep: number;
  description: string;
}

export const FARMHOUSE_LEVELS: Record<1 | 2 | 3 | 4, FarmhouseLevelSpec> = {
  1: {
    level: 1,
    name: 'Cozy Cabin',
    slots: 4,
    upgradeCost: 0,
    dailyUpkeep: 8,
    description: 'A warm timber cabin with 4 interior furniture slots.',
  },
  2: {
    level: 2,
    name: 'Farm Homestead',
    slots: 8,
    upgradeCost: 900,
    dailyUpkeep: 14,
    description: 'Spacious wrap-around porch homestead with 8 furniture slots.',
  },
  3: {
    level: 3,
    name: 'Two-Story Plantation Villa',
    slots: 12,
    upgradeCost: 2200,
    dailyUpkeep: 22,
    description: 'Elegant two-story tropical/countryside villa with 12 furniture slots.',
  },
  4: {
    level: 4,
    name: 'Grand Eco-Estate & Greenhouse Wing',
    slots: 16,
    upgradeCost: 4200,
    dailyUpkeep: 30,
    description: 'Prestigious eco-estate with sunlit glass greenhouse wing and 16 furniture slots.',
  },
};

export interface FurnitureSpec {
  id: FurnitureId;
  name: string;
  cost: number;
  placement: 'indoor' | 'outdoor' | 'trophy';
  perk: string;
  accentColor: string;
  purchasable: boolean;
}

export const FURNITURE_CATALOG: Record<FurnitureId, FurnitureSpec> = {
  cozy_sofa: {
    id: 'cozy_sofa',
    name: 'Cozy Linen Sofa',
    cost: 160,
    placement: 'indoor',
    perk: 'Warm living room centerpiece (+comfort)',
    accentColor: '#d97706',
    purchasable: true,
  },
  agronomy_desk: {
    id: 'agronomy_desk',
    name: 'Agronomy Research Desk',
    cost: 340,
    placement: 'indoor',
    perk: 'Reveals next-day Market Trend Hints on the Market Board!',
    accentColor: '#7c3aed',
    purchasable: true,
  },
  weather_barometer: {
    id: 'weather_barometer',
    name: 'Brass Weather Barometer',
    cost: 320,
    placement: 'indoor',
    perk: 'Upgrades Weather Forecast from 3 days to 5 days!',
    accentColor: '#0284c7',
    purchasable: true,
  },
  kitchen_counter: {
    id: 'kitchen_counter',
    name: 'Farmhouse Kitchen Counter',
    cost: 240,
    placement: 'indoor',
    perk: 'Prepares farm-fresh meals (+1 friendship bonus when gifting Auntie Lin)',
    accentColor: '#b45309',
    purchasable: true,
  },
  coffee_table: {
    id: 'coffee_table',
    name: 'Teak Coffee Table',
    cost: 120,
    placement: 'indoor',
    perk: 'Handcrafted teak centerpiece',
    accentColor: '#92400e',
    purchasable: true,
  },
  potted_bonsai: {
    id: 'potted_bonsai',
    name: 'Potted Bonsai & Orchid',
    cost: 140,
    placement: 'indoor',
    perk: 'Brings serene botanical elegance indoors',
    accentColor: '#16a34a',
    purchasable: true,
  },
  woven_rug: {
    id: 'woven_rug',
    name: 'Artisan Woven Rug',
    cost: 110,
    placement: 'indoor',
    perk: 'Adds rich countryside warmth',
    accentColor: '#dc2626',
    purchasable: true,
  },
  bookshelf: {
    id: 'bookshelf',
    name: 'Botany Bookshelf',
    cost: 190,
    placement: 'indoor',
    perk: 'Showcases agronomy journals & field guides',
    accentColor: '#78350f',
    purchasable: true,
  },
  solar_panels: {
    id: 'solar_panels',
    name: 'Solar Roof Panels',
    cost: 520,
    placement: 'outdoor',
    perk: 'Cuts daily homestead upkeep by 50% (visible on roof!)',
    accentColor: '#2563eb',
    purchasable: true,
  },
  porch_hammock: {
    id: 'porch_hammock',
    name: 'Porch Hammock',
    cost: 150,
    placement: 'outdoor',
    perk: 'Relaxing veranda breeze',
    accentColor: '#0d9488',
    purchasable: true,
  },
  garden_lanterns: {
    id: 'garden_lanterns',
    name: 'Stone Garden Lanterns',
    cost: 180,
    placement: 'outdoor',
    perk: 'Warm glowing pathway lights by the farmhouse',
    accentColor: '#f59e0b',
    purchasable: true,
  },
  koi_pond: {
    id: 'koi_pond',
    name: 'Tranquil Koi Pond',
    cost: 420,
    placement: 'outdoor',
    perk: 'Visible koi pond outside the farmhouse (+3 daily animal happiness)',
    accentColor: '#06b6d4',
    purchasable: true,
  },
  festival_trophy: {
    id: 'festival_trophy',
    name: 'Harvest Festival Trophy',
    cost: 0,
    placement: 'trophy',
    perk: 'Prestigious golden award earned at Auntie Lin’s Harvest Festival!',
    accentColor: '#eab308',
    purchasable: false,
  },
};

export const ALL_FURNITURE_IDS = Object.keys(FURNITURE_CATALOG) as FurnitureId[];

export function createInitialHomestead(): HomesteadState {
  return {
    landTier: 0,
    gridCols: LAND_TIERS[0].cols,
    gridRows: LAND_TIERS[0].rows,
    ownedTools: [],
    farmhouseLevel: 1,
    ownedFurniture: [],
    placedFurniture: [
      {
        instanceId: 'starter_table',
        furnitureId: 'coffee_table',
        slotIndex: 0,
      },
    ],
    trophiesEarned: 0,
  };
}

export function hasPlacedFurniture(homestead: HomesteadState, id: FurnitureId): boolean {
  return homestead.placedFurniture.some((f) => f.furnitureId === id);
}

export function getForecastDaysLimit(homestead: HomesteadState): number {
  return hasPlacedFurniture(homestead, 'weather_barometer') ? 5 : 3;
}

export function getDailyHomesteadUpkeep(homestead: HomesteadState): number {
  const base = FARMHOUSE_LEVELS[homestead.farmhouseLevel].dailyUpkeep;
  return hasPlacedFurniture(homestead, 'solar_panels') ? Math.round(base * 0.5) : base;
}
