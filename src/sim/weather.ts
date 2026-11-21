import type {
  ClimateType,
  Season,
  TemperateSeason,
  TropicalSeason,
  WeatherDay,
  WeatherSpec,
  WeatherType,
} from './types';

export const DAYS_PER_SEASON = 15;

export const CLIMATE_SPECS: Record<
  ClimateType,
  {
    id: ClimateType;
    name: string;
    subtitle: string;
    tempRange: string;
    seasons: Season[];
    description: string;
    recommendedCrops: string[];
  }
> = {
  tropical_monsoon: {
    id: 'tropical_monsoon',
    name: 'Tropical Monsoon',
    subtitle: 'Hot-Dry · Monsoon Wet · Cool-Dry',
    tempRange: '22–36°C year-round',
    seasons: ['hot_dry', 'monsoon_wet', 'cool_dry'] as TropicalSeason[],
    description:
      'Warm equatorial sun, intense monsoon downpours, and lush humidity. Ideal for Rubber Trees, Oil Palm, and Paddy Rice.',
    recommendedCrops: ['Rubber Tree', 'Oil Palm', 'Paddy Rice', 'Sweet Corn', 'Soybean'],
  },
  temperate_4season: {
    id: 'temperate_4season',
    name: 'Temperate 4-Season',
    subtitle: 'Spring · Summer · Autumn · Winter',
    tempRange: '-4°C to 34°C with frost & snow',
    seasons: ['spring', 'summer', 'autumn', 'winter'] as TemperateSeason[],
    description:
      'Distinct four-season daylight shifts with crisp spring rains, warm summers, golden autumns, and frosty winters.',
    recommendedCrops: ['Winter Wheat', 'Potato', 'Spinach', 'Strawberry', 'Blueberry', 'Tomato'],
  },
};

export const SEASON_LABELS: Record<Season, string> = {
  hot_dry: 'Hot-Dry',
  monsoon_wet: 'Monsoon Wet',
  cool_dry: 'Cool-Dry',
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
};

