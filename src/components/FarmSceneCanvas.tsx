import React, { useEffect, useRef } from 'react';
import type {
  FloatingPopup,
  GameState,
  HeatmapMode,
  NpcId,
  Plot,
  WeatherType,
} from '../sim/types';
import { CROP_CATALOG } from '../sim/crops';
import { WEATHER_SPECS } from '../sim/weather';
import { hasPlacedFurniture } from '../sim/homestead';
import { ALL_NPC_IDS } from '../sim/npcs';

interface Props {
  state: GameState;
  selectedPlotId: number;
  heatmap: HeatmapMode;
  popups: FloatingPopup[];
  splashPlotIds: number[];
  onSelectPlot: (plotId: number) => void;
  onClickNpc: (npcId: NpcId) => void;
  onClickPasture: () => void;
  onClickFarmhouse: () => void;
  onClickLockedLand: () => void;
}

const LOGICAL_W = 920;
const LOGICAL_H = 520;

const FARM_X = 205;
const FARM_Y = 128;
const FARM_W = 515;
const FARM_H = 368;
const MAX_COLS = 10;
const MAX_ROWS = 6;

const PASTURE_X = 734;
const PASTURE_Y = 128;
const PASTURE_W = 172;
const PASTURE_H = 368;

const HOUSE_RECT = { x: 16, y: 128, w: 174, h: 196 };

function getHeatmapColor(plot: Plot, mode: HeatmapMode): { bg: string; label: string } | null {
  if (mode === 'none') return null;
  if (mode === 'moisture') {
    const m = plot.soil.moisture;
    const hue = Math.round(25 + (m / 100) * 185);
    return { bg: `hsla(${hue}, 82%, 45%, 0.52)`, label: `${m}%` };
  }
  if (mode === 'ph') {
    const ph = plot.soil.ph;
    // Acidic red-orange -> neutral green -> alkaline blue-purple
    const ratio = (ph - 4.5) / 4.0;
    const hue = Math.round(15 + ratio * 230);
    return { bg: `hsla(${hue}, 80%, 48%, 0.52)`, label: ph.toFixed(1) };
  }
  if (mode === 'n') {
    const n = plot.soil.n;
    const hue = Math.round((n / 100) * 130);
    return { bg: `hsla(${hue}, 80%, 44%, 0.52)`, label: `N${n}` };
  }
  if (mode === 'k') {
    const k = plot.soil.k;
    const hue = Math.round((k / 100) * 130);
    return { bg: `hsla(${hue}, 80%, 44%, 0.52)`, label: `K${k}` };
  }
  if (mode === 'health') {
    if (!plot.crop) return { bg: 'rgba(100,116,139,0.22)', label: '—' };
    const h = plot.crop.health;
    const hue = Math.round((h / 100) * 125);
    return { bg: `hsla(${hue}, 85%, 45%, 0.56)`, label: `${h}%` };
  }
  return null;
}

function getSkyColors(weather: WeatherType, isWinter: boolean): [string, string] {
  switch (weather) {
    case 'clear':
      return isWinter ? ['#38bdf8', '#bae6fd'] : ['#0284c7', '#7dd3fc'];
    case 'partly_cloudy':
      return ['#0369a1', '#93c5fd'];
    case 'overcast_fog':
      return ['#475569', '#94a3b8'];
    case 'light_drizzle':
      return ['#334155', '#64748b'];
    case 'heavy_rain':
      return ['#1e293b', '#475569'];
    case 'thunderstorm':
      return ['#0f172a', '#334155'];
    case 'strong_wind':
      return ['#0f766e', '#99f6e4'];
    case 'heatwave':
      return ['#c2410c', '#fde047'];
    case 'hailstorm':
      return ['#1e293b', '#64748b'];
    case 'frost':
      return ['#1d4ed8', '#dbeafe'];
    case 'snow_blizzard':
      return ['#64748b', '#e2e8f0'];
    case 'rainbow':
      return ['#0284c7', '#a7f3d0'];
  }
}

