import type {
  AnimalType,
  BarnItem,
  ClimateType,
  CropId,
  Currency,
  DailyReport,
  FurnitureId,
  GameState,
  NpcId,
  SoilActionType,
  ToolId,
} from './types';
import {
  extendForecast,
  generateInitialWeatherAndForecast,
  getSeasonForDay,
  SEASON_LABELS,
  WEATHER_SPECS,
} from './weather';
import {
  applySoilAction,
  createPlotGrid,
  simulateSoilDay,
  SOIL_ACTION_COSTS,
} from './soil';
import {
  calculateHarvest,
  createPlantedCrop,
  CROP_CATALOG,
  simulateCropDay,
} from './crops';
import {
  ANIMAL_SPECS,
  calculateAnimalResalePrice,
  createAnimal,
  feedAnimal,
  feedAnimalWithCrop,
  getAnimalCapacity,
  petAnimal,
  simulateLivestockDay,
} from './livestock';
import {
  addToBarn,
  calculateDailyLoanInterest,
  COMMODITY_META,
  consumeCropFromBarn,
  createInitialLoan,
  createInitialMarket,
  formatMoney,
  getUnitSellPrice,
  simulateBarnSpoilage,
  simulateMarketDay,
} from './market';
import {
  createInitialContracts,
  createInitialNpcs,
  createInitialQuests,
  evaluateQuestProgress,
  generateFlashSale,
  getNadiaDiscountMultiplier,
  refreshDailyNpcState,
} from './npcs';
import {
  createInitialHomestead,
  FARMHOUSE_LEVELS,
  FURNITURE_CATALOG,
  getDailyHomesteadUpkeep,
  hasPlacedFurniture,
  LAND_TIERS,
  TOOL_CATALOG,
} from './homestead';

export const SAVE_STORAGE_KEY = 'terracraft_agronomy_save_v1';
export const STARTING_CASH_USD = 2500;
export const ANIMAL_FEED_UNIT_COST = 8;
export const COMPOST_BAG_UNIT_COST = 12;

export interface ActionResult {
  state: GameState;
  ok: boolean;
  message: string;
  popupText?: string;
  popupColor?: string;
}

function appendLog(log: string[], entry: string): string[] {
  return [entry, ...log].slice(0, 40);
}

export function createInitialState(
  climate: ClimateType = 'tropical_monsoon',
  rng: () => number = Math.random,
): GameState {
  const homestead = createInitialHomestead();
  const { today, forecast } = generateInitialWeatherAndForecast(climate, 1, 5, rng);
  const { season, dayInSeason, year } = getSeasonForDay(climate, 1);
  const plots = createPlotGrid(homestead.gridCols, homestead.gridRows, climate);

  // Seed 2 starter crops suited to the chosen climate so the farm feels alive on Day 1
  if (climate === 'tropical_monsoon') {
    plots[0] = { ...plots[0], crop: { ...createPlantedCrop('paddy_rice'), progress: 45, stage: 2 } };
    plots[1] = { ...plots[1], crop: { ...createPlantedCrop('rubber_tree'), progress: 30, stage: 1 } };
  } else {
    plots[0] = { ...plots[0], crop: { ...createPlantedCrop('spinach'), progress: 50, stage: 2 } };
    plots[1] = { ...plots[1], crop: { ...createPlantedCrop('strawberry'), progress: 35, stage: 1 } };
  }

  // Start with 1 mature hen & 1 young chick so pasture is immediately lively
  const starterHen = createAnimal('chicken', true, 0, homestead.ownedTools, today);
  const starterChick = createAnimal('chicken', false, 1, homestead.ownedTools, today);

  const state: GameState = {
    version: 1,
    climate,
    day: 1,
    year,
    season,
    dayInSeason,
    cash: STARTING_CASH_USD,
    currency: 'USD',
    organicManure: 3,
    animalFeed: 8,
    compostBags: 2,
    weatherToday: today,
    forecast,
    plots,
    animals: [starterHen, starterChick],
    barn: [],
    market: createInitialMarket(rng),
    npcs: createInitialNpcs(),
    quests: createInitialQuests(),
    contracts: createInitialContracts(),
    flashSale: generateFlashSale(1, rng),
    festivalEnteredThisSeason: false,
    homestead,
    loan: createInitialLoan(),
    stats: {
      totalHarvests: 0,
      totalEarned: 0,
      compostApplied: 0,
      animalsSold: 0,
      festivalsWon: 0,
      cropsHarvestedByType: {},
    },
    lastDailyReport: null,
    log: [
      `Welcome to TerraCraft Agronomy (${climate === 'tropical_monsoon' ? 'Tropical Monsoon' : 'Temperate 4-Season'})! Starting capital: $2,500.`,
    ],
  };

  return {
    ...state,
    quests: evaluateQuestProgress(state),
  };
}

export function getSeedPrice(state: GameState, cropId: CropId): number {
  const base = CROP_CATALOG[cropId].seedCost;
  const nadiaMult = getNadiaDiscountMultiplier(state.npcs);
  const flashMult =
    state.flashSale.itemType === 'seed' && state.flashSale.targetId === cropId
      ? 1 - state.flashSale.discountPct / 100
      : 1;
  return Math.max(5, Math.round(base * nadiaMult * flashMult));
}

export function getAnimalBuyPrice(
  state: GameState,
  type: AnimalType,
  asMature: boolean,
): number {
  const spec = ANIMAL_SPECS[type];
  const base = asMature ? spec.buyCostMature : spec.buyCostYoung;
  const nadiaMult = getNadiaDiscountMultiplier(state.npcs);
  const flashMult =
    !asMature && state.flashSale.itemType === 'animal' && state.flashSale.targetId === type
      ? 1 - state.flashSale.discountPct / 100
      : 1;
  return Math.max(15, Math.round(base * nadiaMult * flashMult));
}

export function getFeedBagPrice(state: GameState): number {
  const nadiaMult = getNadiaDiscountMultiplier(state.npcs);
  const flashMult =
    state.flashSale.itemType === 'feed' ? 1 - state.flashSale.discountPct / 100 : 1;
  return Math.max(3, Math.round(ANIMAL_FEED_UNIT_COST * nadiaMult * flashMult));
}

