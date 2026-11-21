import type {
  CropId,
  CropSpec,
  PlantedCrop,
  Plot,
  QualityGrade,
  ToolId,
  WeatherDay,
} from './types';
import { WEATHER_SPECS } from './weather';

export const CROP_CATALOG: Record<CropId, CropSpec> = {
  rubber_tree: {
    id: 'rubber_tree',
    name: 'Rubber Tree',
    scientificName: 'Hevea brasiliensis',
    productName: 'Natural Latex',
    category: 'tree',
    optTempMin: 24,
    optTempMax: 32,
    lethalTempMin: 5,
    lethalTempMax: 42,
    optPhMin: 4.5,
    optPhMax: 6.0,
    optMoistureMin: 55,
    optMoistureMax: 85,
    waterNeed: 'high',
    sunlightNeed: 0.8,
    nNeed: 4,
    pNeed: 3,
    kNeed: 5,
    daysToMature: 7,
    regrowDays: 2,
    isPerennial: true,
    isTree: true,
    floodTolerant: false,
    frostHardy: false,
    dormantInCold: false,
    boltsInHeat: false,
    droughtTolerant: false,
    tallStormVulnerable: true,
    tenderHailVulnerable: false,
    seedCost: 95,
    baseYield: 3,
    basePrice: 36,
    shelfLifeType: 'storable',
    shelfLifeDays: 365,
    livestockFeedable: false,
    feedNutrition: 0,
    tips: 'Acid-loving tropical tree (pH 4.5–6.0). Rain dilutes tapping cups unless you own the Pro Latex Knife & Rain Guard. Dried latex sheets store indefinitely!',
    accentColor: '#2d7a4f',
  },
  oil_palm: {
    id: 'oil_palm',
    name: 'Oil Palm Tree',
    scientificName: 'Elaeis guineensis',
    productName: 'Oil Palm FFB',
    category: 'tree',
    optTempMin: 25,
    optTempMax: 33,
    lethalTempMin: 8,
    lethalTempMax: 42,
    optPhMin: 4.5,
    optPhMax: 6.5,
    optMoistureMin: 60,
    optMoistureMax: 88,
    waterNeed: 'high',
    sunlightNeed: 0.9,
    nNeed: 7,
    pNeed: 4,
    kNeed: 9,
    daysToMature: 8,
    regrowDays: 2,
    isPerennial: true,
    isTree: true,
    floodTolerant: false,
    frostHardy: false,
    dormantInCold: false,
    boltsInHeat: false,
    droughtTolerant: false,
    tallStormVulnerable: true,
    tenderHailVulnerable: false,
    seedCost: 115,
    baseYield: 4,
    basePrice: 34,
    shelfLifeType: 'perishable',
    shelfLifeDays: 2,
    livestockFeedable: false,
    feedNutrition: 0,
    tips: 'Heavy Potassium (K) & Nitrogen (N) feeder producing high-value Fresh Fruit Bunches (FFB). Highly perishable (2 days) — sell promptly or cool in Barn!',
    accentColor: '#d97706',
  },
  paddy_rice: {
    id: 'paddy_rice',
    name: 'Paddy Rice',
    scientificName: 'Oryza sativa',
    productName: 'Paddy Rice',
    category: 'grain',
    optTempMin: 22,
    optTempMax: 34,
    lethalTempMin: 8,
    lethalTempMax: 42,
    optPhMin: 5.5,
    optPhMax: 7.0,
    optMoistureMin: 70,
    optMoistureMax: 100,
    waterNeed: 'flooded',
    sunlightNeed: 0.8,
    nNeed: 6,
    pNeed: 3,
    kNeed: 4,
    daysToMature: 5,
    regrowDays: 0,
    isPerennial: false,
    isTree: false,
    floodTolerant: true,
    frostHardy: false,
    dormantInCold: false,
    boltsInHeat: false,
    droughtTolerant: false,
    tallStormVulnerable: false,
    tenderHailVulnerable: true,
    seedCost: 30,
    baseYield: 5,
    basePrice: 18,
    shelfLifeType: 'storable',
    shelfLifeDays: 365,
    livestockFeedable: true,
    feedNutrition: 35,
    tips: 'Thrives in flooded wet paddies (70–100% moisture) and is completely immune to monsoon waterlogging. Storable & feeds livestock!',
    accentColor: '#84cc16',
  },
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    productName: 'Fresh Tomatoes',
    category: 'vegetable',
    optTempMin: 18,
    optTempMax: 29,
    lethalTempMin: 2,
    lethalTempMax: 38,
    optPhMin: 6.0,
    optPhMax: 6.8,
    optMoistureMin: 50,
    optMoistureMax: 75,
    waterNeed: 'medium',
    sunlightNeed: 0.85,
    nNeed: 5,
    pNeed: 5,
    kNeed: 6,
    daysToMature: 5,
    regrowDays: 2,
    isPerennial: true,
    isTree: false,
    floodTolerant: false,
    frostHardy: false,
    dormantInCold: false,
    boltsInHeat: false,
    droughtTolerant: false,
    tallStormVulnerable: true,
    tenderHailVulnerable: true,
    seedCost: 35,
    baseYield: 4,
    basePrice: 22,
    shelfLifeType: 'perishable',
    shelfLifeDays: 4,
    livestockFeedable: false,
    feedNutrition: 0,
    tips: 'Warm-season multi-harvest vine. Sensitive to frost and hail — deploy Row Cover during sudden cold snaps or storms.',
    accentColor: '#ef4444',
  },
  sweet_corn: {
    id: 'sweet_corn',
    name: 'Sweet Corn',
    scientificName: 'Zea mays',
    productName: 'Sweet Corn',
    category: 'grain',
    optTempMin: 18,
    optTempMax: 32,
    lethalTempMin: 2,
    lethalTempMax: 40,
    optPhMin: 5.8,
    optPhMax: 7.0,
    optMoistureMin: 50,
    optMoistureMax: 78,
    waterNeed: 'medium',
    sunlightNeed: 0.95,
    nNeed: 9,
    pNeed: 4,
    kNeed: 5,
    daysToMature: 5,
    regrowDays: 0,
    isPerennial: false,
    isTree: false,
    floodTolerant: false,
    frostHardy: false,
    dormantInCold: false,
    boltsInHeat: false,
    droughtTolerant: false,
    tallStormVulnerable: true,
    tenderHailVulnerable: true,
    seedCost: 28,
    baseYield: 5,
    basePrice: 19,
    shelfLifeType: 'perishable',
    shelfLifeDays: 4,
    livestockFeedable: true,
    feedNutrition: 45,
    tips: 'Heavy Nitrogen feeder that loves full sun. Rotate after Soybean to save compost, or feed surplus ears directly to Chickens, Cows & Pigs!',
    accentColor: '#eab308',
  },
  soybean: {
    id: 'soybean',
    name: 'Soybean',
    scientificName: 'Glycine max',
    productName: 'Soybeans',
    category: 'legume',
    optTempMin: 18,
    optTempMax: 31,
    lethalTempMin: 2,
    lethalTempMax: 39,
    optPhMin: 6.0,
    optPhMax: 7.0,
    optMoistureMin: 45,
    optMoistureMax: 75,
    waterNeed: 'medium',
    sunlightNeed: 0.8,
    nNeed: -4, // Legume Nitrogen Fixer! Adds N to soil daily!
    pNeed: 4,
    kNeed: 4,
    daysToMature: 4,
    regrowDays: 0,
    isPerennial: false,
    isTree: false,
    floodTolerant: false,
    frostHardy: false,
    dormantInCold: false,
    boltsInHeat: false,
    droughtTolerant: false,
    tallStormVulnerable: false,
    tenderHailVulnerable: true,
    seedCost: 24,
    baseYield: 4,
    basePrice: 20,
    shelfLifeType: 'storable',
    shelfLifeDays: 365,
    livestockFeedable: true,
    feedNutrition: 40,
    tips: 'Symbiotic legume that naturally fixes atmospheric Nitrogen (+N) into your soil! Storable and protein-rich livestock feed.',
    accentColor: '#65a30d',
  },
  spinach: {
    id: 'spinach',
    name: 'Spinach',
    scientificName: 'Spinacia oleracea',
    productName: 'Baby Spinach',
    category: 'vegetable',
    optTempMin: 8,
    optTempMax: 21,
    lethalTempMin: -5,
    lethalTempMax: 32,
    optPhMin: 6.2,
    optPhMax: 7.5,
    optMoistureMin: 50,
    optMoistureMax: 75,
    waterNeed: 'medium',
    sunlightNeed: 0.65,
    nNeed: 6,
    pNeed: 3,
    kNeed: 4,
    daysToMature: 3,
    regrowDays: 0,
    isPerennial: false,
    isTree: false,
    floodTolerant: false,
    frostHardy: true,
    dormantInCold: false,
    boltsInHeat: true,
    droughtTolerant: false,
    tallStormVulnerable: false,
    tenderHailVulnerable: true,
    seedCost: 18,
    baseYield: 4,
    basePrice: 16,
    shelfLifeType: 'perishable',
    shelfLifeDays: 3,
    livestockFeedable: false,
    feedNutrition: 0,
    tips: 'Fast-growing cool-season leafy green that shrugs off frost, but bolts rapidly in heatwaves. Use Shade Cloth in summer!',
    accentColor: '#16a34a',
  },
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    scientificName: 'Fragaria × ananassa',
    productName: 'Strawberries',
    category: 'fruit',
    optTempMin: 14,
    optTempMax: 26,
    lethalTempMin: -2,
    lethalTempMax: 35,
    optPhMin: 5.5,
    optPhMax: 6.5,
    optMoistureMin: 55,
    optMoistureMax: 78,
    waterNeed: 'medium',
    sunlightNeed: 0.85,
    nNeed: 4,
    pNeed: 5,
    kNeed: 6,
    daysToMature: 5,
    regrowDays: 2,
    isPerennial: true,
    isTree: false,
    floodTolerant: false,
    frostHardy: false,
    dormantInCold: false,
    boltsInHeat: false,
    droughtTolerant: false,
    tallStormVulnerable: false,
    tenderHailVulnerable: true,
    seedCost: 48,
    baseYield: 4,
    basePrice: 28,
    shelfLifeType: 'perishable',
    shelfLifeDays: 3,
    livestockFeedable: false,
    feedNutrition: 0,
    tips: 'Prefers slightly acidic soil (pH 5.5–6.5) and regrows sweet berries every 2 days. High market value, 3-day shelf life.',
    accentColor: '#f43f5e',
  },
  blueberry: {
    id: 'blueberry',
    name: 'Blueberry',
    scientificName: 'Vaccinium corymbosum',
    productName: 'Blueberries',
    category: 'fruit',
    optTempMin: 12,
    optTempMax: 26,
    lethalTempMin: -6,
    lethalTempMax: 35,
    optPhMin: 4.5,
    optPhMax: 5.5,
    optMoistureMin: 50,
    optMoistureMax: 75,
    waterNeed: 'medium',
    sunlightNeed: 0.8,
    nNeed: 4,
    pNeed: 4,
    kNeed: 5,
    daysToMature: 6,
    regrowDays: 2,
    isPerennial: true,
    isTree: false,
    floodTolerant: false,
    frostHardy: true,
    dormantInCold: true,
    boltsInHeat: false,
    droughtTolerant: false,
    tallStormVulnerable: false,
    tenderHailVulnerable: true,
    seedCost: 65,
    baseYield: 4,
    basePrice: 32,
    shelfLifeType: 'perishable',
    shelfLifeDays: 4,
    livestockFeedable: false,
    feedNutrition: 0,
    tips: 'Demands strongly acidic soil (pH 4.5–5.5) — apply Sulfur to lower pH! Frost-hardy perennial shrub with lucrative harvests.',
    accentColor: '#3b82f6',
  },
  potato: {
    id: 'potato',
    name: 'Potato',
    scientificName: 'Solanum tuberosum',
    productName: 'Potatoes',
    category: 'vegetable',
    optTempMin: 12,
    optTempMax: 24,
    lethalTempMin: 0,
    lethalTempMax: 34,
    optPhMin: 5.2,
    optPhMax: 6.4,
    optMoistureMin: 50,
    optMoistureMax: 75,
    waterNeed: 'medium',
    sunlightNeed: 0.75,
    nNeed: 5,
    pNeed: 5,
    kNeed: 8,
    daysToMature: 5,
    regrowDays: 0,
    isPerennial: false,
    isTree: false,
    floodTolerant: false,
    frostHardy: false,
    dormantInCold: false,
    boltsInHeat: false,
    droughtTolerant: false,
    tallStormVulnerable: false,
    tenderHailVulnerable: false,
    seedCost: 26,
    baseYield: 6,
    basePrice: 15,
    shelfLifeType: 'storable',
    shelfLifeDays: 365,
    livestockFeedable: true,
    feedNutrition: 42,
    tips: 'Cool-temperate heavy Potassium (K) feeder with generous yields. Stores long-term and is a favorite hearty feed for Pigs!',
    accentColor: '#b45309',
  },
  sunflower: {
    id: 'sunflower',
    name: 'Sunflower',
    scientificName: 'Helianthus annuus',
    productName: 'Sunflower Seeds',
    category: 'oilseed',
    optTempMin: 18,
    optTempMax: 33,
    lethalTempMin: 0,
    lethalTempMax: 42,
    optPhMin: 6.0,
    optPhMax: 7.5,
    optMoistureMin: 28,
    optMoistureMax: 68,
    waterNeed: 'low',
    sunlightNeed: 0.95,
    nNeed: 4,
    pNeed: 4,
    kNeed: 5,
    daysToMature: 4,
    regrowDays: 0,
    isPerennial: false,
    isTree: false,
    floodTolerant: false,
    frostHardy: false,
    dormantInCold: false,
    boltsInHeat: false,
    droughtTolerant: true,
    tallStormVulnerable: true,
    tenderHailVulnerable: true,
    seedCost: 22,
    baseYield: 4,
    basePrice: 21,
    shelfLifeType: 'storable',
    shelfLifeDays: 365,
    livestockFeedable: false,
    feedNutrition: 0,
    tips: 'Drought-tolerant sun-worshipper that handles Hot-Dry spells well. Stores indefinitely in the Barn.',
    accentColor: '#f59e0b',
  },
  winter_wheat: {
    id: 'winter_wheat',
    name: 'Winter Wheat',
    scientificName: 'Triticum aestivum',
    productName: 'Winter Wheat',
    category: 'grain',
    optTempMin: 6,
    optTempMax: 22,
    lethalTempMin: -12,
    lethalTempMax: 34,
    optPhMin: 6.0,
    optPhMax: 7.2,
    optMoistureMin: 40,
    optMoistureMax: 72,
    waterNeed: 'low',
    sunlightNeed: 0.75,
    nNeed: 5,
    pNeed: 4,
    kNeed: 4,
    daysToMature: 6,
    regrowDays: 0,
    isPerennial: false,
    isTree: false,
    floodTolerant: false,
    frostHardy: true,
    dormantInCold: true,
    boltsInHeat: false,
    droughtTolerant: true,
    tallStormVulnerable: false,
    tenderHailVulnerable: false,
    seedCost: 20,
    baseYield: 5,
    basePrice: 17,
    shelfLifeType: 'storable',
    shelfLifeDays: 365,
    livestockFeedable: true,
    feedNutrition: 38,
    tips: 'Cold-hardy grain that survives frost and snow blizzards safely in dormancy, resuming growth when temperatures warm. Storable & livestock feedable.',
    accentColor: '#d97706',
  },
};

