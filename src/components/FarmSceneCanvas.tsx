import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type {
  FloatingPopup,
  GameState,
  HeatmapMode,
  NpcId,
  Plot,
} from '../sim/types';
import { CROP_CATALOG, GROWTH_STAGE_NAMES } from '../sim/crops';
import { WEATHER_SPECS } from '../sim/weather';
import { ALL_NPC_IDS } from '../sim/npcs';
import {
  clampPan,
  clampZoom,
  createDefaultCamera,
  gridToIso,
  isInsideIsoDiamond,
  LOGICAL_H,
  LOGICAL_W,
  MAX_GRID_COLS,
  MAX_GRID_ROWS,
  screenToWorld,
  TILE_H,
  TILE_W,
  worldToGrid,
  type CameraState,
} from '../render/iso';
import { ParticleSystem } from '../render/particles';
import {
  drawBotanicalCrop,
  drawIsometricFarmhouse,
  drawLivestockAnimal,
  drawPastureProps,
  drawRowCoverTunnel,
  drawSoilPlotTile,
  drawVisitingNpcSprite,
  isHarshWeatherForLivestock,
} from '../render/sprites';
import {
  drawEstateGroundAndPaths,
  drawParallaxBackdrop,
  drawWeatherAtmosphere,
} from '../render/atmosphere';

export interface SceneEffectBurst {
  id: number;
  kind: 'dirt' | 'water' | 'harvest' | 'harvest_coins' | 'heart';
  plotIds?: number[];
  worldPos?: { x: number; y: number };
}

interface Props {
  state: GameState;
  selectedPlotId: number;
  heatmap: HeatmapMode;
  popups: FloatingPopup[];
  effectBurst: SceneEffectBurst | null;
  onSelectPlot: (plotId: number) => void;
  onClickNpc: (npcId: NpcId) => void;
  onClickPasture: () => void;
  onClickFarmhouse: () => void;
  onClickLockedLand: () => void;
}

const HOUSE_POS = { x: 148, y: 255 };
const PASTURE_BOUNDS = { x: 755, y: 210, w: 245, h: 275 };
const NPC_GATE_POS = { x: 118, y: 458 };

function getHeatmapOverlay(plot: Plot, mode: HeatmapMode): { bg: string; label: string } | null {
  if (mode === 'none') return null;
  if (mode === 'moisture') {
    const m = plot.soil.moisture;
    const hue = Math.round(25 + (m / 100) * 185);
    return { bg: `hsla(${hue}, 85%, 45%, 0.56)`, label: `${m}%` };
  }
  if (mode === 'ph') {
    const ph = plot.soil.ph;
    const ratio = (ph - 4.5) / 4.0;
    const hue = Math.round(15 + ratio * 230);
    return { bg: `hsla(${hue}, 82%, 48%, 0.56)`, label: ph.toFixed(1) };
  }
  if (mode === 'n') {
    const n = plot.soil.n;
    const hue = Math.round((n / 100) * 130);
    return { bg: `hsla(${hue}, 80%, 44%, 0.56)`, label: `N${n}` };
  }
  if (mode === 'k') {
    const k = plot.soil.k;
    const hue = Math.round((k / 100) * 130);
    return { bg: `hsla(${hue}, 80%, 44%, 0.56)`, label: `K${k}` };
  }
  if (mode === 'health') {
    if (!plot.crop) return { bg: 'rgba(100,116,139,0.22)', label: '—' };
    const h = plot.crop.health;
    const hue = Math.round((h / 100) * 125);
    return { bg: `hsla(${hue}, 85%, 45%, 0.58)`, label: `${h}%` };
  }
  return null;
}

function drawIsoDiamondPath(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const hw = TILE_W * 0.5 - 1;
  const hh = TILE_H * 0.5 - 1;
  ctx.beginPath();
  ctx.moveTo(x, y - hh);
  ctx.lineTo(x + hw, y);
  ctx.lineTo(x, y + hh);
  ctx.lineTo(x - hw, y);
  ctx.closePath();
}