export function plantCrop(
  state: GameState,
  plotId: number,
  cropId: CropId,
): ActionResult {
  const idx = state.plots.findIndex((p) => p.id === plotId);
  if (idx < 0) return { state, ok: false, message: 'Plot not found.' };
  const plot = state.plots[idx];
  if (plot.crop) return { state, ok: false, message: 'Plot already has a crop. Till/Clear it first.' };

  const cost = getSeedPrice(state, cropId);
  if (state.cash < cost) {
    return {
      state,
      ok: false,
      message: `Not enough funds for ${CROP_CATALOG[cropId].name} (${formatMoney(cost, state.currency)}).`,
    };
  }

  const nextPlots = [...state.plots];
  nextPlots[idx] = {
    ...plot,
    crop: createPlantedCrop(cropId),
  };

  const nextState: GameState = {
    ...state,
    cash: state.cash - cost,
    plots: nextPlots,
    log: appendLog(
      state.log,
      `Planted ${CROP_CATALOG[cropId].name} on R${plot.row + 1}C${plot.col + 1} (-${formatMoney(cost, state.currency)}).`,
    ),
  };

  return {
    state: nextState,
    ok: true,
    message: `Planted ${CROP_CATALOG[cropId].name}!`,
    popupText: `Planted ${CROP_CATALOG[cropId].name}`,
    popupColor: '#22c55e',
  };
}

export function performSoilAction(
  state: GameState,
  plotId: number,
  action: SoilActionType,
): ActionResult {
  const idx = state.plots.findIndex((p) => p.id === plotId);
  if (idx < 0) return { state, ok: false, message: 'Plot not found.' };
  const plot = state.plots[idx];

  // Drip Irrigation Kit waters the entire row when irrigating!
  if (action === 'irrigate' && state.homestead.ownedTools.includes('drip_irrigation')) {
    const nextPlots = state.plots.map((p) =>
      p.row === plot.row ? applySoilAction(p, 'irrigate', state.day) : p,
    );
    return {
      state: {
        ...state,
        plots: nextPlots,
        log: appendLog(state.log, `Drip-irrigated Row ${plot.row + 1} (+32% moisture).`),
      },
      ok: true,
      message: `Drip-irrigated Row ${plot.row + 1}!`,
      popupText: `Row ${plot.row + 1} Watered!`,
      popupColor: '#38bdf8',
    };
  }

  let cash = state.cash;
  let organicManure = state.organicManure;
  let compostBags = state.compostBags;
  let usedFreeManure = false;

  if (action === 'compost') {
    if (organicManure > 0) {
      organicManure -= 1;
      usedFreeManure = true;
    } else if (compostBags > 0) {
      compostBags -= 1;
    } else {
      const cost = SOIL_ACTION_COSTS.compost;
      if (cash < cost) {
        return { state, ok: false, message: `Need ${formatMoney(cost, state.currency)} or Livestock Manure for compost.` };
      }
      cash -= cost;
    }
  } else {
    const cost = SOIL_ACTION_COSTS[action];
    if (cash < cost) {
      return { state, ok: false, message: `Not enough funds (${formatMoney(cost, state.currency)}).` };
    }
    cash -= cost;
  }

  const nextPlots = [...state.plots];
  nextPlots[idx] = applySoilAction(plot, action, state.day);

  const nextStats =
    action === 'compost'
      ? { ...state.stats, compostApplied: state.stats.compostApplied + 1 }
      : state.stats;

  const updated: GameState = {
    ...state,
    cash,
    organicManure,
    compostBags,
    plots: nextPlots,
    stats: nextStats,
    log: appendLog(
      state.log,
      action === 'compost'
        ? `Applied ${usedFreeManure ? 'Free Livestock Manure' : 'Compost'} to R${plot.row + 1}C${plot.col + 1}.`
        : `Applied ${action.replace('_', ' ')} on R${plot.row + 1}C${plot.col + 1}.`,
    ),
  };

  return {
    state: { ...updated, quests: evaluateQuestProgress(updated) },
    ok: true,
    message: usedFreeManure ? 'Applied Free Livestock Manure Compost!' : `Applied ${action.replace('_', ' ')}!`,
    popupText:
      action === 'irrigate'
        ? '+32% Moisture'
        : action === 'compost'
          ? usedFreeManure
            ? '+Free Manure NPK!'
            : '+Compost NPK!'
          : action === 'lime'
            ? '+0.5 pH'
            : action === 'sulfur'
              ? '-0.5 pH'
              : action === 'row_cover'
                ? 'Row Cover Active!'
                : action === 'mulch'
                  ? 'Mulched (6d)'
                  : 'Tilled & Cleared',
    popupColor: action === 'irrigate' ? '#38bdf8' : '#a3e635',
  };
}

export function harvestPlot(
  state: GameState,
  plotId: number,
  sellImmediately = false,
): ActionResult {
  const idx = state.plots.findIndex((p) => p.id === plotId);
  if (idx < 0) return { state, ok: false, message: 'Plot not found.' };
  const plot = state.plots[idx];
  if (!plot.crop) return { state, ok: false, message: 'No crop on this plot.' };
  if (plot.crop.stage < 4) return { state, ok: false, message: 'Crop is not ready to harvest yet.' };

  const spec = CROP_CATALOG[plot.crop.cropId];
  const output = calculateHarvest(plot.crop, state.weatherToday, state.homestead.ownedTools);

  const nextPlots = [...state.plots];
  if (spec.isPerennial && spec.regrowDays > 0) {
    nextPlots[idx] = {
      ...plot,
      crop: {
        ...plot.crop,
        progress: 0,
        stage: 2,
        harvestCount: plot.crop.harvestCount + 1,
      },
    };
  } else {
    nextPlots[idx] = {
      ...plot,
      crop: null,
    };
  }

  let cash = state.cash;
  let barn = state.barn;
  let earned = 0;

  if (sellImmediately) {
    const unitPrice = getUnitSellPrice(state.market, output.cropId, output.quality);
    earned = unitPrice * output.quantity;
    cash += earned;
  } else {
    const res = addToBarn(barn, output.cropId, output.quality, output.quantity, state.homestead.ownedTools);
    barn = res.barn;
    if (res.overflow > 0) {
      const unitPrice = getUnitSellPrice(state.market, output.cropId, output.quality);
      earned = unitPrice * res.overflow;
      cash += earned;
    }
  }

  const prevCount = state.stats.cropsHarvestedByType[output.cropId] ?? 0;
  const nextStats = {
    ...state.stats,
    totalHarvests: state.stats.totalHarvests + output.quantity,
    totalEarned: state.stats.totalEarned + earned,
    cropsHarvestedByType: {
      ...state.stats.cropsHarvestedByType,
      [output.cropId]: prevCount + output.quantity,
    },
  };

  const rainNote = output.rainReducedLatex ? ' (rain reduced yield — buy Rain Guard!)' : '';
  const summary = sellImmediately
    ? `Harvested & sold ${output.quantity}x Grade ${output.quality} ${spec.productName} for ${formatMoney(earned, state.currency)}${rainNote}`
    : `Harvested ${output.quantity}x Grade ${output.quality} ${spec.productName} to Barn${rainNote}`;

  const updated: GameState = {
    ...state,
    cash,
    barn,
    plots: nextPlots,
    stats: nextStats,
    log: appendLog(state.log, summary),
  };

  return {
    state: { ...updated, quests: evaluateQuestProgress(updated) },
    ok: true,
    message: summary,
    popupText: sellImmediately
      ? `+${formatMoney(earned, state.currency)} (Grade ${output.quality})`
      : `+${output.quantity} Grade ${output.quality} ${spec.productName}!`,
    popupColor: '#facc15',
  };
}

