import type {
  BarnItem,
  CommodityId,
  CropId,
  Currency,
  LoanState,
  MarketNewsItem,
  MarketPriceEntry,
  MarketState,
  QualityGrade,
  Season,
  ShelfLifeType,
  ToolId,
  WeatherType,
} from './types';
import { ALL_CROP_IDS, CROP_CATALOG } from './crops';
import { ANIMAL_SPECS } from './livestock';

export const THB_PER_USD = 35;

export const QUALITY_MULTIPLIERS: Record<QualityGrade, number> = {
  A: 1.2,
  B: 1.0,
  C: 0.75,
};

export interface CommodityMeta {
  id: CommodityId;
  name: string;
  basePrice: number;
  category: 'crop' | 'animal_product' | 'live_animal';
  shelfLifeType: ShelfLifeType;
  shelfLifeDays: number;
}

export const COMMODITY_META: Record<CommodityId, CommodityMeta> = {
  rubber_tree: {
    id: 'rubber_tree',
    name: CROP_CATALOG.rubber_tree.productName,
    basePrice: CROP_CATALOG.rubber_tree.basePrice,
    category: 'crop',
    shelfLifeType: 'storable',
    shelfLifeDays: 365,
  },
  oil_palm: {
    id: 'oil_palm',
    name: CROP_CATALOG.oil_palm.productName,
    basePrice: CROP_CATALOG.oil_palm.basePrice,
    category: 'crop',
    shelfLifeType: 'perishable',
    shelfLifeDays: 2,
  },
  paddy_rice: {
    id: 'paddy_rice',
    name: CROP_CATALOG.paddy_rice.productName,
    basePrice: CROP_CATALOG.paddy_rice.basePrice,
    category: 'crop',
    shelfLifeType: 'storable',
    shelfLifeDays: 365,
  },
  tomato: {
    id: 'tomato',
    name: CROP_CATALOG.tomato.productName,
    basePrice: CROP_CATALOG.tomato.basePrice,
    category: 'crop',
    shelfLifeType: 'perishable',
    shelfLifeDays: 4,
  },
  sweet_corn: {
    id: 'sweet_corn',
    name: CROP_CATALOG.sweet_corn.productName,
    basePrice: CROP_CATALOG.sweet_corn.basePrice,
    category: 'crop',
    shelfLifeType: 'perishable',
    shelfLifeDays: 4,
  },
  soybean: {
    id: 'soybean',
    name: CROP_CATALOG.soybean.productName,
    basePrice: CROP_CATALOG.soybean.basePrice,
    category: 'crop',
    shelfLifeType: 'storable',
    shelfLifeDays: 365,
  },
  spinach: {
    id: 'spinach',
    name: CROP_CATALOG.spinach.productName,
    basePrice: CROP_CATALOG.spinach.basePrice,
    category: 'crop',
    shelfLifeType: 'perishable',
    shelfLifeDays: 3,
  },
  strawberry: {
    id: 'strawberry',
    name: CROP_CATALOG.strawberry.productName,
    basePrice: CROP_CATALOG.strawberry.basePrice,
    category: 'crop',
    shelfLifeType: 'perishable',
    shelfLifeDays: 3,
  },
  blueberry: {
    id: 'blueberry',
    name: CROP_CATALOG.blueberry.productName,
    basePrice: CROP_CATALOG.blueberry.basePrice,
    category: 'crop',
    shelfLifeType: 'perishable',
    shelfLifeDays: 4,
  },
  potato: {
    id: 'potato',
    name: CROP_CATALOG.potato.productName,
    basePrice: CROP_CATALOG.potato.basePrice,
    category: 'crop',
    shelfLifeType: 'storable',
    shelfLifeDays: 365,
  },
  sunflower: {
    id: 'sunflower',
    name: CROP_CATALOG.sunflower.productName,
    basePrice: CROP_CATALOG.sunflower.basePrice,
    category: 'crop',
    shelfLifeType: 'storable',
    shelfLifeDays: 365,
  },
  winter_wheat: {
    id: 'winter_wheat',
    name: CROP_CATALOG.winter_wheat.productName,
    basePrice: CROP_CATALOG.winter_wheat.basePrice,
    category: 'crop',
    shelfLifeType: 'storable',
    shelfLifeDays: 365,
  },
  eggs: {
    id: 'eggs',
    name: 'Fresh Eggs',
    basePrice: 14,
    category: 'animal_product',
    shelfLifeType: 'perishable',
    shelfLifeDays: 4,
  },
  milk: {
    id: 'milk',
    name: 'Fresh Milk',
    basePrice: 24,
    category: 'animal_product',
    shelfLifeType: 'perishable',
    shelfLifeDays: 2,
  },
  truffle: {
    id: 'truffle',
    name: 'Black Truffle',
    basePrice: 145,
    category: 'animal_product',
    shelfLifeType: 'perishable',
    shelfLifeDays: 5,
  },
  live_chicken: {
    id: 'live_chicken',
    name: 'Live Adult Hen',
    basePrice: ANIMAL_SPECS.chicken.baseLivePrice,
    category: 'live_animal',
    shelfLifeType: 'storable',
    shelfLifeDays: 365,
  },
  live_cow: {
    id: 'live_cow',
    name: 'Live Dairy Cow',
    basePrice: ANIMAL_SPECS.cow.baseLivePrice,
    category: 'live_animal',
    shelfLifeType: 'storable',
    shelfLifeDays: 365,
  },
  live_pig: {
    id: 'live_pig',
    name: 'Live Market Hog',
    basePrice: ANIMAL_SPECS.pig.baseLivePrice,
    category: 'live_animal',
    shelfLifeType: 'storable',
    shelfLifeDays: 365,
  },
};

