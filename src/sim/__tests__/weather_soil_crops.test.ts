import { describe, expect, it } from 'vitest';
import {
  ALL_WEATHER_TYPES,
  buildWeatherDay,
  CLIMATE_SPECS,
  getSeasonForDay,
  WEATHER_SPECS,
} from '../weather';
import {
  ALL_CROP_IDS,
  calculateHarvest,
  createPlantedCrop,
  CROP_CATALOG,
  simulateCropDay,
} from '../crops';
import { createInitialSoil, simulateSoilDay } from '../soil';
import {
  advanceDay,
  buyToolAction,
  createInitialState,
  harvestPlot,
  performSoilAction,
  plantCrop,
} from '../engine';
import type { Plot } from '../types';

describe('Weather & Climates', () => {
  it('supports both Tropical Monsoon and Temperate 4-Season climates with seasonal cycles', () => {
    expect(CLIMATE_SPECS.tropical_monsoon.seasons).toEqual(['hot_dry', 'monsoon_wet', 'cool_dry']);
    expect(CLIMATE_SPECS.temperate_4season.seasons).toEqual(['spring', 'summer', 'autumn', 'winter']);

    expect(getSeasonForDay('tropical_monsoon', 1).season).toBe('hot_dry');
    expect(getSeasonForDay('tropical_monsoon', 16).season).toBe('monsoon_wet');
    expect(getSeasonForDay('tropical_monsoon', 31).season).toBe('cool_dry');
    expect(getSeasonForDay('tropical_monsoon', 46)).toEqual({ season: 'hot_dry', dayInSeason: 1, year: 2 });

    expect(getSeasonForDay('temperate_4season', 1).season).toBe('spring');
    expect(getSeasonForDay('temperate_4season', 16).season).toBe('summer');
    expect(getSeasonForDay('temperate_4season', 31).season).toBe('autumn');
    expect(getSeasonForDay('temperate_4season', 46).season).toBe('winter');
  });

  it('defines all 12 distinct weather types with authentic agronomy properties', () => {
    expect(ALL_WEATHER_TYPES).toHaveLength(12);
    expect(WEATHER_SPECS.light_drizzle.moistureDelta).toBe(15);
    expect(WEATHER_SPECS.heavy_rain.moistureDelta).toBe(40);
    expect(WEATHER_SPECS.heavy_rain.waterloggingRisk).toBe(true);
    expect(WEATHER_SPECS.frost.frostHazard).toBe(true);
    expect(WEATHER_SPECS.hailstorm.hailHazard).toBe(true);
    expect(WEATHER_SPECS.heatwave.heatHazard).toBe(true);
    expect(WEATHER_SPECS.rainbow.moraleBoost).toBeGreaterThan(0);
  });
});

