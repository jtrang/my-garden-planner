import { useEffect, useState } from "react";
import { useGarden } from "@/lib/garden/store";
import { PlantModel } from "./plants/PlantModels";
import { PLANT_CATALOG } from "@/lib/garden/plants-catalog";

const GHOST = "#3a8fd9";

export function PlacementPreview() {
  const pending = useGarden((s) => s.pending);
  const commit = useGarden((s) => s.commitPlacementAt);
  const cancel = useGarden((s) => s.cancelPlacement);
  const [pos, setPos] = useState<[number, number, number]>([0, 0, 0]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!pending) return;
    setVisible(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, cancel]);

  if (!pending) return null;

  return (
    <group>
      {/* invisible catcher plane for hovering / clicking */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.003, 0]}
        onPointerMove={(e) => {
          e.stopPropagation();
          setPos([e.point.x, 0, e.point.z]);
          if (!visible) setVisible(true);
        }}
        onPointerOut={() => setVisible(false)}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.stopPropagation();
          commit(e.point.x, e.point.z);
        }}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {visible && (
        <group position={pos}>
          <Ghost />
          {/* footprint ring */}
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[ghostRadius() - 0.02, ghostRadius(), 48]} />
            <meshBasicMaterial color={GHOST} transparent opacity={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );

  function ghostRadius() {
    if (pending!.kind === "plant") {
      return PLANT_CATALOG[pending!.species].footprintRadius;
    }
    if (pending!.shape === "circle") return 0.4;
    return Math.hypot(0.8, 0.5) / 2;
  }

  function Ghost() {
    if (pending!.kind === "plant") {
      return (
        <group>
          <PlantModel species={pending!.species} />
        </group>
      );
    }
    const shape = pending!.shape;
    const h = 0.4;
    if (shape === "circle") {
      return (
        <mesh position={[0, h / 2, 0]}>
          <cylinderGeometry args={[0.4, 0.34, h, 24]} />
          <meshStandardMaterial color="#b5613a" transparent opacity={0.55} />
        </mesh>
      );
    }
    return (
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[0.8, h, 0.5]} />
        <meshStandardMaterial color="#b5613a" transparent opacity={0.55} />
      </mesh>
    );
  }
}
