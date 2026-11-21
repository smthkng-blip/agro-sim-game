import type {
  ClimateType,
  Plot,
  SoilActionType,
  SoilState,
  ToolId,
  WeatherDay,
} from './types';
import { CROP_CATALOG } from './crops';
import { WEATHER_SPECS } from './weather';

export const SOIL_ACTION_COSTS: Record<SoilActionType, number> = {
  irrigate: 0,
  till_clear: 0,
  compost: 12, // Free if player has organicManure or compostBags!
  lime: 8,
  sulfur: 8,
  mulch: 10,
  row_cover: 14,
};

export const SOIL_ACTION_LABELS: Record<
  SoilActionType,
  { name: string; short: string; description: string }
> = {
  irrigate: {
    name: 'Irrigate',
    short: 'Water',
    description: '+32% soil moisture. With Drip Irrigation Kit, waters the entire row!',
  },
  till_clear: {
    name: 'Till & Weed',
    short: 'Till/Weed',
    description: 'Clears all weeds & pests (0%) and prepares soil. Clears crop if plot is occupied.',
  },
  compost: {
    name: 'Compost / Manure',
    short: 'Compost',
    description: '+24 N, +16 P, +24 K & +14% Organic Matter. Uses free Livestock Manure first!',
  },
  lime: {
    name: 'Agricultural Lime',
    short: '+pH Lime',
    description: 'Raises soil pH by +0.5 (ideal for neutral/alkaline crops like Spinach & Corn).',
  },
  sulfur: {
    name: 'Elemental Sulfur',
    short: '-pH Sulfur',
    description: 'Lowers soil pH by -0.5 (ideal for acid-loving Rubber, Blueberry & Oil Palm).',
  },
  mulch: {
    name: 'Organic Mulch',
    short: 'Mulch',
    description: '6 days of mulch: -40% evaporation, -60% weed growth, +4% Organic Matter.',
  },
  row_cover: {
    name: 'Row Cover / Shade',
    short: 'Row Cover',
    description: '5 days of protection against Frost, Hailstorms, Heatwaves & Thunderstorms.',
  },
};

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function createInitialSoil(climate: ClimateType, index = 0): SoilState {
  const jitter = ((index * 7) % 9) - 4;
  const basePh = climate === 'tropical_monsoon' ? 5.8 : 6.4;
  return {
    moisture: clamp(58 + jitter, 42, 74),
    ph: Number(clamp(basePh + jitter * 0.05, 4.8, 7.6).toFixed(1)),
    n: clamp(64 + jitter, 50, 78),
    p: clamp(62 + jitter, 50, 76),
    k: clamp(64 + jitter, 50, 78),
    organicMatter: clamp(52 + jitter, 40, 68),
    weedPest: clamp(8 + (index % 5) * 2, 4, 18),
    mulchedDays: 0,
    rowCoverDays: 0,
    tilled: true,
  };
}

export function createPlotGrid(
  cols: number,
  rows: number,
  climate: ClimateType,
  existingPlots: Plot[] = [],
): Plot[] {
  const map = new Map<string, Plot>();
  for (const p of existingPlots) {
    map.set(`${p.row}:${p.col}`, p);
  }
  const result: Plot[] = [];
  let idCounter = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const existing = map.get(`${r}:${c}`);
      if (existing) {
        result.push({ ...existing, id: idCounter++ });
      } else {
        result.push({
          id: idCounter++,
          row: r,
          col: c,
          soil: createInitialSoil(climate, idCounter),
          crop: null,
          lastWateredDay: 0,
        });
      }
    }
  }
  return result;
}

