import { useGarden, type Planter as PlanterT } from "@/lib/garden/store";
import { useRef } from "react";
import type { Group } from "three";
import { useGroundDrag } from "./useGroundDrag";
import { planterOverlaps } from "@/lib/garden/collision";
import { usePlacementHover } from "@/lib/garden/placement-hover";

interface Props {
  planter: PlanterT;
}

const TERRA = "#b5613a";
const SOIL = "#3d2a1a";

export function Planter({ planter }: Props) {
  const select = useGarden((s) => s.select);
  const updatePlanter = useGarden((s) => s.updatePlanter);
  const pending = useGarden((s) => s.pending);
  const selectedId = useGarden((s) => s.selectedId);
  const ref = useRef<Group>(null);
  const isSelected = selectedId === planter.id;

  const drag = useGroundDrag(
    () => planter.position,
    (x, z) => {
      const others = useGarden.getState().planters;
      if (
        planterOverlaps(
          { shape: planter.shape, width: planter.width, depth: planter.depth, x, z },
          others,
          planter.id,
        )
      ) {
        return; // refuse move that would overlap
      }
      updatePlanter(planter.id, { position: [x, 0, z] });
    },
  );


  const wallT = 0.03;
  const h = planter.height;

  return (
    <group
      ref={ref}
      position={planter.position}
      rotation={[0, planter.rotationY, 0]}
      onPointerDown={(e) => {
        if (pending) return;
        select(planter.id);
        drag.onPointerDown(e);
      }}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onPointerCancel={drag.onPointerCancel}
    >

      {planter.shape === "rect" ? (
        <>
          {/* outer */}
          <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[planter.width, h, planter.depth]} />
            <meshStandardMaterial color={TERRA} />
          </mesh>
          {/* soil */}
          <mesh position={[0, h - 0.02, 0]} receiveShadow>
            <boxGeometry args={[planter.width - wallT * 2, 0.02, planter.depth - wallT * 2]} />
            <meshStandardMaterial color={SOIL} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[planter.width, planter.width * 0.85, h, 24]} />
            <meshStandardMaterial color={TERRA} />
          </mesh>
          <mesh position={[0, h - 0.02, 0]} receiveShadow>
            <cylinderGeometry args={[planter.width - wallT, planter.width - wallT, 0.02, 24]} />
            <meshStandardMaterial color={SOIL} />
          </mesh>
        </>
      )}
      {isSelected && <SelectionRing planter={planter} />}
    </group>
  );
}

function SelectionRing({ planter }: { planter: PlanterT }) {
  const y = planter.height + 0.01;
  if (planter.shape === "circle") {
    return (
      <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planter.width + 0.02, planter.width + 0.06, 32]} />
        <meshBasicMaterial color="#3a8fd9" transparent opacity={0.8} />
      </mesh>
    );
  }
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0, 0, 4]} />
      <meshBasicMaterial color="#3a8fd9" transparent opacity={0} />
      <SelectionRect planter={planter} />
    </mesh>
  );
}

function SelectionRect({ planter }: { planter: PlanterT }) {
  // simple outline via thin box frame
  const t = 0.04;
  const w = planter.width + 0.08;
  const d = planter.depth + 0.08;
  const col = "#3a8fd9";
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh position={[0, 0, -d / 2]}>
        <boxGeometry args={[w, t, t]} />
        <meshBasicMaterial color={col} />
      </mesh>
      <mesh position={[0, 0, d / 2]}>
        <boxGeometry args={[w, t, t]} />
        <meshBasicMaterial color={col} />
      </mesh>
      <mesh position={[-w / 2, 0, 0]}>
        <boxGeometry args={[t, t, d]} />
        <meshBasicMaterial color={col} />
      </mesh>
      <mesh position={[w / 2, 0, 0]}>
        <boxGeometry args={[t, t, d]} />
        <meshBasicMaterial color={col} />
      </mesh>
    </group>
  );
}
