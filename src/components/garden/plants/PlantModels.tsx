import { PLANT_CATALOG, type PlantSpecies } from "@/lib/garden/plants-catalog";

interface Props {
  species: PlantSpecies;
}

export function PlantModel({ species }: Props) {
  switch (species) {
    case "tomato":
      return <Tomato />;
    case "basil":
      return <Basil />;
    case "lavender":
      return <Lavender />;
    case "strawberry":
      return <Strawberry />;
    case "pepper":
      return <Pepper />;
    case "fruitTree":
      return <FruitTree />;
  }
}

function Tomato() {
  const s = PLANT_CATALOG.tomato;
  return (
    <group>
      {/* stake */}
      <mesh position={[0, s.height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, s.height, 6]} />
        <meshStandardMaterial color="#8a6a3a" />
      </mesh>
      {/* foliage column */}
      <mesh position={[0, s.height * 0.55, 0]} castShadow>
        <cylinderGeometry args={[s.footprintRadius * 0.85, s.footprintRadius * 0.5, s.height * 0.9, 8]} />
        <meshStandardMaterial color={s.foliage} />
      </mesh>
      {/* tomatoes */}
      {[0.4, 0.6, 0.8].map((h, i) => (
        <mesh key={i} position={[s.footprintRadius * 0.6 * (i % 2 ? 1 : -1), s.height * h, 0]} castShadow>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={s.accent} />
        </mesh>
      ))}
    </group>
  );
}

function Basil() {
  const s = PLANT_CATALOG.basil;
  return (
    <group>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * s.footprintRadius * 0.4, s.height * 0.55, Math.sin(a) * s.footprintRadius * 0.4]}
            castShadow
          >
            <sphereGeometry args={[s.footprintRadius * 0.55, 10, 10]} />
            <meshStandardMaterial color={s.foliage} />
          </mesh>
        );
      })}
      <mesh position={[0, s.height * 0.75, 0]} castShadow>
        <sphereGeometry args={[s.footprintRadius * 0.5, 10, 10]} />
        <meshStandardMaterial color={s.foliage} />
      </mesh>
    </group>
  );
}

function Lavender() {
  const s = PLANT_CATALOG.lavender;
  return (
    <group>
      <mesh position={[0, s.height * 0.35, 0]} castShadow>
        <sphereGeometry args={[s.footprintRadius * 0.9, 10, 10]} />
        <meshStandardMaterial color={s.foliage} />
      </mesh>
      {/* purple spikes */}
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const r = s.footprintRadius * 0.7;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * r, s.height * 0.8, Math.sin(a) * r]}
            castShadow
          >
            <coneGeometry args={[0.025, s.height * 0.4, 6]} />
            <meshStandardMaterial color={s.accent} />
          </mesh>
        );
      })}
    </group>
  );
}

function Strawberry() {
  const s = PLANT_CATALOG.strawberry;
  return (
    <group>
      <mesh position={[0, s.height * 0.4, 0]} castShadow>
        <sphereGeometry args={[s.footprintRadius, 10, 8]} />
        <meshStandardMaterial color={s.foliage} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * s.footprintRadius * 0.7, s.height * 0.5, Math.sin(a) * s.footprintRadius * 0.7]}
            castShadow
          >
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color={s.accent} />
          </mesh>
        );
      })}
    </group>
  );
}

function Pepper() {
  const s = PLANT_CATALOG.pepper;
  return (
    <group>
      <mesh position={[0, s.height * 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.02, s.height * 0.1, 6]} />
        <meshStandardMaterial color="#6a5a3a" />
      </mesh>
      <mesh position={[0, s.height * 0.55, 0]} castShadow>
        <sphereGeometry args={[s.footprintRadius, 10, 10]} />
        <meshStandardMaterial color={s.foliage} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * s.footprintRadius * 0.6, s.height * 0.45, Math.sin(a) * s.footprintRadius * 0.6]}
            castShadow
          >
            <coneGeometry args={[0.03, 0.1, 6]} />
            <meshStandardMaterial color={s.accent} />
          </mesh>
        );
      })}
    </group>
  );
}

function FruitTree() {
  const s = PLANT_CATALOG.fruitTree;
  const trunkH = s.height * 0.4;
  return (
    <group>
      <mesh position={[0, trunkH / 2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, trunkH, 8]} />
        <meshStandardMaterial color="#6a4a2a" />
      </mesh>
      <mesh position={[0, trunkH + s.footprintRadius * 0.7, 0]} castShadow>
        <sphereGeometry args={[s.footprintRadius, 14, 12]} />
        <meshStandardMaterial color={s.foliage} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const r = s.footprintRadius * 0.85;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * r, trunkH + s.footprintRadius * 0.8, Math.sin(a) * r]}
            castShadow
          >
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color={s.accent} />
          </mesh>
        );
      })}
    </group>
  );
}