export const WEATHER_SPECS: Record<WeatherType, WeatherSpec> = {
  clear: {
    id: 'clear',
    name: 'Clear / Sunny',
    shortName: 'Sunny',
    description: 'Bright sunbeams, peak photosynthesis, and moderate soil evaporation.',
    moistureDelta: 0,
    evaporationMultiplier: 1.0,
    sunlightFactor: 1.15,
    tempOffset: 2,
    windIntensity: 0.15,
    cropDamageRisk: 0,
    animalStressRisk: 0,
    latexRainPenalty: 0,
    moraleBoost: 3,
    waterloggingRisk: false,
    frostHazard: false,
    heatHazard: false,
    hailHazard: false,
    stormHazard: false,
  },
  partly_cloudy: {
    id: 'partly_cloudy',
    name: 'Partly Cloudy',
    shortName: 'Partly Cloudy',
    description: 'Drifting cumulus clouds offering balanced growth and gentle evaporation.',
    moistureDelta: 0,
    evaporationMultiplier: 0.8,
    sunlightFactor: 0.95,
    tempOffset: 0,
    windIntensity: 0.25,
    cropDamageRisk: 0,
    animalStressRisk: 0,
    latexRainPenalty: 0,
    moraleBoost: 2,
    waterloggingRisk: false,
    frostHazard: false,
    heatHazard: false,
    hailHazard: false,
    stormHazard: false,
  },
  overcast_fog: {
    id: 'overcast_fog',
    name: 'Overcast / Morning Fog',
    shortName: 'Foggy',
    description: 'Thick drifting mist, high humidity, low sunlight, and minimal evaporation.',
    moistureDelta: 4,
    evaporationMultiplier: 0.45,
    sunlightFactor: 0.65,
    tempOffset: -2,
    windIntensity: 0.1,
    cropDamageRisk: 0,
    animalStressRisk: 0,
    latexRainPenalty: 0,
    moraleBoost: 0,
    waterloggingRisk: false,
    frostHazard: false,
    heatHazard: false,
    hailHazard: false,
    stormHazard: false,
  },
  light_drizzle: {
    id: 'light_drizzle',
    name: 'Light Drizzle',
    shortName: 'Drizzle',
    description: 'Gentle soaking rain that adds +15% soil moisture without waterlogging.',
    moistureDelta: 15,
    evaporationMultiplier: 0.35,
    sunlightFactor: 0.72,
    tempOffset: -2,
    windIntensity: 0.25,
    cropDamageRisk: 0,
    animalStressRisk: 0,
    latexRainPenalty: 0.15,
    moraleBoost: 0,
    waterloggingRisk: false,
    frostHazard: false,
    heatHazard: false,
    hailHazard: false,
    stormHazard: false,
  },
  heavy_rain: {
    id: 'heavy_rain',
    name: 'Heavy Rain / Monsoon Downpour',
    shortName: 'Heavy Rain',
    description:
      'Dense angled downpour (+40% soil moisture). Waterlogging risk (except Paddy Rice) & lowers Rubber latex yield without Rain Guard.',
    moistureDelta: 40,
    evaporationMultiplier: 0.2,
    sunlightFactor: 0.55,
    tempOffset: -3,
    windIntensity: 0.55,
    cropDamageRisk: 0.12,
    animalStressRisk: 0.15,
    latexRainPenalty: 0.45,
    moraleBoost: 0,
    waterloggingRisk: true,
    frostHazard: false,
    heatHazard: false,
    hailHazard: false,
    stormHazard: false,
  },
  thunderstorm: {
    id: 'thunderstorm',
    name: 'Thunderstorm & Lightning',
    shortName: 'Thunderstorm',
    description:
      'Dark skies, lightning flashes, and fierce gusts (+35% moisture). Can damage tall unprotected crops and stress unsheltered animals.',
    moistureDelta: 35,
    evaporationMultiplier: 0.25,
    sunlightFactor: 0.45,
    tempOffset: -4,
    windIntensity: 0.9,
    cropDamageRisk: 0.45,
    animalStressRisk: 0.55,
    latexRainPenalty: 0.5,
    moraleBoost: 0,
    waterloggingRisk: true,
    frostHazard: false,
    heatHazard: false,
    hailHazard: false,
    stormHazard: true,
  },
  strong_wind: {
    id: 'strong_wind',
    name: 'Strong Wind / Dry Gale',
    shortName: 'Dry Gale',
    description: 'Fast swaying plants and dry gusts causing rapid soil moisture evaporation.',
    moistureDelta: 0,
    evaporationMultiplier: 1.75,
    sunlightFactor: 0.95,
    tempOffset: -1,
    windIntensity: 0.95,
    cropDamageRisk: 0.15,
    animalStressRisk: 0.15,
    latexRainPenalty: 0,
    moraleBoost: 0,
    waterloggingRisk: false,
    frostHazard: false,
    heatHazard: false,
    hailHazard: false,
    stormHazard: false,
  },
  heatwave: {
    id: 'heatwave',
    name: 'Heatwave / Drought',
    shortName: 'Heatwave',
    description:
      'Shimmering heat haze, scorching temperatures, rapid drying, and heat stress on cool crops & unsheltered animals.',
    moistureDelta: -10,
    evaporationMultiplier: 2.1,
    sunlightFactor: 1.15,
    tempOffset: 6,
    windIntensity: 0.3,
    cropDamageRisk: 0.35,
    animalStressRisk: 0.55,
    latexRainPenalty: 0,
    moraleBoost: 0,
    waterloggingRisk: false,
    frostHazard: false,
    heatHazard: true,
    hailHazard: false,
    stormHazard: false,
  },
  hailstorm: {
    id: 'hailstorm',
    name: 'Hailstorm',
    shortName: 'Hailstorm',
    description:
      'Falling ice pellets that bruise tender crops unless protected by Row Cover / Shade Cloth, and stress unsheltered livestock.',
    moistureDelta: 20,
    evaporationMultiplier: 0.4,
    sunlightFactor: 0.5,
    tempOffset: -6,
    windIntensity: 0.7,
    cropDamageRisk: 0.65,
    animalStressRisk: 0.6,
    latexRainPenalty: 0.35,
    moraleBoost: 0,
    waterloggingRisk: false,
    frostHazard: false,
    heatHazard: false,
    hailHazard: true,
    stormHazard: true,
  },
  frost: {
    id: 'frost',
    name: 'Frost',
    shortName: 'Frost',
    description:
      'Crystalline freezing air lethal to tropical & tender crops unless Row Cover is active. Stresses unsheltered animals.',
    moistureDelta: 2,
    evaporationMultiplier: 0.35,
    sunlightFactor: 0.85,
    tempOffset: -8,
    windIntensity: 0.2,
    cropDamageRisk: 0.7,
    animalStressRisk: 0.5,
    latexRainPenalty: 0,
    moraleBoost: 0,
    waterloggingRisk: false,
    frostHazard: true,
    heatHazard: false,
    hailHazard: false,
    stormHazard: false,
  },
  snow_blizzard: {
    id: 'snow_blizzard',
    name: 'Snow / Blizzard',
    shortName: 'Blizzard',
    description:
      'Blanketing winter snow halts non-hardy crops while Winter Wheat survives dormant. Unsheltered animals suffer cold stress.',
    moistureDelta: 12,
    evaporationMultiplier: 0.2,
    sunlightFactor: 0.4,
    tempOffset: -10,
    windIntensity: 0.85,
    cropDamageRisk: 0.75,
    animalStressRisk: 0.65,
    latexRainPenalty: 0,
    moraleBoost: 0,
    waterloggingRisk: false,
    frostHazard: true,
    heatHazard: false,
    hailHazard: false,
    stormHazard: true,
  },
  rainbow: {
    id: 'rainbow',
    name: 'Post-Rain Rainbow',
    shortName: 'Rainbow',
    description:
      'A radiant rainbow arc after rain! Grants +15% crop growth bonus and lifts all livestock morale.',
    moistureDelta: 5,
    evaporationMultiplier: 0.7,
    sunlightFactor: 1.2,
    tempOffset: 0,
    windIntensity: 0.15,
    cropDamageRisk: 0,
    animalStressRisk: 0,
    latexRainPenalty: 0,
    moraleBoost: 10,
    waterloggingRisk: false,
    frostHazard: false,
    heatHazard: false,
    hailHazard: false,
    stormHazard: false,
  },
};

