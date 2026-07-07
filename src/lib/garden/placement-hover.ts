import { create } from "zustand";

interface PlacementHoverState {
  pos: [number, number, number] | null;
  setPos: (p: [number, number, number] | null) => void;
}

/** Ephemeral (non-persisted) hover position for the pending placement. */
export const usePlacementHover = create<PlacementHoverState>((set) => ({
  pos: null,
  setPos: (pos) => set({ pos }),
}));