export const ALL_CROP_IDS = Object.keys(CROP_CATALOG) as CropId[];

export const GROWTH_STAGE_NAMES = [
  'Seed / Sapling',
  'Sprout',
  'Vegetative',
  'Flowering / Maturing',
  'Harvestable',
] as const;

export function createPlantedCrop(cropId: CropId): PlantedCrop {
  return {
    cropId,
    stage: 0,
    progress: 0,
    health: 100,
    qualityScore: 80,
    daysPlanted: 0,
    harvestCount: 0,
    dormant: false,
  };
}

export function computeCropStage(progress: number): 0 | 1 | 2 | 3 | 4 {
  if (progress >= 100) return 4;
  if (progress >= 72) return 3;
  if (progress >= 42) return 2;
  if (progress >= 16) return 1;
  return 0;
}

export function qualityScoreToGrade(score: number): QualityGrade {
  if (score >= 82) return 'A';
  if (score >= 52) return 'B';
  return 'C';
}

export interface CropDayResult {
  crop: PlantedCrop | null;
  nDelta: number;
  pDelta: number;
  kDelta: number;
  note?: string;
  died?: boolean;
}

export function simulateCropDay(
  plot: Plot,
  weatherDay: WeatherDay,
  _ownedTools: ToolId[],
): CropDayResult {
  const planted = plot.crop;
  if (!planted) {
    return { crop: null, nDelta: 0, pDelta: 0, kDelta: 0 };
  }

  const spec = CROP_CATALOG[planted.cropId];
  const weather = WEATHER_SPECS[weatherDay.weather];
  const soil = plot.soil;
  const protectedByCover = soil.rowCoverDays > 0;
  const temp = weatherDay.tempC;

  let health = planted.health;
  let qualityScore = planted.qualityScore;
  let progress = planted.progress;
  let dormant = false;
  let note: string | undefined;

  // 1. Extreme temperature & frost/snow checks
  if (weather.frostHazard || temp <= spec.lethalTempMin) {
    if (spec.dormantInCold && temp >= spec.lethalTempMin) {
      dormant = true;
      note = 'Dormant in cold weather';
    } else if (!spec.frostHardy && !protectedByCover) {
      const frostDmg = temp <= spec.lethalTempMin ? 65 : 42;
      health -= frostDmg;
      qualityScore -= 18;
      note = 'Frost damage (needs Row Cover!)';
    } else if (protectedByCover) {
      note = 'Protected from frost by Row Cover';
    }
  }

  if (weatherDay.weather === 'snow_blizzard') {
    if (spec.dormantInCold) {
      dormant = true;
      note = 'Safely dormant under snow';
    } else if (!spec.frostHardy && !protectedByCover) {
      health -= 55;
      note = 'Blizzard freeze damage';
    } else {
      dormant = true;
      note = 'Growth paused by blizzard';
    }
  }

  // 2. Heatwave / bolting
  if (weather.heatHazard || temp >= spec.lethalTempMax) {
    if (spec.boltsInHeat && !protectedByCover) {
      health -= 34;
      qualityScore -= 22;
      note = 'Bolted in heatwave (use Shade Cloth!)';
    } else if (temp > spec.optTempMax + 3 && !spec.droughtTolerant && !protectedByCover) {
      health -= 14;
      qualityScore -= 8;
      note = 'Heat stress';
    }
  }

  // 3. Hailstorm & Thunderstorm damage
  if (weather.hailHazard && spec.tenderHailVulnerable && !protectedByCover) {
    health -= 28;
    qualityScore -= 16;
    note = 'Hail damage (use Row Cover!)';
  } else if (weather.stormHazard && spec.tallStormVulnerable && !protectedByCover) {
    health -= 18;
    qualityScore -= 10;
    note = 'Storm wind damage';
  }

  // 4. Waterlogging check (except Paddy Rice)
  if (soil.moisture > 90 && !spec.floodTolerant) {
    health -= 12;
    qualityScore -= 8;
    note = note ?? 'Waterlogged roots';
  }

  // 5. Soil pH suitability
  let phFactor = 1.0;
  if (soil.ph < spec.optPhMin) {
    const diff = spec.optPhMin - soil.ph;
    phFactor = Math.max(0.35, 1 - diff * 0.35);
    if (diff > 0.6) {
      health -= 6;
      qualityScore -= 6;
      note = note ?? `Soil too acidic (pH ${soil.ph.toFixed(1)})`;
    }
  } else if (soil.ph > spec.optPhMax) {
    const diff = soil.ph - spec.optPhMax;
    phFactor = Math.max(0.35, 1 - diff * 0.35);
    if (diff > 0.6) {
      health -= 6;
      qualityScore -= 6;
      note = note ?? `Soil too alkaline (pH ${soil.ph.toFixed(1)})`;
    }
  } else {
    qualityScore += 2.5;
  }

  // 6. Moisture suitability
  let moistureFactor = 1.0;
  if (soil.moisture < spec.optMoistureMin) {
    const deficit = (spec.optMoistureMin - soil.moisture) / Math.max(1, spec.optMoistureMin);
    moistureFactor = spec.droughtTolerant ? Math.max(0.55, 1 - deficit * 0.5) : Math.max(0.25, 1 - deficit * 0.9);
    if (soil.moisture < 20 && !spec.droughtTolerant) {
      health -= 12;
      qualityScore -= 8;
      note = note ?? 'Severe drought stress';
    }
  } else if (soil.moisture > spec.optMoistureMax && !spec.floodTolerant) {
    moistureFactor = 0.72;
  } else {
    qualityScore += 2;
  }

  // 7. Temperature suitability
  let tempFactor = 1.0;
  if (temp < spec.optTempMin) {
    tempFactor = Math.max(0.25, 1 - (spec.optTempMin - temp) * 0.07);
  } else if (temp > spec.optTempMax) {
    tempFactor = Math.max(0.35, 1 - (temp - spec.optTempMax) * 0.06);
  } else {
    qualityScore += 2;
  }

  // 8. N-P-K availability & consumption/fixation
  const nReq = Math.max(0, spec.nNeed);
  const nFactor = nReq === 0 ? 1.0 : soil.n >= nReq * 3 ? 1.05 : Math.max(0.4, soil.n / (nReq * 3));
  const pFactor = soil.p >= spec.pNeed * 3 ? 1.02 : Math.max(0.5, soil.p / (spec.pNeed * 3));
  const kFactor = soil.k >= spec.kNeed * 3 ? 1.05 : Math.max(0.4, soil.k / (spec.kNeed * 3));

  if (spec.id === 'oil_palm' && soil.k < 25) {
    note = note ?? 'Potassium (K) deficiency!';
    qualityScore -= 6;
  }
  if (nReq >= 7 && soil.n < 20) {
    note = note ?? 'Nitrogen (N) deficiency!';
    qualityScore -= 6;
  }

  const nutrientFactor = (nFactor + pFactor + kFactor) / 3;

  // 9. Sunlight & weed pressure
  const sunFactor = Math.min(1.15, weather.sunlightFactor / Math.max(0.5, spec.sunlightNeed));
  const weedPenalty = Math.max(0.55, 1 - (soil.weedPest / 100) * 0.45);
  if (soil.weedPest > 60) {
    qualityScore -= 5;
    note = note ?? 'High weed/pest pressure';
  }

  // 10. Rainbow boost & organic matter bonus
  const rainbowBonus = weatherDay.weather === 'rainbow' ? 1.15 : 1.0;
  const organicBonus = 1 + (soil.organicMatter / 100) * 0.12;

  // Calculate growth increment
  const effectiveDays = planted.harvestCount > 0 && spec.regrowDays > 0 ? spec.regrowDays : spec.daysToMature;
  const baseDailyProgress = 100 / Math.max(1, effectiveDays);

  if (!dormant && progress < 100) {
    const combinedFactor =
      phFactor *
      moistureFactor *
      tempFactor *
      nutrientFactor *
      sunFactor *
      weedPenalty *
      rainbowBonus *
      organicBonus;
    progress = Math.min(100, progress + baseDailyProgress * combinedFactor);

    // Slight health recovery when conditions are great
    if (combinedFactor >= 0.9 && !note) {
      health = Math.min(100, health + 4);
      qualityScore = Math.min(100, qualityScore + 3);
    }
  }

  health = Math.max(0, Math.min(100, Math.round(health)));
  qualityScore = Math.max(20, Math.min(100, Math.round(qualityScore)));

  // Nutrient deltas: negative spec.nNeed (Soybean) ADDS nitrogen to soil!
  const nDelta = dormant ? 0 : -spec.nNeed;
  const pDelta = dormant ? 0 : -spec.pNeed;
  const kDelta = dormant ? 0 : -spec.kNeed;

  if (health <= 0) {
    return {
      crop: null,
      nDelta,
      pDelta,
      kDelta,
      note: `${spec.name} perished (${note ?? 'severe stress'})`,
      died: true,
    };
  }

  return {
    crop: {
      ...planted,
      progress: Number(progress.toFixed(1)),
      stage: computeCropStage(progress),
      health,
      qualityScore,
      daysPlanted: planted.daysPlanted + 1,
      dormant,
      damagedNote: note,
    },
    nDelta,
    pDelta,
    kDelta,
    note,
  };
}

