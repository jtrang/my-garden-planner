import type { Planter, PlanterShape, Structure } from "@/lib/garden/store";

/** Bounding-circle radius for collision. */
export function planterRadius(shape: PlanterShape, width: number, depth: number) {
  if (shape === "circle") return width;
  return Math.hypot(width / 2, depth / 2);
}

/** Bounding-circle radius for a structure (wall / fence). */
export function structureRadius(length: number, thickness: number) {
  return Math.hypot(length / 2, thickness / 2);
}

export interface PlanterFootprint {
  shape: PlanterShape;
  width: number;
  depth: number;
  x: number;
  z: number;
}

/** Circular footprint at (x,z) with the given radius. */
export interface CircleFootprint {
  radius: number;
  x: number;
  z: number;
}

function overlapsAny(
  candidate: CircleFootprint,
  planters: Planter[],
  structures: Structure[],
  ignoreId?: string,
): boolean {
  for (const p of planters) {
    if (ignoreId && p.id === ignoreId) continue;
    const r2 = planterRadius(p.shape, p.width, p.depth);
    const dx = candidate.x - p.position[0];
    const dz = candidate.z - p.position[2];
    if (Math.hypot(dx, dz) + 1e-4 < candidate.radius + r2) return true;
  }
  for (const s of structures) {
    if (ignoreId && s.id === ignoreId) continue;
    const r2 = structureRadius(s.length, s.thickness);
    const dx = candidate.x - s.position[0];
    const dz = candidate.z - s.position[2];
    if (Math.hypot(dx, dz) + 1e-4 < candidate.radius + r2) return true;
  }
  return false;
}

export function planterOverlaps(
  candidate: PlanterFootprint,
  planters: Planter[],
  structures: Structure[] = [],
  ignoreId?: string,
): boolean {
  const radius = planterRadius(candidate.shape, candidate.width, candidate.depth);
  return overlapsAny(
    { x: candidate.x, z: candidate.z, radius },
    planters,
    structures,
    ignoreId,
  );
}

export function structureOverlaps(
  candidate: { length: number; thickness: number; x: number; z: number },
  planters: Planter[],
  structures: Structure[],
  ignoreId?: string,
): boolean {
  const radius = structureRadius(candidate.length, candidate.thickness);
  return overlapsAny(
    { x: candidate.x, z: candidate.z, radius },
    planters,
    structures,
    ignoreId,
  );
}

/** Default footprint for a newly-placed planter (matches store.commitPlacementAt). */
export function newPlanterFootprint(shape: PlanterShape) {
  return {
    shape,
    width: shape === "circle" ? 0.4 : 0.8,
    depth: shape === "circle" ? 0.4 : 0.5,
  };
}

/**
 * Given a cursor point (x,z), find the nearest solid masonry wall and compute
 * where a roof snapping to that wall's near face should be placed.
 * Returns null when no walls exist.
 */
export function nearestWallSnap(
  x: number,
  z: number,
  structures: Structure[],
  roofDepth = 1.5,
): {
  wallId: string;
  side: 1 | -1;
  position: [number, number, number];
  rotationY: number;
  length: number;
} | null {
  const walls = structures.filter((s) => s.variant === "wall");
  if (walls.length === 0) return null;
  let best: {
    wallId: string;
    side: 1 | -1;
    position: [number, number, number];
    rotationY: number;
    length: number;
  } | null = null;
  let bestDist = Infinity;
  for (const w of walls) {
    const cos = Math.cos(w.rotationY);
    const sin = Math.sin(w.rotationY);
    const dx = x - w.position[0];
    const dz = z - w.position[2];
    // Wall-local: X = along length, Z = perpendicular
    const lz = -dx * sin + dz * cos;
    const side: 1 | -1 = lz >= 0 ? 1 : -1;
    // Roof center offset in wall-local coords
    const rlz = (w.thickness / 2 + roofDepth / 2) * side;
    const wx = w.position[0] + -rlz * sin;
    const wz = w.position[2] + rlz * cos;
    const dist = Math.hypot(x - wx, z - wz);
    if (dist < bestDist) {
      bestDist = dist;
      best = {
        wallId: w.id,
        side,
        position: [wx, w.height, wz],
        rotationY: w.rotationY,
        length: w.length,
      };
    }
  }
  return best;


/** Returns the planter whose footprint contains (x, z), if any. */
export function findContainingPlanter(x: number, z: number, planters: Planter[]) {
  return planters.find((pl) => {
    const dx = x - pl.position[0];
    const dz = z - pl.position[2];
    if (pl.shape === "circle") return Math.hypot(dx, dz) <= pl.width;
    const cos = Math.cos(-pl.rotationY);
    const sin = Math.sin(-pl.rotationY);
    const lx = dx * cos - dz * sin;
    const lz = dx * sin + dz * cos;
    return Math.abs(lx) <= pl.width / 2 && Math.abs(lz) <= pl.depth / 2;
  });
}

