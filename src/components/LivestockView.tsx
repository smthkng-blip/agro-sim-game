import React from 'react';
import { Heart, ShieldCheck, ShieldAlert, Sparkles, Coins, Utensils } from 'lucide-react';
import type { AnimalType, CropId, GameState } from '../sim/types';
import {
  ALL_ANIMAL_TYPES,
  ANIMAL_SPECS,
  calculateAnimalResalePrice,
  getAnimalCapacity,
} from '../sim/livestock';
import { CROP_CATALOG } from '../sim/crops';
import { formatMoney } from '../sim/market';
import { getAnimalBuyPrice } from '../sim/engine';

interface Props {
  state: GameState;
  onBuyAnimal: (type: AnimalType, asMature: boolean) => void;
  onFeedAnimal: (animalId: string, cropId?: CropId) => void;
  onFeedAll: () => void;
  onPetAnimal: (animalId: string) => void;
  onCollectProduct: (animalId: string) => void;
  onCollectAll: () => void;
  onSellAnimal: (animalId: string) => void;
}

export const LivestockView: React.FC<Props> = ({
  state,
  onBuyAnimal,
  onFeedAnimal,
  onFeedAll,
  onPetAnimal,
  onCollectProduct,
  onCollectAll,
  onSellAnimal,
}) => {
  const feedableBarnCrops = Array.from(
    new Set(
      state.barn
        .filter((b) => b.commodityId in CROP_CATALOG && CROP_CATALOG[b.commodityId as CropId].livestockFeedable)
        .map((b) => b.commodityId as CropId),
    ),
  );

  const readyToCollectCount = state.animals.filter((a) => a.produceReady > 0 || a.truffleReady).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Top Action & Circular Agronomy Summary */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🐄 Livestock Pasture & Circular Agronomy</h2>
          <div className="row-gap">
            <span className="pill">🌾 Animal Feed: <strong>{state.animalFeed}</strong></span>
            <span className="pill">♻️ Organic Manure: <strong>{state.organicManure}</strong></span>
            <button className="primary" onClick={onFeedAll} disabled={state.animals.length === 0 || state.animalFeed === 0}>
              <Utensils size={14} /> Feed All ({state.animalFeed})
            </button>
            <button className="gold" onClick={onCollectAll} disabled={readyToCollectCount === 0}>
              <Sparkles size={14} /> Collect All ({readyToCollectCount})
            </button>
          </div>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          Feed animals with commercial <strong>Animal Feed</strong> or surplus crops from your Barn (Corn, Wheat, Rice, Soybean, Potato).
          Animals generate daily <strong>Organic Manure</strong> you can apply as free compost on your crops!
        </p>
      </div>

      {/* Buy Livestock Market */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🏡 Livestock Pen Market (Buy Baby or Adult Animals)</h3>
          <span className="muted">Prices adjust with Nadia’s Friendship & Flash Sales</span>
        </div>
        <div className="grid-3">
          {ALL_ANIMAL_TYPES.map((type) => {
            const spec = ANIMAL_SPECS[type];
            const count = state.animals.filter((a) => a.type === type).length;
            const cap = getAnimalCapacity(type, state.homestead.ownedTools);
            const youngCost = getAnimalBuyPrice(state, type, false);
            const matureCost = getAnimalBuyPrice(state, type, true);
            const liveKey = type === 'chicken' ? 'live_chicken' : type === 'cow' ? 'live_cow' : 'live_pig';
            const liveMarket = state.market.prices[liveKey];

            return (
              <div key={type} className="sub-card">
                <div className="row-between">
                  <strong>
                    {type === 'chicken' ? '🐔' : type === 'cow' ? '🐄' : '🐖'} {spec.name}
                  </strong>
                  <span className="tag sky">
                    Pen: {count}/{cap}
                  </span>
                </div>
                <p className="muted" style={{ margin: 0, fontSize: '0.77rem' }}>
                  {spec.description}
                </p>
                <div className="row-between" style={{ fontSize: '0.76rem' }}>
                  <span className="muted">Live Market Resale:</span>
                  <span>
                    <strong>{formatMoney(liveMarket.currentPrice, state.currency)}</strong>{' '}
                    <span style={{ color: liveMarket.changePct >= 0 ? '#4ade80' : '#fb7185' }}>
                      ({liveMarket.changePct >= 0 ? '↑' : '↓'}
                      {Math.abs(liveMarket.changePct)}%)
                    </span>
                  </span>
                </div>
                <div className="row-gap" style={{ marginTop: 4 }}>
                  <button
                    className="primary"
                    style={{ flex: 1 }}
                    disabled={count >= cap || state.cash < youngCost}
                    onClick={() => onBuyAnimal(type, false)}
                  >
                    Buy {spec.stageNames.young} ({formatMoney(youngCost, state.currency)})
                  </button>
                  <button
                    style={{ flex: 1 }}
                    disabled={count >= cap || state.cash < matureCost}
                    onClick={() => onBuyAnimal(type, true)}
                  >
                    Buy {spec.stageNames.mature} ({formatMoney(matureCost, state.currency)})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Your Animals */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Your Herd & Flock ({state.animals.length})</h3>
        </div>
        {state.animals.length === 0 ? (
          <p className="muted">No animals yet. Buy a Chick, Calf, or Piglet above to start your livestock pasture!</p>
        ) : (
          <div className="grid-3">
            {state.animals.map((animal) => {
              const spec = ANIMAL_SPECS[animal.type];
              const resale = calculateAnimalResalePrice(animal, state.market);
              return (
                <div key={animal.id} className={`sub-card ${animal.produceReady > 0 || animal.truffleReady ? 'highlight' : ''}`}>
                  <div className="row-between">
                    <div>
                      <strong>
                        {animal.type === 'chicken' ? '🐔' : animal.type === 'cow' ? '🐄' : '🐖'} {animal.name}
                      </strong>
                      <div className="muted" style={{ fontSize: '0.73rem' }}>
                        {spec.stageNames[animal.stage]} · Age {animal.ageDays}d
                        {animal.stage !== 'mature' ? ` · Growth ${animal.growthProgress}%` : ' · Mature'}
                      </div>
                    </div>
                    {animal.sheltered ? (
                      <span className="tag green" title="Sheltered from harsh weather">
                        <ShieldCheck size={12} /> Sheltered
                      </span>
                    ) : (
                      <span className="tag red" title="Needs Pen Upgrade or Climate Ventilation">
                        <ShieldAlert size={12} /> Exposed
                      </span>
                    )}
                  </div>

                  {animal.stressedNote && (
                    <div className="tag red" style={{ width: 'fit-content' }}>
                      ⚠ {animal.stressedNote}
                    </div>
                  )}

                  {/* Bars */}
                  <div className="gauge-grid" style={{ margin: '4px 0' }}>
                    <div className="gauge-item">
                      <div className="gauge-label">
                        <span>Health</span>
                        <span>{animal.health}%</span>
                      </div>
                      <div className="gauge-track">
                        <div className="gauge-fill" style={{ width: `${animal.health}%`, background: '#22c55e' }} />
                      </div>
                    </div>
                    <div className="gauge-item">
                      <div className="gauge-label">
                        <span>Happiness</span>
                        <span>{animal.happiness}%</span>
                      </div>
                      <div className="gauge-track">
                        <div className="gauge-fill" style={{ width: `${animal.happiness}%`, background: '#f472b6' }} />
                      </div>
                    </div>
                    <div className="gauge-item">
                      <div className="gauge-label">
                        <span>Fullness</span>
                        <span>{animal.hunger}%</span>
                      </div>
                      <div className="gauge-track">
                        <div className="gauge-fill" style={{ width: `${animal.hunger}%`, background: '#f59e0b' }} />
                      </div>
                    </div>
                    <div className="gauge-item">
                      <div className="gauge-label">
                        <span>Growth</span>
                        <span>{animal.growthProgress}%</span>
                      </div>
                      <div className="gauge-track">
                        <div className="gauge-fill" style={{ width: `${animal.growthProgress}%`, background: '#38bdf8' }} />
                      </div>
                    </div>
                  </div>

                  {/* Ready produce */}
                  {(animal.produceReady > 0 || animal.truffleReady) && (
                    <button className="gold" onClick={() => onCollectProduct(animal.id)}>
                      <Sparkles size={14} /> Collect{' '}
                      {animal.produceReady > 0 ? `${animal.produceReady}x Grade ${animal.produceQuality} ${spec.produceName}` : ''}
                      {animal.truffleReady ? ' + 1x Black Truffle!' : ''}
                    </button>
                  )}

                  {/* Feed / Pet / Sell */}
                  <div className="row-gap">
                    <button
                      onClick={() => onFeedAnimal(animal.id)}
                      disabled={state.animalFeed <= 0}
                      style={{ flex: 1 }}
                    >
                      🌾 Feed
                    </button>
                    <button
                      onClick={() => onPetAnimal(animal.id)}
                      disabled={animal.pettedToday}
                      style={{ flex: 1 }}
                    >
                      <Heart size={13} /> {animal.pettedToday ? 'Petted' : 'Pet'}
                    </button>
                    <button className="danger" onClick={() => onSellAnimal(animal.id)}>
                      <Coins size={13} /> Sell ({formatMoney(resale, state.currency)})
                    </button>
                  </div>

                  {/* Feed surplus Barn crops */}
                  {feedableBarnCrops.length > 0 && (
                    <div className="row-gap" style={{ marginTop: 2 }}>
                      <span className="muted" style={{ fontSize: '0.7rem' }}>Feed Barn Crop:</span>
                      {feedableBarnCrops.map((cid) => (
                        <button
                          key={cid}
                          style={{ padding: '3px 7px', fontSize: '0.7rem' }}
                          onClick={() => onFeedAnimal(animal.id, cid)}
                        >
                          {CROP_CATALOG[cid].name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