describe('All 12 Real-World Plants & Soil Science', () => {
  it('catalogs all 12 plants with authentic agronomy specs', () => {
    expect(ALL_CROP_IDS).toHaveLength(12);
    expect(CROP_CATALOG.rubber_tree.optPhMin).toBe(4.5);
    expect(CROP_CATALOG.rubber_tree.optPhMax).toBe(6.0);
    expect(CROP_CATALOG.rubber_tree.shelfLifeType).toBe('storable');

    expect(CROP_CATALOG.oil_palm.kNeed).toBeGreaterThanOrEqual(8);
    expect(CROP_CATALOG.oil_palm.shelfLifeType).toBe('perishable');
    expect(CROP_CATALOG.oil_palm.shelfLifeDays).toBe(2);

    expect(CROP_CATALOG.paddy_rice.floodTolerant).toBe(true);
    expect(CROP_CATALOG.soybean.nNeed).toBeLessThan(0); // Nitrogen fixer!
    expect(CROP_CATALOG.winter_wheat.dormantInCold).toBe(true);
  });

  it('Rubber Tree: heavy rain lowers latex yield unless Pro Latex Knife & Rain Guard is owned', () => {
    const readyRubber = { ...createPlantedCrop('rubber_tree'), stage: 4 as const, progress: 100, health: 100 };
    const heavyRain = buildWeatherDay('tropical_monsoon', 5, 'monsoon_wet', 'heavy_rain', () => 0.5);

    const withoutGuard = calculateHarvest(readyRubber, heavyRain, []);
    const withGuard = calculateHarvest(readyRubber, heavyRain, ['latex_rain_guard']);

    expect(withoutGuard.rainReducedLatex).toBe(true);
    expect(withGuard.rainReducedLatex).toBe(false);
    expect(withGuard.toolBonusApplied).toBe(true);
    expect(withGuard.quantity).toBeGreaterThan(withoutGuard.quantity);
  });

  it('Oil Palm: drains heavy K & N and stores as 2-day perishable FFB', () => {
    const plot: Plot = {
      id: 0,
      row: 0,
      col: 0,
      soil: { ...createInitialSoil('tropical_monsoon'), moisture: 75, ph: 5.5, n: 80, p: 70, k: 80 },
      crop: createPlantedCrop('oil_palm'),
      lastWateredDay: 1,
    };
    const sunny = buildWeatherDay('tropical_monsoon', 2, 'hot_dry', 'clear', () => 0.5);
    const res = simulateCropDay(plot, sunny, []);
    expect(res.kDelta).toBe(-9);
    expect(res.nDelta).toBe(-7);

    // Harvest into Barn and verify 2-day shelf life
    let state = createInitialState('tropical_monsoon', () => 0.5);
    state = {
      ...state,
      plots: state.plots.map((p, idx) =>
        idx === 3 ? { ...p, crop: { ...createPlantedCrop('oil_palm'), stage: 4, progress: 100 } } : p,
      ),
    };
    const h = harvestPlot(state, 3, false);
    expect(h.ok).toBe(true);
    const ffb = h.state.barn.find((b) => b.commodityId === 'oil_palm');
    expect(ffb).toBeDefined();
    expect(ffb?.daysLeft).toBe(2);
  });

  it('Soybean fixes Nitrogen into the soil naturally', () => {
    const plot: Plot = {
      id: 1,
      row: 0,
      col: 1,
      soil: { ...createInitialSoil('temperate_4season'), n: 40, ph: 6.5, moisture: 60 },
      crop: createPlantedCrop('soybean'),
      lastWateredDay: 1,
    };
    const sunny = buildWeatherDay('temperate_4season', 2, 'summer', 'clear', () => 0.5);
    const cropRes = simulateCropDay(plot, sunny, []);
    expect(cropRes.nDelta).toBeGreaterThan(0);

    const soilRes = simulateSoilDay(plot, sunny, [], cropRes, 2);
    expect(soilRes.plot.soil.n).toBeGreaterThan(40);
  });

  it('Row Cover protects tender crops from Frost and Hailstorm, while Winter Wheat survives Blizzard dormant', () => {
    const frostDay = buildWeatherDay('temperate_4season', 3, 'autumn', 'frost', () => 0.2);
    const hailDay = buildWeatherDay('temperate_4season', 4, 'spring', 'hailstorm', () => 0.5);
    const blizzardDay = buildWeatherDay('temperate_4season', 5, 'winter', 'snow_blizzard', () => 0.3);

    const exposedTomato: Plot = {
      id: 0,
      row: 0,
      col: 0,
      soil: { ...createInitialSoil('temperate_4season'), rowCoverDays: 0 },
      crop: createPlantedCrop('tomato'),
      lastWateredDay: 1,
    };
    const coveredTomato: Plot = {
      ...exposedTomato,
      soil: { ...exposedTomato.soil, rowCoverDays: 3 },
    };

    const frostExposed = simulateCropDay(exposedTomato, frostDay, []);
    const frostCovered = simulateCropDay(coveredTomato, frostDay, []);
    expect((frostCovered.crop?.health ?? 0)).toBeGreaterThan(frostExposed.crop?.health ?? 0);

    const hailExposed = simulateCropDay(exposedTomato, hailDay, []);
    const hailCovered = simulateCropDay(coveredTomato, hailDay, []);
    expect((hailCovered.crop?.health ?? 0)).toBeGreaterThan(hailExposed.crop?.health ?? 0);

    const wheatPlot: Plot = {
      id: 2,
      row: 0,
      col: 2,
      soil: createInitialSoil('temperate_4season'),
      crop: createPlantedCrop('winter_wheat'),
      lastWateredDay: 1,
    };
    const wheatRes = simulateCropDay(wheatPlot, blizzardDay, []);
    expect(wheatRes.crop).not.toBeNull();
    expect(wheatRes.crop?.dormant).toBe(true);
    expect(wheatRes.crop?.health).toBeGreaterThan(80);
  });

  it('Soil actions: free Livestock Manure compost, pH Lime/Sulfur, Drip Irrigation row watering, and Auto-Sprinkler', () => {
    let state = createInitialState('tropical_monsoon', () => 0.5);
    const startManure = state.organicManure;
    const startCash = state.cash;

    // Compost uses free manure first!
    const compRes = performSoilAction(state, 2, 'compost');
    expect(compRes.ok).toBe(true);
    expect(compRes.state.organicManure).toBe(startManure - 1);
    expect(compRes.state.cash).toBe(startCash);
    state = compRes.state;

    // Sulfur lowers pH, Lime raises pH
    const beforePh = state.plots[2].soil.ph;
    state = performSoilAction(state, 2, 'sulfur').state;
    expect(state.plots[2].soil.ph).toBeCloseTo(beforePh - 0.5, 1);
    state = performSoilAction(state, 2, 'lime').state;
    expect(state.plots[2].soil.ph).toBeCloseTo(beforePh, 1);

    // Plant crop on empty plot
    const plantRes = plantCrop(state, 2, 'paddy_rice');
    expect(plantRes.ok).toBe(true);
    state = plantRes.state;

    // Drip Irrigation waters entire row
    state = buyToolAction(state, 'drip_irrigation').state;
    state = {
      ...state,
      plots: state.plots.map((p) => (p.row === 0 ? { ...p, soil: { ...p.soil, moisture: 30 } } : p)),
    };
    state = performSoilAction(state, 0, 'irrigate').state;
    const row0Plots = state.plots.filter((p) => p.row === 0);
    expect(row0Plots.every((p) => p.soil.moisture === 62)).toBe(true);

    // Auto-Sprinkler auto-waters dry plots < 40% on day advance
    state = buyToolAction(state, 'auto_sprinkler').state;
    state = {
      ...state,
      plots: state.plots.map((p) => ({ ...p, soil: { ...p.soil, moisture: 15 } })),
    };
    const nextDayState = advanceDay(state, () => 0.5);
    expect(nextDayState.lastDailyReport?.autoWateredCount).toBeGreaterThan(0);
  });
});
