import { describe, expect, it } from 'vitest';
import {
  advanceDay,
  buyAnimal,
  buyToolAction,
  collectAnimalProductAction,
  createInitialState,
  feedAnimalAction,
  petAnimalAction,
  repayLoanAction,
  sellAnimalAction,
  sellBarnItemAction,
  takeLoanAction,
  toggleCurrencyAction,
} from '../engine';
import { buildWeatherDay } from '../weather';
import { addToBarn, ALL_COMMODITY_IDS, formatMoney, getUnitSellPrice } from '../market';
import { simulateLivestockDay } from '../livestock';

describe('Livestock Lifecycle & Circular Agronomy', () => {
  it('buys Chickens, Cows, and Pigs, feeds with Feed or Barn Crops, grows stages, produces Eggs/Milk/Manure, and sells live animals', () => {
    let state = createInitialState('tropical_monsoon', () => 0.5);

    // Buy a Calf (young cow) and a Piglet (young pig)
    const cowRes = buyAnimal(state, 'cow', false);
    expect(cowRes.ok).toBe(true);
    state = cowRes.state;

    const pigRes = buyAnimal(state, 'pig', false);
    expect(pigRes.ok).toBe(true);
    state = pigRes.state;

    // Add Potatoes to Barn and feed Piglet directly from Barn!
    const pig = state.animals.find((a) => a.type === 'pig')!;
    const barnAdded = addToBarn(state.barn, 'potato', 'A', 3, state.homestead.ownedTools);
    state = { ...state, barn: barnAdded.barn };

    const feedCropRes = feedAnimalAction(state, pig.id, 'potato');
    expect(feedCropRes.ok).toBe(true);
    state = feedCropRes.state;
    expect(state.barn.find((b) => b.commodityId === 'potato')?.quantity).toBe(2);

    // Pet starter hen and advance several days so young animals grow & mature hen lays eggs + manure
    const hen = state.animals.find((a) => a.type === 'chicken' && a.stage === 'mature')!;
    state = petAnimalAction(state, hen.id).state;
    const manureBefore = state.organicManure;

    for (let i = 0; i < 6; i++) {
      // Keep feeding all animals so they grow quickly
      for (const a of state.animals) {
        if (state.animalFeed > 0) {
          state = feedAnimalAction(state, a.id).state;
        }
      }
      state = advanceDay(state, () => 0.1);
    }

    expect(state.organicManure).toBeGreaterThan(manureBefore);

    // Mature hen should have Fresh Eggs ready to collect
    const updatedHen = state.animals.find((a) => a.id === hen.id)!;
    expect(updatedHen.produceReady).toBeGreaterThan(0);

    const collectRes = collectAnimalProductAction(state, updatedHen.id);
    expect(collectRes.ok).toBe(true);
    state = collectRes.state;
    expect(state.barn.some((b) => b.commodityId === 'eggs')).toBe(true);

    // Piglet should have grown past young stage
    const grownPig = state.animals.find((a) => a.id === pig.id)!;
    expect(grownPig.growthProgress).toBeGreaterThan(0);
    expect(['growing', 'mature']).toContain(grownPig.stage);

    // Sell live animal for dynamic cash payout
    const cashBeforeSell = state.cash;
    const sellRes = sellAnimalAction(state, grownPig.id);
    expect(sellRes.ok).toBe(true);
    expect(sellRes.state.cash).toBeGreaterThan(cashBeforeSell);
    expect(sellRes.state.animals.some((a) => a.id === grownPig.id)).toBe(false);
  });

  it('protects livestock from harsh storms/heatwaves when Barn/Shelter upgrades are owned & supports Auto-Feeder', () => {
    const state = createInitialState('tropical_monsoon', () => 0.5);
    const heatwave = buildWeatherDay('tropical_monsoon', 2, 'hot_dry', 'heatwave', () => 0.5);

    const unsheltered = simulateLivestockDay(state.animals, heatwave, [], 5, () => 0.5);
    const sheltered = simulateLivestockDay(
      state.animals,
      heatwave,
      ['coop_upgrade', 'climate_ventilation', 'auto_feeder'],
      5,
      () => 0.5,
    );

    expect(unsheltered.animals[0].sheltered).toBe(false);
    expect(sheltered.animals[0].sheltered).toBe(true);
    expect(sheltered.animals[0].happiness).toBeGreaterThan(unsheltered.animals[0].happiness);
    expect(sheltered.autoFedCount).toBe(state.animals.length);
  });
});

describe('Dynamic Market, Currency Toggle, Barn Spoilage & Farm Loans', () => {
  it('tracks all 18 commodities, supports $ USD / ฿ THB currency formatting, and grades A/B/C prices', () => {
    const state = createInitialState('tropical_monsoon', () => 0.5);
    expect(ALL_COMMODITY_IDS).toHaveLength(18);
    expect(formatMoney(100, 'USD')).toBe('$100');
    expect(formatMoney(100, 'THB')).toBe('฿3,500');

    const toggled = toggleCurrencyAction(state);
    expect(toggled.currency).toBe('THB');

    const priceA = getUnitSellPrice(state.market, 'rubber_tree', 'A');
    const priceB = getUnitSellPrice(state.market, 'rubber_tree', 'B');
    const priceC = getUnitSellPrice(state.market, 'rubber_tree', 'C');
    expect(priceA).toBeGreaterThan(priceB);
    expect(priceB).toBeGreaterThan(priceC);
  });

  it('spoils perishable Fresh Milk after 2 days unless Cooled Barn extends it to 3 days', () => {
    let state = createInitialState('temperate_4season', () => 0.5);
    const added = addToBarn(state.barn, 'milk', 'A', 2, []);
    state = { ...state, barn: added.barn };
    expect(state.barn[0].daysLeft).toBe(2);

    // Day 2 -> 1 day left
    state = advanceDay(state, () => 0.5);
    expect(state.barn.some((b) => b.commodityId === 'milk')).toBe(true);
    // Day 3 -> spoiled!
    state = advanceDay(state, () => 0.5);
    expect(state.barn.some((b) => b.commodityId === 'milk')).toBe(false);
    expect(state.lastDailyReport?.spoiledCount).toBe(2);

    // With Cooled Barn, milk lasts 3 days
    state = buyToolAction(state, 'cooled_barn').state;
    const cooledAdded = addToBarn(state.barn, 'milk', 'A', 2, state.homestead.ownedTools);
    expect(cooledAdded.barn[0].daysLeft).toBe(3);

    // Selling from Barn increases cash
    state = { ...state, barn: cooledAdded.barn };
    const cashBefore = state.cash;
    const sellRes = sellBarnItemAction(state, state.barn[0].id);
    expect(sellRes.ok).toBe(true);
    expect(sellRes.state.cash).toBeGreaterThan(cashBefore);
  });

  it('handles Farm Loan borrowing, simple daily interest, and repayment', () => {
    let state = createInitialState('tropical_monsoon', () => 0.5);
    const startCash = state.cash;

    state = takeLoanAction(state, 1000).state;
    expect(state.cash).toBe(startCash + 1000);
    expect(state.loan.principal).toBe(1000);

    state = advanceDay(state, () => 0.5);
    expect(state.lastDailyReport?.loanInterest).toBe(5); // 0.5% of 1000
    expect(state.loan.totalInterestPaid).toBe(5);

    state = repayLoanAction(state, 1000).state;
    expect(state.loan.principal).toBe(0);
  });
});
