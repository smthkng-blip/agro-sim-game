import type {
  Animal,
  AnimalStage,
  AnimalType,
  CropId,
  MarketState,
  QualityGrade,
  ToolId,
  WeatherDay,
} from './types';
import { CROP_CATALOG } from './crops';
import { WEATHER_SPECS } from './weather';

export interface AnimalSpec {
  type: AnimalType;
  name: string;
  stageNames: Record<AnimalStage, string>;
  buyCostYoung: number;
  buyCostMature: number;
  baseLivePrice: number;
  daysToMature: number;
  dailyHungerDecay: number;
  dailyManure: number;
  produceId: 'eggs' | 'milk' | null;
  produceName: string | null;
  baseProduceYield: number;
  baseCapacity: number;
  upgradedCapacity: number;
  shelterTool: ToolId;
  preferredCrops: CropId[];
  description: string;
}

export const ANIMAL_SPECS: Record<AnimalType, AnimalSpec> = {
  chicken: {
    type: 'chicken',
    name: 'Chicken',
    stageNames: {
      young: 'Chick',
      growing: 'Pullet',
      mature: 'Adult Hen',
    },
    buyCostYoung: 45,
    buyCostMature: 110,
    baseLivePrice: 120,
    daysToMature: 4,
    dailyHungerDecay: 24,
    dailyManure: 1,
    produceId: 'eggs',
    produceName: 'Fresh Eggs',
    baseProduceYield: 2,
    baseCapacity: 4,
    upgradedCapacity: 10,
    shelterTool: 'coop_upgrade',
    preferredCrops: ['sweet_corn', 'winter_wheat', 'paddy_rice', 'soybean'],
    description:
      'Low-cost, fast-maturing hens that lay daily Fresh Eggs (Grade A/B/C) plus light organic manure.',
  },
  cow: {
    type: 'cow',
    name: 'Dairy Cow',
    stageNames: {
      young: 'Calf',
      growing: 'Heifer',
      mature: 'Adult Cow',
    },
    buyCostYoung: 220,
    buyCostMature: 520,
    baseLivePrice: 580,
    daysToMature: 7,
    dailyHungerDecay: 30,
    dailyManure: 3,
    produceId: 'milk',
    produceName: 'Fresh Milk',
    baseProduceYield: 3,
    baseCapacity: 2,
    upgradedCapacity: 6,
    shelterTool: 'cow_barn_upgrade',
    preferredCrops: ['sweet_corn', 'soybean', 'winter_wheat'],
    description:
      'Produces high-value Fresh Milk daily (2-day shelf life) and abundant Organic Manure. Strong resale profit when raised from Calf!',
  },
  pig: {
    type: 'pig',
    name: 'Pig',
    stageNames: {
      young: 'Piglet',
      growing: 'Grower',
      mature: 'Market Hog',
    },
    buyCostYoung: 140,
    buyCostMature: 360,
    baseLivePrice: 480,
    daysToMature: 5,
    dailyHungerDecay: 32,
    dailyManure: 2,
    produceId: null,
    produceName: null,
    baseProduceYield: 0,
    baseCapacity: 2,
    upgradedCapacity: 6,
    shelterTool: 'pig_pen_upgrade',
    preferredCrops: ['potato', 'sweet_corn', 'soybean', 'paddy_rice'],
    description:
      'Fast weight gain when fed Corn, Potatoes, or Feed. Yields rich Organic Manure, top live resale value, and rare Truffles when very happy!',
  },
};

export const ALL_ANIMAL_TYPES: AnimalType[] = ['chicken', 'cow', 'pig'];

const ANIMAL_NAMES: Record<AnimalType, string[]> = {
  chicken: ['Cluckers', 'Sunny', 'Pippin', 'Nugget', 'Goldie', 'Feather', 'Biscuit', 'Dottie', 'Pebble', 'Hazel'],
  cow: ['Bella', 'Daisy', 'Clover', 'Buttercup', 'Moochie', 'Maple', 'Willow', 'Rosie'],
  pig: ['Truffle', 'Babe', 'Porky', 'Hamlet', 'Oinkers', 'Roscoe', 'Barnaby', 'Mochi'],
};

let animalIdCounter = 1;

