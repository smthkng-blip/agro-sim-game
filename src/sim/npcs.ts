import type {
  BulkContract,
  CropId,
  FlashSale,
  GameState,
  NpcId,
  NpcQuest,
  NpcState,
} from './types';
import { CROP_CATALOG } from './crops';
import { COMMODITY_META } from './market';
import { ANIMAL_SPECS } from './livestock';

export const ALL_NPC_IDS: NpcId[] = [
  'dr_mali',
  'uncle_somchai',
  'nadia',
  'master_ken',
  'auntie_lin',
];

export function getHearts(friendship: number): number {
  return Math.min(5, Math.floor(friendship / 20));
}

export function getNadiaDiscountMultiplier(npcs: Record<NpcId, NpcState>): number {
  const hearts = getHearts(npcs.nadia.friendship);
  // Up to 15% permanent discount at 5 hearts (3% per heart)
  return 1 - hearts * 0.03;
}

export function createInitialNpcs(): Record<NpcId, NpcState> {
  return {
    dr_mali: {
      id: 'dr_mali',
      name: 'Dr. Mali',
      role: 'Soil & Agronomy Scientist',
      friendship: 20,
      chattedToday: false,
      giftedToday: false,
      visitingToday: true,
      favoriteCommodities: ['soybean', 'blueberry', 'rubber_tree'],
    },
    uncle_somchai: {
      id: 'uncle_somchai',
      name: 'Uncle Somchai',
      role: 'Rubber & Palm Commodity Broker',
      friendship: 15,
      chattedToday: false,
      giftedToday: false,
      visitingToday: true,
      favoriteCommodities: ['rubber_tree', 'oil_palm', 'paddy_rice'],
    },
    nadia: {
      id: 'nadia',
      name: 'Nadia',
      role: 'Traveling Seed & Livestock Merchant',
      friendship: 20,
      chattedToday: false,
      giftedToday: false,
      visitingToday: true,
      favoriteCommodities: ['sunflower', 'strawberry', 'eggs'],
    },
    master_ken: {
      id: 'master_ken',
      name: 'Master Ken',
      role: 'Village Carpenter & Toolsmith',
      friendship: 15,
      chattedToday: false,
      giftedToday: false,
      visitingToday: false,
      favoriteCommodities: ['potato', 'winter_wheat', 'milk'],
    },
    auntie_lin: {
      id: 'auntie_lin',
      name: 'Auntie Lin',
      role: 'Village Chef & Harvest Festival Host',
      friendship: 20,
      chattedToday: false,
      giftedToday: false,
      visitingToday: false,
      favoriteCommodities: ['tomato', 'eggs', 'milk', 'strawberry'],
    },
  };
}

export function createInitialQuests(): NpcQuest[] {
  return [
    {
      id: 'q_mali_compost',
      npcId: 'dr_mali',
      title: 'Living Soil Initiative',
      description: 'Apply Compost or free Livestock Manure to 3 farm plots to enrich soil organic matter.',
      type: 'compost',
      targetAmount: 3,
      progress: 0,
      rewardCash: 220,
      rewardFriendship: 18,
      completed: false,
      claimed: false,
    },
    {
      id: 'q_mali_soybean',
      npcId: 'dr_mali',
      title: 'Legume Nitrogen Fixation',
      description: 'Harvest 4 units of Soybeans to naturally replenish soil Nitrogen (N).',
      type: 'harvest',
      targetCrop: 'soybean',
      targetAmount: 4,
      progress: 0,
      rewardCash: 260,
      rewardFriendship: 20,
      completed: false,
      claimed: false,
    },
    {
      id: 'q_ken_homestead',
      npcId: 'master_ken',
      title: 'Expand Your Homestead',
      description: 'Upgrade your Farmhouse to Level 2 (Farm Homestead) for 8 furniture slots.',
      type: 'farmhouse',
      targetAmount: 2,
      progress: 1,
      rewardCash: 350,
      rewardFriendship: 22,
      completed: false,
      claimed: false,
    },
    {
      id: 'q_lin_basket',
      npcId: 'auntie_lin',
      title: 'Village Breakfast Basket',
      description: 'Deliver 4 Fresh Eggs from your Barn to Auntie Lin for the village bakery.',
      type: 'deliver',
      targetCrop: 'eggs',
      targetAmount: 4,
      progress: 0,
      rewardCash: 190,
      rewardFriendship: 20,
      completed: false,
      claimed: false,
    },
    {
      id: 'q_nadia_livestock',
      npcId: 'nadia',
      title: 'Growing Herd',
      description: 'Raise at least 3 animals in your Livestock Pasture.',
      type: 'livestock',
      targetAmount: 3,
      progress: 0,
      rewardCash: 240,
      rewardFriendship: 18,
      completed: false,
      claimed: false,
    },
  ];
}

