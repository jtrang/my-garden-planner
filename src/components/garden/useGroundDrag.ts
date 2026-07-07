import { useRef } from "react";
import { useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";

interface DragState {
  pointerId: number;
  offsetX: number;
  offsetZ: number;
}

/**
 * Drag an object along the ground (y = 0) plane by pointer.
 * Returns handlers to spread onto a <group>/<mesh>.
 */
export function useGroundDrag(
  getPosition: () => [number, number, number],
  onDrag: (x: number, z: number) => void,
) {
  const state = useRef<DragState | null>(null);
  const controls = useThree((s) => s.controls) as
    | { enabled: boolean }
    | null;

  const projectToGround = (e: ThreeEvent<PointerEvent>) => {
    const dy = e.ray.direction.y;
    if (Math.abs(dy) < 1e-6) return null;
    const t = -e.ray.origin.y / dy;
    return {
      x: e.ray.origin.x + t * e.ray.direction.x,
      z: e.ray.origin.z + t * e.ray.direction.z,
    };
  };

  return {
    onPointerDown: (e: ThreeEvent<PointerEvent>) => {
      if (e.button !== 0) return;
      const hit = projectToGround(e);
      if (!hit) return;
      const [px, , pz] = getPosition();
      state.current = {
        pointerId: e.pointerId,
        offsetX: hit.x - px,
        offsetZ: hit.z - pz,
      };
      (e.target as Element)?.setPointerCapture?.(e.pointerId);
      if (controls) controls.enabled = false;
      e.stopPropagation();
    },
    onPointerMove: (e: ThreeEvent<PointerEvent>) => {
      const s = state.current;
      if (!s || s.pointerId !== e.pointerId) return;
      const hit = projectToGround(e);
      if (!hit) return;
      onDrag(hit.x - s.offsetX, hit.z - s.offsetZ);
      e.stopPropagation();
    },
    onPointerUp: (e: ThreeEvent<PointerEvent>) => {
      if (!state.current || state.current.pointerId !== e.pointerId) return;
      state.current = null;
      (e.target as Element)?.releasePointerCapture?.(e.pointerId);
      if (controls) controls.enabled = true;
    },
    onPointerCancel: (e: ThreeEvent<PointerEvent>) => {
      state.current = null;
      if (controls) controls.enabled = true;
    },
  };
}
