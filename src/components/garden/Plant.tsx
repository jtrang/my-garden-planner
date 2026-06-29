import { useGarden, type Plant as PlantT } from "@/lib/garden/store";
import { PlantModel } from "./plants/PlantModels";
import { PLANT_CATALOG } from "@/lib/garden/plants-catalog";

interface Props {
  plant: PlantT;
}

export function Plant({ plant }: Props) {
  const select = useGarden((s) => s.select);
  const selectedId = useGarden((s) => s.selectedId);
  const isSelected = selectedId === plant.id;
  const spec = PLANT_CATALOG[plant.species];

  return (
    <group
      position={plant.position}
      rotation={[0, plant.rotationY, 0]}
      onPointerDown={(e) => {
        e.stopPropagation();
        select(plant.id);
      }}
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