export const ALL_WEATHER_TYPES = Object.keys(WEATHER_SPECS) as WeatherType[];

const SEASON_BASE_TEMP: Record<Season, { min: number; max: number; baseHumidity: number }> = {
  hot_dry: { min: 28, max: 35, baseHumidity: 58 },
  monsoon_wet: { min: 25, max: 31, baseHumidity: 86 },
  cool_dry: { min: 22, max: 29, baseHumidity: 64 },
  spring: { min: 11, max: 20, baseHumidity: 62 },
  summer: { min: 21, max: 31, baseHumidity: 55 },
  autumn: { min: 7, max: 18, baseHumidity: 66 },
  winter: { min: -2, max: 6, baseHumidity: 70 },
};

type WeatherWeight = [WeatherType, number];

const SEASON_WEATHER_WEIGHTS: Record<Season, WeatherWeight[]> = {
  hot_dry: [
    ['clear', 34],
    ['partly_cloudy', 20],
    ['heatwave', 22],
    ['strong_wind', 12],
    ['overcast_fog', 5],
    ['light_drizzle', 4],
    ['thunderstorm', 3],
  ],
  monsoon_wet: [
    ['heavy_rain', 30],
    ['light_drizzle', 20],
    ['thunderstorm', 18],
    ['overcast_fog', 12],
    ['partly_cloudy', 10],
    ['clear', 6],
    ['strong_wind', 4],
  ],
  cool_dry: [
    ['clear', 34],
    ['partly_cloudy', 28],
    ['overcast_fog', 16],
    ['light_drizzle', 10],
    ['strong_wind', 8],
    ['heavy_rain', 4],
  ],
  spring: [
    ['partly_cloudy', 24],
    ['clear', 22],
    ['light_drizzle', 18],
    ['overcast_fog', 10],
    ['heavy_rain', 8],
    ['strong_wind', 6],
    ['frost', 6],
    ['hailstorm', 6],
  ],
  summer: [
    ['clear', 30],
    ['partly_cloudy', 20],
    ['heatwave', 18],
    ['thunderstorm', 12],
    ['light_drizzle', 8],
    ['strong_wind', 7],
    ['hailstorm', 5],
  ],
  autumn: [
    ['partly_cloudy', 22],
    ['overcast_fog', 18],
    ['light_drizzle', 16],
    ['strong_wind', 14],
    ['clear', 12],
    ['heavy_rain', 8],
    ['frost', 10],
  ],
  winter: [
    ['snow_blizzard', 28],
    ['frost', 28],
    ['overcast_fog', 18],
    ['partly_cloudy', 12],
    ['clear', 8],
    ['strong_wind', 6],
  ],
};