export function applySoilAction(
  plot: Plot,
  action: SoilActionType,
  day: number,
): Plot {
  const soil = { ...plot.soil };
  let crop = plot.crop;
  let lastWateredDay = plot.lastWateredDay;

  switch (action) {
    case 'irrigate':
      soil.moisture = clamp(soil.moisture + 32, 0, 100);
      lastWateredDay = day;
      break;
    case 'till_clear':
      soil.weedPest = 0;
      soil.tilled = true;
      if (crop) {
        crop = null;
      }
      break;
    case 'compost':
      soil.n = clamp(soil.n + 24, 0, 100);
      soil.p = clamp(soil.p + 16, 0, 100);
      soil.k = clamp(soil.k + 24, 0, 100);
      soil.organicMatter = clamp(soil.organicMatter + 14, 0, 100);
      break;
    case 'lime':
      soil.ph = Number(clamp(soil.ph + 0.5, 4.5, 8.5).toFixed(1));
      break;
    case 'sulfur':
      soil.ph = Number(clamp(soil.ph - 0.5, 4.5, 8.5).toFixed(1));
      break;
    case 'mulch':
      soil.mulchedDays = 6;
      soil.organicMatter = clamp(soil.organicMatter + 4, 0, 100);
      break;
    case 'row_cover':
      soil.rowCoverDays = 5;
      break;
  }

  return {
    ...plot,
    soil,
    crop,
    lastWateredDay,
  };
}

export function simulateSoilDay(
  plot: Plot,
  weatherDay: WeatherDay,
  ownedTools: ToolId[],
  nutrientDeltas: { nDelta: number; pDelta: number; kDelta: number },
  day: number,
): { plot: Plot; autoWatered: boolean } {
  const weather = WEATHER_SPECS[weatherDay.weather];
  const soil = { ...plot.soil };
  const cropSpec = plot.crop ? CROP_CATALOG[plot.crop.cropId] : null;
  let autoWatered = false;
  let lastWateredDay = plot.lastWateredDay;

  // 1. Weather moisture delta + evaporation
  const baseEvap = 11 * weather.evaporationMultiplier;
  const mulchFactor = soil.mulchedDays > 0 ? 0.6 : 1.0;
  const dripFactor = ownedTools.includes('drip_irrigation') ? 0.75 : 1.0;
  const cropTranspiration = cropSpec ? (cropSpec.waterNeed === 'high' ? 4 : cropSpec.waterNeed === 'low' ? 1 : 2.5) : 0;

  let nextMoisture = soil.moisture + weather.moistureDelta - (baseEvap + cropTranspiration) * mulchFactor * dripFactor;

  // Natural drainage above 82% unless Paddy Rice (which holds paddy water)
  if (nextMoisture > 82 && !(cropSpec && cropSpec.floodTolerant)) {
    nextMoisture -= (nextMoisture - 82) * 0.35;
  }

  soil.moisture = Math.round(clamp(nextMoisture, 0, 100));

  // 2. Auto-Sprinkler System waters plots below 40%
  if (ownedTools.includes('auto_sprinkler') && soil.moisture < 40) {
    soil.moisture = 68;
    autoWatered = true;
    lastWateredDay = day;
  }

  // 3. Apply crop N-P-K draw (or legume fixation!) + organic matter slow release
  const organicRelease = soil.organicMatter >= 55 ? 1.5 : soil.organicMatter >= 30 ? 0.8 : 0.2;
  soil.n = Math.round(clamp(soil.n + nutrientDeltas.nDelta + organicRelease, 0, 100));
  soil.p = Math.round(clamp(soil.p + nutrientDeltas.pDelta + organicRelease * 0.6, 0, 100));
  soil.k = Math.round(clamp(soil.k + nutrientDeltas.kDelta + organicRelease * 0.8, 0, 100));

  // Organic matter slowly mineralizes
  soil.organicMatter = Math.round(clamp(soil.organicMatter - 0.6, 5, 100));

  // 4. Weed & pest pressure
  const warmWetFactor = weatherDay.tempC >= 18 && soil.moisture >= 45 ? 1.3 : 0.7;
  const weedGrowth = (soil.mulchedDays > 0 ? 2 : 5) * warmWetFactor;
  soil.weedPest = Math.round(clamp(soil.weedPest + weedGrowth, 0, 100));

  // 5. Decrement temporary protections
  if (soil.mulchedDays > 0) soil.mulchedDays -= 1;
  if (soil.rowCoverDays > 0) soil.rowCoverDays -= 1;

  return {
    plot: {
      ...plot,
      soil,
      lastWateredDay,
    },
    autoWatered,
  };
}