export interface HarvestOutput {
  cropId: CropId;
  quantity: number;
  quality: QualityGrade;
  rainReducedLatex: boolean;
  toolBonusApplied: boolean;
}

export function calculateHarvest(
  planted: PlantedCrop,
  weatherDay: WeatherDay,
  ownedTools: ToolId[],
): HarvestOutput {
  const spec = CROP_CATALOG[planted.cropId];
  const weather = WEATHER_SPECS[weatherDay.weather];

  let yieldMultiplier = 0.65 + (planted.health / 100) * 0.45;
  let rainReducedLatex = false;
  let toolBonusApplied = false;

  // Rubber Tree rain penalty unless Rain Guard owned
  if (planted.cropId === 'rubber_tree') {
    const hasRainGuard = ownedTools.includes('latex_rain_guard');
    if (hasRainGuard) {
      yieldMultiplier *= 1.25;
      toolBonusApplied = true;
    } else if (weather.latexRainPenalty > 0) {
      yieldMultiplier *= 1 - weather.latexRainPenalty;
      rainReducedLatex = true;
    }
  }

  // Oil Palm Harvester Pole & Cart bonus
  if (planted.cropId === 'oil_palm' && ownedTools.includes('palm_harvester')) {
    yieldMultiplier *= 1.2;
    toolBonusApplied = true;
  }

  const quantity = Math.max(1, Math.round(spec.baseYield * yieldMultiplier));
  const effectiveQualityScore =
    planted.qualityScore * 0.7 + planted.health * 0.3 + (toolBonusApplied ? 6 : 0);

  return {
    cropId: planted.cropId,
    quantity,
    quality: qualityScoreToGrade(effectiveQualityScore),
    rainReducedLatex,
    toolBonusApplied,
  };
}