export function harvestAllReady(state: GameState, sellImmediately = false): ActionResult {
  const readyPlots = state.plots.filter((p) => p.crop && p.crop.stage === 4);
  if (readyPlots.length === 0) {
    return { state, ok: false, message: 'No crops are ready to harvest.' };
  }
  let current = state;
  let harvestedPlots = 0;
  for (const p of readyPlots) {
    const res = harvestPlot(current, p.id, sellImmediately);
    if (res.ok) {
      current = res.state;
      harvestedPlots += 1;
    }
  }
  return {
    state: current,
    ok: true,
    message: `Harvested ${harvestedPlots} ready plots!`,
    popupText: `Harvested ${harvestedPlots} Plots!`,
    popupColor: '#facc15',
  };
}

export function buyAnimal(
  state: GameState,
  type: AnimalType,
  asMature: boolean,
): ActionResult {
  const existingOfType = state.animals.filter((a) => a.type === type).length;
  const capacity = getAnimalCapacity(type, state.homestead.ownedTools);
  if (existingOfType >= capacity) {
    return {
      state,
      ok: false,
      message: `${ANIMAL_SPECS[type].name} pen is full (${existingOfType}/${capacity}). Upgrade the pen in Shop!`,
    };
  }
  const cost = getAnimalBuyPrice(state, type, asMature);
  if (state.cash < cost) {
    return {
      state,
      ok: false,
      message: `Not enough funds (${formatMoney(cost, state.currency)}).`,
    };
  }

  const animal = createAnimal(
    type,
    asMature,
    state.animals.length,
    state.homestead.ownedTools,
    state.weatherToday,
  );
  const updated: GameState = {
    ...state,
    cash: state.cash - cost,
    animals: [...state.animals, animal],
    log: appendLog(
      state.log,
      `Bought ${ANIMAL_SPECS[type].stageNames[animal.stage]} "${animal.name}" (-${formatMoney(cost, state.currency)}).`,
    ),
  };

  return {
    state: { ...updated, quests: evaluateQuestProgress(updated) },
    ok: true,
    message: `Welcomed ${animal.name} (${ANIMAL_SPECS[type].stageNames[animal.stage]})!`,
    popupText: `+${animal.name}!`,
    popupColor: '#34d399',
  };
}

export function feedAnimalAction(
  state: GameState,
  animalId: string,
  cropId?: CropId,
): ActionResult {
  const idx = state.animals.findIndex((a) => a.id === animalId);
  if (idx < 0) return { state, ok: false, message: 'Animal not found.' };
  const animal = state.animals[idx];

  let animalFeed = state.animalFeed;
  let barn = state.barn;
  let updatedAnimal = animal;
  let label = 'Animal Feed';

  if (cropId) {
    if (!CROP_CATALOG[cropId].livestockFeedable) {
      return { state, ok: false, message: `${CROP_CATALOG[cropId].name} cannot be used as livestock feed.` };
    }
    const res = consumeCropFromBarn(barn, cropId, 1);
    if (!res.consumed) {
      return { state, ok: false, message: `No ${CROP_CATALOG[cropId].productName} in Barn.` };
    }
    barn = res.barn;
    updatedAnimal = feedAnimalWithCrop(animal, cropId);
    label = CROP_CATALOG[cropId].productName;
  } else {
    if (animalFeed <= 0) {
      return { state, ok: false, message: 'Out of Animal Feed! Buy feed in Shop or feed Barn crops.' };
    }
    animalFeed -= 1;
    updatedAnimal = feedAnimal(animal, 45, 5);
  }

  const nextAnimals = [...state.animals];
  nextAnimals[idx] = updatedAnimal;

  return {
    state: {
      ...state,
      animalFeed,
      barn,
      animals: nextAnimals,
      log: appendLog(state.log, `Fed ${animal.name} with ${label}.`),
    },
    ok: true,
    message: `Fed ${animal.name} with ${label}!`,
    popupText: `Fed ${animal.name}!`,
    popupColor: '#4ade80',
  };
}

export function feedAllAnimalsAction(state: GameState): ActionResult {
  let current = state;
  let fed = 0;
  for (const a of state.animals) {
    if (a.hunger < 90 && current.animalFeed > 0) {
      const res = feedAnimalAction(current, a.id);
      if (res.ok) {
        current = res.state;
        fed += 1;
      }
    }
  }
  if (fed === 0) {
    return { state, ok: false, message: 'No hungry animals or out of Animal Feed.' };
  }
  return {
    state: current,
    ok: true,
    message: `Fed ${fed} animals!`,
    popupText: `Fed ${fed} Animals!`,
    popupColor: '#4ade80',
  };
}