export function getAnimalCapacity(type: AnimalType, ownedTools: ToolId[]): number {
  const spec = ANIMAL_SPECS[type];
  return ownedTools.includes(spec.shelterTool) ? spec.upgradedCapacity : spec.baseCapacity;
}

export function isAnimalSheltered(
  type: AnimalType,
  weatherDay: WeatherDay,
  ownedTools: ToolId[],
): boolean {
  const spec = ANIMAL_SPECS[type];
  const weather = WEATHER_SPECS[weatherDay.weather];
  const hasBarn = ownedTools.includes(spec.shelterTool);
  const hasVentilation = ownedTools.includes('climate_ventilation');

  if (weather.heatHazard || weatherDay.weather === 'snow_blizzard') {
    return hasVentilation || hasBarn;
  }
  if (weather.stormHazard || weather.hailHazard || weather.frostHazard) {
    return hasBarn || hasVentilation;
  }
  return true;
}

export function createAnimal(
  type: AnimalType,
  asMature: boolean,
  existingCount: number,
  ownedTools: ToolId[],
  weatherDay: WeatherDay,
): Animal {
  const names = ANIMAL_NAMES[type];
  const name = names[existingCount % names.length];
  const stage: AnimalStage = asMature ? 'mature' : 'young';
  const growthProgress = asMature ? 100 : 0;

  return {
    id: `${type}_${Date.now()}_${animalIdCounter++}`,
    type,
    name,
    stage,
    growthProgress,
    ageDays: asMature ? ANIMAL_SPECS[type].daysToMature : 0,
    health: 95,
    happiness: 80,
    hunger: 85,
    fedToday: false,
    pettedToday: false,
    produceReady: 0,
    produceQuality: 'B',
    truffleReady: false,
    sheltered: isAnimalSheltered(type, weatherDay, ownedTools),
  };
}

export function computeAnimalStage(growthProgress: number): AnimalStage {
  if (growthProgress >= 100) return 'mature';
  if (growthProgress >= 48) return 'growing';
  return 'young';
}

export function feedAnimal(animal: Animal, nutrition: number, bonusHappiness = 4): Animal {
  return {
    ...animal,
    hunger: Math.min(100, animal.hunger + nutrition),
    happiness: Math.min(100, animal.happiness + bonusHappiness),
    health: Math.min(100, animal.health + 3),
    fedToday: true,
  };
}

export function feedAnimalWithCrop(animal: Animal, cropId: CropId): Animal {
  const cropSpec = CROP_CATALOG[cropId];
  const animalSpec = ANIMAL_SPECS[animal.type];
  const isPreferred = animalSpec.preferredCrops.includes(cropId);
  const nutrition = cropSpec.feedNutrition + (isPreferred ? 10 : 0);
  return feedAnimal(animal, nutrition, isPreferred ? 8 : 5);
}

export function petAnimal(animal: Animal): Animal {
  if (animal.pettedToday) return animal;
  return {
    ...animal,
    happiness: Math.min(100, animal.happiness + 12),
    pettedToday: true,
  };
}

export function getAnimalProduceQuality(health: number, happiness: number): QualityGrade {
  const score = health * 0.55 + happiness * 0.45;
  if (score >= 82) return 'A';
  if (score >= 52) return 'B';
  return 'C';
}

export function calculateAnimalResalePrice(
  animal: Animal,
  market: MarketState,
): number {
  const commodityKey =
    animal.type === 'chicken'
      ? 'live_chicken'
      : animal.type === 'cow'
        ? 'live_cow'
        : 'live_pig';
  const liveMarketPrice = market.prices[commodityKey].currentPrice;

  const stageMultiplier =
    animal.stage === 'mature' ? 1.0 : animal.stage === 'growing' ? 0.68 : 0.42;
  const conditionMultiplier =
    0.55 + (animal.health / 100) * 0.35 + (animal.happiness / 100) * 0.25;

  return Math.max(15, Math.round(liveMarketPrice * stageMultiplier * conditionMultiplier));
}

export interface LivestockDayResult {
  animals: Animal[];
  manureProduced: number;
  autoFedCount: number;
  feedUsed: number;
  notes: string[];
}

