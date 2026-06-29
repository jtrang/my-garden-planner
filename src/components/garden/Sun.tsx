import { useGarden } from "@/lib/garden/store";
import { useMemo } from "react";

export function sunPosition(time: number, gardenSize: number): [number, number, number] {
  // map 6..20 to angle 0..PI (east -> west)
  const t = (time - 6) / 14;
  const angle = Math.PI * t;
  const r = Math.max(gardenSize * 1.5, 8);
  const x = -Math.cos(angle) * r;
  const y = Math.sin(angle) * r;
  const z = -r * 0.3;
  return [x, Math.max(y, 0.5), z];
}

export function Sun() {
  const time = useGarden((s) => s.sunTime);
  const { width, depth } = useGarden((s) => s.garden);
  const pos = useMemo(() => sunPosition(time, Math.max(width, depth)), [time, width, depth]);
  const intensity = Math.max(0.2, Math.sin(((time - 6) / 14) * Math.PI)) * 2;
  const shadowSize = Math.max(width, depth) * 2;

  return (
    <>
      <directionalLight
        position={pos}
        intensity={intensity}
        color="#fff4dc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-shadowSize}
        shadow-camera-right={shadowSize}
        shadow-camera-top={shadowSize}
        shadow-camera-bottom={-shadowSize}
        shadow-camera-near={0.1}
        shadow-camera-far={shadowSize * 4}
      />
      <mesh position={pos}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#ffd76b" />
      </mesh>
      <ambientLight intensity={0.35} color="#cfdcec" />
    </>
  );
}
