import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PlantSpecies } from "./plants-catalog";
import type { Units } from "./units";

export type PlanterShape = "rect" | "circle";

export interface Planter {
  id: string;
  shape: PlanterShape;
  // rect: width (x), depth (z); circle: radius stored in width, depth unused
  width: number;
  depth: number;
  height: number;
  position: [number, number, number]; // y is base
  rotationY: number;
}

export interface Plant {
  id: string;
  species: PlantSpecies;
  plantedInId: string | null;
  position: [number, number, number];
  rotationY: number;
}

export type CameraView = "perspective" | "top" | "front";

export type StructureVariant = "wall" | "fenceWood" | "fenceGlass";

export interface Structure {
  id: string;
  variant: StructureVariant;
  length: number; // along local X
  height: number;
  thickness: number;
  position: [number, number, number]; // base y = 0
  rotationY: number;
}

export type Pending =
  | { kind: "planter"; shape: PlanterShape }
  | { kind: "plant"; species: PlantSpecies }
  | { kind: "structure"; variant: StructureVariant };

interface GardenState {
  garden: { width: number; depth: number };
  sunTime: number; // 6..20
  units: Units;
  planters: Planter[];
  plants: Plant[];
  structures: Structure[];
  selectedId: string | null;
  cameraView: CameraView;
  transformMode: "translate" | "rotate";
  pending: Pending | null;

  setGarden: (g: { width: number; depth: number }) => void;
  setSunTime: (t: number) => void;
  setUnits: (u: Units) => void;
  startPlacement: (pending: Pending) => void;
  cancelPlacement: () => void;
  commitPlacementAt: (x: number, z: number) => void;
  updatePlanter: (id: string, patch: Partial<Planter>) => void;
  updatePlant: (id: string, patch: Partial<Plant>) => void;
  updateStructure: (id: string, patch: Partial<Structure>) => void;
  deleteSelected: () => void;
  select: (id: string | null) => void;
  setCameraView: (v: CameraView) => void;
  setTransformMode: (m: "translate" | "rotate") => void;
  clearAll: () => void;
}

export const STRUCTURE_DEFAULTS: Record<
  StructureVariant,
  { length: number; height: number; thickness: number; label: string }
> = {
  wall: { length: 2, height: 1.8, thickness: 0.15, label: "Wall" },
  fenceWood: { length: 2, height: 1.2, thickness: 0.05, label: "Wood fence" },
  fenceGlass: { length: 2, height: 1.1, thickness: 0.04, label: "Glass fence" },
};

const uid = () => Math.random().toString(36).slice(2, 9);

