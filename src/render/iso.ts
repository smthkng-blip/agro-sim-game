export const LOGICAL_W = 1040;
export const LOGICAL_H = 580;

// Isometric tile geometry (2:1 cozy diamond ratio)
export const TILE_W = 66;
export const TILE_H = 33;
export const TILE_DEPTH = 10;

// Origin of the isometric farm grid (row 0, col 0 top diamond center)
export const FARM_ORIGIN_X = 510;
export const FARM_ORIGIN_Y = 178;

export const MAX_GRID_COLS = 10;
export const MAX_GRID_ROWS = 6;

export const MIN_ZOOM = 0.8;
export const MAX_ZOOM = 1.8;

export interface CameraState {
  zoom: number;
  panX: number;
  panY: number;
}

export function createDefaultCamera(): CameraState {
  return { zoom: 1.0, panX: 0, panY: 0 };
}

export function clampZoom(zoom: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number(zoom.toFixed(3))));
}

export function clampPan(panX: number, panY: number, zoom: number): { panX: number; panY: number } {
  const maxX = 280 * zoom;
  const maxY = 180 * zoom;
  return {
    panX: Math.max(-maxX, Math.min(maxX, panX)),
    panY: Math.max(-maxY, Math.min(maxY, panY)),
  };
}

/**
 * Projects a (row, col) grid coordinate to 2.5D world-space isometric coordinates.
 * Returns the center of the top diamond face.
 */
export function gridToIso(
  row: number,
  col: number,
  originX = FARM_ORIGIN_X,
  originY = FARM_ORIGIN_Y,
): { x: number; y: number } {
  const x = originX + (col - row) * (TILE_W * 0.5);
  const y = originY + (col + row) * (TILE_H * 0.5);
  return { x, y };
}

/**
 * Converts a logical canvas coordinate (0..LOGICAL_W, 0..LOGICAL_H) into world space
 * taking camera zoom and pan into account.
 */
export function screenToWorld(
  sx: number,
  sy: number,
  camera: CameraState,
): { wx: number; wy: number } {
  const cx = LOGICAL_W * 0.5;
  const cy = LOGICAL_H * 0.5;
  const wx = (sx - cx - camera.panX) / camera.zoom + cx;
  const wy = (sy - cy - camera.panY) / camera.zoom + cy;
  return { wx, wy };
}

/**
 * Inverse isometric projection: converts a world-space point into exact (row, col)
 * tile indices (rounded to nearest tile center).
 */
export function worldToGrid(
  wx: number,
  wy: number,
  originX = FARM_ORIGIN_X,
  originY = FARM_ORIGIN_Y,
): { row: number; col: number } {
  const dx = wx - originX;
  const dy = wy - originY;
  const halfW = TILE_W * 0.5;
  const halfH = TILE_H * 0.5;
  const colF = (dx / halfW + dy / halfH) * 0.5;
  const rowF = (dy / halfH - dx / halfW) * 0.5;
  return {
    row: Math.round(rowF),
    col: Math.round(colF),
  };
}

export function isInsideIsoDiamond(
  wx: number,
  wy: number,
  row: number,
  col: number,
  originX = FARM_ORIGIN_X,
  originY = FARM_ORIGIN_Y,
): boolean {
  const center = gridToIso(row, col, originX, originY);
  const nx = Math.abs(wx - center.x) / (TILE_W * 0.5);
  const ny = Math.abs(wy - center.y) / (TILE_H * 0.5);
  return nx + ny <= 1.04;
}
