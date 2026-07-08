import { useRef } from "react";
import { useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { useGarden } from "@/lib/garden/store";
import { planterOverlaps, structureOverlaps } from "@/lib/garden/collision";

const HANDLE_SIZE = 0.11;
const HANDLE_Y = 0.06;
const HANDLE_COLOR = "#3a8fd9";
const MIN_PLANTER_HALF = 0.15;
const MIN_STRUCT_LEN_HALF = 0.2;
const MIN_STRUCT_THICK_HALF = 0.02;
const MIN_CIRCLE_R = 0.15;

function projectToGround(e: ThreeEvent<PointerEvent>) {
  const dy = e.ray.direction.y;
  if (Math.abs(dy) < 1e-6) return null;
  const t = -e.ray.origin.y / dy;
  return {
    x: e.ray.origin.x + t * e.ray.direction.x,
    z: e.ray.origin.z + t * e.ray.direction.z,
  };
}

interface AxisHandleProps {
  origin: [number, number, number];
  rotationY: number;
  axis: [number, number]; // unit vector in local XZ
  halfExtent: number;
  minHalf: number;
  onChange: (newHalf: number) => void;
}

function AxisHandle({
  origin,
  rotationY,
  axis,
  halfExtent,
  minHalf,
  onChange,
}: AxisHandleProps) {
  const dragging = useRef<number | null>(null);
  const controls = useThree((s) => s.controls) as { enabled: boolean } | null;

  const cos = Math.cos(rotationY);
  const sin = Math.sin(rotationY);
  const lx = axis[0] * halfExtent;
  const lz = axis[1] * halfExtent;
  const wx = origin[0] + lx * cos + lz * sin;
  const wz = origin[2] - lx * sin + lz * cos;

  const compute = (px: number, pz: number) => {
    const dx = px - origin[0];
    const dz = pz - origin[2];
    // rotate world delta into local frame
    const llx = dx * cos - dz * sin;
    const llz = dx * sin + dz * cos;
    const d = llx * axis[0] + llz * axis[1];
    return Math.max(minHalf, Math.abs(d));
  };

  return (
    <mesh
      position={[wx, origin[1] + HANDLE_Y, wz]}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        dragging.current = e.pointerId;
        (e.target as Element)?.setPointerCapture?.(e.pointerId);
        if (controls) controls.enabled = false;
      }}
      onPointerMove={(e) => {
        if (dragging.current !== e.pointerId) return;
        e.stopPropagation();
        const hit = projectToGround(e);
        if (!hit) return;
        onChange(compute(hit.x, hit.z));
      }}
      onPointerUp={(e) => {
        if (dragging.current !== e.pointerId) return;
        dragging.current = null;
        (e.target as Element)?.releasePointerCapture?.(e.pointerId);
        if (controls) controls.enabled = true;
      }}
      onPointerCancel={() => {
        dragging.current = null;
        if (controls) controls.enabled = true;
      }}
    >
      <boxGeometry args={[HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE]} />
      <meshBasicMaterial color={HANDLE_COLOR} />
    </mesh>
  );
}