export const FarmSceneCanvas: React.FC<Props> = ({
  state,
  selectedPlotId,
  heatmap,
  popups,
  effectBurst,
  onSelectPlot,
  onClickNpc,
  onClickPasture,
  onClickFarmhouse,
  onClickLockedLand,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef(state);
  const selectedRef = useRef(selectedPlotId);
  const heatmapRef = useRef(heatmap);
  const popupsRef = useRef(popups);

  const [camera, setCamera] = useState<CameraState>(() => createDefaultCamera());
  const cameraRef = useRef(camera);
  cameraRef.current = camera;

  const [hoveredPlot, setHoveredPlot] = useState<{ plot: Plot; sx: number; sy: number } | null>(null);
  const hoveredPlotIdRef = useRef<number | null>(null);

  const dragRef = useRef<{ active: boolean; moved: boolean; startX: number; startY: number; origPanX: number; origPanY: number }>({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    origPanX: 0,
    origPanY: 0,
  });

  const particlesRef = useRef<ParticleSystem>(new ParticleSystem());
  const lastBurstIdRef = useRef<number>(0);

  stateRef.current = state;
  selectedRef.current = selectedPlotId;
  heatmapRef.current = heatmap;
  popupsRef.current = popups;

  // Trigger game-juice particles when an effectBurst arrives
  useEffect(() => {
    if (!effectBurst || effectBurst.id === lastBurstIdRef.current) return;
    lastBurstIdRef.current = effectBurst.id;
    const ps = particlesRef.current;

    if (effectBurst.plotIds && effectBurst.plotIds.length > 0) {
      for (const pid of effectBurst.plotIds) {
        const plot = stateRef.current.plots.find((p) => p.id === pid);
        if (!plot) continue;
        const pos = gridToIso(plot.row, plot.col);
        if (effectBurst.kind === 'dirt') ps.spawnDirtPuff(pos.x, pos.y);
        else if (effectBurst.kind === 'water') ps.spawnWaterSplash(pos.x, pos.y);
        else if (effectBurst.kind === 'harvest') ps.spawnHarvestBurst(pos.x, pos.y, false);
        else if (effectBurst.kind === 'harvest_coins') ps.spawnHarvestBurst(pos.x, pos.y, true);
        else if (effectBurst.kind === 'heart') ps.spawnHeartBurst(pos.x, pos.y);
      }
    } else if (effectBurst.worldPos) {
      const { x, y } = effectBurst.worldPos;
      if (effectBurst.kind === 'heart') ps.spawnHeartBurst(x, y);
      else ps.spawnHarvestBurst(x, y, effectBurst.kind === 'harvest_coins');
    }
  }, [effectBurst]);

  // Main 60fps HiDPI render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(LOGICAL_W * dpr);
    canvas.height = Math.round(LOGICAL_H * dpr);

    let rafId = 0;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) * 0.001);
      lastTime = now;
      const t = now * 0.001;

      const s = stateRef.current;
      const cam = cameraRef.current;
      const weather = s.weatherToday.weather;
      const wind = WEATHER_SPECS[weather].windIntensity;
      const hasRainGuard = s.homestead.ownedTools.includes('latex_rain_guard');
      const isSnowy = weather === 'snow_blizzard';
      const isFrosty = weather === 'frost' || weather === 'snow_blizzard';

      particlesRef.current.update(dt);

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

      // 1. Parallax Sky & Distant Mountains (gentle pan response)
      drawParallaxBackdrop(ctx, s.climate, s.season, weather, t, cam.panX);

      // 2. World-space Camera Transform (Zoom + Pan)
      ctx.save();
      ctx.translate(LOGICAL_W * 0.5 + cam.panX, LOGICAL_H * 0.5 + cam.panY);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(-LOGICAL_W * 0.5, -LOGICAL_H * 0.5);

      // Estate meadow, footpaths, pasture fence & wildflowers
      drawEstateGroundAndPaths(ctx, s.season, weather, t);

      // Isometric 4-level Farmhouse (left-midground)
      drawIsometricFarmhouse(ctx, s, HOUSE_POS.x, HOUSE_POS.y, t);

      // Pasture Props (Coop/Barn shelter, hay bales, water trough)
      drawPastureProps(ctx, s, PASTURE_BOUNDS.x + 125, PASTURE_BOUNDS.y + 42);

      // Build quick lookup for unlocked plots
      const plotMap = new Map<string, Plot>();
      for (const p of s.plots) {
        plotMap.set(`${p.row}:${p.col}`, p);
      }

      // Draw Isometric Farm Grid in proper painter's order (row + col back-to-front)
      for (let sum = 0; sum <= MAX_GRID_ROWS + MAX_GRID_COLS - 2; sum++) {
        for (let r = 0; r < MAX_GRID_ROWS; r++) {
          const c = sum - r;
          if (c < 0 || c >= MAX_GRID_COLS) continue;

          const { x, y } = gridToIso(r, c);
          const plot = plotMap.get(`${r}:${c}`) ?? null;

          drawSoilPlotTile(ctx, x, y, plot, isSnowy, t);

          if (!plot) {
            if (r === 2 && c === s.homestead.gridCols) {
              ctx.fillStyle = 'rgba(254, 243, 199, 0.78)';
              ctx.font = '11px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('🔒', x, y);
            }
            continue;
          }

          // Heatmap diamond overlay
          const heat = getHeatmapOverlay(plot, heatmapRef.current);
          if (heat) {
            drawIsoDiamondPath(ctx, x, y);
            ctx.fillStyle = heat.bg;
            ctx.fill();
          }

          // Hover highlight rim
          if (hoveredPlotIdRef.current === plot.id) {
            drawIsoDiamondPath(ctx, x, y);
            ctx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Smooth pulsing selection ring
          if (selectedRef.current === plot.id) {
            const pulse = 0.7 + 0.3 * Math.sin(t * 5);
            drawIsoDiamondPath(ctx, x, y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${pulse})`;
            ctx.lineWidth = 2.8;
            ctx.stroke();
          }

          // Layered Botanical Crop / Tree
          drawBotanicalCrop(ctx, plot, x, y, t, wind, hasRainGuard, isFrosty);

          // Translucent arched hoop-house Row Cover tunnel
          if (plot.soil.rowCoverDays > 0) {
            drawRowCoverTunnel(ctx, x, y);
          }

          // Heatmap numeric label on top
          if (heat) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9.5px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(heat.label, x, y + 7);
          }
        }
      }

      // Expressive Animated Livestock wandering inside fenced pasture
      const weatherRisk = isHarshWeatherForLivestock(weather);
      s.animals.slice(0, 12).forEach((animal, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const bx = PASTURE_BOUNDS.x + 68 + col * 104;
        const by = PASTURE_BOUNDS.y + 92 + row * 34;
        const wanderX = Math.sin(t * (animal.type === 'chicken' ? 1.5 : 0.7) + idx * 1.9) * 22;
        const wanderY = Math.cos(t * 0.9 + idx * 1.3) * 6;
        drawLivestockAnimal(ctx, animal, bx + wanderX, by + wanderY, t, idx, weatherRisk);
      });

      // Pasture Label
      ctx.fillStyle = 'rgba(15, 23, 18, 0.72)';
      ctx.beginPath();
      ctx.roundRect(PASTURE_BOUNDS.x + 64, PASTURE_BOUNDS.y - 11, 118, 18, 9);
      ctx.fill();
      ctx.fillStyle = '#dcfce7';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Pasture (${s.animals.length})`, PASTURE_BOUNDS.x + 123, PASTURE_BOUNDS.y - 2);

      // Detailed Visiting NPCs at the Village Gate
      const visiting = ALL_NPC_IDS.filter((id) => s.npcs[id].visitingToday).slice(0, 3);
      visiting.forEach((id, idx) => {
        const npc = s.npcs[id];
        const hasQuest = s.quests.some((q) => q.npcId === id && !q.claimed);
        drawVisitingNpcSprite(
          ctx,
          id,
          npc.name,
          hasQuest,
          NPC_GATE_POS.x + idx * 54,
          NPC_GATE_POS.y + (idx % 2) * 14,
          t,
          idx,
        );
      });

      // World-space Game-Juice Particles
      particlesRef.current.draw(ctx);

      ctx.restore(); // end camera transform

      // 3. Screen-space Weather Shaders & Wildlife
      drawWeatherAtmosphere(ctx, weather, t);

      // 4. Floating Popups
      const nowMs = Date.now();
      for (const pop of popupsRef.current) {
        const age = (nowMs - pop.createdAt) / 1600;
        if (age >= 1) continue;
        const px = pop.x * LOGICAL_W;
        const py = pop.y * LOGICAL_H - age * 46;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - age);
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(5, 25, 16, 0.85)';
        ctx.fillText(pop.text, px + 1.2, py + 1.2);
        ctx.fillStyle = pop.color;
        ctx.fillText(pop.text, px, py);
        ctx.restore();
      }

      ctx.restore(); // end DPR scale
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const getLogicalCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      sx: ((e.clientX - rect.left) / rect.width) * LOGICAL_W,
      sy: ((e.clientY - rect.top) / rect.height) * LOGICAL_H,
      relX: e.clientX - rect.left,
      relY: e.clientY - rect.top,
    };
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    setCamera((prev) => {
      const nextZoom = clampZoom(prev.zoom + delta);
      const clamped = clampPan(prev.panX, prev.panY, nextZoom);
      return { zoom: nextZoom, ...clamped };
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      origPanX: camera.panX,
      origPanY: camera.panY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { sx, sy, relX, relY } = getLogicalCoords(e);

    if (dragRef.current.active) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.hypot(dx, dy) > 5) {
        dragRef.current.moved = true;
      }
      if (dragRef.current.moved) {
        const clamped = clampPan(
          dragRef.current.origPanX + dx,
          dragRef.current.origPanY + dy,
          cameraRef.current.zoom,
        );
        setCamera((prev) => ({ ...prev, ...clamped }));
        setHoveredPlot(null);
        hoveredPlotIdRef.current = null;
        return;
      }
    }

    const { wx, wy } = screenToWorld(sx, sy, cameraRef.current);
    const { row, col } = worldToGrid(wx, wy);
    if (
      row >= 0 &&
      row < MAX_GRID_ROWS &&
      col >= 0 &&
      col < MAX_GRID_COLS &&
      isInsideIsoDiamond(wx, wy, row, col)
    ) {
      const plot = state.plots.find((p) => p.row === row && p.col === col);
      if (plot) {
        hoveredPlotIdRef.current = plot.id;
        setHoveredPlot({ plot, sx: relX, sy: relY });
        return;
      }
    }
    hoveredPlotIdRef.current = null;
    setHoveredPlot(null);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const wasDrag = dragRef.current.moved;
    dragRef.current.active = false;
    dragRef.current.moved = false;
    if (wasDrag) return;

    const { sx, sy } = getLogicalCoords(e);
    const { wx, wy } = screenToWorld(sx, sy, cameraRef.current);

    // 1. Isometric Farm Grid hit test
    const { row, col } = worldToGrid(wx, wy);
    if (
      row >= 0 &&
      row < MAX_GRID_ROWS &&
      col >= 0 &&
      col < MAX_GRID_COLS &&
      isInsideIsoDiamond(wx, wy, row, col)
    ) {
      const plot = state.plots.find((p) => p.row === row && p.col === col);
      if (plot) {
        onSelectPlot(plot.id);
      } else {
        onClickLockedLand();
      }
      return;
    }

    // 2. Farmhouse hit test
    if (Math.abs(wx - HOUSE_POS.x) < 72 && wy >= HOUSE_POS.y - 105 && wy <= HOUSE_POS.y + 45) {
      onClickFarmhouse();
      return;
    }

    // 3. Visiting NPCs hit test
    const visiting = ALL_NPC_IDS.filter((id) => state.npcs[id].visitingToday).slice(0, 3);
    for (let i = 0; i < visiting.length; i++) {
      const nx = NPC_GATE_POS.x + i * 54;
      const ny = NPC_GATE_POS.y + (i % 2) * 14 - 18;
      if (Math.hypot(wx - nx, wy - ny) < 28) {
        onClickNpc(visiting[i]);
        return;
      }
    }

    // 4. Pasture hit test
    if (
      wx >= PASTURE_BOUNDS.x &&
      wx <= PASTURE_BOUNDS.x + PASTURE_BOUNDS.w &&
      wy >= PASTURE_BOUNDS.y &&
      wy <= PASTURE_BOUNDS.y + PASTURE_BOUNDS.h
    ) {
      onClickPasture();
    }
  };

  const adjustZoom = (delta: number) => {
    setCamera((prev) => {
      const nextZoom = clampZoom(prev.zoom + delta);
      const clamped = clampPan(prev.panX, prev.panY, nextZoom);
      return { zoom: nextZoom, ...clamped };
    });
  };

  return (
    <div className="canvas-wrap">
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          dragRef.current.active = false;
          setHoveredPlot(null);
          hoveredPlotIdRef.current = null;
        }}
        aria-label="TerraCraft Living Farm Scene"
      />

      {/* Interactive Camera Controls */}
      <div className="camera-controls">
        <button
          type="button"
          onClick={() => adjustZoom(0.2)}
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <span className="camera-zoom-label">{Math.round(camera.zoom * 100)}%</span>
        <button
          type="button"
          onClick={() => adjustZoom(-0.2)}
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          type="button"
          onClick={() => setCamera(createDefaultCamera())}
          title="Reset Camera View"
          aria-label="Reset Camera View"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Crisp Isometric Tile Hover Tooltip */}
      {hoveredPlot && (
        <div
          className="iso-tooltip"
          style={{
            left: Math.min(Math.max(12, hoveredPlot.sx + 14), 560),
            top: Math.max(12, hoveredPlot.sy - 68),
          }}
        >
          <div className="iso-tooltip-title">
            Plot R{hoveredPlot.plot.row + 1}C{hoveredPlot.plot.col + 1} ·{' '}
            {hoveredPlot.plot.crop
              ? CROP_CATALOG[hoveredPlot.plot.crop.cropId].name
              : 'Empty Soil'}
          </div>
          <div className="iso-tooltip-meta">
            {hoveredPlot.plot.crop
              ? `${GROWTH_STAGE_NAMES[hoveredPlot.plot.crop.stage]} (${Math.round(hoveredPlot.plot.crop.progress)}%) · Health ${hoveredPlot.plot.crop.health}%`
              : `pH ${hoveredPlot.plot.soil.ph.toFixed(1)} · N${hoveredPlot.plot.soil.n} P${hoveredPlot.plot.soil.p} K${hoveredPlot.plot.soil.k}`}
          </div>
          <div className="iso-tooltip-meta">
            💧 Moisture {hoveredPlot.plot.soil.moisture}% · pH {hoveredPlot.plot.soil.ph.toFixed(1)}
          </div>
        </div>
      )}
    </div>
  );
};