export function getSeasonForDay(
  climate: ClimateType,
  day: number,
): { season: Season; dayInSeason: number; year: number } {
  const seasons = CLIMATE_SPECS[climate].seasons;
  const zeroBased = Math.max(0, day - 1);
  const seasonIndexTotal = Math.floor(zeroBased / DAYS_PER_SEASON);
  const season = seasons[seasonIndexTotal % seasons.length];
  const dayInSeason = (zeroBased % DAYS_PER_SEASON) + 1;
  const year = Math.floor(seasonIndexTotal / seasons.length) + 1;
  return { season, dayInSeason, year };
}

function pickWeightedWeather(
  weights: WeatherWeight[],
  rng: () => number,
): WeatherType {
  const total = weights.reduce((acc, [, w]) => acc + w, 0);
  let r = rng() * total;
  for (const [weather, weight] of weights) {
    r -= weight;
    if (r <= 0) return weather;
  }
  return weights[0][0];
}

export function isRainyWeather(weather: WeatherType): boolean {
  return weather === 'light_drizzle' || weather === 'heavy_rain' || weather === 'thunderstorm';
}

export function generateWeatherDay(
  climate: ClimateType,
  day: number,
  previousWeather: WeatherType | null,
  rng: () => number = Math.random,
): WeatherDay {
  const { season } = getSeasonForDay(climate, day);
  let weather: WeatherType;

  // Post-rain rainbow chance after rainy weather
  if (previousWeather && isRainyWeather(previousWeather) && rng() < 0.22) {
    weather = 'rainbow';
  } else {
    weather = pickWeightedWeather(SEASON_WEATHER_WEIGHTS[season], rng);
  }

  return buildWeatherDay(climate, day, season, weather, rng);
}

export function buildWeatherDay(
  climate: ClimateType,
  day: number,
  season: Season,
  weather: WeatherType,
  rng: () => number = Math.random,
): WeatherDay {
  const base = SEASON_BASE_TEMP[season];
  const spec = WEATHER_SPECS[weather];
  const rawTemp = base.min + rng() * (base.max - base.min) + spec.tempOffset;
  const clampedTemp =
    climate === 'tropical_monsoon'
      ? Math.max(21, Math.min(37, Math.round(rawTemp)))
      : Math.max(-6, Math.min(36, Math.round(rawTemp)));

  const humidityOffset =
    weather === 'heavy_rain' || weather === 'thunderstorm'
      ? 18
      : weather === 'light_drizzle' || weather === 'overcast_fog' || weather === 'rainbow'
        ? 10
        : weather === 'heatwave' || weather === 'strong_wind'
          ? -18
          : 0;
  const humidity = Math.max(20, Math.min(98, Math.round(base.baseHumidity + humidityOffset + (rng() * 8 - 4))));
  const windKmh = Math.round(6 + spec.windIntensity * 46 + rng() * 6);

  return {
    day,
    season,
    weather,
    tempC: clampedTemp,
    humidity,
    windKmh,
  };
}

export function generateInitialWeatherAndForecast(
  climate: ClimateType,
  startDay = 1,
  forecastLength = 5,
  rng: () => number = Math.random,
): { today: WeatherDay; forecast: WeatherDay[] } {
  const { season } = getSeasonForDay(climate, startDay);
  // Start day 1 with pleasant weather so new players get a welcoming first day
  const today = buildWeatherDay(climate, startDay, season, 'partly_cloudy', rng);
  const forecast: WeatherDay[] = [];
  let prev: WeatherType = today.weather;
  for (let i = 1; i <= forecastLength; i++) {
    const next = generateWeatherDay(climate, startDay + i, prev, rng);
    forecast.push(next);
    prev = next.weather;
  }
  return { today, forecast };
}

export function extendForecast(
  climate: ClimateType,
  currentForecast: WeatherDay[],
  targetLength: number,
  rng: () => number = Math.random,
): WeatherDay[] {
  const list = [...currentForecast];
  while (list.length < targetLength) {
    const last = list[list.length - 1];
    const nextDay = last ? last.day + 1 : 2;
    const prevWeather = last ? last.weather : null;
    list.push(generateWeatherDay(climate, nextDay, prevWeather, rng));
  }
  return list;
}
