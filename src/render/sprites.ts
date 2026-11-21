import type {
  Animal,
  GameState,
  NpcId,
  Plot,
} from '../sim/types';
import { hasPlacedFurniture } from '../sim/homestead';
import { WEATHER_SPECS } from '../sim/weather';
import { TILE_DEPTH, TILE_H, TILE_W } from './iso';

type SoilTileKey = 'dry' | 'moist' | 'wet' | 'paddy' | 'mulched' | 'locked' | 'snow_locked';

const tileCache = new Map<SoilTileKey, HTMLCanvasElement>();

function createCachedSoilTile(key: SoilTileKey): HTMLCanvasElement {
  const pad = 6;
  const w = TILE_W + pad * 2;
  const h = TILE_H + TILE_DEPTH + pad * 2;
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const c = off.getContext('2d');
  if (!c) return off;

  const cx = w * 0.5;
  const cy = pad + TILE_H * 0.5;
  const hw = TILE_W * 0.5 - 1.5;
  const hh = TILE_H * 0.5 - 1;
  const d = key === 'locked' || key === 'snow_locked' ? 5 : TILE_DEPTH;

  const palette: Record<
    SoilTileKey,
    { topA: string; topB: string; left: string; right: string; furrow: string; rim: string }
  > = {
    dry: {
      topA: '#b98b5c',
      topB: '#9e7144',
      left: '#7d5632',
      right: '#5e3e22',
      furrow: 'rgba(82, 50, 24, 0.28)',
      rim: '#cfa578',
    },
    moist: {
      topA: '#855834',
      topB: '#6d4526',
      left: '#57351c',
      right: '#3f2512',
      furrow: 'rgba(46, 26, 12, 0.34)',
      rim: '#9c6c45',
    },
    wet: {
      topA: '#5b3920',
      topB: '#462b17',
      left: '#3a2211',
      right: '#29170b',
      furrow: 'rgba(26, 14, 6, 0.4)',
      rim: '#734b2c',
    },
    paddy: {
      topA: '#3b8da1',
      topB: '#286c7e',
      left: '#573d26',
      right: '#3d2a19',
      furrow: 'rgba(186, 230, 253, 0.25)',
      rim: '#6b4e31',
    },
    mulched: {
      topA: '#a68246',
      topB: '#8a6832',
      left: '#664a22',
      right: '#4b3516',
      furrow: 'rgba(254, 240, 138, 0.32)',
      rim: '#c7a261',
    },
    locked: {
      topA: '#4f7f48',
      topB: '#3f6b3a',
      left: '#32562e',
      right: '#264223',
      furrow: 'rgba(255, 255, 255, 0.08)',
      rim: '#62945a',
    },
    snow_locked: {
      topA: '#d9e6f2',
      topB: '#bfd1e3',
      left: '#99b0c7',
      right: '#7e97b0',
      furrow: 'rgba(255, 255, 255, 0.3)',
      rim: '#eef6ff',
    },
  };

  const p = palette[key];

  // Left extruded bevel
  c.fillStyle = p.left;
  c.beginPath();
  c.moveTo(cx - hw, cy);
  c.lineTo(cx, cy + hh);
  c.lineTo(cx, cy + hh + d);
  c.lineTo(cx - hw, cy + d);
  c.closePath();
  c.fill();

  // Right extruded bevel
  c.fillStyle = p.right;
  c.beginPath();
  c.moveTo(cx + hw, cy);
  c.lineTo(cx, cy + hh);
  c.lineTo(cx, cy + hh + d);
  c.lineTo(cx + hw, cy + d);
  c.closePath();
  c.fill();

  // Top beveled soil diamond
  const grad = c.createLinearGradient(cx - hw, cy - hh, cx + hw, cy + hh);
  grad.addColorStop(0, p.topA);
  grad.addColorStop(1, p.topB);
  c.fillStyle = grad;
  c.beginPath();
  c.moveTo(cx, cy - hh);
  c.lineTo(cx + hw, cy);
  c.lineTo(cx, cy + hh);
  c.lineTo(cx - hw, cy);
  c.closePath();
  c.fill();

  // Top sunlit rim
  c.strokeStyle = p.rim;
  c.lineWidth = 1.2;
  c.stroke();

  // Plowed furrows or straw mulch texture
  c.save();
  c.beginPath();
  c.moveTo(cx, cy - hh + 2);
  c.lineTo(cx + hw - 3, cy);
  c.lineTo(cx, cy + hh - 2);
  c.lineTo(cx - hw + 3, cy);
  c.closePath();
  c.clip();

  if (key !== 'locked' && key !== 'snow_locked') {
    c.strokeStyle = p.furrow;
    c.lineWidth = 1.6;
    for (let i = -3; i <= 3; i++) {
      c.beginPath();
      c.moveTo(cx - hw + i * 8, cy - hh + i * 4);
      c.lineTo(cx + hw + i * 8, cy + hh + i * 4);
      c.stroke();
    }
    // Organic pebble micro-grain
    for (let i = 0; i < 16; i++) {
      const rx = cx + (((i * 37) % 44) - 22);
      const ry = cy + (((i * 23) % 20) - 10);
      c.fillStyle = i % 2 === 0 ? 'rgba(255,245,225,0.14)' : 'rgba(25,14,6,0.2)';
      c.beginPath();
      c.arc(rx, ry, 1 + (i % 2) * 0.6, 0, Math.PI * 2);
      c.fill();
    }
    if (key === 'mulched') {
      c.strokeStyle = 'rgba(253, 224, 71, 0.55)';
      c.lineWidth = 1.1;
      for (let i = 0; i < 14; i++) {
        const sx = cx + (((i * 29) % 42) - 21);
        const sy = cy + (((i * 17) % 18) - 9);
        c.beginPath();
        c.moveTo(sx - 3, sy - 1);
        c.lineTo(sx + 3, sy + 1.5);
        c.stroke();
      }
    }
  } else {
    // Grass tufts on locked meadow
    c.strokeStyle = key === 'snow_locked' ? 'rgba(148,163,184,0.45)' : 'rgba(163, 230, 53, 0.35)';
    c.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      const gx = cx + (((i * 19) % 30) - 15);
      const gy = cy + (((i * 13) % 14) - 7);
      c.beginPath();
      c.moveTo(gx, gy);
      c.lineTo(gx - 2, gy - 4);
      c.moveTo(gx, gy);
      c.lineTo(gx + 2, gy - 4);
      c.stroke();
    }
  }
  c.restore();

  return off;
}

