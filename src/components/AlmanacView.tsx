import React, { useState } from 'react';
import { BookOpen, CloudRain, Sprout } from 'lucide-react';
import type { GameState } from '../sim/types';
import { ALL_CROP_IDS, CROP_CATALOG } from '../sim/crops';
import { ALL_WEATHER_TYPES, WEATHER_SPECS } from '../sim/weather';
import { formatMoney } from '../sim/market';
import { CropIcon } from './CropIcon';

interface Props {
  state: GameState;
}

export const AlmanacView: React.FC<Props> = ({ state }) => {
  const [section, setSection] = useState<'crops' | 'weather'>('crops');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title"><BookOpen size={18} /> TerraCraft Agronomy Almanac</h2>
          <div className="row-gap">
            <button
              className={section === 'crops' ? 'primary' : ''}
              onClick={() => setSection('crops')}
            >
              <Sprout size={14} /> 12 Plants & Plantation Trees
            </button>
            <button
              className={section === 'weather' ? 'primary' : ''}
              onClick={() => setSection('weather')}
            >
              <CloudRain size={14} /> 12 Weather Types & Protections
            </button>
          </div>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          Master real-world soil pH, N-P-K rotation (Soybeans fix Nitrogen!), livestock manure composting, and weather defenses to consistently harvest Grade A produce.
        </p>
      </div>

      {section === 'crops' ? (
        <div className="grid-3">
          {ALL_CROP_IDS.map((id) => {
            const c = CROP_CATALOG[id];
            return (
              <div key={id} className="sub-card">
                <div className="row-between">
                  <div className="row-gap">
                    <CropIcon cropId={id} size={28} />
                    <div>
                      <strong style={{ color: c.accentColor }}>{c.name}</strong>
                      <div className="muted" style={{ fontSize: '0.72rem', fontStyle: 'italic' }}>
                        {c.scientificName}
                      </div>
                    </div>
                  </div>
                  <span className={`tag ${c.isPerennial ? 'gold' : 'green'}`}>
                    {c.isPerennial ? 'Perennial' : 'Annual'}
                  </span>
                </div>

                <div style={{ fontSize: '0.77rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  <span>Temp: <strong>{c.optTempMin}–{c.optTempMax}°C</strong></span>
                  <span>Soil pH: <strong>{c.optPhMin}–{c.optPhMax}</strong></span>
                  <span>Water: <strong>{c.waterNeed}</strong></span>
                  <span>Mature: <strong>{c.daysToMature}d{c.regrowDays > 0 ? ` / +${c.regrowDays}d` : ''}</strong></span>
                  <span>Seed: <strong>{formatMoney(c.seedCost, state.currency)}</strong></span>
                  <span>Base Value: <strong>{formatMoney(c.basePrice, state.currency)}</strong></span>
                  <span>N-P-K Draw: <strong>{c.nNeed < 0 ? `+${Math.abs(c.nNeed)}N (Fixer!)` : `${c.nNeed}-${c.pNeed}-${c.kNeed}`}</strong></span>
                  <span>Shelf Life: <strong>{c.shelfLifeType === 'storable' ? 'Storable' : `${c.shelfLifeDays}d`}</strong></span>
                </div>

                <div className="row-gap">
                  {c.livestockFeedable && <span className="tag green">Feeds Livestock</span>}
                  {c.frostHardy && <span className="tag sky">Frost Hardy</span>}
                  {c.floodTolerant && <span className="tag sky">Flood Tolerant</span>}
                  {c.droughtTolerant && <span className="tag gold">Drought Tolerant</span>}
                </div>

                <p className="muted" style={{ margin: 0, fontSize: '0.75rem', lineHeight: 1.4 }}>
                  {c.tips}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid-3">
          {ALL_WEATHER_TYPES.map((wId) => {
            const w = WEATHER_SPECS[wId];
            return (
              <div key={wId} className="sub-card">
                <div className="row-between">
                  <strong>{w.name}</strong>
                  <span className="tag sky">
                    Moisture {w.moistureDelta >= 0 ? `+${w.moistureDelta}%` : `${w.moistureDelta}%`}
                  </span>
                </div>
                <p className="muted" style={{ margin: 0, fontSize: '0.77rem', lineHeight: 1.45 }}>
                  {w.description}
                </p>
                <div className="row-gap" style={{ fontSize: '0.72rem' }}>
                  <span className="tag">Sun {Math.round(w.sunlightFactor * 100)}%</span>
                  <span className="tag">Evap ×{w.evaporationMultiplier}</span>
                  {w.frostHazard && <span className="tag red">Frost Hazard</span>}
                  {w.heatHazard && <span className="tag red">Heat Stress</span>}
                  {w.hailHazard && <span className="tag red">Hail Risk</span>}
                  {w.waterloggingRisk && <span className="tag gold">Waterlogging Risk</span>}
                  {w.moraleBoost > 0 && <span className="tag green">+{w.moraleBoost} Morale</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
