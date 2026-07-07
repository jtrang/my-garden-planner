import type { Planter, PlanterShape } from "@/lib/garden/store";

/** Bounding-circle radius for collision. */
export function planterRadius(shape: PlanterShape, width: number, depth: number) {
  if (shape === "circle") return width;
  return Math.hypot(width / 2, depth / 2);
}

export interface PlanterFootprint {
  shape: PlanterShape;
  width: number;
  depth: number;
  x: number;
  z: number;
}

export function planterOverlaps(
  candidate: PlanterFootprint,
  others: Planter[],
  ignoreId?: string,
): boolean {
  const r1 = planterRadius(candidate.shape, candidate.width, candidate.depth);
  for (const p of others) {
    if (ignoreId && p.id === ignoreId) continue;
    const r2 = planterRadius(p.shape, p.width, p.depth);
    const dx = candidate.x - p.position[0];
    const dz = candidate.z - p.position[2];
    // small epsilon so touching edges is allowed
    if (Math.hypot(dx, dz) + 1e-4 < r1 + r2) return true;
  }
  return false;
}

/** Default footprint for a newly-placed planter (matches store.commitPlacementAt). */
export function newPlanterFootprint(shape: PlanterShape) {
  return {
    shape,
    width: shape === "circle" ? 0.4 : 0.8,
    depth: shape === "circle" ? 0.4 : 0.5,
  };

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