export const useGarden = create<GardenState>()(
  persist(
    (set, get) => ({
      garden: { width: 6, depth: 4 },
      sunTime: 13,
      units: "metric",
      planters: [],
      plants: [],
      structures: [],
      selectedId: null,
      cameraView: "perspective",
      transformMode: "translate",
      pending: null,

      setGarden: (g) => set({ garden: g }),
      setSunTime: (t) => set({ sunTime: t }),
      setUnits: (u) => set({ units: u }),

      startPlacement: (pending) => set({ pending }),
      cancelPlacement: () => set({ pending: null }),

      commitPlacementAt: (x, z) => {
        const pending = get().pending;
        if (!pending) return;
        const id = uid();
        if (pending.kind === "planter") {
          const shape = pending.shape;
          const planter: Planter = {
            id,
            shape,
            width: shape === "circle" ? 0.4 : 0.8,
            depth: shape === "circle" ? 0.4 : 0.5,
            height: 0.4,
            position: [x, 0, z],
            rotationY: 0,
          };
          set((s) => ({
            planters: [...s.planters, planter],
            selectedId: id,
            pending: null,
          }));
        } else if (pending.kind === "plant") {
          const plant: Plant = {
            id,
            species: pending.species,
            plantedInId: null,
            position: [x, 0, z],
            rotationY: 0,
          };
          set((s) => ({
            plants: [...s.plants, plant],
            selectedId: id,
            pending: null,
          }));
          // trigger snap-to-planter logic
          get().updatePlant(id, { position: [x, 0, z] });
        } else {
          const d = STRUCTURE_DEFAULTS[pending.variant];
          const structure: Structure = {
            id,
            variant: pending.variant,
            length: d.length,
            height: d.height,
            thickness: d.thickness,
            position: [x, 0, z],
            rotationY: 0,
          };
          set((s) => ({
            structures: [...s.structures, structure],
            selectedId: id,
            pending: null,
          }));
        }
      },

      updatePlanter: (id, patch) =>
        set((s) => {
          const prev = s.planters.find((p) => p.id === id);
          if (!prev) return s;
          const next = { ...prev, ...patch };
          const dx = next.position[0] - prev.position[0];
          const dz = next.position[2] - prev.position[2];
          const dRot = next.rotationY - prev.rotationY;
          const moved = dx !== 0 || dz !== 0 || dRot !== 0;
          return {
            planters: s.planters.map((p) => (p.id === id ? next : p)),
            plants: moved
              ? s.plants.map((pl) => {
                  if (pl.plantedInId !== id) return pl;
                  // rotate the local offset around the planter center, then translate
                  const lx = pl.position[0] - prev.position[0];
                  const lz = pl.position[2] - prev.position[2];
                  const cos = Math.cos(dRot);
                  const sin = Math.sin(dRot);
                  const rx = lx * cos - lz * sin;
                  const rz = lx * sin + lz * cos;
                  return {
                    ...pl,
                    position: [
                      next.position[0] + rx,
                      pl.position[1],
                      next.position[2] + rz,
                    ],
                    rotationY: pl.rotationY + dRot,
                  };
                })
              : s.plants,
          };
        }),

      updatePlant: (id, patch) =>
        set((s) => ({
          plants: s.plants.map((p) => {
            if (p.id !== id) return p;
            const next = { ...p, ...patch };
            // re-evaluate planter attachment based on XZ position
            if (patch.position) {
              const planters = get().planters;
              const inside = planters.find((pl) => {
                const dx = next.position[0] - pl.position[0];
                const dz = next.position[2] - pl.position[2];
                if (pl.shape === "circle") {
                  return Math.hypot(dx, dz) <= pl.width;
                }
                // rect, account for rotation
                const cos = Math.cos(-pl.rotationY);
                const sin = Math.sin(-pl.rotationY);
                const lx = dx * cos - dz * sin;
                const lz = dx * sin + dz * cos;
                return Math.abs(lx) <= pl.width / 2 && Math.abs(lz) <= pl.depth / 2;
              });
              if (inside) {
                next.plantedInId = inside.id;
                next.position = [next.position[0], inside.height - 0.02, next.position[2]];
              } else {
                next.plantedInId = null;
                next.position = [next.position[0], 0, next.position[2]];
              }
            }
            return next;
          }),
        })),

      deleteSelected: () => {
        const id = get().selectedId;
        if (!id) return;
        set((s) => ({
          planters: s.planters.filter((p) => p.id !== id),
          plants: s.plants.filter((p) => p.id !== id && p.plantedInId !== id),
          selectedId: null,
        }));
      },

      select: (id) => set({ selectedId: id }),
      setCameraView: (v) => set({ cameraView: v }),
      setTransformMode: (m) => set({ transformMode: m }),
      clearAll: () =>
        set({ planters: [], plants: [], selectedId: null }),
    }),
    {
      name: "garden-planner-v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : (undefined as never),
      ),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // drop plants whose species no longer exists in the catalog
        const valid = new Set<PlantSpecies>([
          "tomato",
          "basil",
          "bushBeans",
          "strawberry",
          "pepper",
          "romaine",
        ]);
        const filtered = state.plants.filter((p) => valid.has(p.species));
        if (filtered.length !== state.plants.length) {
          state.plants = filtered;
          state.selectedId = null;
        }
      },
    },
  ),
);