export function createInitialContracts(): BulkContract[] {
  return [
    {
      id: 'c_somchai_latex_1',
      npcId: 'uncle_somchai',
      title: 'Export Latex Sheet Order',
      commodityId: 'rubber_tree',
      quantityRequired: 6,
      bonusMultiplier: 1.35,
      daysRemaining: 12,
      accepted: false,
      completed: false,
    },
    {
      id: 'c_somchai_palm_1',
      npcId: 'uncle_somchai',
      title: 'Mill Fresh Fruit Bunch (FFB) Contract',
      commodityId: 'oil_palm',
      quantityRequired: 8,
      bonusMultiplier: 1.35,
      daysRemaining: 14,
      accepted: false,
      completed: false,
    },
    {
      id: 'c_lin_milk_1',
      npcId: 'auntie_lin',
      title: 'Creamery Fresh Milk Order',
      commodityId: 'milk',
      quantityRequired: 5,
      bonusMultiplier: 1.3,
      daysRemaining: 10,
      accepted: false,
      completed: false,
    },
  ];
}

export function generateFlashSale(day: number, rng: () => number = Math.random): FlashSale {
  const pool: Array<Omit<FlashSale, 'day'>> = [
    { itemType: 'seed', targetId: 'rubber_tree', label: 'Rubber Tree Saplings (-25%)', discountPct: 25 },
    { itemType: 'seed', targetId: 'oil_palm', label: 'Oil Palm Saplings (-25%)', discountPct: 25 },
    { itemType: 'seed', targetId: 'paddy_rice', label: 'Paddy Rice Seeds (-30%)', discountPct: 30 },
    { itemType: 'seed', targetId: 'strawberry', label: 'Strawberry Runners (-25%)', discountPct: 25 },
    { itemType: 'seed', targetId: 'blueberry', label: 'Blueberry Bushes (-25%)', discountPct: 25 },
    { itemType: 'seed', targetId: 'sweet_corn', label: 'Sweet Corn Seeds (-30%)', discountPct: 30 },
    { itemType: 'feed', targetId: 'animal_feed', label: 'Bulk Animal Feed Bags (-30%)', discountPct: 30 },
    { itemType: 'animal', targetId: 'chicken', label: 'Baby Chicks (-20%)', discountPct: 20 },
    { itemType: 'animal', targetId: 'pig', label: 'Piglets (-20%)', discountPct: 20 },
    { itemType: 'animal', targetId: 'cow', label: 'Dairy Calves (-15%)', discountPct: 15 },
  ];
  const pick = pool[Math.floor(rng() * pool.length)];
  return { day, ...pick };
}