export const ALL_COMMODITY_IDS = Object.keys(COMMODITY_META) as CommodityId[];

export function formatMoney(amountUsd: number, currency: Currency): string {
  if (currency === 'THB') {
    const thb = Math.round(amountUsd * THB_PER_USD);
    return `฿${thb.toLocaleString('en-US')}`;
  }
  return `$${Math.round(amountUsd).toLocaleString('en-US')}`;
}

interface NewsTemplate {
  headline: string;
  commodityId: CommodityId;
  multiplier: number;
  impactPct: number;
}

const MARKET_NEWS_TEMPLATES: NewsTemplate[] = [
  { headline: 'Tire export boom: Natural Latex +25%', commodityId: 'rubber_tree', multiplier: 1.25, impactPct: 25 },
  { headline: 'Edible oil surge: Oil Palm FFB +20%', commodityId: 'oil_palm', multiplier: 1.2, impactPct: 20 },
  { headline: 'Bakery boom: Fresh Eggs +25%', commodityId: 'eggs', multiplier: 1.25, impactPct: 25 },
  { headline: 'Festival demand: Market Hogs +22%', commodityId: 'live_pig', multiplier: 1.22, impactPct: 22 },
  { headline: 'Artisan cheese rush: Fresh Milk +24%', commodityId: 'milk', multiplier: 1.24, impactPct: 24 },
  { headline: 'Regional grain order: Paddy Rice +18%', commodityId: 'paddy_rice', multiplier: 1.18, impactPct: 18 },
  { headline: 'Smoothie café craze: Blueberries +22%', commodityId: 'blueberry', multiplier: 1.22, impactPct: 22 },
  { headline: 'Dessert fair opens: Strawberries +20%', commodityId: 'strawberry', multiplier: 1.2, impactPct: 20 },
  { headline: 'Plant-protein demand: Soybeans +18%', commodityId: 'soybean', multiplier: 1.18, impactPct: 18 },
  { headline: 'Bumper imports dip Sweet Corn -14%', commodityId: 'sweet_corn', multiplier: 0.86, impactPct: -14 },
  { headline: 'Culinary spice craze: Fresh Tomatoes +19%', commodityId: 'tomato', multiplier: 1.19, impactPct: 19 },
  { headline: 'Dairy expansion drive: Live Dairy Cows +18%', commodityId: 'live_cow', multiplier: 1.18, impactPct: 18 },
  { headline: 'Poultry auction surge: Live Hens +20%', commodityId: 'live_chicken', multiplier: 1.2, impactPct: 20 },
  { headline: 'Flour mill contract: Winter Wheat +18%', commodityId: 'winter_wheat', multiplier: 1.18, impactPct: 18 },
  { headline: 'Cooking oil rally: Sunflower Seeds +20%', commodityId: 'sunflower', multiplier: 1.2, impactPct: 20 },
  { headline: 'Winter stew season: Potatoes +18%', commodityId: 'potato', multiplier: 1.18, impactPct: 18 },
];

