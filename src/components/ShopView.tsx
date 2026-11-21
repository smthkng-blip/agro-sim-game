import React from 'react';
import { Map, Wrench, ShoppingBag, CheckCircle2, Zap } from 'lucide-react';
import type { GameState, ToolId } from '../sim/types';
import { ALL_TOOL_IDS, LAND_TIERS, TOOL_CATALOG } from '../sim/homestead';
import { formatMoney } from '../sim/market';
import { COMPOST_BAG_UNIT_COST, getFeedBagPrice } from '../sim/engine';

interface Props {
  state: GameState;
  onExpandLand: () => void;
  onBuyTool: (toolId: ToolId) => void;
  onBuySupplies: (supply: 'animal_feed' | 'compost_bag', qty: number) => void;
}

export const ShopView: React.FC<Props> = ({
  state,
  onExpandLand,
  onBuyTool,
  onBuySupplies,
}) => {
  const currentTier = LAND_TIERS[state.homestead.landTier];
  const nextTier = LAND_TIERS[state.homestead.landTier + 1];
  const feedUnit = getFeedBagPrice(state);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Nadia's Rotating Flash Sale Banner */}
      <div className="toast-banner">
        <div className="row-gap">
          <Zap size={18} color="#fbbf24" />
          <span>
            <strong>Nadia’s Daily Flash Sale:</strong> {state.flashSale.label}
          </span>
        </div>
        <span className="tag gold">Rotates Daily</span>
      </div>

      {/* Land Expansion + Supplies */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><Map size={18} /> Land Expansion Deeds</h2>
            <span className="tag green">
              Current: {currentTier.cols}×{currentTier.rows} ({currentTier.totalPlots} plots)
            </span>
          </div>
          <p className="muted" style={{ margin: '0 0 10px' }}>
            Expand your farm parcel step by step: 4×4 → 6×4 → 6×6 → 8×6 → 10×6 (60 full plantation plots).
          </p>
          {nextTier ? (
            <div className="sub-card highlight">
              <div className="row-between">
                <div>
                  <strong>{nextTier.label}</strong>
                  <div className="muted" style={{ fontSize: '0.76rem' }}>{nextTier.description}</div>
                </div>
                <button
                  className="gold"
                  disabled={state.cash < nextTier.cost}
                  onClick={onExpandLand}
                >
                  Buy Deed ({formatMoney(nextTier.cost, state.currency)})
                </button>
              </div>
            </div>
          ) : (
            <span className="tag gold">🌟 Maximum 10×6 Grand Plantation Unlocked!</span>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title"><ShoppingBag size={18} /> Farm Supplies</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="sub-card">
              <div className="row-between">
                <div>
                  <strong>🌾 Animal Feed (Pack of 5)</strong>
                  <div className="muted" style={{ fontSize: '0.75rem' }}>
                    In stock: {state.animalFeed} · {formatMoney(feedUnit, state.currency)}/unit
                  </div>
                </div>
                <button
                  className="primary"
                  disabled={state.cash < feedUnit * 5}
                  onClick={() => onBuySupplies('animal_feed', 5)}
                >
                  Buy 5 ({formatMoney(feedUnit * 5, state.currency)})
                </button>
              </div>
            </div>
            <div className="sub-card">
              <div className="row-between">
                <div>
                  <strong>🪴 Organic Compost Bags (Pack of 5)</strong>
                  <div className="muted" style={{ fontSize: '0.75rem' }}>
                    In stock: {state.compostBags} (+{state.organicManure} free Livestock Manure)
                  </div>
                </div>
                <button
                  className="primary"
                  disabled={state.cash < COMPOST_BAG_UNIT_COST * 5}
                  onClick={() => onBuySupplies('compost_bag', 5)}
                >
                  Buy 5 ({formatMoney(COMPOST_BAG_UNIT_COST * 5, state.currency)})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools & Equipment Shop */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title"><Wrench size={18} /> Tools, Irrigation & Livestock Barn Upgrades</h2>
        </div>
        <div className="grid-3">
          {ALL_TOOL_IDS.map((id) => {
            const spec = TOOL_CATALOG[id];
            const owned = state.homestead.ownedTools.includes(id);
            return (
              <div key={id} className={`sub-card ${owned ? 'highlight' : ''}`}>
                <div className="row-between">
                  <strong>{spec.name}</strong>
                  <span className="tag">{spec.category}</span>
                </div>
                <p className="muted" style={{ margin: 0, fontSize: '0.77rem' }}>
                  {spec.description}
                </p>
                <div className="row-between" style={{ marginTop: 'auto' }}>
                  <span className="tag sky">{spec.perkSummary}</span>
                  {owned ? (
                    <span className="tag green"><CheckCircle2 size={12} /> Owned</span>
                  ) : (
                    <button
                      className="primary"
                      disabled={state.cash < spec.cost}
                      onClick={() => onBuyTool(id)}
                    >
                      Buy {formatMoney(spec.cost, state.currency)}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
