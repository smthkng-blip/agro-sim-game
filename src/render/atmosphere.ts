import type { ClimateType, Season, WeatherType } from '../sim/types';
import { LOGICAL_H, LOGICAL_W } from './iso';

export function getSkyPalette(weather: WeatherType, season: Season): [string, string, string] {
  const winter = season === 'winter';
  switch (weather) {
    case 'clear':
      return winter ? ['#0284c7', '#7dd3fc', '#e0f2fe'] : ['#0369a1', '#38bdf8', '#fef3c7'];
    case 'partly_cloudy':
      return ['#0369a1', '#60a5fa', '#dbeafe'];
    case 'overcast_fog':
      return ['#475569', '#94a3b8', '#cbd5e1'];
    case 'light_drizzle':
      return ['#334155', '#64748b', '#94a3b8'];
    case 'heavy_rain':
      return ['#1e293b', '#334155', '#64748b'];
    case 'thunderstorm':
      return ['#0b1120', '#1e293b', '#334155'];
    case 'strong_wind':
      return ['#0f766e', '#5eead4', '#ccfbf1'];
    case 'heatwave':
      return ['#b45309', '#f59e0b', '#fef08a'];
    case 'hailstorm':
      return ['#1e293b', '#475569', '#94a3b8'];
    case 'frost':
      return ['#1e40af', '#60a5fa', '#e0f2fe'];
    case 'snow_blizzard':
      return ['#475569', '#94a3b8', '#f1f5f9'];
    case 'rainbow':
      return ['#0284c7', '#38bdf8', '#bbf7d0'];
  }
}

