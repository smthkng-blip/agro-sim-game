export type ClimateType = 'tropical_monsoon' | 'temperate_4season';

export type TropicalSeason = 'hot_dry' | 'monsoon_wet' | 'cool_dry';
export type TemperateSeason = 'spring' | 'summer' | 'autumn' | 'winter';
export type Season = TropicalSeason | TemperateSeason;

export type WeatherType =
  | 'clear'
  | 'partly_cloudy'
  | 'overcast_fog'
  | 'light_drizzle'
  | 'heavy_rain'
  | 'thunderstorm'
  | 'strong_wind'
  | 'heatwave'
  | 'hailstorm'
  | 'frost'
  | 'snow_blizzard'
  | 'rainbow';

export interface WeatherSpec {
  id: WeatherType;
  name: string;
  shortName: string;
  description: string;
  moistureDelta: number;
  evaporationMultiplier: number;
  sunlightFactor: number; // 0..1.2
  tempOffset: number;
  windIntensity: number; // 0..1
  cropDamageRisk: number; // 0..1
  animalStressRisk: number; // 0..1
  latexRainPenalty: number; // 0..0.5
  moraleBoost: number; // 0..10
  waterloggingRisk: boolean;
  frostHazard: boolean;
  heatHazard: boolean;
  hailHazard: boolean;
  stormHazard: boolean;
}

export interface WeatherDay {
  day: number;
  season: Season;
  weather: WeatherType;
  tempC: number;
  humidity: number; // 0..100
  windKmh: number;
}

export type CropId =
  | 'rubber_tree'
  | 'oil_palm'
  | 'paddy_rice'
  | 'tomato'
  | 'sweet_corn'
  | 'soybean'
  | 'spinach'
  | 'strawberry'
  | 'blueberry'
  | 'potato'
  | 'sunflower'
  | 'winter_wheat';

export type CommodityId =
  | CropId
  | 'eggs'
  | 'milk'
  | 'truffle'
  | 'live_chicken'
  | 'live_cow'
  | 'live_pig';

export type QualityGrade = 'A' | 'B' | 'C';

export type ShelfLifeType = 'storable' | 'perishable';

export interface CropSpec {
  id: CropId;
  name: string;
  scientificName: string;
  productName: string;
  category: 'tree' | 'grain' | 'vegetable' | 'fruit' | 'legume' | 'oilseed';
  optTempMin: number;
  optTempMax: number;
  lethalTempMin: number;
  lethalTempMax: number;
  optPhMin: number;
  optPhMax: number;
  optMoistureMin: number;
  optMoistureMax: number;
  waterNeed: 'low' | 'medium' | 'high' | 'flooded';
  sunlightNeed: number; // 0..1
  nNeed: number; // daily N draw (negative means nitrogen fixer!)
  pNeed: number;
  kNeed: number;
  daysToMature: number;
  regrowDays: number; // 0 if single-harvest, >0 if perennial/multi-harvest
  isPerennial: boolean;
  isTree: boolean;
  floodTolerant: boolean;
  frostHardy: boolean;
  dormantInCold: boolean;
  boltsInHeat: boolean;
  droughtTolerant: boolean;
  tallStormVulnerable: boolean;
  tenderHailVulnerable: boolean;
  seedCost: number;
  baseYield: number;
  basePrice: number;
  shelfLifeType: ShelfLifeType;
  shelfLifeDays: number; // e.g., 2 for FFB, 4 for tomato, 365 for storable
  livestockFeedable: boolean;
  feedNutrition: number; // hunger restored when fed to livestock
  tips: string;
  accentColor: string;
}

export interface SoilState {
  moisture: number; // 0..100
  ph: number; // 4.5..8.5
  n: number; // 0..100
  p: number; // 0..100
  k: number; // 0..100
  organicMatter: number; // 0..100
  weedPest: number; // 0..100
  mulchedDays: number;
  rowCoverDays: number;
  tilled: boolean;
}

export interface PlantedCrop {
  cropId: CropId;
  stage: 0 | 1 | 2 | 3 | 4; // 0 Seed/Sapling, 1 Sprout, 2 Vegetative, 3 Flowering/Maturing, 4 Harvestable
  progress: number; // 0..100
  health: number; // 0..100
  qualityScore: number; // 0..100
  daysPlanted: number;
  harvestCount: number;
  dormant: boolean;
  damagedNote?: string;
}

export interface Plot {
  id: number;
  row: number;
  col: number;
  soil: SoilState;
  crop: PlantedCrop | null;
  lastWateredDay: number;
}

export type SoilActionType =
  | 'irrigate'
  | 'till_clear'
  | 'compost'
  | 'lime'
  | 'sulfur'
  | 'mulch'
  | 'row_cover';

export type AnimalType = 'chicken' | 'cow' | 'pig';
export type AnimalStage = 'young' | 'growing' | 'mature';

export interface Animal {
  id: string;
  type: AnimalType;
  name: string;
  stage: AnimalStage;
  growthProgress: number; // 0..100 (young: 0-49, growing: 50-99, mature: 100)
  ageDays: number;
  health: number; // 0..100
  happiness: number; // 0..100
  hunger: number; // 0..100 (100 = full, 0 = starving)
  fedToday: boolean;
  pettedToday: boolean;
  produceReady: number; // quantity of eggs or milk ready
  produceQuality: QualityGrade;
  truffleReady: boolean; // rare pig bonus
  sheltered: boolean;
  stressedNote?: string;
}