export function simulateLivestockDay(
  animals: Animal[],
  weatherDay: WeatherDay,
  ownedTools: ToolId[],
  availableFeed: number,
  rng: () => number = Math.random,
): LivestockDayResult {
  const weather = WEATHER_SPECS[weatherDay.weather];
  const hasAutoFeeder = ownedTools.includes('auto_feeder');
  let feedLeft = availableFeed;
  let feedUsed = 0;
  let autoFedCount = 0;
  let manureProduced = 0;
  const notes: string[] = [];

  const updated = animals.map((raw) => {
    let animal = { ...raw };
    const spec = ANIMAL_SPECS[animal.type];

    // Auto-feeder feeds unfed animals before hunger ticks down
    if (hasAutoFeeder && !animal.fedToday && feedLeft > 0) {
      animal = feedAnimal(animal, 45, 3);
      feedLeft -= 1;
      feedUsed += 1;
      autoFedCount += 1;
    }

    // Shelter check
    const sheltered = isAnimalSheltered(animal.type, weatherDay, ownedTools);
    animal.sheltered = sheltered;
    animal.stressedNote = undefined;

    // Hunger decay
    animal.hunger = Math.max(0, animal.hunger - spec.dailyHungerDecay);

    // Health & happiness updates
    if (animal.hunger >= 50) {
      animal.health = Math.min(100, animal.health + 4);
      animal.happiness = Math.min(100, animal.happiness + 3);
    } else if (animal.hunger < 25) {
      animal.health = Math.max(10, animal.health - 12);
      animal.happiness = Math.max(10, animal.happiness - 14);
      animal.stressedNote = 'Hungry! Needs feed or crops';
    }

    // Weather stress on unsheltered animals
    if (weather.animalStressRisk > 0 && !sheltered) {
      const stressPenalty = Math.round(weather.animalStressRisk * 24);
      animal.happiness = Math.max(5, animal.happiness - stressPenalty);
      animal.health = Math.max(15, animal.health - Math.round(stressPenalty * 0.55));
      animal.stressedNote = `Unsheltered in ${weather.shortName}!`;
    } else if (weather.moraleBoost > 0) {
      animal.happiness = Math.min(100, animal.happiness + weather.moraleBoost);
    }

    // Growth progress
    if (animal.stage !== 'mature') {
      const growthFactor = animal.hunger >= 45 && animal.health >= 60 ? 1.1 : animal.hunger >= 25 ? 0.65 : 0.25;
      const dailyGrowth = (100 / spec.daysToMature) * growthFactor;
      animal.growthProgress = Math.min(100, Math.round(animal.growthProgress + dailyGrowth));
      const newStage = computeAnimalStage(animal.growthProgress);
      if (newStage !== animal.stage) {
        notes.push(`${animal.name} (${spec.name}) grew into a ${spec.stageNames[newStage]}!`);
        animal.stage = newStage;
      }
    }

    animal.ageDays += 1;

    // Daily Organic Manure generation (circular agronomy!)
    const manureAmt = animal.hunger >= 30 ? spec.dailyManure : Math.max(1, Math.floor(spec.dailyManure / 2));
    manureProduced += manureAmt;

    // Daily produce for mature hens & cows
    if (animal.stage === 'mature' && spec.produceId) {
      if (animal.hunger >= 30 && animal.health >= 40) {
        const quality = getAnimalProduceQuality(animal.health, animal.happiness);
        const bonus = quality === 'A' ? 1 : 0;
        animal.produceReady = Math.min(spec.baseProduceYield + 2, animal.produceReady + spec.baseProduceYield + bonus);
        animal.produceQuality = quality;
      }
    }

    // Rare truffle bonus for very happy mature pigs!
    if (animal.type === 'pig' && animal.stage === 'mature' && animal.happiness >= 85 && animal.hunger >= 50) {
      if (!animal.truffleReady && rng() < 0.28) {
        animal.truffleReady = true;
        notes.push(`${animal.name} rooted up a rare Black Truffle!`);
      }
    }

    // Reset daily flags
    animal.fedToday = false;
    animal.pettedToday = false;

    return animal;
  });

  return {
    animals: updated,
    manureProduced,
    autoFedCount,
    feedUsed,
    notes,
  };
}