export function petAnimalAction(state: GameState, animalId: string): ActionResult {
  const idx = state.animals.findIndex((a) => a.id === animalId);
  if (idx < 0) return { state, ok: false, message: 'Animal not found.' };
  const animal = state.animals[idx];
  if (animal.pettedToday) {
    return { state, ok: false, message: `${animal.name} was already petted today!` };
  }
  const nextAnimals = [...state.animals];
  nextAnimals[idx] = petAnimal(animal);
  return {
    state: {
      ...state,
      animals: nextAnimals,
    },
    ok: true,
    message: `${animal.name} loves the attention! (+12 Happiness)`,
    popupText: `♥ ${animal.name} +12`,
    popupColor: '#f472b6',
  };
}

export function collectAnimalProductAction(
  state: GameState,
  animalId: string,
): ActionResult {
  const idx = state.animals.findIndex((a) => a.id === animalId);
  if (idx < 0) return { state, ok: false, message: 'Animal not found.' };
  const animal = state.animals[idx];
  const spec = ANIMAL_SPECS[animal.type];

  if (animal.produceReady <= 0 && !animal.truffleReady) {
    return { state, ok: false, message: `${animal.name} has no produce ready to collect.` };
  }

  let barn = state.barn;
  let cash = state.cash;
  const collectedParts: string[] = [];

  if (animal.produceReady > 0 && spec.produceId) {
    const res = addToBarn(
      barn,
      spec.produceId,
      animal.produceQuality,
      animal.produceReady,
      state.homestead.ownedTools,
    );
    barn = res.barn;
    if (res.overflow > 0) {
      cash += getUnitSellPrice(state.market, spec.produceId, animal.produceQuality) * res.overflow;
    }
    collectedParts.push(`+${animal.produceReady} Grade ${animal.produceQuality} ${spec.produceName}`);
  }

  if (animal.truffleReady) {
    const res = addToBarn(barn, 'truffle', 'A', 1, state.homestead.ownedTools);
    barn = res.barn;
    if (res.overflow > 0) {
      cash += getUnitSellPrice(state.market, 'truffle', 'A');
    }
    collectedParts.push('+1 Black Truffle!');
  }

  const nextAnimals = [...state.animals];
  nextAnimals[idx] = {
    ...animal,
    produceReady: 0,
    truffleReady: false,
  };

  const text = collectedParts.join(' & ');
  return {
    state: {
      ...state,
      cash,
      barn,
      animals: nextAnimals,
      log: appendLog(state.log, `Collected ${text} from ${animal.name}.`),
    },
    ok: true,
    message: `Collected ${text}!`,
    popupText: text,
    popupColor: '#fbbf24',
  };
}

export function collectAllAnimalProductsAction(state: GameState): ActionResult {
  let current = state;
  let count = 0;
  for (const a of state.animals) {
    if (a.produceReady > 0 || a.truffleReady) {
      const res = collectAnimalProductAction(current, a.id);
      if (res.ok) {
        current = res.state;
        count += 1;
      }
    }
  }
  if (count === 0) return { state, ok: false, message: 'No animal products ready.' };
  return {
    state: current,
    ok: true,
    message: `Collected produce from ${count} animals!`,
    popupText: `Collected ${count} Animals!`,
    popupColor: '#fbbf24',
  };
}

export function sellAnimalAction(state: GameState, animalId: string): ActionResult {
  const idx = state.animals.findIndex((a) => a.id === animalId);
  if (idx < 0) return { state, ok: false, message: 'Animal not found.' };
  const animal = state.animals[idx];
  const price = calculateAnimalResalePrice(animal, state.market);
  const nextAnimals = state.animals.filter((a) => a.id !== animalId);

  return {
    state: {
      ...state,
      cash: state.cash + price,
      animals: nextAnimals,
      stats: {
        ...state.stats,
        animalsSold: state.stats.animalsSold + 1,
        totalEarned: state.stats.totalEarned + price,
      },
      log: appendLog(
        state.log,
        `Sold ${animal.name} (${ANIMAL_SPECS[animal.type].stageNames[animal.stage]}) for ${formatMoney(price, state.currency)}.`,
      ),
    },
    ok: true,
    message: `Sold ${animal.name} for ${formatMoney(price, state.currency)}!`,
    popupText: `+${formatMoney(price, state.currency)}`,
    popupColor: '#4ade80',
  };
}

export function sellBarnItemAction(
  state: GameState,
  itemId: string,
  qtyToSell?: number,
): ActionResult {
  const idx = state.barn.findIndex((b) => b.id === itemId);
  if (idx < 0) return { state, ok: false, message: 'Barn item not found.' };
  const item = state.barn[idx];
  const qty = Math.min(item.quantity, qtyToSell ?? item.quantity);
  if (qty <= 0) return { state, ok: false, message: 'Invalid quantity.' };

  const unitPrice = getUnitSellPrice(state.market, item.commodityId, item.quality);
  const total = unitPrice * qty;

  const nextBarn = [...state.barn];
  if (qty === item.quantity) {
    nextBarn.splice(idx, 1);
  } else {
    nextBarn[idx] = { ...item, quantity: item.quantity - qty };
  }

  const name = COMMODITY_META[item.commodityId].name;
  return {
    state: {
      ...state,
      cash: state.cash + total,
      barn: nextBarn,
      stats: {
        ...state.stats,
        totalEarned: state.stats.totalEarned + total,
      },
      log: appendLog(
        state.log,
        `Sold ${qty}x Grade ${item.quality} ${name} for ${formatMoney(total, state.currency)}.`,
      ),
    },
    ok: true,
    message: `Sold ${qty}x ${name} for ${formatMoney(total, state.currency)}!`,
    popupText: `+${formatMoney(total, state.currency)}`,
    popupColor: '#4ade80',
  };
}