export function getSoilTileSprite(key: SoilTileKey): HTMLCanvasElement {
  let cached = tileCache.get(key);
  if (!cached) {
    cached = createCachedSoilTile(key);
    tileCache.set(key, cached);
  }
  return cached;
}

export function drawSoilPlotTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  plot: Plot | null,
  isSnowy: boolean,
  t: number,
): void {
  let key: SoilTileKey = isSnowy ? 'snow_locked' : 'locked';
  if (plot) {
    const isPaddy = plot.crop?.cropId === 'paddy_rice' && plot.soil.moisture >= 65;
    if (isPaddy) key = 'paddy';
    else if (plot.soil.mulchedDays > 0) key = 'mulched';
    else if (plot.soil.moisture >= 68) key = 'wet';
    else if (plot.soil.moisture >= 36) key = 'moist';
    else key = 'dry';
  }

  const sprite = getSoilTileSprite(key);
  ctx.drawImage(sprite, x - sprite.width * 0.5, y - (6 + TILE_H * 0.5));

  // Animated water shimmer ripples on flooded Paddy Rice!
  if (key === 'paddy') {
    ctx.save();
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.55)';
    ctx.lineWidth = 1;
    const phase = (t * 1.4 + (plot?.id ?? 0) * 0.7) % 1;
    const rad = 4 + phase * 14;
    ctx.globalAlpha = 1 - phase;
    ctx.beginPath();
    ctx.ellipse(x, y, rad, rad * 0.48, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawRowCoverTunnel(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.save();
  ctx.translate(x, y);
  // Translucent arched hoop-house dome
  const grad = ctx.createLinearGradient(0, -24, 0, 6);
  grad.addColorStop(0, 'rgba(240, 249, 255, 0.42)');
  grad.addColorStop(1, 'rgba(186, 230, 253, 0.16)');
  ctx.fillStyle = grad;
  ctx.strokeStyle = 'rgba(224, 242, 254, 0.85)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-22, 2);
  ctx.quadraticCurveTo(-18, -24, 0, -25);
  ctx.quadraticCurveTo(18, -24, 22, 2);
  ctx.quadraticCurveTo(0, 11, -22, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Internal wire hoop ribs
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-11, 5);
  ctx.quadraticCurveTo(-8, -19, 0, -22);
  ctx.moveTo(11, 5);
  ctx.quadraticCurveTo(8, -19, 0, -22);
  ctx.stroke();
  ctx.restore();
}

function drawContactShadow(ctx: CanvasRenderingContext2D, rx: number, ry: number): void {
  // Oval ambient occlusion + slight directional sun offset
  ctx.fillStyle = 'rgba(15, 23, 18, 0.28)';
  ctx.beginPath();
  ctx.ellipse(3, 2, rx * 1.12, ry * 0.92, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(15, 23, 18, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 1, rx * 0.85, ry * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawBotanicalCrop(
  ctx: CanvasRenderingContext2D,
  plot: Plot,
  x: number,
  y: number,
  t: number,
  wind: number,
  hasRainGuard: boolean,
  isFrosty: boolean,
): void {
  const planted = plot.crop;
  if (!planted) return;

  const stage = planted.stage;
  const sway = Math.sin(t * (2.1 + wind * 4.5) + plot.id * 1.1) * (1.5 + wind * 5.2);

  ctx.save();
  ctx.translate(x, y + 2);

  // Stage 0: Planted seeds / tiny sapling
  if (stage === 0) {
    drawContactShadow(ctx, 8, 4);
    ctx.fillStyle = '#e2c28b';
    for (const [ox, oy] of [[-5, -1], [0, 1], [5, -1]]) {
      ctx.beginPath();
      ctx.ellipse(ox, oy, 2.6, 1.8, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    if (planted.cropId === 'rubber_tree' || planted.cropId === 'oil_palm') {
      ctx.strokeStyle = '#65a30d';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, 1);
      ctx.lineTo(sway * 0.25, -10);
      ctx.stroke();
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.ellipse(sway * 0.25 - 3, -9, 3.5, 1.8, -0.4, 0, Math.PI * 2);
      ctx.ellipse(sway * 0.25 + 3, -9, 3.5, 1.8, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  // Stage 1: Tender Sprout
  if (stage === 1) {
    drawContactShadow(ctx, 9, 4.5);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.quadraticCurveTo(sway * 0.3, -7, sway * 0.45, -13);
    ctx.stroke();
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(sway * 0.45 - 4.5, -12, 4.8, 2.2, -0.45, 0, Math.PI * 2);
    ctx.ellipse(sway * 0.45 + 4.5, -12, 4.8, 2.2, 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  const scale = stage === 2 ? 0.72 : stage === 3 ? 0.9 : 1.06;

  switch (planted.cropId) {
    case 'rubber_tree': {
      drawContactShadow(ctx, 18 * scale, 8 * scale);
      // Tapered grey-brown bark trunk
      ctx.fillStyle = '#7c6552';
      ctx.beginPath();
      ctx.moveTo(-4.5 * scale, 2);
      ctx.lineTo(-2.5 * scale + sway * 0.35, -28 * scale);
      ctx.lineTo(2.5 * scale + sway * 0.35, -28 * scale);
      ctx.lineTo(4.5 * scale, 2);
      ctx.closePath();
      ctx.fill();
      // Bark shading highlight
      ctx.strokeStyle = '#9c836e';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-2 * scale, 1);
      ctx.lineTo(-1 * scale + sway * 0.3, -24 * scale);
      ctx.stroke();

      // Spiral tapping groove, ceramic latex cup & animated white drip
      if (stage >= 3) {
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-3 * scale, -14 * scale);
        ctx.lineTo(3 * scale, -10 * scale);
        ctx.stroke();
        // Ceramic cup
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.roundRect(1.5 * scale, -10 * scale, 5.5, 5, 1.5);
        ctx.fill();
        ctx.stroke();
        if (stage === 4) {
          const dripY = -10 * scale + ((t * 14) % 4);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(3.8 * scale, dripY, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
        if (hasRainGuard) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(3.5 * scale, -12.5 * scale, 7, Math.PI, 0);
          ctx.fill();
          ctx.stroke();
        }
      }

      // Multi-layered dome canopy (shadow -> midtone -> sunlit crown)
      const cx = sway * 0.45;
      const cy = -30 * scale;
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(cx - 10 * scale, cy + 4 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 10 * scale, cy + 4 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.arc(cx, cy, 13.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(cx - 6 * scale, cy - 2 * scale, 9.5 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 7 * scale, cy - 1 * scale, 8.5 * scale, 0, Math.PI * 2);
      ctx.arc(cx, cy - 5 * scale, 10.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(cx - 3 * scale, cy - 7 * scale, 6.5 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 4 * scale, cy - 6 * scale, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'oil_palm': {
      drawContactShadow(ctx, 19 * scale, 8.5 * scale);
      const topX = sway * 0.35;
      const topY = -26 * scale;
      // Ringed cross-hatched palm trunk
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 7.5 * scale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.quadraticCurveTo(sway * 0.12, -12 * scale, topX, topY);
      ctx.stroke();
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 1.2;
      for (let r = 0; r < 5; r++) {
        const ry = -3 - r * 4.5 * scale;
        ctx.beginPath();
        ctx.moveTo(-3 * scale, ry);
        ctx.lineTo(3 * scale, ry - 1.5);
        ctx.stroke();
      }

      // 8-9 feather-segmented arching fronds swaying independently
      const frondCount = 9;
      for (let i = 0; i < frondCount; i++) {
        const baseA = -Math.PI + (i / (frondCount - 1)) * Math.PI * 1.15 - 0.1;
        const localSway = Math.sin(t * 2.8 + i * 0.8 + plot.id) * 0.08 * (1 + wind);
        const a = baseA + localSway;
        const len = (17 + (i % 2) * 4) * scale;
        const ex = topX + Math.cos(a) * len;
        const ey = topY + Math.sin(a) * len * 0.72 + 7 * scale;
        const mx = topX + Math.cos(a) * len * 0.52;
        const my = topY + Math.sin(a) * len * 0.45 - 4 * scale;

        ctx.strokeStyle = i % 2 === 0 ? '#15803d' : '#22c55e';
        ctx.lineWidth = 2.4 * scale;
        ctx.beginPath();
        ctx.moveTo(topX, topY);
        ctx.quadraticCurveTo(mx, my, ex, ey);
        ctx.stroke();

        // Feather leaflets
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx + Math.cos(a + 0.6) * 5 * scale, my + 4 * scale);
        ctx.moveTo(ex * 0.7 + topX * 0.3, ey * 0.7 + topY * 0.3);
        ctx.lineTo(ex * 0.7 + topX * 0.3, ey * 0.7 + topY * 0.3 + 5 * scale);
        ctx.stroke();
      }

      // Glossy clustered orange-red Fresh Fruit Bunches (FFB)
      if (stage >= 3) {
        for (const [fx, fy] of [[-5, 3], [5, 3], [0, 5.5]]) {
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(topX + fx * scale, topY + fy * scale, 4.2 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fb923c';
          ctx.beginPath();
          ctx.arc(topX + fx * scale - 1, topY + fy * scale - 1, 1.8 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'paddy_rice':
    case 'winter_wheat': {
      const isRice = planted.cropId === 'paddy_rice';
      drawContactShadow(ctx, 14 * scale, 6 * scale);
      for (let i = -3; i <= 3; i++) {
        const bx = i * 4.2;
        const tipX = bx + sway * 0.75 + (stage >= 3 ? 2.5 : 0);
        const tipY = -(17 + (Math.abs(i) % 2) * 4) * scale;
        ctx.strokeStyle = stage === 4 ? (isRice ? '#ca8a04' : '#d97706') : isRice ? '#65a30d' : '#4d7c0f';
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.moveTo(bx, 1);
        ctx.quadraticCurveTo(bx + sway * 0.35, tipY * 0.55, tipX, tipY);
        ctx.stroke();

        if (stage >= 3) {
          ctx.fillStyle = isRice ? '#fde047' : '#fbbf24';
          ctx.beginPath();
          ctx.ellipse(tipX + 1.5, tipY + 2, 2.2, 5 * scale, 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'tomato': {
      drawContactShadow(ctx, 13 * scale, 6 * scale);
      // Wooden garden stake
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.lineTo(sway * 0.15, -24 * scale);
      ctx.stroke();
      // Vine bush
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(sway * 0.25, -13 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.arc(sway * 0.25 - 6 * scale, -8 * scale, 7 * scale, 0, Math.PI * 2);
      ctx.arc(sway * 0.25 + 6 * scale, -9 * scale, 7 * scale, 0, Math.PI * 2);
      ctx.fill();
      if (stage >= 3) {
        for (const [tx, ty] of [[-5, -12], [4, -15], [5, -7], [-2, -6]]) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(sway * 0.25 + tx * scale, ty * scale, 3.2 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fecaca';
          ctx.beginPath();
          ctx.arc(sway * 0.25 + tx * scale - 1, ty * scale - 1, 1 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    case 'sweet_corn': {
      drawContactShadow(ctx, 14 * scale, 6 * scale);
      for (const ox of [-7, 0, 7]) {
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(ox, 2);
        ctx.quadraticCurveTo(ox + sway * 0.3, -13 * scale, ox + sway * 0.65, -26 * scale);
        ctx.stroke();
        // Arching corn leaves
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(ox + sway * 0.2, -10 * scale);
        ctx.quadraticCurveTo(ox - 7, -14 * scale, ox - 10, -8 * scale);
        ctx.stroke();
        if (stage >= 3) {
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.ellipse(ox + sway * 0.35 + 2.5, -14 * scale, 2.5, 5.2 * scale, 0.2, 0, Math.PI * 2);
          ctx.fill();
          // Tassel
          ctx.strokeStyle = '#fde68a';
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(ox + sway * 0.65, -26 * scale);
          ctx.lineTo(ox + sway * 0.75 + 2, -30 * scale);
          ctx.stroke();
        }
      }
      break;
    }

    case 'sunflower': {
      drawContactShadow(ctx, 12 * scale, 5.5 * scale);
      const hx = sway * 0.6;
      const hy = -26 * scale;
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.quadraticCurveTo(sway * 0.25, -12 * scale, hx, hy);
      ctx.stroke();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(sway * 0.2 - 6, -12 * scale, 5.5 * scale, 2.8 * scale, -0.4, 0, Math.PI * 2);
      ctx.ellipse(sway * 0.2 + 6, -10 * scale, 5.5 * scale, 2.8 * scale, 0.4, 0, Math.PI * 2);
      ctx.fill();
      if (stage >= 3) {
        // Multi-petal golden corona
        ctx.fillStyle = '#facc15';
        for (let p = 0; p < 10; p++) {
          const a = (p / 10) * Math.PI * 2 + t * 0.2;
          ctx.beginPath();
          ctx.ellipse(hx + Math.cos(a) * 6.5 * scale, hy + Math.sin(a) * 6.5 * scale, 3.2 * scale, 1.7 * scale, a, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#713f12';
        ctx.beginPath();
        ctx.arc(hx, hy, 4.6 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    default: {
      // Soybean, Spinach, Strawberry, Blueberry, Potato — lush multi-tone botanical mounds
      drawContactShadow(ctx, 13 * scale, 6 * scale);
      const leafDark = planted.dormant ? '#475569' : planted.cropId === 'spinach' ? '#14532d' : '#15803d';
      const leafBright = planted.dormant ? '#94a3b8' : planted.cropId === 'soybean' ? '#84cc16' : '#22c55e';

      ctx.fillStyle = leafDark;
      ctx.beginPath();
      ctx.arc(sway * 0.25 - 6 * scale, -6 * scale, 7.5 * scale, 0, Math.PI * 2);
      ctx.arc(sway * 0.25 + 6 * scale, -6 * scale, 7.5 * scale, 0, Math.PI * 2);
      ctx.arc(sway * 0.25, -10 * scale, 9.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = leafBright;
      ctx.beginPath();
      ctx.arc(sway * 0.25 - 3 * scale, -11 * scale, 5.5 * scale, 0, Math.PI * 2);
      ctx.arc(sway * 0.25 + 4 * scale, -9 * scale, 5 * scale, 0, Math.PI * 2);
      ctx.fill();

      if (stage >= 3) {
        const fruitCol =
          planted.cropId === 'strawberry'
            ? '#f43f5e'
            : planted.cropId === 'blueberry'
              ? '#3b82f6'
              : planted.cropId === 'potato'
                ? '#d97706'
                : planted.cropId === 'soybean'
                  ? '#bef264'
                  : '#4ade80';
        const pts =
          planted.cropId === 'potato'
            ? [[-6, 0], [5, 1], [0, 2]]
            : [[-5, -11], [4, -12], [0, -6], [6, -7]];
        for (const [fx, fy] of pts) {
          ctx.fillStyle = fruitCol;
          ctx.beginPath();
          ctx.arc(sway * 0.25 + fx * scale, fy * scale, 2.8 * scale, 0, Math.PI * 2);
          ctx.fill();
          if (planted.cropId === 'strawberry' || planted.cropId === 'blueberry') {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(sway * 0.25 + fx * scale - 0.8, fy * scale - 0.8, 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      break;
    }
  }

  // Rim frost highlight on frosty/blizzard days
  if (isFrosty) {
    ctx.fillStyle = 'rgba(224, 242, 254, 0.45)';
    ctx.beginPath();
    ctx.arc(sway * 0.3, -14 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating golden star badge when Harvestable (Stage 4)
  if (stage === 4) {
    const bob = Math.sin(t * 4.5 + plot.id) * 2.8;
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(13, -24 + bob, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#422006';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', 13, -23.5 + bob);
  }

  ctx.restore();
}

export function drawIsometricFarmhouse(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  x: number,
  y: number,
  t: number,
): void {
  const lv = state.homestead.farmhouseLevel;
  const snowy = state.weatherToday.weather === 'snow_blizzard';
  const w = lv === 1 ? 82 : lv === 2 ? 98 : lv === 3 ? 106 : 106;
  const h = lv >= 3 ? 66 : 46;

  ctx.save();
  ctx.translate(x, y);

  // Soft ground shadow
  ctx.fillStyle = 'rgba(12, 24, 18, 0.34)';
  ctx.beginPath();
  ctx.ellipse(8, 12, w * 0.68, 22, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Rising cozy chimney smoke puffs
  ctx.fillStyle = 'rgba(241, 245, 249, 0.5)';
  for (let i = 0; i < 4; i++) {
    const prog = (t * 0.35 + i * 0.25) % 1;
    const sx = w * 0.26 + Math.sin(t * 1.4 + i) * 7;
    const sy = -h - 32 - prog * 42;
    ctx.globalAlpha = (1 - prog) * 0.55;
    ctx.beginPath();
    ctx.arc(sx, sy, 4 + prog * 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Front wall (sunlit)
  ctx.fillStyle = lv === 1 ? '#c08552' : lv === 2 ? '#e7d5bc' : lv === 3 ? '#fef3c7' : '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(-w * 0.5, 4);
  ctx.lineTo(w * 0.22, 16);
  ctx.lineTo(w * 0.22, 16 - h);
  ctx.lineTo(-w * 0.5, 4 - h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(69, 26, 3, 0.25)';
  ctx.stroke();

  // Side wall (shaded 2.5D)
  ctx.fillStyle = lv === 1 ? '#966238' : lv === 2 ? '#c4ad8d' : lv === 3 ? '#e2cfa3' : '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(w * 0.22, 16);
  ctx.lineTo(w * 0.54, 0);
  ctx.lineTo(w * 0.54, -h);
  ctx.lineTo(w * 0.22, 16 - h);
  ctx.closePath();
  ctx.fill();

  // Level 4 Sunlit Glass Greenhouse Wing
  if (lv === 4) {
    ctx.fillStyle = 'rgba(125, 211, 252, 0.42)';
    ctx.strokeStyle = '#f0f9ff';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(w * 0.54, 0);
    ctx.lineTo(w * 0.86, -12);
    ctx.lineTo(w * 0.86, -40);
    ctx.lineTo(w * 0.54, -34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Little plants visible inside greenhouse
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(w * 0.66, -12, 5, 0, Math.PI * 2);
    ctx.arc(w * 0.76, -16, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Stone chimney
  ctx.fillStyle = '#64748b';
  ctx.fillRect(w * 0.18, -h - 28, 12, 24);
  ctx.fillStyle = '#475569';
  ctx.fillRect(w * 0.16, -h - 30, 16, 4);

  // Pitched shingled roof
  const roofMain = snowy ? '#e2e8f0' : lv === 1 ? '#9a3412' : lv === 2 ? '#b45309' : lv === 3 ? '#b91c1c' : '#0f766e';
  const roofSide = snowy ? '#cbd5e1' : lv === 1 ? '#7c2d12' : lv === 2 ? '#92400e' : lv === 3 ? '#991b1b' : '#115e59';

  ctx.fillStyle = roofMain;
  ctx.beginPath();
  ctx.moveTo(-w * 0.58, 4 - h);
  ctx.lineTo(-w * 0.14, -h - 30);
  ctx.lineTo(w * 0.28, 16 - h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = roofSide;
  ctx.beginPath();
  ctx.moveTo(-w * 0.14, -h - 30);
  ctx.lineTo(w * 0.26, -h - 40);
  ctx.lineTo(w * 0.62, -h);
  ctx.lineTo(w * 0.28, 16 - h);
  ctx.closePath();
  ctx.fill();

  // Solar Roof Panels if placed
  if (hasPlacedFurniture(state.homestead, 'solar_panels')) {
    ctx.fillStyle = '#1e40af';
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-18, -h - 14);
    ctx.lineTo(14, -h - 21);
    ctx.lineTo(24, -h - 5);
    ctx.lineTo(-8, -h + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Wooden Porch & Door
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-w * 0.36, -20, 16, 26);
  // Warm glowing mullioned windows
  ctx.fillStyle = '#fef08a';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.2;
  ctx.fillRect(-8, -20, 18, 14);
  ctx.strokeRect(-8, -20, 18, 14);
  if (lv >= 3) {
    ctx.fillRect(-30, -48, 16, 14);
    ctx.strokeRect(-30, -48, 16, 14);
    ctx.fillRect(-4, -44, 16, 14);
    ctx.strokeRect(-4, -44, 16, 14);
  }

  // Garden Lanterns with warm radial light halos
  if (hasPlacedFurniture(state.homestead, 'garden_lanterns')) {
    const pulse = 0.65 + 0.25 * Math.sin(t * 3.5);
    for (const [lx, ly] of [[-w * 0.45, 16], [w * 0.26, 26]]) {
      const halo = ctx.createRadialGradient(lx, ly, 2, lx, ly, 18);
      halo.addColorStop(0, `rgba(253, 224, 71, ${pulse})`);
      halo.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(lx, ly, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(lx, ly, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Animated stone-rimmed Koi Pond with lily pads & swimming koi
  if (hasPlacedFurniture(state.homestead, 'koi_pond')) {
    const px = 42;
    const py = 42;
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.ellipse(px, py, 32, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(px, py, 27, 12.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Lily pads
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(px - 11, py - 2, 4.5, 0.3, Math.PI * 2 - 0.3);
    ctx.arc(px + 12, py + 3, 3.8, 0.4, Math.PI * 2 - 0.2);
    ctx.fill();
    // Swimming koi
    const kx = px + Math.cos(t * 1.4) * 13;
    const ky = py + Math.sin(t * 1.4) * 5;
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.ellipse(kx, ky, 4.2, 2, Math.atan2(Math.cos(t * 1.4), -Math.sin(t * 1.4)), 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating crisp label pill
  ctx.fillStyle = 'rgba(15, 23, 18, 0.72)';
  ctx.beginPath();
  ctx.roundRect(-48, -h - 52, 96, 18, 9);
  ctx.fill();
  ctx.fillStyle = '#fef3c7';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Farmhouse Lv.${lv}`, 0, -h - 43);

  ctx.restore();
}

export function drawPastureProps(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  x: number,
  y: number,
): void {
  const hasShelter =
    state.homestead.ownedTools.includes('coop_upgrade') ||
    state.homestead.ownedTools.includes('cow_barn_upgrade') ||
    state.homestead.ownedTools.includes('pig_pen_upgrade');
  const snowy = state.weatherToday.weather === 'snow_blizzard';

  ctx.save();
  ctx.translate(x, y);

  // Cute Animal Shelter / Red Mini-Barn
  ctx.fillStyle = 'rgba(12, 24, 18, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 8, 36, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = hasShelter ? '#b91c1c' : '#92400e';
  ctx.fillRect(-26, -24, 52, 30);
  ctx.fillStyle = snowy ? '#e2e8f0' : hasShelter ? '#7f1d1d' : '#78350f';
  ctx.beginPath();
  ctx.moveTo(-32, -22);
  ctx.lineTo(0, -42);
  ctx.lineTo(32, -22);
  ctx.closePath();
  ctx.fill();
  // Barn cross door
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(-9, -14, 18, 20);
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-9, -14, 18, 20);

  // Golden Hay Bales
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.roundRect(38, -8, 18, 13, 3);
  ctx.fill();
  ctx.strokeStyle = '#a16207';
  ctx.stroke();

  // Wooden Water Trough
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-56, -2, 24, 10);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(-54, 0, 20, 5);

  ctx.restore();
}

export function drawLivestockAnimal(
  ctx: CanvasRenderingContext2D,
  animal: Animal,
  x: number,
  y: number,
  t: number,
  idx: number,
  weatherRisk: boolean,
): void {
  const scale = animal.stage === 'young' ? 0.72 : animal.stage === 'growing' ? 0.88 : 1.06;
  const facing = Math.cos(t * (animal.type === 'chicken' ? 1.5 : 0.7) + idx * 1.9) >= 0 ? 1 : -1;
  const step = Math.sin(t * 7 + idx * 2);
  const peck = Math.max(0, Math.sin(t * 2.4 + idx * 3)) > 0.78 ? 1 : 0;

  ctx.save();
  ctx.translate(x, y);

  // Contact shadow
  drawContactShadow(ctx, (animal.type === 'cow' ? 15 : 10) * scale, 4.5 * scale);

  ctx.save();
  ctx.scale(facing, 1);

  if (animal.type === 'chicken') {
    // Legs
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-2 * scale, 1);
    ctx.lineTo((-2 + step * 2) * scale, 6 * scale);
    ctx.moveTo(2 * scale, 1);
    ctx.lineTo((2 - step * 2) * scale, 6 * scale);
    ctx.stroke();
    // Plump feathered body
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.ellipse(0, -3 * scale, 8.5 * scale, 6.2 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tail feathers
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.ellipse(-7 * scale, -6 * scale, 4 * scale, 2.5 * scale, -0.5, 0, Math.PI * 2);
    ctx.fill();
    // Wing
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#e5d4a1';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(-1 * scale, -2.5 * scale, 4.8 * scale, 3.2 * scale, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Head + red comb + beak (dips when pecking)
    const hy = (-7 + peck * 3.5) * scale;
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.arc(6.5 * scale, hy, 4.2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(6.5 * scale, hy - 4 * scale, 2.2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(10 * scale, hy - 1 * scale);
    ctx.lineTo(13.5 * scale, hy + 0.5 * scale);
    ctx.lineTo(10 * scale, hy + 2 * scale);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(8 * scale, hy - 0.5 * scale, 0.9, 0, Math.PI * 2);
    ctx.fill();
  } else if (animal.type === 'cow') {
    // 4 Legs
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.6 * scale;
    for (const lx of [-10, -5, 6, 10]) {
      ctx.beginPath();
      ctx.moveTo(lx * scale, 0);
      ctx.lineTo((lx + (lx < 0 ? step : -step) * 1.5) * scale, 8 * scale);
      ctx.stroke();
    }
    // Swishing tail
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-14 * scale, -6 * scale);
    ctx.quadraticCurveTo(-18 * scale, -2 * scale, (-17 + Math.sin(t * 4 + idx) * 3) * scale, 3 * scale);
    ctx.stroke();
    // Body
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-14 * scale, -13 * scale, 28 * scale, 16 * scale, 6 * scale);
    ctx.fill();
    // Dairy spots
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(-4 * scale, -7 * scale, 5 * scale, 3.8 * scale, 0.2, 0, Math.PI * 2);
    ctx.ellipse(6 * scale, -4 * scale, 4 * scale, 3 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Head + horns + snout (dips when grazing)
    const hy = (-10 + peck * 5) * scale;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(15 * scale, hy, 6.2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.ellipse(19 * scale, hy + 2 * scale, 3.6 * scale, 2.6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // Horns
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(13 * scale, hy - 5 * scale);
    ctx.lineTo(11 * scale, hy - 9 * scale);
    ctx.moveTo(17 * scale, hy - 5 * scale);
    ctx.lineTo(19 * scale, hy - 9 * scale);
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(16.5 * scale, hy - 1 * scale, 1.1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Pig: legs + curly tail + rosy body + snout + floppy ear
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 2.2 * scale;
    for (const lx of [-7, -3, 4, 8]) {
      ctx.beginPath();
      ctx.moveTo(lx * scale, 1);
      ctx.lineTo((lx + step * 1.4) * scale, 6.5 * scale);
      ctx.stroke();
    }
    // Curly tail
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(-13 * scale, -5 * scale, 2.5 * scale, 0, Math.PI * 1.6);
    ctx.stroke();
    // Body
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.ellipse(0, -4 * scale, 12.5 * scale, 8.2 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head + snout + ear
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.arc(10 * scale, -5 * scale, 5.5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.ellipse(15 * scale, -4 * scale, 3.2 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9f1239';
    ctx.fillRect(14.5 * scale, -4.8 * scale, 1, 1.5);
    ctx.fillRect(16 * scale, -4.8 * scale, 1, 1.5);
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(8.5 * scale, -10 * scale, 3 * scale, 2 * scale, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(11.5 * scale, -6.5 * scale, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Produce ready badge
  if (animal.produceReady > 0 || animal.truffleReady) {
    const bob = Math.sin(t * 4 + idx) * 2;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(-9, -20 + bob, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#422006';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(animal.type === 'chicken' ? '🥚' : animal.type === 'cow' ? '🥛' : '🍄', -9, -19.5 + bob);
  }

  // Weather shelter badge
  if (weatherRisk) {
    ctx.fillStyle = animal.sheltered ? '#38bdf8' : '#ef4444';
    ctx.beginPath();
    ctx.arc(12, -19, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(animal.sheltered ? '⌂' : '!', 12, -18.5);
  }

  ctx.restore();
}

export function drawVisitingNpcSprite(
  ctx: CanvasRenderingContext2D,
  npcId: NpcId,
  name: string,
  hasQuest: boolean,
  x: number,
  y: number,
  t: number,
  idx: number,
): void {
  const bob = Math.sin(t * 2.8 + idx * 1.4) * 2;

  ctx.save();
  ctx.translate(x, y);
  drawContactShadow(ctx, 11, 4.5);

  ctx.save();
  ctx.translate(0, bob);

  // Legs
  ctx.fillStyle = '#334155';
  ctx.fillRect(-5, -7, 4, 8);
  ctx.fillRect(1, -7, 4, 8);

  // Distinct full-body outfit per NPC
  const outfit: Record<NpcId, { coat: string; trim: string; skin: string; hat?: string }> = {
    dr_mali: { coat: '#f8fafc', trim: '#10b981', skin: '#e6b89c' },
    uncle_somchai: { coat: '#fef3c7', trim: '#78350f', skin: '#d99b6c', hat: '#f59e0b' },
    nadia: { coat: '#0d9488', trim: '#fbbf24', skin: '#dba27b', hat: '#f43f5e' },
    master_ken: { coat: '#cbd5e1', trim: '#92400e', skin: '#e2b494', hat: '#f59e0b' },
    auntie_lin: { coat: '#fff7ed', trim: '#fb7185', skin: '#f1c6a7' },
  };
  const o = outfit[npcId];

  // Torso / Coat
  ctx.fillStyle = o.coat;
  ctx.beginPath();
  ctx.roundRect(-9, -24, 18, 18, 5);
  ctx.fill();
  ctx.fillStyle = o.trim;
  ctx.fillRect(-4, -22, 8, 14);

  // Head
  ctx.fillStyle = o.skin;
  ctx.beginPath();
  ctx.arc(0, -31, 8.5, 0, Math.PI * 2);
  ctx.fill();

  // Hair / Hat details
  if (npcId === 'uncle_somchai') {
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(0, -37, 14, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -38, 7.5, Math.PI, 0);
    ctx.fill();
  } else if (npcId === 'dr_mali') {
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, -33, 8.5, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-5, -33, 4, 3);
    ctx.strokeRect(1, -33, 4, 3);
  } else if (npcId === 'nadia') {
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(0, -33, 9, Math.PI, 0);
    ctx.fill();
  } else if (npcId === 'master_ken') {
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(0, -33, 8.5, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-8, -36, 16, 2.5);
  } else {
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.arc(0, -40, 4.5, 0, Math.PI * 2);
    ctx.arc(0, -33, 8.5, Math.PI, 0);
    ctx.fill();
  }

  // Eyes
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-3.2, -32, 1.5, 1.5);
  ctx.fillRect(1.8, -32, 1.5, 1.5);

  // Floating ! or 💬 badge
  ctx.fillStyle = hasQuest ? '#facc15' : '#e0f2fe';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(10, -44, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(hasQuest ? '!' : '💬', 10, -43.5);

  ctx.restore();

  // Name tag
  ctx.fillStyle = 'rgba(15, 23, 18, 0.72)';
  ctx.beginPath();
  ctx.roundRect(-24, 5, 48, 14, 7);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name.split(' ').pop() ?? name, 0, 12);

  ctx.restore();
}

export function isHarshWeatherForLivestock(weather: GameState['weatherToday']['weather']): boolean {
  return WEATHER_SPECS[weather].animalStressRisk > 0;
}