export function getNpcDialogue(npcId: NpcId, state: GameState): string {
  switch (npcId) {
    case 'dr_mali': {
      // Context-aware agronomy diagnostics based on real farm state!
      const rubberHighPh = state.plots.find(
        (p) => p.crop?.cropId === 'rubber_tree' && p.soil.ph > 6.0,
      );
      if (rubberHighPh) {
        return `Soil alert! Your Rubber Tree on plot R${rubberHighPh.row + 1}C${rubberHighPh.col + 1} is in pH ${rubberHighPh.soil.ph.toFixed(1)} soil. Hevea brasiliensis prefers acidic pH 4.5–6.0 — apply Elemental Sulfur!`;
      }
      const palmLowK = state.plots.find(
        (p) => p.crop?.cropId === 'oil_palm' && p.soil.k < 35,
      );
      if (palmLowK) {
        return `Your Oil Palm on plot R${palmLowK.row + 1}C${palmLowK.col + 1} is running low on Potassium (K: ${palmLowK.soil.k}). Oil Palms are heavy K & N feeders — apply Compost or Livestock Manure soon!`;
      }
      const blueberryHighPh = state.plots.find(
        (p) => p.crop?.cropId === 'blueberry' && p.soil.ph > 5.5,
      );
      if (blueberryHighPh) {
        return `Blueberries require strongly acidic soil (pH 4.5–5.5), but plot R${blueberryHighPh.row + 1}C${blueberryHighPh.col + 1} is at pH ${blueberryHighPh.soil.ph.toFixed(1)}. Sulfur will boost berry quality to Grade A!`;
      }
      if (state.organicManure >= 3) {
        return `You have ${state.organicManure} units of free Livestock Manure ready! Applying it as organic compost restores N-P-K and Organic Matter at zero cost — true circular agronomy.`;
      }
      const lowNPlot = state.plots.find((p) => p.soil.n < 30);
      if (lowNPlot) {
        return `Plot R${lowNPlot.row + 1}C${lowNPlot.col + 1} is low on Nitrogen (N: ${lowNPlot.soil.n}). Try rotating Soybeans there — legumes naturally fix Nitrogen back into the soil!`;
      }
      return `Your soil balance is looking solid today! Remember: Mulch cuts evaporation by 40% and suppresses weeds, while Row Cover shields tender crops from frost, hail, and heatwaves.`;
    }
    case 'uncle_somchai': {
      const tip = state.market.nextDayTip;
      const commName = COMMODITY_META[tip.commodityId].name;
      const dirText = tip.direction === 'up' ? 'surge upward' : 'dip slightly';
      return `Psst! My export desk hears ${commName} prices may ${dirText} soon ("${tip.headline}"). Check my Bulk Contracts for a +35% bonus on Natural Latex and Oil Palm FFB!`;
    }
    case 'nadia': {
      const hearts = getHearts(state.npcs.nadia.friendship);
      const disc = hearts * 3;
      return `Welcome, friend! Today's Flash Sale is ${state.flashSale.label}. ${
        disc > 0
          ? `Plus, your ${hearts}-Heart friendship gives you a permanent ${disc}% discount on seeds, feed & animals!`
          : 'Chat or share farm gifts with me to unlock up to 15% permanent merchant discounts!'
      }`;
    }
    case 'master_ken': {
      if (state.homestead.farmhouseLevel < 2) {
        return `Your Cozy Cabin is sturdy, but upgrading to a Farm Homestead opens 8 furniture slots — plenty of room for a Brass Weather Barometer (5-day forecast) and Agronomy Desk!`;
      }
      if (state.animals.length > 0 && !state.homestead.ownedTools.includes('climate_ventilation')) {
        return `Your animals are thriving! Consider upgrading their pens or adding Climate Ventilation Fans so heatwaves, storms, and frost never stress your herd.`;
      }
      return `Fine craftsmanship on your estate! Try placing Solar Roof Panels to cut daily upkeep in half, or a Tranquil Koi Pond outside to keep livestock cheerful every morning.`;
    }
    case 'auntie_lin': {
      if (!state.festivalEnteredThisSeason) {
        return `The Seasonal Harvest Festival is open this season! Enter your best Grade A produce, eggs, or milk from your Barn to win cash prizes and a golden Festival Trophy for your farmhouse!`;
      }
      return `Thank you for participating in this season's Harvest Festival! Bring fresh tomatoes, strawberries, eggs, or milk anytime — my kitchen always loves local harvests.`;
    }
  }
}

export function getNpcPerkSummary(npcId: NpcId, friendship: number): string {
  const hearts = getHearts(friendship);
  switch (npcId) {
    case 'dr_mali':
      return `Soil diagnostics & Soil Science Quests (${hearts}/5 ♥)`;
    case 'uncle_somchai':
      return `Next-day Market Tips & +35% Latex/FFB Bulk Contracts (${hearts}/5 ♥)`;
    case 'nadia':
      return `Daily Flash Sales + ${hearts * 3}% permanent shop discount (max 15%)`;
    case 'master_ken':
      return `Homestead milestones & artisan furniture advice (${hearts}/5 ♥)`;
    case 'auntie_lin':
      return `Seasonal Harvest Festival host & Trophy awards (${hearts}/5 ♥)`;
  }
}