export function buySuppliesAction(
  state: GameState,
  supply: 'animal_feed' | 'compost_bag',
  qty = 5,
): ActionResult {
  const unitPrice = supply === 'animal_feed' ? getFeedBagPrice(state) : COMPOST_BAG_UNIT_COST;
  const totalCost = unitPrice * qty;
  if (state.cash < totalCost) {
    return { state, ok: false, message: `Not enough funds (${formatMoney(totalCost, state.currency)}).` };
  }
  return {
    state: {
      ...state,
      cash: state.cash - totalCost,
      animalFeed: supply === 'animal_feed' ? state.animalFeed + qty : state.animalFeed,
      compostBags: supply === 'compost_bag' ? state.compostBags + qty : state.compostBags,
      log: appendLog(
        state.log,
        `Bought ${qty}x ${supply === 'animal_feed' ? 'Animal Feed' : 'Organic Compost'} (-${formatMoney(totalCost, state.currency)}).`,
      ),
    },
    ok: true,
    message: `Bought ${qty}x ${supply === 'animal_feed' ? 'Animal Feed' : 'Organic Compost'}!`,
  };
}

export function buyLandExpansionAction(state: GameState): ActionResult {
  const nextTierIdx = state.homestead.landTier + 1;
  const nextTier = LAND_TIERS[nextTierIdx];
  if (!nextTier) return { state, ok: false, message: 'Your farm is already at maximum plantation size (10×6)!' };
  if (state.cash < nextTier.cost) {
    return { state, ok: false, message: `Need ${formatMoney(nextTier.cost, state.currency)} for ${nextTier.label}.` };
  }

  const nextPlots = createPlotGrid(nextTier.cols, nextTier.rows, state.climate, state.plots);
  return {
    state: {
      ...state,
      cash: state.cash - nextTier.cost,
      plots: nextPlots,
      homestead: {
        ...state.homestead,
        landTier: nextTier.tier,
        gridCols: nextTier.cols,
        gridRows: nextTier.rows,
      },
      log: appendLog(state.log, `Expanded land to ${nextTier.label} (${nextTier.totalPlots} plots)!`),
    },
    ok: true,
    message: `Unlocked ${nextTier.label}!`,
    popupText: `Land Expanded: ${nextTier.cols}×${nextTier.rows}!`,
    popupColor: '#22c55e',
  };
}

export function buyToolAction(state: GameState, toolId: ToolId): ActionResult {
  if (state.homestead.ownedTools.includes(toolId)) {
    return { state, ok: false, message: 'Already owned.' };
  }
  const spec = TOOL_CATALOG[toolId];
  if (state.cash < spec.cost) {
    return { state, ok: false, message: `Need ${formatMoney(spec.cost, state.currency)} for ${spec.name}.` };
  }

  return {
    state: {
      ...state,
      cash: state.cash - spec.cost,
      homestead: {
        ...state.homestead,
        ownedTools: [...state.homestead.ownedTools, toolId],
      },
      log: appendLog(state.log, `Purchased ${spec.name} (-${formatMoney(spec.cost, state.currency)}).`),
    },
    ok: true,
    message: `Purchased ${spec.name}!`,
    popupText: `Unlocked ${spec.name}!`,
    popupColor: '#38bdf8',
  };
}

export function upgradeFarmhouseAction(state: GameState): ActionResult {
  if (state.homestead.farmhouseLevel >= 4) {
    return { state, ok: false, message: 'Farmhouse is already at Level 4 Grand Eco-Estate!' };
  }
  const nextLevel = (state.homestead.farmhouseLevel + 1) as 2 | 3 | 4;
  const spec = FARMHOUSE_LEVELS[nextLevel];
  if (state.cash < spec.upgradeCost) {
    return { state, ok: false, message: `Need ${formatMoney(spec.upgradeCost, state.currency)} to upgrade.` };
  }

  const updated: GameState = {
    ...state,
    cash: state.cash - spec.upgradeCost,
    homestead: {
      ...state.homestead,
      farmhouseLevel: nextLevel,
    },
    log: appendLog(state.log, `Upgraded Farmhouse to Level ${nextLevel}: ${spec.name}!`),
  };

  return {
    state: { ...updated, quests: evaluateQuestProgress(updated) },
    ok: true,
    message: `Upgraded to ${spec.name} (${spec.slots} furniture slots)!`,
    popupText: `Farmhouse Lv.${nextLevel}!`,
    popupColor: '#f59e0b',
  };
}

export function buyFurnitureAction(state: GameState, furnitureId: FurnitureId): ActionResult {
  const spec = FURNITURE_CATALOG[furnitureId];
  if (!spec.purchasable) return { state, ok: false, message: 'This trophy can only be earned at the Harvest Festival!' };
  if (state.cash < spec.cost) {
    return { state, ok: false, message: `Need ${formatMoney(spec.cost, state.currency)} for ${spec.name}.` };
  }

  return {
    state: {
      ...state,
      cash: state.cash - spec.cost,
      homestead: {
        ...state.homestead,
        ownedFurniture: [...state.homestead.ownedFurniture, furnitureId],
      },
      log: appendLog(state.log, `Bought ${spec.name} for your Farmhouse.`),
    },
    ok: true,
    message: `Bought ${spec.name}! Place it in Farmhouse Interior.`,
  };
}

