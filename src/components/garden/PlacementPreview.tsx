import { useEffect } from "react";
import { Html } from "@react-three/drei";
import { useGarden, STRUCTURE_DEFAULTS } from "@/lib/garden/store";
import { usePlacementHover } from "@/lib/garden/placement-hover";
import { PlantModel } from "./plants/PlantModels";
import { PLANT_CATALOG } from "@/lib/garden/plants-catalog";
import {
  findContainingPlanter,
  nearestWallSnap,
  newPlanterFootprint,
  planterOverlaps,
  structureOverlaps,
} from "@/lib/garden/collision";

const GHOST_OK = "#3a8fd9";
const GHOST_BAD = "#dc2626";

export function PlacementPreview() {
  const pending = useGarden((s) => s.pending);
  const commit = useGarden((s) => s.commitPlacementAt);
  const cancel = useGarden((s) => s.cancelPlacement);
  const planters = useGarden((s) => s.planters);
  const structures = useGarden((s) => s.structures);
  const pos = usePlacementHover((s) => s.pos);
  const setPos = usePlacementHover((s) => s.setPos);

  useEffect(() => {
    if (!pending) {
      setPos(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, cancel, setPos]);

  if (!pending) return null;

  // Compute validity from current hover
  let invalid = false;
  let invalidMessage = "";
  if (pos) {
    if (pending.kind === "planter") {
      if (
        planterOverlaps(
          { ...newPlanterFootprint(pending.shape), x: pos[0], z: pos[2] },
          planters,
          structures,
        )
      ) {
        invalid = true;
        invalidMessage = "Overlaps another object";
      }
    } else if (pending.kind === "structure") {
      if (pending.variant === "roof") {
        const snap = nearestWallSnap(pos[0], pos[2], structures);
        if (!snap) {
          invalid = true;
          invalidMessage = structures.some((s) => s.variant === "wall")
            ? "Move near a wall"
            : "Add a masonry wall first";
        }
      } else {
        const d = STRUCTURE_DEFAULTS[pending.variant];
        if (
          structureOverlaps(
            { length: d.length, thickness: d.thickness, x: pos[0], z: pos[2] },
            planters,
            structures,
          )
        ) {
          invalid = true;
          invalidMessage = "Overlaps another object";
        }
      }
    } else {
      if (!findContainingPlanter(pos[0], pos[2], planters)) {
        invalid = true;
        invalidMessage =
          planters.length === 0
            ? "Add a planter first"
            : "Plants must go inside a planter";
      }
    }
  }

  const color = invalid ? GHOST_BAD : GHOST_OK;

  return (
    <group>
      {/* Ground-level catcher (only intercepts what isn't a planter). */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.003, 0]}
        onPointerMove={(e) => {
          e.stopPropagation();
          setPos([e.point.x, 0, e.point.z]);
        }}
        onPointerOut={() => setPos(null)}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.stopPropagation();
          if (invalid || !pos) return;
          commit(pos[0], pos[2]);
        }}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {pos && (
        <group position={pos}>
          <Ghost invalid={invalid} pending={pending} />
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry
              args={[ghostRadius(pending) - 0.02, ghostRadius(pending), 48]}
            />
            <meshBasicMaterial color={color} transparent opacity={0.95} />
          </mesh>
          {invalid && (
            <Html center position={[0, 0.6, 0]} distanceFactor={6}>
              <div className="pointer-events-none select-none whitespace-nowrap rounded bg-red-600 px-2 py-0.5 text-[11px] font-medium text-white shadow">
                {invalidMessage}
              </div>
            </Html>
          )}
        </group>
      )}
    </group>
  );
}

function ghostRadius(pending: NonNullable<ReturnType<typeof useGarden.getState>["pending"]>) {
  if (pending.kind === "plant") return PLANT_CATALOG[pending.species].footprintRadius;
  if (pending.kind === "planter") {
    if (pending.shape === "circle") return 0.4;
    return Math.hypot(0.8, 0.5) / 2;
  }
  // structure: bounding radius = half length
  return 1.0;
}

function Ghost({
  invalid,
  pending,
}: {
  invalid: boolean;
  pending: NonNullable<ReturnType<typeof useGarden.getState>["pending"]>;
}) {
  const col = invalid ? GHOST_BAD : "#b5613a";
  if (pending.kind === "plant") {
    return (
      <group>
        <PlantModel species={pending.species} />
      </group>
    );
  }
  if (pending.kind === "structure") {
    // simple translucent slab preview
    const structCol =
      invalid
        ? GHOST_BAD
        : pending.variant === "wall"
          ? "#c9c1b0"
          : pending.variant === "fenceWood"
            ? "#8a5a34"
            : "#9fb7c5";
    return (
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[2, 1.2, 0.12]} />
        <meshStandardMaterial color={structCol} transparent opacity={0.55} />
      </mesh>
    );
  }
  const shape = pending.shape;
  const h = 0.4;
  if (shape === "circle") {
    return (
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.4, 0.34, h, 24]} />
        <meshStandardMaterial color={col} transparent opacity={0.55} />
      </mesh>
    );
  }
  return (
    <mesh position={[0, h / 2, 0]}>
      <boxGeometry args={[0.8, h, 0.5]} />
      <meshStandardMaterial color={col} transparent opacity={0.55} />
    </mesh>
  );
}