export function refreshDailyNpcState(
  npcs: Record<NpcId, NpcState>,
  day: number,
  contracts: BulkContract[],
  rng: () => number = Math.random,
): { npcs: Record<NpcId, NpcState>; contracts: BulkContract[] } {
  const nextNpcs = {} as Record<NpcId, NpcState>;
  // 2-3 NPCs visibly visit the farm gate each day
  const visitingCount = 3;
  const startIdx = day % ALL_NPC_IDS.length;
  const visitingSet = new Set<NpcId>();
  for (let i = 0; i < visitingCount; i++) {
    visitingSet.add(ALL_NPC_IDS[(startIdx + i) % ALL_NPC_IDS.length]);
  }

  for (const id of ALL_NPC_IDS) {
    nextNpcs[id] = {
      ...npcs[id],
      chattedToday: false,
      giftedToday: false,
      visitingToday: visitingSet.has(id),
    };
  }

  // Tick contract deadlines and replenish expired/completed contracts
  const nextContracts: BulkContract[] = contracts
    .map((c) => (c.completed ? c : { ...c, daysRemaining: c.daysRemaining - 1 }))
    .filter((c) => !c.completed && c.daysRemaining > 0);

  if (nextContracts.length < 3) {
    const templates: Array<{
      npcId: NpcId;
      title: string;
      commodityId: CropId | 'eggs' | 'milk';
      qty: number;
      bonus: number;
    }> = [
      { npcId: 'uncle_somchai', title: 'Tire Factory Latex Shipment', commodityId: 'rubber_tree', qty: 6, bonus: 1.35 },
      { npcId: 'uncle_somchai', title: 'Refinery Oil Palm FFB Order', commodityId: 'oil_palm', qty: 8, bonus: 1.35 },
      { npcId: 'uncle_somchai', title: 'Export Paddy Rice Lot', commodityId: 'paddy_rice', qty: 10, bonus: 1.3 },
      { npcId: 'auntie_lin', title: 'Bakery Fresh Egg Crate', commodityId: 'eggs', qty: 6, bonus: 1.3 },
      { npcId: 'auntie_lin', title: 'Village Creamery Milk Order', commodityId: 'milk', qty: 5, bonus: 1.32 },
      { npcId: 'auntie_lin', title: 'Berry Jam Festival Basket', commodityId: 'strawberry', qty: 6, bonus: 1.3 },
    ];
    const pick = templates[Math.floor(rng() * templates.length)];
    nextContracts.push({
      id: `contract_${day}_${Math.floor(rng() * 10000)}`,
      npcId: pick.npcId,
      title: pick.title,
      commodityId: pick.commodityId,
      quantityRequired: pick.qty,
      bonusMultiplier: pick.bonus,
      daysRemaining: 10,
      accepted: false,
      completed: false,
    });
  }

  return { npcs: nextNpcs, contracts: nextContracts };
}

export function evaluateQuestProgress(state: GameState): NpcQuest[] {
  return state.quests.map((q) => {
    if (q.claimed) return q;
    let progress = q.progress;
    if (q.type === 'compost') {
      progress = state.stats.compostApplied;
    } else if (q.type === 'harvest' && q.targetCrop && q.targetCrop in CROP_CATALOG) {
      progress = state.stats.cropsHarvestedByType[q.targetCrop as CropId] ?? 0;
    } else if (q.type === 'farmhouse') {
      progress = state.homestead.farmhouseLevel;
    } else if (q.type === 'livestock') {
      progress = state.animals.length;
    }
    const completed = progress >= q.targetAmount || q.completed;
    return { ...q, progress: Math.min(q.targetAmount, progress), completed };
  });
}

export function getAnimalDisplayName(type: 'chicken' | 'cow' | 'pig'): string {
  return ANIMAL_SPECS[type].name;
}
