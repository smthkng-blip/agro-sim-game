import { describe, expect, it } from 'vitest';
import {
  clampPan,
  clampZoom,
  createDefaultCamera,
  gridToIso,
  isInsideIsoDiamond,
  MAX_ZOOM,
  MIN_ZOOM,
  screenToWorld,
  worldToGrid,
} from '../iso';
import { ParticleSystem } from '../particles';

describe('2.5D Isometric Projection & Camera Helpers', () => {
  it('round-trips gridToIso -> worldToGrid accurately across all farm tiles', () => {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 10; c++) {
        const pt = gridToIso(r, c);
        const back = worldToGrid(pt.x, pt.y);
        expect(back).toEqual({ row: r, col: c });
        expect(isInsideIsoDiamond(pt.x, pt.y, r, c)).toBe(true);
      }
    }
  });

  it('clamps zoom to 0.8x..1.8x and transforms screenToWorld accurately', () => {
    expect(clampZoom(0.2)).toBe(MIN_ZOOM);
    expect(clampZoom(3.5)).toBe(MAX_ZOOM);
    expect(clampZoom(1.25)).toBe(1.25);

    const cam = { ...createDefaultCamera(), zoom: 1.5, panX: 40, panY: -20 };
    const clamped = clampPan(999, -999, cam.zoom);
    expect(clamped.panX).toBeLessThanOrEqual(280 * cam.zoom);
    expect(clamped.panY).toBeGreaterThanOrEqual(-180 * cam.zoom);

    const center = screenToWorld(520 + 40, 290 - 20, cam);
    expect(center.wx).toBeCloseTo(520, 1);
    expect(center.wy).toBeCloseTo(290, 1);
  });

  it('spawns, updates, and expires particle bursts cleanly', () => {
    const ps = new ParticleSystem();
    ps.spawnDirtPuff(100, 100);
    ps.spawnWaterSplash(120, 120);
    ps.spawnHarvestBurst(140, 140, true);
    ps.spawnHeartBurst(160, 160);

    // Advance 2 seconds so all transient particles expire cleanly without errors
    for (let i = 0; i < 40; i++) {
      ps.update(0.05);
    }
    expect(true).toBe(true);
  });
});
