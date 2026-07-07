import { useGarden, type Plant as PlantT } from "@/lib/garden/store";
import { PlantModel } from "./plants/PlantModels";
import { PLANT_CATALOG } from "@/lib/garden/plants-catalog";
import { useGroundDrag } from "./useGroundDrag";
import { findContainingPlanter } from "@/lib/garden/collision";
import { usePlacementHover } from "@/lib/garden/placement-hover";

interface Props {
  plant: PlantT;
}

export function Plant({ plant }: Props) {
  const select = useGarden((s) => s.select);
  const updatePlant = useGarden((s) => s.updatePlant);
  const pending = useGarden((s) => s.pending);
  const selectedId = useGarden((s) => s.selectedId);
  const isSelected = selectedId === plant.id;
  const spec = PLANT_CATALOG[plant.species];

  const drag = useGroundDrag(
    () => plant.position,
    (x, z) => {
      const planters = useGarden.getState().planters;
      if (!findContainingPlanter(x, z, planters)) return; // must stay in a planter
      updatePlant(plant.id, { position: [x, plant.position[1], z] });
    },
  );

  const commitPlacement = useGarden((s) => s.commitPlacementAt);
  const setHoverPos = usePlacementHover((s) => s.setPos);
  const placingPlant = pending?.kind === "plant";

  return (
    <group
      position={plant.position}
      rotation={[0, plant.rotationY, 0]}
      onPointerDown={(e) => {
        if (placingPlant) {
          e.stopPropagation();
          commitPlacement(e.point.x, e.point.z);
          return;
        }
        if (pending) return;
        select(plant.id);
        drag.onPointerDown(e);
      }}
      onPointerMove={(e) => {
        if (placingPlant) {
          e.stopPropagation();
          setHoverPos([e.point.x, 0, e.point.z]);
          return;
        }
        drag.onPointerMove(e);
      }}
      onPointerUp={drag.onPointerUp}
      onPointerCancel={drag.onPointerCancel}
    >
      <PlantModel species={plant.species} />
      {isSelected && (
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[spec.footprintRadius, spec.footprintRadius + 0.04, 32]} />
          <meshBasicMaterial color="#3a8fd9" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
}

