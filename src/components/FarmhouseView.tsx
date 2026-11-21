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

const FurnitureSvg: React.FC<{ id: FurnitureId }> = ({ id }) => {
  switch (id) {
    case 'cozy_sofa':
      return (
        <svg width="46" height="36" viewBox="0 0 46 36" aria-hidden="true">
          <rect x="6" y="10" width="34" height="14" rx="4" fill="#d97706" />
          <rect x="3" y="16" width="7" height="13" rx="3" fill="#b45309" />
          <rect x="36" y="16" width="7" height="13" rx="3" fill="#b45309" />
          <rect x="9" y="19" width="28" height="10" rx="2.5" fill="#f59e0b" />
          <rect x="11" y="13" width="10" height="7" rx="2" fill="#fef3c7" />
          <rect x="25" y="13" width="10" height="7" rx="2" fill="#fde68a" />
        </svg>
      );
    case 'weather_barometer':
      return (
        <svg width="42" height="36" viewBox="0 0 42 36" aria-hidden="true">
          <circle cx="21" cy="18" r="14" fill="#b45309" />
          <circle cx="21" cy="18" r="11" fill="#fefce8" stroke="#f59e0b" strokeWidth="1.5" />
          <line x1="21" y1="18" x2="28" y2="12" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
          <circle cx="21" cy="18" r="2" fill="#1e293b" />
        </svg>
      );
    case 'agronomy_desk':
      return (
        <svg width="46" height="36" viewBox="0 0 46 36" aria-hidden="true">
          <rect x="5" y="14" width="36" height="5" rx="1.5" fill="#92400e" />
          <rect x="8" y="19" width="5" height="13" fill="#78350f" />
          <rect x="33" y="19" width="5" height="13" fill="#78350f" />
          <rect x="12" y="6" width="12" height="8" rx="1" fill="#38bdf8" stroke="#1e293b" strokeWidth="1.2" />
          <rect x="27" y="9" width="9" height="5" rx="1" fill="#fef3c7" />
        </svg>
      );
    case 'kitchen_counter':
      return (
        <svg width="46" height="36" viewBox="0 0 46 36" aria-hidden="true">
          <rect x="4" y="14" width="38" height="18" rx="2" fill="#92400e" />
          <rect x="3" y="12" width="40" height="4" rx="1.5" fill="#e2e8f0" />
          <rect x="8" y="19" width="12" height="10" rx="1" fill="#b45309" />
          <rect x="26" y="19" width="12" height="10" rx="1" fill="#b45309" />
          <circle cx="15" cy="9" r="3" fill="#ef4444" />
        </svg>
      );
    case 'coffee_table':
      return (
        <svg width="44" height="36" viewBox="0 0 44 36" aria-hidden="true">
          <ellipse cx="22" cy="18" rx="17" ry="6" fill="#b45309" />
          <rect x="10" y="21" width="3" height="9" fill="#78350f" />
          <rect x="31" y="21" width="3" height="9" fill="#78350f" />
          <rect x="19" y="13" width="6" height="4" rx="1" fill="#fef3c7" />
        </svg>
      );
    case 'potted_bonsai':
      return (
        <svg width="42" height="36" viewBox="0 0 42 36" aria-hidden="true">
          <path d="M13 24 L29 24 L26 32 L16 32 Z" fill="#b45309" />
          <path d="M21 24 Q19 16 24 12" stroke="#78350f" strokeWidth="3" fill="none" />
          <circle cx="17" cy="13" r="6" fill="#16a34a" />
          <circle cx="26" cy="11" r="6.5" fill="#22c55e" />
          <circle cx="22" cy="8" r="4" fill="#f472b6" />
        </svg>
      );
    case 'woven_rug':
      return (
        <svg width="46" height="36" viewBox="0 0 46 36" aria-hidden="true">
          <rect x="5" y="10" width="36" height="18" rx="3" fill="#dc2626" />
          <rect x="9" y="14" width="28" height="10" rx="2" fill="#f59e0b" />
          <rect x="14" y="17" width="18" height="4" rx="1" fill="#fef3c7" />
        </svg>
      );
    case 'bookshelf':
      return (
        <svg width="42" height="36" viewBox="0 0 42 36" aria-hidden="true">
          <rect x="8" y="4" width="26" height="28" rx="2" fill="#78350f" />
          <rect x="11" y="8" width="4" height="7" fill="#ef4444" />
          <rect x="16" y="8" width="4" height="7" fill="#38bdf8" />
          <rect x="21" y="8" width="4" height="7" fill="#22c55e" />
          <rect x="11" y="19" width="5" height="7" fill="#facc15" />
          <rect x="18" y="19" width="5" height="7" fill="#a78bfa" />
        </svg>
      );
    case 'solar_panels':
      return (
        <svg width="46" height="36" viewBox="0 0 46 36" aria-hidden="true">
          <polygon points="8,26 16,10 38,10 30,26" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="1.5" />
          <line x1="23" y1="10" x2="15" y2="26" stroke="#93c5fd" strokeWidth="1" />
          <line x1="12" y1="18" x2="34" y2="18" stroke="#93c5fd" strokeWidth="1" />
        </svg>
      );
    case 'porch_hammock':
      return (
        <svg width="46" height="36" viewBox="0 0 46 36" aria-hidden="true">
          <path d="M6 12 Q23 30 40 12" stroke="#0d9488" strokeWidth="6" fill="none" strokeLinecap="round" />
          <line x1="4" y1="8" x2="6" y2="12" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="42" y1="8" x2="40" y2="12" stroke="#cbd5e1" strokeWidth="1.5" />
        </svg>
      );
    case 'garden_lanterns':
      return (
        <svg width="42" height="36" viewBox="0 0 42 36" aria-hidden="true">
          <rect x="17" y="16" width="8" height="14" rx="1" fill="#94a3b8" />
          <circle cx="21" cy="14" r="6" fill="#fef08a" opacity="0.5" />
          <rect x="18" y="11" width="6" height="6" rx="1" fill="#fde047" />
          <polygon points="13,11 21,5 29,11" fill="#64748b" />
        </svg>
      );
    case 'koi_pond':
      return (
        <svg width="46" height="36" viewBox="0 0 46 36" aria-hidden="true">
          <ellipse cx="23" cy="20" rx="18" ry="10" fill="#94a3b8" />
          <ellipse cx="23" cy="20" rx="15" ry="8" fill="#0ea5e9" />
          <circle cx="16" cy="18" r="3" fill="#22c55e" />
          <ellipse cx="28" cy="21" rx="4" ry="1.8" fill="#fb923c" />
        </svg>
      );
    case 'festival_trophy':
      return (
        <svg width="42" height="36" viewBox="0 0 42 36" aria-hidden="true">
          <path d="M13 8 L29 8 L26 20 Q21 24 16 20 Z" fill="#facc15" stroke="#b45309" strokeWidth="1.4" />
          <rect x="19" y="22" width="4" height="6" fill="#d97706" />
          <rect x="14" y="28" width="14" height="4" rx="1" fill="#92400e" />
        </svg>
      );
  }
};

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
  const hasKoi = hasPlacedFurniture(state.homestead, 'koi_pond');

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
  if (hasKoi) activePerks.push('+3 Daily Animal Happiness');
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
            <span className="muted">None yet — place a Brass Weather Barometer, Agronomy Desk, or Solar Panels!</span>
          ) : (
            activePerks.map((p) => (
              <span key={p} className="tag green">
                <Sparkles size={11} /> {p}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Illustrated Cozy Wooden Room + Inventory/Shop */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              🏡 Illustrated Room Interior ({state.homestead.placedFurniture.length}/{levelSpec.slots} Slots)
            </h3>
            {(selectedInventoryItem || movingInstanceId) && (
              <span className="tag sky">Click any empty floor tile to {movingInstanceId ? 'move here' : 'place item'}</span>
            )}
          </div>

          <div className="cozy-room-shell">
            {/* Warm sunlit wall with mullioned windows & wall art */}
            <div className="cozy-room-wall">
              <div className="room-window">
                <div className="window-sky" />
                <div className="window-hills" />
                {hasKoi && <div className="window-koi-glint" title="Koi Pond Garden View" />}
                <div className="window-mullion-v" />
                <div className="window-mullion-h" />
              </div>

              <div className="room-wall-art">
                <div className="wall-frame">
                  <span>🌿</span>
                </div>
                <div className="wall-shelf">
                  {state.homestead.trophiesEarned > 0
                    ? '🏆'.repeat(Math.min(4, state.homestead.trophiesEarned))
                    : '🪴'}
                </div>
              </div>

              <div className="room-window">
                <div className="window-sky" />
                <div className="window-hills" />
                <div className="window-mullion-v" />
                <div className="window-mullion-h" />
              </div>
            </div>

            {/* Planked wooden floor grid expanding across Level 1-4 */}
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
                    <span className="slot-num">#{idx + 1}</span>
                    {placed && spec ? (
                      <>
                        <FurnitureSvg id={placed.furnitureId} />
                        <div className="slot-title">{spec.name}</div>
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
                      <span className="slot-empty-label">
                        {selectedInventoryItem || movingInstanceId ? '+ Place Here' : 'Empty Floor'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 350, overflowY: 'auto' }}>
            {ALL_FURNITURE_IDS.filter((id) => FURNITURE_CATALOG[id].purchasable).map((id) => {
              const spec = FURNITURE_CATALOG[id];
              return (
                <div key={id} className="sub-card" style={{ padding: '9px 11px' }}>
                  <div className="row-between">
                    <div className="row-gap">
                      <FurnitureSvg id={id} />
                      <div>
                        <strong>{spec.name}</strong>{' '}
                        <span className="tag">{spec.placement}</span>
                        <div className="muted" style={{ fontSize: '0.74rem' }}>{spec.perk}</div>
                      </div>
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