export function placeFurnitureAction(
  state: GameState,
  furnitureId: FurnitureId,
  slotIndex: number,
): ActionResult {
  const maxSlots = FARMHOUSE_LEVELS[state.homestead.farmhouseLevel].slots;
  if (slotIndex < 0 || slotIndex >= maxSlots) {
    return { state, ok: false, message: 'Invalid furniture slot.' };
  }
  const invIdx = state.homestead.ownedFurniture.indexOf(furnitureId);
  if (invIdx < 0) {
    return { state, ok: false, message: 'You do not have that furniture in inventory.' };
  }
  if (state.homestead.placedFurniture.some((p) => p.slotIndex === slotIndex)) {
    return { state, ok: false, message: 'That slot is already occupied. Remove or move existing item first.' };
  }

  const nextOwned = [...state.homestead.ownedFurniture];
  nextOwned.splice(invIdx, 1);

  const nextPlaced = [
    ...state.homestead.placedFurniture,
    {
      instanceId: `furn_${furnitureId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      furnitureId,
      slotIndex,
    },
  ];

  return {
    state: {
      ...state,
      homestead: {
        ...state.homestead,
        ownedFurniture: nextOwned,
        placedFurniture: nextPlaced,
      },
    },
    ok: true,
    message: `Placed ${FURNITURE_CATALOG[furnitureId].name} in slot #${slotIndex + 1}!`,
  };
}

export function removeFurnitureAction(state: GameState, instanceId: string): ActionResult {
  const item = state.homestead.placedFurniture.find((p) => p.instanceId === instanceId);
  if (!item) return { state, ok: false, message: 'Furniture not found.' };

  return {
    state: {
      ...state,
      homestead: {
        ...state.homestead,
        ownedFurniture: [...state.homestead.ownedFurniture, item.furnitureId],
        placedFurniture: state.homestead.placedFurniture.filter((p) => p.instanceId !== instanceId),
      },
    },
    ok: true,
    message: `Stored ${FURNITURE_CATALOG[item.furnitureId].name} back in inventory.`,
  };
}

export function moveFurnitureAction(
  state: GameState,
  instanceId: string,
  targetSlotIndex: number,
): ActionResult {
  const maxSlots = FARMHOUSE_LEVELS[state.homestead.farmhouseLevel].slots;
  if (targetSlotIndex < 0 || targetSlotIndex >= maxSlots) {
    return { state, ok: false, message: 'Invalid slot.' };
  }
  if (state.homestead.placedFurniture.some((p) => p.slotIndex === targetSlotIndex)) {
    return { state, ok: false, message: 'Target slot is occupied.' };
  }
  return {
    state: {
      ...state,
      homestead: {
        ...state.homestead,
        placedFurniture: state.homestead.placedFurniture.map((p) =>
          p.instanceId === instanceId ? { ...p, slotIndex: targetSlotIndex } : p,
        ),
      },
    },
    ok: true,
    message: `Moved furniture to slot #${targetSlotIndex + 1}.`,
  };
}

export function chatNpcAction(state: GameState, npcId: NpcId): ActionResult {
  const npc = state.npcs[npcId];
  if (npc.chattedToday) {
    return { state, ok: true, message: `You already chatted with ${npc.name} today.` };
  }
  const nextNpc = {
    ...npc,
    chattedToday: true,
    friendship: Math.min(100, npc.friendship + 5),
  };
  return {
    state: {
      ...state,
      npcs: { ...state.npcs, [npcId]: nextNpc },
      log: appendLog(state.log, `Chatted with ${npc.name} (+5 Friendship).`),
    },
    ok: true,
    message: `Chatted with ${npc.name}! (+5 Friendship)`,
    popupText: `♥ ${npc.name} +5`,
    popupColor: '#f472b6',
  };
}

export function giftNpcAction(
  state: GameState,
  npcId: NpcId,
  barnItemId: string,
): ActionResult {
  const npc = state.npcs[npcId];
  if (npc.giftedToday) {
    return { state, ok: false, message: `You already gave ${npc.name} a gift today.` };
  }
  const idx = state.barn.findIndex((b) => b.id === barnItemId);
  if (idx < 0) return { state, ok: false, message: 'Selected gift not found in Barn.' };
  const item = state.barn[idx];

  const isFavorite = npc.favoriteCommodities.includes(item.commodityId as CropId | 'eggs' | 'milk');
  const kitchenBonus =
    npcId === 'auntie_lin' && hasPlacedFurniture(state.homestead, 'kitchen_counter') ? 2 : 0;
  const gain = (isFavorite ? 15 : 8) + (item.quality === 'A' ? 3 : 0) + kitchenBonus;

  const nextBarn = [...state.barn];
  if (item.quantity === 1) {
    nextBarn.splice(idx, 1);
  } else {
    nextBarn[idx] = { ...item, quantity: item.quantity - 1 };
  }

  const nextNpc = {
    ...npc,
    giftedToday: true,
    friendship: Math.min(100, npc.friendship + gain),
  };

  return {
    state: {
      ...state,
      barn: nextBarn,
      npcs: { ...state.npcs, [npcId]: nextNpc },
      log: appendLog(
        state.log,
        `Gifted ${COMMODITY_META[item.commodityId].name} to ${npc.name} (+${gain} Friendship${isFavorite ? ' — Loved!' : ''}).`,
      ),
    },
    ok: true,
    message: `${npc.name} ${isFavorite ? 'LOVED' : 'appreciated'} your gift! (+${gain} Friendship)`,
    popupText: `♥ ${npc.name} +${gain}`,
    popupColor: '#ec4899',
  };
}

export function claimQuestAction(state: GameState, questId: string): ActionResult {
  const quest = state.quests.find((q) => q.id === questId);
  if (!quest) return { state, ok: false, message: 'Quest not found.' };
  if (quest.claimed) return { state, ok: false, message: 'Quest already claimed.' };

  let barn = state.barn;

  // Delivery quest consumes items from Barn
  if (quest.type === 'deliver' && quest.targetCrop) {
    const totalInBarn = barn
      .filter((b) => b.commodityId === quest.targetCrop)
      .reduce((acc, b) => acc + b.quantity, 0);
    if (totalInBarn < quest.targetAmount) {
      return {
        state,
        ok: false,
        message: `Need ${quest.targetAmount}x ${COMMODITY_META[quest.targetCrop].name} in Barn (have ${totalInBarn}).`,
      };
    }
    let remaining = quest.targetAmount;
    const nextBarn: BarnItem[] = [];
    for (const item of barn) {
      if (item.commodityId === quest.targetCrop && remaining > 0) {
        const take = Math.min(item.quantity, remaining);
        remaining -= take;
        if (item.quantity - take > 0) {
          nextBarn.push({ ...item, quantity: item.quantity - take });
        }
      } else {
        nextBarn.push(item);
      }
    }
    barn = nextBarn;
  } else if (!quest.completed) {
    return { state, ok: false, message: 'Quest objectives not completed yet.' };
  }

  const npc = state.npcs[quest.npcId];
  const nextNpc = {
    ...npc,
    friendship: Math.min(100, npc.friendship + quest.rewardFriendship),
  };

  return {
    state: {
      ...state,
      cash: state.cash + quest.rewardCash,
      barn,
      npcs: { ...state.npcs, [quest.npcId]: nextNpc },
      quests: state.quests.map((q) =>
        q.id === questId ? { ...q, completed: true, claimed: true, progress: q.targetAmount } : q,
      ),
      stats: {
        ...state.stats,
        totalEarned: state.stats.totalEarned + quest.rewardCash,
      },
      log: appendLog(
        state.log,
        `Completed quest "${quest.title}" (+${formatMoney(quest.rewardCash, state.currency)}, +${quest.rewardFriendship}♥ ${npc.name})!`,
      ),
    },
    ok: true,
    message: `Quest complete! +${formatMoney(quest.rewardCash, state.currency)}`,
    popupText: `+${formatMoney(quest.rewardCash, state.currency)}`,
    popupColor: '#facc15',
  };
}

export function acceptContractAction(state: GameState, contractId: string): ActionResult {
  const c = state.contracts.find((x) => x.id === contractId);
  if (!c) return { state, ok: false, message: 'Contract not found.' };
  return {
    state: {
      ...state,
      contracts: state.contracts.map((x) => (x.id === contractId ? { ...x, accepted: true } : x)),
      log: appendLog(state.log, `Accepted bulk contract: ${c.title}.`),
    },
    ok: true,
    message: `Accepted "${c.title}"!`,
  };
}

export function deliverContractAction(state: GameState, contractId: string): ActionResult {
  const contract = state.contracts.find((x) => x.id === contractId);
  if (!contract || contract.completed) return { state, ok: false, message: 'Contract unavailable.' };

  const totalInBarn = state.barn
    .filter((b) => b.commodityId === contract.commodityId)
    .reduce((acc, b) => acc + b.quantity, 0);
  if (totalInBarn < contract.quantityRequired) {
    return {
      state,
      ok: false,
      message: `Need ${contract.quantityRequired}x ${COMMODITY_META[contract.commodityId].name} in Barn (have ${totalInBarn}).`,
    };
  }

  let remaining = contract.quantityRequired;
  const nextBarn: BarnItem[] = [];
  for (const item of state.barn) {
    if (item.commodityId === contract.commodityId && remaining > 0) {
      const take = Math.min(item.quantity, remaining);
      remaining -= take;
      if (item.quantity - take > 0) {
        nextBarn.push({ ...item, quantity: item.quantity - take });
      }
    } else {
      nextBarn.push(item);
    }
  }

  const baseMarket = state.market.prices[contract.commodityId].currentPrice;
  const payout = Math.round(baseMarket * contract.quantityRequired * contract.bonusMultiplier);
  const npc = state.npcs[contract.npcId];

  return {
    state: {
      ...state,
      cash: state.cash + payout,
      barn: nextBarn,
      npcs: {
        ...state.npcs,
        [contract.npcId]: { ...npc, friendship: Math.min(100, npc.friendship + 14) },
      },
      contracts: state.contracts.map((x) =>
        x.id === contractId ? { ...x, accepted: true, completed: true } : x,
      ),
      stats: {
        ...state.stats,
        totalEarned: state.stats.totalEarned + payout,
      },
      log: appendLog(
        state.log,
        `Delivered contract "${contract.title}" for ${formatMoney(payout, state.currency)} (+35% bonus)!`,
      ),
    },
    ok: true,
    message: `Contract delivered! Earned ${formatMoney(payout, state.currency)}!`,
    popupText: `+${formatMoney(payout, state.currency)} Contract!`,
    popupColor: '#facc15',
  };
}

export function enterHarvestFestivalAction(
  state: GameState,
  barnItemId: string,
): ActionResult {
  if (state.festivalEnteredThisSeason) {
    return { state, ok: false, message: 'You already entered this season’s Harvest Festival!' };
  }
  const idx = state.barn.findIndex((b) => b.id === barnItemId);
  if (idx < 0) return { state, ok: false, message: 'Entry item not found in Barn.' };
  const item = state.barn[idx];

  const nextBarn = [...state.barn];
  if (item.quantity === 1) {
    nextBarn.splice(idx, 1);
  } else {
    nextBarn[idx] = { ...item, quantity: item.quantity - 1 };
  }

  const wonFirstPlace = item.quality === 'A';
  const prizeCash = wonFirstPlace ? 350 : item.quality === 'B' ? 160 : 70;
  const ownedFurniture = wonFirstPlace
    ? [...state.homestead.ownedFurniture, 'festival_trophy' as FurnitureId]
    : state.homestead.ownedFurniture;

  const lin = state.npcs.auntie_lin;

  return {
    state: {
      ...state,
      cash: state.cash + prizeCash,
      barn: nextBarn,
      festivalEnteredThisSeason: true,
      npcs: {
        ...state.npcs,
        auntie_lin: { ...lin, friendship: Math.min(100, lin.friendship + 15) },
      },
      homestead: {
        ...state.homestead,
        ownedFurniture,
        trophiesEarned: state.homestead.trophiesEarned + (wonFirstPlace ? 1 : 0),
      },
      stats: {
        ...state.stats,
        festivalsWon: state.stats.festivalsWon + (wonFirstPlace ? 1 : 0),
        totalEarned: state.stats.totalEarned + prizeCash,
      },
      log: appendLog(
        state.log,
        wonFirstPlace
          ? `Won 1st Place at Auntie Lin's ${SEASON_LABELS[state.season]} Harvest Festival! (+${formatMoney(prizeCash, state.currency)} & Festival Trophy!)`
          : `Placed at ${SEASON_LABELS[state.season]} Harvest Festival (+${formatMoney(prizeCash, state.currency)}). Enter Grade A next season for a Trophy!`,
      ),
    },
    ok: true,
    message: wonFirstPlace
      ? `1st Place! Won ${formatMoney(prizeCash, state.currency)} & a golden Festival Trophy!`
      : `Festival Prize: ${formatMoney(prizeCash, state.currency)}! (Grade A wins a Trophy)`,
    popupText: wonFirstPlace ? '🏆 1st Place Trophy!' : `+${formatMoney(prizeCash, state.currency)}`,
    popupColor: '#facc15',
  };
}

export function takeLoanAction(state: GameState, amount = 500): ActionResult {
  const maxLoan = 3000;
  if (state.loan.principal + amount > maxLoan) {
    return {
      state,
      ok: false,
      message: `Maximum farm loan limit is ${formatMoney(maxLoan, state.currency)}.`,
    };
  }
  return {
    state: {
      ...state,
      cash: state.cash + amount,
      loan: {
        ...state.loan,
        principal: state.loan.principal + amount,
      },
      log: appendLog(state.log, `Borrowed ${formatMoney(amount, state.currency)} farm loan.`),
    },
    ok: true,
    message: `Borrowed ${formatMoney(amount, state.currency)}.`,
  };
}

export function repayLoanAction(state: GameState, amount?: number): ActionResult {
  if (state.loan.principal <= 0) return { state, ok: false, message: 'No active farm loan.' };
  const pay = Math.min(state.loan.principal, amount ?? state.loan.principal, state.cash);
  if (pay <= 0) return { state, ok: false, message: 'Not enough cash to repay loan.' };

  return {
    state: {
      ...state,
      cash: state.cash - pay,
      loan: {
        ...state.loan,
        principal: state.loan.principal - pay,
      },
      log: appendLog(state.log, `Repaid ${formatMoney(pay, state.currency)} of farm loan.`),
    },
    ok: true,
    message: `Repaid ${formatMoney(pay, state.currency)}!`,
  };
}

export function toggleCurrencyAction(state: GameState, currency?: Currency): GameState {
  const next: Currency = currency ?? (state.currency === 'USD' ? 'THB' : 'USD');
  return { ...state, currency: next };
}

export function advanceDay(
  state: GameState,
  rng: () => number = Math.random,
): GameState {
  const nextDay = state.day + 1;
  const { season, dayInSeason, year } = getSeasonForDay(state.climate, nextDay);
  const seasonChanged = season !== state.season;

  // Pop next day's weather from forecast and replenish forecast to 5 days
  const nextWeather = state.forecast[0] ?? generateInitialWeatherAndForecast(state.climate, nextDay, 5, rng).today;
  const remainingForecast = extendForecast(state.climate, state.forecast.slice(1), 5, rng);

  const reportMessages: string[] = [];
  let autoWateredCount = 0;

  // 1. Simulate crops & soil on all plots
  const nextPlots = state.plots.map((plot) => {
    const cropRes = simulateCropDay(plot, nextWeather, state.homestead.ownedTools);
    if (cropRes.died && cropRes.note) {
      reportMessages.push(`R${plot.row + 1}C${plot.col + 1}: ${cropRes.note}`);
    }
    const plotWithCrop = { ...plot, crop: cropRes.crop };
    const soilRes = simulateSoilDay(
      plotWithCrop,
      nextWeather,
      state.homestead.ownedTools,
      { nDelta: cropRes.nDelta, pDelta: cropRes.pDelta, kDelta: cropRes.kDelta },
      nextDay,
    );
    if (soilRes.autoWatered) autoWateredCount += 1;
    return soilRes.plot;
  });

  // 2. Simulate livestock (with Koi Pond happiness bonus if placed!)
  const hasKoiPond = hasPlacedFurniture(state.homestead, 'koi_pond');
  const preLivestock = hasKoiPond
    ? state.animals.map((a) => ({ ...a, happiness: Math.min(100, a.happiness + 3) }))
    : state.animals;

  const livestockRes = simulateLivestockDay(
    preLivestock,
    nextWeather,
    state.homestead.ownedTools,
    state.animalFeed,
    rng,
  );
  reportMessages.push(...livestockRes.notes);

  // 3. Simulate Barn spoilage
  const barnRes = simulateBarnSpoilage(state.barn);
  if (barnRes.spoiledCount > 0) {
    reportMessages.push(`Spoiled in Barn: ${barnRes.spoiledNames.join(', ')}`);
  }

  // 4. Simulate Market prices & news
  const nextMarket = simulateMarketDay(state.market, nextDay, season, nextWeather.weather, rng);

  // 5. Refresh NPCs, contracts & Nadia's Flash Sale
  const { npcs: nextNpcs, contracts: nextContracts } = refreshDailyNpcState(
    state.npcs,
    nextDay,
    state.contracts,
    rng,
  );
  const nextFlashSale = generateFlashSale(nextDay, rng);

  // 6. Homestead upkeep & simple loan interest
  const upkeepCost = getDailyHomesteadUpkeep(state.homestead);
  const loanInterest = calculateDailyLoanInterest(state.loan);
  const nextCash = Math.max(0, state.cash - upkeepCost - loanInterest);

  const weatherSpec = WEATHER_SPECS[nextWeather.weather];
  if (nextWeather.weather === 'rainbow') {
    reportMessages.unshift('A Post-Rain Rainbow appeared! +15% crop growth & +10 animal morale!');
  } else if (seasonChanged) {
    reportMessages.unshift(`Season changed to ${SEASON_LABELS[season]} (Year ${year})!`);
  }

  const report: DailyReport = {
    day: nextDay,
    weather: nextWeather.weather,
    tempC: nextWeather.tempC,
    messages: reportMessages,
    spoiledCount: barnRes.spoiledCount,
    manureProduced: livestockRes.manureProduced,
    autoFedCount: livestockRes.autoFedCount,
    autoWateredCount,
    upkeepCost,
    loanInterest,
  };

  const nextState: GameState = {
    ...state,
    day: nextDay,
    year,
    season,
    dayInSeason,
    cash: nextCash,
    organicManure: state.organicManure + livestockRes.manureProduced,
    animalFeed: Math.max(0, state.animalFeed - livestockRes.feedUsed),
    weatherToday: nextWeather,
    forecast: remainingForecast,
    plots: nextPlots,
    animals: livestockRes.animals,
    barn: barnRes.barn,
    market: nextMarket,
    npcs: nextNpcs,
    contracts: nextContracts,
    flashSale: nextFlashSale,
    festivalEnteredThisSeason: seasonChanged ? false : state.festivalEnteredThisSeason,
    loan: {
      ...state.loan,
      totalInterestPaid: state.loan.totalInterestPaid + loanInterest,
    },
    lastDailyReport: report,
    log: appendLog(
      state.log,
      `Day ${nextDay} (${SEASON_LABELS[season]}): ${weatherSpec.shortName}, ${nextWeather.tempC}°C.${
        livestockRes.manureProduced > 0 ? ` +${livestockRes.manureProduced} Manure.` : ''
      }`,
    ),
  };

  return {
    ...nextState,
    quests: evaluateQuestProgress(nextState),
  };
}

export function saveGameToStorage(state: GameState): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function loadGameFromStorage(): GameState | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.plots)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSavedGame(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SAVE_STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
}
