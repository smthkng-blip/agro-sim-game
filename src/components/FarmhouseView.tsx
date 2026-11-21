import React, { useState } from 'react';
import { Home, ArrowUpCircle, Move, Trash2, Sparkles } from 'lucide-react';
import type { FurnitureId, GameState } from '../sim/types';
import {
  ALL_FURNITURE_IDS,
  FARMHOUSE_LEVELS,
  FURNITURE_CATALOG,
  getDailyHomesteadUpkeep,
  hasPlacedFurniture,
} from '../sim/homestead';
import { formatMoney } from '../sim/market';

interface Props {
  state: GameState;
  onUpgradeFarmhouse: () => void;
  onBuyFurniture: (id: FurnitureId) => void;
  onPlaceFurniture: (id: FurnitureId, slotIndex: number) => void;
  onRemoveFurniture: (instanceId: string) => void;
  onMoveFurniture: (instanceId: string, targetSlot: number) => void;
}

export const FarmhouseView: React.FC<Props> = ({
  state,
  onUpgradeFarmhouse,
  onBuyFurniture,
  onPlaceFurniture,
  onRemoveFurniture,
  onMoveFurniture,
}) => {
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<FurnitureId | null>(null);
  const [movingInstanceId, setMovingInstanceId] = useState<string | null>(null);

  const levelSpec = FARMHOUSE_LEVELS[state.homestead.farmhouseLevel];
  const nextLevelSpec =
    state.homestead.farmhouseLevel < 4
      ? FARMHOUSE_LEVELS[(state.homestead.farmhouseLevel + 1) as 2 | 3 | 4]
      : null;

  const upkeep = getDailyHomesteadUpkeep(state.homestead);

  const handleSlotClick = (slotIndex: number) => {
    const existing = state.homestead.placedFurniture.find((p) => p.slotIndex === slotIndex);
    if (movingInstanceId) {
      if (!existing) {
        onMoveFurniture(movingInstanceId, slotIndex);
      }
      setMovingInstanceId(null);
      return;
    }
    if (!existing && selectedInventoryItem) {
      onPlaceFurniture(selectedInventoryItem, slotIndex);
      setSelectedInventoryItem(null);
    }
  };

  const activePerks: string[] = [];
  if (hasPlacedFurniture(state.homestead, 'weather_barometer')) activePerks.push('5-Day Weather Forecast');
  if (hasPlacedFurniture(state.homestead, 'agronomy_desk')) activePerks.push('Market Trend Hints');
  if (hasPlacedFurniture(state.homestead, 'solar_panels')) activePerks.push('-50% Daily Upkeep');
  if (hasPlacedFurniture(state.homestead, 'koi_pond')) activePerks.push('+3 Daily Animal Happiness');
  if (hasPlacedFurniture(state.homestead, 'kitchen_counter')) activePerks.push('+2 Gift Bonus (Auntie Lin)');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Farmhouse Header & Upgrade */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Home size={18} /> Level {levelSpec.level}: {levelSpec.name}
            </h2>
            <p className="muted" style={{ margin: '4px 0 0' }}>
              {levelSpec.description} · Daily Upkeep: <strong>{formatMoney(upkeep, state.currency)}</strong>
            </p>
          </div>
          {nextLevelSpec ? (
            <button
              className="gold"
              disabled={state.cash < nextLevelSpec.upgradeCost}
              onClick={onUpgradeFarmhouse}
            >
              <ArrowUpCircle size={15} /> Upgrade to Lv.{nextLevelSpec.level} {nextLevelSpec.name} (
              {formatMoney(nextLevelSpec.upgradeCost, state.currency)})
            </button>
          ) : (
            <span className="tag gold">✨ Max Level Eco-Estate!</span>
          )}
        </div>
        <div className="row-gap">
          <span className="muted">Active Homestead Perks:</span>
          {activePerks.length === 0 ? (
            <span className="muted">None yet — place a Weather Barometer, Agronomy Desk, or Solar Panels!</span>
          ) : (
            activePerks.map((p) => (
              <span key={p} className="tag green">
                <Sparkles size={11} /> {p}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Interactive Interior Grid + Inventory */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              🪑 Interior Floorplan ({state.homestead.placedFurniture.length}/{levelSpec.slots} Slots)
            </h3>
            {(selectedInventoryItem || movingInstanceId) && (
              <span className="tag sky">Click any empty slot to {movingInstanceId ? 'move here' : 'place item'}</span>
            )}
          </div>
          <div className="interior-grid">
            {Array.from({ length: levelSpec.slots }).map((_, idx) => {
              const placed = state.homestead.placedFurniture.find((p) => p.slotIndex === idx);
              const spec = placed ? FURNITURE_CATALOG[placed.furnitureId] : null;
              const isMovingThis = placed?.instanceId === movingInstanceId;
              return (
                <div
                  key={idx}
                  className={`interior-slot ${placed ? 'occupied' : ''} ${isMovingThis ? 'selected-move' : ''}`}
                  onClick={() => handleSlotClick(idx)}
                >
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Slot #{idx + 1}</span>
                  {placed && spec ? (
                    <>
                      <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#fef3c7' }}>{spec.name}</div>
                      <div className="row-gap" onClick={(e) => e.stopPropagation()}>
                        <button
                          style={{ padding: '3px 6px', fontSize: '0.68rem' }}
                          title="Move to another empty slot"
                          onClick={() => {
                            setSelectedInventoryItem(null);
                            setMovingInstanceId(isMovingThis ? null : placed.instanceId);
                          }}
                        >
                          <Move size={11} />
                        </button>
                        <button
                          className="danger"
                          style={{ padding: '3px 6px', fontSize: '0.68rem' }}
                          title="Remove to inventory"
                          onClick={() => onRemoveFurniture(placed.instanceId)}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {selectedInventoryItem || movingInstanceId ? '+ Place Here' : 'Empty'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📦 Furniture Inventory ({state.homestead.ownedFurniture.length})</h3>
          </div>
          {state.homestead.ownedFurniture.length === 0 ? (
            <p className="muted">
              No unplaced furniture in storage. Buy furniture below or win a golden Harvest Festival Trophy from Auntie Lin!
            </p>
          ) : (
            <div className="row-gap" style={{ marginBottom: 12 }}>
              {state.homestead.ownedFurniture.map((fid, i) => {
                const spec = FURNITURE_CATALOG[fid];
                const isSelected = selectedInventoryItem === fid;
                return (
                  <button
                    key={`${fid}_${i}`}
                    className={isSelected ? 'primary' : ''}
                    onClick={() => {
                      setMovingInstanceId(null);
                      setSelectedInventoryItem(isSelected ? null : fid);
                    }}
                  >
                    {fid === 'festival_trophy' ? '🏆' : '🪑'} {spec.name}
                  </button>
                );
              })}
            </div>
          )}

          <h3 className="card-title" style={{ marginTop: 12, marginBottom: 8 }}>
            🛋️ Furniture & Outdoor Decor Catalog
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 330, overflowY: 'auto' }}>
            {ALL_FURNITURE_IDS.filter((id) => FURNITURE_CATALOG[id].purchasable).map((id) => {
              const spec = FURNITURE_CATALOG[id];
              return (
                <div key={id} className="sub-card" style={{ padding: '9px 11px' }}>
                  <div className="row-between">
                    <div>
                      <strong>{spec.name}</strong>{' '}
                      <span className="tag">{spec.placement}</span>
                      <div className="muted" style={{ fontSize: '0.74rem' }}>{spec.perk}</div>
                    </div>
                    <button
                      className="primary"
                      disabled={state.cash < spec.cost}
                      onClick={() => onBuyFurniture(id)}
                    >
                      Buy {formatMoney(spec.cost, state.currency)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