export function drawParallaxBackdrop(
  ctx: CanvasRenderingContext2D,
  climate: ClimateType,
  season: Season,
  weather: WeatherType,
  t: number,
  panX: number,
): void {
  const [skyTop, skyMid, skyHorizon] = getSkyPalette(weather, season);
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 175);
  skyGrad.addColorStop(0, skyTop);
  skyGrad.addColorStop(0.6, skyMid);
  skyGrad.addColorStop(1, skyHorizon);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, LOGICAL_W, 185);

  // Animated Sun / Moon arc
  const sunX = 160 + Math.sin(t * 0.05) * 40 + panX * 0.08;
  const sunY = 58 - Math.cos(t * 0.05) * 10;
  if (weather !== 'thunderstorm' && weather !== 'heavy_rain' && weather !== 'snow_blizzard') {
    const glow = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, 72);
    glow.addColorStop(0, weather === 'heatwave' ? 'rgba(254, 240, 138, 0.95)' : 'rgba(254, 249, 195, 0.85)');
    glow.addColorStop(0.45, 'rgba(253, 224, 71, 0.28)');
    glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 72, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef9c3';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  // Drifting volumetric clouds
  ctx.fillStyle =
    weather === 'thunderstorm' || weather === 'heavy_rain'
      ? 'rgba(51, 65, 85, 0.72)'
      : 'rgba(255, 255, 255, 0.72)';
  for (let i = 0; i < 6; i++) {
    const cx = ((i * 210 + t * 11 + panX * 0.14) % (LOGICAL_W + 180)) - 90;
    const cy = 32 + (i % 3) * 22;
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.arc(cx + 18, cy - 6, 23, 0, Math.PI * 2);
    ctx.arc(cx + 38, cy, 17, 0, Math.PI * 2);
    ctx.fill();
  }

  // Distant misty mountains (parallax layer 1)
  const px1 = panX * 0.15;
  ctx.fillStyle =
    season === 'winter'
      ? '#94a3b8'
      : climate === 'tropical_monsoon'
        ? '#1e5641'
        : '#365a49';
  ctx.beginPath();
  ctx.moveTo(-80, 175);
  ctx.quadraticCurveTo(160 + px1, 78, 370 + px1, 136);
  ctx.quadraticCurveTo(610 + px1, 66, 860 + px1, 128);
  ctx.quadraticCurveTo(980 + px1, 95, LOGICAL_W + 80, 165);
  ctx.lineTo(LOGICAL_W + 80, 185);
  ctx.lineTo(-80, 185);
  ctx.closePath();
  ctx.fill();

  // Closer rolling hills & treeline silhouette (parallax layer 2)
  const px2 = panX * 0.28;
  ctx.fillStyle =
    season === 'winter'
      ? '#cbd5e1'
      : season === 'autumn'
        ? '#5b6c2c'
        : climate === 'tropical_monsoon'
          ? '#1f6e43'
          : '#2b6a3c';
  ctx.beginPath();
  ctx.moveTo(-80, 185);
  ctx.quadraticCurveTo(220 + px2, 118, 520 + px2, 152);
  ctx.quadraticCurveTo(810 + px2, 114, LOGICAL_W + 80, 168);
  ctx.lineTo(LOGICAL_W + 80, 200);
  ctx.lineTo(-80, 200);
  ctx.closePath();
  ctx.fill();

  // Background treeline silhouettes
  const treeCol = season === 'winter' ? '#64748b' : '#14532d';
  ctx.fillStyle = treeCol;
  for (let i = 0; i < 24; i++) {
    const tx = i * 48 + px2 * 0.5;
    const ty = 148 + Math.sin(i * 1.3) * 12;
    ctx.beginPath();
    ctx.arc(tx, ty, 12 + (i % 3) * 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawEstateGroundAndPaths(
  ctx: CanvasRenderingContext2D,
  season: Season,
  weather: WeatherType,
  t: number,
): void {
  const snowy = weather === 'snow_blizzard';
  // Lush sunlit meadow floor
  const meadowGrad = ctx.createLinearGradient(0, 140, 0, LOGICAL_H);
  if (snowy) {
    meadowGrad.addColorStop(0, '#dbeafe');
    meadowGrad.addColorStop(1, '#cbd5e1');
  } else if (season === 'autumn') {
    meadowGrad.addColorStop(0, '#5a7d32');
    meadowGrad.addColorStop(1, '#3d5a24');
  } else {
    meadowGrad.addColorStop(0, '#3e8e4c');
    meadowGrad.addColorStop(0.55, '#2f743c');
    meadowGrad.addColorStop(1, '#23592f');
  }
  ctx.fillStyle = meadowGrad;
  ctx.fillRect(-300, 148, LOGICAL_W + 600, LOGICAL_H + 300);

  // Subtle drifting cloud shadows moving slowly across the ground
  if (weather === 'partly_cloudy' || weather === 'clear' || weather === 'strong_wind') {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 18, 0.08)';
    for (let i = 0; i < 3; i++) {
      const sx = ((i * 420 + t * 18) % (LOGICAL_W + 300)) - 150;
      const sy = 240 + i * 110;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 120, 42, -0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Winding warm dirt & cobblestone footpaths connecting Farmhouse, Plots, Pasture & Village Gate
  ctx.save();
  ctx.strokeStyle = snowy ? '#cbd5e1' : '#b89468';
  ctx.lineWidth = 26;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(155, 265); // Farmhouse porch
  ctx.quadraticCurveTo(220, 325, 310, 355); // Toward plots
  ctx.quadraticCurveTo(225, 420, 155, 465); // Down to Village Gate
  ctx.moveTo(310, 355);
  ctx.quadraticCurveTo(540, 485, 835, 395); // Across to Livestock Pasture
  ctx.stroke();

  // Cobblestone stepping stones along path
  ctx.fillStyle = 'rgba(226, 212, 191, 0.65)';
  const stones = [
    [175, 285], [202, 308], [235, 330], [272, 345],
    [245, 385], [210, 420], [178, 448],
    [435, 428], [520, 455], [610, 456], [705, 438], [785, 412],
  ];
  for (const [sx, sy] of stones) {
    ctx.beginPath();
    ctx.ellipse(sx, sy, 7, 3.8, 0.15, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Fenced Livestock Pasture enclosure (right side)
  ctx.save();
  ctx.fillStyle = snowy ? 'rgba(226, 232, 240, 0.7)' : 'rgba(56, 138, 68, 0.85)';
  ctx.beginPath();
  ctx.roundRect(755, 210, 245, 275, 22);
  ctx.fill();
  ctx.strokeStyle = snowy ? '#94a3b8' : '#854d0e';
  ctx.lineWidth = 4;
  ctx.stroke();
  // Fence posts
  ctx.fillStyle = '#713f12';
  for (let fx = 768; fx <= 990; fx += 36) {
    ctx.fillRect(fx - 2, 206, 4, 10);
    ctx.fillRect(fx - 2, 481, 4, 10);
  }
  ctx.restore();

  // Corner bushes & wildflowers around the estate
  const bushes = [
    [60, 210], [248, 198], [728, 198], [985, 202], [84, 510], [975, 515], [340, 520],
  ];
  for (let i = 0; i < bushes.length; i++) {
    const [bx, by] = bushes[i];
    ctx.fillStyle = snowy ? '#cbd5e1' : '#166534';
    ctx.beginPath();
    ctx.arc(bx, by, 14, 0, Math.PI * 2);
    ctx.arc(bx - 10, by + 4, 10, 0, Math.PI * 2);
    ctx.arc(bx + 10, by + 4, 10, 0, Math.PI * 2);
    ctx.fill();
    if (!snowy) {
      ctx.fillStyle = i % 2 === 0 ? '#fde047' : '#f472b6';
      ctx.beginPath();
      ctx.arc(bx - 4, by - 2, 2.2, 0, Math.PI * 2);
      ctx.arc(bx + 6, by + 1, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawWeatherAtmosphere(
  ctx: CanvasRenderingContext2D,
  weather: WeatherType,
  t: number,
): void {
  // 1. Volumetric god-rays on Clear/Sunny days
  if (weather === 'clear') {
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const grad = ctx.createLinearGradient(120 + i * 90, 0, 280 + i * 110, 380);
      grad.addColorStop(0, 'rgba(254, 249, 195, 0.16)');
      grad.addColorStop(1, 'rgba(254, 249, 195, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(90 + i * 95, 0);
      ctx.lineTo(155 + i * 95, 0);
      ctx.lineTo(350 + i * 115, 420);
      ctx.lineTo(240 + i * 115, 420);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // 2. Translucent glowing Post-Rain Rainbow Arc
  if (weather === 'rainbow') {
    const bands = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6'];
    ctx.save();
    ctx.globalAlpha = 0.42;
    bands.forEach((col, i) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(LOGICAL_W * 0.54, 290, 260 - i * 8, Math.PI, 0);
      ctx.stroke();
    });
    ctx.restore();
  }

  // 3. Layered drifting fog banks
  if (weather === 'overcast_fog') {
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const fx = ((t * 16 + i * 260) % (LOGICAL_W + 320)) - 160;
      const fy = 150 + i * 82;
      const fog = ctx.createRadialGradient(fx, fy, 20, fx, fy, 210);
      fog.addColorStop(0, 'rgba(241, 245, 249, 0.28)');
      fog.addColorStop(1, 'rgba(241, 245, 249, 0)');
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    }
    ctx.restore();
  }

  // 4. Multi-depth angled Rain / Monsoon + Ground Splash Rings + Branching Lightning
  if (weather === 'light_drizzle' || weather === 'heavy_rain' || weather === 'thunderstorm') {
    const count = weather === 'light_drizzle' ? 75 : 210;
    const slant = weather === 'light_drizzle' ? 4 : 13;
    const speed = weather === 'light_drizzle' ? 250 : 540;
    ctx.save();
    ctx.strokeStyle =
      weather === 'light_drizzle' ? 'rgba(186, 230, 253, 0.48)' : 'rgba(125, 211, 252, 0.56)';
    ctx.lineWidth = weather === 'light_drizzle' ? 1 : 1.5;
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const rx = (i * 89 + t * slant * 28) % LOGICAL_W;
      const ry = (i * 61 + t * speed) % LOGICAL_H;
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - slant, ry + 16);
    }
    ctx.stroke();

    // Ground splash rings
    if (weather !== 'light_drizzle') {
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 14; i++) {
        const phase = (t * 2.2 + i * 0.37) % 1;
        const sx = (i * 197) % LOGICAL_W;
        const sy = 210 + ((i * 97) % 330);
        ctx.globalAlpha = 1 - phase;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 3 + phase * 10, (3 + phase * 10) * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Thunderstorm branching lightning + brief screen flash
    if (weather === 'thunderstorm' && Math.sin(t * 2.5) > 0.955) {
      ctx.globalAlpha = 0.26;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      const bx = 640 + Math.sin(t * 10) * 80;
      ctx.beginPath();
      ctx.moveTo(bx, 0);
      ctx.lineTo(bx - 18, 70);
      ctx.lineTo(bx + 12, 125);
      ctx.lineTo(bx - 16, 200);
      ctx.moveTo(bx - 18, 70);
      ctx.lineTo(bx - 42, 118);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 5. Shimmering wavy Heatwave haze
  if (weather === 'heatwave') {
    ctx.save();
    ctx.fillStyle = 'rgba(251, 146, 60, 0.14)';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.22)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const y = 190 + i * 95;
      ctx.beginPath();
      for (let x = 0; x <= LOGICAL_W; x += 40) {
        ctx.lineTo(x, y + Math.sin(x * 0.025 + t * 4 + i) * 4);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // 6. Strong Wind / Dry Gale blowing leaves
  if (weather === 'strong_wind') {
    ctx.save();
    ctx.fillStyle = 'rgba(134, 239, 172, 0.8)';
    for (let i = 0; i < 28; i++) {
      const lx = (i * 97 + t * 260) % LOGICAL_W;
      const ly = (i * 53 + Math.sin(t * 3.5 + i) * 40) % LOGICAL_H;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 4.8, 2.2, t * 5 + i, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 7. Bouncing Hailstones
  if (weather === 'hailstorm') {
    ctx.save();
    ctx.fillStyle = 'rgba(224, 242, 254, 0.9)';
    for (let i = 0; i < 95; i++) {
      const hx = (i * 71 + t * 110) % LOGICAL_W;
      const hy = (i * 47 + t * 470) % LOGICAL_H;
      ctx.beginPath();
      ctx.arc(hx, hy, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 8. Frosty ice-crystal vignette
  if (weather === 'frost') {
    ctx.save();
    const vig = ctx.createRadialGradient(
      LOGICAL_W * 0.5,
      LOGICAL_H * 0.5,
      LOGICAL_W * 0.28,
      LOGICAL_W * 0.5,
      LOGICAL_H * 0.5,
      LOGICAL_W * 0.62,
    );
    vig.addColorStop(0, 'rgba(186, 230, 253, 0)');
    vig.addColorStop(1, 'rgba(186, 230, 253, 0.34)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    ctx.restore();
  }

  // 9. 3D-depth drifting snowflakes
  if (weather === 'snow_blizzard') {
    ctx.save();
    ctx.fillStyle = 'rgba(248, 250, 252, 0.88)';
    for (let i = 0; i < 130; i++) {
      const depth = 0.6 + (i % 3) * 0.5;
      const sx = (i * 83 + Math.sin(t + i) * 30 + t * 55 * depth) % LOGICAL_W;
      const sy = (i * 53 + t * 88 * depth) % LOGICAL_H;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.8 * depth, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 10. Ambient Wildlife: Swallows gliding overhead, fluttering butterflies, & twilight fireflies
  if (weather === 'clear' || weather === 'partly_cloudy' || weather === 'rainbow') {
    // Gliding birds
    ctx.save();
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.65)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 3; i++) {
      const bx = ((t * 42 + i * 320) % (LOGICAL_W + 120)) - 60;
      const by = 48 + i * 18 + Math.sin(t * 2 + i) * 8;
      const flap = Math.sin(t * 9 + i * 2) * 4;
      ctx.beginPath();
      ctx.moveTo(bx - 7, by + flap);
      ctx.quadraticCurveTo(bx - 3, by - 3, bx, by);
      ctx.quadraticCurveTo(bx + 3, by - 3, bx + 7, by + flap);
      ctx.stroke();
    }
    // Fluttering butterflies
    for (let i = 0; i < 5; i++) {
      const x = 220 + ((i * 155 + t * 24) % 580);
      const y = 210 + i * 64 + Math.sin(t * 3.8 + i * 2) * 14;
      const wing = 2.5 + Math.abs(Math.sin(t * 14 + i)) * 3.2;
      ctx.fillStyle = i % 2 === 0 ? '#fde047' : '#f472b6';
      ctx.beginPath();
      ctx.ellipse(x - 2, y, wing, 2.4, -0.3, 0, Math.PI * 2);
      ctx.ellipse(x + 2, y, wing, 2.4, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Warm glowing fireflies in overcast/monsoon twilight
  if (weather === 'overcast_fog' || weather === 'light_drizzle' || weather === 'rainbow') {
    ctx.save();
    for (let i = 0; i < 8; i++) {
      const fx = 120 + ((i * 123 + Math.sin(t * 0.9 + i) * 60) % 820);
      const fy = 220 + ((i * 71 + Math.cos(t * 1.1 + i) * 40) % 290);
      const alpha = 0.25 + 0.65 * Math.abs(Math.sin(t * 2.5 + i * 1.7));
      ctx.fillStyle = `rgba(253, 224, 71, ${alpha})`;
      ctx.beginPath();
      ctx.arc(fx, fy, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