export function ResizeHandles() {
  const selectedId = useGarden((s) => s.selectedId);
  const pending = useGarden((s) => s.pending);
  const planters = useGarden((s) => s.planters);
  const structures = useGarden((s) => s.structures);
  const updatePlanter = useGarden((s) => s.updatePlanter);
  const updateStructure = useGarden((s) => s.updateStructure);

  if (pending || !selectedId) return null;

  const planter = planters.find((p) => p.id === selectedId);
  if (planter) {
    if (planter.shape === "circle") {
      const setR = (newR: number) => {
        const state = useGarden.getState();
        if (
          planterOverlaps(
            {
              shape: "circle",
              width: newR,
              depth: newR,
              x: planter.position[0],
              z: planter.position[2],
            },
            state.planters,
            state.structures,
            planter.id,
          )
        )
          return;
        updatePlanter(planter.id, { width: newR, depth: newR });
      };
      return (
        <>
          {([
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ] as [number, number][]).map((a, i) => (
            <AxisHandle
              key={i}
              origin={planter.position}
              rotationY={planter.rotationY}
              axis={a}
              halfExtent={planter.width}
              minHalf={MIN_CIRCLE_R}
              onChange={setR}
            />
          ))}
        </>
      );
    }
    const setWidth = (halfW: number) => {
      const newW = halfW * 2;
      const state = useGarden.getState();
      if (
        planterOverlaps(
          {
            shape: "rect",
            width: newW,
            depth: planter.depth,
            x: planter.position[0],
            z: planter.position[2],
          },
          state.planters,
          state.structures,
          planter.id,
        )
      )
        return;
      updatePlanter(planter.id, { width: newW });
    };
    const setDepth = (halfD: number) => {
      const newD = halfD * 2;
      const state = useGarden.getState();
      if (
        planterOverlaps(
          {
            shape: "rect",
            width: planter.width,
            depth: newD,
            x: planter.position[0],
            z: planter.position[2],
          },
          state.planters,
          state.structures,
          planter.id,
        )
      )
        return;
      updatePlanter(planter.id, { depth: newD });
    };
    return (
      <>
        <AxisHandle
          origin={planter.position}
          rotationY={planter.rotationY}
          axis={[1, 0]}
          halfExtent={planter.width / 2}
          minHalf={MIN_PLANTER_HALF}
          onChange={setWidth}
        />
        <AxisHandle
          origin={planter.position}
          rotationY={planter.rotationY}
          axis={[-1, 0]}
          halfExtent={planter.width / 2}
          minHalf={MIN_PLANTER_HALF}
          onChange={setWidth}
        />
        <AxisHandle
          origin={planter.position}
          rotationY={planter.rotationY}
          axis={[0, 1]}
          halfExtent={planter.depth / 2}
          minHalf={MIN_PLANTER_HALF}
          onChange={setDepth}
        />
        <AxisHandle
          origin={planter.position}
          rotationY={planter.rotationY}
          axis={[0, -1]}
          halfExtent={planter.depth / 2}
          minHalf={MIN_PLANTER_HALF}
          onChange={setDepth}
        />
      </>
    );
  }

  const structure = structures.find((s) => s.id === selectedId);
  if (structure && structure.variant === "roof") {
    const wall = structures.find((s) => s.id === structure.attachedToId);
    if (!wall) return null;
    const side = structure.attachedSide ?? 1;
    const cos = Math.cos(wall.rotationY);
    const sin = Math.sin(wall.rotationY);
    const rlz = (wall.thickness / 2 + structure.thickness / 2) * side;
    const origin: [number, number, number] = [
      wall.position[0] + -rlz * sin,
      wall.height,
      wall.position[2] + rlz * cos,
    ];
    const setLength = (halfL: number) => {
      const newL = Math.max(0.4, halfL * 2);
      updateStructure(wall.id, { length: newL });
    };
    const setDepth = (halfT: number) => {
      const newT = Math.max(0.2, halfT * 2);
      updateStructure(structure.id, { thickness: newT });
    };
    return (
      <>
        <AxisHandle
          origin={origin}
          rotationY={wall.rotationY}
          axis={[1, 0]}
          halfExtent={wall.length / 2}
          minHalf={0.2}
          onChange={setLength}
        />
        <AxisHandle
          origin={origin}
          rotationY={wall.rotationY}
          axis={[-1, 0]}
          halfExtent={wall.length / 2}
          minHalf={0.2}
          onChange={setLength}
        />
        <AxisHandle
          origin={origin}
          rotationY={wall.rotationY}
          axis={[0, 1]}
          halfExtent={structure.thickness / 2}
          minHalf={0.1}
          onChange={setDepth}
        />
        <AxisHandle
          origin={origin}
          rotationY={wall.rotationY}
          axis={[0, -1]}
          halfExtent={structure.thickness / 2}
          minHalf={0.1}
          onChange={setDepth}
        />
      </>
    );
  }
  if (structure && structure.variant !== "roof") {
    const setLength = (halfL: number) => {
      const newL = halfL * 2;
      const state = useGarden.getState();
      if (
        structureOverlaps(
          {
            length: newL,
            thickness: structure.thickness,
            x: structure.position[0],
            z: structure.position[2],
          },
          state.planters,
          state.structures,
          structure.id,
        )
      )
        return;
      updateStructure(structure.id, { length: newL });
    };
    const setThickness = (halfT: number) => {
      const newT = halfT * 2;
      const state = useGarden.getState();
      if (
        structureOverlaps(
          {
            length: structure.length,
            thickness: newT,
            x: structure.position[0],
            z: structure.position[2],
          },
          state.planters,
          state.structures,
          structure.id,
        )
      )
        return;
      updateStructure(structure.id, { thickness: newT });
    };
    return (
      <>
        <AxisHandle
          origin={structure.position}
          rotationY={structure.rotationY}
          axis={[1, 0]}
          halfExtent={structure.length / 2}
          minHalf={MIN_STRUCT_LEN_HALF}
          onChange={setLength}
        />
        <AxisHandle
          origin={structure.position}
          rotationY={structure.rotationY}
          axis={[-1, 0]}
          halfExtent={structure.length / 2}
          minHalf={MIN_STRUCT_LEN_HALF}
          onChange={setLength}
        />
        <AxisHandle
          origin={structure.position}
          rotationY={structure.rotationY}
          axis={[0, 1]}
          halfExtent={structure.thickness / 2}
          minHalf={MIN_STRUCT_THICK_HALF}
          onChange={setThickness}
        />
        <AxisHandle
          origin={structure.position}
          rotationY={structure.rotationY}
          axis={[0, -1]}
          halfExtent={structure.thickness / 2}
          minHalf={MIN_STRUCT_THICK_HALF}
          onChange={setThickness}
        />
      </>
    );
  }

  return null;
}
