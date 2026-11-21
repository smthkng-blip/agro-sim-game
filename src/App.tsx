import React, { useCallback, useEffect, useState } from 'react';
import {
  Sprout,
  Sun,
  Droplets,
  FastForward,
  RotateCcw,
  Coins,
  Thermometer,
  Home,
  Users,
  ShoppingCart,
  BookOpen,
  Warehouse,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';
import type {
  AnimalType,
  ClimateType,
  CropId,
  FloatingPopup,
  FurnitureId,
  GameState,
  GameTab,
  HeatmapMode,
  NpcId,
  SoilActionType,
  ToolId,
} from './sim/types';
import {
  acceptContractAction,
  advanceDay,
  buyAnimal,
  buyFurnitureAction,
  buyLandExpansionAction,
  buySuppliesAction,
  buyToolAction,
  chatNpcAction,
  claimQuestAction,
  clearSavedGame,
  collectAllAnimalProductsAction,
  collectAnimalProductAction,
  createInitialState,
  deliverContractAction,
  enterHarvestFestivalAction,
  feedAllAnimalsAction,
  feedAnimalAction,
  getSeedPrice,
  giftNpcAction,
  harvestAllReady,
  harvestPlot,
  loadGameFromStorage,
  moveFurnitureAction,
  performSoilAction,
  petAnimalAction,
  placeFurnitureAction,
  plantCrop,
  removeFurnitureAction,
  repayLoanAction,
  saveGameToStorage,
  sellAnimalAction,
  sellBarnItemAction,
  takeLoanAction,
  toggleCurrencyAction,
  upgradeFarmhouseAction,
  type ActionResult,
} from './sim/engine';
import { ALL_CROP_IDS, CROP_CATALOG, GROWTH_STAGE_NAMES } from './sim/crops';
import { CLIMATE_SPECS, SEASON_LABELS, WEATHER_SPECS } from './sim/weather';
import { SOIL_ACTION_COSTS, SOIL_ACTION_LABELS } from './sim/soil';
import { formatMoney, getBarnUsedUnits } from './sim/market';
import { getForecastDaysLimit } from './sim/homestead';
import { FarmSceneCanvas } from './components/FarmSceneCanvas';
import { LivestockView } from './components/LivestockView';
import { FarmhouseView } from './components/FarmhouseView';
import { NpcsView } from './components/NpcsView';
import { MarketView } from './components/MarketView';
import { ShopView } from './components/ShopView';
import { AlmanacView } from './components/AlmanacView';

const ALL_SOIL_ACTIONS: SoilActionType[] = [
  'irrigate',
  'compost',
  'lime',
  'sulfur',
  'mulch',
  'row_cover',
  'till_clear',
];

const HEATMAP_MODES: Array<{ id: HeatmapMode; label: string }> = [
  { id: 'none', label: 'Normal View' },
  { id: 'moisture', label: 'Moisture' },
  { id: 'ph', label: 'Soil pH' },
  { id: 'n', label: 'Nitrogen (N)' },
  { id: 'k', label: 'Potassium (K)' },
  { id: 'health', label: 'Plant Health' },
];

export const App: React.FC = () => {
  const [state, setState] = useState<GameState>(() => {
    const saved = loadGameFromStorage();
    return saved ?? createInitialState('tropical_monsoon');
  });
  const [tab, setTab] = useState<GameTab>('farm');
  const [selectedPlotId, setSelectedPlotId] = useState<number>(0);
  const [selectedSeed, setSelectedSeed] = useState<CropId>('rubber_tree');
  const [heatmap, setHeatmap] = useState<HeatmapMode>('none');
  const [focusedNpcId, setFocusedNpcId] = useState<NpcId | null>(null);
  const [toast, setToast] = useState<string>('');
  const [popups, setPopups] = useState<FloatingPopup[]>([]);
  const [splashPlotIds, setSplashPlotIds] = useState<number[]>([]);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  // Auto-save whenever state updates
  useEffect(() => {
    saveGameToStorage(state);
  }, [state]);

  // Clean up expired floating popups
  useEffect(() => {
    if (popups.length === 0) return;
    const timer = setTimeout(() => {
      const now = Date.now();
      setPopups((prev) => prev.filter((p) => now - p.createdAt < 1650));
    }, 600);
    return () => clearTimeout(timer);
  }, [popups]);

  const spawnPopup = useCallback((text: string, color = '#4ade80', x = 0.5, y = 0.45) => {
    setPopups((prev) => [
      ...prev.slice(-8),
      { id: `pop_${Date.now()}_${Math.random()}`, text, color, x, y, createdAt: Date.now() },
    ]);
  }, []);

  const applyResult = useCallback(
    (res: ActionResult, popupPos?: { x: number; y: number }) => {
      setState(res.state);
      setToast(res.message);
      if (res.ok && res.popupText) {
        spawnPopup(res.popupText, res.popupColor ?? '#4ade80', popupPos?.x ?? 0.5, popupPos?.y ?? 0.45);
      }
    },
    [spawnPopup],
  );

  const handleNextDay = useCallback(() => {
    setState((prev) => {
      const next = advanceDay(prev);
      const rep = next.lastDailyReport;
      if (rep) {
        const parts = [`Day ${rep.day}: ${WEATHER_SPECS[rep.weather].shortName} (${rep.tempC}°C)`];
        if (rep.manureProduced > 0) parts.push(`+${rep.manureProduced} Manure`);
        if (rep.autoWateredCount > 0) parts.push(`${rep.autoWateredCount} auto-watered`);
        if (rep.spoiledCount > 0) parts.push(`${rep.spoiledCount} spoiled`);
        setToast(parts.join(' · '));
        if (rep.manureProduced > 0) {
          spawnPopup(`+${rep.manureProduced} Manure!`, '#a3e635', 0.86, 0.45);
        }
      }
      return next;
    });
  }, [spawnPopup]);

  // Spacebar shortcut for Next Day
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !showResetModal &&
        !focusedNpcId &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLButtonElement)
      ) {
        e.preventDefault();
        handleNextDay();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNextDay, showResetModal, focusedNpcId]);

  const selectedPlot = state.plots.find((p) => p.id === selectedPlotId) ?? state.plots[0];
  const weatherSpec = WEATHER_SPECS[state.weatherToday.weather];
  const forecastLimit = getForecastDaysLimit(state.homestead);
  const readyHarvestCount = state.plots.filter((p) => p.crop && p.crop.stage === 4).length;
  const readyLivestockCount = state.animals.filter((a) => a.produceReady > 0 || a.truffleReady).length;
  const claimableQuests = state.quests.filter((q) => !q.claimed && q.completed).length;
  const barnUnits = getBarnUsedUnits(state.barn);

  const triggerWaterSplash = (plotIds: number[]) => {
    setSplashPlotIds(plotIds);
    setTimeout(() => setSplashPlotIds([]), 750);
  };

  const handleSoilAction = (action: SoilActionType) => {
    const res = performSoilAction(state, selectedPlot.id, action);
    if (res.ok && action === 'irrigate') {
      const ids = state.homestead.ownedTools.includes('drip_irrigation')
        ? state.plots.filter((p) => p.row === selectedPlot.row).map((p) => p.id)
        : [selectedPlot.id];
      triggerWaterSplash(ids);
    }
    applyResult(res, { x: 0.48, y: 0.5 });
  };

  const handleResetFarm = (climate: ClimateType) => {
    clearSavedGame();
    const fresh = createInitialState(climate);
    setState(fresh);
    setSelectedPlotId(0);
    setTab('farm');
    setShowResetModal(false);
    setToast(`Started new ${CLIMATE_SPECS[climate].name} farm!`);
  };

  return (
    <div className="app-shell">
      {/* Top HUD Bar */}
      <header className="hud-bar">
        <div className="hud-brand">
          <div className="brand-badge">
            <Sprout size={22} />
          </div>
          <div>
            <div className="brand-title">TerraCraft Agronomy</div>
            <div className="brand-sub">
              {CLIMATE_SPECS[state.climate].name} · Year {state.year} · {SEASON_LABELS[state.season]} Day {state.dayInSeason}/15
            </div>
          </div>
        </div>

        <div className="hud-metrics">
          <span className="pill weather" title={weatherSpec.description}>
            <Thermometer size={14} />
            <strong>{weatherSpec.shortName}</strong> · {state.weatherToday.tempC}°C · {state.weatherToday.humidity}% RH
          </span>

          <span className="pill cash">
            <Coins size={14} />
            <strong>{formatMoney(state.cash, state.currency)}</strong>
          </span>

          <button
            onClick={() => setState((prev) => toggleCurrencyAction(prev))}
            title="Toggle between $ USD and ฿ THB (1 USD = 35 THB)"
          >
            {state.currency === 'USD' ? '$ USD → ฿ THB' : '฿ THB → $ USD'}
          </button>

          <span className="pill" title="Free Organic Manure generated by Livestock">
            ♻️ Manure: <strong>{state.organicManure}</strong>
          </span>

          <span className="pill" title="Commercial Animal Feed stock">
            🌾 Feed: <strong>{state.animalFeed}</strong>
          </span>

          <button className="primary" onClick={handleNextDay} title="Advance to next day (Spacebar)">
            <FastForward size={15} /> Next Day (D{state.day + 1})
          </button>

          <button onClick={() => setShowResetModal(true)} title="Reset Farm & Choose Climate">
            <RotateCcw size={14} /> New Farm
          </button>
        </div>

        {/* Forecast Strip (3d default, 5d with Barometer) */}
        <div className="forecast-strip" style={{ width: '100%', paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="muted" style={{ fontSize: '0.73rem' }}>
            <Sun size={12} style={{ verticalAlign: 'middle' }} /> {forecastLimit}-Day Forecast:
          </span>
          {state.forecast.slice(0, forecastLimit).map((f) => (
            <span key={f.day} className="forecast-chip">
              <span>D{f.day}</span>
              <b>{WEATHER_SPECS[f.weather].shortName}</b>
              <span>{f.tempC}°C</span>
            </span>
          ))}
          {forecastLimit === 3 && (
            <span className="muted" style={{ fontSize: '0.7rem', marginLeft: 'auto' }}>
              Tip: Place a Brass Weather Barometer in Farmhouse for 5-day forecast!
            </span>
          )}
        </div>
      </header>

      {/* Toast / Daily Report Banner */}
      {toast && (
        <div className="toast-banner">
          <span>{toast}</span>
          <button className="ghost" style={{ padding: '2px 6px' }} onClick={() => setToast('')} aria-label="Dismiss message">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="nav-tabs" aria-label="Game Sections">
        <button className={`nav-tab ${tab === 'farm' ? 'active' : ''}`} onClick={() => setTab('farm')}>
          <Sprout size={15} /> Farm Land
          {readyHarvestCount > 0 && <span className="badge-count">{readyHarvestCount}</span>}
        </button>
        <button className={`nav-tab ${tab === 'livestock' ? 'active' : ''}`} onClick={() => setTab('livestock')}>
          🐄 Livestock Pasture
          {readyLivestockCount > 0 && <span className="badge-count">{readyLivestockCount}</span>}
        </button>
        <button className={`nav-tab ${tab === 'farmhouse' ? 'active' : ''}`} onClick={() => setTab('farmhouse')}>
          <Home size={15} /> Farmhouse Interior
        </button>
        <button className={`nav-tab ${tab === 'npcs' ? 'active' : ''}`} onClick={() => setTab('npcs')}>
          <Users size={15} /> Village & NPCs
          {claimableQuests > 0 && <span className="badge-count">{claimableQuests}</span>}
        </button>
        <button className={`nav-tab ${tab === 'market' ? 'active' : ''}`} onClick={() => setTab('market')}>
          <Warehouse size={15} /> Market & Barn
          {barnUnits > 0 && <span className="badge-count">{barnUnits}</span>}
        </button>
        <button className={`nav-tab ${tab === 'shop' ? 'active' : ''}`} onClick={() => setTab('shop')}>
          <ShoppingCart size={15} /> Shop
        </button>
        <button className={`nav-tab ${tab === 'almanac' ? 'active' : ''}`} onClick={() => setTab('almanac')}>
          <BookOpen size={15} /> Agronomy Almanac
        </button>
      </nav>

      {/* Active Tab Content */}
      {tab === 'farm' && (
        <div className="farm-layout">
          {/* Left: Living Farm Canvas + Heatmap Bar */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                🌿 Living Farm Estate ({state.homestead.gridCols}×{state.homestead.gridRows} Plots)
              </h2>
              <div className="row-gap">
                {readyHarvestCount > 0 && (
                  <button
                    className="gold"
                    onClick={() => applyResult(harvestAllReady(state, false), { x: 0.5, y: 0.35 })}
                  >
                    <Sparkles size={14} /> Harvest All Ready ({readyHarvestCount})
                  </button>
                )}
              </div>
            </div>

            <FarmSceneCanvas
              state={state}
              selectedPlotId={selectedPlot.id}
              heatmap={heatmap}
              popups={popups}
              splashPlotIds={splashPlotIds}
              onSelectPlot={(id) => setSelectedPlotId(id)}
              onClickNpc={(npcId) => {
                applyResult(chatNpcAction(state, npcId));
                setFocusedNpcId(npcId);
                setTab('npcs');
              }}
              onClickPasture={() => setTab('livestock')}
              onClickFarmhouse={() => setTab('farmhouse')}
              onClickLockedLand={() => {
                setTab('shop');
                setToast('Buy a Land Expansion Deed in the Shop to unlock surrounding parcels!');
              }}
            />

            {/* Heatmap Overlay Toggle */}
            <div className="heatmap-bar">
              <span className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Layers size={14} /> Heatmap:
              </span>
              {HEATMAP_MODES.map((m) => (
                <button
                  key={m.id}
                  className={heatmap === m.id ? 'active' : ''}
                  style={{ padding: '4px 9px', fontSize: '0.76rem' }}
                  onClick={() => setHeatmap(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Recent Farm Log */}
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <div className="muted" style={{ fontSize: '0.73rem', marginBottom: 4 }}>Recent Farm Activity</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 72, overflowY: 'auto' }}>
                {state.log.slice(0, 5).map((entry, i) => (
                  <div key={i} style={{ fontSize: '0.75rem', color: i === 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    • {entry}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Selected Plot Soil Inspector, Actions & 12-Crop Seed Palette */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  🔍 Plot R{selectedPlot.row + 1}C{selectedPlot.col + 1}
                </h3>
                <div className="row-gap">
                  {selectedPlot.soil.mulchedDays > 0 && (
                    <span className="tag gold">Mulch {selectedPlot.soil.mulchedDays}d</span>
                  )}
                  {selectedPlot.soil.rowCoverDays > 0 && (
                    <span className="tag sky">Row Cover {selectedPlot.soil.rowCoverDays}d</span>
                  )}
                </div>
              </div>

              {/* Planted Crop Info */}
              {selectedPlot.crop ? (
                <div className="sub-card" style={{ marginBottom: 10 }}>
                  <div className="row-between">
                    <strong>{CROP_CATALOG[selectedPlot.crop.cropId].name}</strong>
                    <span className={`tag ${selectedPlot.crop.stage === 4 ? 'gold' : 'green'}`}>
                      {GROWTH_STAGE_NAMES[selectedPlot.crop.stage]} ({Math.round(selectedPlot.crop.progress)}%)
                    </span>
                  </div>
                  <div className="row-between muted" style={{ fontSize: '0.75rem' }}>
                    <span>Health: <strong>{selectedPlot.crop.health}%</strong></span>
                    <span>Quality Est.: <strong>{selectedPlot.crop.qualityScore}/100</strong></span>
                  </div>
                  {selectedPlot.crop.damagedNote && (
                    <div className="tag red" style={{ width: 'fit-content' }}>
                      ⚠ {selectedPlot.crop.damagedNote}
                    </div>
                  )}
                  {state.homestead.ownedTools.includes('soil_probe') && (
                    <div className="muted" style={{ fontSize: '0.72rem' }}>
                      Probe Target: pH {CROP_CATALOG[selectedPlot.crop.cropId].optPhMin}–
                      {CROP_CATALOG[selectedPlot.crop.cropId].optPhMax} · Moisture{' '}
                      {CROP_CATALOG[selectedPlot.crop.cropId].optMoistureMin}–
                      {CROP_CATALOG[selectedPlot.crop.cropId].optMoistureMax}%
                    </div>
                  )}
                  {selectedPlot.crop.stage === 4 && (
                    <div className="row-gap" style={{ marginTop: 4 }}>
                      <button
                        className="gold"
                        style={{ flex: 1 }}
                        onClick={() => applyResult(harvestPlot(state, selectedPlot.id, false), { x: 0.5, y: 0.4 })}
                      >
                        Harvest to Barn
                      </button>
                      <button
                        className="primary"
                        style={{ flex: 1 }}
                        onClick={() => applyResult(harvestPlot(state, selectedPlot.id, true), { x: 0.5, y: 0.4 })}
                      >
                        Harvest & Sell
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="muted" style={{ marginBottom: 8 }}>
                  Empty tilled plot — choose a seed below to plant!
                </div>
              )}

              {/* Per-Plot Soil Science Gauges */}
              <div className="gauge-grid">
                <div className="gauge-item">
                  <div className="gauge-label">
                    <span><Droplets size={11} /> Moisture</span>
                    <span>{selectedPlot.soil.moisture}%</span>
                  </div>
                  <div className="gauge-track">
                    <div className="gauge-fill" style={{ width: `${selectedPlot.soil.moisture}%`, background: '#38bdf8' }} />
                  </div>
                </div>
                <div className="gauge-item">
                  <div className="gauge-label">
                    <span>Soil pH</span>
                    <span>{selectedPlot.soil.ph.toFixed(1)}</span>
                  </div>
                  <div className="gauge-track">
                    <div
                      className="gauge-fill"
                      style={{ width: `${((selectedPlot.soil.ph - 4.5) / 4) * 100}%`, background: '#a78bfa' }}
                    />
                  </div>
                </div>
                <div className="gauge-item">
                  <div className="gauge-label">
                    <span>Nitrogen (N)</span>
                    <span>{selectedPlot.soil.n}</span>
                  </div>
                  <div className="gauge-track">
                    <div className="gauge-fill" style={{ width: `${selectedPlot.soil.n}%`, background: '#22c55e' }} />
                  </div>
                </div>
                <div className="gauge-item">
                  <div className="gauge-label">
                    <span>Phosphorus (P)</span>
                    <span>{selectedPlot.soil.p}</span>
                  </div>
                  <div className="gauge-track">
                    <div className="gauge-fill" style={{ width: `${selectedPlot.soil.p}%`, background: '#eab308' }} />
                  </div>
                </div>
                <div className="gauge-item">
                  <div className="gauge-label">
                    <span>Potassium (K)</span>
                    <span>{selectedPlot.soil.k}</span>
                  </div>
                  <div className="gauge-track">
                    <div className="gauge-fill" style={{ width: `${selectedPlot.soil.k}%`, background: '#f97316' }} />
                  </div>
                </div>
                <div className="gauge-item">
                  <div className="gauge-label">
                    <span>Organic / Weeds</span>
                    <span>{selectedPlot.soil.organicMatter}% / {selectedPlot.soil.weedPest}%</span>
                  </div>
                  <div className="gauge-track">
                    <div className="gauge-fill" style={{ width: `${selectedPlot.soil.organicMatter}%`, background: '#84cc16' }} />
                  </div>
                </div>
              </div>

              {/* Soil Actions */}
              <div className="action-grid">
                {ALL_SOIL_ACTIONS.map((action) => {
                  const info = SOIL_ACTION_LABELS[action];
                  const isFreeCompost = action === 'compost' && (state.organicManure > 0 || state.compostBags > 0);
                  const cost = isFreeCompost ? 0 : SOIL_ACTION_COSTS[action];
                  return (
                    <button
                      key={action}
                      title={info.description}
                      onClick={() => handleSoilAction(action)}
                    >
                      <span>{info.short}</span>
                      <span className="muted" style={{ fontSize: '0.7rem' }}>
                        {isFreeCompost
                          ? state.organicManure > 0
                            ? '(Free Manure)'
                            : '(Bag)'
                          : cost > 0
                            ? formatMoney(cost, state.currency)
                            : 'Free'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 12-Plant Seed Selector */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🌱 Plant Seeds & Saplings (12 Species)</h3>
              </div>
              <div className="seed-grid">
                {ALL_CROP_IDS.map((cropId) => {
                  const spec = CROP_CATALOG[cropId];
                  const price = getSeedPrice(state, cropId);
                  const active = selectedSeed === cropId;
                  return (
                    <button
                      key={cropId}
                      className={`seed-btn ${active ? 'selected' : ''}`}
                      onClick={() => setSelectedSeed(cropId)}
                    >
                      <div className="seed-top">
                        <strong style={{ color: spec.accentColor }}>{spec.name}</strong>
                        <span>{formatMoney(price, state.currency)}</span>
                      </div>
                      <div className="seed-meta">
                        pH {spec.optPhMin}–{spec.optPhMax} · {spec.daysToMature}d
                        {spec.isPerennial ? ' · Perennial' : ''}
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                className="primary"
                style={{ width: '100%', marginTop: 10 }}
                disabled={Boolean(selectedPlot.crop)}
                onClick={() => applyResult(plantCrop(state, selectedPlot.id, selectedSeed), { x: 0.48, y: 0.5 })}
              >
                <Sprout size={15} /> Plant {CROP_CATALOG[selectedSeed].name} on R{selectedPlot.row + 1}C{selectedPlot.col + 1} (
                {formatMoney(getSeedPrice(state, selectedSeed), state.currency)})
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'livestock' && (
        <LivestockView
          state={state}
          onBuyAnimal={(type: AnimalType, asMature: boolean) => applyResult(buyAnimal(state, type, asMature))}
          onFeedAnimal={(id: string, cropId?: CropId) => applyResult(feedAnimalAction(state, id, cropId))}
          onFeedAll={() => applyResult(feedAllAnimalsAction(state))}
          onPetAnimal={(id: string) => applyResult(petAnimalAction(state, id))}
          onCollectProduct={(id: string) => applyResult(collectAnimalProductAction(state, id))}
          onCollectAll={() => applyResult(collectAllAnimalProductsAction(state))}
          onSellAnimal={(id: string) => applyResult(sellAnimalAction(state, id))}
        />
      )}

      {tab === 'farmhouse' && (
        <FarmhouseView
          state={state}
          onUpgradeFarmhouse={() => applyResult(upgradeFarmhouseAction(state))}
          onBuyFurniture={(id: FurnitureId) => applyResult(buyFurnitureAction(state, id))}
          onPlaceFurniture={(id: FurnitureId, slot: number) => applyResult(placeFurnitureAction(state, id, slot))}
          onRemoveFurniture={(instanceId: string) => applyResult(removeFurnitureAction(state, instanceId))}
          onMoveFurniture={(instanceId: string, slot: number) => applyResult(moveFurnitureAction(state, instanceId, slot))}
        />
      )}

      {tab === 'npcs' && (
        <NpcsView
          state={state}
          focusedNpcId={focusedNpcId}
          onFocusNpc={setFocusedNpcId}
          onChatNpc={(id) => applyResult(chatNpcAction(state, id))}
          onGiftNpc={(id, itemId) => applyResult(giftNpcAction(state, id, itemId))}
          onClaimQuest={(qid) => applyResult(claimQuestAction(state, qid))}
          onAcceptContract={(cid) => applyResult(acceptContractAction(state, cid))}
          onDeliverContract={(cid) => applyResult(deliverContractAction(state, cid))}
          onEnterFestival={(itemId) => applyResult(enterHarvestFestivalAction(state, itemId))}
        />
      )}

      {tab === 'market' && (
        <MarketView
          state={state}
          onSellBarnItem={(id, qty) => applyResult(sellBarnItemAction(state, id, qty))}
          onTakeLoan={(amt) => applyResult(takeLoanAction(state, amt))}
          onRepayLoan={(amt) => applyResult(repayLoanAction(state, amt))}
        />
      )}

      {tab === 'shop' && (
        <ShopView
          state={state}
          onExpandLand={() => applyResult(buyLandExpansionAction(state))}
          onBuyTool={(tid: ToolId) => applyResult(buyToolAction(state, tid))}
          onBuySupplies={(s, q) => applyResult(buySuppliesAction(state, s, q))}
        />
      )}

      {tab === 'almanac' && <AlmanacView state={state} />}

      {/* Climate Selector / Reset Farm Modal */}
      {showResetModal && (
        <div className="modal-backdrop" onClick={() => setShowResetModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="row-between" style={{ marginBottom: 10 }}>
              <h2 style={{ margin: 0 }}>🌍 Start a New Farm & Choose Climate</h2>
              <button className="ghost" onClick={() => setShowResetModal(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <p className="muted" style={{ marginTop: 0 }}>
              Select your biome. Starting capital is $2,500 (฿87,500) with a 4×4 starter parcel and two starter chickens.
            </p>
            <div className="grid-2">
              {(['tropical_monsoon', 'temperate_4season'] as ClimateType[]).map((cid) => {
                const c = CLIMATE_SPECS[cid];
                return (
                  <div key={cid} className="sub-card">
                    <strong>{cid === 'tropical_monsoon' ? '🌴' : '🍂'} {c.name}</strong>
                    <span className="tag sky">{c.tempRange}</span>
                    <div className="muted" style={{ fontSize: '0.76rem' }}>{c.subtitle}</div>
                    <p className="muted" style={{ margin: 0, fontSize: '0.77rem' }}>{c.description}</p>
                    <div className="muted" style={{ fontSize: '0.73rem' }}>
                      Best crops: {c.recommendedCrops.join(', ')}
                    </div>
                    <button className="primary" onClick={() => handleResetFarm(cid)}>
                      Start in {c.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
