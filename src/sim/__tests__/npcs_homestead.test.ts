import { describe, expect, it } from 'vitest';
import {
  acceptContractAction,
  buyFurnitureAction,
  buyLandExpansionAction,
  chatNpcAction,
  claimQuestAction,
  createInitialState,
  deliverContractAction,
  enterHarvestFestivalAction,
  getSeedPrice,
  giftNpcAction,
  moveFurnitureAction,
  performSoilAction,
  placeFurnitureAction,
  removeFurnitureAction,
  upgradeFarmhouseAction,
} from '../engine';
import { ALL_NPC_IDS, getHearts, getNpcDialogue } from '../npcs';
import { addToBarn } from '../market';
import { createPlantedCrop } from '../crops';
import {
  FARMHOUSE_LEVELS,
  getDailyHomesteadUpkeep,
  getForecastDaysLimit,
} from '../homestead';

describe('Interactive NPCs, Quests, Contracts, Gifting & Festival', () => {
  it('provides context-aware Dr. Mali soil advice based on actual farm plots', () => {
    let state = createInitialState('tropical_monsoon', () => 0.5);
    // Put a Rubber Tree on high pH soil (6.8) -> Dr. Mali should warn about Rubber pH!
    state = {
      ...state,
      plots: state.plots.map((p, i) =>
        i === 0
          ? { ...p, soil: { ...p.soil, ph: 6.8 }, crop: createPlantedCrop('rubber_tree') }
          : p,
      ),
    };
    const msg = getNpcDialogue('dr_mali', state);
    expect(msg).toContain('Rubber Tree');
    expect(msg).toContain('Sulfur');
  });

  it('supports chatting, gifting favorite items, Nadia friendship discounts, quests, bulk contracts, and Harvest Festival trophies', () => {
    expect(ALL_NPC_IDS).toHaveLength(5);
    let state = createInitialState('tropical_monsoon', () => 0.5);

    // Chat & Gift Nadia her favorite (Sunflower) -> friendship rises
    const nadiaBefore = state.npcs.nadia.friendship;
    state = chatNpcAction(state, 'nadia').state;
    const withGift = addToBarn(state.barn, 'sunflower', 'A', 2, []);
    state = { ...state, barn: withGift.barn };
    const giftRes = giftNpcAction(state, 'nadia', state.barn[0].id);
    expect(giftRes.ok).toBe(true);
    state = giftRes.state;
    expect(state.npcs.nadia.friendship).toBeGreaterThan(nadiaBefore + 15);
    expect(getHearts(state.npcs.nadia.friendship)).toBeGreaterThanOrEqual(2);

    // Higher Nadia hearts lower seed prices
    const highFriendState = {
      ...state,
      npcs: { ...state.npcs, nadia: { ...state.npcs.nadia, friendship: 100 } },
    };
    expect(getSeedPrice(highFriendState, 'tomato')).toBeLessThan(getSeedPrice(state, 'tomato'));

    // Complete Dr. Mali's compost quest (3 applications)
    state = performSoilAction(state, 2, 'compost').state;
    state = performSoilAction(state, 3, 'compost').state;
    state = performSoilAction(state, 4, 'compost').state;
    const questClaim = claimQuestAction(state, 'q_mali_compost');
    expect(questClaim.ok).toBe(true);
    state = questClaim.state;

    // Accept & deliver Uncle Somchai's Latex Bulk Contract (+35% bonus)
    const contract = state.contracts.find((c) => c.commodityId === 'rubber_tree')!;
    state = acceptContractAction(state, contract.id).state;
    const latexAdded = addToBarn(state.barn, 'rubber_tree', 'A', contract.quantityRequired, []);
    state = { ...state, barn: latexAdded.barn };
    const cashBeforeContract = state.cash;
    const deliv = deliverContractAction(state, contract.id);
    expect(deliv.ok).toBe(true);
    state = deliv.state;
    expect(state.cash).toBeGreaterThan(cashBeforeContract);

    // Enter Grade A item in Auntie Lin's Harvest Festival -> win golden Trophy!
    const festItem = addToBarn(state.barn, 'strawberry', 'A', 1, []);
    state = { ...state, barn: festItem.barn };
    const festEntry = state.barn.find((b) => b.commodityId === 'strawberry')!;
    const festRes = enterHarvestFestivalAction(state, festEntry.id);
    expect(festRes.ok).toBe(true);
    expect(festRes.state.homestead.trophiesEarned).toBe(1);
    expect(festRes.state.homestead.ownedFurniture).toContain('festival_trophy');
  });
});

describe('Land Expansion, Farmhouse Levels & Placeable Furniture Perks', () => {
  it('expands farm land from 4x4 (16) up to 10x6 (60 plots)', () => {
    let state = { ...createInitialState('tropical_monsoon', () => 0.5), cash: 20000 };
    expect(state.plots).toHaveLength(16);

    const expectedCounts = [24, 36, 48, 60];
    for (const count of expectedCounts) {
      const res = buyLandExpansionAction(state);
      expect(res.ok).toBe(true);
      state = res.state;
      expect(state.plots).toHaveLength(count);
    }
    expect(state.homestead.gridCols).toBe(10);
    expect(state.homestead.gridRows).toBe(6);
  });

  it('upgrades farmhouse through 4 levels and activates Weather Barometer & Solar Panels furniture perks', () => {
    let state = { ...createInitialState('tropical_monsoon', () => 0.5), cash: 20000 };
    expect(getForecastDaysLimit(state.homestead)).toBe(3);

    // Upgrade Lv1 -> Lv2 -> Lv3 -> Lv4
    for (const lv of [2, 3, 4] as const) {
      const up = upgradeFarmhouseAction(state);
      expect(up.ok).toBe(true);
      state = up.state;
      expect(state.homestead.farmhouseLevel).toBe(lv);
      expect(FARMHOUSE_LEVELS[lv].slots).toBe(lv * 4);
    }

    const baseUpkeep = getDailyHomesteadUpkeep(state.homestead);

    // Buy & place Brass Weather Barometer -> 5-day forecast!
    state = buyFurnitureAction(state, 'weather_barometer').state;
    state = placeFurnitureAction(state, 'weather_barometer', 1).state;
    expect(getForecastDaysLimit(state.homestead)).toBe(5);

    // Buy & place Solar Roof Panels -> -50% daily upkeep!
    state = buyFurnitureAction(state, 'solar_panels').state;
    state = placeFurnitureAction(state, 'solar_panels', 2).state;
    expect(getDailyHomesteadUpkeep(state.homestead)).toBe(Math.round(baseUpkeep * 0.5));

    // Move & remove furniture cleanly
    const placedBaro = state.homestead.placedFurniture.find((p) => p.furnitureId === 'weather_barometer')!;
    const moved = moveFurnitureAction(state, placedBaro.instanceId, 5);
    expect(moved.ok).toBe(true);
    expect(moved.state.homestead.placedFurniture.find((p) => p.instanceId === placedBaro.instanceId)?.slotIndex).toBe(5);

    const removed = removeFurnitureAction(moved.state, placedBaro.instanceId);
    expect(removed.ok).toBe(true);
    expect(getForecastDaysLimit(removed.state.homestead)).toBe(3);
  });
});
