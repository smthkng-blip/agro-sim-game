import React, { useState } from 'react';
import { MessageCircle, Gift, Trophy, CheckCircle2, ScrollText, X } from 'lucide-react';
import type { GameState, NpcId } from '../sim/types';
import {
  ALL_NPC_IDS,
  getHearts,
  getNpcDialogue,
  getNpcPerkSummary,
} from '../sim/npcs';
import { COMMODITY_META, formatMoney } from '../sim/market';
import { NpcPortrait } from './NpcPortrait';

interface Props {
  state: GameState;
  focusedNpcId: NpcId | null;
  onFocusNpc: (id: NpcId | null) => void;
  onChatNpc: (id: NpcId) => void;
  onGiftNpc: (id: NpcId, barnItemId: string) => void;
  onClaimQuest: (questId: string) => void;
  onAcceptContract: (contractId: string) => void;
  onDeliverContract: (contractId: string) => void;
  onEnterFestival: (barnItemId: string) => void;
}

export const NpcsView: React.FC<Props> = ({
  state,
  focusedNpcId,
  onFocusNpc,
  onChatNpc,
  onGiftNpc,
  onClaimQuest,
  onAcceptContract,
  onDeliverContract,
  onEnterFestival,
}) => {
  const [selectedGiftId, setSelectedGiftId] = useState<string>('');
  const [festivalEntryId, setFestivalEntryId] = useState<string>('');

  const activeNpc = focusedNpcId ? state.npcs[focusedNpcId] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 5 Interactive NPC Cards */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🤝 Village Neighbors & Agronomy Mentors</h2>
          <span className="muted">Build 1–5 Heart friendships for permanent perks & discounts</span>
        </div>
        <div className="grid-3">
          {ALL_NPC_IDS.map((id) => {
            const npc = state.npcs[id];
            const hearts = getHearts(npc.friendship);
            return (
              <div key={id} className="sub-card">
                <div className="row-gap" style={{ alignItems: 'flex-start' }}>
                  <NpcPortrait npcId={id} size={58} />
                  <div style={{ flex: 1 }}>
                    <div className="row-between">
                      <strong>{npc.name}</strong>
                      {npc.visitingToday && <span className="tag green">At Farm Gate</span>}
                    </div>
                    <div className="muted" style={{ fontSize: '0.74rem' }}>{npc.role}</div>
                    <div style={{ color: '#f43f5e', fontSize: '0.88rem', marginTop: 3 }}>
                      {'♥'.repeat(hearts)}
                      <span style={{ color: '#475569' }}>{'♥'.repeat(5 - hearts)}</span>{' '}
                      <span className="muted" style={{ fontSize: '0.7rem' }}>({npc.friendship}/100)</span>
                    </div>
                  </div>
                </div>
                <div className="muted" style={{ fontSize: '0.75rem' }}>
                  {getNpcPerkSummary(id, npc.friendship)}
                </div>
                <button
                  className="primary"
                  onClick={() => {
                    onChatNpc(id);
                    onFocusNpc(id);
                  }}
                >
                  <MessageCircle size={14} /> Talk & Gift
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quests, Bulk Contracts & Harvest Festival */}
      <div className="grid-2">
        {/* Quests */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><ScrollText size={16} /> Village Quests</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {state.quests.map((q) => {
              const npc = state.npcs[q.npcId];
              const barnQty =
                q.type === 'deliver' && q.targetCrop
                  ? state.barn.filter((b) => b.commodityId === q.targetCrop).reduce((a, b) => a + b.quantity, 0)
                  : q.progress;
              const canClaim = !q.claimed && (q.type === 'deliver' ? barnQty >= q.targetAmount : q.completed);

              return (
                <div key={q.id} className={`sub-card ${canClaim ? 'highlight' : ''}`}>
                  <div className="row-between">
                    <strong>{q.title}</strong>
                    <span className="tag">{npc.name}</span>
                  </div>
                  <p className="muted" style={{ margin: 0, fontSize: '0.77rem' }}>{q.description}</p>
                  <div className="row-between">
                    <span className="muted" style={{ fontSize: '0.75rem' }}>
                      Progress: <strong>{Math.min(q.targetAmount, barnQty)}/{q.targetAmount}</strong> · Reward:{' '}
                      <strong>{formatMoney(q.rewardCash, state.currency)}</strong>
                    </span>
                    {q.claimed ? (
                      <span className="tag green"><CheckCircle2 size={12} /> Claimed</span>
                    ) : (
                      <button className="gold" disabled={!canClaim} onClick={() => onClaimQuest(q.id)}>
                        {q.type === 'deliver' ? 'Deliver & Claim' : 'Claim Reward'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contracts & Seasonal Harvest Festival */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📦 Timed Bulk Contracts (+30% to +35% Bonus)</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {state.contracts.map((c) => {
                const comm = COMMODITY_META[c.commodityId];
                const have = state.barn
                  .filter((b) => b.commodityId === c.commodityId)
                  .reduce((a, b) => a + b.quantity, 0);
                const estPay = Math.round(
                  state.market.prices[c.commodityId].currentPrice * c.quantityRequired * c.bonusMultiplier,
                );
                return (
                  <div key={c.id} className="sub-card">
                    <div className="row-between">
                      <strong>{c.title}</strong>
                      <span className="tag gold">{c.daysRemaining}d left</span>
                    </div>
                    <div className="muted" style={{ fontSize: '0.76rem' }}>
                      Deliver <strong>{c.quantityRequired}x {comm.name}</strong> (Have: {have}) · Est. Payout:{' '}
                      <strong style={{ color: '#4ade80' }}>{formatMoney(estPay, state.currency)}</strong>
                    </div>
                    <div className="row-gap">
                      {!c.accepted && (
                        <button onClick={() => onAcceptContract(c.id)}>Accept Contract</button>
                      )}
                      <button
                        className="primary"
                        disabled={have < c.quantityRequired}
                        onClick={() => onDeliverContract(c.id)}
                      >
                        Deliver Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Trophy size={16} /> Auntie Lin’s Seasonal Harvest Festival</h3>
              <span className="tag gold">Trophies Won: {state.homestead.trophiesEarned}</span>
            </div>
            <p className="muted" style={{ margin: '0 0 8px' }}>
              Enter any harvested crop, Fresh Eggs, or Fresh Milk from your Barn. A <strong>Grade A</strong> entry wins{' '}
              <strong>{formatMoney(350, state.currency)}</strong> and a displayable <strong>Festival Trophy</strong>!
            </p>
            {state.festivalEnteredThisSeason ? (
              <span className="tag green">✓ Entered this season — return next season!</span>
            ) : state.barn.length === 0 ? (
              <span className="muted">Store a crop, egg, or milk in your Barn to enter.</span>
            ) : (
              <div className="row-gap">
                <select
                  value={festivalEntryId || state.barn[0]?.id || ''}
                  onChange={(e) => setFestivalEntryId(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--bg-surface-2)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '7px 10px',
                  }}
                >
                  {state.barn.map((b) => (
                    <option key={b.id} value={b.id}>
                      {COMMODITY_META[b.commodityId].name} (Grade {b.quality}, qty {b.quantity})
                    </option>
                  ))}
                </select>
                <button
                  className="gold"
                  onClick={() => onEnterFestival(festivalEntryId || state.barn[0].id)}
                >
                  <Trophy size={14} /> Enter Festival
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Dialogue Modal */}
      {activeNpc && (
        <div className="modal-backdrop" onClick={() => onFocusNpc(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="row-between" style={{ marginBottom: 12 }}>
              <div className="row-gap">
                <NpcPortrait npcId={activeNpc.id} size={64} />
                <div>
                  <h3 style={{ margin: 0 }}>{activeNpc.name}</h3>
                  <div className="muted">{activeNpc.role}</div>
                  <div style={{ color: '#f43f5e' }}>
                    {'♥'.repeat(getHearts(activeNpc.friendship))}
                    <span style={{ color: '#475569' }}>{'♥'.repeat(5 - getHearts(activeNpc.friendship))}</span>
                  </div>
                </div>
              </div>
              <button className="ghost" onClick={() => onFocusNpc(null)} aria-label="Close dialogue">
                <X size={18} />
              </button>
            </div>

            <div
              className="sub-card"
              style={{ marginBottom: 14, fontSize: '0.92rem', lineHeight: 1.5, background: 'var(--bg-surface-3)' }}
            >
              “{getNpcDialogue(activeNpc.id, state)}”
            </div>

            <div className="muted" style={{ marginBottom: 8 }}>
              Favorite gifts:{' '}
              {activeNpc.favoriteCommodities.map((c) => COMMODITY_META[c].name).join(', ')}
            </div>

            {activeNpc.giftedToday ? (
              <span className="tag green">✓ Already gifted today</span>
            ) : state.barn.length === 0 ? (
              <span className="muted">Harvest crops or collect eggs/milk into your Barn to bring a gift!</span>
            ) : (
              <div className="row-gap">
                <select
                  value={selectedGiftId || state.barn[0]?.id || ''}
                  onChange={(e) => setSelectedGiftId(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--bg-surface-2)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '7px 10px',
                  }}
                >
                  {state.barn.map((b) => (
                    <option key={b.id} value={b.id}>
                      {COMMODITY_META[b.commodityId].name} (Grade {b.quality}, qty {b.quantity})
                    </option>
                  ))}
                </select>
                <button
                  className="primary"
                  onClick={() => onGiftNpc(activeNpc.id, selectedGiftId || state.barn[0].id)}
                >
                  <Gift size={14} /> Give Gift
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