export function createInitialMarket(rng: () => number = Math.random): MarketState {
  const prices = {} as Record<CommodityId, MarketPriceEntry>;

  for (const id of ALL_COMMODITY_IDS) {
    const base = COMMODITY_META[id].basePrice;
    const history: number[] = [];
    let p = base;
    for (let i = 0; i < 6; i++) {
      const jitter = 0.94 + rng() * 0.12;
      p = Math.max(Math.round(base * 0.7), Math.round(base * jitter));
      history.push(p);
    }
    const prev = history[history.length - 2] ?? base;
    const curr = history[history.length - 1] ?? base;
    const changePct = Math.round(((curr - prev) / Math.max(1, prev)) * 100);
    prices[id] = {
      commodityId: id,
      currentPrice: curr,
      basePrice: base,
      previousPrice: prev,
      changePct,
      history,
      trendHint: changePct > 2 ? 'rising' : changePct < -2 ? 'falling' : 'stable',
    };
  }

  const firstNews = MARKET_NEWS_TEMPLATES[Math.floor(rng() * 4)];
  const nextTipTemplate = MARKET_NEWS_TEMPLATES[Math.floor(rng() * MARKET_NEWS_TEMPLATES.length)];

  return {
    prices,
    news: [
      {
        id: 'news_init',
        day: 1,
        headline: firstNews.headline,
        commodityId: firstNews.commodityId,
        impactPct: firstNews.impactPct,
      },
    ],
    activeShock: {
      commodityId: firstNews.commodityId,
      multiplier: firstNews.multiplier,
      daysRemaining: 2,
      headline: firstNews.headline,
    },
    nextDayTip: {
      commodityId: nextTipTemplate.commodityId,
      direction: nextTipTemplate.impactPct >= 0 ? 'up' : 'down',
      headline: nextTipTemplate.headline,
    },
  };
}

function getSeasonalDemandMultiplier(commodityId: CommodityId, season: Season): number {
  if (season === 'monsoon_wet' && (commodityId === 'rubber_tree' || commodityId === 'oil_palm')) {
    return 1.1; // Rain supply tightness boosts latex & FFB prices
  }
  if ((season === 'winter' || season === 'cool_dry') && (commodityId === 'potato' || commodityId === 'winter_wheat' || commodityId === 'spinach')) {
    return 1.08;
  }
  if ((season === 'summer' || season === 'hot_dry') && (commodityId === 'strawberry' || commodityId === 'blueberry' || commodityId === 'tomato')) {
    return 1.08;
  }
  return 1.0;
}

export function simulateMarketDay(
  market: MarketState,
  day: number,
  season: Season,
  weather: WeatherType,
  rng: () => number = Math.random,
): MarketState {
  let activeShock = market.activeShock
    ? { ...market.activeShock, daysRemaining: market.activeShock.daysRemaining - 1 }
    : null;

  const news: MarketNewsItem[] = [...market.news];
  let nextDayTip = market.nextDayTip;

  if (!activeShock || activeShock.daysRemaining <= 0) {
    // Trigger the tipped shock or pick a fresh news item
    const match = MARKET_NEWS_TEMPLATES.find((t) => t.headline === market.nextDayTip.headline) ??
      MARKET_NEWS_TEMPLATES[Math.floor(rng() * MARKET_NEWS_TEMPLATES.length)];

    activeShock = {
      commodityId: match.commodityId,
      multiplier: match.multiplier,
      daysRemaining: 2 + Math.floor(rng() * 2),
      headline: match.headline,
    };

    news.unshift({
      id: `news_${day}_${Math.floor(rng() * 10000)}`,
      day,
      headline: match.headline,
      commodityId: match.commodityId,
      impactPct: match.impactPct,
    });

    const upcoming = MARKET_NEWS_TEMPLATES[Math.floor(rng() * MARKET_NEWS_TEMPLATES.length)];
    nextDayTip = {
      commodityId: upcoming.commodityId,
      direction: upcoming.impactPct >= 0 ? 'up' : 'down',
      headline: upcoming.headline,
    };
  }

  const prices = {} as Record<CommodityId, MarketPriceEntry>;

  for (const id of ALL_COMMODITY_IDS) {
    const prevEntry = market.prices[id];
    const base = prevEntry.basePrice;
    // Mean-reverting random walk
    const meanPull = (base - prevEntry.currentPrice) * 0.22;
    const cycleWave = Math.sin((day + id.length * 3) * 0.45) * base * 0.06;
    const noise = (rng() * 0.14 - 0.07) * base;
    const seasonalMult = getSeasonalDemandMultiplier(id, season);
    const weatherShock =
      (weather === 'heavy_rain' || weather === 'thunderstorm') && id === 'rubber_tree'
        ? 1.08
        : weather === 'heatwave' && (id === 'spinach' || id === 'milk')
          ? 1.08
          : 1.0;

    let rawNext = (prevEntry.currentPrice + meanPull + cycleWave + noise) * seasonalMult * weatherShock;

    if (activeShock && activeShock.commodityId === id) {
      rawNext = base * activeShock.multiplier * (0.97 + rng() * 0.06);
    }

    const clamped = Math.max(
      Math.round(base * 0.65),
      Math.min(Math.round(base * 1.55), Math.round(rawNext)),
    );

    const changePct = Math.round(((clamped - prevEntry.currentPrice) / Math.max(1, prevEntry.currentPrice)) * 100);
    const history = [...prevEntry.history.slice(-9), clamped];

    let trendHint: 'rising' | 'falling' | 'stable' = 'stable';
    if (nextDayTip.commodityId === id) {
      trendHint = nextDayTip.direction === 'up' ? 'rising' : 'falling';
    } else if (clamped < base * 0.9) {
      trendHint = 'rising';
    } else if (clamped > base * 1.15) {
      trendHint = 'falling';
    }

    prices[id] = {
      commodityId: id,
      currentPrice: clamped,
      basePrice: base,
      previousPrice: prevEntry.currentPrice,
      changePct,
      history,
      trendHint,
    };
  }

  return {
    prices,
    news: news.slice(0, 8),
    activeShock,
    nextDayTip,
  };
}