export interface BarnItem {
  id: string;
  commodityId: Exclude<CommodityId, 'live_chicken' | 'live_cow' | 'live_pig'>;
  quality: QualityGrade;
  quantity: number;
  shelfLifeType: ShelfLifeType;
  daysLeft: number; // 999 for storable
}

export interface MarketPriceEntry {
  commodityId: CommodityId;
  currentPrice: number;
  basePrice: number;
  previousPrice: number;
  changePct: number;
  history: number[]; // last 10 days
  trendHint: 'rising' | 'falling' | 'stable';
}

export interface MarketNewsItem {
  id: string;
  day: number;
  headline: string;
  commodityId: CommodityId;
  impactPct: number;
}

export interface MarketState {
  prices: Record<CommodityId, MarketPriceEntry>;
  news: MarketNewsItem[];
  activeShock: {
    commodityId: CommodityId;
    multiplier: number;
    daysRemaining: number;
    headline: string;
  } | null;
  nextDayTip: {
    commodityId: CommodityId;
    direction: 'up' | 'down';
    headline: string;
  };
}

export type NpcId = 'dr_mali' | 'uncle_somchai' | 'nadia' | 'master_ken' | 'auntie_lin';

export interface NpcQuest {
  id: string;
  npcId: NpcId;
  title: string;
  description: string;
  type: 'harvest' | 'soil_ph' | 'compost' | 'livestock' | 'farmhouse' | 'deliver';
  targetCrop?: CropId | 'eggs' | 'milk';
  targetAmount: number;
  progress: number;
  rewardCash: number;
  rewardFriendship: number;
  completed: boolean;
  claimed: boolean;
}

export interface BulkContract {
  id: string;
  npcId: NpcId;
  title: string;
  commodityId: CropId | 'eggs' | 'milk';
  quantityRequired: number;
  bonusMultiplier: number; // e.g., 1.35 (+35%)
  daysRemaining: number;
  accepted: boolean;
  completed: boolean;
}

export interface FlashSale {
  day: number;
  itemType: 'seed' | 'feed' | 'animal';
  targetId: string;
  label: string;
  discountPct: number; // e.g., 25
}

export interface NpcState {
  id: NpcId;
  name: string;
  role: string;
  friendship: number; // 0..100 (20 per heart, max 5 hearts)
  chattedToday: boolean;
  giftedToday: boolean;
  visitingToday: boolean;
  favoriteCommodities: Array<CropId | 'eggs' | 'milk'>;
}

export type ToolId =
  | 'soil_probe'
  | 'drip_irrigation'
  | 'auto_sprinkler'
  | 'latex_rain_guard'
  | 'palm_harvester'
  | 'auto_feeder'
  | 'cooled_barn'
  | 'coop_upgrade'
  | 'cow_barn_upgrade'
  | 'pig_pen_upgrade'
  | 'climate_ventilation';

export type FurnitureId =
  | 'cozy_sofa'
  | 'agronomy_desk'
  | 'weather_barometer'
  | 'kitchen_counter'
  | 'coffee_table'
  | 'potted_bonsai'
  | 'woven_rug'
  | 'bookshelf'
  | 'solar_panels'
  | 'porch_hammock'
  | 'garden_lanterns'
  | 'koi_pond'
  | 'festival_trophy';

export interface PlacedFurniture {
  instanceId: string;
  furnitureId: FurnitureId;
  slotIndex: number;
  label?: string;
}

export interface HomesteadState {
  landTier: number; // 0: 4x4, 1: 6x4, 2: 6x6, 3: 8x6, 4: 10x6
  gridCols: number;
  gridRows: number;
  ownedTools: ToolId[];
  farmhouseLevel: 1 | 2 | 3 | 4;
  ownedFurniture: FurnitureId[]; // inventory of unplaced furniture
  placedFurniture: PlacedFurniture[];
  trophiesEarned: number;
}

export interface LoanState {
  principal: number;
  dailyInterestRate: number;
  totalInterestPaid: number;
}

export interface FloatingPopup {
  id: string;
  text: string;
  color: string;
  x: number; // normalized 0..1
  y: number; // normalized 0..1
  createdAt: number;
}

export type Currency = 'USD' | 'THB';

export type HeatmapMode = 'none' | 'moisture' | 'ph' | 'n' | 'k' | 'health';

export type GameTab =
  | 'farm'
  | 'livestock'
  | 'farmhouse'
  | 'npcs'
  | 'market'
  | 'shop'
  | 'almanac';

export interface DailyReport {
  day: number;
  weather: WeatherType;
  tempC: number;
  messages: string[];
  spoiledCount: number;
  manureProduced: number;
  autoFedCount: number;
  autoWateredCount: number;
  upkeepCost: number;
  loanInterest: number;
}

export interface GameState {
  version: number;
  climate: ClimateType;
  day: number;
  year: number;
  season: Season;
  dayInSeason: number;
  cash: number; // stored in USD internally
  currency: Currency;
  organicManure: number;
  animalFeed: number;
  compostBags: number;
  weatherToday: WeatherDay;
  forecast: WeatherDay[];
  plots: Plot[];
  animals: Animal[];
  barn: BarnItem[];
  market: MarketState;
  npcs: Record<NpcId, NpcState>;
  quests: NpcQuest[];
  contracts: BulkContract[];
  flashSale: FlashSale;
  festivalEnteredThisSeason: boolean;
  homestead: HomesteadState;
  loan: LoanState;
  stats: {
    totalHarvests: number;
    totalEarned: number;
    compostApplied: number;
    animalsSold: number;
    festivalsWon: number;
    cropsHarvestedByType: Partial<Record<CropId, number>>;
  };
  lastDailyReport: DailyReport | null;
  log: string[];
}