export const FarmSceneCanvas: React.FC<Props> = ({
  state,
  selectedPlotId,
  heatmap,
  popups,
  splashPlotIds,
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
  const splashRef = useRef(splashPlotIds);

  stateRef.current = state;
  selectedRef.current = selectedPlotId;
  heatmapRef.current = heatmap;
  popupsRef.current = popups;
  splashRef.current = splashPlotIds;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;

    const drawCrop = (
      c: CanvasRenderingContext2D,
      plot: Plot,
      cx: number,
      cy: number,
      cellW: number,
      cellH: number,
      t: number,
      wind: number,
      hasRainGuard: boolean,
    ) => {
      const planted = plot.crop;
      if (!planted) return;
      const spec = CROP_CATALOG[planted.cropId];
      const sway = Math.sin(t * (2.2 + wind * 4) + plot.id * 0.9) * (1.8 + wind * 5.2);
      const stage = planted.stage;

      c.save();
      c.translate(cx, cy + cellH * 0.22);

      // Stage 0: Seeds / tiny sapling
      if (stage === 0) {
        c.fillStyle = '#d6b37c';
        for (let i = -1; i <= 1; i++) {
          c.beginPath();
          c.arc(i * 6, 0, 2.3, 0, Math.PI * 2);
          c.fill();
        }
        if (spec.isTree) {
          c.strokeStyle = '#65a30d';
          c.lineWidth = 2;
          c.beginPath();
          c.moveTo(0, 2);
          c.lineTo(sway * 0.3, -8);
          c.stroke();
        }
        c.restore();
        return;
      }

      // Stage 1: Sprout
      if (stage === 1) {
        c.strokeStyle = '#4ade80';
        c.lineWidth = 2.2;
        c.beginPath();
        c.moveTo(0, 2);
        c.quadraticCurveTo(sway * 0.4, -6, sway * 0.5, -11);
        c.stroke();
        c.fillStyle = '#22c55e';
        c.beginPath();
        c.ellipse(sway * 0.5 - 4, -10, 4, 2, -0.4, 0, Math.PI * 2);
        c.ellipse(sway * 0.5 + 4, -10, 4, 2, 0.4, 0, Math.PI * 2);
        c.fill();
        c.restore();
        return;
      }

      const scale = stage === 2 ? 0.72 : stage === 3 ? 0.9 : 1.05;

      // Custom rich procedural plants
      if (planted.cropId === 'rubber_tree') {
        // Trunk
        c.strokeStyle = '#785a40';
        c.lineWidth = 5 * scale;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(0, 4);
        c.quadraticCurveTo(sway * 0.2, -12 * scale, sway * 0.45, -24 * scale);
        c.stroke();

        // Tapping cut & latex cup on mature/maturing trees
        if (stage >= 3) {
          c.strokeStyle = '#fef3c7';
          c.lineWidth = 1.4;
          c.beginPath();
          c.moveTo(-2, -10 * scale);
          c.lineTo(2.5, -7 * scale);
          c.stroke();
          // White latex cup
          c.fillStyle = '#f8fafc';
          c.fillRect(1, -7 * scale, 4.5, 4.5);
          // Rain guard umbrella if owned
          if (hasRainGuard) {
            c.strokeStyle = '#38bdf8';
            c.lineWidth = 1.8;
            c.beginPath();
            c.arc(2.5, -10 * scale, 5.5, Math.PI, 0);
            c.stroke();
          }
        }

        // Lush canopy
        c.fillStyle = '#15803d';
        c.beginPath();
        c.arc(sway * 0.5, -26 * scale, 12 * scale, 0, Math.PI * 2);
        c.arc(sway * 0.5 - 8 * scale, -22 * scale, 8.5 * scale, 0, Math.PI * 2);
        c.arc(sway * 0.5 + 8 * scale, -22 * scale, 8.5 * scale, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#22c55e';
        c.beginPath();
        c.arc(sway * 0.5 - 2, -29 * scale, 7 * scale, 0, Math.PI * 2);
        c.fill();
      } else if (planted.cropId === 'oil_palm') {
        // Thick textured palm trunk
        c.strokeStyle = '#854d0e';
        c.lineWidth = 6 * scale;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(0, 4);
        c.quadraticCurveTo(sway * 0.15, -10 * scale, sway * 0.4, -22 * scale);
        c.stroke();

        // Arching fronds
        const topX = sway * 0.4;
        const topY = -22 * scale;
        const frondAngles = [-2.5, -1.9, -1.2, -0.5, 0.2, 0.8];
        c.strokeStyle = '#16a34a';
        c.lineWidth = 2.4 * scale;
        for (const a of frondAngles) {
          c.beginPath();
          c.moveTo(topX, topY);
          const ex = topX + Math.cos(a) * 16 * scale;
          const ey = topY + Math.sin(a) * 12 * scale + 5;
          c.quadraticCurveTo(topX + Math.cos(a) * 9 * scale, topY - 6 * scale, ex, ey);
          c.stroke();
        }
        // Bright orange-red Fresh Fruit Bunches (FFB)
        if (stage >= 3) {
          c.fillStyle = stage === 4 ? '#f97316' : '#ea580c';
          c.beginPath();
          c.arc(topX - 4, topY + 3, 4.2 * scale, 0, Math.PI * 2);
          c.arc(topX + 4, topY + 3, 4.2 * scale, 0, Math.PI * 2);
          c.fill();
        }
      } else if (planted.cropId === 'paddy_rice' || planted.cropId === 'winter_wheat') {
        const isRice = planted.cropId === 'paddy_rice';
        const stalkColor =
          stage === 4 ? (isRice ? '#eab308' : '#f59e0b') : isRice ? '#84cc16' : '#65a30d';
        c.strokeStyle = stalkColor;
        c.lineWidth = 1.8;
        for (let i = -2; i <= 2; i++) {
          c.beginPath();
          c.moveTo(i * 5, 3);
          c.quadraticCurveTo(i * 5 + sway * 0.4, -10 * scale, i * 5 + sway * 0.8, -19 * scale);
          c.stroke();
          if (stage >= 3) {
            c.fillStyle = isRice ? '#fde047' : '#fbbf24';
            c.beginPath();
            c.ellipse(i * 5 + sway * 0.85, -19 * scale, 2.2, 4.5, 0.25, 0, Math.PI * 2);
            c.fill();
          }
        }
      } else if (planted.cropId === 'sunflower') {
        c.strokeStyle = '#16a34a';
        c.lineWidth = 2.6;
        c.beginPath();
        c.moveTo(0, 4);
        c.quadraticCurveTo(sway * 0.3, -10 * scale, sway * 0.7, -23 * scale);
        c.stroke();
        if (stage >= 3) {
          c.fillStyle = '#facc15';
          c.beginPath();
          c.arc(sway * 0.7, -24 * scale, 8 * scale, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = '#713f12';
          c.beginPath();
          c.arc(sway * 0.7, -24 * scale, 4.2 * scale, 0, Math.PI * 2);
          c.fill();
        }
      } else if (planted.cropId === 'sweet_corn') {
        c.strokeStyle = '#22c55e';
        c.lineWidth = 2.6;
        for (const ox of [-6, 6]) {
          c.beginPath();
          c.moveTo(ox, 4);
          c.quadraticCurveTo(ox + sway * 0.3, -12 * scale, ox + sway * 0.65, -24 * scale);
          c.stroke();
          if (stage >= 3) {
            c.fillStyle = '#facc15';
            c.beginPath();
            c.ellipse(ox + sway * 0.4 + 2.5, -13 * scale, 2.6, 5.2, 0.2, 0, Math.PI * 2);
            c.fill();
          }
        }
      } else {
        // Bush / vegetable crops (Tomato, Soybean, Spinach, Strawberry, Blueberry, Potato)
        c.fillStyle = planted.dormant ? '#64748b' : '#16a34a';
        c.beginPath();
        c.arc(sway * 0.3, -9 * scale, 10 * scale, 0, Math.PI * 2);
        c.arc(sway * 0.3 - 7 * scale, -6 * scale, 7 * scale, 0, Math.PI * 2);
        c.arc(sway * 0.3 + 7 * scale, -6 * scale, 7 * scale, 0, Math.PI * 2);
        c.fill();

        if (stage >= 3) {
          c.fillStyle = spec.accentColor;
          const dots = [
            [-5, -10],
            [4, -12],
            [0, -5],
            [6, -6],
          ];
          for (const [dx, dy] of dots) {
            c.beginPath();
            c.arc(sway * 0.3 + dx * scale, dy * scale, 2.8 * scale, 0, Math.PI * 2);
            c.fill();
          }
        }
      }

      // Ready-to-harvest golden sparkle indicator
      if (stage === 4) {
        const pulse = 0.7 + 0.3 * Math.sin(t * 5 + plot.id);
        c.fillStyle = `rgba(250, 204, 21, ${pulse})`;
        c.beginPath();
        c.arc(cellW * 0.28, -cellH * 0.45, 5.5, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#422006';
        c.font = 'bold 9px sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('★', cellW * 0.28, -cellH * 0.45 + 0.5);
      }

      c.restore();
    };

    const drawFarmhouse = (
      c: CanvasRenderingContext2D,
      s: GameState,
      t: number,
    ) => {
      const lv = s.homestead.farmhouseLevel;
      const { x, y, w, h } = HOUSE_RECT;

      // Ground lawn under homestead
      c.fillStyle = s.weatherToday.weather === 'snow_blizzard' ? '#cbd5e1' : '#1f4d2e';
      c.beginPath();
      c.roundRect(x, y, w, h, 12);
      c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.12)';
      c.stroke();

      const baseX = x + 22;
      const baseY = y + 132;
      const houseW = lv === 1 ? 92 : lv === 2 ? 112 : lv === 3 ? 118 : 112;
      const houseH = lv >= 3 ? 68 : 48;

      // Chimney smoke
      c.fillStyle = 'rgba(226, 232, 240, 0.45)';
      for (let i = 0; i < 3; i++) {
        const rise = ((t * 18 + i * 16) % 44);
        c.beginPath();
        c.arc(baseX + houseW - 18 + Math.sin(t + i) * 4, baseY - houseH - 18 - rise, 4 + rise * 0.08, 0, Math.PI * 2);
        c.fill();
      }

      // Main walls
      c.fillStyle = lv === 1 ? '#b47b4e' : lv === 2 ? '#d6bfa2' : lv === 3 ? '#fef3c7' : '#f8fafc';
      c.fillRect(baseX, baseY - houseH, houseW, houseH);

      // Greenhouse Wing for Level 4!
      if (lv === 4) {
        c.fillStyle = 'rgba(125, 211, 252, 0.35)';
        c.strokeStyle = '#e0f2fe';
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(baseX + houseW, baseY);
        c.lineTo(baseX + houseW, baseY - 34);
        c.lineTo(baseX + houseW + 28, baseY - 24);
        c.lineTo(baseX + houseW + 28, baseY);
        c.closePath();
        c.fill();
        c.stroke();
      }

      // Roof
      c.fillStyle = lv === 1 ? '#7c2d12' : lv === 2 ? '#9a3412' : lv === 3 ? '#b91c1c' : '#0f766e';
      c.beginPath();
      c.moveTo(baseX - 10, baseY - houseH + 2);
      c.lineTo(baseX + houseW / 2, baseY - houseH - (lv >= 3 ? 34 : 26));
      c.lineTo(baseX + houseW + 10, baseY - houseH + 2);
      c.closePath();
      c.fill();

      // Solar Roof Panels if placed
      if (hasPlacedFurniture(s.homestead, 'solar_panels')) {
        c.fillStyle = '#1d4ed8';
        c.strokeStyle = '#93c5fd';
        c.lineWidth = 1;
        c.fillRect(baseX + 20, baseY - houseH - 16, 30, 11);
        c.strokeRect(baseX + 20, baseY - houseH - 16, 30, 11);
      }

      // Door & Glowing Windows
      c.fillStyle = '#78350f';
      c.fillRect(baseX + 14, baseY - 26, 18, 26);
      c.fillStyle = '#fde047';
      c.fillRect(baseX + 44, baseY - 26, 18, 14);
      if (lv >= 2) {
        c.fillRect(baseX + 74, baseY - 26, 18, 14);
      }
      if (lv >= 3) {
        c.fillRect(baseX + 22, baseY - 54, 18, 14);
        c.fillRect(baseX + 64, baseY - 54, 18, 14);
      }

      // Garden Lanterns if placed
      if (hasPlacedFurniture(s.homestead, 'garden_lanterns')) {
        const glow = 0.55 + 0.3 * Math.sin(t * 4);
        c.fillStyle = `rgba(251, 191, 36, ${glow})`;
        c.beginPath();
        c.arc(baseX + 6, baseY + 12, 7, 0, Math.PI * 2);
        c.arc(baseX + houseW - 6, baseY + 12, 7, 0, Math.PI * 2);
        c.fill();
      }

      // Koi Pond if placed
      if (hasPlacedFurniture(s.homestead, 'koi_pond')) {
        const px = x + 124;
        const py = y + 166;
        c.fillStyle = '#0ea5e9';
        c.beginPath();
        c.ellipse(px, py, 26, 14, 0, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = '#94a3b8';
        c.lineWidth = 2;
        c.stroke();
        // Swimming koi
        c.fillStyle = '#f97316';
        c.beginPath();
        c.arc(px + Math.cos(t * 1.6) * 12, py + Math.sin(t * 1.6) * 5, 3, 0, Math.PI * 2);
        c.fill();
      }

      // Label
      c.fillStyle = '#ecfdf5';
      c.font = 'bold 11px sans-serif';
      c.textAlign = 'left';
      c.fillText(`Farmhouse Lv.${lv}`, x + 10, y + 18);
      c.fillStyle = '#a7f3d0';
      c.font = '10px sans-serif';
      c.fillText('Click to decorate', x + 10, y + 32);
    };

    const drawVisitingNpcs = (c: CanvasRenderingContext2D, s: GameState, t: number) => {
      const visiting = ALL_NPC_IDS.filter((id) => s.npcs[id].visitingToday).slice(0, 3);
      c.fillStyle = 'rgba(20, 38, 29, 0.9)';
      c.beginPath();
      c.roundRect(16, 336, 174, 160, 12);
      c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.12)';
      c.stroke();

      c.fillStyle = '#fde68a';
      c.font = 'bold 11px sans-serif';
      c.textAlign = 'left';
      c.fillText('Farm Gate Visitors', 26, 354);

      const colors: Record<NpcId, string> = {
        dr_mali: '#10b981',
        uncle_somchai: '#f59e0b',
        nadia: '#ec4899',
        master_ken: '#3b82f6',
        auntie_lin: '#f43f5e',
      };

      visiting.forEach((id, idx) => {
        const npc = s.npcs[id];
        const nx = 46 + idx * 54;
        const ny = 420;
        const bob = Math.sin(t * 3 + idx * 1.5) * 2.5;

        // Body
        c.fillStyle = colors[id];
        c.beginPath();
        c.roundRect(nx - 11, ny + bob, 22, 24, 6);
        c.fill();
        // Head
        c.fillStyle = '#e6b89c';
        c.beginPath();
        c.arc(nx, ny - 8 + bob, 10, 0, Math.PI * 2);
        c.fill();

        // Quest ! or Chat bubble
        const hasQuest = s.quests.some((q) => q.npcId === id && !q.claimed);
        c.fillStyle = hasQuest ? '#facc15' : '#e0f2fe';
        c.beginPath();
        c.arc(nx + 10, ny - 22 + bob, 9, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#0f172a';
        c.font = 'bold 11px sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(hasQuest ? '!' : '💬', nx + 10, ny - 21 + bob);

        // Short name
        c.fillStyle = '#edf5f0';
        c.font = '10px sans-serif';
        c.fillText(npc.name.split(' ').pop() ?? npc.name, nx, ny + 38);
      });
    };

    const drawPasture = (c: CanvasRenderingContext2D, s: GameState, t: number) => {
      const snowy = s.weatherToday.weather === 'snow_blizzard';
      c.fillStyle = snowy ? '#cbd5e1' : '#22543d';
      c.beginPath();
      c.roundRect(PASTURE_X, PASTURE_Y, PASTURE_W, PASTURE_H, 12);
      c.fill();

      // Wooden pasture fence border
      c.strokeStyle = '#92400e';
      c.lineWidth = 3;
      c.stroke();

      c.fillStyle = '#ecfdf5';
      c.font = 'bold 11px sans-serif';
      c.textAlign = 'left';
      c.fillText(`Livestock (${s.animals.length})`, PASTURE_X + 10, PASTURE_Y + 18);
      c.fillStyle = '#bbf7d0';
      c.font = '10px sans-serif';
      c.fillText('Click to tend animals', PASTURE_X + 10, PASTURE_Y + 32);

      // Draw up to 12 animated animals inside the pasture
      s.animals.slice(0, 12).forEach((animal, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const baseX = PASTURE_X + 46 + col * 78;
        const baseY = PASTURE_Y + 72 + row * 50;
        const wanderX = Math.sin(t * (animal.type === 'chicken' ? 1.8 : 0.9) + idx * 2.1) * 14;
        const hopY = Math.abs(Math.sin(t * (animal.type === 'chicken' ? 4.2 : 2.1) + idx)) * -3.5;
        const ax = baseX + wanderX;
        const ay = baseY + hopY;
        const scale = animal.stage === 'young' ? 0.72 : animal.stage === 'growing' ? 0.88 : 1.05;

        c.save();
        c.translate(ax, ay);
        if (animal.type === 'chicken') {
          c.fillStyle = '#fef3c7';
          c.beginPath();
          c.ellipse(0, 0, 9 * scale, 7 * scale, 0, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = '#ef4444';
          c.beginPath();
          c.arc(6 * scale, -6 * scale, 2.5 * scale, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = '#f59e0b';
          c.beginPath();
          c.moveTo(9 * scale, -2 * scale);
          c.lineTo(13 * scale, 0);
          c.lineTo(9 * scale, 2 * scale);
          c.fill();
        } else if (animal.type === 'cow') {
          c.fillStyle = '#f8fafc';
          c.beginPath();
          c.roundRect(-15 * scale, -9 * scale, 30 * scale, 18 * scale, 6);
          c.fill();
          // Dairy spots
          c.fillStyle = '#1e293b';
          c.beginPath();
          c.arc(-5 * scale, -2 * scale, 4.5 * scale, 0, Math.PI * 2);
          c.arc(6 * scale, 2 * scale, 3.8 * scale, 0, Math.PI * 2);
          c.fill();
          // Head
          c.fillStyle = '#f8fafc';
          c.beginPath();
          c.arc(16 * scale, -4 * scale, 6.5 * scale, 0, Math.PI * 2);
          c.fill();
        } else {
          // Pig
          c.fillStyle = '#fda4af';
          c.beginPath();
          c.ellipse(0, 0, 13 * scale, 9 * scale, 0, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = '#fb7185';
          c.beginPath();
          c.arc(12 * scale, 0, 4.5 * scale, 0, Math.PI * 2);
          c.fill();
        }

        // Produce ready badge
        if (animal.produceReady > 0 || animal.truffleReady) {
          c.fillStyle = '#facc15';
          c.beginPath();
          c.arc(-10, -14, 7.5, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = '#422006';
          c.font = 'bold 9px sans-serif';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(animal.type === 'chicken' ? '🥚' : animal.type === 'cow' ? '🥛' : '🍄', -10, -13.5);
        }

        // Shelter shield or stress warning in harsh weather
        if (WEATHER_SPECS[s.weatherToday.weather].animalStressRisk > 0) {
          c.fillStyle = animal.sheltered ? '#38bdf8' : '#ef4444';
          c.beginPath();
          c.arc(14, -14, 6.5, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = '#fff';
          c.font = 'bold 9px sans-serif';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(animal.sheltered ? '⌂' : '!', 14, -13.5);
        }
        c.restore();
      });
    };

    const drawWeatherOverlay = (
      c: CanvasRenderingContext2D,
      weather: WeatherType,
      t: number,
    ) => {
      if (weather === 'clear') {
        // Warm rotating sunbeams
        c.save();
        const grad = c.createRadialGradient(80, 34, 8, 80, 34, 150);
        grad.addColorStop(0, 'rgba(254, 240, 138, 0.75)');
        grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        c.fillStyle = grad;
        c.fillRect(0, 0, 260, 200);
        c.restore();
      }

      if (weather === 'rainbow') {
        const colors = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6'];
        c.save();
        c.globalAlpha = 0.42;
        colors.forEach((col, i) => {
          c.strokeStyle = col;
          c.lineWidth = 5;
          c.beginPath();
          c.arc(LOGICAL_W * 0.55, 220, 200 - i * 6, Math.PI, 0);
          c.stroke();
        });
        c.restore();
      }

      if (weather === 'overcast_fog') {
        c.save();
        for (let i = 0; i < 4; i++) {
          const fx = ((t * 14 + i * 260) % (LOGICAL_W + 240)) - 120;
          const grad = c.createRadialGradient(fx, 180 + i * 75, 20, fx, 180 + i * 75, 190);
          grad.addColorStop(0, 'rgba(226, 232, 240, 0.22)');
          grad.addColorStop(1, 'rgba(226, 232, 240, 0)');
          c.fillStyle = grad;
          c.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
        }
        c.restore();
      }

      if (weather === 'light_drizzle' || weather === 'heavy_rain' || weather === 'thunderstorm') {
        const count = weather === 'light_drizzle' ? 65 : 170;
        const slant = weather === 'light_drizzle' ? 4 : 11;
        const speed = weather === 'light_drizzle' ? 240 : 480;
        c.strokeStyle = weather === 'light_drizzle' ? 'rgba(186, 230, 253, 0.45)' : 'rgba(125, 211, 252, 0.55)';
        c.lineWidth = weather === 'light_drizzle' ? 1 : 1.5;
        c.beginPath();
        for (let i = 0; i < count; i++) {
          const rx = ((i * 73 + t * slant * 25) % LOGICAL_W);
          const ry = ((i * 59 + t * speed) % LOGICAL_H);
          c.moveTo(rx, ry);
          c.lineTo(rx - slant, ry + 14);
        }
        c.stroke();

        // Occasional lightning flash during thunderstorm
        if (weather === 'thunderstorm' && Math.sin(t * 2.7) > 0.96) {
          c.fillStyle = 'rgba(255, 255, 255, 0.28)';
          c.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
        }
      }

      if (weather === 'hailstorm') {
        c.fillStyle = 'rgba(224, 242, 254, 0.85)';
        for (let i = 0; i < 85; i++) {
          const hx = ((i * 67 + t * 90) % LOGICAL_W);
          const hy = ((i * 43 + t * 420) % LOGICAL_H);
          c.beginPath();
          c.arc(hx, hy, 2.6, 0, Math.PI * 2);
          c.fill();
        }
      }

      if (weather === 'strong_wind') {
        c.fillStyle = 'rgba(134, 239, 172, 0.75)';
        for (let i = 0; i < 24; i++) {
          const lx = ((i * 97 + t * 240) % LOGICAL_W);
          const ly = ((i * 41 + Math.sin(t * 3 + i) * 35) % LOGICAL_H);
          c.beginPath();
          c.ellipse(lx, ly, 4.5, 2, t * 4 + i, 0, Math.PI * 2);
          c.fill();
        }
      }

      if (weather === 'heatwave') {
        c.fillStyle = 'rgba(251, 146, 60, 0.14)';
        c.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
      }

      if (weather === 'frost') {
        c.strokeStyle = 'rgba(186, 230, 253, 0.5)';
        c.lineWidth = 3;
        c.strokeRect(4, 4, LOGICAL_W - 8, LOGICAL_H - 8);
      }

      if (weather === 'snow_blizzard') {
        c.fillStyle = 'rgba(248, 250, 252, 0.85)';
        for (let i = 0; i < 110; i++) {
          const sx = ((i * 83 + Math.sin(t + i) * 28 + t * 45) % LOGICAL_W);
          const sy = ((i * 53 + t * 95) % LOGICAL_H);
          c.beginPath();
          c.arc(sx, sy, 2.2 + (i % 2), 0, Math.PI * 2);
          c.fill();
        }
      }

      // Cheerful fluttering butterflies in sunny/rainbow weather
      if (weather === 'clear' || weather === 'partly_cloudy' || weather === 'rainbow') {
        for (let i = 0; i < 4; i++) {
          const bx = 220 + ((i * 155 + t * 26) % 480);
          const by = 150 + i * 75 + Math.sin(t * 4 + i * 2) * 14;
          const wing = 3 + Math.abs(Math.sin(t * 14 + i)) * 3;
          c.fillStyle = i % 2 === 0 ? '#fde047' : '#f472b6';
          c.beginPath();
          c.ellipse(bx - 2, by, wing, 2.5, -0.3, 0, Math.PI * 2);
          c.ellipse(bx + 2, by, wing, 2.5, 0.3, 0, Math.PI * 2);
          c.fill();
        }
      }
    };

    const render = (now: number) => {
      const t = now * 0.001;
      const s = stateRef.current;
      const weather = s.weatherToday.weather;
      const wind = WEATHER_SPECS[weather].windIntensity;
      const hasRainGuard = s.homestead.ownedTools.includes('latex_rain_guard');

      ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

      // 1. Sky backdrop
      const [skyTop, skyBot] = getSkyColors(weather, s.season === 'winter');
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 125);
      skyGrad.addColorStop(0, skyTop);
      skyGrad.addColorStop(1, skyBot);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, LOGICAL_W, 125);

      // Drifting clouds
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      for (let i = 0; i < 5; i++) {
        const cx = ((i * 210 + t * (10 + wind * 26)) % (LOGICAL_W + 120)) - 60;
        const cy = 28 + (i % 3) * 18;
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.arc(cx + 18, cy - 4, 22, 0, Math.PI * 2);
        ctx.arc(cx + 38, cy, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      // Distant hills
      ctx.fillStyle = s.season === 'winter' ? '#94a3b8' : s.climate === 'tropical_monsoon' ? '#14532d' : '#1e4620';
      ctx.beginPath();
      ctx.moveTo(0, 125);
      ctx.quadraticCurveTo(180, 74, 380, 112);
      ctx.quadraticCurveTo(600, 68, 920, 115);
      ctx.lineTo(920, 125);
      ctx.closePath();
      ctx.fill();

      // Main valley ground
      ctx.fillStyle = weather === 'snow_blizzard' ? '#94a3b8' : '#132a1d';
      ctx.fillRect(0, 116, LOGICAL_W, LOGICAL_H - 116);

      // 2. Farmhouse & Visiting NPCs
      drawFarmhouse(ctx, s, t);
      drawVisitingNpcs(ctx, s, t);

      // 3. Interactive Farm Grid (10x6 total canvas showing unlocked vs locked parcels)
      const cellW = FARM_W / MAX_COLS;
      const cellH = FARM_H / MAX_ROWS;

      const plotLookup = new Map<string, Plot>();
      for (const p of s.plots) {
        plotLookup.set(`${p.row}:${p.col}`, p);
      }

      for (let r = 0; r < MAX_ROWS; r++) {
        for (let c = 0; c < MAX_COLS; c++) {
          const px = FARM_X + c * cellW + 2;
          const py = FARM_Y + r * cellH + 2;
          const pw = cellW - 4;
          const ph = cellH - 4;
          const plot = plotLookup.get(`${r}:${c}`);

          if (!plot) {
            // Locked expansion parcel
            ctx.fillStyle = 'rgba(20, 44, 31, 0.55)';
            ctx.beginPath();
            ctx.roundRect(px, py, pw, ph, 6);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.lineWidth = 1;
            ctx.stroke();
            if (r === 2 && c === s.homestead.gridCols) {
              ctx.fillStyle = 'rgba(253, 230, 138, 0.55)';
              ctx.font = '10px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('🔒', px + pw / 2, py + ph / 2 + 3);
            }
            continue;
          }

          // Soil color by moisture
          const m = plot.soil.moisture;
          const isFloodedRice = plot.crop?.cropId === 'paddy_rice' && m >= 68;
          if (isFloodedRice) {
            ctx.fillStyle = '#2c6e7a';
          } else {
            const lightness = Math.round(35 - (m / 100) * 16);
            ctx.fillStyle = `hsl(28, 36%, ${lightness}%)`;
          }
          ctx.beginPath();
          ctx.roundRect(px, py, pw, ph, 6);
          ctx.fill();

          // Mulch straw flecks
          if (plot.soil.mulchedDays > 0) {
            ctx.strokeStyle = 'rgba(217, 179, 108, 0.45)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(px + 6, py + ph - 8);
            ctx.lineTo(px + 18, py + ph - 10);
            ctx.moveTo(px + pw - 18, py + ph - 6);
            ctx.lineTo(px + pw - 6, py + ph - 9);
            ctx.stroke();
          }

          // Crop drawing
          drawCrop(ctx, plot, px + pw / 2, py + ph / 2, pw, ph, t, wind, hasRainGuard);

          // Row Cover translucent dome
          if (plot.soil.rowCoverDays > 0) {
            ctx.fillStyle = 'rgba(224, 242, 254, 0.22)';
            ctx.strokeStyle = 'rgba(186, 230, 253, 0.7)';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.roundRect(px + 2, py + 2, pw - 4, ph - 4, 8);
            ctx.fill();
            ctx.stroke();
          }

          // Heatmap overlay
          const heat = getHeatmapColor(plot, heatmapRef.current);
          if (heat) {
            ctx.fillStyle = heat.bg;
            ctx.beginPath();
            ctx.roundRect(px, py, pw, ph, 6);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(heat.label, px + pw / 2, py + ph - 10);
          }

          // Watering splash ring
          if (splashRef.current.includes(plot.id)) {
            const rad = 6 + ((t * 40) % 16);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px + pw / 2, py + ph / 2, rad, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Selected plot highlight
          if (plot.id === selectedRef.current) {
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.roundRect(px, py, pw, ph, 6);
            ctx.stroke();
          }
        }
      }

      // 4. Livestock Pasture
      drawPasture(ctx, s, t);

      // 5. Weather particles & atmosphere
      drawWeatherOverlay(ctx, weather, t);

      // 6. Floating Popups
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
        ctx.fillStyle = '#052e16';
        ctx.fillText(pop.text, px + 1, py + 1);
        ctx.fillStyle = pop.color;
        ctx.fillText(pop.text, px, py);
        ctx.restore();
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * LOGICAL_W;
    const y = ((e.clientY - rect.top) / rect.height) * LOGICAL_H;

    // 1. Check Farmhouse click
    if (
      x >= HOUSE_RECT.x &&
      x <= HOUSE_RECT.x + HOUSE_RECT.w &&
      y >= HOUSE_RECT.y &&
      y <= HOUSE_RECT.y + HOUSE_RECT.h
    ) {
      onClickFarmhouse();
      return;
    }

    // 2. Check Visiting NPCs click
    if (x >= 16 && x <= 190 && y >= 336 && y <= 496) {
      const visiting = ALL_NPC_IDS.filter((id) => state.npcs[id].visitingToday).slice(0, 3);
      if (visiting.length > 0) {
        const idx = Math.min(visiting.length - 1, Math.max(0, Math.floor((x - 18) / 56)));
        onClickNpc(visiting[idx]);
      }
      return;
    }

    // 3. Check Pasture click
    if (
      x >= PASTURE_X &&
      x <= PASTURE_X + PASTURE_W &&
      y >= PASTURE_Y &&
      y <= PASTURE_Y + PASTURE_H
    ) {
      onClickPasture();
      return;
    }

    // 4. Check Farm Grid click
    if (x >= FARM_X && x <= FARM_X + FARM_W && y >= FARM_Y && y <= FARM_Y + FARM_H) {
      const col = Math.floor(((x - FARM_X) / FARM_W) * MAX_COLS);
      const row = Math.floor(((y - FARM_Y) / FARM_H) * MAX_ROWS);
      const plot = state.plots.find((p) => p.row === row && p.col === col);
      if (plot) {
        onSelectPlot(plot.id);
      } else {
        onClickLockedLand();
      }
    }
  };

  return (
    <div className="canvas-wrap">
      <canvas
        ref={canvasRef}
        width={LOGICAL_W}
        height={LOGICAL_H}
        onClick={handleClick}
        aria-label="TerraCraft Living Farm Scene"
      />
    </div>
  );
};