export function getUnitSellPrice(
  market: MarketState,
  commodityId: CommodityId,
  quality: QualityGrade,
): number {
  const baseMarket = market.prices[commodityId].currentPrice;
  return Math.max(1, Math.round(baseMarket * QUALITY_MULTIPLIERS[quality]));
}

export function getBarnCapacity(ownedTools: ToolId[]): number {
  return ownedTools.includes('cooled_barn') ? 150 : 60;
}

export function getBarnUsedUnits(barn: BarnItem[]): number {
  return barn.reduce((acc, item) => acc + item.quantity, 0);
}

export function addToBarn(
  barn: BarnItem[],
  commodityId: BarnItem['commodityId'],
  quality: QualityGrade,
  quantity: number,
  ownedTools: ToolId[],
): { barn: BarnItem[]; added: number; overflow: number } {
  const cap = getBarnCapacity(ownedTools);
  const used = getBarnUsedUnits(barn);
  const space = Math.max(0, cap - used);
  const added = Math.min(quantity, space);
  const overflow = quantity - added;

  if (added <= 0) {
    return { barn, added: 0, overflow };
  }

  const meta = COMMODITY_META[commodityId];
  const cooledBonus = ownedTools.includes('cooled_barn') && meta.shelfLifeType === 'perishable' ? 1 : 0;
  const daysLeft = meta.shelfLifeType === 'storable' ? 999 : meta.shelfLifeDays + cooledBonus;

  const nextBarn = [...barn];
  const existingIdx = nextBarn.findIndex(
    (b) => b.commodityId === commodityId && b.quality === quality && b.daysLeft === daysLeft,
  );

  if (existingIdx >= 0) {
    nextBarn[existingIdx] = {
      ...nextBarn[existingIdx],
      quantity: nextBarn[existingIdx].quantity + added,
    };
  } else {
    nextBarn.push({
      id: `barn_${commodityId}_${quality}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      commodityId,
      quality,
      quantity: added,
      shelfLifeType: meta.shelfLifeType,
      daysLeft,
    });
  }

  return { barn: nextBarn, added, overflow };
}

export function simulateBarnSpoilage(barn: BarnItem[]): {
  barn: BarnItem[];
  spoiledCount: number;
  spoiledNames: string[];
} {
  let spoiledCount = 0;
  const spoiledNames: string[] = [];
  const nextBarn: BarnItem[] = [];

  for (const item of barn) {
    if (item.shelfLifeType === 'storable') {
      nextBarn.push(item);
      continue;
    }
    const nextDays = item.daysLeft - 1;
    if (nextDays <= 0) {
      spoiledCount += item.quantity;
      spoiledNames.push(`${item.quantity}x ${COMMODITY_META[item.commodityId].name}`);
    } else {
      nextBarn.push({ ...item, daysLeft: nextDays });
    }
  }

  return { barn: nextBarn, spoiledCount, spoiledNames };
}

export function consumeCropFromBarn(
  barn: BarnItem[],
  cropId: CropId,
  amount = 1,
): { barn: BarnItem[]; consumed: boolean } {
  const idx = barn.findIndex((b) => b.commodityId === cropId && b.quantity >= amount);
  if (idx < 0) return { barn, consumed: false };
  const nextBarn = [...barn];
  const item = nextBarn[idx];
  if (item.quantity === amount) {
    nextBarn.splice(idx, 1);
  } else {
    nextBarn[idx] = { ...item, quantity: item.quantity - amount };
  }
  return { barn: nextBarn, consumed: true };
}

export function createInitialLoan(): LoanState {
  return {
    principal: 0,
    dailyInterestRate: 0.005, // 0.5% simple daily interest
    totalInterestPaid: 0,
  };
}

export function calculateDailyLoanInterest(loan: LoanState): number {
  if (loan.principal <= 0) return 0;
  return Math.max(1, Math.round(loan.principal * loan.dailyInterestRate));
}

export function getAllCropCommodities(): CropId[] {
  return ALL_CROP_IDS;
}
