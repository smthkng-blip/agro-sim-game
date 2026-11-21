import React from 'react';
import { TrendingUp, TrendingDown, Newspaper, Warehouse, Landmark, Coins } from 'lucide-react';
import type { GameState } from '../sim/types';
import {
  ALL_COMMODITY_IDS,
  COMMODITY_META,
  formatMoney,
  getBarnCapacity,
  getBarnUsedUnits,
  getUnitSellPrice,
} from '../sim/market';
import { hasPlacedFurniture } from '../sim/homestead';
import { Sparkline } from './Sparkline';

interface Props {
  state: GameState;
  onSellBarnItem: (itemId: string, qty?: number) => void;
  onTakeLoan: (amount: number) => void;
  onRepayLoan: (amount?: number) => void;
}

export const MarketView: React.FC<Props> = ({
  state,
  onSellBarnItem,
  onTakeLoan,
  onRepayLoan,
}) => {
  const barnUsed = getBarnUsedUnits(state.barn);
  const barnCap = getBarnCapacity(state.homestead.ownedTools);
  const hasDesk = hasPlacedFurniture(state.homestead, 'agronomy_desk');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Market News Headlines */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title"><Newspaper size={18} /> Commodity News & Price Shocks</h2>
          {hasDesk && <span className="tag green">Agronomy Desk Active: Trend Hints Unlocked</span>}
        </div>
        <div className="row-gap">
          {state.market.news.slice(0, 4).map((n) => (
            <div key={n.id} className="pill" style={{ borderColor: n.impactPct >= 0 ? '#10b981' : '#f43f5e' }}>
              <span>Day {n.day}:</span>
              <strong>{n.headline}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Barn Warehouse & Farm Loan */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Warehouse size={16} /> Barn Warehouse ({barnUsed}/{barnCap} units)
            </h3>
            {state.homestead.ownedTools.includes('cooled_barn') && (
              <span className="tag sky">Cooled Barn (+1d shelf life)</span>
            )}
          </div>
          {state.barn.length === 0 ? (
            <p className="muted">
              Your Barn is empty. Store harvested crops, eggs, or milk here to wait for market price surges, or use surplus grains to feed livestock!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
              {state.barn.map((item) => {
                const meta = COMMODITY_META[item.commodityId];
                const unitPrice = getUnitSellPrice(state.market, item.commodityId, item.quality);
                const totalVal = unitPrice * item.quantity;
                return (
                  <div key={item.id} className="sub-card" style={{ padding: '9px 11px' }}>
                    <div className="row-between">
                      <div>
                        <strong>
                          {item.quantity}× {meta.name}
                        </strong>{' '}
                        <span className={`tag ${item.quality === 'A' ? 'gold' : item.quality === 'B' ? 'green' : 'red'}`}>
                          Grade {item.quality}
                        </span>{' '}
                        {item.shelfLifeType === 'storable' ? (
                          <span className="tag sky">Storable</span>
                        ) : (
                          <span className={`tag ${item.daysLeft <= 1 ? 'red' : 'gold'}`}>
                            ⏱ {item.daysLeft}d left
                          </span>
                        )}
                        <div className="muted" style={{ fontSize: '0.74rem', marginTop: 2 }}>
                          Unit: {formatMoney(unitPrice, state.currency)} · Total:{' '}
                          <strong style={{ color: '#4ade80' }}>{formatMoney(totalVal, state.currency)}</strong>
                        </div>
                      </div>
                      <div className="row-gap">
                        {item.quantity > 1 && (
                          <button onClick={() => onSellBarnItem(item.id, 1)}>Sell 1</button>
                        )}
                        <button className="primary" onClick={() => onSellBarnItem(item.id)}>
                          <Coins size={13} /> Sell All
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Small Farm Loan */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Landmark size={16} /> Cooperative Farm Loan</h3>
            <span className="tag">0.5% simple daily interest</span>
          </div>
          <p className="muted" style={{ margin: '0 0 10px' }}>
            Need capital for Rubber/Oil Palm saplings, Dairy Cows, or a Land Expansion Deed? Borrow up to{' '}
            <strong>{formatMoney(3000, state.currency)}</strong> and repay anytime with zero early-repayment fees.
          </p>
          <div className="sub-card" style={{ marginBottom: 10 }}>
            <div className="row-between">
              <span className="muted">Current Principal Owed:</span>
              <strong style={{ fontSize: '1.05rem', color: state.loan.principal > 0 ? '#fda4af' : '#86efac' }}>
                {formatMoney(state.loan.principal, state.currency)}
              </strong>
            </div>
            <div className="row-between">
              <span className="muted">Total Interest Paid:</span>
              <span>{formatMoney(state.loan.totalInterestPaid, state.currency)}</span>
            </div>
          </div>
          <div className="row-gap">
            <button
              className="gold"
              disabled={state.loan.principal + 500 > 3000}
              onClick={() => onTakeLoan(500)}
            >
              Borrow {formatMoney(500, state.currency)}
            </button>
            <button
              disabled={state.loan.principal <= 0 || state.cash < 500}
              onClick={() => onRepayLoan(500)}
            >
              Repay {formatMoney(500, state.currency)}
            </button>
            <button
              className="primary"
              disabled={state.loan.principal <= 0 || state.cash <= 0}
              onClick={() => onRepayLoan()}
            >
              Repay Full
            </button>
          </div>
        </div>
      </div>

      {/* Live Commodity Board */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📈 Live Commodity & Livestock Exchange (All 18 Markets)</h3>
          <span className="muted">Grade A: +20% · Grade B: 100% · Grade C: 75%</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Commodity</th>
                <th>Category</th>
                <th>Current Price</th>
                <th>Daily Change</th>
                <th>10-Day Trend</th>
                {hasDesk && <th>Desk Forecast</th>}
              </tr>
            </thead>
            <tbody>
              {ALL_COMMODITY_IDS.map((id) => {
                const meta = COMMODITY_META[id];
                const entry = state.market.prices[id];
                const up = entry.changePct >= 0;
                return (
                  <tr key={id}>
                    <td><strong>{meta.name}</strong></td>
                    <td>
                      <span className="tag">
                        {meta.category === 'crop'
                          ? 'Crop'
                          : meta.category === 'animal_product'
                            ? 'Animal Produce'
                            : 'Live Animal'}
                      </span>
                    </td>
                    <td><strong>{formatMoney(entry.currentPrice, state.currency)}</strong></td>
                    <td style={{ color: up ? '#4ade80' : '#fb7185', fontWeight: 700 }}>
                      <span className="row-gap" style={{ gap: 4 }}>
                        {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {up ? '+' : ''}
                        {entry.changePct}%
                      </span>
                    </td>
                    <td>
                      <Sparkline
                        values={entry.history}
                        color={up ? '#34d399' : '#f43f5e'}
                      />
                    </td>
                    {hasDesk && (
                      <td>
                        <span
                          className={`tag ${
                            entry.trendHint === 'rising' ? 'green' : entry.trendHint === 'falling' ? 'red' : ''
                          }`}
                        >
                          {entry.trendHint === 'rising' ? '↑ Rising' : entry.trendHint === 'falling' ? '↓ Softening' : '→ Steady'}
                        </span>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
